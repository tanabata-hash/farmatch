import { createClient } from "@supabase/supabase-js";

const MAX_ATTEMPTS = 10;
const WINDOW_MINUTES = 15;

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

// パスワード文字列比較のみのエンドポイントをブルートフォースから守るための共通ガード。
// 一致すればtrueを返す。不一致・レート制限超過の場合はres側で応答済みなのでfalseを返す。
export async function requireAdminPassword(req, res) {
  const ip = getClientIp(req);
  const supabase = getServiceClient();
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count, error: countError } = await supabase
    .from("admin_login_attempts")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", windowStart);

  if (!countError && count >= MAX_ATTEMPTS) {
    res.status(429).json({ error: "試行回数が上限を超えました。しばらくしてから再度お試しください。" });
    return false;
  }

  const adminPw = req.headers["x-admin-password"];
  if (adminPw && adminPw === process.env.ADMIN_PASSWORD) {
    return true;
  }

  const { error: insertError } = await supabase.from("admin_login_attempts").insert([{ ip }]);
  if (insertError) console.error("admin_login_attempts insert failed:", insertError.message);
  if (Math.random() < 0.1) {
    const cleanupBefore = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("admin_login_attempts").delete().lt("created_at", cleanupBefore);
  }

  res.status(401).json({ error: "Unauthorized" });
  return false;
}
