import React, { useState, useEffect } from "react";
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

// ── 自治体支援情報データ ──────────────────────────────────
const SUBSIDY_DATA = {
  "鹿児島県": {
    "_pref": [
      { icon:"💰", label:"就農支援金", detail:"新規就農者向け経営開始資金（最大150万円/年・最長3年）", tag:"就農支援" },
      { icon:"🏡", label:"移住支援金", detail:"県外からの移住者に最大100万円（単身50万円）", tag:"移住" },
    ],
    "南さつま市": [
      { icon:"🌱", label:"農業次世代投資資金", detail:"青年就農者に年間最大150万円を最長5年間交付", tag:"青年就農" },
      { icon:"🏠", label:"空き家改修補助", detail:"空き家バンク登録物件の改修費用を最大50万円補助", tag:"住まい" },
      { icon:"📚", label:"農業研修制度", detail:"就農前の研修期間中に月10万円の研修支援金", tag:"研修" },
    ],
    "南九州市": [
      { icon:"💰", label:"就農奨励金", detail:"市内で新規就農した方に最大30万円を一括交付", tag:"就農支援" },
      { icon:"🚜", label:"農機具購入補助", detail:"農業機械・施設の導入費用を1/2以内・上限100万円補助", tag:"農機具" },
    ],
    "鹿児島市": [
      { icon:"🌾", label:"農地集積支援", detail:"農地中間管理機構を通じた賃借に協力金を交付", tag:"農地集積" },
    ],
    "指宿市": [
      { icon:"💰", label:"新規就農者支援", detail:"就農初期の経営安定化のため最大100万円を補助", tag:"就農支援" },
      { icon:"♨️", label:"温泉熱活用補助", detail:"温泉熱を活用したハウス栽培導入費用を補助", tag:"特産支援" },
    ],
    "垂水市": [
      { icon:"🐄", label:"畜産振興補助", detail:"畜産農家の施設整備・機械導入を最大200万円補助", tag:"畜産" },
      { icon:"🏠", label:"定住促進補助", detail:"市外からの転入者に住宅取得・改修費を最大50万円補助", tag:"住まい" },
    ],
    "曽於市": [
      { icon:"🚜", label:"農業機械導入支援", detail:"新規就農者の農業機械購入費用を1/3・上限50万円補助", tag:"農機具" },
    ],
    "霧島市": [
      { icon:"🌱", label:"新規就農支援", detail:"認定新規就農者に経営開始資金として最大150万円", tag:"就農支援" },
      { icon:"🏡", label:"移住定住補助", detail:"市外からの移住者に住宅改修費最大30万円補助", tag:"移住" },
    ],
    "薩摩川内市": [
      { icon:"💡", label:"スマート農業支援", detail:"IoT・ドローン等スマート農業機器の導入費を1/2補助", tag:"スマート農業" },
    ],
    "中種子町": [
      { icon:"🚀", label:"種子島移住支援", detail:"UIターン者に最大50万円の定住促進補助金", tag:"移住" },
      { icon:"🌱", label:"新規就農応援金", detail:"農業経営開始から3年以内の方に年間最大30万円", tag:"就農支援" },
    ],
    "志布志市": [
      { icon:"🌊", label:"畜産・農業複合支援", detail:"畜産と農業の複合経営者向けに施設整備費を最大1/2補助", tag:"複合経営" },
      { icon:"🏠", label:"移住定住促進補助", detail:"市外からの転入者に住宅購入・改修費を最大100万円補助", tag:"住まい" },
    ],
    "鹿屋市": [
      { icon:"💰", label:"農業担い手育成補助", detail:"新規就農者の農業機械・施設整備に最大100万円", tag:"就農支援" },
      { icon:"🚜", label:"スマート農業推進", detail:"ドローン・センサー等スマート農業機器導入費を1/2補助", tag:"スマート農業" },
    ],
    "大崎町": [
      { icon:"♻️", label:"循環型農業支援", detail:"有機農業・資源循環型農業への転換費用を最大50万円補助", tag:"有機農業" },
      { icon:"🌱", label:"新規就農者奨励金", detail:"UIターン就農者に最大20万円の奨励金を交付", tag:"就農支援" },
    ],
    "枕崎市": [
      { icon:"🐟", label:"農漁業複合支援", detail:"農業と漁業の複合経営者に施設整備費を補助", tag:"複合経営" },
      { icon:"🏠", label:"定住促進住宅補助", detail:"市内への転入者に住宅改修費最大30万円を補助", tag:"住まい" },
    ],
  },
  "宮崎県": {
    "_pref": [
      { icon:"💰", label:"みやざき農業経営支援", detail:"新規就農者経営開始資金として最大150万円/年（最長3年）", tag:"就農支援" },
      { icon:"🏡", label:"宮崎移住支援金", detail:"東京圏等からの移住者に最大100万円", tag:"移住" },
    ],
    "宮崎市": [
      { icon:"🌱", label:"農業後継者育成支援", detail:"農業後継者の研修費・資格取得費を最大30万円補助", tag:"研修" },
    ],
    "都城市": [
      { icon:"🥩", label:"畜産クラスター補助", detail:"畜産の規模拡大・施設整備に最大1/2補助", tag:"畜産" },
      { icon:"💰", label:"新規就農支援", detail:"新規就農者に最大150万円の経営開始資金を交付", tag:"就農支援" },
    ],
    "延岡市": [
      { icon:"🌊", label:"農水連携支援", detail:"農業と水産業の複合経営者に最大50万円補助", tag:"複合経営" },
    ],
    "小林市": [
      { icon:"🌿", label:"高原野菜振興補助", detail:"高原野菜の産地形成に向けた施設整備費を1/2補助", tag:"野菜" },
      { icon:"🏠", label:"移住者住宅補助", detail:"市外からの転入者に住宅改修費最大50万円補助", tag:"住まい" },
    ],
  },
  "群馬県": {
    "_pref": [
      { icon:"💰", label:"ぐんま農業次世代支援", detail:"新規就農者に経営開始資金最大150万円/年・3年間", tag:"就農支援" },
      { icon:"🏡", label:"ぐんま移住支援金", detail:"東京圏からの移住・就業で最大100万円", tag:"移住" },
    ],
    "前橋市": [
      { icon:"🌿", label:"有機農業転換支援", detail:"有機農業への転換費用を最大50万円補助", tag:"有機農業" },
      { icon:"🚜", label:"スマート農業推進", detail:"農業用ドローン・センサー導入に1/2・上限100万円", tag:"スマート農業" },
    ],
    "高崎市": [
      { icon:"💰", label:"新規就農者補助", detail:"認定新規就農者に最大30万円の一時金を交付", tag:"就農支援" },
    ],
    "沼田市": [
      { icon:"🍎", label:"果樹産地振興補助", detail:"りんご・なし等果樹の新規栽培開始に最大100万円", tag:"果樹" },
      { icon:"🏠", label:"移住定住補助", detail:"市外からの転入者に住宅取得費最大50万円補助", tag:"住まい" },
    ],
  },
};

// 農地の都道府県・市区町村に対応する支援情報を取得
function getSubsidies(farm) {
  const prefData = SUBSIDY_DATA[farm.region];
  if (!prefData) return { pref: [], local: [], localName: null };
  const pref = prefData["_pref"] || [];
  const localKey = Object.keys(prefData).find(k =>
    k !== "_pref" && (farm.location?.includes(k) || farm.name?.includes(k))
  );
  const local = localKey ? prefData[localKey] : [];
  return { pref, local, localName: localKey || null };
}

