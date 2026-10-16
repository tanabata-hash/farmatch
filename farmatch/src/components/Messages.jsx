import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";
import { C } from "../theme";

// ── サイト内メッセージ（オーナーと就農・移住希望者の双方向のやり取り） ──────────
// 読み書きはすべて /api/my/inquiries?resource=conversations 経由（本人確認はSupabaseセッション）。
// 当事者以外は読めない。運営者がメッセージ本文を閲覧する画面は設けていない。

const ENDPOINT = "/api/my/inquiries?resource=conversations";
const POLL_MS = 15000;
const MAX_LENGTH = 2000;

async function api(query = "", options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(ENDPOINT + query, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session?.access_token || ""}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "通信に失敗しました。しばらくしてからお試しください。");
  return data;
}

const listConversations = () => api();
const loadThread = (id) => api(`&id=${encodeURIComponent(id)}`);
const sendReply = (id, body) => api(`&id=${encodeURIComponent(id)}`, { method: "POST", body: JSON.stringify({ body }) });

// 掲載ページの「問い合わせる」から、最初のメッセージを送る（スレッドが無ければ作成される）
export const sendFirstMessage = ({ targetType, targetId, body }) =>
  api("", { method: "POST", body: JSON.stringify({ targetType, targetId, body }) });

// 未読のスレッド数（ヘッダーのバッジ用）
export async function countUnreadConversations() {
  try {
    const list = await listConversations();
    return Array.isArray(list) ? list.filter(c => c.unread).length : 0;
  } catch {
    return 0;
  }
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function counterpartLabel(conv) {
  return conv.role === "owner" ? `${conv.seeker_name || "問い合わせた方"}さん` : "オーナー";
}

// ── スレッド（やり取りの画面） ──────────────────────────
function ThreadView({ id, onBack }) {
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const lastCount = useRef(0);

  const load = useCallback(async (silent) => {
    try {
      setData(await loadThread(id));
      if (!silent) setError("");
    } catch (e) {
      if (!silent) setError(e.message);
    }
  }, [id]);

  useEffect(() => {
    load(false);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load(true);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  // 新しいメッセージが来たら一番下へスクロール
  const count = data?.messages?.length || 0;
  useEffect(() => {
    if (count !== lastCount.current) {
      lastCount.current = count;
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [count]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true); setError("");
    try {
      await sendReply(id, body);
      setDraft("");
      await load(true);
    } catch (e) {
      setError(e.message);
    }
    setSending(false);
  };

  const conv = data?.conversation;
  const reportHref = `mailto:contact@farmatch.net?subject=${encodeURIComponent("【Farmatch】メッセージの通報")}&body=${encodeURIComponent(`スレッドID：${id}\n\n通報の内容をご記入ください：\n`)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <button onClick={onBack}
          style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "5px 12px",
            fontSize: 12, color: C.green, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
          ← 一覧
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {conv ? `${conv.target_type === "farm" ? "🌱" : "🏡"} ${conv.target_name}` : "読み込み中..."}
          </div>
          {conv && <div style={{ fontSize: 11, color: C.muted }}>相手：{counterpartLabel(conv)}</div>}
        </div>
      </div>

      <p style={{ fontSize: 11, color: C.muted, margin: "0 0 8px", lineHeight: 1.6 }}>
        電話番号・住所・口座などの個人情報は、相手をよく確かめてから送ってください。金銭の要求や不審な勧誘があった場合は、
        <a href={reportHref} style={{ color: C.green }}>こちらから運営に通報</a>
        できます（通報いただくと、運営が該当のやり取りを確認することがあります）。
      </p>

      <div style={{ flex: 1, minHeight: 180, maxHeight: "42vh", overflowY: "auto", background: "#FAF8F3",
        border: `1px solid ${C.border}`, borderRadius: 10, padding: 10 }}>
        {!data && !error && <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: 20 }}>読み込み中...</div>}
        {(data?.messages || []).map(m => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.mine ? "flex-end" : "flex-start", marginBottom: 8 }}>
            <div style={{ maxWidth: "82%" }}>
              <div style={{ background: m.mine ? C.green : C.white, color: m.mine ? "#fff" : C.text,
                border: m.mine ? "none" : `1px solid ${C.border}`, borderRadius: 14, padding: "8px 12px",
                fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {m.body}
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textAlign: m.mine ? "right" : "left" }}>
                {m.mine ? "あなた" : (conv ? counterpartLabel(conv) : "")}・{formatTime(m.created_at)}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p style={{ fontSize: 12, color: "#C0392B", background: "#FDEDEC", border: "1px solid #F5B7B1",
          borderRadius: 8, padding: "8px 12px", margin: "8px 0 0" }}>❌ {error}</p>
      )}

      <div style={{ marginTop: 10 }}>
        <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3} maxLength={MAX_LENGTH}
          placeholder="メッセージを入力してください"
          style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 12px",
            fontSize: 14, boxSizing: "border-box", resize: "vertical", outline: "none", fontFamily: "inherit" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <span style={{ fontSize: 11, color: C.muted }}>{draft.length} / {MAX_LENGTH}</span>
          <button onClick={send} disabled={sending || !draft.trim()}
            style={{ background: C.green, color: "#fff", border: "none", borderRadius: 24, padding: "10px 28px",
              fontSize: 14, fontWeight: 700, cursor: sending || !draft.trim() ? "default" : "pointer",
              opacity: sending || !draft.trim() ? 0.5 : 1 }}>
            {sending ? "送信中..." : "送信する"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── スレッド一覧 ──────────────────────────────────
function ConversationList({ convs, error, onOpen }) {
  if (convs === null) {
    return <div style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: 30 }}>読み込み中...</div>;
  }
  return (
    <div style={{ overflowY: "auto", maxHeight: "60vh" }}>
      {error && (
        <p style={{ fontSize: 12, color: "#C0392B", background: "#FDEDEC", border: "1px solid #F5B7B1",
          borderRadius: 8, padding: "8px 12px", margin: "0 0 10px" }}>❌ {error}</p>
      )}
      {convs.length === 0 && !error && (
        <div style={{ textAlign: "center", padding: "30px 10px", color: C.muted, fontSize: 13, lineHeight: 1.8 }}>
          <div style={{ fontSize: 40 }}>💬</div>
          まだメッセージはありません。<br />
          農地・空き家のページの「問い合わせる」から、オーナーにメッセージを送れます。<br />
          オーナーとして登録している方には、問い合わせが届くとここに表示されます。
        </div>
      )}
      {convs.map(c => (
        <button key={c.id} onClick={() => onOpen(c.id)}
          style={{ display: "block", width: "100%", textAlign: "left", background: c.unread ? "#FFF9E6" : C.white,
            border: `1.5px solid ${c.unread ? C.soilBorder : C.border}`, borderRadius: 12, padding: "12px 14px",
            marginBottom: 8, cursor: "pointer", fontFamily: "inherit" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              {c.unread && <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#E53935", flexShrink: 0 }} />}
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.target_type === "farm" ? "🌱" : "🏡"} {c.target_name}
              </span>
            </div>
            <span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>{formatTime(c.last_message_at)}</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, margin: "3px 0" }}>
            {c.role === "owner" ? "あなたの掲載への問い合わせ" : "あなたが問い合わせた掲載"}　相手：{counterpartLabel(c)}
          </div>
          <div style={{ fontSize: 12, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {c.last_sender_role === c.role ? "あなた：" : ""}{c.last_message_preview}
          </div>
        </button>
      ))}
    </div>
  );
}

// ── メッセージ画面（一覧＋スレッド） ──────────────────────
export function MessagesPanel({ initialId = null, onClose }) {
  const [convs, setConvs] = useState(null);
  const [openId, setOpenId] = useState(initialId);
  const [error, setError] = useState("");

  const refreshList = useCallback(async () => {
    try {
      setConvs(await listConversations());
      setError("");
    } catch (e) {
      setError(e.message);
      setConvs(prev => prev || []);
    }
  }, []);

  useEffect(() => { refreshList(); }, [refreshList]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{ background: C.white, borderRadius: 16, padding: 22, width: "100%", maxWidth: 560,
        maxHeight: "92vh", display: "flex", flexDirection: "column", position: "relative", boxSizing: "border-box" }}>
        <button onClick={onClose} aria-label="閉じる"
          style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none",
            fontSize: 20, cursor: "pointer", color: C.muted }}>✕</button>
        <h3 style={{ margin: "0 0 12px", color: C.green }}>💬 メッセージ</h3>
        {openId
          ? <ThreadView id={openId} onBack={() => { setOpenId(null); refreshList(); }} />
          : <ConversationList convs={convs} error={error} onOpen={setOpenId} />}
      </div>
    </div>
  );
}
