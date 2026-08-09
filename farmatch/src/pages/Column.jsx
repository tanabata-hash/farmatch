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

function ColumnLayout({ title, onBack, children }) {
  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"32px 20px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.green,
        fontSize:13, cursor:"pointer", marginBottom:24, padding:0, fontWeight:600 }}>
        ← Farmatchに戻る
      </button>
      <article style={{ background:C.white, borderRadius:16, padding:"36px 40px",
        border:`2px solid ${C.border}` }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, color:C.lightGreen, letterSpacing:3, marginBottom:8 }}>FARMATCH JAPAN コラム</div>
          <h1 style={{ margin:0, fontSize:24, color:C.deepGreen, fontWeight:800, lineHeight:1.5 }}>{title}</h1>
        </div>
        {children}
      </article>
    </div>
  );
}

function P({ children }) {
  return <p style={{ fontSize:14, color:C.text, lineHeight:1.95, marginBottom:16 }}>{children}</p>;
}

function H2({ children }) {
  return <h2 style={{ fontSize:17, color:C.green, fontWeight:700, marginTop:36, marginBottom:14,
    paddingBottom:8, borderBottom:`1px solid ${C.border}` }}>{children}</h2>;
}

function H3({ children }) {
  return <h3 style={{ fontSize:15, color:C.text, fontWeight:700, marginTop:20, marginBottom:8 }}>{children}</h3>;
}

function Li({ children }) {
  return <li style={{ fontSize:14, color:C.text, lineHeight:1.9, marginBottom:6 }}>{children}</li>;
}

function CtaBox({ onGoApp }) {
  return (
    <div style={{ background:C.paleGreen, border:`1.5px solid #B8D98A`, borderRadius:12,
      padding:"22px 24px", margin:"32px 0", textAlign:"center" }}>
      <div style={{ fontSize:15, fontWeight:800, color:C.deepGreen, marginBottom:8 }}>
        🌱 実家の農地を、Farmatchで探している人に届けませんか？
      </div>
      <p style={{ fontSize:13, color:C.text, lineHeight:1.8, margin:"0 0 16px" }}>
        Farmatchは、全国の遊休農地と就農希望者・移住希望者をマッチングする無料のプラットフォームです。掲載料は当面無料。ログインすれば数分で登録でき、問い合わせが届いたらメールでお知らせします。
      </p>
      <button onClick={onGoApp} style={{ background:C.green, color:"#fff", border:"none",
        borderRadius:24, padding:"12px 28px", fontSize:14, fontWeight:800, cursor:"pointer" }}>
        Farmatchで農地を登録してみる（無料）
      </button>
    </div>
  );
}

export function InheritedFarmlandColumn({ onBack, onGoApp }) {
  useSeo(
    "実家の農地・空き家、相続したらどうする？活用方法と注意点まとめ | Farmatch",
    "実家の農地や空き家を相続した・する予定がある方向けに、活用方法（自分で管理・貸す・売る・農地バンクの利用等）や、農地を貸し出す際の流れ・注意点をわかりやすく解説します。"
  );
  return (
    <div style={{ background:C.cream, minHeight:"100vh", fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif" }}>
      <ColumnLayout title="実家の農地・空き家、相続したらどうする？活用方法と注意点まとめ" onBack={onBack}>
        <P>
          都市部で暮らしていると、ある日突然「実家の田んぼ（畑）をどうするか」という問題に直面することがあります。両親が高齢になった、あるいは相続をきっかけに、遠く離れた土地の管理を任されてしまった——そんな方に向けて、この記事では農地・空き家の主な活用方法と、特に「貸す」という選択肢を取る場合の流れ・注意点を整理します。
        </P>

        <H2>放置された農地はどうなるのか</H2>
        <P>
          耕作されないまま放置された農地は、数年で雑草や灌木に覆われ、周辺の農地や住宅に病害虫・雑草の種が広がる原因になります。行政上も「遊休農地」として扱われ、固定資産税の負担が続く一方で収益は生まれません。自治体によっては、遊休農地に対する指導や、固定資産税の軽減特例が受けられなくなるといった影響が出ることもあります。「とりあえず放置」は、時間が経つほど選択肢を狭めてしまう点に注意が必要です。
        </P>

        <H2>主な活用方法の選択肢</H2>
        <H3>①自分で管理・耕作する</H3>
        <P>
          週末だけ通う、定年後に戻って本格的に取り組むなど、自ら関わり続ける方法です。愛着のある土地を手放さずに済む一方、遠方在住の場合は移動の負担や継続的な管理コストが課題になります。
        </P>
        <H3>②第三者に貸し出す</H3>
        <P>
          自分で管理する時間がない場合、就農希望者や近隣の農家に貸し出すことで、土地を手放さずに有効活用してもらう方法です。賃料収入はそれほど大きくないケースが多いですが、「荒らさずに維持できる」「地域の担い手支援になる」というメリットがあります。
        </P>
        <H3>③売却する・農地中間管理機構等に預ける</H3>
        <P>
          今後関わる予定がない場合は、売却や、都道府県の農地中間管理機構（農地バンク）への貸付委託という方法もあります。手続きの窓口は地元の農業委員会になるため、まずは一度相談してみることをおすすめします。
        </P>

        <H2>「貸す」を選ぶ場合の基本的な流れ</H2>
        <ol style={{ paddingLeft:20, marginBottom:16 }}>
          <Li>借り手を探す（知人・地元の農業委員会への相談、またはFarmatchのようなマッチングサービスの利用）</Li>
          <Li>借り手と条件（賃料・期間・使用目的等）をすり合わせる</Li>
          <Li>農地の賃貸借には、農業委員会の許可（または農地中間管理機構を通じた手続き）が必要になります。許可を得ないまま耕作を始めると、契約が無効になる場合があるため、必ず事前に地元の農業委員会にご確認ください</Li>
          <Li>契約書を取り交わし、引き渡し</Li>
        </ol>
        <P>
          遠方在住の場合、③の手続きや契約書の準備が特にハードルになりがちです。地元の農業委員会や、行政書士・司法書士といった専門家に相談しながら進めるのが安心です。
        </P>

        <H2>まとめ</H2>
        <P>
          実家の農地・空き家の扱いに「正解」はなく、家族の状況や土地の条件によって最適な選択は変わります。ただし、放置する時間が長くなるほど選択肢が狭まっていくのは共通しています。まずは「貸せる状態かどうか」「借りたい人がいるかどうか」を知ることから始めてみてはいかがでしょうか。
        </P>

        <CtaBox onGoApp={onGoApp}/>

        <P>
          <span style={{ fontSize:12, color:C.muted }}>
            ※本記事は一般的な情報提供を目的としており、個別の法律・税務・農地手続きについて確定的なアドバイスを行うものではありません。実際の手続きにあたっては、必ず地元の農業委員会・専門家にご確認ください。
          </span>
        </P>
      </ColumnLayout>
    </div>
  );
}
