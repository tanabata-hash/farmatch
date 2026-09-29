import { createClient } from "@supabase/supabase-js";

// アクセス記録API。Cookie・IPアドレスは保存しない。
// 失敗しても閲覧者には影響させないため、常に204を返す。

const RETENTION_MONTHS = 13;
const MAX_ROWS_PER_SESSION_10MIN = 60;

const BOT_UA =
  /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|uptime|curl|wget|python|node-fetch|axios|go-http|java\/|facebookexternalhit|vercel|pingdom|bingpreview/i;

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function detectDevice(ua) {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|Android/i.test(ua)) return "mobile";
  return "desktop";
}

// 参照元はドメイン部分のみ保存する（パスやクエリは保存しない）。自サイト内の遷移は保存しない。
export function refererHost(ref, ownHost) {
  if (typeof ref !== "string" || !ref) return null;
  try {
    const host = new URL(ref).hostname.toLowerCase().slice(0, 100);
    if (!host) return null;
    const own = String(ownHost || "").toLowerCase().split(":")[0];
    if (own && host === own) return null;
    return host;
  } catch {
    return null;
  }
}

// 検証を通った場合のみ挿入用オブジェクトを返す。それ以外はnull。
export function buildRecord(req) {
  const ua = String(req.headers["user-agent"] || "");
  if (!ua || BOT_UA.test(ua)) return null;
  // ブラウザのトラッキング拒否設定(DNT / GPC)を尊重する
  if (req.headers["dnt"] === "1" || req.headers["sec-gpc"] === "1") return null;

  // 同一オリジンからのリクエストのみ受け付ける
  const origin = req.headers["origin"];
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers["host"]) return null;
    } catch {
      return null;
    }
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return null; }
  }
  if (!body || typeof body !== "object") return null;

  const { view, path, ref, sid } = body;
  if (typeof view !== "string" || !/^[a-z0-9-]{1,40}$/.test(view)) return null;
  if (typeof sid !== "string" || !/^[a-zA-Z0-9]{8,64}$/.test(sid)) return null;
  if (typeof path !== "string" || !path.startsWith("/")) return null;

  const country = String(req.headers["x-vercel-ip-country"] || "").toUpperCase();

  return {
    view,
    path: path.split("?")[0].split("#")[0].slice(0, 200),
    referrer_host: refererHost(ref, req.headers["host"]),
    device: detectDevice(ua),
    country: /^[A-Z]{2}$/.test(country) ? country : null,
    session_id: sid,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  try {
    const record = buildRecord(req);
    if (!record) return res.status(204).end();

    const supabase = getServiceClient();

    // 同一セッションからの短時間の大量送信（水増し）を抑える
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .eq("session_id", record.session_id)
      .gte("created_at", since);
    if ((count ?? 0) >= MAX_ROWS_PER_SESSION_10MIN) return res.status(204).end();

    const { error } = await supabase.from("page_views").insert([record]);
    if (error) console.error("page_views insert failed:", error.message);

    // 保存期間を超えた記録の削除（毎回ではなく確率的に実行）
    if (Math.random() < 0.01) {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);
      await supabase.from("page_views").delete().lt("created_at", cutoff.toISOString());
    }
  } catch (e) {
    console.error("track failed:", e?.message);
  }
  return res.status(204).end();
}
