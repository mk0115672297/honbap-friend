import { useState, useRef, useEffect, useCallback } from "react";
import { useRestaurants } from "./hooks/useRestaurants";
import RestaurantCard from "./components/RestaurantCard";
import CharacterPortrait from "./components/CharacterPortrait"
import KakaoMap from "./components/KakaoMap";

// ── 비용 절감 설정 ─────────────────────────────────────────────────────────
const FREE_MSG_LIMIT = 5          // 무료 대화 횟수 (누적)
const CHAT_MODEL  = "claude-haiku-4-5-20251001"
const DIARY_MODEL = "claude-haiku-4-5-20251001"

function getTotalMsgs() {
  try { return parseInt(localStorage.getItem("honbap_total_msgs") || "0") } 
  catch { return 0 }
}
function incrementTotalMsgs() {
  try {
    const n = getTotalMsgs() + 1
    localStorage.setItem("honbap_total_msgs", String(n))
    return n
  } catch { return 1 }
}

// ── 캐릭터 정의 ────────────────────────────────────────────────────────────
const CHARS = [
  { id:"jisu", name:"지수", age:26, job:"마케터", color:"#D85A30", bg:"#FAECE7", border:"#F0997B",
    tags:["밝은 말투","음식 덕후","MZ세대"], intro:"오늘 뭐 먹어요? 저도 배고파요~",
    prompt:`너는 '지수'야. 26살 밝고 활발한 마케터. 지금 사용자와 함께 밥 먹고 있어. 친구처럼 반말로 대화해. 음식, 오늘 있었던 일 등 가볍게. 2-3문장 짧게. 이모지 가끔.` },
  { id:"minjun", name:"민준", age:29, job:"요리사", color:"#1D9E75", bg:"#E1F5EE", border:"#5DCAA5",
    tags:["지적 대화","요리 전문가","차분함"], intro:"오늘 드시는 음식, 참 좋은 선택이에요.",
    prompt:`당신은 '민준'. 29살 차분한 요리사. 지금 함께 밥 먹는 중. 존댓말, 편안한 톤. 음식 지식 자연스럽게. 2-3문장.` },
  { id:"soyeon", name:"소연", age:32, job:"선생님", color:"#7F77DD", bg:"#EEEDFE", border:"#AFA9EC",
    tags:["공감형","따뜻함","위로"], intro:"오늘도 고생 많았죠? 밥은 천천히 먹어요.",
    prompt:`당신은 '소연'. 32살 따뜻한 선생님. 함께 밥 먹는 중. 언니처럼 따뜻하게 공감. 존댓말. 2-3문장.` },
  { id:"hyunwoo", name:"현우", age:27, job:"웹툰 작가", color:"#BA7517", bg:"#FAEEDA", border:"#EF9F27",
    tags:["유머","편한 말투","친구 같은"], intro:"야 그거 맛있어 보인다 ㅋㅋ 나도 한 입만!",
    prompt:`너는 '현우'. 27살 유머러스한 웹툰 작가. 함께 밥 먹는 중. 반말, 유머. ㅋㅋ 자연스럽게. 2-3문장.` },
];

