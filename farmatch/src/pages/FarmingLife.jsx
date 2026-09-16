import { useEffect } from "react";

const C = {
  deepGreen:"#1E3D0F", green:"#2D5016", lightGreen:"#7AB648", paleGreen:"#EDF5E1",
  cream:"#F5F0E8", white:"#FFFFFF", text:"#1A1A1A", muted:"#6B6B6B", border:"#E0D8CC",
};

function useSeo(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    const prevDescription = meta?.getAttribute("content");
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
    return () => {
      document.title = prevTitle;
      if (meta && prevDescription != null) meta.setAttribute("content", prevDescription);
    };
  }, [title, description]);
}

function PageLayout({ title, lead, onBack, children }) {
  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"32px 20px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.green,
        fontSize:13, cursor:"pointer", marginBottom:24, padding:0, fontWeight:600 }}>
        ← Farmatchに戻る
      </button>
      <article style={{ background:C.white, borderRadius:16, padding:"36px 40px",
        border:`2px solid ${C.border}` }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, color:C.lightGreen, letterSpacing:3, marginBottom:8 }}>FARMATCH JAPAN ガイド</div>
          <h1 style={{ margin:"0 0 10px", fontSize:24, color:C.deepGreen, fontWeight:800, lineHeight:1.5 }}>{title}</h1>
          {lead && <p style={{ margin:0, fontSize:14, color:C.muted, lineHeight:1.9 }}>{lead}</p>}
        </div>
        {children}
      </article>
    </div>
  );
}

function P({ children }) {
  return <p style={{ fontSize:14, color:C.text, lineHeight:1.95, marginBottom:16 }}>{children}</p>;
}

function H2({ children, icon }) {
  return (
    <h2 style={{ fontSize:17, color:C.green, fontWeight:700, marginTop:40, marginBottom:16,
      paddingBottom:8, borderBottom:`1px solid ${C.border}` }}>
      {icon && <span style={{ marginRight:6 }}>{icon}</span>}{children}
    </h2>
  );
}

const STAGES = [
  { icon:"📚", time:"就農の半年〜1年ほど前", title:"就農準備期", accent:"#C97A4F", bg:"#FFF4E6",
    desc:"情報収集や研修への参加、資金・住まいの計画を進める時期です。就農相談窓口や先輩農家への相談、Farmatchのような農地マッチングサービスを使って、農地探しを始める方も多いタイミングです。" },
  { icon:"🌱", time:"就農1年目", title:"基盤づくりの時期", accent:C.lightGreen, bg:C.paleGreen,
    desc:"農地を借り、必要な機械や資材をそろえ、栽培技術を実践の中で身につけていく時期。収入はまだ不安定なことが多く、就農支援制度や研修先とのつながりを頼りに基礎を固めます。" },
  { icon:"🚜", time:"2〜5年目ごろ", title:"経営基盤期", accent:"#5B9BD5", bg:"#EAF3FC",
    desc:"栽培技術が安定しはじめ、販路開拓や設備投資など「経営」としての土台をつくる時期。地域の農家やJA、直売所などとのつながりも少しずつ広がっていきます。" },
  { icon:"📈", time:"5年目以降", title:"安定・発展期", accent:"#B98FD1", bg:"#F5EDFA",
    desc:"収穫量や品質が安定し、規模拡大や加工品づくり、観光農園、ECでの直接販売など、自分らしい経営スタイルを確立していく時期です。" },
  { icon:"🤝", time:"その先へ", title:"地域の担い手として", accent:C.green, bg:"#E7EFDC",
    desc:"地域の農業を支える存在として、新規就農者や後継者を受け入れたり、技術を伝えたりする役割を担うことも。次の世代へとバトンをつないでいきます。" },
];

