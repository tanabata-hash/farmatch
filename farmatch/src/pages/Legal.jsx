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

function InfoBox({ children }) {
  return (
    <div style={{ background:C.paleGreen, borderRadius:8, padding:"14px 16px",
      fontSize:13, color:C.text, lineHeight:1.8, marginTop:8 }}>
      {children}
    </div>
  );
}

export function TermsPage({ onBack }) {
  return (
    <LegalPage title="利用規約" onBack={onBack}>
      <div style={{ background:"#FFF8E1", border:"1px solid #FFD54F", borderRadius:8,
        padding:"12px 16px", marginBottom:24, fontSize:12, color:"#795548" }}>
        制定日：2025年1月1日　最終更新日：2025年1月1日
      </div>

      <Section title="第1条（適用）">
        本規約は、Farmatch（以下「当サービス」）が提供する農地・住居マッチングサービスの利用条件を定めるものです。ユーザーの皆さまには、本規約に従って当サービスをご利用いただきます。本規約に同意いただけない場合は、当サービスのご利用をお控えください。
      </Section>

      <Section title="第2条（運営者情報）">
        <InfoBox>
          運営者：準備中<br/>
          所在地：準備中<br/>
          連絡先：support@farmatch.net<br/>
          ※法人化準備中につき、詳細は順次更新いたします。
        </InfoBox>
      </Section>

      <Section title="第3条（利用登録）">
        登録希望者が当サービスの定める方法によって利用登録を申請し、当サービスがこれを承認することによって、利用登録が完了するものとします。当サービスは、以下の事由があると判断した場合、利用登録の申請を承認しないことがあります。
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li>虚偽の事項を届け出た場合</li>
          <li>本規約に違反したことがある者からの申請である場合</li>
          <li>未成年者が法定代理人の同意なく申請した場合</li>
          <li>その他、当サービスが利用登録を相当でないと判断した場合</li>
        </ul>
      </Section>

      <Section title="第4条（未成年者の利用）">
        未成年者が当サービスを利用する場合は、法定代理人（親権者等）の同意が必要です。未成年者が本規約に同意した場合、法定代理人の同意を得たものとみなします。
      </Section>

      <Section title="第5条（禁止事項）">
        ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>当サービスのサーバーまたはネットワークの機能を破壊・妨害する行為</li>
          <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
          <li>不正アクセスをし、またはこれを試みる行為</li>
          <li>他のユーザーに成りすます行為</li>
          <li>虚偽の農地・物件情報を登録する行為</li>
          <li>当サービスを通じて知り得た情報を第三者に無断で提供する行為</li>
        </ul>
      </Section>

      <Section title="第6条（有料サービスと料金）">
        当サービスは、以下の有料プランを提供します。
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li>農地・物件オーナー向けベーシック掲載：¥3,000/月</li>
          <li>農地・物件オーナー向けプレミアム掲載：¥5,000/月</li>
          <li>就農希望者向けプレミアム会員：¥1,480/月</li>
        </ul>
        料金は月額制とし、登録した翌月から発生します。決済はStripeを通じて行われます。
      </Section>

      <Section title="第7条（解約・返金）">
        有料プランの解約はいつでも可能です。解約後は当月末まで引き続きサービスをご利用いただけます。原則として既にお支払いいただいた料金の返金はいたしません。ただし、当サービスの重大な瑕疵により正常にサービスを提供できなかった場合はこの限りではありません。
      </Section>

      <Section title="第8条（サービスの停止等）">
        当サービスは、以下のいずれかの事由がある場合、ユーザーに事前通知なく本サービスの全部または一部の提供を停止・中断することができます。
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li>システムの保守点検または更新を行う場合</li>
          <li>地震・落雷・火災・停電などの不可抗力により提供が困難となった場合</li>
          <li>その他、当サービスが提供困難と判断した場合</li>
        </ul>
      </Section>

      <Section title="第9条（免責事項）">
        当サービスは農地・物件のマッチングを仲介するプラットフォームです。実際の取引はユーザー間で行われるものであり、当サービスは取引の内容・結果について一切の責任を負いません。ただし、消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。
      </Section>

      <Section title="第10条（知的財産権）">
        当サービス上のコンテンツ（テキスト・画像・デザイン等）の著作権は当サービスまたは正当な権利者に帰属します。ユーザーが登録した農地・物件情報の著作権はユーザーに帰属しますが、当サービスはサービス改善・宣伝目的でこれを利用できるものとします。
      </Section>

      <Section title="第11条（利用規約の変更）">
        当サービスは、必要と判断した場合、ユーザーに通知のうえ本規約を変更することができます。変更後も当サービスをご利用いただいた場合、変更後の規約に同意したものとみなします。
      </Section>

      <Section title="第12条（準拠法・裁判管轄）">
        本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を専属的合意管轄とします。
      </Section>
    </LegalPage>
  );
}