// ── Claude API (Haiku + 프롬프트 캐싱) ────────────────────────────────────
async function callClaude(system, messages, onChunk, model = CHAT_MODEL) {
  const res = await fetch(import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-proxy`
    : "/api/claude/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      system: [{ type:"text", text:system, cache_control:{ type:"ephemeral" } }],
      stream: true,
      messages,
    }),
  });
  if (!res.ok) throw new Error("API " + res.status);
  let text = "";
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of dec.decode(value).split("\n")) {
      if (!line.startsWith("data: ")) continue;
      try {
        const d = JSON.parse(line.slice(6));
        if (d.type === "content_block_delta" && d.delta?.text) { text += d.delta.text; onChunk(text); }
      } catch {}
    }
  }
  return text || "...";
}

// ── 근처 맛집 화면 ─────────────────────────────────────────────────────────
function RestaurantsScreen({ onBack }) {
  const { restaurants, loading, error, fetch: fetchRests } = useRestaurants();
  useEffect(() => { fetchRests(); }, []);
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", maxHeight:700 }}>
      <div style={{ padding:"0.85rem 1rem", borderBottom:"0.5px solid #e5e5e5", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#888", padding:0, lineHeight:1 }}>←</button>
        <div>
          <h2 style={{ fontSize:16, fontWeight:500, margin:0 }}>📍 근처 혼밥 맛집</h2>
          <div style={{ fontSize:11, color:"#bbb", marginTop:1 }}>1인석 · 혼밥 친화 식당</div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"1rem" }}>
        {loading && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#1D9E75", animation:"pulse 1s ease-in-out infinite" }} />
              <span style={{ fontSize:13, color:"#888" }}>현재 위치에서 혼밥 맛집 검색 중...</span>
            </div>
            {[1,2,3,4].map(i => <div key={i} style={{ background:"#f0f0f0", borderRadius:12, height:80, marginBottom:8, opacity:1-i*0.15 }} />)}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
          </div>
        )}
        {!loading && error && (
          <div style={{ padding:"1.5rem 1rem" }}>
            <div style={{ textAlign:"center", marginBottom:"1rem" }}>
              <div style={{ fontSize:36, marginBottom:8 }}>📍</div>
              <p style={{ fontSize:14, color:"#555", fontWeight:500, marginBottom:6 }}>위치를 가져올 수 없어요</p>
              <p style={{ fontSize:12, color:"#888", lineHeight:1.6, margin:"0 0 1rem" }}>{error}</p>
              <button onClick={fetchRests}
                style={{ padding:"9px 24px", background:"#1D9E75", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:500 }}>
                🔄 다시 시도
              </button>
            </div>
            <div style={{ background:"#F0F9F4", borderRadius:12, padding:"0.9rem 1rem", marginTop:"0.75rem" }}>
              <p style={{ fontSize:12, color:"#0F6E56", margin:"0 0 6px", fontWeight:500 }}>📱 위치 허용 방법</p>
              <p style={{ fontSize:11, color:"#555", margin:0, lineHeight:1.7 }}>
                Chrome: 주소창 왼쪽 🔒 → 위치 → <b>허용</b><br/>
                Safari: 설정 → Safari → 위치 → <b>허용</b><br/>
                iPhone: 설정 → 개인 정보 보호 → 위치 서비스 → Safari → <b>앱 사용 중 허용</b>
              </p>
            </div>
          </div>
        )}
        {!loading && !error && restaurants.length === 0 && (
          <div style={{ textAlign:"center", padding:"2.5rem 1rem", color:"#bbb" }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🗺️</div>
            <p style={{ fontSize:13 }}>주변 500m 내 혼밥 식당을 찾지 못했어요</p>
          </div>
        )}
        {!loading && restaurants.length > 0 && (
          <div>
            {/* ✅ 카카오맵 지도 표시 */}
            <KakaoMap
              restaurants={restaurants}
              center={location}
              height={220}
            />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", margin:"10px 0 8px" }}>
              <span style={{ fontSize:12, color:"#888" }}>현재 위치 기준 가까운 순</span>
              <span style={{ fontSize:11, padding:"2px 9px", borderRadius:999, background:"#E1F5EE", color:"#0F6E56", fontWeight:500, border:"0.5px solid #5DCAA5" }}>
                {restaurants.length}곳 발견
              </span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
            <div style={{ marginTop:12, padding:"10px 14px", background:"#f9f9f9", borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:20 }}>🗺️</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:500 }}>카카오맵에서 더 보기</div>
                <div style={{ fontSize:11, color:"#bbb" }}>"혼밥 맛집" 전체 검색 결과</div>
              </div>
              <button onClick={() => window.open("https://map.kakao.com","_blank")}
                style={{ padding:"5px 12px", background:"#FEE500", color:"#333", border:"none", borderRadius:8, cursor:"pointer", fontSize:11, fontWeight:500, flexShrink:0 }}>
                열기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 캐릭터 선택 화면 ───────────────────────────────────────────────────────
function SelectScreen({ onSelect, onRestaurants }) {
  const usedMsgs  = getTotalMsgs()
  const remaining = Math.max(0, FREE_MSG_LIMIT - usedMsgs)
  const isLimited = usedMsgs >= FREE_MSG_LIMIT

  return (
    <div style={{ padding:"1.25rem 1rem" }}>
      <div style={{ textAlign:"center", marginBottom:"1.25rem" }}>
        <div style={{ fontSize:34, marginBottom:4 }}>🍚</div>
        <h1 style={{ fontSize:21, fontWeight:500, margin:"0 0 3px" }}>혼밥프렌드</h1>
        <p style={{ fontSize:12, color:"#888", margin:0 }}>AI 친구와 함께하는 즐거운 혼밥</p>
      </div>

      <div onClick={onRestaurants}
        style={{ background:"linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)", borderRadius:14, padding:"1rem 1.25rem", marginBottom:"1rem", cursor:"pointer", display:"flex", alignItems:"center", gap:12, transition:"opacity 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.opacity="0.9"}
        onMouseLeave={e => e.currentTarget.style.opacity="1"}>
        <div style={{ width:46, height:46, borderRadius:12, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>📍</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:500, color:"#fff", marginBottom:2 }}>근처 혼밥 맛집 찾기</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>카카오맵 · 현재 위치 기반</div>
        </div>
        <span style={{ color:"rgba(255,255,255,0.6)", fontSize:18 }}>›</span>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1rem" }}>
        <div style={{ flex:1, height:"0.5px", background:"#e5e5e5" }} />
        <span style={{ fontSize:11, color:"#bbb", whiteSpace:"nowrap" }}>AI 친구와 함께 식사</span>
        <div style={{ flex:1, height:"0.5px", background:"#e5e5e5" }} />
      </div>

      <div style={{ display:"flex", justifyContent:"center", marginBottom:"0.9rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6,
          background: isLimited ? "#FFF0F0" : "#F0F9F4",
          border:`0.5px solid ${isLimited ? "#FFB4B4" : "#9FE1CB"}`,
          borderRadius:999, padding:"5px 14px", fontSize:12 }}>
          <span style={{ fontSize:14 }}>{isLimited ? "🔒" : "💬"}</span>
          <span style={{ color: isLimited ? "#C04040" : "#0F6E56", fontWeight:500 }}>
            {isLimited
              ? "무료 대화를 모두 사용했어요"
              : remaining <= 2
              ? `무료 대화 ${remaining}회 남았어요`
              : `무료 체험 · ${remaining}회 대화 가능`}
          </span>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {CHARS.map(c => (
          <div key={c.id} onClick={() => onSelect(c)}
            style={{ background:"#fff", border:"0.5px solid #e5e5e5", borderRadius:14, padding:"0.75rem 1rem", cursor:"pointer", display:"flex", gap:12, alignItems:"center", transition:"border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = c.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e5e5"}>
            <div style={{ flexShrink:0 }}><CharacterPortrait id={c.id} size={64} /></div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:2 }}>
                <span style={{ fontSize:15, fontWeight:500 }}>{c.name}</span>
                <span style={{ fontSize:12, color:"#999" }}>{c.age}세 · {c.job}</span>
              </div>
              <p style={{ fontSize:12, color:c.color, margin:"0 0 6px", fontStyle:"italic" }}>"{c.intro}"</p>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                {c.tags.map(t => (
                  <span key={t} style={{ fontSize:10, padding:"2px 8px", borderRadius:999, background:c.bg, color:c.color, fontWeight:500, border:`0.5px solid ${c.border}` }}>{t}</span>
                ))}
              </div>
            </div>
            <span style={{ color:"#ccc", fontSize:18 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}


// ── 음식 사진 화면 ─────────────────────────────────────────────────────────
function FoodScreen({ char, onStart, onBack }) {
  const [preview, setPreview] = useState(null);
  const [b64, setB64] = useState(null);
  const fileRef = useRef(null);
  const handleFile = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => { setPreview(ev.target.result); setB64(ev.target.result.split(",")[1]); };
    r.readAsDataURL(f);
  };
  return (
    <div style={{ padding:"1.25rem 1rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1.25rem" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#888", padding:0 }}>←</button>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ flexShrink:0 }}><CharacterPortrait id={char.id} size={40} /></div>
          <div>
            <div style={{ fontSize:14, fontWeight:500 }}>{char.name}와 식사 준비</div>
            <div style={{ fontSize:11, color:char.color }}>{char.job} · {char.age}세</div>
          </div>
        </div>
      </div>
      <p style={{ fontSize:13, color:"#888", marginBottom:"1rem", textAlign:"center", lineHeight:1.6 }}>
        오늘 먹을 음식 사진을 올려주세요<br/>
        <span style={{ fontSize:11, color:"#bbb" }}>AI가 메뉴를 보고 자연스럽게 반응해요</span>
      </p>
      <input type="file" accept="image/*" ref={fileRef} onChange={handleFile} style={{ display:"none" }} />
      {preview
        ? <div style={{ position:"relative", marginBottom:"1rem" }}>
            <img src={preview} style={{ width:"100%", height:200, objectFit:"cover", borderRadius:12, display:"block", border:`1px solid ${char.border}` }} />
            <button onClick={() => { setPreview(null); setB64(null); }}
              style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.55)", border:"none", borderRadius:"50%", width:28, height:28, color:"#fff", cursor:"pointer", fontSize:15 }}>×</button>
            <div style={{ position:"absolute", bottom:8, left:8, background:"rgba(0,0,0,0.5)", borderRadius:6, padding:"3px 8px", fontSize:11, color:"#fff" }}>📸 인식 준비 완료</div>
          </div>
        : <div onClick={() => fileRef.current.click()}
            style={{ border:`1.5px dashed ${char.border}`, borderRadius:12, padding:"2.5rem 1rem", textAlign:"center", cursor:"pointer", marginBottom:"1rem", background:char.bg }}
            onMouseEnter={e => e.currentTarget.style.opacity="0.8"}
            onMouseLeave={e => e.currentTarget.style.opacity="1"}>
            <div style={{ fontSize:36, marginBottom:8 }}>📸</div>
            <p style={{ fontSize:13, color:char.color, margin:0, fontWeight:500 }}>클릭해서 음식 사진 추가</p>
          </div>}
      <button onClick={() => onStart(b64, preview)}
        style={{ width:"100%", padding:12, fontSize:14, fontWeight:500, background:char.color, color:"#fff", border:"none", borderRadius:10, cursor:"pointer", marginBottom:8 }}>
        {char.name}와 식사 시작하기 🍴
      </button>
      {!preview && (
        <button onClick={() => onStart(null, null)}
          style={{ width:"100%", padding:10, fontSize:12, background:"none", border:"0.5px solid #ddd", borderRadius:10, cursor:"pointer", color:"#888" }}>
          사진 없이 바로 시작하기
        </button>
      )}
    </div>
  );
}

// ── 공통 컴포넌트 ──────────────────────────────────────────────────────────
function Avatar({ char }) {
  return <div style={{ flexShrink:0 }}><CharacterPortrait id={char.id} size={36} /></div>;
}
function TypingDots() {
  return (
    <div style={{ background:"#f5f5f5", padding:"11px 14px", borderRadius:"16px 16px 16px 4px", display:"flex", gap:5, alignItems:"center" }}>
      {[0,0.2,0.4].map((d,i) => (
        <span key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#aaa", display:"inline-block", animation:`bounce 1.2s ${d}s ease-in-out infinite` }} />
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:0.4}40%{transform:translateY(-5px);opacity:1}}`}</style>
    </div>
  );
}

