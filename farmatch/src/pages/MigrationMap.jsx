import { useState } from "react";

const C = {
  deepGreen:"#1E3D0F", green:"#2D5016", lightGreen:"#7AB648", paleGreen:"#EDF5E1",
  cream:"#F5F0E8", white:"#FFFFFF", text:"#1A1A1A", muted:"#6B6B6B", border:"#E0D8CC", sky:"#4A90D9",
};

// 支援制度データを各都道府県公式サイトで確認・取得した日付。
// 都道府県ごとに予算・条例に基づき制度が随時改定されるため、全国一律の更新タイミングは存在しない。
// そのため自動更新は行わず、この日付を表示して「いつ時点の情報か」を必ず明示する運用とする。
export const DATA_VERIFIED_ON = "2026-09-16";

// 都道府県ごとの支援概要・名産品・移住の魅力データ
// summary/url は各県公式サイトを調査のうえ記載。制度内容・金額は年度や自治体により変更されるため、
// 詳細・最新情報は必ず各都道府県公式サイト（url）でご確認ください。
export const PREF_DATA = {
  "北海道": { url:"https://www.pref.hokkaido.lg.jp/ns/gjf/keiei/ninaite/ninaite/ninaite.html",
    summary:"北海道農政部および北海道農業公社（北海道農業担い手育成センター）が窓口となり、新規就農者向けの研修支援や経営開始資金（農業次世代人材投資資金）などの制度が用意されています。",
    specialties:["じゃがいも","とうもろこし","生乳・乳製品"], highlights:["知床・富良野など雄大な自然","ニセコの雪質で知られるスキーリゾート"] },
  "青森県": { url:"https://www.pref.aomori.lg.jp/soshiki/nourin/kozoseisaku/A-Life-park_kozoseisaku.html",
    summary:"新規就農者向けの研修支援や経営開始資金制度に加え、「あおもり移住支援事業」として東京圏から青森への移住・就業で最大100万円を支給する制度があります。",
    specialties:["りんご","にんにく","ながいも"], highlights:["十和田湖・奥入瀬渓流の自然","酸ヶ湯温泉など豊富な温泉地"] },
  "岩手県": { url:"https://www.pref.iwate.jp/sangyoukoyou/nougyou/shuunou/index.html",
    summary:"岩手県農業公社による総合的な就農支援に加え、研修資金（農業次世代人材投資事業）や「いわて若者移住支援金」制度も用意されています。",
    specialties:["ピーマン","雑穀","前沢牛"], highlights:["世界遺産・平泉の歴史的景観","八幡平・雫石エリアの自然と温泉"] },
  "宮城県": { url:"https://www.pref.miyagi.jp/soshiki/nosin/syunoshien.html",
    summary:"宮城県農業経営・就農支援センターが窓口となり、新規就農者向けの研修支援や経営開始資金制度、移住支援金制度などが用意されています。",
    specialties:["米（ひとめぼれ）","いちご","パプリカ"], highlights:["松島の景勝地","仙台の都市機能と食文化（牛タンなど）"] },
  "秋田県": { url:"https://www.pref.akita.lg.jp/pages/archive/46341",
    summary:"県外からの移住就農者向けに農地・農業機械の取得支援や住宅確保、就農後のサポートを行う「移住就農まるごと支援事業」のほか、一般的な新規就農支援策も用意されています。",
    specialties:["あきたこまち（米）","比内地鶏","いぶりがっこ"], highlights:["乳頭温泉郷の秘湯","角館の武家屋敷町並みと田沢湖の景観"] },
  "山形県": { url:"https://www.pref.yamagata.jp/140034/r40609nougyoukeiei_siensaku.html",
    summary:"新規就農者向けの支援策一覧が毎年度公表されており、研修支援や経営開始資金、移住支援金制度などが用意されています。",
    specialties:["さくらんぼ","洋なし（ラ・フランス）","米沢牛"], highlights:["蔵王温泉とスキーリゾート","銀山温泉のレトロな景観"] },
  "福島県": { url:"https://www.pref.fukushima.lg.jp/sec/36021c/",
    summary:"福島県農業振興公社就農支援センターが窓口となり、新規就農者向けの研修支援や経営開始資金、移住支援金制度（「福島県12市町村移住支援金」など）が用意されています。",
    specialties:["桃（もも）","あんぽ柿","日本酒"], highlights:["会津若松の歴史的町並み","磐梯山・裏磐梯の自然と岳温泉などの温泉地"] },

  "茨城県": { url:"https://www.pref.ibaraki.jp/nourinsuisan/nishinourin/keiei/chikusei/ninaite.html",
    summary:"新規就農者向けの経営開始資金や研修支援などの制度が用意されており、県の就農相談窓口「茨城就農コンシェル」でも相談を受け付けています。",
    specialties:["納豆","メロン","レンコン"], highlights:["ひたち海浜公園（ひたちなか市）の花畑・大洗海岸など海と自然が身近","袋田の滝など県北の里山エリアでの田舎暮らし"] },
  "栃木県": { url:"https://www.pref.tochigi.lg.jp/g04/sinnkisyuunou/teityakukinkyushien.html",
    summary:"新規就農者向けの研修支援や定着支援金など複数の支援事業があり、県公式の就農支援サイト「tochino」でも情報提供されています。",
    specialties:["いちご（とちおとめ）","かんぴょう","餃子（宇都宮）"], highlights:["那須高原・日光の避暑地としての自然環境","鬼怒川温泉など温泉地が充実"] },
  "群馬県": { url:"https://www.pref.gunma.jp/page/9251.html",
    summary:"新規就農者向けの研修・資金支援策が「群馬県農業支援策活用ガイド」としてまとめられており、県農業公社が就農相談窓口を担っています。",
    specialties:["こんにゃく","下仁田ねぎ","きゅうり"], highlights:["草津温泉・水上温泉など全国有数の温泉地","谷川岳や尾瀬の雄大な自然"] },
  "埼玉県": { url:"https://www.pref.saitama.lg.jp/nouarukurashi/step/step.html",
    summary:"県が認める研修機関での研修に対して就農準備資金を交付する新規就農総合支援事業があり、就農までのステップを紹介する公式ページが用意されています。",
    specialties:["深谷ねぎ","川越いも（さつまいも）","狭山茶"], highlights:["秩父の山間部での自然豊かな暮らし","川越の蔵造りの町並みなど歴史情緒"] },
  "千葉県": { url:"https://www.pref.chiba.lg.jp/ninaite/shuunouguide/",
    summary:"新規就農者育成総合対策など経営発展を支援する制度があり、県公式の「新規就農ガイド」や「千葉県農業者総合支援センター」がワンストップで相談に対応しています。",
    specialties:["落花生","梨","びわ"], highlights:["九十九里浜や鴨川など房総半島の海沿いの暮らし","都心へのアクセスの良さと農村風景の両立"] },
  "東京都": { url:"https://www.sangyo-rodo.metro.tokyo.lg.jp/nourin/nougyou/shuunou/syokitosi",
    summary:"新規就農者初期投資支援事業により農業用施設・機械の導入費を支援するほか、東京都農林水産振興財団内の東京都新規就農相談センターが相談窓口となっています。",
    specialties:["小松菜","江戸東京野菜","島しょ地域の水産物"], highlights:["奥多摩・檜原村など都内でも自然豊かなエリアが残る","大消費地に近く直売・6次化がしやすい立地"] },
  "神奈川県": { url:"https://www.pref.kanagawa.jp/docs/k5g/cnt/f7220/index.html",
    summary:"新規就農者育成総合対策事業や「かながわ農業アカデミー」での研修を通じた就農準備資金など、県の「就農・農業参入ポータルサイト」で案内されています。",
    specialties:["三浦大根","しらす","湘南ゴールド（柑橘）"], highlights:["湘南エリアの海沿いの暮らし","箱根温泉や鎌倉など観光資源が豊富な立地"] },

  "新潟県": { url:"https://www.pref.niigata.lg.jp/site/nogyo-shuno/",
    summary:"「にいがた農業ナビ」や県農業経営・就農支援センターを通じて、経営開始資金や研修支援など新規就農者向けの支援制度が用意されています。",
    specialties:["コシヒカリ（米）","日本酒","洋梨「ル レクチエ」"], highlights:["佐渡島の自然と伝統文化","越後湯沢温泉"] },
  "富山県": { url:"https://uturn.pref.toyama.lg.jp/migration/",
    summary:"東京23区からの移住者で就業条件を満たす場合、世帯100万円・単身60万円の移住支援金が支給されます（18歳未満の子がいる場合は加算あり）。新規就農者向けの経営開始資金や研修支援も用意されています。",
    specialties:["米（コシヒカリ）","ホタルイカ","白えび"], highlights:["立山黒部アルペンルート","富山湾のとれたて海鮮"] },
  "石川県": { url:"https://inz.or.jp/",
    summary:"公益財団法人「いしかわ農業総合支援機構」がワンストップ窓口となり、農地の斡旋や研修施設「いしかわ耕稼塾」を通じて経営開始資金・研修支援を行っています。",
    specialties:["加賀野菜","能登牛","米（コシヒカリ）"], highlights:["兼六園・金沢の伝統文化","和倉温泉"] },
  "福井県": { url:"http://www.fukui-agri.jp/",
    summary:"「ふくい就農ナビ」を通じて就農相談窓口の案内や研修奨励金、経営開始資金などの情報提供を行っているほか、東京圏からの移住者向けの移住支援金制度もあります。",
    specialties:["越前ガニ","コシヒカリ","おろしそば"], highlights:["東尋坊の景観","あわら温泉"] },
  "山梨県": { url:"https://www.pref.yamanashi.jp/ninaite/nogyolife/",
    summary:"「山梨県農業経営・就農支援センター」を中心に、就農準備資金や経営開始資金、経営発展支援事業など新規就農者向けの支援制度が用意されています。",
    specialties:["ぶどう","もも","ワイン"], highlights:["富士山と富士五湖の絶景","石和温泉・ほうとう"] },
  "長野県": { url:"https://www.pref.nagano.lg.jp/noson/sangyo/nogyo/shinki/nogyo/",
    summary:"県公式サイトや「長野県新規就農相談センター」を通じて、研修制度や資金助成など新規就農者向けの支援情報を提供しています。",
    specialties:["りんご","高原レタス","そば"], highlights:["上高地・北アルプスの大自然","軽井沢や渋温泉郷"] },
  "岐阜県": { url:"https://www.pref.gifu.lg.jp/page/286263.html",
    summary:"「ぎふアグリチャレンジ支援センター」が総合相談窓口となり、就農支援研修や資金の借り入れ相談など就農準備から定着までを支援しています。",
    specialties:["飛騨牛","富有柿","白川茶"], highlights:["白川郷の合掌造り集落","下呂温泉"] },
  "静岡県": { url:"https://www.pref.shizuoka.jp/sangyoshigoto/nogyo/1065035/1027104.html",
    summary:"公益社団法人「静岡県農業振興公社」による「がんばる新農業人支援事業」を通じて、指導農家のもとでの実践研修や農地・資金確保の支援を行っています。",
    specialties:["茶（お茶）","みかん","わさび"], highlights:["富士山を望む景観","熱海・伊豆の温泉地"] },
  "愛知県": { url:"https://www.pref.aichi.jp/soshiki/nogyo-keiei/0000049771.html",
    summary:"相談窓口や農地情報の提供、県立農業大学校での研修に加え、就業支援プラットフォーム「あいちから」を通じて経営開始資金や研修支援を含む支援体制が整えられています。",
    specialties:["キャベツ","抹茶（西尾茶）","トマト"], highlights:["名古屋グルメ","渥美半島の花き産地・伊良湖の景観"] },

  "三重県": { url:"https://new-farmer-portal.pref.mie.lg.jp/",
    summary:"三重県新規就農ポータルサイトを窓口に、新規就農者向けの研修支援や経営開始資金、移住支援金制度などが用意されています。",
    specialties:["松阪牛","伊勢茶","伊勢海老・真珠"], highlights:["伊勢志摩国立公園の海と真珠養殖の景観","湯の山温泉などの自然豊かな温泉地"] },
  "滋賀県": { url:"https://www.pref.shiga.lg.jp/ippan/shigotosangyou/nougyou/nousonshinkou/322768.html",
    summary:"滋賀県農林漁業担い手育成基金による就農相談・研修支援や、県の移住就業支援事業による移住支援金制度などが用意されています。",
    specialties:["近江牛","近江米","鮒寿司"], highlights:["琵琶湖を中心とした自然環境","比良山系での登山や日本酒蔵めぐりなどのグルメ"] },
  "京都府": { url:"https://www.pref.kyoto.jp/ninaite/shinkisyuno.html",
    summary:"京都府立農業大学校での研修や実践農場制度、就農準備資金・経営開始資金などの支援制度が用意されています。",
    specialties:["京野菜","宇治茶","丹波栗"], highlights:["京都市内の歴史的景観と食文化","京都北部（丹後）の天橋立などの海と温泉地"] },
  "大阪府": { url:"https://www.pref.osaka.lg.jp/o120090/nosei/seinen/index.html",
    summary:"大阪農業つなぐセンター（大阪府農業経営・就農支援センター）を窓口に、新規就農者育成総合対策として研修支援や経営開始資金などの制度が用意されています。",
    specialties:["泉州水なす","なにわの伝統野菜","大阪産の果物・野菜"], highlights:["都市近郊で農業と大阪の食文化（粉もんグルメ）を両立できる暮らし","南河内・岸和田など里山の自然"] },
  "兵庫県": { url:"https://web.pref.hyogo.lg.jp/nk04/ouenplan02.html",
    summary:"「就農・定着応援プラン」のもと県・市町・農業委員会等が連携し、就農準備資金や経営開始資金などの支援制度が用意されています。",
    specialties:["神戸牛（但馬牛）","丹波黒大豆","淡路島たまねぎ"], highlights:["城崎温泉・有馬温泉などの多彩な温泉地","瀬戸内海と日本海の両方に面した豊かな食文化"] },
  "奈良県": { url:"https://www.pref.nara.jp/39870.htm",
    summary:"独立自営就農に向けた基礎研修や、就農準備資金・経営開始資金・経営発展支援事業などの支援制度が用意されています。",
    specialties:["大和野菜","柿","大和茶"], highlights:["吉野の桜と山林景観","歴史ある古都と自然豊かな山間地での暮らし"] },
  "和歌山県": { url:"https://www.pref.wakayama.lg.jp/prefg/070900/befarmer/befarmer.html",
    summary:"「AGRI-WAKAYAMA」（わかやま新規就農支援サイト）を窓口に就農相談や研修支援、県の移住支援事業による移住支援金制度などが用意されています。",
    specialties:["みかん","梅（南高梅）","柿"], highlights:["白浜温泉など南紀の海と温泉地","世界遺産・熊野古道の自然と歴史"] },

  "鳥取県": { url:"https://www.pref.tottori.lg.jp/syunou/",
    summary:"「鳥取県で新たに農業を始める！」にて、新規就農者向けの経営開始資金や研修支援、就農相談窓口の情報が提供されています。移住・就業・起業者向けの移住支援金制度もあります。",
    specialties:["二十世紀梨","らっきょう","松葉ガニ"], highlights:["鳥取砂丘の雄大な自然","三朝温泉・皆生温泉などの温泉地"] },
  "島根県": { url:"https://www.pref.shimane.lg.jp/industry/norin/nougyo/ninaite/shinkishuno/",
    summary:"就農相談から研修、新規就農者向けの支援制度が案内されています。「わくわく島根生活実現支援事業」により、東京23区からの移住者に移住支援金（世帯100万円、単身60万円）が支給されます。",
    specialties:["島根和牛","宍道湖のシジミ","出雲そば"], highlights:["出雲大社周辺の歴史・文化","松江・玉造温泉などの温泉地"] },
  "岡山県": { url:"https://www.pref.okayama.jp/page/868394.html",
    summary:"新規就農者育成総合対策事業として、経営開始から3年以内かつ原則50歳未満の認定新規就農者に対し、年間最大165万円を最長3年間交付する制度があります。移住支援は「おかやま晴れの国ぐらし」で案内されています。",
    specialties:["白桃","マスカット（シャインマスカット）","千種和牛"], highlights:["「晴れの国」と呼ばれる温暖で晴天率の高い気候","倉敷美観地区の情緒あるまちなみ"] },
  "広島県": { url:"https://www.pref.hiroshima.lg.jp/soshiki/81/280530.html",
    summary:"就農総合窓口による相談対応や産地情報、研修機関の紹介など新規就農者育成情報が提供されています。東京圏からの移住・就業・起業者向けの移住支援金制度もあります。",
    specialties:["広島レモン","牡蠣","広島菜"], highlights:["瀬戸内海の島々と多島美（しまなみ海道など）","尾道・宮島など歴史ある港町の魅力"] },
  "山口県": { url:"https://www.pref.yamaguchi.lg.jp/soshiki/103/22368.html",
    summary:"相談から研修、就農、定着まで一貫した支援体制が整備されており、新規就農者向けの各種支援策が案内されています。大都市圏からの移住・就業者向けの移住支援金制度もあります。",
    specialties:["萩夏みかん・瀬戸内の柑橘類","ふぐ（下関）","長門ゆずきち"], highlights:["秋吉台の鍾乳洞など雄大な自然景観","萩・下関の歴史的なまちなみと温泉地"] },

  "徳島県": { url:"https://iju.pref.tokushima.lg.jp/",
    summary:"新規就農者育成総合対策（就農準備資金・経営開始資金など）が案内されています。「徳島わくわく移住支援事業」により、東京圏・大阪圏からの移住者向けの移住支援金制度もあります。",
    specialties:["すだち","阿波尾鶏","鳴門わかめ"], highlights:["鳴門の渦潮という迫力ある自然現象","祖谷渓・大歩危などの山間の絶景"] },
  "香川県": { url:"https://www.pref.kagawa.lg.jp/noukei16300/shuno/index.html",
    summary:"新規就農者育成総合対策（就農準備資金・経営開始支援事業）や、香川県新規就農・農業経営相談センターによる相談窓口が案内されています。東京23区からの移住者向けの移住支援金制度もあります。",
    specialties:["讃岐うどん用小麦","オリーブ（小豆島）","讃岐比内地鶏"], highlights:["小豆島のオリーブ畑と瀬戸内の景観","直島など瀬戸内国際芸術祭で知られるアート文化"] },
  "愛媛県": { url:"https://www.pref.ehime.jp/page/3815.html",
    summary:"農業入門塾や先進農家での研修制度など新規就農に向けた支援制度が用意されています。「愛媛県移住支援事業」により、東京23区から県内6市への移住・就業者向けの移住支援金制度もあります。",
    specialties:["みかん（柑橘類）","真珠（宇和海）","今治タオル"], highlights:["道後温泉という日本最古級の温泉地","しまなみ海道のサイクリングと瀬戸内の景観"] },
  "高知県": { url:"https://www.pref.kochi.lg.jp/soshiki/160101/sinkisyuunouhan.html",
    summary:"新規就農総合対策事業費補助金や農業次世代人材投資事業費補助金など新規就農者向けの支援制度が案内されています。「地方創生移住支援事業（移住支援金）」もあります。",
    specialties:["高知なす","ゆず","カツオ（土佐の一本釣り）"], highlights:["四万十川の清流と豊かな自然","高知の「土佐の食」や皿鉢料理といった食文化"] },

  "福岡県": { url:"https://www.pref.fukuoka.lg.jp/site/nougyousenne/",
    summary:"新規就農者向けの経営開始資金や研修支援、農業用機械・施設等の導入経費支援（新規就農者チャレンジ事業）などが用意されています。",
    specialties:["あまおう（いちご）","合馬たけのこ","夢つくし・元気つくし（米）"], highlights:["糸島エリアの海沿いの自然とカフェ文化","太宰府天満宮など歴史文化が身近な立地"] },
  "佐賀県": { url:"https://www.pref.saga.lg.jp/list02450.html",
    summary:"新規就農者向けの経営開始資金や研修支援に加え、条件を満たす移住者向けに移住支援金制度（サガスマイル）が用意されています。",
    specialties:["さがほのか・淡雪（いちご）","佐賀牛","有明海産の海苔"], highlights:["嬉野温泉・武雄温泉などの名湯","有田焼など伝統工芸が息づく町並み"] },
  "長崎県": { url:"https://www.pref.nagasaki.jp/bunrui/shigoto-sangyo/nogyo/shinkisyunou/",
    summary:"長崎県新規就農相談センターによる相談窓口のワンストップ化、研修・制度資金の活用支援など、新規就農者向けの支援策が用意されています。",
    specialties:["長崎びわ","長崎和牛","長崎だいこん"], highlights:["雲仙温泉やハウステンボスなどの観光資源","五島列島をはじめとする離島の豊かな自然"] },
  "熊本県": { url:"https://www.pref.kumamoto.jp/soshiki/83/238084.html",
    summary:"熊本県農業経営・就農支援センターが窓口となり、就農相談、研修支援、農地・機械導入支援など新規就農者向けの各種支援制度を提供しています。",
    specialties:["トマト・スイカ（生産量全国1位）","馬刺し","い草（畳表）"], highlights:["阿蘇の雄大なカルデラ・草原景観","黒川温泉などの秘湯"] },
  "大分県": { url:"https://www.pref.oita.jp/soshiki/15270/",
    summary:"大分県新規就業・経営体支援課が窓口となり、新規就農者向けの経営開始資金や研修制度、農業大学校での技術習得支援などが用意されています。",
    specialties:["かぼす（生産量全国1位）","甘太くん（さつまいも）","味一ねぎ"], highlights:["別府温泉・由布院温泉という全国屈指の温泉地としての知名度"] },
  "宮崎県": { url:"https://www.pref.miyazaki.lg.jp/shigoto/nogyo/ninaite/index.html",
    summary:"宮崎県新規就農相談センターによる就農相談のほか、移住支援金（2人以上世帯100万円、単身60万円）などの制度が用意されています。",
    specialties:["マンゴー（太陽のタマゴ）","日向夏","宮崎牛"], highlights:["青島・日南海岸の南国リゾート情緒","高千穂峡の神秘的な自然景観"] },
  "鹿児島県": { url:"https://www.pref.kagoshima.jp/ag05/sangyo-rodo/nogyo/nogyo/shinki/index.html",
    summary:"新規就農相談窓口や認定新規就農者制度による支援、東京圏からの移住者向けの移住支援金制度などが用意されています。",
    specialties:["さつまいも（生産量全国1位）","黒豚","鹿児島茶"], highlights:["桜島を望む雄大な景観","指宿温泉の砂むし温泉体験"] },
  "沖縄県": { url:"https://www.pref.okinawa.jp/shigoto/nogyo/1010390/1023807/1010806.html",
    summary:"沖縄県農業経営・就農支援センターによる就農相談や経営改善支援、移住支援金制度（おきなわ島ぐらし）などが用意されています。",
    specialties:["パイナップル・ゴーヤー（生産量全国1位）","もずく","紅芋"], highlights:["美しい海と離島が点在する亜熱帯の自然","独自の琉球文化・グルメ"] },
};