function LifecycleTimeline() {
  return (
    <div style={{ position:"relative", margin:"24px 0 8px" }}>
      <div style={{ position:"absolute", left:23, top:8, bottom:8, width:2, background:C.border }}/>
      {STAGES.map((s, i) => (
        <div key={s.title} style={{ position:"relative", display:"flex", gap:16, marginBottom:i===STAGES.length-1?0:22 }}>
          <div style={{ position:"relative", zIndex:1, flexShrink:0, width:48, height:48, borderRadius:"50%",
            background:s.bg, border:`2px solid ${s.accent}`, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:20 }}>
            {s.icon}
          </div>
          <div style={{ flex:1, minWidth:0, paddingTop:4 }}>
            <div style={{ fontSize:11, color:C.muted, fontWeight:600, marginBottom:2 }}>{s.time}</div>
            <div style={{ fontSize:14.5, fontWeight:800, color:C.deepGreen, marginBottom:6 }}>
              STEP{i+1}　{s.title}
            </div>
            <div style={{ fontSize:13, color:C.text, lineHeight:1.85 }}>{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const DAY_SCHEDULE = [
  ["5:30", "起床・畑の様子を確認"],
  ["6:00〜9:00", "収穫や水やりなど、朝の作業"],
  ["9:00〜10:00", "朝食・休憩"],
  ["10:00〜12:00", "出荷準備、受発注やSNS発信などの事務作業"],
  ["12:00〜13:00", "昼休み"],
  ["13:00〜16:00", "畑仕事や設備のメンテナンス"],
  ["16:00〜18:00", "出荷・直売・配送"],
  ["18:00以降", "家族との時間、翌日の準備"],
];

function DaySchedule() {
  return (
    <div style={{ border:`1.5px solid ${C.border}`, borderRadius:12, overflow:"hidden", margin:"20px 0" }}>
      {DAY_SCHEDULE.map(([time, task], i) => (
        <div key={time} style={{ display:"flex", padding:"10px 16px",
          background:i%2===0?C.cream:C.white, borderBottom:i===DAY_SCHEDULE.length-1?"none":`1px solid ${C.border}` }}>
          <div style={{ width:110, flexShrink:0, fontSize:12.5, fontWeight:700, color:C.green }}>{time}</div>
          <div style={{ fontSize:13, color:C.text }}>{task}</div>
        </div>
      ))}
    </div>
  );
}

function CtaBox({ onGoApp, label, desc, buttonLabel }) {
  return (
    <div style={{ background:C.paleGreen, border:"1.5px solid #B8D98A", borderRadius:12,
      padding:"22px 24px", margin:"32px 0", textAlign:"center" }}>
      <div style={{ fontSize:15, fontWeight:800, color:C.deepGreen, marginBottom:8 }}>{label}</div>
      <p style={{ fontSize:13, color:C.text, lineHeight:1.8, margin:"0 0 16px" }}>{desc}</p>
      <button onClick={onGoApp} style={{ background:C.green, color:"#fff", border:"none",
        borderRadius:24, padding:"12px 28px", fontSize:14, fontWeight:800, cursor:"pointer" }}>
        {buttonLabel}
      </button>
    </div>
  );
}

export function FarmingLifeGuide({ onBack, onGoApp, onGoCalendar }) {
  useSeo(
    "就農後の生活はどうなる？ライフサイクルガイド | Farmatch",
    "就農準備から経営が安定するまでの流れや、農家の一日のモデルケースを図解。AIが多くの仕事を代替していく時代に、あらためて注目したい農業という生き方についても解説します。"
  );
  return (
    <div style={{ background:C.cream, minHeight:"100vh", fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif" }}>
      <PageLayout
        title="就農後の生活はどうなる？ライフサイクルガイド"
        lead="「就農したいけれど、実際の生活がイメージできない」——そんな方に向けて、就農準備から経営が軌道に乗るまでの流れと、農家の一日のモデルケースをまとめました。"
        onBack={onBack}
      >
        <H2 icon="🌾">就農後の5つのステージ</H2>
        <P>
          就農後の歩みは人によってさまざまですが、多くの場合、次のような段階を経て少しずつ経営が安定していきます。「いきなり一人前になる」のではなく、段階を踏みながら経験を積んでいくものだとイメージしておくと、就農後のギャップに戸惑いにくくなります。
        </P>
        <LifecycleTimeline/>

        <H2 icon="🕐">農家の一日（モデルケース）</H2>
        <P>
          季節や作物、経営スタイルによって大きく変わりますが、露地野菜を中心とした農家のある一日の例です。会社員時代とは異なり、天候や作物の状態に合わせて自分でスケジュールを組み立てられるのも、就農の特徴のひとつです。
        </P>
        <DaySchedule/>
        <P>
          <span style={{ fontSize:12, color:C.muted }}>
            ※繁忙期・閑散期や作物の種類によって作業内容・時間帯は大きく変動します。年間を通じた作業の流れは、Farmatchの「🗓 カレンダー」でも確認できます。
          </span>
        </P>
        {onGoCalendar && (
          <div style={{ textAlign:"center", marginBottom:8 }}>
            <button onClick={onGoCalendar} style={{ background:"none", border:`1.5px solid ${C.lightGreen}`,
              color:C.green, borderRadius:20, padding:"8px 20px", fontSize:12.5, fontWeight:700, cursor:"pointer" }}>
              🗓 年間の作業カレンダーを見る
            </button>
          </div>
        )}

        <H2 icon="🤖">AIの時代だからこそ、「農業」という選択</H2>
        <P>
          近年、生成AIをはじめとする技術の進化によって、事務作業や翻訳、プログラミング、カスタマーサポートなど、これまで「人にしかできない」と思われてきた仕事の多くがAIに置き換わりつつあります。「将来、自分の仕事はなくなってしまうのではないか」——そんな漠然とした不安を抱く方も少なくないでしょう。
        </P>
        <P>
          そんな時代だからこそ、あらためて注目したいのが「農業」という仕事です。土や気候、生き物と向き合う農業は、その日・その場所でしか判断できない要素の連続でできています。天候の変化を肌で感じ、作物の様子を目と手で確かめ、経験と勘を頼りに判断する——そうした「生きているものと向き合う仕事」は、AIにそのまま置き換えることが難しい領域です。
        </P>
        <P>
          もちろん、農業とAI・テクノロジーは対立するものではありません。天候データの分析や需要予測、スマート農業機器などをうまく取り入れれば、これまで人手に頼っていた重労働や単純作業の負担を減らし、人にしかできない判断や工夫、人と人との関係づくりに、より多くの時間を使えるようになります。
        </P>
        <P>
          そして農業は、「食」という誰にとっても欠かせないものを、自分の手で生み出せる仕事でもあります。多くの仕事がデータやディスプレイの中だけで完結していく時代だからこそ、土に触れ、汗をかき、育てたものを誰かに届けて喜ばれる——そうした手ざわりのある豊かさは、これからますます貴重なものになっていくはずです。
        </P>
        <P>
          Farmatchは、そんな「これからの時代の選択肢」としての農業を、一人でも多くの方が実際に始められるよう、全国の遊休農地と就農希望者をつなぐお手伝いをしています。まずはどんな農地があるのか、気軽に見てみることから始めてみませんか。
        </P>

        <CtaBox
          onGoApp={onGoApp}
          label="🌱 まずは農地を探してみませんか？"
          desc="Farmatchは、全国の遊休農地と就農希望者・移住希望者をマッチングする無料のプラットフォームです。会員登録すれば、気になる農地のオーナーに直接問い合わせできます。"
          buttonLabel="農地をさがしてみる"
        />
      </PageLayout>
    </div>
  );
}
