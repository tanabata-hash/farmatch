import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { isTrackingExcluded, setTrackingExcluded } from "../track";

const C = {
  green: "#2D5016", lightGreen: "#7AB648", paleGreen: "#EDF5E1",
  soil: "#C4883A", white: "#FFFFFF", text: "#1A1A1A",
  muted: "#6B6B6B", border: "#E0D8CC", cream: "#F5F0E8", red: "#C0392B", sky: "#4A90D9",
};

const VIEW_LABELS = {
  farms: "農地一覧", housing: "住居一覧", map: "地図", migration: "移住マップ",
  calendar: "作物カレンダー", pricing: "料金", privacy: "プライバシーポリシー",
  terms: "利用規約", specified: "特定商取引法表記", "farming-life": "農のある暮らし",
  "owner-guide": "オーナーガイド", "column-inherited-farmland": "コラム（相続農地）",
};
const DEVICE_LABELS = { mobile: "スマートフォン", tablet: "タブレット", desktop: "PC" };

const fmtDate = (v) => v ? new Date(v).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" }) : "—";
const fmtDateTime = (v) => v ? new Date(v).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const card = { background: C.white, border: `2px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" };
const th = { padding: "8px 10px", textAlign: "left", color: C.green, fontWeight: 700, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", fontSize: 12 };
const td = { padding: "8px 10px", fontSize: 12, color: C.text, borderBottom: `1px solid ${C.border}` };
const smallBtn = { background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 10px", fontSize: 11, cursor: "pointer", color: C.green, fontWeight: 600 };

function Kpi({ label, value, sub, color = C.green }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Breakdown({ title, rows, labelMap = {} }) {
  const max = Math.max(1, ...rows.map(r => r.count));
  return (
    <div style={card}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 8 }}>{title}</div>
      {rows.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>データなし</div>}
      {rows.map(r => (
        <div key={r.name} style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span>{labelMap[r.name] || r.name}</span><span style={{ fontWeight: 700 }}>{r.count}</span>
          </div>
          <div style={{ height: 5, background: C.paleGreen, borderRadius: 3 }}>
            <div style={{ height: 5, width: `${(r.count / max) * 100}%`, background: C.lightGreen, borderRadius: 3 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DailyChart({ daily }) {
  const max = Math.max(1, ...daily.map(d => d.pageViews));
  const step = Math.ceil(daily.length / 8);
  return (
    <div style={card}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 10 }}>
        日別アクセス <span style={{ fontWeight: 400, color: C.muted, fontSize: 11 }}>（棒=ページビュー、数字=訪問セッション）</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 110 }}>
        {daily.map(d => (
          <div key={d.date} title={`${d.date}  PV ${d.pageViews} / セッション ${d.sessions}`}
            style={{ flex: 1, background: d.pageViews ? C.lightGreen : C.border, borderRadius: "2px 2px 0 0",
              height: `${Math.max(3, (d.pageViews / max) * 100)}%` }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
        {daily.map((d, i) => (
          <div key={d.date} style={{ flex: 1, fontSize: 9, color: C.muted, textAlign: "center", overflow: "visible", whiteSpace: "nowrap" }}>
            {i % step === 0 ? d.date.slice(5) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboard({ adminFetch: adminFetchProp, farms, houses, onEdit }) {
  // 親の再描画で関数が作り直されても再取得が走らないよう、参照を固定する
  const fetchRef = useRef(adminFetchProp);
  fetchRef.current = adminFetchProp;
  const adminFetch = useCallback((...args) => fetchRef.current(...args), []);
  const [days, setDays] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [excludedHere, setExcludedHere] = useState(isTrackingExcluded());
  const [deleteBefore, setDeleteBefore] = useState("");
  const [notice, setNotice] = useState("");

  const loadAnalytics = useCallback(async () => {
    setAnalyticsError("");
    try {
      setAnalytics(await adminFetch(`/api/admin/analytics?days=${days}`));
    } catch (e) {
      setAnalytics(null);
      setAnalyticsError(e.message);
    }
  }, [adminFetch, days]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);
  useEffect(() => {
    adminFetch("/api/admin/users").then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => setUsers([]));
    // 問い合わせは「件数と日時」だけを使い、本文は画面に出さない（通信の秘密への配慮）
    adminFetch("/api/admin/inquiries").then(d => setInquiries(Array.isArray(d) ? d.map(i => ({ id: i.id, created_at: i.created_at, status: i.status })) : []))
      .catch(() => setInquiries([]));
  }, [adminFetch]);

  const userById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
  const listingsByOwner = useMemo(() => {
    const m = new Map();
    for (const it of [...farms, ...houses]) if (it.owner_id) m.set(it.owner_id, (m.get(it.owner_id) || 0) + 1);
    return m;
  }, [farms, houses]);

  const ownerFarms = farms.filter(f => f.owner_id);
  const ownerHouses = houses.filter(h => h.owner_id);
  const ownerListings = [
    ...ownerFarms.map(f => ({ ...f, _type: "farm" })),
    ...ownerHouses.map(h => ({ ...h, _type: "house" })),
  ].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  const sinceMs = Date.now() - days * 86400000;
  const newUsers = users.filter(u => new Date(u.created_at).getTime() >= sinceMs).length;
  const newInquiries = inquiries.filter(i => new Date(i.created_at).getTime() >= sinceMs).length;

  const toggleThisDevice = () => {
    const next = !excludedHere;
    setTrackingExcluded(next);
    setExcludedHere(next);
    setNotice(next ? "この端末のアクセスは今後記録されません。" : "この端末のアクセスも記録されます。");
  };

  const toggleSession = async (s) => {
    try {
      await adminFetch("/api/admin/analytics", { method: "PATCH", body: JSON.stringify({ session_id: s.session_id, excluded: !s.excluded }) });
      loadAnalytics();
    } catch (e) { setNotice("❌ " + e.message); }
  };

  const deleteOld = async () => {
    if (!deleteBefore) return;
    if (!window.confirm(`${deleteBefore} より前のアクセス記録を完全に削除します。よろしいですか？`)) return;
    try {
      await adminFetch(`/api/admin/analytics?before=${encodeURIComponent(deleteBefore)}`, { method: "DELETE" });
      setNotice("🗑 削除しました");
      loadAnalytics();
    } catch (e) { setNotice("❌ " + e.message); }
  };

  const t = analytics?.totals;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <h3 style={{ margin: 0, color: C.green, fontSize: 16 }}>📊 ダッシュボード</h3>
        <div style={{ display: "flex", gap: 6 }}>
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              style={{ ...smallBtn, background: days === d ? C.green : "none", color: days === d ? "#fff" : C.green }}>
              直近{d}日
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>
        <Kpi label={`訪問セッション（${days}日）`} value={t ? t.sessions : "—"} color={C.sky} />
        <Kpi label={`ページビュー（${days}日）`} value={t ? t.pageViews : "—"} color={C.sky} />
        <Kpi label="登録ユーザー" value={`${users.length}人`} sub={`直近${days}日の新規 ${newUsers}人`} />
        <Kpi label="農地" value={`${farms.length}件`} sub={`オーナー登録 ${ownerFarms.length}件 / 運営登録 ${farms.length - ownerFarms.length}件`} color={C.lightGreen} />
        <Kpi label="住居" value={`${houses.length}件`} sub={`オーナー登録 ${ownerHouses.length}件 / 運営登録 ${houses.length - ownerHouses.length}件`} color={C.soil} />
        <Kpi label="問い合わせ" value={`${inquiries.length}件`} sub={`直近${days}日 ${newInquiries}件（本文は非表示）`} color={C.red} />
      </div>

      {analyticsError && (
        <div style={{ background: "#FDECEA", border: "1px solid #F5C6CB", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.red, marginBottom: 14 }}>
          アクセスデータを取得できませんでした：{analyticsError}
          <br />（新しい計測テーブル <code>page_views</code> のマイグレーションが未適用の可能性があります）
        </div>
      )}

      {analytics && (
        <>
          <DailyChart daily={analytics.daily} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, margin: "14px 0" }}>
            <Breakdown title="よく見られた画面" rows={analytics.byView} labelMap={VIEW_LABELS} />
            <Breakdown title="流入元（サイト）" rows={analytics.byReferrer} />
            <Breakdown title="端末" rows={analytics.byDevice} labelMap={DEVICE_LABELS} />
            <Breakdown title="国・地域" rows={analytics.byCountry} />
          </div>
        </>
      )}

      <h4 style={{ color: C.green, fontSize: 14, margin: "20px 0 8px" }}>👥 登録ユーザー（{users.length}人）</h4>
      <div style={{ overflow: "auto", border: `1px solid ${C.border}`, borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead style={{ background: C.paleGreen }}>
            <tr>{["登録日", "お名前", "メール", "ロール", "都道府県", "投稿数"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={td}>{fmtDate(u.created_at)}</td>
                <td style={td}>{u.name || "—"}</td>
                <td style={td}>{u.email || "—"}</td>
                <td style={td}>{u.role || "—"}</td>
                <td style={td}>{u.prefecture || "—"}</td>
                <td style={td}>{listingsByOwner.get(u.id) || 0}件</td>
              </tr>
            ))}
            {users.length === 0 && <tr><td style={td} colSpan={6}>登録ユーザーはいません</td></tr>}
          </tbody>
        </table>
      </div>

      <h4 style={{ color: C.green, fontSize: 14, margin: "20px 0 8px" }}>
        🌱🏡 オーナー登録の農地・住居（{ownerListings.length}件）
      </h4>
      {ownerListings.length === 0 ? (
        <div style={{ fontSize: 12, color: C.muted, background: C.cream, borderRadius: 8, padding: "12px 14px" }}>
          まだありません。現在の掲載はすべて運営登録です（農地 {farms.length}件・住居 {houses.length}件）。
          オーナーが登録するとここに表示されます。
        </div>
      ) : (
        <div style={{ overflow: "auto", border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead style={{ background: C.paleGreen }}>
              <tr>{["登録日", "種別", "名称", "都道府県", "ステータス", "登録者", "操作"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {ownerListings.map(it => {
                const owner = userById.get(it.owner_id);
                return (
                  <tr key={`${it._type}-${it.id}`}>
                    <td style={td}>{fmtDate(it.created_at)}</td>
                    <td style={td}>{it._type === "farm" ? "農地" : "住居"}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{it.name}</td>
                    <td style={td}>{it.region || "—"}</td>
                    <td style={td}>{it.status}</td>
                    <td style={td}>{owner ? `${owner.name || "（名前なし）"}（${owner.email || "—"}）` : "（不明）"}</td>
                    <td style={td}><button style={smallBtn} onClick={() => onEdit(it, it._type)}>編集</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h4 style={{ color: C.green, fontSize: 14, margin: "20px 0 8px" }}>🛠 アクセス記録の管理</h4>
      <div style={{ ...card, fontSize: 12 }}>
        <div style={{ marginBottom: 10 }}>
          この端末のアクセス記録：<b>{excludedHere ? "除外中（管理者ログイン時に自動で除外されます）" : "記録される"}</b>{" "}
          <button style={smallBtn} onClick={toggleThisDevice}>{excludedHere ? "記録を再開する" : "この端末を除外する"}</button>
        </div>
        <div style={{ marginBottom: 10 }}>
          指定日より前の記録を削除：{" "}
          <input type="date" value={deleteBefore} onChange={e => setDeleteBefore(e.target.value)}
            style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 6px", fontSize: 12 }} />{" "}
          <button style={{ ...smallBtn, color: C.red }} onClick={deleteOld} disabled={!deleteBefore}>削除</button>
          <span style={{ color: C.muted, marginLeft: 8 }}>（記録は13か月を超えると自動削除されます）</span>
        </div>
        {analytics && (
          <>
            <div style={{ fontWeight: 700, color: C.green, margin: "12px 0 6px" }}>
              最近の訪問セッション（テストアクセスなどは「除外」で集計から外せます／除外中 {analytics.excludedPageViews}PV）
            </div>
            <div style={{ overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                <thead><tr>{["最終アクセス", "ID", "端末", "国", "PV", "集計"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {analytics.recentSessions.map(s => (
                    <tr key={s.session_id} style={{ opacity: s.excluded ? 0.5 : 1 }}>
                      <td style={td}>{fmtDateTime(s.last)}</td>
                      <td style={td}><code>{s.session_id.slice(0, 6)}</code></td>
                      <td style={td}>{DEVICE_LABELS[s.device] || "—"}</td>
                      <td style={td}>{s.country || "—"}</td>
                      <td style={td}>{s.pageViews}</td>
                      <td style={td}>
                        <button style={smallBtn} onClick={() => toggleSession(s)}>{s.excluded ? "集計に戻す" : "除外"}</button>
                      </td>
                    </tr>
                  ))}
                  {analytics.recentSessions.length === 0 && <tr><td style={td} colSpan={6}>記録はまだありません</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
        {notice && <div style={{ marginTop: 10, color: C.green, fontWeight: 600 }}>{notice}</div>}
      </div>
      <p style={{ fontSize: 11, color: C.muted, marginTop: 12 }}>
        ※ アクセスは自社DBのみに記録しています（Cookie・IPアドレスは保存しません）。同じ人でもタブを閉じて開き直すと別セッションとして数えるため、「訪問セッション」は概算です。
      </p>
    </div>
  );
}