export function PrivacyPage({ onBack }) {
  return (
    <LegalPage title="プライバシーポリシー" onBack={onBack}>
      <div style={{ background:"#FFF8E1", border:"1px solid #FFD54F", borderRadius:8,
        padding:"12px 16px", marginBottom:24, fontSize:12, color:"#795548" }}>
        制定日：2025年1月1日　最終更新日：2025年1月1日
      </div>

      <Section title="第1条（個人情報の定義）">
        「個人情報」とは、個人情報保護法にいう「個人情報」を指し、氏名・生年月日・住所・電話番号・メールアドレスその他の記述により特定の個人を識別できる情報を指します。
      </Section>

      <Section title="第2条（収集する情報）">
        当サービスは以下の情報を収集することがあります。
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li>氏名・メールアドレス（利用登録時）</li>
          <li>農地・物件情報（掲載登録時）</li>
          <li>問い合わせ内容・メッセージ</li>
          <li>決済情報（Stripeを経由して処理、当サービスはカード番号を保持しません）</li>
          <li>アクセスログ・利用履歴</li>
        </ul>
      </Section>

      <Section title="第3条（利用目的）">
        収集した個人情報は以下の目的で利用します。
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li>サービスの提供・運営</li>
          <li>農地・物件のマッチング</li>
          <li>お問い合わせへの対応</li>
          <li>重要なお知らせの送信</li>
          <li>サービス改善・分析</li>
          <li>不正利用の防止</li>
        </ul>
      </Section>

      <Section title="第4条（第三者サービスの利用）">
        当サービスは以下の第三者サービスを利用しており、それぞれのプライバシーポリシーが適用されます。
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li><strong>Supabase</strong>：データベース・認証サービス（米国）</li>
          <li><strong>Vercel</strong>：ホスティングサービス（米国）</li>
          <li><strong>Stripe</strong>：決済処理サービス（米国）※導入予定</li>
        </ul>
        これらのサービスへのデータ移転は、各社のデータ保護方針に基づいて行われます。
      </Section>

      <Section title="第5条（第三者提供の制限）">
        当サービスは、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li>法令に基づく場合</li>
          <li>人の生命・身体・財産の保護のために必要な場合</li>
          <li>公衆衛生の向上または児童の健全な育成のために必要な場合</li>
          <li>国・地方公共団体への協力が必要な場合</li>
        </ul>
      </Section>

      <Section title="第6条（データの保存期間）">
        個人情報は、利用目的の達成に必要な期間保存します。退会後は、法令上の保存義務がある場合を除き、合理的な期間内に削除します。
      </Section>

      <Section title="第7条（開示・訂正・削除）">
        ユーザーは、当サービスが保有する自己の個人情報について、開示・訂正・削除を請求できます。請求はsupport@farmatch.netまでご連絡ください。本人確認の上、合理的な期間内に対応します。
      </Section>

      <Section title="第8条（Cookieおよびアクセス解析）">
        当サービスはCookieを使用してユーザー体験の向上を図ります。Cookieはブラウザの設定から無効にできますが、一部機能が利用できなくなる場合があります。現時点ではGoogle Analytics等の外部解析ツールは使用していません。導入する場合は本ポリシーを更新します。
      </Section>

      <Section title="第9条（セキュリティ）">
        当サービスは個人情報の漏洩・滅失・毀損を防止するため、適切なセキュリティ対策を講じます。ただし、インターネット上での完全な安全性を保証するものではありません。
      </Section>

      <Section title="第10条（お問い合わせ窓口）">
        個人情報の取り扱いに関するお問い合わせは以下までご連絡ください。
        <InfoBox>
          運営者：準備中<br/>
          メールアドレス：support@farmatch.net<br/>
          対応時間：平日10:00〜18:00（土日祝除く）
        </InfoBox>
      </Section>

      <Section title="第11条（プライバシーポリシーの変更）">
        当サービスは、法令の変更やサービス内容の変更に伴い、本ポリシーを改定することがあります。重要な変更がある場合はサービス上でお知らせします。
      </Section>
    </LegalPage>
  );
}

export function SpecifiedCommercialPage({ onBack }) {
  return (
    <LegalPage title="特定商取引法に基づく表記" onBack={onBack}>
      <div style={{ background:"#FFF8E1", border:"1px solid #FFD54F", borderRadius:8,
        padding:"12px 16px", marginBottom:24, fontSize:12, color:"#795548" }}>
        ※有料サービス開始に伴い整備予定。現在準備中です。
      </div>

      <Section title="販売事業者">
        <InfoBox>
          事業者名：準備中<br/>
          代表者名：準備中<br/>
          所在地：準備中<br/>
          電話番号：準備中（メールにて対応）<br/>
          メールアドレス：support@farmatch.net
        </InfoBox>
      </Section>

      <Section title="販売価格">
        各サービスページに表示の価格（税込）
        <ul style={{ marginTop:8, paddingLeft:20 }}>
          <li>就農希望者向けプレミアム会員：¥1,480/月（税込）</li>
          <li>農地・物件オーナー向けベーシック掲載：¥3,000/月（税込）</li>
          <li>農地・物件オーナー向けプレミアム掲載：¥5,000/月（税込）</li>
        </ul>
      </Section>

      <Section title="支払方法・支払時期">
        クレジットカード決済（Stripe）。月額制のため、登録月の翌月から毎月自動引き落とし。
      </Section>

      <Section title="サービス提供時期">
        決済完了後、即時にサービスをご利用いただけます。
      </Section>

      <Section title="返品・解約">
        月額サービスのため返品は対象外です。解約はマイページからいつでも可能です。解約後は当月末まで利用可能で、日割り返金はいたしません。
      </Section>
    </LegalPage>
  );
}
