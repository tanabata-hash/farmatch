import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { TermsPage, PrivacyPage, SpecifiedCommercialPage } from "./pages/Legal";
import { AuthModal } from "./components/Auth";
import { InquiryManager } from "./components/InquiryManager";

const BRAND = {
  name: "Farmatch", tagline: "農地と人をつなぐプラットフォーム",
  sub: "全国の遊休農地と就農希望者・移住希望者をマッチング", year: 2025,
};

const C = {
  deepGreen:"#1E3D0F", green:"#2D5016", midGreen:"#4A7C20", lightGreen:"#7AB648", paleGreen:"#EDF5E1",
  soil:"#C4883A", soilLight:"#FFF4E6", soilBorder:"#E8C48A",
  cream:"#F5F0E8", white:"#FFFFFF", text:"#1A1A1A", muted:"#6B6B6B", border:"#E0D8CC", sky:"#4A90D9",
};

const ADMIN_PASSWORD = "farmatch2025";

const SAMPLE_FARMS = [
  { id:"1", name:"南部農地 A区画", region:"鹿児島県", location:"南薩摩エリア",
    lat:31.178, lng:130.529, area_label:"約800㎡", farm_type:"畑", status:"貸出可能",
    rent_label:"月額 5,000円", water_source:"井戸・雨水", access_info:"最寄り駅より車5分",
    crops:["さつまいも","かぼちゃ","スイカ","オクラ","菜の花"],
    score_water:4, score_sun:5, score_soil:4, score_climate:5, score_access:3,
    description:"温暖な気候と黒ボク土に恵まれた畑地。根菜・果菜類に最適です。",
    tags:["初心者向け","温暖気候","多品種"], is_premium:false },
  { id:"2", name:"南部農地 B区画", region:"鹿児島県", location:"南薩摩エリア",
    lat:31.181, lng:130.531, area_label:"約1,200㎡", farm_type:"水田・畑", status:"調整中",
    rent_label:"応相談", water_source:"農業用水路", access_info:"最寄り駅より車8分",
    crops:["米","さつまいも","菜の花"],
    score_water:5, score_sun:4, score_soil:5, score_climate:5, score_access:3,
    description:"水田転換も可能な平坦地。用水路が隣接しており水管理が容易です。",
    tags:["水田可能","大区画","平坦地"], is_premium:true },
  { id:"3", name:"東部農地 C区画", region:"鹿児島県", location:"南薩摩エリア",
    lat:31.183, lng:130.535, area_label:"約500㎡", farm_type:"畑", status:"貸出可能",
    rent_label:"月額 3,000円", water_source:"雨水・近隣水源", access_info:"最寄り駅より車10分",
    crops:["かぼちゃ","スイカ","オクラ","さつまいも"],
    score_water:3, score_sun:5, score_soil:4, score_climate:5, score_access:2,
    description:"日当たり抜群の南向き農地。週末農業・体験農業にも最適です。",
    tags:["週末農業向け","南向き","コンパクト"], is_premium:false },
];

const SAMPLE_HOUSES = [
  { id:"1", name:"古民家リノベ物件 No.1", region:"鹿児島県", location:"南薩摩エリア",
    house_type:"古民家", rent_label:"月額 35,000円", area_label:"120㎡ / 4LDK",
    lat:31.180, lng:130.527,
    description:"築60年の古民家を全面リノベーション。農地まで徒歩5分圏内。",
    subsidy_info:"市区町村移住補助金対象（最大50万円）",
    tags:["補助金対象","農地近接","ペット可"] },
  { id:"2", name:"移住者向け賃貸 No.2", region:"鹿児島県", location:"南薩摩エリア",
    house_type:"アパート", rent_label:"月額 42,000円", area_label:"65㎡ / 2LDK",
    lat:31.242, lng:130.634,
    description:"最寄り駅徒歩10分。スーパー・病院が近く生活利便性が高い。",
    subsidy_info:"都道府県移住支援金対象（最大100万円）",
    tags:["駅近","生活利便","移住者コミュニティ"] },
  { id:"3", name:"一戸建て空き家 No.3", region:"鹿児島県", location:"南薩摩エリア",
    house_type:"一戸建て", rent_label:"月額 28,000円", area_label:"95㎡ / 3DK",
    lat:31.176, lng:130.532,
    description:"山並みビューの静かな立地。広い庭付きで家庭菜園も可能。",
    subsidy_info:"空き家バンク登録物件（改修補助最大30万円）",
    tags:["空き家バンク","庭付き","山ビュー"] },
];

const CROP_CALENDAR = [
  { crop:"さつまいも", emoji:"🍠", sow:[4,5], grow:[5,6,7,8,9], harvest:[9,10,11], color:"#E8924A" },
  { crop:"かぼちゃ",   emoji:"🎃", sow:[4,5], grow:[5,6,7],     harvest:[7,8],      color:"#F5A623" },
  { crop:"スイカ",     emoji:"🍉", sow:[4,5], grow:[5,6,7],     harvest:[7,8],      color:"#D94F4F" },
  { crop:"オクラ",     emoji:"🌿", sow:[5,6], grow:[6,7,8],     harvest:[7,8,9,10], color:"#4CAF50" },
  { crop:"菜の花",     emoji:"🌼", sow:[9,10], grow:[10,11,12,1,2], harvest:[2,3,4], color:"#D4C400" },
  { crop:"米",         emoji:"🌾", sow:[4,5], grow:[5,6,7,8],   harvest:[9,10],     color:"#C8A830" },
];
const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const CROP_EMOJI = { さつまいも:"🍠", かぼちゃ:"🎃", スイカ:"🍉", オクラ:"🌿", 菜の花:"🌼", 米:"🌾" };
const SL = { water:"水源", sun:"日照", soil:"土質", climate:"気候", access:"アクセス" };

function ScoreBar({ value }) {
  return (
    <div style={{ display:"flex", gap:3 }}>
      {[1,2,3,4,5].map(i=>(
        <div key={i} style={{ width:14, height:7, borderRadius:2,
          background: i<=value ? C.lightGreen : C.border }} />
      ))}
    </div>
  );
}

function Tag({ children, color=C.paleGreen, border="#B8D98A", text=C.green }) {
  return <span style={{ background:color, border:`1px solid ${border}`, borderRadius:20,
    padding:"3px 10px", fontSize:11, color:text, fontWeight:500 }}>{children}</span>;
}

function Btn({ children, onClick, style={}, variant="primary" }) {
  const base = variant==="primary"
    ? { background:C.green, color:"#fff", border:"none" }
    : { background:C.white, color:C.green, border:`1.5px solid ${C.green}` };
  return <button onClick={onClick} style={{ ...base, borderRadius:8, padding:"10px 18px",
    fontSize:13, fontWeight:700, cursor:"pointer", ...style }}>{children}</button>;
}

function Modal({ children, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
      <div style={{ background:C.white, borderRadius:16, padding:28, width:"100%",
        maxWidth:520, maxHeight:"90vh", overflowY:"auto", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:16,
          background:"none", border:"none", fontSize:20, cursor:"pointer", color:C.muted }}>✕</button>
        {children}
      </div>
    </div>
  );
}

