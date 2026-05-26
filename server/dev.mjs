import { spawn } from "node:child_process";

const processes = [
  runScript("vite:dev"),
  runScript("email:dev"),
];

let shuttingDown = false;

for (const childProcess of processes) {
  childProcess.on("exit", (code) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    stopAll();
    process.exit(code ?? 0);
  });
}

process.on("SIGINT", () => {
  shuttingDown = true;
  stopAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shuttingDown = true;
  stopAll();
  process.exit(0);
});

function stopAll() {
  for (const childProcess of processes) {
    if (!childProcess.killed) {
      childProcess.kill();
    }
  }
}

function runScript(scriptName) {
  const command = process.platform === "win32" ? "npm.cmd" : "npm";

  return spawn(command, ["run", scriptName], {
    cwd: process.cwd(),
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
    windowsHide: false,
  });
}
