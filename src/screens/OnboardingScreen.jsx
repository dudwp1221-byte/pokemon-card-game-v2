import { useState } from "react";
import TrainerPortrait from "../components/TrainerPortrait";
import { T } from "../lib/constants";

const STEPS = ["nickname", "trainer", "explain", "done"];

const GAME_EXPLAIN = [
  {
    icon: "🃏",
    title: "카드 뽑기",
    desc: "덱이나 상대방 버린 카드를 가져와요",
  },
  { icon: "🗑️", title: "카드 버리기", desc: "손패에서 1장을 버려 턴을 넘겨요" },
  { icon: "✨", title: "세트 완성", desc: "같은 속성 3장으로 세트를 만들어요" },
  { icon: "🏆", title: "승리 조건", desc: "세트 3개를 먼저 완성하면 이겨요!" },
];

// ── 포켓덱스 상단 바 (공통) ──
function TopBar() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "4px 4px 10px",
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          flexShrink: 0,
          position: "relative",
          background:
            "radial-gradient(circle at 32% 28%,#bfdbfe,#2563EB 55%,#1e3a8a)",
          boxShadow:
            "0 0 0 4px rgba(255,255,255,0.3),0 0 20px rgba(59,130,246,0.6),0 4px 8px rgba(0,0,0,0.5)",
          border: "2px solid rgba(255,255,255,0.45)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: "18%",
            width: "38%",
            height: "38%",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.7)",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
        {[
          { c: "#f87171", g: "#ef4444" },
          { c: "#fbbf24", g: "#f59e0b" },
          { c: "#4ade80", g: "#22c55e" },
        ].map(({ c, g }, i) => (
          <div
            key={i}
            style={{
              width: 13,
              height: 13,
              borderRadius: "50%",
              background: c,
              boxShadow: `0 0 7px ${g}`,
              border: "1.5px solid rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>
      <div style={{ flex: 1, textAlign: "center" }}>
        <span
          style={{
            color: "#fff",
            fontWeight: 900,
            fontSize: 17,
            letterSpacing: 1,
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        >
          ⚡ PokéSet
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          flexShrink: 0,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", gap: 2.5 }}>
            {[0, 1, 2, 3].map((j) => (
              <div
                key={j}
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.4)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingScreen({ tImgs, onComplete }) {
  const [step, setStep] = useState(0);
  const [nickname, setNick] = useState("");
  const [trainerId, setTId] = useState(null);
  const [explainIdx, setEIdx] = useState(0);
  const [exiting, setExiting] = useState(false);

  const trainers = Object.keys(T);
  const cur = STEPS[step];
  const W = Math.min(360, window.innerWidth - 24);

  const canNext = () => {
    if (cur === "nickname") return nickname.trim().length >= 2;
    if (cur === "trainer") return !!trainerId;
    return true;
  };

  const goNext = () => {
    setExiting(true);
    setTimeout(() => {
      setStep((s) => s + 1);
      setExiting(false);
    }, 200);
  };

  // ── 공통 버튼 스타일 ──
  const primaryBtn = (enabled) => ({
    padding: "13px 0",
    borderRadius: 28,
    border: enabled ? "2px solid #15803d" : "none",
    background: enabled
      ? "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)"
      : "#D1D5DB",
    color: enabled ? "#fff" : "#9CA3AF",
    fontWeight: 900,
    fontSize: 15,
    cursor: enabled ? "pointer" : "not-allowed",
    boxShadow: enabled
      ? "0 4px 0 #166534,0 8px 24px rgba(22,163,74,0.3)"
      : "none",
    width: "100%",
  });
  const ghostBtn = {
    padding: "11px 0",
    borderRadius: 28,
    border: "1.5px solid #E5E7EB",
    background: "#fff",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    color: "#6B7280",
    boxShadow: "0 3px 0 #e2e8f0",
    width: "100%",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#1a0505,#2d0808)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui,sans-serif",
        padding: "16px 0",
      }}
    >
      {/* 단계 도트 */}
      <div
        style={{
          position: "fixed",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 6,
          zIndex: 10,
        }}
      >
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 22 : 8,
              height: 8,
              borderRadius: 99,
              background: i <= step ? "#fff" : "rgba(255,255,255,0.25)",
              transition: "all 0.3s",
              boxShadow: i === step ? "0 0 8px rgba(255,255,255,0.6)" : "none",
            }}
          />
        ))}
      </div>

      {/* ── 포켓덱스 ── */}
      <div
        style={{
          width: W,
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          borderRadius: 28,
          padding: 12,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.65),inset 0 2px 0 rgba(255,130,110,0.5),inset 0 -3px 0 rgba(0,0,0,0.35)",
          border: "3px solid #8B0000",
          animation: exiting
            ? "obExit 0.2s ease forwards"
            : "obEnter 0.3s ease forwards",
        }}
      >
        <TopBar />

        {/* ── 스크린 ── */}
        <div
          style={{
            background: "#0a0f1a",
            borderRadius: 14,
            border: "5px solid #fff",
            boxShadow: "0 0 0 2px #bbb,inset 0 2px 12px rgba(0,0,0,0.9)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg,transparent,rgba(74,222,128,0.2),transparent)",
              animation: "scanLine 2.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  color: "rgba(74,222,128,0.65)",
                  fontSize: 9,
                  fontFamily: "monospace",
                  letterSpacing: 1,
                  marginBottom: 2,
                }}
              >
                SETUP
              </div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>
                {cur === "nickname" && "👋 트레이너 등록"}
                {cur === "trainer" && "🎭 트레이너 선택"}
                {cur === "explain" && "📖 게임 방법"}
                {cur === "done" && "✅ 등록 완료"}
              </div>
            </div>
            <div
              style={{
                color: "rgba(74,222,128,0.4)",
                fontSize: 9,
                fontFamily: "monospace",
              }}
            >
              {step + 1}/{STEPS.length}
            </div>
          </div>
          <div style={{ display: "flex", height: 3 }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background:
                    i % 3 === 0 ? "rgba(74,222,128,0.45)" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── 흰 패널 ── */}
        <div
          style={{
            background: "#FEFEFE",
            borderRadius: 20,
            padding: 14,
            boxShadow: "inset 0 2px 0 #fff,inset 0 -2px 0 rgba(180,0,0,0.12)",
          }}
        >
          {/* ─ 닉네임 ─ */}
          {cur === "nickname" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 6 }}>⚡</div>
                <div
                  style={{ fontWeight: 900, fontSize: 17, color: "#1e3a5f" }}
                >
                  PokéSet에 오신 걸 환영해요!
                </div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                  포켓몬 카드 배틀을 시작해볼까요?
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#374151",
                    marginBottom: 5,
                  }}
                >
                  트레이너 닉네임
                </label>
                <input
                  value={nickname}
                  autoFocus
                  onChange={(e) => setNick(e.target.value.slice(0, 12))}
                  onKeyDown={(e) => e.key === "Enter" && canNext() && goNext()}
                  placeholder="닉네임을 입력해주세요"
                  style={{
                    width: "100%",
                    padding: "11px 13px",
                    borderRadius: 10,
                    border: "1.5px solid #E5E7EB",
                    fontSize: 15,
                    boxSizing: "border-box",
                    outline: "none",
                    fontWeight: 600,
                    transition: "border 0.2s",
                  }}
                  onFocus={(e) =>
                    (e.target.style.border = "1.5px solid #E8190A")
                  }
                  onBlur={(e) =>
                    (e.target.style.border = "1.5px solid #E5E7EB")
                  }
                />
                <div
                  style={{
                    fontSize: 10,
                    color: "#9CA3AF",
                    textAlign: "right",
                    marginTop: 3,
                  }}
                >
                  {nickname.length}/12
                </div>
              </div>
              <button
                onClick={goNext}
                disabled={!canNext()}
                style={primaryBtn(canNext())}
              >
                다음 →
              </button>
            </div>
          )}

          {/* ─ 트레이너 선택 ─ */}
          {cur === "trainer" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontWeight: 900, fontSize: 16, color: "#1e3a5f" }}
                >
                  트레이너를 선택해요
                </div>
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3 }}>
                  나를 대표할 트레이너예요
                </div>
              </div>
              {trainerId && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    background: "#F0F9FF",
                    borderRadius: 12,
                    border: "1.5px solid #BAE6FD",
                    boxShadow: "0 3px 0 #bae6fd",
                  }}
                >
                  <TrainerPortrait name={trainerId} size={44} tImgs={tImgs} />
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: "#0C4A6E",
                      }}
                    >
                      {trainerId}
                    </div>
                    <div style={{ fontSize: 11, color: "#0284C7" }}>
                      선택됨 ✓
                    </div>
                  </div>
                </div>
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5,1fr)",
                  gap: 5,
                  maxHeight: 200,
                  overflowY: "auto",
                  padding: 4,
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 12,
                  background: "#FAFAFA",
                }}
              >
                {trainers.map((t) => (
                  <div
                    key={t}
                    onClick={() => setTId(t)}
                    style={{
                      textAlign: "center",
                      cursor: "pointer",
                      padding: "7px 3px",
                      borderRadius: 10,
                      border:
                        trainerId === t
                          ? "2px solid #E8190A"
                          : "2px solid transparent",
                      background: trainerId === t ? "#FFF1F1" : "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <TrainerPortrait name={t} size={38} tImgs={tImgs} />
                    <div
                      style={{
                        fontSize: 8,
                        marginTop: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: trainerId === t ? "#C01208" : "#6B7280",
                        fontWeight: trainerId === t ? 700 : 400,
                      }}
                    >
                      {t}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setStep((s) => s - 1)}
                  style={{ ...ghostBtn, flex: 1 }}
                >
                  ← 뒤로
                </button>
                <button
                  onClick={goNext}
                  disabled={!canNext()}
                  style={{ ...primaryBtn(canNext()), flex: 2 }}
                >
                  다음 →
                </button>
              </div>
            </div>
          )}

          {/* ─ 게임 설명 ─ */}
          {cur === "explain" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontWeight: 900, fontSize: 16, color: "#1e3a5f" }}
                >
                  게임 방법
                </div>
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3 }}>
                  간단해요, 금방 익혀요!
                </div>
              </div>
              {GAME_EXPLAIN.map((item, i) => (
                <div
                  key={i}
                  onClick={() => setEIdx(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 13px",
                    borderRadius: 14,
                    cursor: "pointer",
                    border:
                      explainIdx === i
                        ? "1.5px solid #E8190A"
                        : "1.5px solid #E5E7EB",
                    background: explainIdx === i ? "#FFF1F1" : "#fff",
                    boxShadow:
                      explainIdx === i ? "0 3px 0 #fca5a5" : "0 3px 0 #e2e8f0",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      flexShrink: 0,
                      background: explainIdx === i ? "#E8190A" : "#F3F4F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 13,
                        color: explainIdx === i ? "#C01208" : "#111827",
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}
                    >
                      {item.desc}
                    </div>
                  </div>
                  {explainIdx === i && (
                    <span style={{ color: "#E8190A", fontSize: 16 }}>✓</span>
                  )}
                </div>
              ))}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setStep((s) => s - 1)}
                  style={{ ...ghostBtn, flex: 1 }}
                >
                  ← 뒤로
                </button>
                <button
                  onClick={goNext}
                  style={{ ...primaryBtn(true), flex: 2 }}
                >
                  준비 완료! →
                </button>
              </div>
            </div>
          )}

          {/* ─ 완료 ─ */}
          {cur === "done" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                textAlign: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 52,
                    marginBottom: 6,
                    animation: "obBounce 0.6s ease",
                  }}
                >
                  🎉
                </div>
                <div
                  style={{ fontWeight: 900, fontSize: 18, color: "#1e3a5f" }}
                >
                  준비 완료!
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginTop: 4,
                    lineHeight: 1.6,
                  }}
                >
                  <b style={{ color: "#C01208" }}>{nickname}</b> 트레이너,
                  <br />
                  포켓몬 배틀을 시작해봐요!
                </div>
              </div>
              {trainerId && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div
                    style={{
                      padding: "12px 20px",
                      background: "#F0F9FF",
                      borderRadius: 16,
                      border: "1.5px solid #BAE6FD",
                      boxShadow: "0 3px 0 #bae6fd",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <TrainerPortrait name={trainerId} size={50} tImgs={tImgs} />
                    <div style={{ textAlign: "left" }}>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 16,
                          color: "#0C4A6E",
                        }}
                      >
                        {nickname}
                      </div>
                      <div style={{ fontSize: 11, color: "#0284C7" }}>
                        {trainerId} 트레이너
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div
                style={{
                  background: "#FFFBEB",
                  border: "1.5px solid #FCD34D",
                  borderRadius: 12,
                  padding: "9px 13px",
                  boxShadow: "0 3px 0 #fde68a",
                  fontSize: 12,
                  color: "#92400E",
                  fontWeight: 700,
                }}
              >
                🎁 신규 가입 보너스 +300 코인 지급!
              </div>
              <button
                onClick={() =>
                  onComplete({ nickname: nickname.trim(), trainerId })
                }
                style={primaryBtn(true)}
              >
                🚀 게임 시작!
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scanLine { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes obEnter  { from{opacity:0;transform:translateY(14px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes obExit   { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-10px)} }
        @keyframes obBounce { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-14px)} 70%{transform:translateY(-5px)} }
      `}</style>
    </div>
  );
}
