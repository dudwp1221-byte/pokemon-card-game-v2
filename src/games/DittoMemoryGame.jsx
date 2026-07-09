// src/games/DittoMemoryGame.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { recordScore, getBestScore } from "../lib/miniGameLogic";
import { useSFX, useBGM } from "../lib/sounds"; // ⭐ 사운드

const GH =
  "https://cdn.jsdelivr.net/gh/dudwp1221-byte/pokeset-images@main/";

const BTNS = [
  {
    id: 0,
    name: "피카츄",
    color: "#facc15",
    dark: "#854d0e",
    glow: "#fde047",
    dittoImg: GH + "ditto_as_pikachu.png",
    fallback:
      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/25.png",
  },
  {
    id: 1,
    name: "팬텀",
    color: "#a855f7",
    dark: "#4c1d95",
    glow: "#d8b4fe",
    dittoImg: GH + "ditto_as_gengar.png",
    fallback:
      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/94.png",
  },
  {
    id: 2,
    name: "뮤",
    color: "#f472b6",
    dark: "#831843",
    glow: "#fbcfe8",
    dittoImg: GH + "ditto_as_mew.png",
    fallback:
      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/151.png",
  },
  {
    id: 3,
    name: "잉어킹",
    color: "#38bdf8",
    dark: "#0c4a6e",
    glow: "#bae6fd",
    dittoImg: GH + "ditto_as_magikarp.png",
    fallback:
      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/129.png",
  },
  {
    id: 4,
    name: "잠만보",
    color: "#4ade80",
    dark: "#14532d",
    glow: "#86efac",
    dittoImg: GH + "ditto_as_snorlax.png",
    fallback:
      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/143.png",
  },
  {
    id: 5,
    name: "이브이",
    color: "#d97706",
    dark: "#78350f",
    glow: "#fcd34d",
    dittoImg: GH + "ditto_as_eevee.png",
    fallback:
      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/133.png",
  },
  {
    id: 6,
    name: "뮤츠",
    color: "#818cf8",
    dark: "#312e81",
    glow: "#c7d2fe",
    dittoImg: GH + "ditto_as_mewtwo.png",
    fallback:
      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/150.png",
  },
  {
    id: 7,
    name: "고라파덕",
    color: "#fbbf24",
    dark: "#92400e",
    glow: "#fde68a",
    dittoImg: GH + "ditto_as_psyduck.png",
    fallback:
      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/54.png",
  },
  {
    id: 8,
    name: "푸린",
    color: "#fb7185",
    dark: "#9f1239",
    glow: "#fda4af",
    dittoImg: GH + "ditto_as_jigglypuff.png",
    fallback:
      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/39.png",
  },
  {
    id: 9,
    name: "파이리",
    color: "#f97316",
    dark: "#7c2d12",
    glow: "#fed7aa",
    dittoImg: GH + "ditto_as_charmander.png",
    fallback:
      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/4.png",
  },
];

const MAX_LEVEL = 10;

function BtnImg({ btn, isLit, size = 52 }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed ? btn.fallback : btn.dittoImg}
      alt={btn.name}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: isLit ? "none" : "brightness(0.65)",
        transition: "filter 0.12s",
      }}
    />
  );
}