function MapView({ farms, houses, focusId, onSelectFarm, onSelectHouse }) {
  const containerId = "farmatch-map";
  useState(() => {
    if(document.getElementById("leaflet-css")){ initMap(); return; }
    const link = document.createElement("link");
    link.id="leaflet-css"; link.rel="stylesheet";
    link.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload=()=>initMap();
    document.head.appendChild(script);
  });
  function initMap() {
    setTimeout(()=>{
      const el=document.getElementById(containerId);
      if(!el||el._leaflet_id) return;
      const L=window.L; if(!L) return;
      const all=[...farms,...houses]; if(all.length===0) return;
      const avgLat=all.reduce((s,p)=>s+p.lat,0)/all.length;
      const avgLng=all.reduce((s,p)=>s+p.lng,0)/all.length;
      const map=L.map(containerId,{scrollWheelZoom:false}).setView([avgLat,avgLng],13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
        attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:18
      }).addTo(map);
      farms.forEach(f=>{
        const icon=L.divIcon({html:`<div style="background:#2D5016;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #7AB648;box-shadow:0 2px 6px rgba(0,0,0,0.3)">🌱</div>`,className:"",iconSize:[36,36],iconAnchor:[18,18]});
        L.marker([f.lat,f.lng],{icon}).addTo(map)
          .bindPopup(`<div style="font-family:sans-serif;min-width:180px"><div style="font-weight:700;color:#2D5016;margin-bottom:4px">${f.name}</div><div style="font-size:12px;color:#666;margin-bottom:6px">📍 ${f.region} ${f.location}</div><div style="font-size:12px">📐 ${f.area_label} ／ 🌱 ${f.farm_type}</div><div style="font-size:12px">💴 ${f.rent_label}</div><div style="margin-top:8px"><span style="background:${f.status==="貸出可能"?"#7AB648":"#C4883A"};color:#fff;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700">${f.status}</span></div></div>`)
          .on("click",()=>onSelectFarm(f));
      });
      houses.forEach(h=>{
        const icon=L.divIcon({html:`<div style="background:#8B5A1A;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #C4883A;box-shadow:0 2px 6px rgba(0,0,0,0.3)">🏡</div>`,className:"",iconSize:[36,36],iconAnchor:[18,18]});
        L.marker([h.lat,h.lng],{icon}).addTo(map)
          .bindPopup(`<div style="font-family:sans-serif;min-width:180px"><div style="font-weight:700;color:#8B5A1A;margin-bottom:4px">${h.name}</div><div style="font-size:12px;color:#666;margin-bottom:6px">📍 ${h.region} ${h.location}</div><div style="font-size:12px">📐 ${h.area_label} ／ 🏠 ${h.house_type}</div><div style="font-size:12px">💴 ${h.rent_label}</div><div style="font-size:11px;margin-top:6px;color:#2D5016">💰 ${h.subsidy_info}</div></div>`)
          .on("click",()=>onSelectHouse(h));
      });
      if(focusId){
        const[type,id]=focusId.split("-");
        const t=type==="farm"?farms.find(f=>f.id===id):houses.find(h=>h.id===id);
        if(t) map.flyTo([t.lat,t.lng],15);
      }
    },300);
  }
  return (
    <div style={{ borderRadius:12, overflow:"hidden", border:`2px solid ${C.border}` }}>
      <div style={{ background:C.green, color:"#fff", padding:"10px 16px", fontSize:13,
        fontWeight:700, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span>🗺 掲載エリアマップ</span>
        <span style={{ fontSize:11, opacity:0.8, fontWeight:400 }}>ピンをクリックで詳細表示</span>
      </div>
      <div id={containerId} style={{ height:460, width:"100%", background:"#D6EAF8" }} />
      <div style={{ display:"flex", gap:20, padding:"10px 16px", background:C.white,
        fontSize:12, color:C.muted, borderTop:`1px solid ${C.border}`, flexWrap:"wrap" }}>
        <span>🌱 農地</span><span>🏡 住居</span>
        <span style={{ marginLeft:"auto", fontSize:11 }}>地図 © OpenStreetMap contributors</span>
      </div>
    </div>
  );
}

function CropCalendar() {
  const [hover, setHover] = useState(null);
  const now = new Date().getMonth()+1;
  return (
    <div>
      <h3 style={{ color:C.green, marginBottom:4, fontSize:16 }}>🗓 作物カレンダー</h3>
      <p style={{ color:C.muted, fontSize:13, marginBottom:16 }}>各作物の播種・生育・収穫時期の目安（温暖地域基準）</p>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, minWidth:560 }}>
          <thead>
            <tr>
              <th style={{ width:90, textAlign:"left", padding:"6px 8px", color:C.muted,
                fontWeight:600, borderBottom:`2px solid ${C.border}` }}>作物</th>
              {MONTHS.map((m,i)=>(
                <th key={m} style={{ padding:"6px 4px", textAlign:"center", fontWeight:600,
                  color:i+1===now?C.green:C.muted,
                  background:i+1===now?C.paleGreen:"transparent",
                  borderBottom:`2px solid ${C.border}` }}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CROP_CALENDAR.map(c=>(
              <tr key={c.crop} onMouseEnter={()=>setHover(c.crop)} onMouseLeave={()=>setHover(null)}
                style={{ background:hover===c.crop?C.paleGreen:"transparent" }}>
                <td style={{ padding:"8px", fontWeight:600, color:C.text, whiteSpace:"nowrap" }}>
                  {c.emoji} {c.crop}
                </td>
                {MONTHS.map((_,i)=>{
                  const m=i+1,isSow=c.sow.includes(m),isGrow=c.grow.includes(m),isHarvest=c.harvest.includes(m);
                  let bg="transparent",label="";
                  if(isSow){bg="#A8D8EA";label="播";}
                  if(isGrow){bg=c.color+"99";}
                  if(isHarvest){bg=c.color;label="収";}
                  return (
                    <td key={m} style={{ padding:"4px 2px", textAlign:"center",
                      background:i+1===now?(bg||"#F0F8E8"):bg,
                      borderRadius:4, fontSize:10, fontWeight:700,
                      color:isHarvest?"#fff":isSow?"#1A6A8A":"transparent" }}>
                      {label||"　"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display:"flex", gap:14, marginTop:10, fontSize:11, color:C.muted, flexWrap:"wrap" }}>
        <span><span style={{ background:"#A8D8EA", padding:"1px 7px", borderRadius:3 }}>播</span> 播種</span>
        <span><span style={{ background:"#7AB64899", padding:"1px 7px", borderRadius:3 }}>&nbsp;&nbsp;</span> 生育</span>
        <span><span style={{ background:"#C4883A", padding:"1px 7px", borderRadius:3, color:"#fff" }}>収</span> 収穫</span>
      </div>
    </div>
  );
}

function PricingView() {
  const plans = [
    { id:"owner", who:"農地・物件オーナー", emoji:"🏡", color:C.soil, bg:C.soilLight, border:C.soilBorder,
      items:[
        {name:"ベーシック掲載",price:"¥3,000/月",desc:"農地・物件の基本情報掲載。問い合わせ受付機能付き。"},
        {name:"プレミアム掲載",price:"¥5,000/月",desc:"上位表示・詳細情報・写真10枚・問い合わせ優先通知。"},
        {name:"成約報酬",price:"初月賃料の20%",desc:"マッチング成立時のみ発生。成約しなければ追加費用なし。"},
      ]},
    { id:"seeker", who:"就農希望者・移住希望者", emoji:"🌱", color:C.green, bg:C.paleGreen, border:"#B8D98A",
      items:[
        {name:"無料プラン",price:"¥0",desc:"農地・住居の一覧閲覧。詳細情報は非表示。"},
        {name:"プレミアム会員",price:"¥1,480/月",desc:"全情報閲覧・優先問い合わせ・補助金情報・作物相談チャット。"},
        {name:"体験ツアー予約",price:"予約額の10%",desc:"農業体験・見学ツアーの仲介手数料。参加費は別途。"},
      ]},
  ];
  return (
    <div>
      <h3 style={{ color:C.green, marginBottom:4, fontSize:16 }}>💰 料金・収益モデル</h3>
      <p style={{ color:C.muted, fontSize:13, marginBottom:20 }}>オーナーと就農希望者の双方から収益を得るプラットフォームモデル</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {plans.map(p=>(
          <div key={p.id} style={{ background:p.bg, border:`2px solid ${p.border}`, borderRadius:12, padding:20 }}>
            <div style={{ fontSize:24, marginBottom:6 }}>{p.emoji}</div>
            <div style={{ fontWeight:700, color:p.color, fontSize:15, marginBottom:14 }}>{p.who}</div>
            {p.items.map(pl=>(
              <div key={pl.name} style={{ background:C.white, borderRadius:8, padding:"12px 14px",
                marginBottom:10, border:`1px solid ${p.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:13, color:C.text }}>{pl.name}</span>
                  <span style={{ fontWeight:800, color:p.color, fontSize:12, whiteSpace:"nowrap", marginLeft:8 }}>{pl.price}</span>
                </div>
                <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.5 }}>{pl.desc}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ background:C.deepGreen, borderRadius:12, padding:20, marginTop:16, color:"#fff" }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:12, color:C.lightGreen }}>📊 収益シミュレーション（月次目安）</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {[["オーナー掲載料","10件 × ¥4,000","¥40,000"],["プレミアム会員費","50人 × ¥1,480","¥74,000"],["成約報酬","月3件 × ¥10,000","¥30,000"]].map(([l,c,v])=>(
            <div key={l} style={{ background:"rgba(255,255,255,0.1)", borderRadius:8, padding:"12px", textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#B8D98A", marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:11, color:"#D4EDAA", marginBottom:6 }}>{c}</div>
              <div style={{ fontSize:18, fontWeight:800, color:C.lightGreen }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"right", marginTop:10, fontSize:13, color:"#D4EDAA" }}>
          想定月次収益合計：<span style={{ fontSize:18, fontWeight:800, color:"#fff" }}>¥144,000</span>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN PASSWORD GATE ───────────────────────────────────
function AdminLogin({ onSuccess }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const handleLogin = () => {
    if(pw === ADMIN_PASSWORD) { onSuccess(); }
    else { setError(true); setTimeout(()=>setError(false), 2000); }
  };
  return (
    <div style={{ maxWidth:360, margin:"60px auto", background:C.white, borderRadius:16,
      padding:36, border:`2px solid ${C.border}`, textAlign:"center" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>🔐</div>
      <h2 style={{ color:C.deepGreen, margin:"0 0 6px", fontSize:18 }}>管理者ログイン</h2>
      <p style={{ color:C.muted, fontSize:13, margin:"0 0 24px" }}>パスワードを入力してください</p>
      <input type="password" value={pw} onChange={e=>setPw(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&handleLogin()}
        placeholder="パスワード"
        style={{ width:"100%", border:`1.5px solid ${error?'#E57373':C.border}`, borderRadius:8,
          padding:"10px 14px", fontSize:14, boxSizing:"border-box", outline:"none",
          marginBottom:12, textAlign:"center" }}/>
      {error && <p style={{ color:"#E57373", fontSize:12, margin:"0 0 12px" }}>パスワードが違います</p>}
      <Btn onClick={handleLogin} style={{ width:"100%" }}>ログイン</Btn>
    </div>
  );
}

// ── ADMIN PANEL ───────────────────────────────────────────
function AdminPanel({ farms, houses, onRefresh, onLogout }) {
  const [tab, setTab] = useState("farms");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("farm");
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    name:"", region:"", location:"", area_label:"", rent_label:"",
    farm_type:"畑", status:"貸出可能", description:"", crops:"",
    water_source:"", access_info:"", lat:"", lng:"",
    chiban:"", nosin_ku:"", chimoku:"",
    score_water:3, score_sun:3, score_soil:3, score_climate:3, score_access:3,
    tags:"", is_premium:false,
  });
  const [toast, setToast] = useState("");
  const showToast = msg=>{ setToast(msg); setTimeout(()=>setToast(""),2500); };

  const openAdd = (type) => {
    setEditItem(null);
    setFormType(type);
    setForm({name:"",region:"",location:"",area_label:"",rent_label:"",
      farm_type:"畑",status:"貸出可能",description:"",crops:"",
      water_source:"",access_info:"",lat:"",lng:"",
      chiban:"",nosin_ku:"",chimoku:"",
      score_water:3,score_sun:3,score_soil:3,score_climate:3,score_access:3,
      tags:"",is_premium:false});
    setShowForm(true);
  };

  const openEdit = (item, type) => {
    setEditItem(item);
    setFormType(type);
    setForm({
      name:item.name||"", region:item.region||"", location:item.location||"",
      area_label:item.area_label||"", rent_label:item.rent_label||"",
      farm_type:item.farm_type||item.house_type||"畑",
      status:item.status||"貸出可能", description:item.description||"",
      crops:(item.crops||[]).join("、"),
      water_source:item.water_source||"", access_info:item.access_info||"",
      lat:item.lat||"", lng:item.lng||"",
      chiban:item.chiban||"", nosin_ku:item.nosin_ku||"", chimoku:item.chimoku||"",
      score_water:item.score_water||3, score_sun:item.score_sun||3,
      score_soil:item.score_soil||3, score_climate:item.score_climate||3,
      score_access:item.score_access||3,
      tags:(item.tags||[]).join("、"), is_premium:item.is_premium||false,
    });
    setShowForm(true);
  };

  const handleSave = async()=>{
    if(!form.name||!form.region) return;
    const table = formType==="farm"?"farms":"houses";
    const payload = formType==="farm"
      ? { name:form.name, region:form.region, location:form.location,
          area_label:form.area_label, rent_label:form.rent_label,
          farm_type:form.farm_type, status:form.status, description:form.description,
          crops:form.crops.split(/[、,]/).map(c=>c.trim()).filter(Boolean),
          water_source:form.water_source, access_info:form.access_info,
          lat:parseFloat(form.lat)||null, lng:parseFloat(form.lng)||null,
          chiban:form.chiban, nosin_ku:form.nosin_ku, chimoku:form.chimoku,
          score_water:parseInt(form.score_water), score_sun:parseInt(form.score_sun),
          score_soil:parseInt(form.score_soil), score_climate:parseInt(form.score_climate),
          score_access:parseInt(form.score_access),
          tags:form.tags.split(/[、,]/).map(t=>t.trim()).filter(Boolean),
          is_premium:form.is_premium, plan:"basic" }
      : { name:form.name, region:form.region, location:form.location,
          area_label:form.area_label, rent_label:form.rent_label,
          house_type:form.farm_type||"一戸建て", status:form.status||"掲載中",
          description:form.description,
          lat:parseFloat(form.lat)||null, lng:parseFloat(form.lng)||null,
          tags:form.tags.split(/[、,]/).map(t=>t.trim()).filter(Boolean),
          plan:"basic" };

    let error;
    if(editItem) {
      ({error}=await supabase.from(table).update(payload).eq("id",editItem.id));
    } else {
      ({error}=await supabase.from(table).insert([payload]));
    }
    if(error){showToast("❌ エラー: "+error.message);return;}
    setShowForm(false);
    showToast(editItem?"✅ 更新しました":"✅ 登録しました");
    onRefresh();
  };

  const handleDelete = async(type,id)=>{
    if(!window.confirm("削除しますか？")) return;
    const table=type==="farm"?"farms":"houses";
    const{error}=await supabase.from(table).delete().eq("id",id);
    if(error){showToast("❌ エラー: "+error.message);return;}
    showToast("🗑 削除しました"); onRefresh();
  };

  // ── エクスポート機能 ──────────────────────────────────────
  const toCSV = (rows, cols) => {
    const header = cols.map(c=>c.label).join(",");
    const body = rows.map(r=>
      cols.map(c=>{
        const v = r[c.key];
        const s = Array.isArray(v) ? v.join("・") : (v==null?"":String(v));
        return `"${s.replace(/"/g,'""')}"`;
      }).join(",")
    ).join("\n");
    return header+"\n"+body;
  };

  const downloadCSV = (content, filename) => {
    const bom = "\uFEFF";
    const blob = new Blob([bom+content], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download=filename; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = (rows, cols, filename) => {
    const header = cols.map(c=>`<th>${c.label}</th>`).join("");
    const body = rows.map(r=>
      "<tr>"+cols.map(c=>{
        const v=r[c.key];
        const s=Array.isArray(v)?v.join("・"):(v==null?"":String(v));
        return `<td>${s}</td>`;
      }).join("")+"</tr>"
    ).join("");
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="UTF-8"/></head><body><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></body></html>`;
    const blob = new Blob([html], {type:"application/vnd.ms-excel;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download=filename; a.click();
    URL.revokeObjectURL(url);
  };

  const FARM_COLS = [
    {key:"id",label:"ID"},{key:"name",label:"名称"},{key:"region",label:"都道府県"},
    {key:"location",label:"エリア"},{key:"farm_type",label:"区分"},{key:"status",label:"ステータス"},
    {key:"area_label",label:"面積"},{key:"rent_label",label:"賃料"},
    {key:"water_source",label:"水源"},{key:"access_info",label:"アクセス"},
    {key:"crops",label:"作物"},{key:"tags",label:"タグ"},{key:"description",label:"説明"},
    {key:"score_water",label:"水源スコア"},{key:"score_sun",label:"日照スコア"},
    {key:"score_soil",label:"土質スコア"},{key:"score_climate",label:"気候スコア"},
    {key:"score_access",label:"アクセススコア"},{key:"is_premium",label:"プレミアム"},
    {key:"chiban",label:"番地"},{key:"nosin_ku",label:"農振区域区分"},{key:"chimoku",label:"地目"},
    {key:"lat",label:"緯度"},{key:"lng",label:"経度"},{key:"created_at",label:"登録日時"},
  ];
  const HOUSE_COLS = [
    {key:"id",label:"ID"},{key:"name",label:"名称"},{key:"region",label:"都道府県"},
    {key:"location",label:"エリア"},{key:"house_type",label:"種別"},{key:"status",label:"ステータス"},
    {key:"area_label",label:"面積"},{key:"rent_label",label:"賃料"},
    {key:"description",label:"説明"},{key:"subsidy_info",label:"補助金情報"},
    {key:"tags",label:"タグ"},{key:"lat",label:"緯度"},{key:"lng",label:"経度"},
    {key:"created_at",label:"登録日時"},
  ];
  const INQUIRY_COLS = [
    {key:"id",label:"ID"},{key:"name",label:"お名前"},{key:"email",label:"メール"},
    {key:"target_type",label:"対象種別"},{key:"purpose",label:"目的"},
    {key:"message",label:"メッセージ"},{key:"status",label:"ステータス"},
    {key:"created_at",label:"送信日時"},
  ];
  const USER_COLS = [
    {key:"id",label:"ID"},{key:"name",label:"お名前"},{key:"email",label:"メール"},
    {key:"role",label:"ロール"},{key:"prefecture",label:"都道府県"},
    {key:"is_premium",label:"プレミアム"},{key:"created_at",label:"登録日時"},
  ];

  const handleExport = async(format) => {
    showToast("⏳ データ取得中...");
    const [
      {data:farmsAll},
      {data:housesAll},
      {data:inquiriesAll},
      {data:usersAll},
    ] = await Promise.all([
      supabase.from("farms").select("*").order("created_at",{ascending:false}),
      supabase.from("houses").select("*").order("created_at",{ascending:false}),
      supabase.from("inquiries").select("*").order("created_at",{ascending:false}),
      supabase.from("users").select("*").order("created_at",{ascending:false}),
    ]);
    const date = new Date().toISOString().slice(0,10);
    if(format==="csv") {
      downloadCSV(toCSV(farmsAll||[], FARM_COLS), `farmatch_farms_${date}.csv`);
      setTimeout(()=>downloadCSV(toCSV(housesAll||[], HOUSE_COLS), `farmatch_houses_${date}.csv`), 300);
      setTimeout(()=>downloadCSV(toCSV(inquiriesAll||[], INQUIRY_COLS), `farmatch_inquiries_${date}.csv`), 600);
      setTimeout(()=>downloadCSV(toCSV(usersAll||[], USER_COLS), `farmatch_users_${date}.csv`), 900);
      showToast("✅ CSV 4ファイルをダウンロードしました");
    } else {
      downloadExcel(farmsAll||[], FARM_COLS, `farmatch_farms_${date}.xls`);
      setTimeout(()=>downloadExcel(housesAll||[], HOUSE_COLS, `farmatch_houses_${date}.xls`), 300);
      setTimeout(()=>downloadExcel(inquiriesAll||[], INQUIRY_COLS, `farmatch_inquiries_${date}.xls`), 600);
      setTimeout(()=>downloadExcel(usersAll||[], USER_COLS, `farmatch_users_${date}.xls`), 900);
      showToast("✅ Excel 4ファイルをダウンロードしました");
    }
  };

  const tableItems = tab==="farms"?farms:tab==="houses"?houses:[];

  const stats = [
    {label:"掲載農地数", value:`${farms.length}件`, color:C.green, icon:"🌱"},
    {label:"掲載物件数", value:`${houses.length}件`, color:C.soil, icon:"🏡"},
    {label:"プレミアム農地", value:`${farms.filter(f=>f.is_premium).length}件`, color:"#8B5CF6", icon:"⭐"},
    {label:"貸出可能", value:`${farms.filter(f=>f.status==="貸出可能").length}件`, color:C.sky, icon:"✅"},
  ];

  const ScoreInput = ({label, field}) => (
    <div style={{ marginBottom:8 }}>
      <label style={{ fontSize:11, color:C.muted, display:"block", marginBottom:4 }}>{label}</label>
      <div style={{ display:"flex", gap:6 }}>
        {[1,2,3,4,5].map(v=>(
          <button key={v} onClick={()=>setForm({...form,[field]:v})}
            style={{ width:32, height:32, borderRadius:6, border:`2px solid ${form[field]>=v?C.lightGreen:C.border}`,
              background:form[field]>=v?C.lightGreen:"transparent",
              color:form[field]>=v?"#fff":C.muted, cursor:"pointer", fontWeight:700, fontSize:13 }}>{v}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ margin:0, color:C.deepGreen, fontSize:18 }}>⚙️ 管理パネル</h2>
          <p style={{ margin:"4px 0 0", color:C.muted, fontSize:12 }}>農地・物件・問い合わせを管理できます</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>handleExport("csv")}
            style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8,
              padding:"6px 12px", fontSize:12, color:C.green, cursor:"pointer", fontWeight:600 }}>
            📥 CSV
          </button>
          <button onClick={()=>handleExport("excel")}
            style={{ background:C.paleGreen, border:`1px solid #B8D98A`, borderRadius:8,
              padding:"6px 12px", fontSize:12, color:C.green, cursor:"pointer", fontWeight:600 }}>
            📊 Excel
          </button>
          <button onClick={onLogout} style={{ background:"none", border:`1px solid ${C.border}`,
            borderRadius:8, padding:"6px 14px", fontSize:12, color:C.muted, cursor:"pointer" }}>ログアウト</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {stats.map(s=>(
          <div key={s.label} style={{ background:C.white, borderRadius:12, padding:"16px 18px",
            border:`2px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:24 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:11, color:C.muted, marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:2, marginBottom:0, alignItems:"flex-end" }}>
        {[["farms","🌱 農地管理"],["houses","🏡 物件管理"],["inquiries","📬 問い合わせ"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"10px 20px", borderRadius:"8px 8px 0 0",
            border:"none", cursor:"pointer", fontWeight:700, fontSize:13,
            background:tab===t?C.green:C.border, color:tab===t?"#fff":C.muted }}>{l}</button>
        ))}
        {tab!=="inquiries" && (
          <div style={{ marginLeft:"auto" }}>
            <Btn onClick={()=>openAdd(tab==="farms"?"farm":"house")}
              style={{ padding:"8px 16px", fontSize:12 }}>＋ 新規登録</Btn>
          </div>
        )}
      </div>

      {/* Content */}
      {tab==="inquiries" ? (
        <div style={{ background:C.white, borderRadius:"0 8px 8px 8px", border:`2px solid ${C.border}`, padding:20 }}>
          <InquiryManager />
        </div>
      ) : (
        <div style={{ background:C.white, borderRadius:"0 8px 8px 8px", border:`2px solid ${C.border}`, overflow:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:560 }}>
            <thead style={{ background:C.paleGreen }}>
              <tr>{["名称","都道府県","エリア","面積/区分","賃料","ステータス","操作"].map(h=>(
                <th key={h} style={{ padding:"10px 12px", textAlign:"left", color:C.green,
                  fontWeight:700, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {tableItems.map((item,i)=>(
                <tr key={item.id} style={{ background:i%2===0?C.white:C.cream }}>
                  <td style={{ padding:"10px 12px", fontWeight:600, color:C.text }}>
                    {item.name}
                    {item.is_premium && <span style={{ marginLeft:6, fontSize:10, color:C.soil }}>⭐</span>}
                  </td>
                  <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{item.region||"—"}</td>
                  <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>{item.location||"—"}</td>
                  <td style={{ padding:"10px 12px", color:C.muted, fontSize:12 }}>
                    {item.area_label}{(item.farm_type||item.house_type)?` / ${item.farm_type||item.house_type}`:""}</td>
                  <td style={{ padding:"10px 12px", color:C.text }}>{item.rent_label}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <span style={{ background:item.status==="貸出可能"||item.status==="掲載中"?C.lightGreen:C.soil,
                      color:"#fff", borderRadius:6, padding:"2px 9px", fontSize:11, fontWeight:600 }}>
                      {item.status||"掲載中"}</span>
                  </td>
                  <td style={{ padding:"10px 12px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={()=>openEdit(item, tab==="farms"?"farm":"house")}
                        style={{ background:C.paleGreen, border:`1px solid #B8D98A`, color:C.green,
                          borderRadius:6, padding:"3px 10px", fontSize:11, cursor:"pointer" }}>編集</button>
                      <button onClick={()=>handleDelete(tab==="farms"?"farm":"house", item.id)}
                        style={{ background:"none", border:"1px solid #E57373", color:"#E57373",
                          borderRadius:6, padding:"3px 10px", fontSize:11, cursor:"pointer" }}>削除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {tableItems.length===0 && (
                <tr><td colSpan={7} style={{ padding:32, textAlign:"center", color:C.muted }}>
                  登録データがありません
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <Modal onClose={()=>setShowForm(false)}>
          <h3 style={{ margin:"0 0 16px", color:C.green }}>
            {editItem ? "✏️ 編集" : (formType==="farm"?"🌱 農地を登録":"🏡 物件を登録")}
          </h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            {[{key:"name",label:"名称 *",ph:"例：南部農地 D区画",full:true},
              {key:"region",label:"都道府県 *",ph:"例：鹿児島県"},
              {key:"location",label:"エリア名",ph:"例：南薩摩エリア"},
              {key:"area_label",label:"面積",ph:"例：約600㎡"},
              {key:"rent_label",label:"賃料",ph:"例：月額 4,000円"},
              {key:"water_source",label:"水源",ph:"例：井戸・雨水"},
              {key:"access_info",label:"アクセス",ph:"例：最寄り駅より車5分"},
              {key:"chiban",label:"番地",ph:"例：鹿児島県南さつま市加世田○○番地"},
              {key:"lat",label:"緯度",ph:"例：31.178"},
              {key:"lng",label:"経度",ph:"例：130.529"},
            ].map(({key,label,ph,full})=>(
              <div key={key} style={{ gridColumn:full?"1/-1":"auto" }}>
                <label style={{ fontSize:11, color:C.green, fontWeight:600, display:"block", marginBottom:3 }}>{label}</label>
                <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph}
                  style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8,
                    padding:"8px 10px", fontSize:13, boxSizing:"border-box", outline:"none" }}/>
              </div>
            ))}
          </div>

          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, color:C.green, fontWeight:600, display:"block", marginBottom:3 }}>ステータス</label>
            <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}
              style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:13, outline:"none" }}>
              <option>貸出可能</option><option>調整中</option><option>非公開</option><option>掲載中</option>
            </select>
          </div>

          {formType==="farm" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
              <div>
                <label style={{ fontSize:11, color:C.green, fontWeight:600, display:"block", marginBottom:3 }}>農振法の区域区分</label>
                <select value={form.nosin_ku} onChange={e=>setForm({...form,nosin_ku:e.target.value})}
                  style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:13, outline:"none" }}>
                  <option value="">未選択</option>
                  <option>農用地区域</option>
                  <option>農業振興地域内農用地区域外</option>
                  <option>農業振興地域外</option>
                  <option>市街化区域</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, color:C.green, fontWeight:600, display:"block", marginBottom:3 }}>地目（登記）</label>
                <select value={form.chimoku} onChange={e=>setForm({...form,chimoku:e.target.value})}
                  style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8, padding:"8px 10px", fontSize:13, outline:"none" }}>
                  <option value="">未選択</option>
                  <option>田</option>
                  <option>畑</option>
                  <option>山林</option>
                  <option>原野</option>
                  <option>雑種地</option>
                </select>
              </div>
            </div>
          )}

          {formType==="farm" && (
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, color:C.green, fontWeight:600, display:"block", marginBottom:3 }}>作れる作物（読点区切り）</label>
              <input value={form.crops} onChange={e=>setForm({...form,crops:e.target.value})}
                placeholder="例：さつまいも、かぼちゃ、オクラ"
                style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8,
                  padding:"8px 10px", fontSize:13, boxSizing:"border-box", outline:"none" }}/>
            </div>
          )}

          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, color:C.green, fontWeight:600, display:"block", marginBottom:3 }}>タグ（読点区切り）</label>
            <input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})}
              placeholder="例：初心者向け、温暖気候"
              style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8,
                padding:"8px 10px", fontSize:13, boxSizing:"border-box", outline:"none" }}/>
          </div>

          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, color:C.green, fontWeight:600, display:"block", marginBottom:3 }}>概要説明</label>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3}
              style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8,
                padding:"8px 10px", fontSize:13, boxSizing:"border-box", resize:"vertical", outline:"none" }}/>
          </div>

          {formType==="farm" && (
            <div style={{ background:C.paleGreen, borderRadius:8, padding:"12px 14px", marginBottom:12 }}>
              <div style={{ fontSize:11, color:C.green, fontWeight:700, marginBottom:10 }}>農地適性スコア</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <ScoreInput label="水源" field="score_water"/>
                <ScoreInput label="日照" field="score_sun"/>
                <ScoreInput label="土質" field="score_soil"/>
                <ScoreInput label="気候" field="score_climate"/>
                <ScoreInput label="アクセス" field="score_access"/>
              </div>
            </div>
          )}

          {formType==="farm" && (
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <input type="checkbox" id="is_premium" checked={form.is_premium}
                onChange={e=>setForm({...form,is_premium:e.target.checked})}/>
              <label htmlFor="is_premium" style={{ fontSize:13, color:C.text, cursor:"pointer" }}>
                ⭐ プレミアム物件として登録
              </label>
            </div>
          )}

          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="outline" onClick={()=>setShowForm(false)} style={{ flex:1 }}>キャンセル</Btn>
            <Btn onClick={handleSave} style={{ flex:2 }}>{editItem?"更新する":"登録する"}</Btn>
          </div>
        </Modal>
      )}

      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
          background:C.green, color:"#fff", padding:"12px 24px", borderRadius:30,
          fontSize:14, fontWeight:700, zIndex:2000, boxShadow:"0 4px 16px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function ContactModal({ item, onClose }) {
  const [form, setForm] = useState({name:"",email:"",purpose:"",msg:""});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async()=>{
    if(!form.name||!form.email) return;
    setLoading(true);
    const isHouse=!!item.house_type;
    const{error}=await supabase.from("inquiries").insert([{
      target_type:isHouse?"house":"farm",
      farm_id:isHouse?null:item.id,
      house_id:isHouse?item.id:null,
      name:form.name, email:form.email, purpose:form.purpose, message:form.msg, status:"new",
    }]);
    setLoading(false);
    if(error){alert("送信エラー: "+error.message);return;}
    setSent(true);
  };
  return (
    <Modal onClose={onClose}>
      {sent ? (
        <div style={{ textAlign:"center", padding:"20px 0" }}>
          <div style={{ fontSize:48 }}>✅</div>
          <h3 style={{ color:C.green, margin:"12px 0 8px" }}>送信しました</h3>
          <p style={{ color:C.muted, fontSize:13 }}>3〜5営業日以内にご連絡します。</p>
          <Btn onClick={onClose} style={{ marginTop:12 }}>閉じる</Btn>
        </div>
      ) : (
        <>
          <h3 style={{ margin:"0 0 4px", color:C.text }}>問い合わせフォーム</h3>
          <p style={{ fontSize:12, color:C.muted, margin:"0 0 18px" }}>{item.name}</p>
          {[{key:"name",label:"お名前 *",ph:"山田 太郎",type:"text"},
            {key:"email",label:"メールアドレス *",ph:"example@mail.com",type:"email"},
            {key:"purpose",label:"ご利用目的",ph:"本格就農 / 週末農業 / 移住 など",type:"text"}].map(({key,label,ph,type})=>(
            <div key={key} style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, color:C.green, fontWeight:600, display:"block", marginBottom:4 }}>{label}</label>
              <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph}
                style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8,
                  padding:"9px 12px", fontSize:13, boxSizing:"border-box", outline:"none" }}/>
            </div>
          ))}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, color:C.green, fontWeight:600, display:"block", marginBottom:4 }}>メッセージ</label>
            <textarea value={form.msg} onChange={e=>setForm({...form,msg:e.target.value})} rows={3}
              style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8,
                padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"vertical", outline:"none" }}/>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn variant="outline" onClick={onClose} style={{ flex:1 }}>戻る</Btn>
            <Btn onClick={handleSubmit} style={{ flex:2, opacity:loading?0.7:1 }}>
              {loading?"送信中...":"送信する"}
            </Btn>
          </div>
        </>
      )}
    </Modal>
  );
}