// ── 販路情報データ ────────────────────────────────────────
// カテゴリ: ec=産直EC, local=地域直売, restaurant=飲食店直取引, processing=加工・6次化, export=輸出
const SALES_CHANNEL_DATA = {
  "_national": [
    { icon:"🛒", label:"食べチョク", category:"ec", detail:"生産者と消費者を直接つなぐ産直ECサイト。全国発送可。登録無料・販売手数料は売上の16.5%。", url:"https://www.tabechoku.com/", tag:"産直EC" },
    { icon:"🛒", label:"ポケットマルシェ", category:"ec", detail:"農家・漁師から直接購入できるアプリ。登録・出品無料。販売手数料15%。", url:"https://poke-m.com/", tag:"産直EC" },
    { icon:"🛒", label:"メルカリShops", category:"ec", detail:"メルカリ上で農産物が出品可能。既存ユーザーベースを活かした販路拡大に有効。", url:"https://mercari-shops.com/", tag:"産直EC" },
    { icon:"🌾", label:"農協（JA）出荷", category:"local", detail:"安定した買取・集荷サポートあり。加入は任意。手数料が引かれるが販路の安定性が高い。", url:"https://www.ja-group.jp/", tag:"農協" },
    { icon:"🚀", label:"JETRO農産物輸出支援", category:"export", detail:"農林水産物・食品の輸出に向けたマッチング・補助金情報を提供。海外販路開拓の入口。", url:"https://www.jetro.go.jp/agri/", tag:"輸出" },
  ],
  "鹿児島県": {
    "_pref": [
      { icon:"🏪", label:"かごしま旬彩館", category:"local", detail:"鹿児島県アンテナショップ（東京・有楽町）。県産農産物の首都圏販路として活用可能。", url:"https://www.kagoshima-kankou.com/", tag:"アンテナショップ" },
      { icon:"🌿", label:"かごしまオーガニック産地", category:"ec", detail:"有機農産物の産地として県が認定・PR。有機栽培農家向けの販路支援あり。", url:"https://www.pref.kagoshima.jp/", tag:"有機農業" },
    ],
    "南さつま市": [
      { icon:"🏬", label:"農産物直売所「めごち」", category:"local", detail:"南さつま市の地元直売所。地域住民・観光客向けに新鮮な農産物を直接販売できる。", tag:"直売所" },
      { icon:"🍽", label:"南さつま食の駅", category:"restaurant", detail:"地元飲食店・宿泊施設への食材直取引の仲介窓口あり。地産地消推進事業。", tag:"飲食店直取引" },
    ],
    "南九州市": [
      { icon:"🏪", label:"知覧茶・農産物直売センター", category:"local", detail:"知覧茶をはじめ地元農産物を扱う直売センター。観光客向け販路として有効。", tag:"直売所" },
      { icon:"🏭", label:"南九州市農産加工センター", category:"processing", detail:"農産物の加工・6次産業化を支援する施設。加工品として付加価値をつけて販売可能。", tag:"加工・6次化" },
    ],
    "指宿市": [
      { icon:"♨️", label:"指宿温泉農産物フェア", category:"local", detail:"温泉地という観光資源を活かした農産物直販イベント。観光客への直売機会あり。", tag:"直売イベント" },
    ],
    "鹿屋市": [
      { icon:"✈️", label:"鹿屋産農産物輸出推進", category:"export", detail:"鹿屋基地周辺の英語圏需要や台湾・香港向け農産物輸出の支援窓口あり。", tag:"輸出" },
    ],
    "志布志市": [
      { icon:"🚢", label:"志布志港輸出活用", category:"export", detail:"志布志港を活用したアジア向け農産物輸出ルートが整備されており、輸出コスト低減が可能。", tag:"輸出" },
    ],
  },
  "宮崎県": {
    "_pref": [
      { icon:"🏪", label:"宮崎県農産物直売ネット", category:"local", detail:"県内各地の直売所ネットワーク。地元スーパー・道の駅との連携販路あり。", tag:"直売所" },
      { icon:"🥩", label:"宮崎牛・地鶏ブランド活用", category:"local", detail:"宮崎県の畜産ブランドとの農産物セット販売など、ブランド相乗効果が狙える。", tag:"ブランド農産物" },
    ],
    "都城市": [
      { icon:"🏭", label:"都城農業協同組合加工施設", category:"processing", detail:"農産物を加工して付加価値をつけた販売が可能。漬物・干し野菜などの加工支援あり。", tag:"加工・6次化" },
    ],
    "小林市": [
      { icon:"🌿", label:"えびの高原農産物直売", category:"local", detail:"高原野菜の産地として観光客向け直販や百貨店バイヤーとのマッチング機会あり。", tag:"直売所" },
    ],
  },
  "群馬県": {
    "_pref": [
      { icon:"🏪", label:"ぐんまちゃん家（東京・銀座）", category:"local", detail:"群馬県アンテナショップ。首都圏への群馬県産農産物PRと販路開拓に活用可能。", url:"https://gunma.tokyo/", tag:"アンテナショップ" },
      { icon:"🚂", label:"首都圏直送ネットワーク", category:"ec", detail:"東京まで2時間以内という立地を活かし、鮮度を保ったまま首都圏のレストラン・消費者へ直送できる。", tag:"首都圏直送" },
    ],
    "前橋市": [
      { icon:"🌿", label:"前橋有機農産物直売市", category:"local", detail:"有機農業転換農家向けの直売市。オーガニック志向消費者との直接取引の場。", tag:"有機直売" },
      { icon:"🏭", label:"前橋農産物加工センター", category:"processing", detail:"ジャム・漬物・乾燥野菜など農産物の加工品化を支援。6次産業化補助金も活用可。", tag:"加工・6次化" },
    ],
    "高崎市": [
      { icon:"🍽", label:"高崎パスタ食材直取引", category:"restaurant", detail:"「高崎パスタ」で有名な地元飲食店への野菜直取引。地産地消推進の受け皿あり。", tag:"飲食店直取引" },
    ],
    "沼田市": [
      { icon:"🍎", label:"沼田果物直売所ネット", category:"local", detail:"リンゴ・なし等の果物を扱う直売所ネットワーク。観光農園との連携も可能。", tag:"直売所" },
    ],
  },
};

// 農地の都道府県・市区町村に対応する販路情報を取得
function getSalesChannels(farm) {
  const national = SALES_CHANNEL_DATA["_national"] || [];
  const prefData = SALES_CHANNEL_DATA[farm.region];
  if (!prefData) return { national, pref: [], local: [], localName: null };
  const pref = prefData["_pref"] || [];
  const localKey = Object.keys(prefData).find(k =>
    k !== "_pref" && (farm.location?.includes(k) || farm.name?.includes(k))
  );
  const local = localKey ? prefData[localKey] : [];
  return { national, pref, local, localName: localKey || null };
}

