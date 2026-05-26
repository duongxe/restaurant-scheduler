import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_PORT = 8787;
const MAX_BODY_SIZE = 1024 * 1024;
const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";

loadEnvFile(".env");
loadEnvFile(".env.local");

const port = Number(process.env.EMAIL_API_PORT ?? DEFAULT_PORT);
const apiKey = process.env.RESEND_API_KEY;
const fromEmail =
  process.env.RESEND_FROM_EMAIL ?? "Sushi Revolution <onboarding@resend.dev>";
const allowedOrigins = (process.env.EMAIL_ALLOWED_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const server = createServer(async (request, response) => {
  setCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    writeJson(response, 200, {
      ok: true,
      provider: "resend",
      configured: Boolean(apiKey),
    });
    return;
  }

  if (request.method !== "POST" || request.url !== "/api/send-schedule") {
    writeJson(response, 404, { message: "Not found" });
    return;
  }

  if (!apiKey) {
    writeJson(response, 500, {
      message:
        "RESEND_API_KEY is missing. Add it to .env.local and restart npm run email:dev.",
    });
    return;
  }

  try {
    const payload = JSON.parse(await readRequestBody(request));
    const messages = Array.isArray(payload.messages) ? payload.messages : [];

    if (messages.length === 0) {
      writeJson(response, 400, { message: "No schedule messages provided." });
      return;
    }

    const results = [];

    for (const [index, message] of messages.entries()) {
      const normalizedMessage = normalizeScheduleMessage(message);

      if (!normalizedMessage) {
        results.push({
          employeeId: message?.employeeId ?? "",
          employeeName: message?.employeeName ?? "Unknown",
          email: message?.to ?? "",
          sentAt: new Date().toISOString(),
          shiftLines: Array.isArray(message?.shiftLines) ? message.shiftLines : [],
          status: "failed",
          error: "Invalid email message payload.",
        });
        continue;
      }

      const result = await sendScheduleEmail(normalizedMessage);
      results.push(result);

      if (index < messages.length - 1) {
        await delay(650);
      }
    }

    const failedCount = results.filter((result) => result.status === "failed").length;

    writeJson(response, failedCount > 0 ? 207 : 200, {
      results,
      sentCount: results.length - failedCount,
      failedCount,
    });
  } catch (error) {
    writeJson(response, 500, {
      message: error instanceof Error ? error.message : "Email server error.",
    });
  }
});

server.listen(port, () => {
  console.log(`Email API server listening on http://localhost:${port}`);
  if (!apiKey) {
    console.log("RESEND_API_KEY is not set. Emails will not send until configured.");
  }
});

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function setCorsHeaders(request, response) {
  const origin = request.headers.origin;
  const allowedOrigin =
    origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? "*";

  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function writeJson(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

function readRequestBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > MAX_BODY_SIZE) {
        request.destroy();
        rejectBody(new Error("Request body is too large."));
      }
    });

    request.on("end", () => resolveBody(body));
    request.on("error", rejectBody);
  });
}

function normalizeScheduleMessage(message) {
  if (!message || typeof message !== "object") {
    return null;
  }

  const email = String(message.to ?? "").trim();
  const shiftLines = Array.isArray(message.shiftLines)
    ? message.shiftLines.map(String).filter(Boolean)
    : [];

  if (!isValidEmail(email) || shiftLines.length === 0) {
    return null;
  }

  return {
    employeeId: String(message.employeeId ?? ""),
    employeeName: String(message.employeeName ?? "Staff"),
    to: email,
    weekRange: String(message.weekRange ?? "this week"),
    shiftLines,
  };
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function sendScheduleEmail(message) {
  const subject = `Sushi Revolution roster: ${message.weekRange}`;
  const html = renderScheduleHtml(message);
  const text = renderScheduleText(message);
  const sentAt = new Date().toISOString();

  try {
    const resendResponse = await fetch(RESEND_EMAILS_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [message.to],
        subject,
        html,
        text,
      }),
    });
    const responseBody = await safeReadJson(resendResponse);

    if (!resendResponse.ok) {
      return {
        employeeId: message.employeeId,
        employeeName: message.employeeName,
        email: message.to,
        sentAt,
        shiftLines: message.shiftLines,
        status: "failed",
        error:
          responseBody?.message ??
          responseBody?.error ??
          `Resend API returned ${resendResponse.status}.`,
      };
    }

    return {
      employeeId: message.employeeId,
      employeeName: message.employeeName,
      email: message.to,
      sentAt,
      shiftLines: message.shiftLines,
      status: "sent",
      providerId: responseBody?.id,
    };
  } catch (error) {
    return {
      employeeId: message.employeeId,
      employeeName: message.employeeName,
      email: message.to,
      sentAt,
      shiftLines: message.shiftLines,
      status: "failed",
      error: error instanceof Error ? error.message : "Failed to send email.",
    };
  }
}

function renderScheduleText(message) {
  return [
    `Hi ${message.employeeName},`,
    "",
    `Here are your Sushi Revolution shifts for ${message.weekRange}:`,
    "",
    ...message.shiftLines.map((line) => `- ${line}`),
    "",
    "Please reply to your manager if anything looks wrong.",
    "",
    "Sushi Revolution",
  ].join("\n");
}

function renderScheduleHtml(message) {
  const items = message.shiftLines
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <p>Hi ${escapeHtml(message.employeeName)},</p>
      <p>Here are your Sushi Revolution shifts for <strong>${escapeHtml(
        message.weekRange,
      )}</strong>:</p>
      <ul>${items}</ul>
      <p>Please reply to your manager if anything looks wrong.</p>
      <p>Sushi Revolution</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function safeReadJson(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => {
    setTimeout(resolveDelay, milliseconds);
  });
}