// ── 채팅 화면 ──────────────────────────────────────────────────────────────
function ChatScreen({ char, imgB64, imgPreview, onEnd }) {
  const [msgs, setMsgs]           = useState([]);
  const [history, setHistory]     = useState([]);
  const [input, setInput]         = useState("");
  const [stream, setStream]       = useState("");
  const [busy, setBusy]           = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [msgCount, setMsgCount]   = useState(getTotalMsgs);
  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, stream]);
  useEffect(() => {
    const userContent = imgB64
      ? [{ type:"image", source:{ type:"base64", media_type:"image/jpeg", data:imgB64 } }, { type:"text", text:"밥 먹으려고 해! 이게 오늘 내 밥이야." }]
      : "안녕! 밥 먹으려고 해.";
    const initH = [{ role:"user", content:userContent }];
    setBusy(true);
    callClaude(char.prompt, initH, t => setStream(t))
      .then(ai => { setHistory([...initH, { role:"assistant", content:ai }]); setMsgs([{ role:"ai", text:ai }]); setStream(""); })
      .catch(() => { setMsgs([{ role:"ai", text:"안녕! 같이 밥 먹자~ 😊" }]); setStream(""); })
      .finally(() => { setBusy(false); setTimeout(() => inputRef.current?.focus(), 100); });
  }, []);
  const sendMsg = useCallback(async () => {
    const txt = input.trim(); if (!txt || busy) return;

    // ✅ 무료 대화 한도 체크
    const used = getTotalMsgs();
    if (used >= FREE_MSG_LIMIT) {
      setShowUpgrade(true);
      return;
    }

    setInput("");
    const count = incrementTotalMsgs();      // 전송 시 카운트 증가
    setMsgCount(count);

    const newH = [...history, { role:"user", content:txt }];
    setHistory(newH); setMsgs(prev => [...prev, { role:"user", text:txt }]); setBusy(true);
    try {
      const ai = await callClaude(char.prompt, newH, t => setStream(t));
      setHistory([...newH, { role:"assistant", content:ai }]);
      setMsgs(prev => [...prev, { role:"ai", text:ai }]);
      // 마지막 무료 대화 후 업그레이드 안내
      if (count >= FREE_MSG_LIMIT) setShowUpgrade(true);
    } catch { setMsgs(prev => [...prev, { role:"ai", text:"(연결 오류가 발생했어요)" }]); }
    setStream(""); setBusy(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [input, busy, history, char]);
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", maxHeight:700 }}>
      <div style={{ padding:"0.7rem 1rem", borderBottom:"0.5px solid #e5e5e5", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ flexShrink:0 }}><CharacterPortrait id={char.id} size={42} /></div>
          <div>
            <div style={{ fontSize:14, fontWeight:500 }}>{char.name}</div>
            <div style={{ fontSize:11, display:"flex", alignItems:"center", gap:3 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:char.color, display:"inline-block" }} />
              <span style={{ color:char.color }}>식사 중</span>
            </div>
          </div>
        </div>
        <button onClick={() => onEnd(msgs)} disabled={busy}
          style={{ fontSize:12, padding:"6px 12px", background:"none", border:`0.5px solid ${char.border}`, borderRadius:8, cursor:busy?"default":"pointer", color:char.color, opacity:busy?0.5:1 }}>
          식사 마치기 ✓
        </button>
      </div>
      {imgPreview && (
        <div style={{ padding:"6px 1rem", borderBottom:"0.5px solid #e5e5e5", flexShrink:0, background:"#f9f9f9", display:"flex", alignItems:"center", gap:8 }}>
          <img src={imgPreview} style={{ height:44, width:44, objectFit:"cover", borderRadius:8 }} />
          <span style={{ fontSize:11, color:"#888" }}>오늘의 식사 🍽️</span>
        </div>
      )}
      <div style={{ flex:1, overflowY:"auto", padding:"1rem", display:"flex", flexDirection:"column", gap:10 }}>
        {msgs.length === 0 && busy && <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}><Avatar char={char}/><TypingDots/></div>}
        {msgs.map((m,i) => m.role==="ai"
          ? <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
              <Avatar char={char}/>
              <div style={{ maxWidth:"72%", padding:"10px 14px", fontSize:14, lineHeight:1.55, background:"#f5f5f5", borderRadius:"16px 16px 16px 4px" }}>{m.text}</div>
            </div>
          : <div key={i} style={{ display:"flex", justifyContent:"flex-end" }}>
              <div style={{ maxWidth:"72%", padding:"10px 14px", fontSize:14, lineHeight:1.55, background:char.color, color:"#fff", borderRadius:"16px 16px 4px 16px" }}>{m.text}</div>
            </div>
        )}
        {stream && (
          <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
            <Avatar char={char}/>
            <div style={{ maxWidth:"72%", padding:"10px 14px", fontSize:14, lineHeight:1.55, background:"#f5f5f5", borderRadius:"16px 16px 16px 4px" }}>
              {stream}<span style={{ opacity:0.4, marginLeft:2 }}>▋</span>
            </div>
          </div>
        )}
        {busy && !stream && msgs.length > 0 && <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}><Avatar char={char}/><TypingDots/></div>}
        <div ref={chatEndRef} />
      </div>
      {/* ✅ 업그레이드 배너 — 5회 한도 도달 시 표시 */}
      {showUpgrade && (
        <div style={{ padding:"0.85rem 1rem", background:"#FAECE7", borderTop:"1px solid #F0997B", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ fontSize:20 }}>✨</span>
            <span style={{ fontSize:13, fontWeight:500, color:"#3C1508" }}>무료 대화 {FREE_MSG_LIMIT}회를 모두 사용했어요!</span>
          </div>
          <p style={{ fontSize:12, color:"#993C1D", margin:"0 0 8px", lineHeight:1.5 }}>
            프리미엄으로 업그레이드하면 횟수 제한 없이<br/>언제든 AI 친구와 식사할 수 있어요
          </p>
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ flex:1, padding:"8px 0", textAlign:"center", background:"#D85A30", color:"#fff", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer" }}>
              월 4,900원 · 무제한 구독
            </div>
            <button onClick={() => setShowUpgrade(false)}
              style={{ padding:"8px 12px", background:"none", border:"0.5px solid #F0997B", borderRadius:8, fontSize:11, color:"#D85A30", cursor:"pointer" }}>
              닫기
            </button>
          </div>
        </div>
      )}
      <div style={{ padding:"0.7rem 1rem", borderTop:"0.5px solid #e5e5e5", display:"flex", gap:8, flexShrink:0 }}>
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && !e.shiftKey && sendMsg()}
          placeholder={showUpgrade ? "프리미엄으로 업그레이드하세요 ✨" : busy ? `${char.name} 답변 중...` : "메시지를 입력하세요"}
          disabled={busy || showUpgrade}
          style={{ flex:1, padding:"10px 14px", fontSize:14, border:`0.5px solid ${showUpgrade?"#F0997B":busy?"#e5e5e5":char.border}`, borderRadius:10, background: showUpgrade?"#FFF5F2":"#f5f5f5", outline:"none" }} />
        <button onClick={sendMsg} disabled={busy||!input.trim()||showUpgrade}
          style={{ padding:"10px 16px", borderRadius:10, background:busy||!input.trim()||showUpgrade?"#f0f0f0":char.color, color:busy||!input.trim()||showUpgrade?"#bbb":"#fff", border:"none", cursor:busy||!input.trim()||showUpgrade?"default":"pointer", fontSize:16 }}>↑</button>
      </div>
    </div>
  );
}

