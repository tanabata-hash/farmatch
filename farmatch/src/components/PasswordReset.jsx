import { useState } from "react";
import { supabase } from "../supabase";
import { C } from "../theme";

// ── パスワード再設定モーダル ─────────────────────────────
// パスワードリセットメールのリンクから戻ってきた利用者に、
// 新しいパスワードを入力・保存してもらうための画面。

export function PasswordResetModal({ onClose }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (password.length < 8) { setError("パスワードは8文字以上で設定してください"); return; }
    if (password !== confirm) { setError("確認用のパスワードが一致しません"); return; }
    setLoading(true); setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError("パスワードの変更に失敗しました。リンクの有効期限が切れている場合は、もう一度リセットメールをお送りください。");
      return;
    }
    setDone(true);
  };

  const inputStyle = {
    width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 8,
    padding: "10px 12px", fontSize: 14, boxSizing: "border-box", outline: "none",
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex",
      alignItems:"center", justifyContent:"center", zIndex:1100, padding:16 }}>
      <div style={{ background:C.white, borderRadius:16, padding:28, width:"100%", maxWidth:400, position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:16, background:"none",
          border:"none", fontSize:20, cursor:"pointer", color:C.muted }}>✕</button>

        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:32 }}>🔑</div>
          <div style={{ fontWeight:800, color:C.green, fontSize:18 }}>パスワードの再設定</div>
        </div>

        {done ? (
          <div style={{ textAlign:"center", padding:"8px 0" }}>
            <div style={{ fontSize:40, marginBottom:10 }}>✅</div>
            <p style={{ color:C.muted, fontSize:13, lineHeight:1.7 }}>
              パスワードを変更しました。<br />このままご利用いただけます。
            </p>
            <button onClick={onClose} style={{ marginTop:16, background:C.green, color:"#fff",
              border:"none", borderRadius:8, padding:"10px 24px", cursor:"pointer", fontSize:14, fontWeight:700 }}>
              閉じる
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize:13, color:C.muted, marginBottom:16, lineHeight:1.6 }}>
              新しいパスワードを入力してください（8文字以上）。
            </p>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, color:C.green, fontWeight:600, display:"block", marginBottom:4 }}>
                新しいパスワード *
              </label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="8文字以上" style={inputStyle} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, color:C.green, fontWeight:600, display:"block", marginBottom:4 }}>
                新しいパスワード（確認用） *
              </label>
              <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}
                placeholder="もう一度入力" style={inputStyle}
                onKeyDown={e=>{ if(e.key==="Enter") handleSubmit(); }} />
            </div>
            {error && <p style={{ color:"#E57373", fontSize:12, marginBottom:10, lineHeight:1.6 }}>{error}</p>}
            <button onClick={handleSubmit} disabled={loading}
              style={{ width:"100%", background:C.green, color:"#fff", border:"none", borderRadius:8,
                padding:"12px", fontSize:14, fontWeight:700, cursor:"pointer", opacity:loading?0.7:1 }}>
              {loading ? "変更中..." : "パスワードを変更する"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