const PLACEHOLDER = { summary:"支援情報を準備中です。しばらくお待ちください。", url:null, specialties:[], highlights:[] };

export function getPrefData(pref) {
  return PREF_DATA[pref] || PLACEHOLDER;
}

function formatVerifiedDate(iso) {
  const [y,m,d] = iso.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

export const REGION_BLOCKS = [
  { name:"北海道", prefs:["北海道"] },
  { name:"東北", prefs:["青森県","岩手県","宮城県","秋田県","山形県","福島県"] },
  { name:"関東", prefs:["茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県"] },
  { name:"中部", prefs:["新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県","静岡県","愛知県"] },
  { name:"近畿", prefs:["三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県"] },
  { name:"中国", prefs:["鳥取県","島根県","岡山県","広島県","山口県"] },
  { name:"四国", prefs:["徳島県","香川県","愛媛県","高知県"] },
  { name:"九州・沖縄", prefs:["福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"] },
];

const BLOCK_ACCENTS = {
  "北海道":"#4A90D9", "東北":"#5B9BD5", "関東":C.lightGreen, "中部":"#7AB648",
  "近畿":"#C97A4F", "中国":"#B98FD1", "四国":"#5C9484", "九州・沖縄":"#C4883A",
};

// 日本列島の島の輪郭を模した自作SVG（外部地図データは使用せず、実際の島の形・位置関係に近づけたシルエット）
// viewBox: 0 0 400 600
const MAP_VIEWBOX = "0 0 400 600";

const ISLAND_PATHS = {
  hokkaido: "M248,35 C265,20 292,18 310,32 C325,44 328,62 320,78 C330,90 328,108 312,116 C295,124 275,120 262,106 C245,110 228,100 222,84 C216,68 222,50 236,42 C240,38 244,36 248,35 Z",
  honshu: "M262,120 C285,138 300,160 302,185 C304,208 296,222 306,238 C296,258 272,268 258,286 C246,302 240,318 222,328 C202,340 186,336 168,346 C150,356 138,360 122,366 C110,370 102,376 96,384 C88,378 88,364 98,354 C110,342 128,338 142,328 C130,320 128,306 138,296 C150,284 168,282 182,272 C196,262 200,246 210,232 C198,224 194,208 202,194 C210,180 224,176 232,164 C222,150 226,132 240,124 C247,120 255,119 262,120 Z",
  shikoku: "M182,352 C198,346 216,350 224,362 C230,372 222,382 208,384 C192,386 176,382 170,370 C166,362 172,356 182,352 Z",
  kyushu: "M126,382 C144,376 162,384 166,402 C170,416 166,430 168,444 C170,458 160,472 144,476 C128,480 112,472 104,458 C96,444 98,428 92,414 C87,402 92,390 104,384 C111,381 119,380 126,382 Z",
};

// 沖縄は本州から大きく離れているため、実際の地図同様に左下へ縮小インセットで表示
const OKINAWA_INSET = { x:30, y:540, w:90, h:46 };

// 各地方ブロックのピン位置（viewBox座標）。列島の形に合わせた地方の実際の位置関係を再現。
const MAP_PINS = {
  "北海道":     { x:272, y:70 },
  "東北":       { x:270, y:150 },
  "関東":       { x:296, y:222 },
  "中部":       { x:236, y:220 },
  "近畿":       { x:196, y:266 },
  "中国":       { x:150, y:310 },
  "四国":       { x:198, y:366 },
  "九州・沖縄": { x:128, y:428 },
};

function DetailModal({ pref, onClose, onSelectPrefecture }) {
  const data = getPrefData(pref);
  const hasSpecialties = data.specialties && data.specialties.length > 0;
  const hasHighlights = data.highlights && data.highlights.length > 0;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(20,30,15,0.55)",
      zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:16,
        padding:"28px 28px", maxWidth:440, width:"100%", maxHeight:"85vh", overflowY:"auto",
        border:`2px solid ${C.border}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ fontSize:19, fontWeight:800, color:C.deepGreen }}>{pref}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:18,
            color:C.muted, cursor:"pointer", lineHeight:1, padding:4 }}>✕</button>
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11.5, fontWeight:700, color:C.green, marginBottom:4 }}>🏛️ 支援制度の概要</div>
          <p style={{ fontSize:13, color:C.text, lineHeight:1.8, margin:0 }}>{data.summary}</p>
          {data.url && (
            <a href={data.url} target="_blank" rel="noopener noreferrer"
              style={{ display:"inline-block", marginTop:8, fontSize:12, color:C.sky, fontWeight:700 }}>
              公式サイトで詳しく見る →
            </a>
          )}
        </div>

        {hasSpecialties && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11.5, fontWeight:700, color:C.green, marginBottom:6 }}>🌾 名産品</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {data.specialties.map(s => (
                <span key={s} style={{ background:C.paleGreen, border:`1px solid #B8D98A`, borderRadius:14,
                  padding:"3px 12px", fontSize:12, color:C.green, fontWeight:600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {hasHighlights && (
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:11.5, fontWeight:700, color:C.green, marginBottom:6 }}>♨️ 移住先としての魅力</div>
            <ul style={{ margin:0, paddingLeft:18 }}>
              {data.highlights.map(h => (
                <li key={h} style={{ fontSize:12.5, color:C.text, lineHeight:1.8, marginBottom:2 }}>{h}</li>
              ))}
            </ul>
          </div>
        )}

        <p style={{ fontSize:10.5, color:C.muted, lineHeight:1.7, margin:"0 0 16px" }}>
          ※この情報は{formatVerifiedDate(DATA_VERIFIED_ON)}時点で公式サイトを確認して記載したものです。支援制度は都道府県ごとの予算・条例により年度途中でも変更・終了になる場合があるため、詳細・最新情報は必ず公式サイトでご確認ください。
        </p>

        {onSelectPrefecture && (
          <button onClick={()=>{ onSelectPrefecture(pref); onClose(); }}
            style={{ width:"100%", background:C.green, color:"#fff", border:"none", borderRadius:24,
              padding:"11px 20px", fontSize:13.5, fontWeight:800, cursor:"pointer" }}>
            🌱 {pref}の農地を見る
          </button>
        )}
      </div>
    </div>
  );
}

