const C = {
  deepGreen: "#1E3D0F", green: "#2D5016",
  lightGreen: "#7AB648", paleGreen: "#EDF5E1",
  soil: "#C4883A", white: "#FFFFFF", text: "#1A1A1A",
  muted: "#6B6B6B", border: "#E0D8CC", cream: "#F5F0E8",
};

const TERMS = [
  { title:"第1条（サービスの概要）",
    body:"Farmatch（以下「本サービス」）は、農地オーナーと就農希望者・移住希望者をマッチングするプラットフォームサービスです。運営者（以下「当社」）は、本規約に従い本サービスを提供します。" },
  { title:"第2条（利用登録）",
    body:"本サービスの利用を希望する方は、本規約に同意の上、当社の定める方法により利用登録を申請してください。当社が登録を承認した時点で、利用契約が成立します。未成年者は保護者の同意を得た上でご利用ください。" },
  { title:"第3条（料金・決済）",
    body:"農地・物件の掲載料（月額3,000円〜5,000円）、プレミアム会員費（月額1,480円）、成約報酬（初月賃料の20%）、体験ツアー手数料（予約額の10%）が発生します。料金は前払いとし、クレジットカード等の当社指定の方法でお支払いください。" },
  { title:"第4条（禁止事項）",
    body:"本サービスにおいて、以下の行為を禁止します。①法令または公序良俗に違反する行為、②当社または第三者の知的財産権・プライバシーを侵害する行為、③虚偽情報の登録・提供、④本サービスを通じた農地法に違反する取引、⑤その他当社が不適切と判断する行為。" },
  { title:"第5条（農地取引に関する注意事項）",
    body:"本サービスはマッチングの仲介のみを行います。農地の賃貸借契約は利用者間で直接締結していただきます。農地法に基づく農業委員会への届出等の手続きはご自身でお手続きください。当社は農地取引の法的手続きについて責任を負いません。" },
  { title:"第6条（免責事項）",
    body:"当社は、本サービスを通じたマッチング結果・農地情報の正確性・完全性・有用性について保証しません。利用者間のトラブルについて当社は一切の責任を負いません。天災・通信障害等による本サービスの中断についても責任を負いません。" },
  { title:"第7条（個人情報の取扱い）",
    body:"当社は、別途定めるプライバシーポリシーに従い、利用者の個人情報を適切に管理・保護します。" },
  { title:"第8条（規約の変更）",
    body:"当社は必要に応じて本規約を変更できます。変更後は本サービス上に掲示し、掲示時点より効力が生じます。" },
  { title:"第9条（準拠法・管轄裁判所）",
    body:"本規約は日本法に準拠します。本サービスに関する紛争については、鹿児島地方裁判所を第一審の専属的合意管轄裁判所とします。" },
];

const PRIVACY = [
  { title:"1. 収集する個人情報",
    body:"氏名、メールアドレス、電話番号、住所、農地・物件情報、問い合わせ内容、利用履歴、決済情報（カード番号は除く）等を収集します。" },
  { title:"2. 個人情報の利用目的",
    body:"①本サービスの提供・運営、②マッチングの仲介、③お問い合わせへの対応、④利用料金の請求、⑤サービス改善・新機能開発、⑥メールマガジン等の情報提供（同意者のみ）に利用します。" },
  { title:"3. 個人情報の第三者提供",
    body:"法令に基づく場合を除き、ご本人の同意なく第三者に個人情報を提供しません。ただし、マッチング成立時には相手方に必要な連絡先情報を提供します。" },
  { title:"4. 個人情報の管理",
    body:"個人情報はSupabase（東京リージョン）上で管理し、適切なセキュリティ対策を実施します。不正アクセス・漏洩・紛失防止のための技術的・組織的対策を講じます。" },
  { title:"5. Cookieの使用",
    body:"本サービスはセッション管理・利便性向上のためCookieを使用します。ブラウザ設定によりCookieを無効化できますが、一部機能が利用できなくなる場合があります。" },
  { title:"6. 個人情報の開示・訂正・削除",
    body:"ご自身の個人情報の開示・訂正・削除をご希望の場合は、support@farmatch.netまでご連絡ください。本人確認後、合理的な期間内に対応します。" },
  { title:"7. お問い合わせ窓口",
    body:"個人情報の取扱いに関するお問い合わせは support@farmatch.net までご連絡ください。" },
];

function Section({ title, body }) {
  return (
    <div style={{ marginBottom:24 }}>
      <h3 style={{ color:C.text, fontSize:15, marginBottom:8, fontWeight:700 }}>{title}</h3>
      <p style={{ color:C.muted, fontSize:13, lineHeight:1.9, margin:0 }}>{body}</p>
    </div>
  );
}

export function TermsPage({ onBack }) {
  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"20px 16px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.green,
        fontSize:13, cursor:"pointer", marginBottom:20, padding:0, fontWeight:600 }}>
        ← トップに戻る
      </button>
      <h1 style={{ color:C.green, fontSize:22, marginBottom:6 }}>利用規約</h1>
      <p style={{ color:C.muted, fontSize:12, marginBottom:28 }}>最終更新日：2025年1月1日</p>
      {TERMS.map(s => <Section key={s.title} {...s} />)}
      <div style={{ background:C.paleGreen, borderRadius:8, padding:"14px 16px", marginTop:8 }}>
        <p style={{ color:C.green, fontSize:12, margin:0 }}>お問い合わせ：support@farmatch.net</p>
      </div>
    </div>
  );
}

export function PrivacyPage({ onBack }) {
  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"20px 16px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.green,
        fontSize:13, cursor:"pointer", marginBottom:20, padding:0, fontWeight:600 }}>
        ← トップに戻る
      </button>
      <h1 style={{ color:C.green, fontSize:22, marginBottom:6 }}>プライバシーポリシー</h1>
      <p style={{ color:C.muted, fontSize:12, marginBottom:28 }}>最終更新日：2025年1月1日</p>
      {PRIVACY.map(s => <Section key={s.title} {...s} />)}
      <div style={{ background:C.paleGreen, borderRadius:8, padding:"14px 16px", marginTop:8 }}>
        <p style={{ color:C.green, fontSize:12, margin:0 }}>お問い合わせ：support@farmatch.net</p>
      </div>
    </div>
  );
}
