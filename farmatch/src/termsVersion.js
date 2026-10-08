// 同意記録（inquiries.terms_version）に保存するバージョン識別子。内容を改定するたびに更新する。
// 2026-10-08時点：通信の秘密対応（本ブランチ）と、mainに別途マージ済みのアクセス解析
// 機能に伴うプライバシーポリシー改定（2026-09-29）を、1回の改定としてまとめて扱う。
export const TERMS_VERSION = "2026-10-08";

// この改定を実際に施行（公開）する日。本番公開日が確定したらここだけ書き換えればよい
// （コードのデプロイ日と規約上の施行日が一致するとは限らないため、両者を分離する）。
// 上記のとおり仮値なので、実際にmainへマージ・本番公開する直前に公開予定日と
// 一致しているか必ず確認し、必要なら書き換えること。
export const TERMS_EFFECTIVE_DATE = "2026-10-08";

export function formatJaDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}