function Pin({ name, x, y, isSelected, onClick, small, colorOverride }) {
  // viewBox は 0 0 400 600 なので % に変換して重ねる
  const left = `${(x/400)*100}%`, top = `${(y/600)*100}%`;
  const color = colorOverride || BLOCK_ACCENTS[name];
  return (
    <button onClick={onClick} title={name}
      style={{ position:"absolute", left, top, transform:"translate(-50%,-50%)",
        display:"flex", flexDirection:"column", alignItems:"center", gap:2,
        background:"none", border:"none", cursor:"pointer", padding:0, zIndex:isSelected?3:2 }}>
      <span style={{ width:isSelected?18:13, height:isSelected?18:13, borderRadius:"50%",
        background:color, border:"2px solid #fff",
        boxShadow:isSelected?"0 0 0 3px rgba(0,0,0,0.12)":"0 1px 4px rgba(0,0,0,0.25)",
        transition:"width 0.15s, height 0.15s" }}/>
      <span style={{ fontSize:small?9:10.5, fontWeight:800, whiteSpace:"nowrap",
        color:isSelected?C.deepGreen:C.text, background:"rgba(255,255,255,0.88)",
        borderRadius:6, padding:"1px 5px", boxShadow:"0 1px 3px rgba(0,0,0,0.12)" }}>
        {name}
      </span>
    </button>
  );
}

