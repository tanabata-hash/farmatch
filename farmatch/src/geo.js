// スマホで「写真を撮って場所を登録」するための共通ヘルパー。
// ・端末の現在地（GPS）の取得
// ・緯度経度から都道府県・市区町村名への変換（逆ジオコーディング）
// ・写真の縮小・JPEG化（通信量とアップロード上限の対策）
//
// 写真の位置情報（EXIF）には頼らない。ブラウザ経由で選んだ写真は位置情報が
// 削除されていることが多く、また当サービスは保存時にEXIFを必ず削除するため、
// 撮影時に端末のGPSから直接取得した座標を使う。

// ── 現在地の取得 ───────────────────────────────────
export function getCurrentPosition({ timeout = 15000, maximumAge = 30000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("この端末では位置情報を利用できません。地図をタップして場所を指定してください。"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      (err) => {
        const message =
          err.code === 1 ? "位置情報の利用が許可されていません。端末の設定で、このサイトの位置情報を許可してください。"
          : err.code === 3 ? "位置情報の取得に時間がかかりました。屋外で、もう一度お試しください。"
          : "位置情報を取得できませんでした。地図をタップして場所を指定してください。";
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout, maximumAge }
    );
  });
}

// ── 逆ジオコーディング（緯度経度 → 都道府県・市区町村） ──────────
const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

async function fetchJson(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// 都道府県名と市区町村名を返す。取得できなければnull。
// 主：OpenStreetMap Nominatim（行政界のポリゴンで判定するため境界付近でも正確）
// 予備：HeartRails Geo API（無料・キー不要）
export async function reverseGeocode(lat, lng) {
  try {
    const d = await fetchJson(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=ja&lat=${lat}&lon=${lng}`
    );
    const a = d?.address || {};
    // 東京都など、provinceが返らない場合はISOコード（JP-13等）から補う
    const isoNo = parseInt(String(a["ISO3166-2-lvl4"] || "").replace("JP-", ""), 10);
    const region = a.province || a.state || PREFECTURES[isoNo - 1] || "";
    const location = a.city || a.town || a.village || a.municipality || "";
    if (region && location) return { region, location };
  } catch {
    // 予備のサービスに切り替える
  }
  try {
    const d = await fetchJson(
      `https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&x=${lng}&y=${lat}`
    );
    const hit = d?.response?.location?.[0];
    if (hit?.prefecture && hit?.city) return { region: hit.prefecture, location: hit.city };
  } catch {
    // 取得できなかった場合は手入力にしてもらう
  }
  return null;
}

// ── 写真の縮小・JPEG化 ────────────────────────────
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("画像を読み込めませんでした。別の写真でお試しください。")); };
    img.src = url;
  });
}

// スマホで撮った写真は数MB〜10MB超になるため、長辺1600pxのJPEGに縮小してから送る。
// canvasに描き直すことで、向き（EXIFの回転情報）は反映され、位置情報等のEXIFも付かない。
export async function compressImage(file, { maxSide = 1600, quality = 0.82 } = {}) {
  const img = await loadImage(file);
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; // 透過PNGがJPEG化で黒くならないように
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("画像の変換に失敗しました。別の写真でお試しください。");
  const baseName = (file.name || "photo").replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
