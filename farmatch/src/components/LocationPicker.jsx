import { useEffect, useRef, useState } from "react";
import { C } from "../theme";

// ── 位置の指定（住所からの自動検索＋地図クリックでの微調整） ──────────
// 農地オーナーが緯度・経度の数値を自分で調べなくても済むようにするための部品。
// ・「住所から探す」：国土地理院の住所検索APIで、入力済みの住所からおおよその位置を取得
// ・地図をクリック／ピンをドラッグ：正確な場所に微調整
// 公開時は別途ずらした座標を表示するため、おおよその位置で十分。

const GSI_SEARCH = "https://msearch.gsi.go.jp/address-search/AddressSearch?q=";

function loadLeaflet(onReady) {
  if (window.L) { onReady(); return; }
  if (!document.getElementById("leaflet-css")) {
    const link = document.createElement("link");
    link.id = "leaflet-css"; link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
  }
  const existing = document.getElementById("leaflet-js");
  if (existing) { existing.addEventListener("load", onReady); return; }
  const script = document.createElement("script");
  script.id = "leaflet-js";
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
  script.onload = onReady;
  document.body.appendChild(script);
}

export function LocationPicker({ region, location, chiban, lat, lng, onChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const hasPoint = !!(lat && lng);

  const setPoint = (newLat, newLng) => {
    onChange(newLat.toFixed(6), newLng.toFixed(6));
  };

  // 地図の初期化
  useEffect(() => {
    let cancelled = false;
    loadLeaflet(() => {
      if (cancelled) return;
      const L = window.L;
      const el = containerRef.current;
      if (!L || !el || mapRef.current) return;
      const startLat = parseFloat(lat) || 36.2048;   // 未設定時は日本全体
      const startLng = parseFloat(lng) || 138.2529;
      const map = L.map(el, { scrollWheelZoom: false }).setView([startLat, startLng], hasPoint ? 15 : 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 18,
      }).addTo(map);
      map.on("click", (e) => setPoint(e.latlng.lat, e.latlng.lng));
      mapRef.current = map;
      if (hasPoint) {
        markerRef.current = L.marker([startLat, startLng], { draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const p = markerRef.current.getLatLng();
          setPoint(p.lat, p.lng);
        });
      }
      setTimeout(() => map.invalidateSize(), 200);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markerRef.current = null; }
    };
    // 初期化は一度だけ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 座標が変わったらピンを移動
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map || !hasPoint) return;
    const p = [parseFloat(lat), parseFloat(lng)];
    if (isNaN(p[0]) || isNaN(p[1])) return;
    if (markerRef.current) {
      markerRef.current.setLatLng(p);
    } else {
      markerRef.current = L.marker(p, { draggable: true }).addTo(map);
      markerRef.current.on("dragend", () => {
        const q = markerRef.current.getLatLng();
        setPoint(q.lat, q.lng);
      });
    }
    if (map.getZoom() < 13) map.setView(p, 15); else map.panTo(p);
  }, [lat, lng, hasPoint]);

  // 住所からおおよその位置を検索
  const searchByAddress = async () => {
    const query = [region, location, chiban].map(v => (v || "").trim()).filter(Boolean).join("");
    if (!query) { setMessage("先に都道府県・エリア名（市町村）を入力してください。"); return; }
    setSearching(true); setMessage("");
    try {
      const res = await fetch(GSI_SEARCH + encodeURIComponent(query));
      const data = await res.json();
      const hit = Array.isArray(data) ? data[0] : null;
      const coords = hit?.geometry?.coordinates;
      if (!coords) {
        setMessage("住所から位置を特定できませんでした。地図をクリックして指定してください。");
      } else {
        setPoint(coords[1], coords[0]);
        setMessage("おおよその位置を表示しました。地図をクリック、またはピンをドラッグして調整してください。");
      }
    } catch {
      setMessage("住所検索に失敗しました。地図をクリックして指定してください。");
    }
    setSearching(false);
  };

  return (
    <div style={{ marginBottom:12 }}>
      <label style={{ fontSize:11, color:C.green, fontWeight:600, display:"block", marginBottom:4 }}>
        場所（地図でのおおよその位置）
      </label>
      <p style={{ fontSize:11, color:C.muted, margin:"0 0 8px", lineHeight:1.6 }}>
        「住所から探す」を押すと、入力済みの住所からおおよその位置を表示します。
        そのあと<strong>地図をクリック、またはピンをドラッグ</strong>して、農地のある場所に合わせてください。
        公開ページでは、防犯のため実際の位置から少しずらして表示されます。
      </p>

      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
        <button type="button" onClick={searchByAddress} disabled={searching}
          style={{ background:C.paleGreen, color:C.green, border:`1.5px solid ${C.lightGreen}`,
            borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
          {searching ? "検索中..." : "📍 住所から探す"}
        </button>
        {hasPoint && (
          <>
            <span style={{ fontSize:11, color:C.muted }}>
              指定済み（{parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}）
            </span>
            <button type="button" onClick={()=>{ onChange("", ""); setMessage(""); }}
              style={{ background:"none", border:"none", color:C.muted, fontSize:11,
                textDecoration:"underline", cursor:"pointer" }}>
              クリア
            </button>
          </>
        )}
        {!hasPoint && <span style={{ fontSize:11, color:"#B5541C" }}>未指定（地図に表示されません）</span>}
      </div>

      <div ref={containerRef}
        style={{ width:"100%", height:240, borderRadius:10, border:`1px solid ${C.border}`, overflow:"hidden" }} />

      {message && <p style={{ fontSize:11, color:C.muted, margin:"8px 0 0", lineHeight:1.6 }}>{message}</p>}
    </div>
  );
}