// ── 일기 + 맛집 화면 ───────────────────────────────────────────────────────
function DiaryScreen({ char, entry, entries, onReset }) {
  const [tab, setTab] = useState("diary");
  const { restaurants, loading, fetch: fetchRests } = useRestaurants();
  useEffect(() => { fetchRests(); }, []);
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", maxHeight:700 }}>
      <div style={{ padding:"0.85rem 1rem", borderBottom:"0.5px solid #e5e5e5", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <button onClick={onReset} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#888", padding:0 }}>←</button>
        <h2 style={{ fontSize:16, fontWeight:500, margin:0 }}>식사 완료 🎉</h2>
      </div>
      <div style={{ display:"flex", borderBottom:"0.5px solid #e5e5e5", flexShrink:0 }}>
        {[["diary","📖 식사 일기"],["map","🍽️ 근처 맛집"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex:1, padding:10, fontSize:13, fontWeight:500, border:"none", borderBottom:tab===id?`2.5px solid ${char.color}`:"2px solid transparent", background:"transparent", color:tab===id?char.color:"#888", cursor:"pointer", marginBottom:-1 }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"1rem" }}>
        {tab === "diary" ? (
          <div>
            {entry && (
              <div style={{ background:char.bg, border:`1px solid ${char.color}40`, borderRadius:14, padding:"1.1rem 1.25rem", marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <CharacterPortrait id={char.id} size={28} />
                    <span style={{ fontSize:12, fontWeight:500, color:char.color }}>방금 {char.name}와 식사</span>
                  </div>
                  <span style={{ fontSize:10, color:"#bbb" }}>{entry.time}</span>
                </div>
                <p style={{ fontSize:14, lineHeight:1.65, margin:"0 0 6px" }}>{entry.summary}</p>
                <p style={{ fontSize:11, color:"#bbb", margin:0 }}>대화 {entry.msgCount}개</p>
              </div>
            )}
            {entries.slice(entry ? 1 : 0).map(e => (
              <div key={e.id} style={{ background:"#fff", border:"0.5px solid #e5e5e5", borderRadius:12, padding:"0.85rem 1rem", display:"flex", gap:10, marginBottom:8, alignItems:"center" }}>
                <div style={{ flexShrink:0 }}><CharacterPortrait id={e.charId} size={36} /></div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:12, fontWeight:500, color:e.charColor }}>{e.charName}</span>
                    <span style={{ fontSize:11, color:"#bbb" }}>{e.date}</span>
                  </div>
                  <p style={{ fontSize:12, color:"#888", margin:0, lineHeight:1.5 }}>{e.summary}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:14, fontWeight:500 }}>📍 근처 혼밥 맛집</div>
              <div style={{ fontSize:11, color:"#bbb", marginTop:2 }}>현재 위치 기준 · 카카오맵 연동</div>
            </div>
            {loading
              ? [1,2,3].map(i => <div key={i} style={{ background:"#f0f0f0", borderRadius:12, height:76, marginBottom:8 }} />)
              : restaurants.length > 0
                ? <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
                  </div>
                : <div style={{ textAlign:"center", padding:"2rem", color:"#bbb" }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>🗺️</div>
                    <p style={{ fontSize:13 }}>주변 식당을 찾지 못했어요</p>
                  </div>}
          </div>
        )}
      </div>
      <div style={{ padding:"0 1rem 1rem", flexShrink:0 }}>
        <button onClick={onReset} style={{ width:"100%", padding:12, fontSize:14, fontWeight:500, background:"#D85A30", color:"#fff", border:"none", borderRadius:10, cursor:"pointer" }}>
          다시 식사하기 🍴
        </button>
      </div>
    </div>
  );
}

// ── 메인 앱 ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]       = useState("select");
  const [char, setChar]           = useState(null);
  const [imgB64, setImgB64]       = useState(null);
  const [imgPrev, setImgPrev]     = useState(null);
  const [entries, setEntries]     = useState([]);
  const [latest, setLatest]       = useState(null);

  const handleSelectChar = c => { setChar(c); setScreen("food"); };
  const handleStartSession = (b64, preview) => {
    setImgB64(b64); setImgPrev(preview); setScreen("chat");
  };
  const handleEndSession = async msgs => {
    let summary = "오늘도 맛있는 한 끼 🍚";
    try {
      const convo = msgs.map(m => `${m.role==="ai" ? char.name : "나"}: ${m.text}`).join("\n");
      const res = await fetch(import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-proxy`
    : "/api/claude/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:DIARY_MODEL, max_tokens:80,
          messages:[{ role:"user", content:`다음 식사 대화를 보고 따뜻하고 감성적인 식사 일기를 40자 이내로 한 줄로 써줘. 이모지 한 개 포함.\n\n${convo}` }] })
      });
      const data = await res.json();
      summary = data.content?.[0]?.text?.trim() || summary;
    } catch {}
    const t = new Date();
    const entry = {
      id:Date.now(), charId:char.id, charName:char.name,
      charColor:char.color, charBg:char.bg, summary, msgCount:msgs.length,
      date:t.toLocaleDateString("ko-KR",{month:"long",day:"numeric"}),
      time:t.toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"}),
    };
    setEntries(prev => [entry, ...prev]); setLatest(entry); setScreen("diary");
  };
  const handleReset = () => {
    setChar(null); setImgB64(null); setImgPrev(null); setLatest(null);
    setScreen("select");
  };

  return (
    <div style={{ maxWidth:420, margin:"0 auto", fontFamily:"-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',sans-serif", minHeight:"100vh", background:"#fff" }}>
      {screen==="select"      && <SelectScreen      onSelect={handleSelectChar} onRestaurants={() => setScreen("restaurants")} />}
      {screen==="restaurants" && <RestaurantsScreen  onBack={() => setScreen("select")} />}
      {screen==="food"        && <FoodScreen         char={char} onStart={handleStartSession} onBack={() => setScreen("select")} />}
      {screen==="chat"        && <ChatScreen         char={char} imgB64={imgB64} imgPreview={imgPrev} onEnd={handleEndSession} />}
      {screen==="diary"       && <DiaryScreen        char={char} entry={latest} entries={entries} onReset={handleReset} />}
    </div>
  );
}