function JapanMap({ selectedBlock, onSelectBlock }) {
  return (
    <div style={{ position:"relative", width:"100%", maxWidth:340, aspectRatio:"400/600", margin:"0 auto 16px" }}>
      <svg viewBox={MAP_VIEWBOX} style={{ width:"100%", height:"100%", display:"block" }}>
        <rect x="0" y="0" width="400" height="600" rx="16" fill="#EAF3FC"/>
        <path d={ISLAND_PATHS.hokkaido} fill="#DCE9C8" stroke="#B9C99A" strokeWidth="1.5"/>
        <path d={ISLAND_PATHS.honshu} fill="#DCE9C8" stroke="#B9C99A" strokeWidth="1.5"/>
        <path d={ISLAND_PATHS.shikoku} fill="#DCE9C8" stroke="#B9C99A" strokeWidth="1.5"/>
        <path d={ISLAND_PATHS.kyushu} fill="#DCE9C8" stroke="#B9C99A" strokeWidth="1.5"/>
        {/* 沖縄インセット（実際の位置からは大きく離れているため縮尺・位置は模式的） */}
        <rect x={OKINAWA_INSET.x-6} y={OKINAWA_INSET.y-14} width={OKINAWA_INSET.w+12} height={OKINAWA_INSET.h+20}
          rx="6" fill="none" stroke="#B9C99A" strokeWidth="1" strokeDasharray="3,3"/>
        <text x={OKINAWA_INSET.x-2} y={OKINAWA_INSET.y-4} fontSize="9" fill={C.muted} fontWeight="700">沖縄（位置は模式的）</text>
        <ellipse cx={OKINAWA_INSET.x+16} cy={OKINAWA_INSET.y+18} rx="12" ry="7" fill="#DCE9C8" stroke="#B9C99A" strokeWidth="1.2"/>
        <ellipse cx={OKINAWA_INSET.x+46} cy={OKINAWA_INSET.y+26} rx="7" ry="4.5" fill="#DCE9C8" stroke="#B9C99A" strokeWidth="1.2"/>
      </svg>

      {REGION_BLOCKS.filter(b=>b.name!=="九州・沖縄").map(b => (
        <Pin key={b.name} name={b.name} x={MAP_PINS[b.name].x} y={MAP_PINS[b.name].y}
          isSelected={selectedBlock===b.name} onClick={()=>onSelectBlock(b.name)}/>
      ))}
      {/* 「九州・沖縄」ブロックは九州本島と沖縄インセットの2箇所にピンを置き、どちらからでも選択可能にする */}
      <Pin name="九州" x={MAP_PINS["九州・沖縄"].x} y={MAP_PINS["九州・沖縄"].y}
        isSelected={selectedBlock==="九州・沖縄"} onClick={()=>onSelectBlock("九州・沖縄")}
        colorOverride={BLOCK_ACCENTS["九州・沖縄"]}/>
      <Pin name="沖縄" x={OKINAWA_INSET.x+30} y={OKINAWA_INSET.y+40}
        isSelected={selectedBlock==="九州・沖縄"} onClick={()=>onSelectBlock("九州・沖縄")}
        colorOverride={BLOCK_ACCENTS["九州・沖縄"]} small/>
    </div>
  );
}

