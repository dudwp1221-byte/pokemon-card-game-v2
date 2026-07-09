// src/games/CharizardTimingGame.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { recordScore, getBestScore } from "../lib/miniGameLogic";
import { useSFX, useBGM } from "../lib/sounds"; // ⭐ 사운드

const TOTAL_ROUNDS = 10;
const ZONE_INIT = 32;
const ZONE_MIN = 7;
const ZONE_SHRINK = 3;
const PERIOD_MS = [1800, 1700, 1600, 1500, 1400, 1300, 1200, 1100, 1000, 900];

function getScore(offset) {
  if (offset <= 0.15)
    return {
      label: "PERFECT!",
      pts: 100,
      color: "#fcd34d",
      sfx: "timingPerfect",
    };
  if (offset <= 0.35)
    return { label: "GREAT!", pts: 70, color: "#4ade80", sfx: "timingGreat" };
  if (offset <= 0.6)
    return { label: "GOOD", pts: 40, color: "#60a5fa", sfx: "timingGood" };
  if (offset <= 1.0)
    return { label: "OK", pts: 20, color: "#94a3b8", sfx: "timingOk" };
  return { label: "MISS", pts: 0, color: "#ef4444", sfx: "timingMiss" };
}

export default function CharizardTimingGame({ onClose, onGameEnd }) {
  const [phase, setPhase] = useState("ready");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [hit, setHit] = useState(null);
  const [result, setResult] = useState(null);
  const [, forceUpdate] = useState(0);
  const [tapBarPos, setTapBarPos] = useState(50);

  // ⭐ 사운드 훅
  const { play } = useSFX();
  useBGM("charizardBgm", { enabled: phase === "playing" || phase === "wait" });

  const scoreRef = useRef(0);
  const roundRef = useRef(0);
  const zoneRef = useRef(ZONE_INIT);
  const phaseRef = useRef("ready");
  const startMsRef = useRef(0);
  const rafRef = useRef(null);
  const barPosRef = useRef(0);

  const best = getBestScore("charizard_timing");

  const getBarPos = useCallback((now) => {
    const period = PERIOD_MS[Math.min(roundRef.current, TOTAL_ROUNDS - 1)];
    const elapsed = now - startMsRef.current;
    const t = (elapsed % period) / period;
    return 50 + 46 * Math.sin(t * Math.PI * 2);
  }, []);

  const animLoop = useCallback(
    (now) => {
      if (phaseRef.current !== "playing") return;
      barPosRef.current = getBarPos(now);
      forceUpdate((n) => n + 1);
      rafRef.current = requestAnimationFrame(animLoop);
    },
    [getBarPos]
  );

  const nextRound = useCallback(
    (animLoopFn) => {
      roundRef.current++;
      if (roundRef.current >= TOTAL_ROUNDS) {
        const finalScore = scoreRef.current;
        const res = recordScore("charizard_timing", finalScore);
        setResult({ score: finalScore, ...res });
        phaseRef.current = "result";
        setPhase("result");
        cancelAnimationFrame(rafRef.current);
        // ⭐ 게임 종료
        play("gameOverMG");
        if (res.isNew) setTimeout(() => play("newRecord"), 700);
        onGameEnd?.(finalScore);
        return;
      }
      setRound(roundRef.current);
      setHit(null);
      startMsRef.current = performance.now();
      barPosRef.current = 50;
      phaseRef.current = "playing";
      setPhase("playing");
      rafRef.current = requestAnimationFrame(animLoopFn);
    },
    [onGameEnd, play]
  );

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    roundRef.current = 0;
    zoneRef.current = ZONE_INIT;
    setScore(0);
    setRound(0);
    setHit(null);
    setResult(null);
    phaseRef.current = "playing";
    setPhase("playing");
    startMsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animLoop);
  }, [animLoop]);

  const frozenBarRef = useRef(0);

  const handleTap = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const capturedPos = barPosRef.current;
    frozenBarRef.current = capturedPos;
    setTapBarPos(capturedPos);
    phaseRef.current = "wait";
    setPhase("wait");
    cancelAnimationFrame(rafRef.current);

    const pos = barPosRef.current;
    const zone = zoneRef.current;
    const dist = Math.abs(pos - 50);
    const halfZone = zone / 2;
    const offset = halfZone > 0 ? dist / halfZone : 999;

    const { label, pts, color, sfx } = getScore(offset);
    scoreRef.current += pts;
    setScore(scoreRef.current);
    setHit({ label, pts, color });
    play(sfx); // ⭐ 판정별 사운드

    if (pts > 0) {
      zoneRef.current = Math.max(ZONE_MIN, zone - ZONE_SHRINK);
    }

    setTimeout(() => nextRound(animLoop), 1000);
  }, [nextRound, animLoop, play]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const zoneW = zoneRef.current;
  const barPos = phase === "wait" ? tapBarPos : barPosRef.current;
  const inZone = Math.abs(barPos - 50) <= zoneW / 2;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "linear-gradient(160deg,#2d0000,#7c1900,#2d0000)",
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
          <span style={{ fontSize: 18 }}>🔥</span>
          <span style={{ fontWeight: 900, color: "#fff", fontSize: 16 }}>
            리자몽 타이밍
          </span>
        </div>
        <div
          style={{
            background: "rgba(234,88,12,0.15)",
            border: "1px solid rgba(234,88,12,0.35)",
            borderRadius: 10,
            padding: "4px 10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
            최고
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fdba74" }}>
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
            src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/6.png"
            alt="리자몽"
            style={{
              width: 120,
              height: 120,
              objectFit: "contain",
              filter: "drop-shadow(0 0 24px #f97316)",
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
              리자몽 타이밍
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.9,
              }}
            >
              움직이는 바가 🔥 표적 안에 들어왔을 때 탭!
              <br />
              정중앙에 가까울수록 높은 점수
              <br />
              라운드가 진행될수록 표적이 좁아져요
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "PERFECT!", color: "#fcd34d" },
              { label: "GREAT!", color: "#4ade80" },
              { label: "GOOD", color: "#60a5fa" },
              { label: "OK", color: "#94a3b8" },
              { label: "MISS", color: "#ef4444" },
            ].map(({ label, color }) => (
              <div
                key={label}
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color,
                  textAlign: "center",
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <button
            onClick={startGame}
            style={{
              background: "linear-gradient(135deg,#ea580c,#c2410c)",
              border: "none",
              borderRadius: 20,
              color: "#fff",
              fontWeight: 900,
              fontSize: 18,
              padding: "14px 48px",
              cursor: "pointer",
              boxShadow: "0 6px 0 #7c2d12",
            }}
          >
            시작!
          </button>
        </div>
      )}

      {(phase === "playing" || phase === "wait") && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-around",
            padding: 24,
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTapHighlightColor: "transparent",
          }}
          onPointerDown={handleTap}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: 360,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                라운드
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>
                {round + 1} / {TOTAL_ROUNDS}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                점수
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fdba74" }}>
                {score}
              </div>
            </div>
          </div>
          <img
            src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/6.png"
            alt="리자몽"
            style={{
              width: 130,
              height: 130,
              objectFit: "contain",
              filter: `drop-shadow(0 0 ${
                inZone ? "32px #fde047" : "12px #f97316"
              })`,
              transition: "filter 0.1s",
              animation: "charizardFloat 2s ease-in-out infinite",
            }}
          />
          <div style={{ width: "100%", maxWidth: 360, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: -44,
                left: 0,
                right: 0,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              {hit && (
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: hit.color,
                    animation: "hitPop 0.5s cubic-bezier(.34,1.56,.64,1)",
                    textShadow: `0 0 20px ${hit.color}`,
                  }}
                >
                  {hit.label} {hit.pts > 0 && `+${hit.pts}`}
                </div>
              )}
              {!hit && phase === "playing" && (
                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.4)",
                    animation: "tapHint 1.5s ease-in-out infinite",
                  }}
                >
                  탭하세요!
                </div>
              )}
            </div>
            <div
              style={{
                height: 28,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 99,
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${50 - zoneW / 2}%`,
                  width: `${zoneW}%`,
                  background:
                    "linear-gradient(90deg,rgba(253,224,71,0.3),rgba(253,224,71,0.6),rgba(253,224,71,0.3))",
                  borderLeft: "2px solid #fde047",
                  borderRight: "2px solid #fde047",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "calc(50% - 1px)",
                  width: 2,
                  background: "rgba(253,224,71,0.8)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "10%",
                  bottom: "10%",
                  left: `calc(${barPos}% - 14px)`,
                  width: 28,
                  background: inZone
                    ? "linear-gradient(180deg,#fde047,#f97316)"
                    : "linear-gradient(180deg,#60a5fa,#2563eb)",
                  borderRadius: 99,
                  boxShadow: inZone ? "0 0 16px #fde047" : "0 0 8px #3b82f6",
                  transition: "background 0.1s, box-shadow 0.1s",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 10,
                gap: 4,
              }}
            >
              {Array(TOTAL_ROUNDS)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background:
                        i < round
                          ? "#4ade80"
                          : i === round
                          ? "#fde047"
                          : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
            </div>
          </div>
          {phase === "playing" && (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
              🔥 표적 안에서 탭!
            </div>
          )}
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
            src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/6.png"
            alt="리자몽"
            style={{
              width: 110,
              height: 110,
              objectFit: "contain",
              filter: "drop-shadow(0 0 20px #f97316)",
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
                color: "#fdba74",
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
              만점 {TOTAL_ROUNDS * 100}점
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={startGame}
              style={{
                background: "linear-gradient(135deg,#ea580c,#c2410c)",
                border: "none",
                borderRadius: 16,
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
                padding: "12px 32px",
                cursor: "pointer",
                boxShadow: "0 4px 0 #7c2d12",
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
        @keyframes charizardFloat { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-12px) rotate(3deg)} }
        @keyframes hitPop { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes tapHint { 0%,100%{opacity:0.4} 50%{opacity:1} }
      `}</style>
    </div>
  );
}
