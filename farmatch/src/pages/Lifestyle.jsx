import { useEffect, useState } from "react";
import { LIFESTYLE_STYLES, LIFESTYLE_QUIZ, scoreQuiz } from "../lifestyle";

const C = {
  deepGreen:"#1E3D0F", green:"#2D5016", lightGreen:"#7AB648", paleGreen:"#EDF5E1",
  cream:"#F5F0E8", white:"#FFFFFF", text:"#1A1A1A", muted:"#6B6B6B", border:"#E0D8CC",
};

// 関わり方の紹介と「あなたに合う関わり方」診断ページ
export function LifestylePage({ onBack, onGoFarms }) {
  const [answers, setAnswers] = useState([]);
  const done = answers.length >= LIFESTYLE_QUIZ.length;
  const result = done ? scoreQuiz(answers) : null;

  useEffect(() => {
    const prev = document.title;
    document.title = "自分のペースで農のある暮らしを | Farmatch";
    return () => { document.title = prev; };
  }, []);

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"32px 20px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.green,
        fontSize:13, cursor:"pointer", marginBottom:24, padding:0, fontWeight:600 }}>
        ← Farmatchに戻る
      </button>
      <article style={{ background:C.white, borderRadius:16, padding:"36px 40px", border:`2px solid ${C.border}` }}>
        <div style={{ fontSize:11, color:C.lightGreen, letterSpacing:3, marginBottom:8 }}>FARMATCH JAPAN ライフスタイル</div>
        <h1 style={{ margin:"0 0 10px", fontSize:24, color:C.deepGreen, fontWeight:800, lineHeight:1.5 }}>
          自分のペースで、農のある暮らしを
        </h1>
        <p style={{ margin:"0 0 28px", fontSize:14, color:C.muted, lineHeight:1.9 }}>
          農地を一人で全部やる必要はありません。仲間と分担したり、週末だけ関わったり、
          荒れた農地を少しずつ整えたり。あなたに合った「関わり方」を選べます。
        </p>

        <h2 style={{ fontSize:17, color:C.green, fontWeight:700, margin:"0 0 14px" }}>7つの関わり方</h2>
        <div style={{ display:"grid", gap:12 }}>
          {LIFESTYLE_STYLES.map(s => (
            <div key={s.id} style={{ border:`1.5px solid ${C.border}`, borderRadius:12, padding:"14px 16px", background:C.cream }}>
              <div style={{ fontSize:15, fontWeight:800, color:C.deepGreen, marginBottom:4 }}>{s.icon} {s.name}</div>
              <div style={{ fontSize:13, color:C.text, lineHeight:1.8 }}>{s.summary}</div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.8, marginTop:4 }}>1日の例：{s.day}</div>
              <button onClick={()=>onGoFarms(s.tag)} style={{ marginTop:8, background:C.white, color:C.green,
                border:`1.5px solid ${C.green}`, borderRadius:20, padding:"4px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                「{s.tag}」の農地を見る →
              </button>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize:17, color:C.green, fontWeight:700, margin:"40px 0 14px", paddingTop:8, borderTop:`1px solid ${C.border}` }}>
          あなたに合う関わり方診断（5問）
        </h2>
        {!done && (
          <div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>質問 {answers.length + 1} / {LIFESTYLE_QUIZ.length}</div>
            <div style={{ fontSize:15, fontWeight:700, color:C.deepGreen, marginBottom:12 }}>{LIFESTYLE_QUIZ[answers.length].q}</div>
            <div style={{ display:"grid", gap:8 }}>
              {LIFESTYLE_QUIZ[answers.length].options.map((o, i) => (
                <button key={o.label} onClick={()=>setAnswers([...answers, i])}
                  style={{ textAlign:"left", background:C.paleGreen, border:`1.5px solid ${C.lightGreen}`,
                    borderRadius:10, padding:"10px 14px", fontSize:13, cursor:"pointer", color:C.text }}>
                  {o.label}
                </button>
              ))}
            </div>
            {answers.length > 0 && (
              <button onClick={()=>setAnswers(answers.slice(0, -1))} style={{ marginTop:12, background:"none",
                border:"none", color:C.muted, fontSize:12, cursor:"pointer", padding:0 }}>← 前の質問に戻る</button>
            )}
          </div>
        )}
        {done && (
          <div>
            <div style={{ background:C.paleGreen, border:`2px solid ${C.lightGreen}`, borderRadius:12, padding:"18px 20px" }}>
              <div style={{ fontSize:12, color:C.muted }}>あなたにおすすめの関わり方</div>
              <div style={{ fontSize:20, fontWeight:800, color:C.deepGreen, margin:"4px 0 6px" }}>{result[0].style.icon} {result[0].style.name}</div>
              <div style={{ fontSize:13, lineHeight:1.8 }}>{result[0].style.summary}</div>
              <button onClick={()=>onGoFarms(result[0].style.tag)} style={{ marginTop:10, background:C.green, color:"#fff",
                border:"none", borderRadius:20, padding:"7px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                「{result[0].style.tag}」の農地を見る →
              </button>
            </div>
            <div style={{ fontSize:13, color:C.muted, marginTop:12 }}>
              次点：{result[1].style.icon} {result[1].style.name}
            </div>
            <button onClick={()=>setAnswers([])} style={{ marginTop:8, background:"none", border:"none",
              color:C.green, fontSize:12, cursor:"pointer", padding:0, textDecoration:"underline" }}>もう一度診断する</button>
          </div>
        )}

        <p style={{ marginTop:36, fontSize:11, color:C.muted, lineHeight:1.8 }}>
          ※ Farmatchは農地情報のマッチングと情報提供を行うサービスです。農地の貸借や利用には農業委員会の許可等が必要な場合があり、
          契約・手続きは当事者間で行っていただきます。荒れた農地の整備では、事前に農業委員会・自治体へご確認ください。
        </p>
      </article>
    </div>
  );
}
