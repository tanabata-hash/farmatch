import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const C = {
  green: "#2D5016", lightGreen: "#7AB648", paleGreen: "#EDF5E1",
  soil: "#C4883A", white: "#FFFFFF", text: "#1A1A1A",
  muted: "#6B6B6B", border: "#E0D8CC", cream: "#F5F0E8", sky: "#4A90D9",
};

const STATUS_LABELS = { new:"新着", replied:"返信済", closed:"クローズ" };
const STATUS_COLORS = { new:C.soil, replied:C.lightGreen, closed:C.muted };

export function InquiryManager() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchInquiries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending:false });
    setInquiries(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchInquiries(); }, []);

  const updateStatus = async (id, status) => {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    setInquiries(prev => prev.map(i => i.id===id ? {...i, status} : i));
    if(selected?.id===id) setSelected(prev => ({...prev, status}));
  };

  const filtered = filter==="all" ? inquiries : inquiries.filter(i=>i.status===filter);

  const stats = [
    { label:"全件", value:inquiries.length, color:C.green },
    { label:"新着", value:inquiries.filter(i=>i.status==="new").length, color:C.soil },
    { label:"返信済", value:inquiries.filter(i=>i.status==="replied").length, color:C.lightGreen },
    { label:"クローズ", value:inquiries.filter(i=>i.status==="closed").length, color:C.muted },
  ];

  return (
    <div>
      <h3 style={{ color:C.green, fontSize:16, marginBottom:16 }}>📬 問い合わせ管理</h3>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {stats.map(s=>(
          <div key={s.label} style={{ background:C.white, borderRadius:10,
            padding:"12px 14px", border:`2px solid ${C.border}`, textAlign:"center" }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["all","すべて"],["new","新着"],["replied","返信済"],["closed","クローズ"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{ background: filter===v ? C.green : C.white,
              color: filter===v ? "#fff" : C.muted,
              border:`1.5px solid ${filter===v?C.green:C.border}`,
              borderRadius:20, padding:"5px 14px", fontSize:12, cursor:"pointer",
              fontWeight: filter===v?700:400 }}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:40, color:C.muted }}>読み込み中...</div>
      ) : filtered.length===0 ? (
        <div style={{ textAlign:"center", padding:40, color:C.muted }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
          <div>問い合わせはまだありません</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns: selected?"1fr 1fr":"1fr", gap:16 }}>
          {/* List */}
          <div>
            {filtered.map(inq=>(
              <div key={inq.id} onClick={()=>setSelected(inq)}
                style={{ background: selected?.id===inq.id ? C.paleGreen : C.white,
                  border:`2px solid ${selected?.id===inq.id?C.lightGreen:C.border}`,
                  borderRadius:10, padding:"14px 16px", marginBottom:10, cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"flex-start", marginBottom:6 }}>
                  <div>
                    <span style={{ fontWeight:700, fontSize:14, color:C.text }}>{inq.name}</span>
                    <span style={{ fontSize:12, color:C.muted, marginLeft:8 }}>{inq.email}</span>
                  </div>
                  <span style={{ background:STATUS_COLORS[inq.status]||C.muted,
                    color:"#fff", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>
                    {STATUS_LABELS[inq.status]||inq.status}
                  </span>
                </div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>
                  {inq.target_type==="farm"?"🌱 農地":"🏡 住居"} への問い合わせ
                  {inq.purpose && <span style={{ marginLeft:8 }}>・{inq.purpose}</span>}
                </div>
                <div style={{ fontSize:12, color:C.muted }}>
                  {new Date(inq.created_at).toLocaleDateString("ja-JP", {
                    year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div style={{ background:C.white, border:`2px solid ${C.border}`,
              borderRadius:10, padding:20, position:"sticky", top:16, height:"fit-content" }}>
              <button onClick={()=>setSelected(null)}
                style={{ background:"none", border:"none", color:C.muted,
                  fontSize:12, cursor:"pointer", marginBottom:12, padding:0 }}>
                ← 一覧に戻る
              </button>

              <div style={{ marginBottom:14 }}>
                <div style={{ fontWeight:700, fontSize:16, color:C.text, marginBottom:4 }}>
                  {selected.name}
                </div>
                <div style={{ fontSize:13, color:C.muted }}>{selected.email}</div>
              </div>

              <div style={{ background:C.cream, borderRadius:8,
                padding:"12px 14px", marginBottom:14 }}>
                {[
                  ["対象", selected.target_type==="farm"?"🌱 農地":"🏡 住居"],
                  ["目的", selected.purpose||"—"],
                  ["送信日時", new Date(selected.created_at).toLocaleDateString("ja-JP",{
                    year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"
                  })],
                ].map(([k,v])=>(
                  <div key={k} style={{ display:"flex", gap:12, marginBottom:6 }}>
                    <div style={{ fontSize:11, color:C.muted, width:60 }}>{k}</div>
                    <div style={{ fontSize:13, color:C.text, fontWeight:500 }}>{v}</div>
                  </div>
                ))}
              </div>

              {selected.message && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>メッセージ</div>
                  <div style={{ fontSize:13, color:C.text, lineHeight:1.7,
                    background:C.paleGreen, borderRadius:8, padding:"10px 12px" }}>
                    {selected.message}
                  </div>
                </div>
              )}

              {/* Status update */}
              <div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>ステータスを変更</div>
                <div style={{ display:"flex", gap:8 }}>
                  {Object.entries(STATUS_LABELS).map(([v,l])=>(
                    <button key={v} onClick={()=>updateStatus(selected.id, v)}
                      style={{ flex:1, padding:"8px",
                        background: selected.status===v ? STATUS_COLORS[v] : C.white,
                        color: selected.status===v ? "#fff" : C.muted,
                        border:`1.5px solid ${selected.status===v?STATUS_COLORS[v]:C.border}`,
                        borderRadius:8, fontSize:12, cursor:"pointer", fontWeight:600 }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply link */}
              <a href={`mailto:${selected.email}?subject=【Farmatch】お問い合わせへのご回答`}
                style={{ display:"block", marginTop:14, background:C.green, color:"#fff",
                  borderRadius:8, padding:"10px", textAlign:"center", fontSize:13,
                  fontWeight:700, textDecoration:"none" }}>
                メールで返信する
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
