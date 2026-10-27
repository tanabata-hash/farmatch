// ライフスタイル提案機能の定義（関わり方・診断）
// 関わり方タグは既存の farms.tags / houses.tags に規定の文字列として保存する（DB変更不要）。

export const LIFESTYLE_STYLES = [
  { id:"weekend",     icon:"🌿", name:"ゆるっと週末", tag:"週末のみOK",
    summary:"月2〜4回、数時間だけ。平日は仕事、週末だけ土に触れたい人に。",
    day:"土曜の朝に現地へ。草取りと収穫を2〜3時間、そのまま昼食を食べて帰る。" },
  { id:"together",    icon:"👥", name:"みんなで耕す", tag:"共同耕作OK",
    summary:"3〜8人で1区画を分担。種まき担当・草刈り担当・収穫担当など、できる部分だけ受け持てます。",
    day:"集合して今日の担当を確認。得意な人が畝立て、初心者は種まきや水やり。" },
  { id:"slow",        icon:"🍃", name:"Slow Life", tag:"Slow Life向き",
    summary:"収量や売上を追わず、自分のペースで育て、暮らす。",
    day:"朝は畑を眺めながらお茶。天気と体調に合わせて、できる作業だけ。" },
  { id:"trial",       icon:"🏡", name:"お試し移住", tag:"お試しOK",
    summary:"住まいと農地をセットで短期体験。移住前に暮らしを確かめられます。",
    day:"数日〜数週間滞在し、地域の人と畑仕事。暮らしの様子を確かめる。" },
  { id:"family",      icon:"👨‍👩‍👧", name:"親子で体験", tag:"親子歓迎",
    summary:"季節ごとの収穫・体験が中心。子どもと一緒に畑を楽しめます。",
    day:"芋掘りや収穫を親子で。土に触れ、採れたてを味わう半日。" },
  { id:"restoration", icon:"🌾", name:"開墾・再生", tag:"開墾・再生",
    summary:"長年放置された荒れ農地を、仲間と少しずつ整えて使える状態に戻す。",
    day:"草刈りや石拾いを仲間と。before/afterを記録しながら少しずつ畑に戻す。" },
  { id:"farming",     icon:"🚜", name:"本格就農", tag:"本格就農向き",
    summary:"農業を仕事として始めたい人に。まとまった広さの農地や、新規就農の相談につながる農地を探せます。",
    day:"朝から畑で作業し、販路や栽培計画を整える。地域の農家や就農相談窓口とも連携して経営を軌道に乗せる。" },
];

// 一覧の絞り込みに使うタグ一覧（オーナー向けの入力ヒントにも使用）
export const LIFESTYLE_TAGS = [...LIFESTYLE_STYLES.map(s => s.tag), "道具貸出あり"];

// 診断（5問）。選択肢ごとに各スタイルへ加点する。
export const LIFESTYLE_QUIZ = [
  { q:"農に関われる時間は？",
    options:[
      { label:"週末の数時間だけ", score:{ weekend:3, together:1 } },
      { label:"平日も含め、まとまった時間がある", score:{ slow:2, restoration:2, trial:1, farming:2 } },
      { label:"休みの日に家族と", score:{ family:3, weekend:1 } },
    ]},
  { q:"誰と取り組みたい？",
    options:[
      { label:"仲間と分担したい", score:{ together:3, restoration:1 } },
      { label:"自分のペースで一人で", score:{ slow:3 } },
      { label:"家族と一緒に", score:{ family:3 } },
    ]},
  { q:"農業で一番大事にしたいのは？",
    options:[
      { label:"無理なく続けること", score:{ slow:3, weekend:1 } },
      { label:"地域や仲間とのつながり", score:{ together:2, restoration:2 } },
      { label:"まず体験して確かめること", score:{ trial:3, family:1 } },
      { label:"農業を仕事にして収入を得ること", score:{ farming:4 } },
    ]},
  { q:"体を動かす作業は？",
    options:[
      { label:"しっかり動きたい", score:{ restoration:3, together:1, farming:1 } },
      { label:"軽めの作業がいい", score:{ slow:2, weekend:2 } },
      { label:"収穫など楽しい作業中心", score:{ family:2, trial:2 } },
    ]},
  { q:"移住や暮らしの変化について",
    options:[
      { label:"移住も検討している", score:{ trial:3, slow:1, farming:1 } },
      { label:"移住・転職して就農したい", score:{ farming:4, trial:1 } },
      { label:"今の暮らしのまま関わりたい", score:{ weekend:3 } },
      { label:"まだ決めていない", score:{ trial:1, together:1, slow:1 } },
    ]},
];

export function scoreQuiz(answers) {
  const total = {};
  answers.forEach((optIdx, qIdx) => {
    const opt = LIFESTYLE_QUIZ[qIdx]?.options[optIdx];
    if (!opt) return;
    Object.entries(opt.score).forEach(([k, v]) => { total[k] = (total[k] || 0) + v; });
  });
  return LIFESTYLE_STYLES
    .map(s => ({ style: s, score: total[s.id] || 0 }))
    .sort((a, b) => b.score - a.score);
}