export default function DittoMemoryGame({ onClose, onGameEnd }) {
  const [phase, setPhase] = useState("ready");
  const [seq, setSeq] = useState([]);
  const [input, setInput] = useState([]);
  const [lit, setLit] = useState(null);
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const [wrongId, setWrongId] = useState(null);
  const [cleared, setCleared] = useState(false);

  // ⭐ 사운드 훅 (playDitto는 10개 펜타토닉 톤)
  const { play, playDitto } = useSFX();
  useBGM("dittoBgm", { enabled: phase === "showing" || phase === "input" });

  const phaseRef = useRef("ready");
  const seqRef = useRef([]);
  const inputRef = useRef([]);
  const cancelRef = useRef(false);
  const best = getBestScore("ditto_memory");

  useEffect(
    () => () => {
      cancelRef.current = true;
    },
    []
  );

  const showSequence = useCallback(
    async (newSeq) => {
      cancelRef.current = false;
      phaseRef.current = "showing";
      setPhase("showing");
      setInput([]);
      inputRef.current = [];

      await new Promise((r) => setTimeout(r, 600));
      if (cancelRef.current) return;

      const speed = Math.max(280, 550 - newSeq.length * 22);

      for (let i = 0; i < newSeq.length; i++) {
        setLit(newSeq[i]);
        playDitto(newSeq[i]); // ⭐ 시연 시 해당 버튼 톤
        await new Promise((r) => setTimeout(r, speed));
        if (cancelRef.current) return;
        setLit(null);
        await new Promise((r) => setTimeout(r, 160));
        if (cancelRef.current) return;
      }

      phaseRef.current = "input";
      setPhase("input");
    },
    [playDitto]
  );

  const nextLevel = useCallback(
    (prevSeq) => {
      const newBtn = Math.floor(Math.random() * BTNS.length);
      const newSeq = [...prevSeq, newBtn];
      seqRef.current = newSeq;
      setSeq(newSeq);
      setLevel(newSeq.length);
      showSequence(newSeq);
    },
    [showSequence]
  );

  const startGame = useCallback(() => {
    cancelRef.current = false;
    seqRef.current = [];
    setScore(0);
    setLevel(0);
    setInput([]);
    inputRef.current = [];
    setCleared(false);
    setWrongId(null);
    nextLevel([]);
  }, [nextLevel]);

  const retryFromLevel = useCallback(() => {
    cancelRef.current = false;
    setWrongId(null);
    inputRef.current = [];
    setInput([]);
    showSequence(seqRef.current);
  }, [showSequence]);

  const handleTap = useCallback(
    (id) => {
      if (phaseRef.current !== "input") return;

      setLit(id);
      playDitto(id); // ⭐ 유저 입력 시 해당 버튼 톤
      setTimeout(() => setLit(null), 250);

      const newInput = [...inputRef.current, id];
      inputRef.current = newInput;
      setInput(newInput);

      const pos = newInput.length - 1;

      if (id !== seqRef.current[pos]) {
        // 틀림
        phaseRef.current = "wrong";
        setPhase("wrong");
        setWrongId(id);
        play("dittoWrong"); // ⭐ 오답
        return;
      }

      if (newInput.length === seqRef.current.length) {
        const lv = seqRef.current.length;
        const newScore = lv * 50;
        setScore(newScore);

        if (lv >= MAX_LEVEL) {
          // 10단계 클리어!
          setCleared(true);
          play("dittoCleared"); // ⭐ 전체 클리어
          setTimeout(() => {
            const res = recordScore("ditto_memory", newScore);
            setResult({ score: newScore, level: lv, ...res });
            phaseRef.current = "result";
            setPhase("result");
            if (res.isNew) setTimeout(() => play("newRecord"), 700);
            onGameEnd?.(newScore);
          }, 800);
        } else {
          play("dittoLevelUp"); // ⭐ 레벨업
          setTimeout(() => nextLevel(seqRef.current), 700);
        }
      }
    },
    [nextLevel, onGameEnd, play, playDitto]
  );

  const btnDisabled = phase !== "input";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "linear-gradient(160deg,#1a0030,#2d004a,#1a0030)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui,sans-serif",
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
          <span style={{ fontSize: 18 }}>💜</span>
          <span style={{ fontWeight: 900, color: "#fff", fontSize: 16 }}>
            메타몽 따라하기
          </span>
        </div>
        <div
          style={{
            background: "rgba(168,85,247,0.15)",
            border: "1px solid rgba(168,85,247,0.3)",
            borderRadius: 10,
            padding: "4px 10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
            최고
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#d8b4fe" }}>
            {best > 0 ? `${Math.floor(best / 50)}단계` : "—"}
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
            padding: 28,
          }}
        >
          <img
            src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/132.png"
            alt="메타몽"
            style={{
              width: 110,
              height: 110,
              objectFit: "contain",
              filter: "drop-shadow(0 0 20px #a855f7)",
              animation: "dittoWobble 1.5s ease-in-out infinite",
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
              메타몽 따라하기
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 2,
                background: "rgba(255,255,255,0.05)",
                padding: "12px 20px",
                borderRadius: 12,
              }}
            >
              메타몽이 변신하는 순서를 기억하세요!
              <br />
              매 라운드 순서가 하나씩 늘어납니다
              <br />
              <span style={{ color: "#fbbf24" }}>틀리면 그 단계부터 다시!</span>
              <br />
              <b style={{ color: "#4ade80" }}>10단계</b>를 클리어하면 성공! 🎉
            </div>
          </div>
          <button
            onClick={startGame}
            style={{
              background: "linear-gradient(135deg,#9333ea,#7c3aed)",
              border: "none",
              borderRadius: 20,
              color: "#fff",
              fontWeight: 900,
              fontSize: 18,
              padding: "14px 48px",
              cursor: "pointer",
              boxShadow: "0 6px 0 #4c1d95",
            }}
          >
            시작!
          </button>
        </div>
      )}

      {(phase === "showing" || phase === "input" || phase === "wrong") && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-around",
            padding: "12px 16px",
            overflowY: "auto",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#d8b4fe" }}>
              레벨 {level} / {MAX_LEVEL}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
                marginTop: 2,
              }}
            >
              {phase === "showing"
                ? "👀 잘 보세요..."
                : phase === "wrong"
                ? "❌ 틀렸어요! 이 단계부터 다시!"
                : "👆 순서대로 따라하세요!"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {Array.from({ length: MAX_LEVEL }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 22,
                  height: 8,
                  borderRadius: 4,
                  background: i < level ? "#a855f7" : "rgba(255,255,255,0.15)",
                  boxShadow: i === level - 1 ? "0 0 8px #a855f7" : "none",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
          <div
            style={{
              position: "relative",
              width: 120,
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {lit !== null ? (
              <BtnImg btn={BTNS[lit]} isLit={true} size={110} />
            ) : (
              <img
                src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/132.png"
                alt="메타몽"
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 6px rgba(168,85,247,0.5))",
                  animation:
                    phase === "showing"
                      ? "dittoWobble 0.5s ease-in-out infinite"
                      : "none",
                }}
              />
            )}
          </div>
          {phase === "wrong" && (
            <button
              onClick={retryFromLevel}
              style={{
                background: "linear-gradient(135deg,#f59e0b,#d97706)",
                border: "none",
                borderRadius: 14,
                color: "#fff",
                fontWeight: 900,
                fontSize: 15,
                padding: "10px 28px",
                cursor: "pointer",
                boxShadow: "0 3px 0 #92400e",
              }}
            >
              다시 보기 🔄
            </button>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: 8,
              width: "100%",
              maxWidth: 400,
            }}
          >
            {BTNS.map((btn) => {
              const isLit = lit === btn.id;
              const isWrong = phase === "wrong" && wrongId === btn.id;
              return (
                <div
                  key={btn.id}
                  onClick={() => handleTap(btn.id)}
                  style={{
                    background:
                      isLit || isWrong
                        ? `radial-gradient(circle,${btn.glow}66,${btn.color})`
                        : `linear-gradient(135deg,${btn.dark},${btn.color}30)`,
                    border: `2px solid ${
                      isLit ? btn.glow : isWrong ? "#ef4444" : btn.color + "55"
                    }`,
                    borderRadius: 14,
                    padding: "8px 4px",
                    cursor: btnDisabled ? "default" : "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    opacity: btnDisabled && phase !== "wrong" ? 0.7 : 1,
                    boxShadow: isLit
                      ? `0 0 16px ${btn.glow}`
                      : isWrong
                      ? "0 0 16px #ef4444"
                      : "none",
                    transition: "all 0.1s",
                    transform: isLit ? "scale(1.08)" : "scale(1)",
                    userSelect: "none",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <BtnImg btn={btn} isLit={isLit} size={42} />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: isLit ? "#fff" : "rgba(255,255,255,0.55)",
                      lineHeight: 1,
                    }}
                  >
                    {btn.name}
                  </span>
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              gap: 5,
              flexWrap: "wrap",
              justifyContent: "center",
              maxWidth: 300,
            }}
          >
            {seq.map((s, i) => (
              <div
                key={i}
                style={{
                  width: i < input.length ? 12 : 8,
                  height: i < input.length ? 12 : 8,
                  borderRadius: "50%",
                  background:
                    i < input.length
                      ? input[i] === s
                        ? "#4ade80"
                        : "#ef4444"
                      : "rgba(255,255,255,0.2)",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {phase === "result" && result && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 28,
          }}
        >
          {cleared && <div style={{ fontSize: 32 }}>🎉</div>}
          {cleared ? (
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "#4ade80",
                textAlign: "center",
              }}
            >
              10단계 클리어!
            </div>
          ) : (
            result.isNew && (
              <div
                style={{
                  background: "linear-gradient(135deg,#ffd700,#ff8c00)",
                  color: "#000",
                  fontWeight: 900,
                  fontSize: 14,
                  padding: "5px 20px",
                  borderRadius: 99,
                }}
              >
                🏆 최고 기록!
              </div>
            )
          )}
          <img
            src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/132.png"
            alt="메타몽"
            style={{
              width: 100,
              height: 100,
              objectFit: "contain",
              filter: "drop-shadow(0 0 20px #a855f7)",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 4,
              }}
            >
              최고 레벨
            </div>
            <div
              style={{
                fontSize: 60,
                fontWeight: 900,
                color: "#d8b4fe",
                lineHeight: 1,
              }}
            >
              {result.level}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                marginTop: 4,
              }}
            >
              점수: {result.score}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={startGame}
              style={{
                background: "linear-gradient(135deg,#9333ea,#7c3aed)",
                border: "none",
                borderRadius: 14,
                color: "#fff",
                fontWeight: 900,
                fontSize: 15,
                padding: "11px 28px",
                cursor: "pointer",
                boxShadow: "0 4px 0 #4c1d95",
              }}
            >
              다시 하기
            </button>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 14,
                color: "rgba(255,255,255,0.75)",
                fontWeight: 700,
                fontSize: 15,
                padding: "11px 28px",
                cursor: "pointer",
              }}
            >
              나가기
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dittoWobble    { 0%,100%{transform:rotate(-5deg)scale(1)} 50%{transform:rotate(5deg)scale(1.05)} }
        @keyframes dittoTransform { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}
