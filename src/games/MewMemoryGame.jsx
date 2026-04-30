// src/games/MewMemoryGame.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { recordScore, getBestScore } from "../lib/miniGameLogic";
import { useSFX, useBGM } from "../lib/sounds"; // ⭐ 사운드 import

const PAIRS = [
  { id: 25, name: "피카츄" },
  { id: 6, name: "리자몽" },
  { id: 9, name: "거북왕" },
  { id: 94, name: "팬텀" },
  { id: 131, name: "라프라스" },
  { id: 143, name: "잠만보" },
  { id: 130, name: "갸라도스" },
  { id: 151, name: "뮤" },
];
const TOTAL_TIME = 90;

function makeCards() {
  return [...PAIRS, ...PAIRS]
    .map((p, i) => ({ ...p, uid: i, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
}

export default function MewMemoryGame({ onClose, onGameEnd }) {
  const [phase, setPhase] = useState("ready");
  const [cards, setCards] = useState(() => makeCards());
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [pairs, setPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [result, setResult] = useState(null);

  // ⭐ 사운드 훅
  const { play } = useSFX();
  useBGM("mewMemoryBgm", { enabled: phase === "playing" });

  const openRef = useRef([]);
  const timerRef = useRef(null);
  const pairsRef = useRef(0);
  const timeRef = useRef(TOTAL_TIME);
  const flippingRef = useRef(false);
  const phaseRef = useRef("ready");

  const best = getBestScore("mew_memory");

  const endGame = useCallback(
    (pairsFound, timeRemaining) => {
      clearInterval(timerRef.current);
      phaseRef.current = "result";
      setPhase("result");
      const finalScore = pairsFound * 100 + timeRemaining * 5;
      const res = recordScore("mew_memory", finalScore);
      setResult({ score: finalScore, pairsFound, ...res });
      // ⭐ 게임 종료
      play("gameOverMG");
      if (res.isNew) setTimeout(() => play("newRecord"), 700);
      onGameEnd?.(finalScore);
    },
    [onGameEnd, play]
  );

  const startGame = useCallback(() => {
    clearInterval(timerRef.current);
    const newCards = makeCards();
    setCards(newCards);
    setPairs(0);
    setMoves(0);
    setResult(null);
    pairsRef.current = 0;
    timeRef.current = TOTAL_TIME;
    flippingRef.current = false;
    setTimeLeft(TOTAL_TIME);
    openRef.current = [];
    phaseRef.current = "playing";
    setPhase("playing");

    timerRef.current = setInterval(() => {
      timeRef.current--;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current);
        endGame(pairsRef.current, 0);
      }
    }, 1000);
  }, [endGame]);

  const handleFlip = useCallback(
    (uid) => {
      if (phaseRef.current !== "playing") return;
      if (flippingRef.current) return;

      setCards((prev) => {
        const card = prev.find((c) => c.uid === uid);
        if (!card || card.flipped || card.matched) return prev;
        if (openRef.current.includes(uid)) return prev;

        play("cardFlip"); // ⭐ 카드 뒤집기

        const newCards = prev.map((c) =>
          c.uid === uid ? { ...c, flipped: true } : c
        );
        openRef.current = [...openRef.current, uid];

        if (openRef.current.length === 2) {
          const [uid1, uid2] = openRef.current;
          const c1 = newCards.find((c) => c.uid === uid1);
          const c2 = newCards.find((c) => c.uid === uid2);

          setMoves((m) => m + 1);
          flippingRef.current = true;

          if (c1.id === c2.id) {
            // 매칭!
            setTimeout(() => {
              play("cardMatch"); // ⭐ 매치 성공
              setCards((p) =>
                p.map((c) =>
                  c.uid === uid1 || c.uid === uid2 ? { ...c, matched: true } : c
                )
              );
              openRef.current = [];
              flippingRef.current = false;
              const newPairs = pairsRef.current + 1;
              pairsRef.current = newPairs;
              setPairs(newPairs);
              if (newPairs === PAIRS.length) {
                endGame(newPairs, timeRef.current);
              }
            }, 400);
          } else {
            // 불일치
            setTimeout(() => {
              play("cardNoMatch"); // ⭐ 불일치
              setCards((p) =>
                p.map((c) =>
                  c.uid === uid1 || c.uid === uid2
                    ? { ...c, flipped: false }
                    : c
                )
              );
              openRef.current = [];
              flippingRef.current = false;
            }, 900);
          }
        }

        return newCards;
      });
    },
    [endGame, play]
  );

  useEffect(() => () => clearInterval(timerRef.current), []);

  const timerColor =
    timeLeft <= 15 ? "#ef4444" : timeLeft <= 30 ? "#fbbf24" : "#4ade80";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "linear-gradient(160deg,#0d001a,#1a0a2e,#0d001a)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui,sans-serif",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "rgba(0,0,0,0.4)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 99,
            color: "rgba(255,255,255,0.65)",
            fontSize: 13,
            padding: "5px 12px",
            cursor: "pointer",
          }}
        >
          ← 나가기
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18 }}>🔮</span>
          <span style={{ fontWeight: 900, color: "#fff", fontSize: 16 }}>
            뮤의 기억게임
          </span>
        </div>
        <div
          style={{
            background: "rgba(219,39,119,0.15)",
            border: "1px solid rgba(219,39,119,0.35)",
            borderRadius: 10,
            padding: "4px 10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
            최고
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#f9a8d4" }}>
            {best > 0 ? best : "—"}
          </div>
        </div>
      </div>

      {phase === "ready" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            padding: 32,
          }}
        >
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png"
            alt="뮤"
            style={{
              width: 110,
              height: 110,
              objectFit: "contain",
              filter: "drop-shadow(0 0 20px #f472b6)",
              animation: "mewFloat 2s ease-in-out infinite",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#fff",
                marginBottom: 8,
              }}
            >
              뮤의 기억게임
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.9,
              }}
            >
              뮤가 숨겨놓은 포켓몬 쌍을 찾아라!
              <br />
              8쌍 · 제한시간 {TOTAL_TIME}초
            </div>
          </div>
          <button
            onClick={startGame}
            style={{
              background: "linear-gradient(135deg,#db2777,#9d174d)",
              border: "none",
              borderRadius: 20,
              color: "#fff",
              fontWeight: 900,
              fontSize: 18,
              padding: "14px 48px",
              cursor: "pointer",
              boxShadow: "0 6px 0 #831843",
            }}
          >
            시작!
          </button>
        </div>
      )}

      {phase === "playing" && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 16px",
              flexShrink: 0,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                완성
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#f9a8d4" }}>
                {pairs} / {PAIRS.length}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: timerColor,
                  transition: "color 0.3s",
                }}
              >
                {timeLeft}
              </div>
              <div
                style={{
                  width: 80,
                  height: 4,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 99,
                  overflow: "hidden",
                  marginTop: 3,
                }}
              >
                <div
                  style={{
                    width: `${(timeLeft / TOTAL_TIME) * 100}%`,
                    height: "100%",
                    background: timerColor,
                    borderRadius: 99,
                    transition: "width 1s linear, background 0.3s",
                  }}
                />
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                시도
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {moves}
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px 12px 12px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 8,
                width: "100%",
                maxWidth: 380,
                perspective: 1000,
              }}
            >
              {cards.map((card) => (
                <div
                  key={card.uid}
                  onClick={() => handleFlip(card.uid)}
                  style={{
                    paddingBottom: "100%",
                    position: "relative",
                    cursor:
                      card.flipped || card.matched ? "default" : "pointer",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 12,
                      transformStyle: "preserve-3d",
                      transform:
                        card.flipped || card.matched
                          ? "rotateY(180deg)"
                          : "rotateY(0deg)",
                      transition: "transform 0.35s ease",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        background: "linear-gradient(135deg,#4c1d95,#7c3aed)",
                        border: "1.5px solid rgba(167,139,250,0.4)",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                      }}
                    >
                      ❓
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        background: card.matched
                          ? "linear-gradient(135deg,rgba(34,197,94,0.3),rgba(16,185,129,0.2))"
                          : "linear-gradient(135deg,rgba(219,39,119,0.25),rgba(157,23,77,0.2))",
                        border: `1.5px solid ${
                          card.matched
                            ? "rgba(34,197,94,0.5)"
                            : "rgba(219,39,119,0.4)"
                        }`,
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${card.id}.png`}
                        alt={card.name}
                        style={{
                          width: "80%",
                          height: "80%",
                          objectFit: "contain",
                          opacity: card.matched ? 1 : 0.85,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {phase === "result" && result && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            padding: 32,
          }}
        >
          {result.isNew && (
            <div
              style={{
                background: "linear-gradient(135deg,#ffd700,#ff8c00)",
                color: "#000",
                fontWeight: 900,
                fontSize: 15,
                padding: "6px 24px",
                borderRadius: 99,
              }}
            >
              🏆 최고 기록 갱신!
            </div>
          )}
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png"
            alt="뮤"
            style={{
              width: 100,
              height: 100,
              objectFit: "contain",
              filter: "drop-shadow(0 0 16px #f472b6)",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 4,
              }}
            >
              최종 점수
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: "#f9a8d4",
                lineHeight: 1,
              }}
            >
              {result.score}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                marginTop: 4,
              }}
            >
              완성 {result.pairsFound} / {PAIRS.length}쌍
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={startGame}
              style={{
                background: "linear-gradient(135deg,#db2777,#9d174d)",
                border: "none",
                borderRadius: 16,
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
                padding: "12px 32px",
                cursor: "pointer",
                boxShadow: "0 4px 0 #831843",
              }}
            >
              다시 하기
            </button>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 16,
                color: "rgba(255,255,255,0.75)",
                fontWeight: 700,
                fontSize: 16,
                padding: "12px 32px",
                cursor: "pointer",
              }}
            >
              나가기
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes mewFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-10px) scale(1.05)} }
      `}</style>
    </div>
  );
}
