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

const BENEFITS = [
  { icon:"💴", title:"掲載料は当面無料", desc:"フェーズ1（登録農地数拡大期間）は、掲載・マッチングにかかる費用はいただいていません。追加費用の心配なく、まずは登録して様子を見ることができます。" },
  { icon:"🧑‍🌾", title:"荒らさずに活用してもらえる", desc:"自分では管理しきれない農地を、就農希望者や移住希望者に使ってもらうことで、荒れ地化を防ぎながら土地を維持できます。" },
  { icon:"💰", title:"収入につながる可能性", desc:"貸し出し条件によっては、賃料収入を得られる場合があります（条件は借り手との話し合いで決めていただきます）。" },
  { icon:"🏞️", title:"地域の景観・環境の維持", desc:"耕作されることで、雑草や病害虫の発生源になることを防ぎ、周辺の農地や住宅への悪影響、鳥獣被害の増加も抑えられます。" },
  { icon:"📨", title:"手間をかけずに募集できる", desc:"登録は数分で完了。問い合わせが届いたらメールでお知らせするので、四六時中サイトを確認する必要はありません。" },
  { icon:"🤝", title:"地域の担い手支援に貢献", desc:"新規就農希望者に農地を提供することは、後継者不足に悩む地域の農業を支える一助にもなります。" },
];

const RISKS = [
  { icon:"🌿", title:"雑草・害虫の発生源に", desc:"数年放置された農地は雑草や灌木に覆われやすく、種子や病害虫が周辺の農地・住宅に広がる原因になることがあります。" },
  { icon:"🐗", title:"鳥獣被害の増加", desc:"手入れされていない土地はイノシシやシカなどの住処・通り道になりやすく、周辺の営農にも被害が及ぶことがあります。" },
  { icon:"🏛️", title:"「遊休農地」として行政指導の対象に", desc:"耕作されない状態が続くと、農業委員会から利用意向調査や指導の対象となる場合があります。" },
  { icon:"🧾", title:"税制上の優遇が受けられなくなることも", desc:"自治体によっては、遊休農地に対する課税上の特例が受けられなくなるなど、税負担の面で不利になるケースがあります。" },
  { icon:"📉", title:"再生コストが増え、選択肢が狭まる", desc:"放置期間が長くなるほど、雑木や竹の繁茂など原状回復にかかる手間・費用が増え、「貸す」「売る」といった選択肢そのものが取りづらくなっていきます。" },
];

function CardGrid({ items }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(230px, 1fr))", gap:14, margin:"20px 0" }}>
      {items.map(item => (
        <div key={item.title} style={{ background:C.cream, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"16px 18px" }}>
          <div style={{ fontSize:20, marginBottom:8 }}>{item.icon}</div>
          <div style={{ fontSize:13.5, fontWeight:800, color:C.deepGreen, marginBottom:6 }}>{item.title}</div>
          <div style={{ fontSize:12.5, color:C.text, lineHeight:1.8 }}>{item.desc}</div>
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

export function OwnerGuide({ onBack, onGoApp }) {
  useSeo(
    "遊休農地オーナー向けガイド：登録のメリットと放置のリスク | Farmatch",
    "使っていない農地を登録することで得られるメリットと、放置し続けることで生じるリスク（雑草・害虫、鳥獣被害、行政指導、税制上の不利益など）をまとめて解説します。"
  );
  return (
    <div style={{ background:C.cream, minHeight:"100vh", fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif" }}>
      <PageLayout
        title="遊休農地オーナー向けガイド：登録のメリットと放置のリスク"
        lead="「使っていない農地があるけれど、どうしたらいいかわからない」という方に向けて、Farmatchに登録することで得られるメリットと、逆に放置し続けた場合に起こり得るリスクをまとめました。"
        onBack={onBack}
      >
        <H2 icon="✅">登録すると得られるメリット</H2>
        <P>
          Farmatchに農地を登録することで、次のようなメリットが期待できます。登録は無料で、掲載後の管理もシンプルです。
        </P>
        <CardGrid items={BENEFITS}/>

        <H2 icon="⚠️">放置し続けることで生じるリスク</H2>
        <P>
          一方で、耕作されないまま放置された農地は、時間が経つほど次のようなリスクが大きくなっていきます。「とりあえず今のまま」という選択が、後になって選択肢を狭めてしまうことも少なくありません。
        </P>
        <CardGrid items={RISKS}/>
        <P>
          <span style={{ fontSize:12, color:C.muted }}>
            ※税制上の取り扱いや行政指導の詳細は、地域や農地の状況によって異なります。詳しくは地元の農業委員会・自治体窓口にご確認ください。
          </span>
        </P>

        <H2 icon="📝">登録の流れ</H2>
        <P>
          Farmatchでの掲載はとてもシンプルです。会員登録後、農地の基本情報（所在地・広さ・状況など）を入力するだけで、数分で掲載が完了します。掲載後は、就農希望者からの問い合わせをメールで受け取り、直接やり取りしながら条件を相談できます（契約手続き自体は当事者間・地元の農業委員会を通じて進めていただきます）。
        </P>

        <CtaBox
          onGoApp={onGoApp}
          label="🌾 使っていない農地を登録してみませんか？"
          desc="登録は無料・数分で完了します。まずはどんな形で掲載されるのか、気軽に試してみてください。"
          buttonLabel="農地を登録してみる"
        />
      </PageLayout>
    </div>
  );
}