function FarmDetail({ farm, onContact, onClose, isPremium }) {
  const suitability={water:farm.score_water,sun:farm.score_sun,soil:farm.score_soil,climate:farm.score_climate,access:farm.score_access};
  return (
    <div style={{ background:C.white, borderRadius:12, border:`2px solid ${C.border}`, padding:22, position:"sticky", top:16 }}>
      <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, fontSize:12, cursor:"pointer", marginBottom:10, padding:0 }}>← 一覧に戻る</button>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div>
          <h3 style={{ margin:"0 0 4px", fontSize:16, color:C.text }}>{farm.name}</h3>
          <div style={{ fontSize:12, color:C.muted }}>📍 {farm.region}　{farm.location}</div>
        </div>
        <span style={{ background:farm.status==="貸出可能"?C.lightGreen:C.soil, color:"#fff", borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700 }}>{farm.status}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 16px", background:C.cream, borderRadius:8, padding:"12px 14px", marginBottom:14 }}>
        {[["面積",farm.area_label],["区分",farm.farm_type],["賃料",farm.rent_label],["水源",farm.water_source],["アクセス",farm.access_info]].map(([k,v])=>(
          <div key={k}><div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>{k}</div><div style={{ fontSize:13, fontWeight:600, color:C.text }}>{v||"—"}</div></div>
        ))}
      </div>
      {farm.crops?.length>0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.green, marginBottom:6 }}>作れる作物</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{farm.crops.map(c=><Tag key={c}>{CROP_EMOJI[c]||"🌱"} {c}</Tag>)}</div>
        </div>
      )}
      {Object.values(suitability).some(v=>v) && (
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.green, marginBottom:8 }}>農地適性スコア</div>
          {Object.entries(suitability).map(([k,v])=>v?(
            <div key={k} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <div style={{ width:52, fontSize:11, color:C.muted }}>{SL[k]}</div>
              <ScoreBar value={v}/>
              <div style={{ fontSize:11, color:C.green, fontWeight:600 }}>{v}/5</div>
            </div>
          ):null)}
        </div>
      )}
      {farm.is_premium&&!isPremium ? (
        <div style={{ background:C.soilLight, border:`1px solid ${C.soilBorder}`, borderRadius:8, padding:"12px 14px", marginBottom:14, textAlign:"center" }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.soil, marginBottom:4 }}>🔒 プレミアム限定情報</div>
          <p style={{ fontSize:12, color:C.muted, margin:"0 0 10px" }}>詳細情報はプレミアム会員のみ閲覧できます</p>
          <Btn style={{ background:C.soil, width:"100%", textAlign:"center" }}>プレミアム会員に登録（¥1,480/月）</Btn>
        </div>
      ) : (
        <p style={{ fontSize:13, color:C.muted, lineHeight:1.7, marginBottom:14 }}>{farm.description}</p>
      )}
      <Btn onClick={()=>onContact(farm)} style={{ width:"100%", textAlign:"center" }}>この農地に問い合わせる</Btn>
    </div>
  );
}

