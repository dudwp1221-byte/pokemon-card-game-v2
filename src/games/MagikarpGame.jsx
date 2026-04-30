// src/games/MagikarpGame.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { recordScore, getBestScore } from "../lib/miniGameLogic";
import { useSFX, useBGM } from "../lib/sounds"; // ⭐ 사운드 import

const GRAVITY = 0.1;
const JUMP_VY = -1.6;
const BIRD_X = 20;
const BIRD_R = 4;
const PIPE_W = 10;
const PIPE_GAP_INIT = 46;
const PIPE_GAP_MIN = 30;
const SPEED_INIT = 0.45;
const SPEED_MAX = 1.2;
const PIPE_INTERVAL = 75;
const DEAD_ZONE = BIRD_R;

const GOLDEN_ITEM_SCORE = 9;
const GOLDEN_CHANCE = 0.2;
const GOLDEN_EVOLVED_SCORE = 20;

function getPipeGap(score) {
  if (score < 20) return PIPE_GAP_INIT;
  return Math.max(PIPE_GAP_MIN, PIPE_GAP_INIT - (score - 20) * 0.8);
}

export default function MagikarpGame({ onClose, onGameEnd }) {
  const [phase, setPhase] = useState("ready");
  const [countdown, setCountdown] = useState(3);
  const [reviveCountdown, setReviveCountdown] = useState(3);
  const [, forceUpdate] = useState(0);
  const [result, setResult] = useState(null);

  // ⭐ 사운드 훅
  const { play } = useSFX();
  useBGM("magikarpBgm", {
    enabled:
      phase === "playing" ||
      phase === "countdown" ||
      phase === "revive_countdown",
  });

  const stateRef = useRef({
    birdY: 50,
    birdVY: 0,
    pipes: [],
    score: 0,
    frameCount: 0,
    speed: SPEED_INIT,
    nextPipeIn: PIPE_INTERVAL,
    pipeCounter: 0,
    evolved: false,
    goldenItem: null,
    goldenSpawned: false,
    canRevive: false,
    revived: false,
    goldenScore: 0,
  });

  const phaseRef = useRef("ready");
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const cdTimerRef = useRef(null);

  const best = getBestScore("magikarp");

  const endGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    phaseRef.current = "result";
    setPhase("result");
    const s = stateRef.current;
    const res = recordScore("magikarp", s.score);
    setResult({
      score: s.score,
      evolved: s.evolved,
      revived: s.revived,
      ...res,
    });
    // ⭐ 게임 종료
    play("gameOverMG");
    if (res.isNew) setTimeout(() => play("newRecord"), 700);
    onGameEnd?.(s.score);
  }, [onGameEnd, play]);

  const onDeath = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const s = stateRef.current;
    // ⭐ 충돌 사운드
    play("magikarpCollide");
    if (s.canRevive && !s.revived) {
      phaseRef.current = "revive_prompt";
      setPhase("revive_prompt");
    } else {
      endGame();
    }
  }, [endGame, play]);

  const flap = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    stateRef.current.birdVY = JUMP_VY;
    play("magikarpFlap"); // ⭐ 플랩
  }, [play]);

  const gameLoop = useCallback(
    (timestamp) => {
      if (phaseRef.current !== "playing") return;
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 16.67, 2);
      lastTimeRef.current = timestamp;

      const s = stateRef.current;
      s.frameCount++;
      s.speed = Math.min(SPEED_MAX, SPEED_INIT + s.frameCount * 0.0015);

      s.birdVY += GRAVITY * dt;
      s.birdY += s.birdVY * dt;

      if (
        s.birdY - BIRD_R <= DEAD_ZONE ||
        s.birdY + BIRD_R >= 100 - DEAD_ZONE
      ) {
        onDeath();
        return;
      }

      s.pipes = s.pipes.map((p) => ({ ...p, x: p.x - s.speed * dt }));

      if (s.goldenItem) {
        s.goldenItem = { ...s.goldenItem, x: s.goldenItem.x - s.speed * dt };
        if (s.goldenItem.x < -10) {
          s.goldenItem = null;
        } else {
          const dx = BIRD_X - s.goldenItem.x,
            dy = s.birdY - s.goldenItem.y;
          if (Math.sqrt(dx * dx + dy * dy) < BIRD_R + 4) {
            s.goldenItem = null;
            s.evolved = "golden";
            s.canRevive = true;
            s.goldenScore = 0;
            // ⭐ 황금 획득 + 이로치 진화
            play("magikarpGolden");
            setTimeout(() => play("magikarpEvolveGolden"), 200);
          }
        }
      }

      s.pipeCounter += dt;
      if (s.pipeCounter >= s.nextPipeIn) {
        s.pipeCounter = 0;
        s.nextPipeIn = Math.max(55, PIPE_INTERVAL - s.score * 1.5);
        const curGap = getPipeGap(s.score);
        const gapY = 12 + Math.random() * (100 - curGap - 24);
        s.pipes.push({
          x: 105,
          gapY,
          gap: curGap,
          passed: false,
          id: s.frameCount,
        });

        if (
          s.score === GOLDEN_ITEM_SCORE &&
          !s.goldenSpawned &&
          !s.evolved &&
          Math.random() < GOLDEN_CHANCE
        ) {
          s.goldenSpawned = true;
          s.goldenItem = { x: 105, y: gapY + curGap / 2 };
        }
      }
      s.pipes = s.pipes.filter((p) => p.x > -(PIPE_W + 5));

      for (const p of s.pipes) {
        if (!p.passed && p.x + PIPE_W < BIRD_X - BIRD_R) {
          p.passed = true;
          s.score++;
          play("magikarpPass"); // ⭐ 폭포 통과
          if (s.evolved === "golden") {
            s.goldenScore++;
            if (s.goldenScore >= GOLDEN_EVOLVED_SCORE) {
              s.evolved = "red";
              s.canRevive = true;
              play("magikarpEvolveRed"); // ⭐ 붉은 갸라도스 진화
            }
          }
          if (!s.evolved && s.score === 20) {
            s.evolved = "gyarados";
            play("magikarpEvolveGyarados"); // ⭐ 갸라도스 진화
          }
        }
        if (
          BIRD_X + BIRD_R > p.x &&
          BIRD_X - BIRD_R < p.x + PIPE_W &&
          (s.birdY - BIRD_R < p.gapY ||
            s.birdY + BIRD_R > p.gapY + (p.gap ?? PIPE_GAP_INIT))
        ) {
          onDeath();
          return;
        }
      }

      forceUpdate((n) => n + 1);
      rafRef.current = requestAnimationFrame(gameLoop);
    },
    [onDeath, play]
  );

  const handleRevive = useCallback(() => {
    const s = stateRef.current;
    s.revived = true;
    s.birdY = 50;
    s.birdVY = 0;
    s.pipes = s.pipes.filter((p) => p.x > BIRD_X + 20);
    s.goldenItem = null;
    play("magikarpRevive"); // ⭐ 부활

    phaseRef.current = "revive_countdown";
    setPhase("revive_countdown");
    setReviveCountdown(3);
    play("countdown"); // ⭐ 3

    let c = 3;
    cdTimerRef.current = setInterval(() => {
      c--;
      setReviveCountdown(c);
      if (c <= 0) {
        clearInterval(cdTimerRef.current);
        play("goSignal"); // ⭐ GO!
        lastTimeRef.current = null;
        phaseRef.current = "playing";
        setPhase("playing");
        rafRef.current = requestAnimationFrame(gameLoop);
      } else {
        play("countdown"); // ⭐ 2, 1
      }
    }, 1000);
  }, [gameLoop, play]);

  const beginCountdown = useCallback(() => {
    stateRef.current = {
      birdY: 50,
      birdVY: 0,
      pipes: [],
      score: 0,
      frameCount: 0,
      speed: SPEED_INIT,
      nextPipeIn: PIPE_INTERVAL,
      pipeCounter: 0,
      evolved: false,
      goldenItem: null,
      goldenSpawned: false,
      canRevive: false,
      revived: false,
      goldenScore: 0,
    };
    lastTimeRef.current = null;
    setResult(null);
    setCountdown(3);
    phaseRef.current = "countdown";
    setPhase("countdown");
    play("countdown"); // ⭐ 3

    let c = 3;
    cdTimerRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(cdTimerRef.current);
        play("goSignal"); // ⭐ GO!
        phaseRef.current = "playing";
        setPhase("playing");
        rafRef.current = requestAnimationFrame(gameLoop);
      } else {
        play("countdown"); // ⭐ 2, 1
      }
    }, 1000);
  }, [gameLoop, play]);

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(cdTimerRef.current);
    },
    []
  );

  const s = stateRef.current;
  const birdRotation = Math.max(-30, Math.min(45, s.birdVY * 4));

  const birdImg =
    s.evolved === "red"
      ? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/130.png"
      : s.evolved === "gyarados"
      ? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png"
      : s.evolved === "golden"
      ? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/129.png"
      : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png";

  const birdFilter =
    s.evolved === "red"
      ? "drop-shadow(0 0 16px #ef4444)"
      : s.evolved === "gyarados"
      ? "drop-shadow(0 0 16px #22d3ee)"
      : s.evolved === "golden"
      ? "drop-shadow(0 0 14px #ffd700)"
      : "drop-shadow(0 0 8px #38bdf8)";

  const birdSize =
    s.evolved === "gyarados" || s.evolved === "red" ? BIRD_R * 4 : BIRD_R * 2;

  const isPlayingOrRevive = [
    "playing",
    "countdown",
    "revive_prompt",
    "revive_countdown",
  ].includes(phase);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "linear-gradient(180deg,#0c4a6e,#0369a1,#0284c7)",
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
          background: "rgba(0,0,0,0.35)",
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
          <span style={{ fontSize: 18 }}>🐟</span>
          <span style={{ fontWeight: 900, color: "#fff", fontSize: 16 }}>
            잉어킹의 도전
          </span>
        </div>
        <div
          style={{
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.35)",
            borderRadius: 10,
            padding: "4px 10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
            최고
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fca5a5" }}>
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
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png"
            alt="잉어킹"
            style={{
              width: 110,
              height: 110,
              objectFit: "contain",
              filter: "drop-shadow(0 0 20px #38bdf8)",
              animation: "fishBounce 1s ease-in-out infinite",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#fff",
                marginBottom: 12,
              }}
            >
              잉어킹의 도전
            </div>
            <div
              style={{
                background: "rgba(0,0,0,0.35)",
                borderRadius: 16,
                padding: "14px 20px",
                fontSize: 13,
                color: "rgba(255,255,255,0.8)",
                lineHeight: 2.1,
                textAlign: "left",
              }}
            >
              <div>
                👆 <b>탭</b> — 잉어킹이 위로 튀어오릅니다
              </div>
              <div>
                🌊 <b>폭포 사이</b>를 통과하면 점수 +1
              </div>
              <div>
                ✨ <b>20개</b> 통과 시 갸라도스로 진화!
              </div>
              <div>
                ⭐ <b>10번째 구간</b>에서 황금 아이템 출현 (20%)
              </div>
              <div>
                💛 먹으면 <b>이로치 잉어킹</b>으로 변신 + 부활권 획득!
              </div>
              <div>
                🔴 이로치 잉어킹으로 <b>20개</b> 더 → 붉은 갸라도스!
              </div>
            </div>
          </div>
          <button
            onClick={beginCountdown}
            style={{
              background: "linear-gradient(135deg,#0ea5e9,#0284c7)",
              border: "none",
              borderRadius: 20,
              color: "#fff",
              fontWeight: 900,
              fontSize: 18,
              padding: "14px 48px",
              cursor: "pointer",
              boxShadow: "0 6px 0 #075985",
            }}
          >
            도전!
          </button>
        </div>
      )}

      {isPlayingOrRevive && (
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            touchAction: "none",
            WebkitTapHighlightColor: "transparent",
          }}
          onPointerDown={flap}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  height: 2,
                  background: "rgba(255,255,255,0.08)",
                  left: 0,
                  right: 0,
                  top: `${(i * 18 + s.frameCount * 0.3) % 100}%`,
                  borderRadius: 99,
                }}
              />
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              top: `${DEAD_ZONE}%`,
              left: 0,
              right: 0,
              height: 3,
              background: "rgba(239,68,68,0.7)",
              boxShadow: "0 0 8px rgba(239,68,68,0.8)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: `${100 - DEAD_ZONE}%`,
              left: 0,
              right: 0,
              height: 3,
              background: "rgba(239,68,68,0.7)",
              boxShadow: "0 0 8px rgba(239,68,68,0.8)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 18,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: "#fff",
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              {s.score}
            </div>
            {s.evolved === "golden" && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#ffd700",
                  textShadow: "0 0 8px #ffd700",
                  animation: "goldPulse 0.8s ease-in-out infinite",
                }}
              >
                ✨ 이로치 잉어킹! ({s.goldenScore}/{GOLDEN_EVOLVED_SCORE})
              </div>
            )}
            {s.evolved === "red" && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#ef4444",
                  textShadow: "0 0 8px #ef4444",
                }}
              >
                🔴 붉은 갸라도스!
              </div>
            )}
            {s.canRevive && !s.revived && (
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,215,0,0.8)",
                  marginTop: 2,
                }}
              >
                💛 부활 1회 보유
              </div>
            )}
          </div>
          {s.pipes.map((p) => (
            <div key={p.id}>
              <div
                style={{
                  position: "absolute",
                  left: `${p.x}%`,
                  top: `${DEAD_ZONE}%`,
                  width: `${PIPE_W}%`,
                  height: `${p.gapY - DEAD_ZONE}%`,
                  background: "linear-gradient(180deg,#1e3a5f,#0c4a6e,#0369a1)",
                  borderBottom: "3px solid #38bdf8",
                  borderRight: "2px solid #0ea5e9",
                  borderLeft: "2px solid #0ea5e9",
                }}
              >
                <div
                  style={{
                    width: "130%",
                    height: 18,
                    background: "#0369a1",
                    border: "2px solid #38bdf8",
                    borderRadius: "2px 2px 0 0",
                    marginBottom: -2,
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: `${p.x}%`,
                  top: `${p.gapY + (p.gap ?? PIPE_GAP_INIT)}%`,
                  width: `${PIPE_W}%`,
                  height: `${
                    100 - DEAD_ZONE - (p.gapY + (p.gap ?? PIPE_GAP_INIT))
                  }%`,
                  background: "linear-gradient(0deg,#1e3a5f,#0c4a6e,#0369a1)",
                  borderTop: "3px solid #38bdf8",
                  borderRight: "2px solid #0ea5e9",
                  borderLeft: "2px solid #0ea5e9",
                }}
              >
                <div
                  style={{
                    width: "130%",
                    height: 18,
                    background: "#0369a1",
                    border: "2px solid #38bdf8",
                    borderRadius: "0 0 2px 2px",
                    marginLeft: "-15%",
                    marginTop: -2,
                  }}
                />
              </div>
            </div>
          ))}
          {s.goldenItem && (
            <div
              style={{
                position: "absolute",
                left: `${s.goldenItem.x}%`,
                top: `${s.goldenItem.y}%`,
                transform: "translate(-50%,-50%)",
                zIndex: 5,
                animation: "goldSpin 1s linear infinite",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 35% 35%, #fff9a0, #ffd700, #ff8c00)",
                  boxShadow: "0 0 18px #ffd700, 0 0 36px rgba(255,215,0,0.5)",
                  border: "2px solid rgba(255,255,255,0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                ⭐
              </div>
            </div>
          )}
          <div
            style={{
              position: "absolute",
              left: `${BIRD_X}%`,
              top: `${s.birdY - birdSize / 2}%`,
              transform: `translateX(-50%) rotate(${birdRotation}deg)`,
              width: `${birdSize}%`,
              height: `${birdSize}%`,
            }}
          >
            <img
              src={birdImg}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: "scaleX(-1)",
                filter: birdFilter,
              }}
            />
          </div>

          {phase === "revive_prompt" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 30,
                background: "rgba(0,0,0,0.75)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 18,
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  animation: "reviveBounce 0.6s ease-in-out infinite",
                }}
              >
                💛
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#ffd700",
                  textShadow: "0 0 20px #ffd700",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                부활 가능!
                <br />
                <span
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 400,
                  }}
                >
                  {s.evolved === "red" ? "붉은 갸라도스" : "이로치 잉어킹"}의
                  힘으로 부활
                </span>
              </div>
              <button
                onClick={handleRevive}
                style={{
                  background: "linear-gradient(135deg,#ffd700,#ff8c00)",
                  border: "none",
                  borderRadius: 20,
                  color: "#000",
                  fontWeight: 900,
                  fontSize: 18,
                  padding: "14px 44px",
                  cursor: "pointer",
                  boxShadow: "0 6px 0 #92400e, 0 0 20px rgba(255,215,0,0.5)",
                  animation: "revivePulse 1s ease-in-out infinite",
                }}
              >
                💛 부활하기!
              </button>
              <button
                onClick={endGame}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 14,
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 14,
                  padding: "8px 24px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                포기하기
              </button>
            </div>
          )}

          {phase === "revive_countdown" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 30,
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontSize: 80,
                  fontWeight: 900,
                  color: "#ffd700",
                  textShadow: "0 0 40px #ffd700",
                  animation: "cdPop 0.4s cubic-bezier(.34,1.56,.64,1)",
                  key: reviveCountdown,
                }}
              >
                {reviveCountdown > 0 ? reviveCountdown : "GO!"}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                {reviveCountdown > 0 ? "부활 준비 중..." : "다시 도전!"}
              </div>
            </div>
          )}

          {phase === "countdown" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 20,
                background: "rgba(0,0,0,0.5)",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontSize: countdown > 0 ? 96 : 60,
                  fontWeight: 900,
                  color: "#fff",
                  textShadow: "0 0 40px rgba(56,189,248,0.8)",
                  animation: "cdPop 0.4s cubic-bezier(.34,1.56,.64,1)",
                }}
              >
                {countdown > 0 ? countdown : "GO!"}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                  marginTop: 8,
                }}
              >
                탭해서 점프!
              </div>
            </div>
          )}

          {phase === "playing" && s.score < 3 && (
            <div
              style={{
                position: "absolute",
                bottom: "20%",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              탭해서 점프!
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
            gap: 16,
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
          {result.evolved === "red" && (
            <div
              style={{
                background: "linear-gradient(135deg,#ef4444,#dc2626)",
                color: "#fff",
                fontWeight: 900,
                fontSize: 14,
                padding: "6px 20px",
                borderRadius: 99,
              }}
            >
              🔴 붉은 갸라도스 달성!
            </div>
          )}
          {result.evolved === "golden" && (
            <div
              style={{
                background: "linear-gradient(135deg,#ffd700,#ff8c00)",
                color: "#000",
                fontWeight: 900,
                fontSize: 14,
                padding: "6px 20px",
                borderRadius: 99,
              }}
            >
              ✨ 이로치 잉어킹 달성!
            </div>
          )}
          {result.evolved === "gyarados" && (
            <div
              style={{
                background: "linear-gradient(135deg,#06b6d4,#0284c7)",
                color: "#fff",
                fontWeight: 900,
                fontSize: 14,
                padding: "6px 20px",
                borderRadius: 99,
              }}
            >
              ✨ 갸라도스 진화!
            </div>
          )}
          {result.revived && (
            <div
              style={{
                background: "rgba(255,215,0,0.15)",
                border: "1px solid #ffd700",
                color: "#ffd700",
                fontWeight: 700,
                fontSize: 12,
                padding: "4px 14px",
                borderRadius: 99,
              }}
            >
              💛 부활 사용
            </div>
          )}
          <img
            src={
              result.evolved === "red"
                ? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/130.png"
                : result.evolved === "gyarados"
                ? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png"
                : result.evolved === "golden"
                ? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/129.png"
                : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png"
            }
            alt=""
            style={{
              width: 110,
              height: 110,
              objectFit: "contain",
              filter:
                result.evolved === "red"
                  ? "drop-shadow(0 0 16px #ef4444)"
                  : result.evolved === "golden"
                  ? "drop-shadow(0 0 16px #ffd700)"
                  : "drop-shadow(0 0 16px #38bdf8)",
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
              넘은 폭포
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: "#7dd3fc",
                lineHeight: 1,
              }}
            >
              {result.score}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={beginCountdown}
              style={{
                background: "linear-gradient(135deg,#0ea5e9,#0284c7)",
                border: "none",
                borderRadius: 16,
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
                padding: "12px 32px",
                cursor: "pointer",
                boxShadow: "0 4px 0 #075985",
              }}
            >
              다시 도전!
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
        @keyframes fishBounce  { 0%,100%{transform:translateY(0) rotate(-10deg)} 50%{transform:translateY(-14px) rotate(10deg)} }
        @keyframes cdPop       { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes goldSpin    { 0%{transform:translate(-50%,-50%) rotate(0deg) scale(1)} 50%{transform:translate(-50%,-50%) rotate(180deg) scale(1.2)} 100%{transform:translate(-50%,-50%) rotate(360deg) scale(1)} }
        @keyframes goldPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.05)} }
        @keyframes reviveBounce{ 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-10px) scale(1.15)} }
        @keyframes revivePulse { 0%,100%{box-shadow:0 6px 0 #92400e,0 0 20px rgba(255,215,0,0.5)} 50%{box-shadow:0 6px 0 #92400e,0 0 40px rgba(255,215,0,0.9)} }
      `}</style>
    </div>
  );
}
