const C = {
  deepGreen:"#1E3D0F", green:"#2D5016", lightGreen:"#7AB648", paleGreen:"#EDF5E1",
  cream:"#F5F0E8", white:"#FFFFFF", text:"#1A1A1A", muted:"#6B6B6B", border:"#E0D8CC",
};

function LegalPage({ title, onBack, children }) {
  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"32px 20px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.green,
        fontSize:13, cursor:"pointer", marginBottom:24, padding:0, fontWeight:600 }}>
        ← Farmatchに戻る
      </button>
      <div style={{ background:C.white, borderRadius:16, padding:"32px 40px",
        border:`2px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32,
          paddingBottom:20, borderBottom:`2px solid ${C.border}` }}>
          <span style={{ fontSize:32 }}>🌱</span>
          <div>
            <div style={{ fontSize:11, color:C.lightGreen, letterSpacing:3, marginBottom:4 }}>FARMATCH JAPAN</div>
            <h1 style={{ margin:0, fontSize:22, color:C.deepGreen, fontWeight:800 }}>{title}</h1>
          </div>
        </div>
        {children}
        <div style={{ marginTop:40, paddingTop:20, borderTop:`1px solid ${C.border}`,
          fontSize:12, color:C.muted, textAlign:"center" }}>
          © 2025 Farmatch — 全国の遊休農地有効活用プロジェクト
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:28 }}>
      <h2 style={{ fontSize:15, color:C.green, fontWeight:700, marginBottom:10,
        paddingBottom:6, borderBottom:`1px solid ${C.border}` }}>{title}</h2>
      <div style={{ fontSize:13, color:C.text, lineHeight:1.9 }}>{children}</div>
    </div>
  );
}

export function TermsPage({ onBack }) {
  return (
    <LegalPage title="利用規約" onBack={onBack}>
      <Section title="第1条（適用）">
        本規約は、Farmatch（以下「当サービス」）が提供するサービスの利用条件を定めるものです。ユーザーの皆さまには、本規約に従って当サービスをご利用いただきます。
      </Section>
      <Section title="第2条（利用登録）">
        登録希望者が当サービスの定める方法によって利用登録を申請し、当サービスがこれを承認することによって、利用登録が完了するものとします。当サービスは、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあります。
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li>虚偽の事項を届け出た場合</li>
          <li>本規約に違反したことがある者からの申請である場合</li>
          <li>その他、当サービスが利用登録を相当でないと判断した場合</li>
        </ul>
      </Section>
      <Section title="第3条（禁止事項）">
        ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>当サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
          <li>当サービスの運営を妨害するおそれのある行為</li>
          <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
          <li>不正アクセスをし、またはこれを試みる行為</li>
          <li>他のユーザーに成りすます行為</li>
          <li>虚偽の農地・物件情報を登録する行為</li>
        </ul>
      </Section>
      <Section title="第4条（本サービスの提供の停止等）">
        当サービスは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
          <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
          <li>その他、当サービスが本サービスの提供が困難と判断した場合</li>
        </ul>
      </Section>
      <Section title="第5条（免責事項）">
        当サービスは、当サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。ただし、当サービスに関するユーザーとの契約が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。農地・物件の取引はユーザー間で行われるものであり、当サービスはその仲介を行うプラットフォームです。
      </Section>
      <Section title="第6条（サービス内容の変更等）">
        当サービスは、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
      </Section>
      <Section title="第7条（利用規約の変更）">
        当サービスは、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の利用規約は、当サービス上に掲載した時点で効力を生じるものとします。
      </Section>
      <Section title="第8条（準拠法・裁判管轄）">
        本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当サービスの所在地を管轄する裁判所を専属的合意管轄とします。
      </Section>
      <div style={{ background:C.paleGreen, borderRadius:8, padding:"12px 16px",
        fontSize:12, color:C.muted, marginTop:8 }}>
        制定日：2025年1月1日　最終更新日：2025年1月1日
      </div>
    </LegalPage>
  );
}

export function PrivacyPage({ onBack }) {
  return (
    <LegalPage title="プライバシーポリシー" onBack={onBack}>
      <Section title="第1条（個人情報の定義）">
        「個人情報」とは、個人情報保護法にいう「個人情報」を指し、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報を指します。
      </Section>
      <Section title="第2条（個人情報の収集方法）">
        当サービスは、ユーザーが利用登録をする際に氏名、メールアドレス、電話番号などの個人情報をお尋ねすることがあります。また、ユーザーと提携先などとの間でなされたユーザーの個人情報を含む取引記録や決済に関する情報を、当サービスの提携先（決済会社等を含む）などから収集することがあります。
      </Section>
      <Section title="第3条（個人情報を収集・利用する目的）">
        当サービスが個人情報を収集・利用する目的は以下のとおりです。
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li>当サービスのサービス提供・運営のため</li>
          <li>ユーザーからのお問い合わせに回答するため</li>
          <li>農地・物件のマッチングサービスを提供するため</li>
          <li>メンテナンス・重要なお知らせなどのご連絡のため</li>
          <li>利用規約に違反したユーザーや不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
          <li>上記の利用目的に付随する目的</li>
        </ul>
      </Section>
      <Section title="第4条（個人情報の第三者提供）">
        当サービスは、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
          <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
          <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
        </ul>
      </Section>
      <Section title="第5条（個人情報の開示）">
        当サービスは、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。
      </Section>
      <Section title="第6条（個人情報の訂正および削除）">
        ユーザーは、当サービスの保有する自己の個人情報が誤った情報である場合には、当サービスが定める手続きにより、当サービスに対して個人情報の訂正、追加または削除（以下「訂正等」）を請求することができます。
      </Section>
      <Section title="第7条（Cookieの使用）">
        当サービスは、ユーザーエクスペリエンスの向上のためにCookieを使用することがあります。Cookieはブラウザの設定から無効にすることができますが、一部のサービスが利用できなくなる場合があります。
      </Section>
      <Section title="第8条（お問い合わせ窓口）">
        本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
        <div style={{ background:C.paleGreen, borderRadius:8, padding:"12px 16px", marginTop:12 }}>
          メールアドレス：support@farmatch.net
        </div>
      </Section>
      <div style={{ background:C.paleGreen, borderRadius:8, padding:"12px 16px",
        fontSize:12, color:C.muted, marginTop:8 }}>
        制定日：2025年1月1日　最終更新日：2025年1月1日
      </div>
    </LegalPage>
  );
}