export function MigrationMap({ onSelectPrefecture }) {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [openPref, setOpenPref] = useState(null);
  const block = REGION_BLOCKS.find(b => b.name === selectedBlock);

  return (
    <div>
      <h3 style={{ color:C.green, marginBottom:4, fontSize:16 }}>🗾 移住・就農先マップ</h3>
      <p style={{ color:C.muted, fontSize:13, marginBottom:8, lineHeight:1.8 }}>
        地図の地方をクリックすると、その地方の都道府県が一覧表示されます。都道府県をクリックすると、支援制度の概要・名産品・移住先としての魅力がわかります。ピンとくる地域が見つかったら、そのまま農地を探してみましょう。
      </p>
      <div style={{ display:"inline-block", background:C.paleGreen, border:"1px solid #B8D98A", borderRadius:20,
        padding:"4px 14px", fontSize:11, color:C.green, fontWeight:700, marginBottom:16 }}>
        📅 支援制度情報は{formatVerifiedDate(DATA_VERIFIED_ON)}時点で確認したものです（都道府県ごとに随時変更されます）
      </div>

      <JapanMap selectedBlock={selectedBlock} onSelectBlock={name => setSelectedBlock(name===selectedBlock?null:name)}/>

      {!block && (
        <p style={{ textAlign:"center", color:C.muted, fontSize:12.5, marginTop:4 }}>
          ↑ 地図の地方をクリックしてください
        </p>
      )}

      {block && (
        <div style={{ marginTop:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:BLOCK_ACCENTS[block.name] }}/>
            <span style={{ fontSize:13, fontWeight:700, color:C.deepGreen }}>{block.name}</span>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {block.prefs.map(pref => (
              <button key={pref} onClick={()=>setOpenPref(pref)}
                style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:20,
                  padding:"7px 16px", fontSize:12.5, fontWeight:600, color:C.text, cursor:"pointer" }}>
                {pref}
              </button>
            ))}
          </div>
        </div>
      )}

      {openPref && (
        <DetailModal pref={openPref} onClose={()=>setOpenPref(null)} onSelectPrefecture={onSelectPrefecture}/>
      )}
    </div>
  );
}
