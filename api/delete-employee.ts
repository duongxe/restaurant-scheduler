import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anonKey = process.env.SUPABASE_ANON_KEY!;

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const caller = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user } } = await caller.auth.getUser();
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  const { data: profile } = await caller
    .from("employees")
    .select("is_owner")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_owner) return res.status(403).json({ error: "Forbidden" });

  const { employeeId } = req.body as { employeeId: string };
  if (!employeeId) return res.status(400).json({ error: "Missing employeeId" });

  // Deleting from auth.users cascades to employees table
  const { error } = await admin.auth.admin.deleteUser(employeeId);
  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json({ success: true });
}
