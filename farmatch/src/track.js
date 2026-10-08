// 簡易アクセス計測（自社DBのみに記録。Cookieは使わず、IPアドレスも保存しない）
// - ブラウザの「トラッキング拒否(DNT/GPC)」設定がオンの場合は記録しない
// - 管理者端末は記録しない（管理画面ログイン時に自動で除外）

const OPT_OUT_KEY = "fm_no_track";
const SID_KEY = "fm_sid";
const REF_SENT_KEY = "fm_ref_sent";

export function isTrackingExcluded() {
  try { return localStorage.getItem(OPT_OUT_KEY) === "1"; } catch { return false; }
}

export function setTrackingExcluded(excluded) {
  try {
    if (excluded) localStorage.setItem(OPT_OUT_KEY, "1");
    else localStorage.removeItem(OPT_OUT_KEY);
  } catch { /* 保存できない環境では何もしない */ }
}

function sessionId() {
  let sid = sessionStorage.getItem(SID_KEY);
  if (!sid) {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    sid = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
    sessionStorage.setItem(SID_KEY, sid);
  }
  return sid;
}

export function trackView(view) {
  try {
    if (!view || view === "admin") return;
    if (new URLSearchParams(window.location.search).has("admin")) return;
    if (isTrackingExcluded()) return;
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl) return;
    if (navigator.webdriver) return;

    // 参照元はセッション最初の1回だけ送る（サイト内移動では送らない）
    let ref = "";
    if (!sessionStorage.getItem(REF_SENT_KEY)) {
      ref = document.referrer || "";
      sessionStorage.setItem(REF_SENT_KEY, "1");
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ view, path: window.location.pathname, ref, sid: sessionId() }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* 計測の失敗でサイトの動作に影響を与えない */ }
}