function HousingView({ houses, onContact, onMapFocus }) {
  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,#7B4F1A,${C.soil})`, borderRadius:12, padding:"18px 20px", color:"#fff", marginBottom:20 }}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>🏡 移住サポート情報</div>
        <p style={{ fontSize:12, margin:"0 0 12px", opacity:0.92, lineHeight:1.6 }}>農地とセットで住まいを探せます。補助金情報も一括確認できます。</p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {["都道府県移住支援金 最大100万円","市区町村補助金 最大50万円","空き家改修補助 最大30万円"].map(s=>(
            <span key={s} style={{ background:"rgba(255,255,255,0.2)", borderRadius:20, padding:"4px 12px", fontSize:11 }}>{s}</span>
          ))}
        </div>
      </div>
      {houses.map(h=>(
        <div key={h.id} style={{ background:C.white, border:`2px solid ${C.border}`, borderRadius:12, padding:"18px 20px", marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>🏡 {h.name}</div>
              <div style={{ fontSize:12, color:C.muted }}>📍 {h.region} {h.location}　📐 {h.area_label}　💴 {h.rent_label}　🏠 {h.house_type}</div>
            </div>
            <button onClick={()=>onMapFocus(`house-${h.id}`)} style={{ background:C.paleGreen, border:`1px solid #B8D98A`, borderRadius:6, padding:"4px 10px", fontSize:11, color:C.green, cursor:"pointer", fontWeight:600, whiteSpace:"nowrap" }}>🗺 地図</button>
          </div>
          <p style={{ fontSize:13, color:C.muted, margin:"0 0 10px", lineHeight:1.6 }}>{h.description}</p>
          {h.subsidy_info && <div style={{ background:C.paleGreen, borderRadius:6, padding:"8px 12px", fontSize:12, color:C.green, marginBottom:10, fontWeight:500 }}>💰 {h.subsidy_info}</div>}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>{(h.tags||[]).map(t=><Tag key={t}>{t}</Tag>)}</div>
          <Btn onClick={()=>onContact(h)} style={{ width:"100%", textAlign:"center" }}>この物件に問い合わせる</Btn>
        </div>
      ))}
      {houses.length===0 && (
        <div style={{ textAlign:"center", padding:40, color:C.muted }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🏡</div><div>物件情報を準備中です。</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab]             = useState("farms");
  const [page, setPage]           = useState("main");
  const [farms, setFarms]         = useState([]);
  const [houses, setHouses]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [contact, setContact]     = useState(null);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("すべて");
  const [mapFocus, setMapFocus]   = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);

  // ── Auth state ──────────────────────────────────────────
  const [user, setUser]           = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showAuth, setShowAuth]   = useState(false);

  // セッション監視
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user ?? null);
      if(session?.user) fetchProfile(session.user.id);
    });
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((_event, session)=>{
      setUser(session?.user ?? null);
      if(session?.user) fetchProfile(session.user.id);
      else { setUserProfile(null); setIsPremium(false); }
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const fetchProfile = async(uid)=>{
    const { data } = await supabase.from("users").select("*").eq("id", uid).single();
    if(data){
      setUserProfile(data);
      setIsPremium(data.is_premium || false);
    } else {
      // usersテーブルにレコードがなければ作成（Auth登録直後のフォールバック）
      const { data:{ user } } = await supabase.auth.getUser();
      if(user) {
        const meta = user.user_metadata || {};
        await supabase.from("users").upsert([{
          id: uid,
          email: user.email,
          name: meta.name || "",
          role: meta.role || "seeker",
          is_premium: false,
        }]);
        setUserProfile({ id: uid, email: user.email, name: meta.name || "", role: meta.role || "seeker", is_premium: false });
      }
    }
  };

  const handleLogout = async()=>{
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setIsPremium(false);
  };

  const fetchData = async()=>{
    setLoading(true);
    const[{data:farmsData},{data:housesData}]=await Promise.all([
      supabase.from("farms").select("*").neq("status","非公開").order("created_at",{ascending:false}),
      supabase.from("houses").select("*").neq("status","非公開").order("created_at",{ascending:false}),
    ]);
    setFarms(farmsData||[]);
    setHouses(housesData||[]);
    setLoading(false);
  };
  useEffect(()=>{ fetchData(); },[]);

  const TABS=[
    {id:"farms",label:"🌱 農地"},
    {id:"housing",label:"🏡 住まい"},
    {id:"map",label:"🗺 地図"},
    {id:"calendar",label:"🗓 カレンダー"},
    {id:"pricing",label:"💰 料金"},
    {id:"admin",label:"⚙️ 管理"},
  ];

  const filteredFarms=farms.filter(f=>{
    const mf=filter==="すべて"||f.status===filter||f.farm_type===filter;
    const ms=!search||(f.crops||[]).some(c=>c.includes(search))||
      f.name.includes(search)||(f.tags||[]).some(t=>t.includes(search))||
      f.region?.includes(search)||f.location?.includes(search);
    return mf&&ms;
  });

  if(page==="terms") return (
    <div style={{ background:C.cream, minHeight:"100vh", fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif" }}>
      <TermsPage onBack={()=>setPage("main")}/>
    </div>
  );
  if(page==="privacy") return (
    <div style={{ background:C.cream, minHeight:"100vh", fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif" }}>
      <PrivacyPage onBack={()=>setPage("main")}/>
    </div>
  );
  if(page==="specified") return (
    <div style={{ background:C.cream, minHeight:"100vh", fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif" }}>
      <SpecifiedCommercialPage onBack={()=>setPage("main")}/>
    </div>
  );

  // ロールラベル
  const roleLabel = userProfile?.role === "owner" ? "🏡 オーナー" : userProfile?.role === "seeker" ? "🌱 就農希望者" : null;

  return (
    <div style={{ background:C.cream, minHeight:"100vh", fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif" }}>

      {/* Header */}
      <div style={{ background:C.deepGreen }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"14px 20px",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ color:C.lightGreen, fontSize:10, letterSpacing:3, marginBottom:2 }}>FARMATCH JAPAN</div>
            <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>🌱 {BRAND.name}</div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {user ? (
              <>
                {/* ログイン中の表示 */}
                <div style={{ display:"flex", alignItems:"center", gap:6,
                  background:"rgba(255,255,255,0.1)", borderRadius:20, padding:"5px 12px" }}>
                  <span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>
                    {userProfile?.name || user.email}
                  </span>
                  {roleLabel && (
                    <span style={{ background:"rgba(255,255,255,0.2)", color:C.lightGreen,
                      borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:600 }}>
                      {roleLabel}
                    </span>
                  )}
                </div>
                {isPremium ? (
                  <span style={{ background:C.soil, color:"#fff", borderRadius:20, padding:"5px 14px", fontSize:11, fontWeight:700 }}>⭐ プレミアム</span>
                ) : (
                  <button onClick={()=>setIsPremium(true)} style={{ background:C.soil, color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:11, fontWeight:700, cursor:"pointer" }}>プレミアム登録</button>
                )}
                <button onClick={handleLogout}
                  style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"1px solid rgba(255,255,255,0.2)", borderRadius:20, padding:"5px 14px", fontSize:11, cursor:"pointer" }}>
                  ログアウト
                </button>
              </>
            ) : (
              <>
                {/* 未ログイン */}
                <button onClick={()=>setShowAuth(true)}
                  style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", borderRadius:20, padding:"6px 16px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  ログイン / 登録
                </button>
              </>
            )}
            <button onClick={()=>setTab("admin")}
              style={{ background:"rgba(255,255,255,0.1)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:11, cursor:"pointer" }}>管理者</button>
          </div>
        </div>
      </div>

      {/* Hero */}
      {tab==="farms" && (
        <div style={{ background:`linear-gradient(135deg,${C.green},${C.deepGreen})`, padding:"28px 20px", textAlign:"center" }}>
          <div style={{ color:"#D4EDAA", fontSize:11, letterSpacing:3, marginBottom:8 }}>{BRAND.sub}</div>
          <h1 style={{ color:"#fff", fontSize:26, margin:"0 0 6px", fontWeight:800, lineHeight:1.3 }}>{BRAND.tagline}</h1>
          <p style={{ color:"#B8D98A", fontSize:13, margin:"0 0 20px" }}>遊休農地を活かし、新しい農業の担い手へつなぐ</p>
          <div style={{ maxWidth:420, margin:"0 auto" }}>
            <input placeholder="都道府県・作物・キーワードで検索" value={search} onChange={e=>setSearch(e.target.value)}
              style={{ width:"100%", padding:"12px 20px", borderRadius:30, border:"none", fontSize:14, boxSizing:"border-box", outline:"none" }}/>
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{ background:C.white, borderBottom:`2px solid ${C.border}`, overflowX:"auto" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"12px 18px", border:"none", background:"transparent",
              color:tab===t.id?C.green:C.muted, fontWeight:tab===t.id?700:400,
              fontSize:13, cursor:"pointer", whiteSpace:"nowrap",
              borderBottom:tab===t.id?`3px solid ${C.green}`:"3px solid transparent" }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"20px 16px" }}>
        {loading && (
          <div style={{ textAlign:"center", padding:60, color:C.muted }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🌱</div>
            <div>データを読み込み中...</div>
          </div>
        )}

        {!loading && tab==="farms" && (
          <>
            <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
              {["すべて","貸出可能","畑","水田・畑"].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{ background:filter===f?C.green:C.white,
                  color:filter===f?"#fff":C.green, border:`1.5px solid ${C.green}`, borderRadius:20,
                  padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:filter===f?700:400 }}>{f}</button>
              ))}
              <span style={{ marginLeft:"auto", fontSize:12, color:C.muted }}>{filteredFarms.length}件表示中</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:selected?"1fr 1fr":"1fr", gap:20 }}>
              <div>
                {filteredFarms.map(farm=>(
                  <div key={farm.id} onClick={()=>setSelected(farm)}
                    style={{ background:selected?.id===farm.id?C.paleGreen:C.white,
                      border:`2px solid ${selected?.id===farm.id?C.lightGreen:C.border}`,
                      borderRadius:12, padding:"16px 18px", marginBottom:12, cursor:"pointer" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>{farm.name}</div>
                        <div style={{ fontSize:12, color:C.muted }}>📍 {farm.region} {farm.location}　📐 {farm.area_label}　🌱 {farm.farm_type}</div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end" }}>
                        <span style={{ background:farm.status==="貸出可能"?C.lightGreen:C.soil, color:"#fff", borderRadius:6, padding:"2px 9px", fontSize:11, fontWeight:600 }}>{farm.status}</span>
                        {farm.is_premium&&<span style={{ background:C.soilLight, border:`1px solid ${C.soilBorder}`, color:C.soil, borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700 }}>⭐ Premium</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:6 }}>{(farm.crops||[]).map(c=><Tag key={c}>{CROP_EMOJI[c]||"🌱"} {c}</Tag>)}</div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{(farm.tags||[]).map(t=><Tag key={t} color={C.soilLight} border={C.soilBorder} text={C.soil}>{t}</Tag>)}</div>
                  </div>
                ))}
                {filteredFarms.length===0 && (
                  <div style={{ textAlign:"center", padding:40, color:C.muted }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                    <div>該当する農地が見つかりませんでした</div>
                  </div>
                )}
                <div style={{ background:`linear-gradient(135deg,${C.soil},#8B5A1A)`, borderRadius:12, padding:"18px 20px", color:"#fff", marginTop:8 }}>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>🏡 農地・物件オーナーの方へ</div>
                  <p style={{ fontSize:12, margin:"0 0 12px", opacity:0.9, lineHeight:1.6 }}>使われていない農地や空き物件を登録して、新しい農業の担い手とつながりましょう。</p>
                  <button onClick={()=>setTab("admin")} style={{ background:"#fff", color:C.soil, border:"none", borderRadius:8, padding:"8px 18px", fontSize:12, fontWeight:700, cursor:"pointer" }}>農地・物件を登録する（無料）</button>
                </div>
              </div>
              {selected && <FarmDetail farm={selected} isPremium={isPremium} onContact={f=>setContact(f)} onClose={()=>setSelected(null)}/>}
            </div>
          </>
        )}

        {!loading && tab==="housing" && <HousingView houses={houses} onContact={h=>setContact(h)} onMapFocus={id=>{ setMapFocus(id); setTab("map"); }}/>}
        {!loading && tab==="map" && (
          <div>
            <MapView farms={farms} houses={houses} focusId={mapFocus} onSelectFarm={f=>{ setSelected(f); setTab("farms"); }} onSelectHouse={()=>setTab("housing")}/>
            <p style={{ fontSize:12, color:C.muted, marginTop:10, lineHeight:1.6 }}>OpenStreetMap による実地図表示。ピンをクリックすると概要が表示されます。</p>
          </div>
        )}
        {tab==="calendar" && <CropCalendar/>}
        {tab==="pricing" && <PricingView/>}
        {!loading && tab==="admin" && (
          adminAuth
            ? <AdminPanel farms={farms} houses={houses} onRefresh={fetchData} onLogout={()=>setAdminAuth(false)}/>
            : <AdminLogin onSuccess={()=>setAdminAuth(true)}/>
        )}
      </div>

      {/* Footer */}
      <div style={{ background:C.deepGreen, color:"#7AB648", textAlign:"center",
        padding:"24px 20px", fontSize:11, marginTop:20, lineHeight:1.8 }}>
        <div style={{ fontWeight:700, fontSize:14, color:C.lightGreen, marginBottom:4 }}>🌱 {BRAND.name}</div>
        <div style={{ marginBottom:10 }}>{BRAND.tagline}</div>
        <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:10, flexWrap:"wrap" }}>
          <button onClick={()=>setPage("terms")} style={{ background:"none", border:"none", color:"#7AB648", cursor:"pointer", fontSize:11, textDecoration:"underline" }}>利用規約</button>
          <button onClick={()=>setPage("privacy")} style={{ background:"none", border:"none", color:"#7AB648", cursor:"pointer", fontSize:11, textDecoration:"underline" }}>プライバシーポリシー</button>
          <button onClick={()=>setPage("specified")} style={{ background:"none", border:"none", color:"#7AB648", cursor:"pointer", fontSize:11, textDecoration:"underline" }}>特定商取引法に基づく表記</button>
          <a href="mailto:support@farmatch.net" style={{ color:"#7AB648", fontSize:11 }}>お問い合わせ</a>
        </div>
        <div style={{ color:"rgba(255,255,255,0.35)" }}>© {BRAND.year} {BRAND.name} — 全国の遊休農地有効活用プロジェクト</div>
      </div>

      {contact && <ContactModal item={contact} onClose={()=>setContact(null)}/>}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={()=>setShowAuth(false)}
          onSuccess={()=>setShowAuth(false)}
        />
      )}
    </div>
  );
}