// ── サンプルデータ ────────────────────────────────────────
const SAMPLE_FARMS = [
  { id:"1", name:"南部農地 A区画", region:"鹿児島県", location:"南さつま市",
    lat:31.178, lng:130.529, area_label:"約800㎡", farm_type:"畑", status:"貸出可能",
    rent_label:"月額 5,000円", water_source:"井戸・雨水", access_info:"最寄り駅より車5分",
    crops:["さつまいも","かぼちゃ","スイカ","オクラ","菜の花"],
    score_water:4, score_sun:5, score_soil:4, score_climate:5, score_access:3,
    description:"温暖な気候と黒ボク土に恵まれた畑地。根菜・果菜類に最適です。",
    tags:["初心者向け","温暖気候","多品種"], is_premium:false },
  { id:"2", name:"南部農地 B区画", region:"鹿児島県", location:"南さつま市",
    lat:31.181, lng:130.531, area_label:"約1,200㎡", farm_type:"水田・畑", status:"調整中",
    rent_label:"応相談", water_source:"農業用水路", access_info:"最寄り駅より車8分",
    crops:["米","さつまいも","菜の花"],
    score_water:5, score_sun:4, score_soil:5, score_climate:5, score_access:3,
    description:"水田転換も可能な平坦地。用水路が隣接しており水管理が容易です。",
    tags:["水田可能","大区画","平坦地"], is_premium:true },
  { id:"3", name:"東部農地 C区画", region:"鹿児島県", location:"南九州市",
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

// ── 共通UIコンポーネント ──────────────────────────────────
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

function SubsidyBadge({ children }) {
  return (
    <span style={{
      background:"#EEF6FF", border:"1px solid #93C5FD",
      borderRadius:20, padding:"2px 9px", fontSize:10,
      color:"#1D4ED8", fontWeight:600
    }}>{children}</span>
  );
}

function SalesChannelBadge({ children }) {
  return (
    <span style={{
      background:"#FFF7ED", border:"1px solid #FDC06E",
      borderRadius:20, padding:"2px 9px", fontSize:10,
      color:"#92400E", fontWeight:600
    }}>{children}</span>
  );
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

// ── 支援情報パネル（詳細表示用） ─────────────────────────
function SubsidyPanel({ farm }) {
  const { pref, local, localName } = getSubsidies(farm);
  if (pref.length === 0 && local.length === 0) return null;

  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:12, fontWeight:700, color:"#1D4ED8", marginBottom:8,
        display:"flex", alignItems:"center", gap:6 }}>
        🏛 この農地で使える支援・補助金
      </div>

      {local.length > 0 && (
        <>
          <div style={{ fontSize:10, color:C.muted, fontWeight:700, marginBottom:6,
            letterSpacing:1, display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ background:"#DBEAFE", color:"#1D4ED8", borderRadius:4,
              padding:"1px 6px", fontSize:10 }}>市区町村</span>
            <span>{localName}</span>
          </div>
          {local.map((s,i) => (
            <div key={i} style={{ background:"#EEF6FF", border:"1px solid #BFDBFE",
              borderRadius:8, padding:"10px 12px", marginBottom:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                <span style={{ fontSize:15 }}>{s.icon}</span>
                <span style={{ fontWeight:700, fontSize:12, color:"#1E40AF" }}>{s.label}</span>
                <span style={{ marginLeft:"auto", background:"#DBEAFE", color:"#1D4ED8",
                  borderRadius:20, padding:"1px 8px", fontSize:10, fontWeight:600,
                  whiteSpace:"nowrap" }}>{s.tag}</span>
              </div>
              <p style={{ fontSize:11, color:"#3B5EA6", margin:0, lineHeight:1.6 }}>{s.detail}</p>
            </div>
          ))}
        </>
      )}

      {pref.length > 0 && (
        <>
          <div style={{ fontSize:10, color:C.muted, fontWeight:700, marginBottom:6,
            marginTop: local.length > 0 ? 10 : 0,
            letterSpacing:1, display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ background:"#DCFCE7", color:"#166534", borderRadius:4,
              padding:"1px 6px", fontSize:10 }}>都道府県</span>
            <span>{farm.region}</span>
          </div>
          {pref.map((s,i) => (
            <div key={i} style={{ background:"#F0FDF4", border:"1px solid #BBF7D0",
              borderRadius:8, padding:"10px 12px", marginBottom:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                <span style={{ fontSize:15 }}>{s.icon}</span>
                <span style={{ fontWeight:700, fontSize:12, color:"#166534" }}>{s.label}</span>
                <span style={{ marginLeft:"auto", background:"#DCFCE7", color:"#166534",
                  borderRadius:20, padding:"1px 8px", fontSize:10, fontWeight:600,
                  whiteSpace:"nowrap" }}>{s.tag}</span>
              </div>
              <p style={{ fontSize:11, color:"#15803D", margin:0, lineHeight:1.6 }}>{s.detail}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ── 販路情報パネル（詳細表示用） ─────────────────────────
function SalesChannelPanel({ farm }) {
  const { national, pref, local, localName } = getSalesChannels(farm);
  const CATEGORY_COLOR = {
    ec:          { bg:"#EEF6FF", border:"#BFDBFE", text:"#1E40AF", tag_bg:"#DBEAFE", tag_text:"#1D4ED8" },
    local:       { bg:"#F0FDF4", border:"#BBF7D0", text:"#166534", tag_bg:"#DCFCE7", tag_text:"#166534" },
    restaurant:  { bg:"#FFF7ED", border:"#FED7AA", text:"#92400E", tag_bg:"#FFEDD5", tag_text:"#C2410C" },
    processing:  { bg:"#FAF5FF", border:"#E9D5FF", text:"#6B21A8", tag_bg:"#F3E8FF", tag_text:"#7C3AED" },
    export:      { bg:"#F0F9FF", border:"#BAE6FD", text:"#075985", tag_bg:"#E0F2FE", tag_text:"#0369A1" },
  };

  const renderChannel = (ch, i) => {
    const col = CATEGORY_COLOR[ch.category] || CATEGORY_COLOR.local;
    return (
      <div key={i} style={{ background:col.bg, border:`1px solid ${col.border}`,
        borderRadius:8, padding:"10px 12px", marginBottom:6 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
          <span style={{ fontSize:15 }}>{ch.icon}</span>
          <span style={{ fontWeight:700, fontSize:12, color:col.text }}>
            {ch.url
              ? <a href={ch.url} target="_blank" rel="noopener noreferrer"
                  style={{ color:col.text, textDecoration:"none" }}>{ch.label} ↗</a>
              : ch.label}
          </span>
          <span style={{ marginLeft:"auto", background:col.tag_bg, color:col.tag_text,
            borderRadius:20, padding:"1px 8px", fontSize:10, fontWeight:600,
            whiteSpace:"nowrap" }}>{ch.tag}</span>
        </div>
        <p style={{ fontSize:11, color:col.text, margin:0, lineHeight:1.6, opacity:0.85 }}>{ch.detail}</p>
      </div>
    );
  };

  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:12, fontWeight:700, color:"#92400E", marginBottom:8,
        display:"flex", alignItems:"center", gap:6 }}>
        🏪 この農地で使える販路・出荷先
      </div>

      {/* 地域限定販路 */}
      {(local.length > 0 || pref.length > 0) && (
        <>
          <div style={{ fontSize:10, color:C.muted, fontWeight:700, marginBottom:6,
            display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ background:"#FFEDD5", color:"#C2410C", borderRadius:4,
              padding:"1px 6px", fontSize:10 }}>地域限定</span>
            <span>{localName || farm.region}</span>
          </div>
          {local.map(renderChannel)}
          {pref.map(renderChannel)}
        </>
      )}

      {/* 全国共通販路 */}
      <div style={{ fontSize:10, color:C.muted, fontWeight:700, marginBottom:6,
        marginTop: (local.length > 0 || pref.length > 0) ? 10 : 0,
        display:"flex", alignItems:"center", gap:4 }}>
        <span style={{ background:"#E0F2FE", color:"#0369A1", borderRadius:4,
          padding:"1px 6px", fontSize:10 }}>全国共通</span>
        <span>どの農地でも利用可能</span>
      </div>
      {national.map(renderChannel)}
    </div>
  );
}

// ── マップコンポーネント ──────────────────────────────────
function InlineMapView({ farms, onSelectFarm, selectedFarmId }) {
  const containerId = "farmatch-inline-map";
  const mapRef = React.useRef(null);
  const farmMarkersRef = React.useRef({});

  // 選択農地が変わったらピン強調＋ズーム
  React.useEffect(() => {
    if (!mapRef.current) return;
    const L = window.L; if (!L) return;

    // 全ピンをリセット
    Object.entries(farmMarkersRef.current).forEach(([id, marker]) => {
      const isSelected = String(id) === String(selectedFarmId);
      const el = marker.getElement();
      if (!el) return;
      const inner = el.querySelector('div');
      if (!inner) return;
      if (isSelected) {
        inner.style.width = '40px';
        inner.style.height = '40px';
        inner.style.fontSize = '18px';
        inner.style.border = '3px solid #7AB648';
        inner.style.boxShadow = '0 0 0 6px rgba(122,182,72,0.35), 0 3px 10px rgba(0,0,0,0.4)';
        inner.style.background = '#1E3D0F';
        inner.style.transform = 'scale(1)';
        inner.style.transition = 'all 0.2s ease';
        marker.setZIndexOffset(1000);
      } else {
        inner.style.width = '28px';
        inner.style.height = '28px';
        inner.style.fontSize = '13px';
        inner.style.border = '2px solid #7AB648';
        inner.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        inner.style.background = '#2D5016';
        inner.style.transform = 'scale(1)';
        inner.style.transition = 'all 0.2s ease';
        marker.setZIndexOffset(0);
      }
    });

    // 選択農地にフライ
    if (selectedFarmId) {
      const farm = farms.find(f => String(f.id) === String(selectedFarmId));
      if (farm?.lat && farm?.lng) {
        mapRef.current.flyTo([farm.lat, farm.lng], 13, { duration: 0.8 });
      }
    }
  }, [selectedFarmId]);

  React.useEffect(() => {
    farmMarkersRef.current = {};
    // 現在のビューを保存（再描画時に維持）
    const prevCenter = mapRef.current ? mapRef.current.getCenter() : null;
    const prevZoom = mapRef.current ? mapRef.current.getZoom() : null;

    function initMap() {
      setTimeout(() => {
        const el = document.getElementById(containerId);
        if (!el) return;
        const L = window.L; if (!L) return;
        if (el._leaflet_id) {
          el._leaflet_id = null;
          el.innerHTML = "";
        }
        const valid = farms.filter(f => f.lat && f.lng);
        if (valid.length === 0) return;

        // 選択農地がある場合はその農地を中心に zoom13、なければ平均座標
        let initLat, initLng, initZoom;
        const selFarm = selectedFarmId ? valid.find(f => String(f.id) === String(selectedFarmId)) : null;
        if (selFarm) {
          initLat = selFarm.lat;
          initLng = selFarm.lng;
          initZoom = 13;
        } else if (prevCenter) {
          initLat = prevCenter.lat;
          initLng = prevCenter.lng;
          initZoom = prevZoom || 8;
        } else {
          initLat = valid.reduce((s, p) => s + p.lat, 0) / valid.length;
          initLng = valid.reduce((s, p) => s + p.lng, 0) / valid.length;
          initZoom = 8;
        }

        const map = L.map(containerId, { scrollWheelZoom: true }).setView([initLat, initLng], initZoom);
        mapRef.current = map;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap", maxZoom: 18
        }).addTo(map);
        valid.forEach(f => {
          const { pref, local } = getSubsidies(f);
          const subsidyCount = pref.length + local.length;
          const isSelected = String(f.id) === String(selectedFarmId);
          const icon = L.divIcon({
            html: `<div style="background:${isSelected?'#1E3D0F':'#2D5016'};color:#fff;border-radius:50%;width:${isSelected?40:28}px;height:${isSelected?40:28}px;display:flex;align-items:center;justify-content:center;font-size:${isSelected?18:13}px;border:${isSelected?3:2}px solid #7AB648;box-shadow:${isSelected?'0 0 0 6px rgba(122,182,72,0.35), 0 3px 10px rgba(0,0,0,0.4)':'0 2px 4px rgba(0,0,0,0.3)'};transition:all 0.2s ease">🌱</div>`,
            className: "", iconSize: [isSelected?40:28, isSelected?40:28], iconAnchor: [isSelected?20:14, isSelected?20:14]
          });
          const marker = L.marker([f.lat, f.lng], { icon }).addTo(map)
            .bindPopup(`<div style="font-family:sans-serif;min-width:160px">
              <div style="font-weight:700;color:#2D5016;margin-bottom:4px;font-size:13px">${f.name}</div>
              <div style="font-size:11px;color:#666;margin-bottom:4px">📍 ${f.region} ${f.location}</div>
              <div style="font-size:11px">📐 ${f.area_label} ／ 🌱 ${f.farm_type}</div>
              ${subsidyCount > 0 ? `<div style="font-size:11px;color:#1D4ED8;margin-top:4px">🏛 支援・補助金 ${subsidyCount}件</div>` : ""}
              <button onclick="window._farmSelect('${f.id}')" style="margin-top:8px;background:#2D5016;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;width:100%">詳細を見る</button>
            </div>`)
            .on("click", () => onSelectFarm(f));
          if (isSelected) marker.setZIndexOffset(1000);
          farmMarkersRef.current[f.id] = marker;
        });
        window._farmSelect = (id) => {
          const farm = farms.find(f => f.id === id);
          if (farm) onSelectFarm(farm);
        };
      }, 300);
    }

    if (document.getElementById("leaflet-css")) {
      initMap();
    } else {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = () => initMap();
      document.head.appendChild(script);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [farms, selectedFarmId]);

  return (
    <div>
      <div style={{ background:"#2D5016", color:"#fff", padding:"8px 14px", fontSize:12,
        fontWeight:700, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span>🗺 フィルター中の農地マップ</span>
        <span style={{ fontSize:11, opacity:0.8, fontWeight:400 }}>
          {selectedFarmId ? "🌱 選択中の農地を強調表示" : "ピンをクリックで詳細表示"}
        </span>
      </div>
      <div id={containerId} style={{ height:400, width:"100%" }}/>
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

// ── 作物カレンダー ────────────────────────────────────────
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

// ── 料金ビュー ────────────────────────────────────────────
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

// ── 管理者ログイン ────────────────────────────────────────
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

// ── 管理パネル ────────────────────────────────────────────
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

      {showForm && (
        <Modal onClose={()=>setShowForm(false)}>
          <h3 style={{ margin:"0 0 16px", color:C.green }}>
            {editItem ? "✏️ 編集" : (formType==="farm"?"🌱 農地を登録":"🏡 物件を登録")}
          </h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            {[{key:"name",label:"名称 *",ph:"例：南部農地 D区画",full:true},
              {key:"region",label:"都道府県 *",ph:"例：鹿児島県"},
              {key:"location",label:"エリア名",ph:"例：南さつま市"},
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

// ── 問い合わせモーダル ────────────────────────────────────
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

// ── 農地詳細パネル ────────────────────────────────────────
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

      {/* 支援・補助金情報（詳細） */}
      <SubsidyPanel farm={farm} />

      {/* 販路情報（詳細） */}
      <SalesChannelPanel farm={farm} />

      <Btn onClick={()=>onContact(farm)} style={{ width:"100%", textAlign:"center" }}>この農地に問い合わせる</Btn>
    </div>
  );
}

// ── 住まいビュー ──────────────────────────────────────────
// ── 距離・車所要時間ユーティリティ ──────────────────────────
// ハバーサイン公式で直線距離(km)を計算
function calcDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 直線距離→車所要時間（農村道路想定: 平均40km/h、迂回係数1.4）
function calcDriveMin(lat1, lng1, lat2, lng2) {
  const dist = calcDistanceKm(lat1, lng1, lat2, lng2) * 1.4;
  return Math.round(dist / 40 * 60);
}

function driveLabel(min) {
  if (min < 1) return "車1分未満";
  if (min < 60) return `車約${min}分`;
  return `車約${Math.round(min/6)/10}時間`;
}

// ── 住まい専用マップ（物件＋近隣農地を同時表示） ──────────
function HousingMapView({ houses, farms, onSelectHouse, onSelectFarm, focusTarget, hoveredFarmId, onFarmHover }) {
  const containerId = "farmatch-housing-map";
  const mapRef = React.useRef(null);
  const farmMarkersRef = React.useRef({});

  // focusTarget が変わったら地図をフライ移動＋ルートライン描画
  React.useEffect(() => {
    if (!focusTarget || !mapRef.current) return;
    const L = window.L; if (!L) return;
    const map = mapRef.current;

    // 既存のルートラインを削除
    if (map._routeLine) { map.removeLayer(map._routeLine); map._routeLine = null; }
    if (map._routeLabels) { map._routeLabels.forEach(l=>map.removeLayer(l)); map._routeLabels=[]; }

    if (!focusTarget.lat || !focusTarget.lng) return;

    if (focusTarget._fromHouse) {
      // 住まい詳細の近隣農地ボタンからの選択：住まい↔農地間にルートライン
      const h = focusTarget._fromHouse;
      if (h.lat && h.lng) {
        const distMin = calcDriveMin(h.lat, h.lng, focusTarget.lat, focusTarget.lng);

        // OSRM で道路沿いルートを取得（無料API）
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${h.lng},${h.lat};${focusTarget.lng},${focusTarget.lat}?overview=full&geometries=geojson`;

        const drawRoute = (latlngs) => {
          // ルートライン
          const line = L.polyline(latlngs, {
            color: '#2563EB', weight: 5, opacity: 0.9,
            lineJoin: 'round', lineCap: 'round'
          }).addTo(map);
          // 白い縁取り（下に敷く）
          const outline = L.polyline(latlngs, {
            color: '#fff', weight: 9, opacity: 0.5,
            lineJoin: 'round', lineCap: 'round'
          }).addTo(map);
          outline.bringToBack();
          map._routeLine = line;
          map._routeLabels = [outline];

          // 中間点からルートと垂直方向にオフセット（被り防止）
          const mid = Math.floor(latlngs.length / 2);
          const [midLat, midLng] = Array.isArray(latlngs[mid]) ? latlngs[mid] : [latlngs[mid].lat, latlngs[mid].lng];
          // ルートの傾きを見て上または右にずらす
          const p1 = Array.isArray(latlngs[Math.max(0, mid-1)]) ? latlngs[Math.max(0, mid-1)] : [latlngs[Math.max(0,mid-1)].lat, latlngs[Math.max(0,mid-1)].lng];
          const p2 = Array.isArray(latlngs[Math.min(latlngs.length-1, mid+1)]) ? latlngs[Math.min(latlngs.length-1, mid+1)] : [latlngs[Math.min(latlngs.length-1,mid+1)].lat, latlngs[Math.min(latlngs.length-1,mid+1)].lng];
          const dLat = p2[0] - p1[0];
          const dLng = p2[1] - p1[1];
          const offset = 0.004;
          // 水平に近いルート→上にずらす、縦方向→右にずらす
          const labelLat = Math.abs(dLng) > Math.abs(dLat) ? midLat + offset : midLat;
          const labelLng = Math.abs(dLat) >= Math.abs(dLng) ? midLng + offset * 1.5 : midLng;
          const label = L.marker([labelLat, labelLng], {
            icon: L.divIcon({
              html: `<div style="background:#fff;color:#1E40AF;border-radius:8px;padding:6px 14px;font-size:13px;font-weight:800;white-space:nowrap;box-shadow:0 3px 12px rgba(0,0,0,0.5);border:2px solid #1E40AF;pointer-events:none">🚗 ${driveLabel(distMin)}</div>`,
              className: "",
              iconSize: [140, 34],
              iconAnchor: [70, 17]
            }),
            zIndexOffset: 2000
          }).addTo(map);
          map._routeLabels.push(label);

          // 両端にピン強調マーカー
          const houseMarker = L.circleMarker([h.lat, h.lng], {
            radius: 10, color: '#C4883A', fillColor: '#8B5A1A', fillOpacity: 1, weight: 3
          }).addTo(map);
          const farmMarker = L.circleMarker([focusTarget.lat, focusTarget.lng], {
            radius: 10, color: '#7AB648', fillColor: '#2D5016', fillOpacity: 1, weight: 3
          }).addTo(map);
          map._routeLabels.push(houseMarker, farmMarker);

          // 直線距離に応じて適切なズームを決定（より拡大）
          const distKm = calcDistanceKm(h.lat, h.lng, focusTarget.lat, focusTarget.lng);
          let maxZoom;
          if (distKm < 1)       maxZoom = 17;
          else if (distKm < 3)  maxZoom = 16;
          else if (distKm < 8)  maxZoom = 15;
          else if (distKm < 20) maxZoom = 14;
          else if (distKm < 50) maxZoom = 13;
          else                  maxZoom = 12;

          map.fitBounds(L.latLngBounds(latlngs), {
            padding: [60, 60],
            maxZoom: maxZoom,
            animate: true,
            duration: 0.8
          });
        };

        // OSRM APIでルート取得
        fetch(osrmUrl)
          .then(r => r.json())
          .then(data => {
            if (data.routes?.[0]?.geometry?.coordinates?.length > 1) {
              const latlngs = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
              drawRoute(latlngs);
            } else {
              drawRoute([[h.lat, h.lng], [focusTarget.lat, focusTarget.lng]]);
            }
          })
          .catch(() => {
            drawRoute([[h.lat, h.lng], [focusTarget.lat, focusTarget.lng]]);
          });
      }
    } else {
      // 住まい単体の選択：その物件にフライ
      map.flyTo([focusTarget.lat, focusTarget.lng], 13, { duration: 0.8 });
    }
  }, [focusTarget]);

  // hoveredFarmId が変わったらピンのスタイルを更新
  React.useEffect(() => {
    Object.entries(farmMarkersRef.current).forEach(([id, marker]) => {
      const isHovered = String(id) === String(hoveredFarmId);
      const el = marker.getElement();
      if (!el) return;
      const inner = el.querySelector('div');
      if (!inner) return;
      if (isHovered) {
        inner.style.width = '34px';
        inner.style.height = '34px';
        inner.style.fontSize = '16px';
        inner.style.border = '3px solid #7AB648';
        inner.style.boxShadow = '0 0 0 4px rgba(122,182,72,0.4), 0 3px 8px rgba(0,0,0,0.4)';
        inner.style.opacity = '1';
        inner.style.zIndex = '1000';
        inner.style.transform = 'scale(1.2)';
        inner.style.transition = 'all 0.15s ease';
      } else {
        inner.style.width = '24px';
        inner.style.height = '24px';
        inner.style.fontSize = '11px';
        inner.style.border = '2px solid #7AB648';
        inner.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
        inner.style.opacity = '0.85';
        inner.style.zIndex = '';
        inner.style.transform = 'scale(1)';
        inner.style.transition = 'all 0.15s ease';
      }
    });
  }, [hoveredFarmId]);

  React.useEffect(() => {
    farmMarkersRef.current = {};
    function initMap() {
      setTimeout(() => {
        const el = document.getElementById(containerId);
        if (!el) return;
        const L = window.L; if (!L) return;
        if (el._leaflet_id) { el._leaflet_id = null; el.innerHTML = ""; }

        const allPoints = [...houses, ...farms].filter(p => p.lat && p.lng);
        if (allPoints.length === 0) return;
        const avgLat = allPoints.reduce((s,p)=>s+p.lat,0)/allPoints.length;
        const avgLng = allPoints.reduce((s,p)=>s+p.lng,0)/allPoints.length;
        const map = L.map(containerId, { scrollWheelZoom: true }).setView([avgLat, avgLng], 8);
        mapRef.current = map;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:"© OpenStreetMap", maxZoom:18
        }).addTo(map);

        // 住居ピン（茶色）
        houses.filter(h=>h.lat&&h.lng).forEach(h => {
          const icon = L.divIcon({
            html:`<div style="background:#8B5A1A;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:15px;border:3px solid #C4883A;box-shadow:0 2px 6px rgba(0,0,0,0.35)">🏡</div>`,
            className:"", iconSize:[32,32], iconAnchor:[16,16]
          });
          L.marker([h.lat,h.lng],{icon}).addTo(map)
            .bindPopup(`<div style="font-family:sans-serif;min-width:180px">
              <div style="font-weight:700;color:#8B5A1A;margin-bottom:4px;font-size:13px">🏡 ${h.name}</div>
              <div style="font-size:11px;color:#666;margin-bottom:4px">📍 ${h.region} ${h.location}</div>
              <div style="font-size:11px;margin-bottom:4px">📐 ${h.area_label||""}　🏠 ${h.house_type}</div>
              <div style="font-size:12px;font-weight:700;color:#C4883A;margin-bottom:6px">💴 ${h.rent_label}</div>
              ${h.subsidy_info?`<div style="font-size:11px;color:#2D5016;margin-bottom:6px">💰 ${h.subsidy_info}</div>`:""}
              <button onclick="window._houseSelect('${h.id}')" style="margin-top:4px;background:#8B5A1A;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;width:100%">詳細を見る</button>
            </div>`)
            .on("click", ()=>onSelectHouse(h));
        });

        // 農地ピン（緑・hover連動）
        farms.filter(f=>f.lat&&f.lng).forEach(f => {
          const icon = L.divIcon({
            html:`<div style="background:#2D5016;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:11px;border:2px solid #7AB648;box-shadow:0 1px 4px rgba(0,0,0,0.3);opacity:0.85;transition:all 0.15s ease">🌱</div>`,
            className:"", iconSize:[24,24], iconAnchor:[12,12]
          });
          const marker = L.marker([f.lat,f.lng],{icon}).addTo(map)
            .bindPopup(`<div style="font-family:sans-serif;min-width:160px">
              <div style="font-weight:700;color:#2D5016;margin-bottom:4px;font-size:12px">🌱 ${f.name}</div>
              <div style="font-size:11px;color:#666;margin-bottom:4px">📍 ${f.region} ${f.location}</div>
              <div style="font-size:11px">📐 ${f.area_label}　${f.farm_type}</div>
              <div style="font-size:11px;margin-top:4px"><span style="background:${f.status==="貸出可能"?"#7AB648":"#C4883A"};color:#fff;border-radius:4px;padding:1px 7px;font-size:10px">${f.status}</span></div>
              <button onclick="window._farmSelectH('${f.id}')" style="margin-top:6px;background:#2D5016;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;width:100%">農地詳細を見る</button>
            </div>`)
            .on("click", ()=>onSelectFarm(f))
            .on("mouseover", ()=>{ if(onFarmHover) onFarmHover(f.id); })
            .on("mouseout",  ()=>{ if(onFarmHover) onFarmHover(null); });
          farmMarkersRef.current[f.id] = marker;
        });

        window._houseSelect = (id) => { const h=houses.find(h=>h.id===id); if(h) onSelectHouse(h); };
        window._farmSelectH = (id) => { const f=farms.find(f=>f.id===id); if(f) onSelectFarm(f); };
      }, 300);
    }

    if (document.getElementById("leaflet-css")) { initMap(); }
    else {
      const link = document.createElement("link");
      link.id="leaflet-css"; link.rel="stylesheet";
      link.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload=()=>initMap();
      document.head.appendChild(script);
    }
    return () => { if(mapRef.current){ mapRef.current.remove(); mapRef.current=null; } };
  }, [houses, farms]);

  return (
    <div style={{ borderRadius:12, overflow:"hidden", border:`2px solid ${C.border}`, marginBottom:20 }}>
      <div style={{ background:`linear-gradient(135deg,#7B4F1A,${C.soil})`, color:"#fff",
        padding:"10px 16px", fontSize:13, fontWeight:700,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span>🗺 住まいと近隣農地マップ</span>
        <div style={{ display:"flex", gap:14, fontSize:11, fontWeight:400, opacity:0.9 }}>
          <span>🏡 住居</span>
          <span>🌱 近隣農地</span>
          <span style={{ opacity:0.7 }}>ピンをクリックで詳細</span>
        </div>
      </div>
      <div id={containerId} style={{ height:440, width:"100%" }}/>
    </div>
  );
}

function HousingView({ houses, farms, onContact, onSelectFarm }) {
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [focusTarget, setFocusTarget] = useState(null);
  const [hoveredFarmId, setHoveredFarmId] = useState(null);

  // 物件選択時：地図フォーカス＋詳細表示
  const handleSelectHouse = (h) => {
    setSelectedHouse(h);
    if (h.lat && h.lng) setFocusTarget(h);
  };

  // 近隣農地クリック時：農地タブへ遷移＋ルートライン表示
  const handleSelectFarmFromHousing = (f) => {
    if (f.lat && f.lng && selectedHouse) {
      // 農地タブへ遷移せず、住まいページの地図にルートラインを表示
      setFocusTarget({ ...f, _fromHouse: selectedHouse });
    }
    // onSelectFarm は呼ばない → 農地タブへ遷移しない
  };

  return (
    <div>
      {/* 移住サポートバナー */}
      <div style={{ background:`linear-gradient(135deg,#7B4F1A,${C.soil})`, borderRadius:12, padding:"18px 20px", color:"#fff", marginBottom:16 }}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>🏡 移住サポート情報</div>
        <p style={{ fontSize:12, margin:"0 0 12px", opacity:0.92, lineHeight:1.6 }}>農地とセットで住まいを探せます。補助金情報も一括確認できます。</p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {["都道府県移住支援金 最大100万円","市区町村補助金 最大50万円","空き家改修補助 最大30万円"].map(s=>(
            <span key={s} style={{ background:"rgba(255,255,255,0.2)", borderRadius:20, padding:"4px 12px", fontSize:11 }}>{s}</span>
          ))}
        </div>
      </div>

      {/* 住まい＋農地マップ */}
      <HousingMapView
        houses={houses}
        farms={farms}
        onSelectHouse={handleSelectHouse}
        onSelectFarm={handleSelectFarmFromHousing}
        focusTarget={focusTarget}
        hoveredFarmId={hoveredFarmId}
        onFarmHover={setHoveredFarmId}
      />

      {/* 選択中の物件詳細 */}
      {selectedHouse && (
        <div style={{ background:"#FFF7ED", border:`2px solid ${C.soilBorder}`, borderRadius:12,
          padding:"16px 18px", marginBottom:16, position:"relative" }}>
          <button onClick={()=>setSelectedHouse(null)}
            style={{ position:"absolute", top:12, right:14, background:"none", border:"none",
              fontSize:18, cursor:"pointer", color:C.muted }}>✕</button>
          <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:6 }}>🏡 {selectedHouse.name}</div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:10 }}>
            📍 {selectedHouse.region} {selectedHouse.location}　📐 {selectedHouse.area_label}　💴 {selectedHouse.rent_label}　🏠 {selectedHouse.house_type}
          </div>
          <p style={{ fontSize:13, color:C.muted, margin:"0 0 10px", lineHeight:1.6 }}>{selectedHouse.description}</p>
          {selectedHouse.subsidy_info && (
            <div style={{ background:C.paleGreen, borderRadius:6, padding:"8px 12px", fontSize:12, color:C.green, marginBottom:10, fontWeight:500 }}>
              💰 {selectedHouse.subsidy_info}
            </div>
          )}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
            {(selectedHouse.tags||[]).map(t=><Tag key={t}>{t}</Tag>)}
          </div>
          {/* 近隣農地 */}
          {(() => {
            const nearby = farms
              .filter(f =>
                f.region === selectedHouse.region &&
                f.lat && f.lng && selectedHouse.lat && selectedHouse.lng &&
                Math.abs(f.lat - selectedHouse.lat) < 0.5 &&
                Math.abs(f.lng - selectedHouse.lng) < 0.5
              )
              .map(f => ({
                ...f,
                _min: calcDriveMin(selectedHouse.lat, selectedHouse.lng, f.lat, f.lng)
              }))
              .sort((a,b) => a._min - b._min);
            if (nearby.length === 0) return null;
            return (
              <div style={{ background:C.paleGreen, borderRadius:8, padding:"10px 12px", marginBottom:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.green, marginBottom:8 }}>
                  🌱 近隣の農地（{nearby.length}件）
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {nearby.slice(0,5).map(f=>(
                    <button key={f.id}
                      onClick={()=>handleSelectFarmFromHousing(f)}
                      onMouseEnter={()=>setHoveredFarmId(f.id)}
                      onMouseLeave={()=>setHoveredFarmId(null)}
                      style={{ background: hoveredFarmId===f.id ? C.paleGreen : C.white,
                        border: `${hoveredFarmId===f.id?'2px':'1px'} solid ${hoveredFarmId===f.id?C.lightGreen:'#B8D98A'}`,
                        borderRadius:8, padding:"6px 10px", fontSize:11,
                        color: hoveredFarmId===f.id ? C.deepGreen : C.green,
                        cursor:"pointer", display:"flex", alignItems:"center", gap:5,
                        textAlign:"left", fontWeight: hoveredFarmId===f.id ? 700 : 400,
                        boxShadow: hoveredFarmId===f.id ? `0 0 0 3px rgba(122,182,72,0.25)` : 'none',
                        transform: hoveredFarmId===f.id ? 'scale(1.03)' : 'scale(1)',
                        transition:'all 0.15s ease' }}>
                      <span>🌱 {f.name}</span>
                      <span style={{ background: hoveredFarmId===f.id ? "#DBEAFE" : "#E8F5FF",
                        color:"#1D4ED8", borderRadius:4,
                        padding:"1px 5px", fontSize:10, fontWeight:600, whiteSpace:"nowrap" }}>
                        🚗 {driveLabel(f._min)}
                      </span>
                      <span style={{ background:f.status==="貸出可能"?C.lightGreen:C.soil,
                        color:"#fff", borderRadius:4, padding:"1px 5px", fontSize:10 }}>{f.status}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
          <Btn onClick={()=>onContact(selectedHouse)} style={{ width:"100%", textAlign:"center" }}>この物件に問い合わせる</Btn>
        </div>
      )}

      {/* 物件一覧 */}
      <div style={{ fontSize:12, color:C.muted, marginBottom:10 }}>{houses.length}件の物件</div>
      {houses.map(h=>(
        <div key={h.id} onClick={()=>handleSelectHouse(h)}
          style={{ background:selectedHouse?.id===h.id?C.soilLight:C.white,
            border:`2px solid ${selectedHouse?.id===h.id?C.soilBorder:C.border}`,
            borderRadius:12, padding:"16px 18px", marginBottom:12, cursor:"pointer" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:4 }}>🏡 {h.name}</div>
              <div style={{ fontSize:12, color:C.muted }}>
                📍 {h.region} {h.location}　📐 {h.area_label}　💴 {h.rent_label}　🏠 {h.house_type}
              </div>
            </div>
          </div>
          <p style={{ fontSize:13, color:C.muted, margin:"0 0 8px", lineHeight:1.6 }}>{h.description}</p>
          {h.subsidy_info && (
            <div style={{ background:C.paleGreen, borderRadius:6, padding:"6px 10px", fontSize:11,
              color:C.green, marginBottom:8, fontWeight:500 }}>💰 {h.subsidy_info}</div>
          )}
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:8 }}>
            {(h.tags||[]).map(t=><Tag key={t}>{t}</Tag>)}
          </div>
          {/* 近隣農地バッジ */}
          {(() => {
            const nearby = farms
              .filter(f =>
                f.region === h.region &&
                f.lat && f.lng && h.lat && h.lng &&
                Math.abs(f.lat - h.lat) < 0.5 &&
                Math.abs(f.lng - h.lng) < 0.5
              )
              .map(f => ({
                ...f,
                _min: calcDriveMin(h.lat, h.lng, f.lat, f.lng)
              }))
              .sort((a,b) => a._min - b._min);
            if (nearby.length === 0) return null;
            return (
              <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center",
                paddingTop:8, borderTop:`1px dashed ${C.border}` }}>
                <span style={{ fontSize:10, color:C.green, fontWeight:700 }}>🌱 近隣農地:</span>
                {nearby.slice(0,3).map(f=>(
                  <span key={f.id} style={{ background:C.paleGreen, border:`1px solid #B8D98A`,
                    borderRadius:20, padding:"2px 8px", fontSize:10, color:C.green, fontWeight:600,
                    display:"inline-flex", alignItems:"center", gap:3 }}>
                    {f.name}
                    <span style={{ color:"#1D4ED8", fontWeight:700 }}>🚗{driveLabel(f._min)}</span>
                  </span>
                ))}
                {nearby.length > 3 && <span style={{ fontSize:10, color:C.muted }}>+{nearby.length-3}件</span>}
              </div>
            );
          })()}
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

// ── メインApp ─────────────────────────────────────────────
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
  const [prefFilter, setPrefFilter] = useState("すべて");
  const [showMap, setShowMap]       = useState(true);
  const [mapFocus, setMapFocus]   = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [user, setUser]           = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showAuth, setShowAuth]   = useState(false);

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
      const { data:{ user } } = await supabase.auth.getUser();
      if(user) {
        const meta = user.user_metadata || {};
        await supabase.from("users").upsert([{
          id: uid, email: user.email, name: meta.name || "",
          role: meta.role || "seeker", is_premium: false,
        }]);
        setUserProfile({ id: uid, email: user.email, name: meta.name || "", role: meta.role || "seeker", is_premium: false });
      }
    }
  };

  const handleLogout = async()=>{
    await supabase.auth.signOut();
    setUser(null); setUserProfile(null); setIsPremium(false);
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
    {id:"housing",label:"🏡 住まい＋農地"},
    {id:"map",label:"🗺 地図"},
    {id:"calendar",label:"🗓 カレンダー"},
    {id:"pricing",label:"💰 料金"},
    {id:"admin",label:"⚙️ 管理"},
  ];

  const prefectures=[...new Set(farms.map(f=>f.region).filter(Boolean))].sort();
  const filteredFarms=farms.filter(f=>{
    const mf=filter==="すべて"||f.status===filter||f.farm_type===filter;
    const mp=prefFilter==="すべて"||f.region===prefFilter;
    const ms=!search||(f.crops||[]).some(c=>c.includes(search))||
      f.name.includes(search)||(f.tags||[]).some(t=>t.includes(search))||
      f.region?.includes(search)||f.location?.includes(search);
    return mf&&mp&&ms;
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

  const roleLabel = userProfile?.role === "owner" ? "🏡 オーナー" : userProfile?.role === "seeker" ? "🌱 就農希望者" : null;

  return (
    <div style={{ background:C.cream, minHeight:"100vh", fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif" }}>

      {/* ヘッダー */}
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
              <button onClick={()=>setShowAuth(true)}
                style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", borderRadius:20, padding:"6px 16px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                ログイン / 登録
              </button>
            )}
            <button onClick={()=>setTab("admin")}
              style={{ background:"rgba(255,255,255,0.1)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:11, cursor:"pointer" }}>管理者</button>
          </div>
        </div>
      </div>

      {/* ヒーロー */}
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

      {/* ナビ */}
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

      {/* コンテンツ */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"20px 16px" }}>
        {loading && (
          <div style={{ textAlign:"center", padding:60, color:C.muted }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🌱</div>
            <div>データを読み込み中...</div>
          </div>
        )}

        {!loading && tab==="farms" && (
          <>
            {/* フィルター */}
            <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
              {["すべて","貸出可能","畑","水田・畑"].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{ background:filter===f?C.green:C.white,
                  color:filter===f?"#fff":C.green, border:`1.5px solid ${C.green}`, borderRadius:20,
                  padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:filter===f?700:400 }}>{f}</button>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
              <select value={prefFilter} onChange={e=>{setPrefFilter(e.target.value);}}
                style={{ border:`1.5px solid ${C.green}`, borderRadius:20, padding:"5px 14px",
                  fontSize:12, cursor:"pointer", background:prefFilter!=="すべて"?C.green:C.white,
                  color:prefFilter!=="すべて"?"#fff":C.green, outline:"none", fontWeight:prefFilter!=="すべて"?700:400 }}>
                <option value="すべて">🗾 都道府県：すべて</option>
                {prefectures.map(p=>(<option key={p} value={p}>{p}</option>))}
              </select>
              {(prefFilter!=="すべて"||filter!=="すべて") && (
                <button onClick={()=>{setPrefFilter("すべて");setFilter("すべて");}}
                  style={{ border:`1px solid ${C.muted}`, borderRadius:20, padding:"5px 12px",
                    fontSize:11, cursor:"pointer", background:"#fff", color:C.muted }}>✕ リセット</button>
              )}
              <span style={{ marginLeft:"auto", fontSize:12, color:C.muted }}>{filteredFarms.length}件表示中</span>
              <button onClick={()=>setShowMap(v=>!v)}
                style={{ border:`1.5px solid ${C.green}`, borderRadius:20, padding:"5px 14px",
                  fontSize:12, cursor:"pointer", fontWeight:700,
                  background:showMap?C.green:"#fff", color:showMap?"#fff":C.green }}>
                {showMap?"📋 リスト表示":"🗺 地図表示"}
              </button>
            </div>

            {showMap && (
              <div style={{ marginBottom:16, borderRadius:12, overflow:"hidden", border:`2px solid ${C.border}` }}>
                <InlineMapView farms={filteredFarms} onSelectFarm={f=>setSelected(f)} selectedFarmId={selected?.id}/>
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:selected?"1fr 1fr":"1fr", gap:20 }}>
              <div>
                {(selected
                  ? [selected, ...filteredFarms.filter(f=>f.id!==selected.id)]
                  : filteredFarms
                ).map(farm=>{
                  const { pref, local } = getSubsidies(farm);
                  const allSubsidies = [...local, ...pref];
                  const { national, pref:sPref, local:sLocal } = getSalesChannels(farm);
                  const allChannels = [...sLocal, ...sPref, ...national];
                  const hasInfo = allSubsidies.length > 0 || allChannels.length > 0;
                  return (
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

                      {/* 作物タグ */}
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:6 }}>
                        {(farm.crops||[]).map(c=><Tag key={c}>{CROP_EMOJI[c]||"🌱"} {c}</Tag>)}
                      </div>

                      {/* その他タグ */}
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom: hasInfo ? 8 : 0 }}>
                        {(farm.tags||[]).map(t=><Tag key={t} color={C.soilLight} border={C.soilBorder} text={C.soil}>{t}</Tag>)}
                      </div>

                      {/* 支援・販路バッジ */}
                      {hasInfo && (
                        <div style={{ paddingTop:8, borderTop:`1px dashed ${C.border}` }}>
                          {allSubsidies.length > 0 && (
                            <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center", marginBottom: allChannels.length > 0 ? 5 : 0 }}>
                              <span style={{ fontSize:10, color:"#1D4ED8", fontWeight:700, marginRight:2 }}>🏛 支援:</span>
                              {allSubsidies.slice(0, 2).map((s,i) => (
                                <SubsidyBadge key={i}>{s.icon} {s.tag}</SubsidyBadge>
                              ))}
                              {allSubsidies.length > 2 && (
                                <span style={{ fontSize:10, color:C.muted }}>+{allSubsidies.length - 2}件</span>
                              )}
                            </div>
                          )}
                          {allChannels.length > 0 && (
                            <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>
                              <span style={{ fontSize:10, color:"#92400E", fontWeight:700, marginRight:2 }}>🏪 販路:</span>
                              {allChannels.slice(0, 2).map((ch,i) => (
                                <SalesChannelBadge key={i}>{ch.icon} {ch.tag}</SalesChannelBadge>
                              ))}
                              {allChannels.length > 2 && (
                                <span style={{ fontSize:10, color:C.muted }}>+{allChannels.length - 2}件</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

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

        {!loading && tab==="housing" && <HousingView houses={houses} farms={farms} onContact={h=>setContact(h)} onSelectFarm={f=>{ setSelected(f); setTab("farms"); }}/>}
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

      {/* フッター */}
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

      {showAuth && (
        <AuthModal
          onClose={()=>setShowAuth(false)}
          onSuccess={()=>setShowAuth(false)}
        />
      )}
    </div>
  );
}
