import { useState } from "react";
import { supabase } from "../supabase";

const C = {
  deepGreen: "#1E3D0F", green: "#2D5016",
  lightGreen: "#7AB648", paleGreen: "#EDF5E1",
  soil: "#C4883A", soilLight: "#FFF4E6", soilBorder: "#E8C48A",
  white: "#FFFFFF", text: "#1A1A1A", muted: "#6B6B6B", border: "#E0D8CC",
};

function Input({ label, type="text", value, onChange, placeholder, required }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, color:C.green, fontWeight:600,
        display:"block", marginBottom:4 }}>{label}{required && " *"}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8,
          padding:"10px 12px", fontSize:14, boxSizing:"border-box", outline:"none" }} />
    </div>
  );
}

export function AuthModal({ onClose, onSuccess, onNavigateTerms, onNavigatePrivacy }) {
  const [mode, setMode] = useState("login"); // login | register | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("seeker");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [agreed, setAgreed] = useState(false);

  // 信頼構築のための追加項目（すべて任意・後からでも追加可能）
  const [showTrust, setShowTrust] = useState(false);
  const [bio, setBio] = useState("");                       // 自己紹介
  const [farmingExperience, setFarmingExperience] = useState(""); // 農業経験（seeker）
  const [desiredArea, setDesiredArea] = useState("");        // 希望地域（seeker）
  const [desiredCrop, setDesiredCrop] = useState("");        // 希望作物（seeker）
  const [householdInfo, setHouseholdInfo] = useState("");    // 家族構成・移住予定（seeker）

  const handleLogin = async () => {
    if(!email || !password) { setError("メールアドレスとパスワードを入力してください"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if(error) { setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。"); return; }
    onSuccess();
  };

  const handleRegister = async () => {
    if(!email || !password || !name) { setError("全ての必須項目を入力してください"); return; }
    if(password.length < 8) { setError("パスワードは8文字以上で設定してください"); return; }
    if(!agreed) { setError("利用規約とプライバシーポリシーへの同意が必要です"); return; }
    setLoading(true); setError("");
    const { data, error } = await supabase.auth.signUp({ email, password,
      options: { data: { name, role } }
    });
    setLoading(false);
    if(error) { setError("登録に失敗しました: "+error.message); return; }
    // usersテーブルにも追加（信頼構築のための任意項目を含む）
    if(data.user) {
      const profile = { id: data.user.id, email, name, role, is_premium: false, bio };
      if(role === "seeker") {
        profile.farming_experience = farmingExperience;
        profile.desired_area = desiredArea;
        profile.desired_crop = desiredCrop;
        profile.household_info = householdInfo;
      }
      await supabase.from("users").upsert([profile]);
    }
    setDone("確認メールを送信しました。メールのリンクをクリックして登録を完了してください。");
  };

  const handleReset = async () => {
    if(!email) { setError("メールアドレスを入力してください"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://www.farmatch.net",
    });
    setLoading(false);
    if(error) { setError("送信に失敗しました"); return; }
    setDone("パスワードリセットメールを送信しました。");
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
      <div style={{ background:C.white, borderRadius:16, padding:28,
        width:"100%", maxWidth:400, position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:16,
          background:"none", border:"none", fontSize:20, cursor:"pointer", color:C.muted }}>✕</button>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:32 }}>🌱</div>
          <div style={{ fontWeight:800, color:C.green, fontSize:18 }}>Farmatch</div>
        </div>

        {done ? (
          <div style={{ textAlign:"center", padding:"8px 0" }}>
            <div style={{ fontSize:40, marginBottom:10 }}>✅</div>
            <p style={{ color:C.muted, fontSize:13, lineHeight:1.7 }}>{done}</p>
            <button onClick={onClose} style={{ marginTop:16, background:C.green, color:"#fff",
              border:"none", borderRadius:8, padding:"10px 24px", cursor:"pointer", fontSize:14, fontWeight:700 }}>
              閉じる
            </button>
          </div>
        ) : (
          <>
            {/* Tab */}
            <div style={{ display:"flex", gap:2, marginBottom:20,
              background:"#F0F0F0", borderRadius:8, padding:3 }}>
              {[["login","ログイン"],["register","新規登録"]].map(([m,l])=>(
                <button key={m} onClick={()=>{ setMode(m); setError(""); }}
                  style={{ flex:1, padding:"8px", border:"none", borderRadius:6, cursor:"pointer",
                    background: mode===m ? C.white : "transparent",
                    color: mode===m ? C.green : C.muted,
                    fontWeight: mode===m ? 700 : 400, fontSize:13,
                    boxShadow: mode===m ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
                  {l}
                </button>
              ))}
            </div>

            {mode==="reset" ? (
              <>
                <p style={{ fontSize:13, color:C.muted, marginBottom:16, lineHeight:1.6 }}>
                  登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
                </p>
                <Input label="メールアドレス" type="email" value={email}
                  onChange={e=>setEmail(e.target.value)} placeholder="example@mail.com" required />
                {error && <p style={{ color:"#E57373", fontSize:12, marginBottom:10 }}>{error}</p>}
                <button onClick={handleReset} disabled={loading}
                  style={{ width:"100%", background:C.green, color:"#fff", border:"none",
                    borderRadius:8, padding:"12px", fontSize:14, fontWeight:700, cursor:"pointer",
                    opacity:loading?0.7:1 }}>
                  {loading ? "送信中..." : "リセットメールを送信"}
                </button>
                <button onClick={()=>setMode("login")}
                  style={{ width:"100%", background:"none", border:"none", color:C.muted,
                    fontSize:12, cursor:"pointer", marginTop:10, padding:"6px" }}>
                  ← ログインに戻る
                </button>
              </>
            ) : (
              <>
                {mode==="register" && (
                  <>
                    <Input label="お名前" value={name} onChange={e=>setName(e.target.value)}
                      placeholder="山田 太郎" required />
                    <div style={{ marginBottom:14 }}>
                      <label style={{ fontSize:12, color:C.green, fontWeight:600,
                        display:"block", marginBottom:6 }}>利用目的 *</label>
                      <div style={{ display:"flex", gap:8 }}>
                        {[["seeker","就農・移住希望"],["owner","農地オーナー"]].map(([v,l])=>(
                          <button key={v} onClick={()=>setRole(v)}
                            style={{ flex:1, padding:"9px", border:`2px solid ${role===v?C.green:C.border}`,
                              borderRadius:8, background: role===v?C.paleGreen:C.white,
                              color: role===v?C.green:C.muted, fontSize:12, cursor:"pointer",
                              fontWeight: role===v?700:400 }}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 信頼構築のための追加情報（任意・折りたたみ） */}
                    <div style={{ marginBottom:14, border:`1px solid #DCEBC4`, borderRadius:8,
                      background:"#F8FBF3", overflow:"hidden" }}>
                      <button type="button" onClick={()=>setShowTrust(v=>!v)}
                        style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                          background:"none", border:"none", padding:"10px 12px", cursor:"pointer" }}>
                        <span style={{ fontSize:12, fontWeight:700, color:C.green }}>
                          🤝 自己紹介を追加する（任意）
                        </span>
                        <span style={{ fontSize:11, color:C.muted }}>{showTrust ? "閉じる ▲" : "開く ▼"}</span>
                      </button>
                      {showTrust && (
                        <div style={{ padding:"0 12px 14px" }}>
                          <p style={{ fontSize:11, color:C.muted, margin:"0 0 10px", lineHeight:1.6 }}>
                            {role==="owner"
                              ? "オーナー自身の自己紹介は、借り手に安心して問い合わせてもらうための情報として農地詳細ページに表示できます。後からいつでも追加・変更できます。"
                              : "自己紹介や希望条件を伝えておくと、オーナーが安心して連絡しやすくなります。後からいつでも追加・変更できます。"}
                          </p>
                          <div style={{ marginBottom:10 }}>
                            <label style={{ fontSize:11, color:C.green, fontWeight:600, display:"block", marginBottom:4 }}>
                              自己紹介
                            </label>
                            <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={2}
                              placeholder={role==="owner" ? "例：地元で長年農業を営んできました" : "例：週末を使って家庭菜園から始めたいと考えています"}
                              style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8,
                                padding:"8px 10px", fontSize:13, boxSizing:"border-box", resize:"vertical", outline:"none" }}/>
                          </div>
                          {role==="seeker" && (
                            <>
                              <div style={{ marginBottom:10 }}>
                                <label style={{ fontSize:11, color:C.green, fontWeight:600, display:"block", marginBottom:4 }}>
                                  農業経験
                                </label>
                                <select value={farmingExperience} onChange={e=>setFarmingExperience(e.target.value)}
                                  style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8,
                                    padding:"8px 10px", fontSize:13, outline:"none" }}>
                                  <option value="">未選択</option>
                                  <option>未経験</option>
                                  <option>家庭菜園程度</option>
                                  <option>研修・実習経験あり</option>
                                  <option>実務経験あり</option>
                                </select>
                              </div>
                              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                                <div>
                                  <label style={{ fontSize:11, color:C.green, fontWeight:600, display:"block", marginBottom:4 }}>
                                    希望地域
                                  </label>
                                  <input value={desiredArea} onChange={e=>setDesiredArea(e.target.value)}
                                    placeholder="例：鹿児島県"
                                    style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8,
                                      padding:"8px 10px", fontSize:13, boxSizing:"border-box", outline:"none" }}/>
                                </div>
                                <div>
                                  <label style={{ fontSize:11, color:C.green, fontWeight:600, display:"block", marginBottom:4 }}>
                                    希望作物
                                  </label>
                                  <input value={desiredCrop} onChange={e=>setDesiredCrop(e.target.value)}
                                    placeholder="例：さつまいも"
                                    style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8,
                                      padding:"8px 10px", fontSize:13, boxSizing:"border-box", outline:"none" }}/>
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize:11, color:C.green, fontWeight:600, display:"block", marginBottom:4 }}>
                                  家族構成・移住予定
                                </label>
                                <input value={householdInfo} onChange={e=>setHouseholdInfo(e.target.value)}
                                  placeholder="例：夫婦2人で移住を検討中"
                                  style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8,
                                    padding:"8px 10px", fontSize:13, boxSizing:"border-box", outline:"none" }}/>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
                <Input label="メールアドレス" type="email" value={email}
                  onChange={e=>setEmail(e.target.value)} placeholder="example@mail.com" required />
                <Input label="パスワード" type="password" value={password}
                  onChange={e=>setPassword(e.target.value)}
                  placeholder={mode==="register"?"8文字以上":"パスワード"} required />

                {mode==="register" && (
                  <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:12 }}>
                    <input type="checkbox" id="agree" checked={agreed} onChange={e=>setAgreed(e.target.checked)}
                      style={{ marginTop:2 }}/>
                    <label htmlFor="agree" style={{ fontSize:11.5, color:C.muted, lineHeight:1.6, cursor:"pointer" }}>
                      <button type="button" onClick={onNavigateTerms}
                        style={{ background:"none", border:"none", padding:0, color:C.green, textDecoration:"underline", cursor:"pointer", fontSize:11.5 }}>利用規約</button>
                      と
                      <button type="button" onClick={onNavigatePrivacy}
                        style={{ background:"none", border:"none", padding:0, color:C.green, textDecoration:"underline", cursor:"pointer", fontSize:11.5 }}>プライバシーポリシー</button>
                      に同意します
                    </label>
                  </div>
                )}

                {error && <p style={{ color:"#E57373", fontSize:12, marginBottom:10 }}>{error}</p>}

                <button onClick={mode==="login"?handleLogin:handleRegister} disabled={loading || (mode==="register" && !agreed)}
                  style={{ width:"100%", background:C.green, color:"#fff", border:"none",
                    borderRadius:8, padding:"12px", fontSize:14, fontWeight:700,
                    cursor:"pointer", opacity:(loading||(mode==="register"&&!agreed))?0.6:1, marginBottom:10 }}>
                  {loading ? "処理中..." : mode==="login" ? "ログイン" : "登録する"}
                </button>

                {mode==="login" && (
                  <button onClick={()=>setMode("reset")}
                    style={{ width:"100%", background:"none", border:"none", color:C.muted,
                      fontSize:12, cursor:"pointer", padding:"4px" }}>
                    パスワードをお忘れの方
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
