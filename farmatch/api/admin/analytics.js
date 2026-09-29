import { createClient } from "@supabase/supabase-js";
import { requireAdminPassword } from "./_authGuard.js";

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

const PAGE = 1000; // Supabase(PostgREST)の1回あたり最大取得件数
const MAX_PAGES = 50;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

const jstDate = (iso) => new Date(new Date(iso).getTime() + JST_OFFSET_MS).toISOString().slice(0, 10);

async function fetchAll(buildQuery) {
  const rows = [];
  for (let i = 0; i < MAX_PAGES; i++) {
    const { data, error } = await buildQuery().range(i * PAGE, i * PAGE + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

function tally(rows, key, limit = 10) {
  const m = new Map();
  for (const r of rows) {
    const k = r[key] || "(なし)";
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, count]) => ({ name, count }));
}

export function summarize(rows, days, now = Date.now()) {
  const sessions = new Set(rows.map(r => r.session_id));

  const perDay = new Map();
  for (const r of rows) {
    const d = jstDate(r.created_at);
    const e = perDay.get(d) || { pv: 0, sessions: new Set() };
    e.pv += 1;
    e.sessions.add(r.session_id);
    perDay.set(d, e);
  }
  const daily = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = jstDate(new Date(now - i * 86400000).toISOString());
    const e = perDay.get(d);
    daily.push({ date: d, pageViews: e ? e.pv : 0, sessions: e ? e.sessions.size : 0 });
  }

  return {
    totals: { pageViews: rows.length, sessions: sessions.size },
    daily,
    byView: tally(rows, "view"),
    byReferrer: tally(rows.filter(r => r.referrer_host), "referrer_host"),
    byDevice: tally(rows, "device"),
    byCountry: tally(rows, "country"),
  };
}

function recentSessions(rows, limit = 20) {
  const m = new Map();
  for (const r of rows) {
    const e = m.get(r.session_id) || {
      session_id: r.session_id, pageViews: 0, first: r.created_at, last: r.created_at,
      device: r.device, country: r.country, excluded: r.excluded,
    };
    e.pageViews += 1;
    if (r.created_at < e.first) e.first = r.created_at;
    if (r.created_at > e.last) e.last = r.created_at;
    m.set(r.session_id, e);
  }
  return [...m.values()].sort((a, b) => (a.last < b.last ? 1 : -1)).slice(0, limit);
}

export default async function handler(req, res) {
  if (!(await requireAdminPassword(req, res))) return;
  const supabase = getServiceClient();

  try {
    if (req.method === "GET") {
      const days = Math.min(90, Math.max(1, parseInt(req.query.days, 10) || 30));
      const since = new Date(Date.now() - days * 86400000).toISOString();

      const rows = await fetchAll(() =>
        supabase.from("page_views")
          .select("created_at,view,referrer_host,device,country,session_id,excluded")
          .gte("created_at", since)
          .order("created_at", { ascending: true })
      );
      const counted = rows.filter(r => !r.excluded);

      return res.status(200).json({
        days,
        ...summarize(counted, days),
        excludedPageViews: rows.length - counted.length,
        recentSessions: recentSessions(rows),
      });
    }

    // セッション単位で集計に含める/除外する（自分のテストアクセスの除外など）
    if (req.method === "PATCH") {
      const { session_id, excluded } = req.body || {};
      if (typeof session_id !== "string" || !/^[a-zA-Z0-9]{8,64}$/.test(session_id) || typeof excluded !== "boolean") {
        return res.status(400).json({ error: "session_id と excluded(boolean) が必要です" });
      }
      const { error } = await supabase.from("page_views").update({ excluded }).eq("session_id", session_id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    // 指定日（JST）より前の記録を削除する
    if (req.method === "DELETE") {
      const before = String(req.query.before || "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(before)) {
        return res.status(400).json({ error: "before=YYYY-MM-DD が必要です" });
      }
      const cutoff = new Date(`${before}T00:00:00+09:00`);
      if (Number.isNaN(cutoff.getTime())) return res.status(400).json({ error: "日付が不正です" });
      const { error } = await supabase.from("page_views").delete().lt("created_at", cutoff.toISOString());
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
