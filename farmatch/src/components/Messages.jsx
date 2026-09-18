import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { C } from "../theme";

// ── サイト内メッセージ（会話一覧・会話画面） ─────────────────
// メッセージ本文は当事者のみが /api/messages 経由で取得する。

async function authHeaders(json = false) {
  const { data: { session } } = await supabase.auth.getSession();
  const h = { Authorization: `Bearer ${session?.access_token || ""}` };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

export async function fetchUnreadMessageCount() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return 0;
    const res = await fetch("/api/messages?summary=1", { headers: await authHeaders() });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.unread || 0;
  } catch {
    return 0;
  }
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MessageNotice() {
  return (
    <div style={{ background: C.paleGreen, border: "1px solid #B8D98A", borderRadius: 8, padding: "8px 12px",
      fontSize: 11, color: C.green, lineHeight: 1.7, marginBottom: 12 }}>
      メッセージの内容は、やり取りをしているお二人だけが閲覧できます。Farmatchは当事者間の交渉や契約には関与しません。
      農地の貸し借りには、農地の所在地の農業委員会での手続きが必要です。
    </div>
  );
}

function ConversationView({ conversationId, onBack, onChanged }) {
  const [data, setData] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const load = async () => {
    try {
      const res = await fetch(`/api/messages?conversationId=${encodeURIComponent(conversationId)}`, { headers: await authHeaders() });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "読み込みに失敗しました"); return; }
      setData(json);
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000); // 開いている間は15秒ごとに新着を確認
    return () => clearInterval(timer);
  }, [conversationId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ block: "end" }); }, [data?.messages?.length]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST", headers: await authHeaders(true),
        body: JSON.stringify({ action: "reply", conversationId, body: text }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setError(json.error || "送信に失敗しました"); }
      else { setText(""); await load(); }
    } catch (err) {
      setError(err.message);
    }
    setSending(false);
  };

  const conv = data?.conversation;
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.green, fontSize: 12,
        cursor: "pointer", padding: 0, marginBottom: 8 }}>← 会話一覧に戻る</button>
      {conv && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: C.muted }}>{conv.target_type === "farm" ? "🌱 農地" : "🏡 住まい"}：{conv.target_name}</div>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>
            {conv.other_name}さん（{conv.my_role === "owner" ? "希望者" : "オーナー"}）とのメッセージ
          </div>
        </div>
      )}
      <MessageNotice />
      <div style={{ background: C.cream, borderRadius: 10, padding: 12, maxHeight: 340, overflowY: "auto", marginBottom: 10 }}>
        {!data && !error && <div style={{ textAlign: "center", color: C.muted, fontSize: 12 }}>読み込み中...</div>}
        {data?.messages?.map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.is_mine ? "flex-end" : "flex-start", marginBottom: 8 }}>
            <div style={{ maxWidth: "80%" }}>
              <div style={{ background: m.is_mine ? C.green : C.white, color: m.is_mine ? "#fff" : C.text,
                border: m.is_mine ? "none" : `1px solid ${C.border}`, borderRadius: 10, padding: "8px 11px",
                fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {m.body}
              </div>
              <div style={{ fontSize: 10, color: C.muted, textAlign: m.is_mine ? "right" : "left", marginTop: 2 }}>
                {formatTime(m.created_at)}{m.is_mine && m.read_at ? "・既読" : ""}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {error && <div style={{ color: "#C0392B", fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000}
        placeholder="メッセージを入力"
        style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "9px 12px",
          fontSize: 13, boxSizing: "border-box", resize: "vertical", outline: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
        <span style={{ fontSize: 10, color: C.muted }}>{text.length}/2000</span>
        <button onClick={send} disabled={sending || !text.trim()}
          style={{ background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px",
            fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: sending || !text.trim() ? 0.6 : 1 }}>
          {sending ? "送信中..." : "送信する"}
        </button>
      </div>
    </div>
  );
}

export function MessagesPanel({ onClose, onUnreadChange, initialConversationId = null }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(initialConversationId);

  const loadList = async () => {
    try {
      const res = await fetch("/api/messages", { headers: await authHeaders() });
      const json = await res.json();
      setList(Array.isArray(json) ? json : []);
    } catch {
      setList([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadList(); }, []);

  const refreshUnread = async () => {
    onUnreadChange?.(await fetchUnreadMessageCount());
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{ background: C.white, borderRadius: 16, padding: 24, width: "100%", maxWidth: 560,
        maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 16, background: "none",
          border: "none", fontSize: 20, cursor: "pointer", color: C.muted }}>✕</button>
        <h3 style={{ margin: "0 0 12px", color: C.green }}>💬 メッセージ</h3>

        {openId ? (
          <ConversationView conversationId={openId}
            onBack={() => { setOpenId(null); loadList(); refreshUnread(); }}
            onChanged={refreshUnread} />
        ) : loading ? (
          <div style={{ textAlign: "center", padding: 20, color: C.muted, fontSize: 13 }}>読み込み中...</div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: C.muted, fontSize: 13, lineHeight: 1.8 }}>
            まだメッセージはありません。<br />
            農地・住まいの詳細画面から、オーナーにメッセージを送ることができます。
          </div>
        ) : (
          list.map((c) => (
            <button key={c.id} onClick={() => setOpenId(c.id)}
              style={{ display: "block", width: "100%", textAlign: "left", background: c.unread ? C.paleGreen : C.white,
                border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", marginBottom: 8, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: C.muted }}>
                  {c.target_type === "farm" ? "🌱" : "🏡"} {c.target_name}
                </span>
                <span style={{ fontSize: 10, color: C.muted }}>{formatTime(c.last_message_at)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>
                  {c.other_name}さん（{c.my_role === "owner" ? "希望者" : "オーナー"}）
                </span>
                {c.unread > 0 && (
                  <span style={{ background: "#E53935", color: "#fff", borderRadius: 20, fontSize: 10,
                    fontWeight: 700, padding: "1px 7px" }}>未読 {c.unread}</span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
