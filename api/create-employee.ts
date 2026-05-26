import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anonKey = process.env.SUPABASE_ANON_KEY!;

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verify caller is the owner
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

  const { name, username, roles, level, password } = req.body as {
    name: string;
    username: string;
    roles: string[];
    level: number;
    password: string;
  };

  if (!name || !username || !roles?.length || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const email = `${username}@sushirevolution.internal`;

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return res.status(400).json({ error: authError?.message ?? "Failed to create auth user" });
  }

  const { error: profileError } = await admin.from("employees").insert({
    id: authData.user.id,
    name,
    username,
    role: roles[0],
    roles,
    level,
    is_owner: false,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id).catch(() => null);
    return res.status(400).json({ error: profileError.message });
  }

  return res.status(200).json({
    id: authData.user.id,
    name,
    username,
    role: roles[0],
    roles,
    level,
    email: "",
    phone: "",
    password: "",
  });
}
