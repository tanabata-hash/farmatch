// 同意記録（inquiries.terms_version）に保存するバージョン識別子。内容を改定するたびに更新する。
export const TERMS_VERSION = "2026-10-01";

// この改定を実際に施行（公開）する日。本番公開日が確定したらここだけ書き換えればよい
// （コードのデプロイ日と規約上の施行日が一致するとは限らないため、両者を分離する）。
export const TERMS_EFFECTIVE_DATE = "2026-10-01";

export function formatJaDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}
