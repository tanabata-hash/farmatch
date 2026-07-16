import { useState, useEffect } from "react";

const C = {
  green: "#2D5016", lightGreen: "#7AB648", paleGreen: "#EDF5E1",
  soil: "#C4883A", white: "#FFFFFF", text: "#1A1A1A",
  muted: "#6B6B6B", border: "#E0D8CC", cream: "#F5F0E8", red: "#C0392B",
};

const STATUS_LABELS = { new:"新着", replied:"対応済", closed:"クローズ" };
const STATUS_COLORS = { new:C.red, replied:C.lightGreen, closed:C.muted };

export function ReportManager() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports", {
        headers: { "x-admin-password": sessionStorage.getItem("adminPw") || "" },
      });
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch {
      setReports([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const updateStatus = async (id, status) => {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": sessionStorage.getItem("adminPw") || "",
      },
      body: JSON.stringify({ id, status }),
    });
    setReports(prev => prev.map(r => r.id===id ? {...r, status} : r));
    if(selected?.id===id) setSelected(prev => ({...prev, status}));
  };

  const filtered = filter==="all" ? reports : reports.filter(r=>r.status===filter);

  const stats = [
    { label:"全件", value:reports.length, color:C.green },
    { label:"新着", value:reports.filter(r=>r.status==="new").length, color:C.red },
    { label:"対応済", value:reports.filter(r=>r.status==="replied").length, color:C.lightGreen },
    { label:"クローズ", value:reports.filter(r=>r.status==="closed").length, color:C.muted },
  ];

  return (
    <div>
      <h3 style={{ color:C.green, fontSize:16, marginBottom:16 }}>🚩 通報管理</h3>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {stats.map(s=>(
          <div key={s.label} style={{ background:C.white, borderRadius:10,
            padding:"12px 14px", border:`2px solid ${C.border}`, textAlign:"center" }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["all","すべて"],["new","新着"],["replied","対応済"],["closed","クローズ"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{ background: filter===v ? C.red : C.white,
              color: filter===v ? "#fff" : C.muted,
              border:`1.5px solid ${filter===v?C.red:C.border}`,
              borderRadius:20, padding:"5px 14px", fontSize:12, cursor:"pointer",
              fontWeight: filter===v?700:400 }}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:40, color:C.muted }}>読み込み中...</div>
      ) : filtered.length===0 ? (
        <div style={{ textAlign:"center", padding:40, color:C.muted }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🚩</div>
          <div>通報はまだありません</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns: selected?"1fr 1fr":"1fr", gap:16 }}>
          <div>
            {filtered.map(rep=>(
              <div key={rep.id} onClick={()=>setSelected(rep)}
                style={{ background: selected?.id===rep.id ? "#FFF0F0" : C.white,
                  border:`2px solid ${selected?.id===rep.id?C.red:"#F5C6C6"}`,
                  borderRadius:10, padding:"14px 16px", marginBottom:10, cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"flex-start", marginBottom:6 }}>
                  <span style={{ background:C.red, color:"#fff", borderRadius:6,
                    padding:"2px 8px", fontSize:11, fontWeight:700 }}>🚩 通報</span>
                  <span style={{ background:STATUS_COLORS[rep.status]||C.muted,
                    color:"#fff", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>
                    {STATUS_LABELS[rep.status]||rep.status}
                  </span>
                </div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>
                  {rep.target_type==="farm"?"🌱 農地":"🏡 住居"}の通報
                </div>
                <div style={{ fontSize:12, color:C.muted }}>
                  {new Date(rep.created_at).toLocaleDateString("ja-JP", {
                    year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"
                  })}
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div style={{ background:C.white, border:`2px solid ${C.border}`,
              borderRadius:10, padding:20, position:"sticky", top:16, height:"fit-content" }}>
              <button onClick={()=>setSelected(null)}
                style={{ background:"none", border:"none", color:C.muted,
                  fontSize:12, cursor:"pointer", marginBottom:12, padding:0 }}>
                ← 一覧に戻る
              </button>

              <div style={{ marginBottom:14 }}>
                <span style={{ background:C.red, color:"#fff", borderRadius:6,
                  padding:"3px 10px", fontSize:12, fontWeight:700 }}>🚩 不適切な内容の通報</span>
              </div>

              <div style={{ background:C.cream, borderRadius:8,
                padding:"12px 14px", marginBottom:14 }}>
                {[
                  ["対象", selected.target_type==="farm"?"🌱 農地":"🏡 住居"],
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
                  <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>通報理由</div>
                  <div style={{ fontSize:13, color:C.text, lineHeight:1.7,
                    background:"#FFF0F0", borderRadius:8, padding:"10px 12px" }}>
                    {selected.message}
                  </div>
                </div>
              )}

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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
