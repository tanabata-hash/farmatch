import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const supabase = getServiceClient();
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count, error: countError } = await supabase
    .from("admin_login_attempts")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", windowStart);

  if (!countError && count >= MAX_ATTEMPTS) {
    return res.status(429).json({ ok: false, error: "試行回数が上限を超えました。しばらくしてから再度お試しください。" });
  }

  const { password } = req.body || {};
  if (password && password === process.env.ADMIN_PASSWORD) {
    await supabase.from("admin_login_attempts").delete().eq("ip", ip);
    return res.status(200).json({ ok: true });
  }

  await supabase.from("admin_login_attempts").insert([{ ip }]);
  // 古い記録の掃除（毎回ではなく確率的に実行）
  if (Math.random() < 0.1) {
    const cleanupBefore = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("admin_login_attempts").delete().lt("created_at", cleanupBefore);
  }

  return res.status(401).json({ ok: false });
}
