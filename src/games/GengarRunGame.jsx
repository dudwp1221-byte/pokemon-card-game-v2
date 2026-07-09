// src/games/GengarRunGame.jsx  (피카츄 런 - 천둥의 돌을 피해라!)
import { useState, useEffect, useRef, useCallback } from "react";
import { recordScore, getBestScore } from "../lib/miniGameLogic";
import { useSFX, useBGM } from "../lib/sounds"; // ⭐ 사운드

const GRAVITY = 0.35;
const JUMP_VY = -5.2;
const GROUND_Y = 75;
const CHAR_X = 18;
const CHAR_H = 11;
const CHAR_W = 9;
const OBSTACLE_W = 7;
const SPEED_INIT = 0.65;
const SPEED_MAX = 2.5;
const MAX_JUMPS = 2;

const OBS_TYPES = [
  {
    id: "stone_s",
    h: 8,
    y: GROUND_Y - 8,
    img: "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items/thunder-stone.png",
    w: 6,
  },
  {
    id: "stone_m",
    h: 12,
    y: GROUND_Y - 12,
    img: "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items/thunder-stone.png",
    w: 7,
  },
  {
    id: "stone_l",
    h: 16,
    y: GROUND_Y - 16,
    img: "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items/thunder-stone.png",
    w: 8,
  },
  {
    id: "stone_xl",
    h: 20,
    y: GROUND_Y - 20,
    img: "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items/thunder-stone.png",
    w: 9,
  },
];

function getObstaclePattern(dist, frameCount) {
  const r = Math.random();
  const obstacles = [];
  if (dist < 200) {
    const t = OBS_TYPES[Math.floor(Math.random() * 2)];
    obstacles.push({ ...t, x: 110, id_u: frameCount });
  } else if (dist < 600) {
    const t = OBS_TYPES[Math.floor(Math.random() * 3)];
    obstacles.push({ ...t, x: 110, id_u: frameCount });
    if (r < 0.3) {
      const t2 = OBS_TYPES[Math.floor(Math.random() * 2)];
      obstacles.push({ ...t2, x: 125, id_u: frameCount + 1 });
    }
  } else {
    if (r < 0.25) {
      const types = [OBS_TYPES[0], OBS_TYPES[1], OBS_TYPES[2]];
      types.forEach((t, i) =>
        obstacles.push({ ...t, x: 110 + i * 14, id_u: frameCount + i })
      );
    } else if (r < 0.5) {
      const t1 = OBS_TYPES[Math.floor(Math.random() * 4)];
      const t2 = OBS_TYPES[Math.floor(Math.random() * 4)];
      obstacles.push({ ...t1, x: 110, id_u: frameCount });
      obstacles.push({ ...t2, x: 128, id_u: frameCount + 1 });
    } else if (r < 0.7) {
      const t = OBS_TYPES[2 + Math.floor(Math.random() * 2)];
      obstacles.push({ ...t, x: 110, id_u: frameCount });
    } else {
      const t = OBS_TYPES[Math.floor(Math.random() * 4)];
      obstacles.push({ ...t, x: 110, id_u: frameCount });
    }
  }
  return obstacles;
}

export default function GengarRunGame({ onClose, onGameEnd }) {
  const [phase, setPhase] = useState("ready");
  const [, forceUpdate] = useState(0);
  const [result, setResult] = useState(null);

  // ⭐ 사운드
  const { play } = useSFX();
  useBGM("runBgm", { enabled: phase === "playing" });

  const stateRef = useRef({
    charY: GROUND_Y,
    charVY: 0,
    jumpCount: 0,
    onGround: true,
    obstacles: [],
    score: 0,
    dist: 0,
    speed: SPEED_INIT,
    nextObsIn: 70,
    obsCounter: 0,
    frameCount: 0,
    dustParts: [],
  });
  const phaseRef = useRef("ready");
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const best = getBestScore("gengar_run");

  const endGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    phaseRef.current = "result";
    setPhase("result");
    const finalScore = Math.floor(stateRef.current.dist / 10);
    const res = recordScore("gengar_run", finalScore);
    setResult({ score: finalScore, ...res });
    // ⭐ 게임 오버
    play("runHit");
    setTimeout(() => play("gameOverMG"), 300);
    if (res.isBest || res.isNew) setTimeout(() => play("newRecord"), 900);
    onGameEnd?.(finalScore);
  }, [onGameEnd, play]);

  const jump = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const s = stateRef.current;
    if (s.jumpCount < MAX_JUMPS) {
      s.charVY = JUMP_VY;
      s.onGround = false;
      s.jumpCount++;
      // ⭐ 점프 사운드
      play(s.jumpCount === 1 ? "runJump" : "runDoubleJump");
    }
  }, [play]);

  const gameLoop = useCallback(
    (timestamp) => {
      if (phaseRef.current !== "playing") return;
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 16.67, 2);
      lastTimeRef.current = timestamp;

      const s = stateRef.current;
      s.frameCount++;
      s.dist += s.speed * dt;
      s.speed =
        SPEED_INIT + (SPEED_MAX - SPEED_INIT) * (1 - Math.exp(-s.dist / 2000));

      if (!s.onGround) {
        s.charVY += GRAVITY * dt;
        s.charY += s.charVY * dt;
      }
      if (s.charY >= GROUND_Y) {
        s.charY = GROUND_Y;
        s.charVY = 0;
        s.onGround = true;
        s.jumpCount = 0;
      }

      if (s.onGround && s.frameCount % 4 === 0) {
        s.dustParts = [
          ...(s.dustParts || []).slice(-6),
          { id: s.frameCount, x: CHAR_X - 4, y: GROUND_Y + 1, life: 1.0 },
        ];
      }
      s.dustParts = (s.dustParts || [])
        .map((p) => ({ ...p, life: p.life - 0.08 * dt }))
        .filter((p) => p.life > 0);

      s.obstacles = s.obstacles.map((o) => ({ ...o, x: o.x - s.speed * dt }));
      s.obsCounter += dt;
      if (s.obsCounter >= s.nextObsIn) {
        s.obsCounter = 0;
        s.nextObsIn = Math.max(35, 95 - s.dist / 80) + Math.random() * 20;
        s.obstacles.push(...getObstaclePattern(s.dist, s.frameCount));
      }
      s.obstacles = s.obstacles.filter((o) => o.x > -12);

      const cL = CHAR_X - CHAR_W / 2 + 2,
        cR = CHAR_X + CHAR_W / 2 - 2;
      const cT = s.charY - CHAR_H,
        cB = s.charY;
      for (const obs of s.obstacles) {
        const ow = obs.w || OBSTACLE_W;
        if (
          cR > obs.x + 1 &&
          cL < obs.x + ow - 1 &&
          cB > obs.y + 1 &&
          cT < obs.y + obs.h - 1
        ) {
          endGame();
          return;
        }
      }
      s.score = Math.floor(s.dist / 10);
      forceUpdate((n) => n + 1);
      rafRef.current = requestAnimationFrame(gameLoop);
    },
    [endGame]
  );

  const startGame = useCallback(() => {
    stateRef.current = {
      charY: GROUND_Y,
      charVY: 0,
      jumpCount: 0,
      onGround: true,
      obstacles: [],
      score: 0,
      dist: 0,
      speed: SPEED_INIT,
      nextObsIn: 75,
      obsCounter: 0,
      frameCount: 0,
      dustParts: [],
    };
    lastTimeRef.current = null;
    phaseRef.current = "playing";
    setPhase("playing");
    setResult(null);
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const s = stateRef.current;
  const runFrame = Math.floor(s.dist / 5) % 4;
  const skyColor =
    s.speed > 2.0
      ? "linear-gradient(180deg,#2d1b69 0%,#4a2d9e 40%,#7b5ea7 70%,#8bc34a 100%)"
      : "linear-gradient(180deg,#5bb8f5 0%,#89d4f5 40%,#c8e6c9 70%,#8bc34a 100%)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: skyColor,
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui,sans-serif",
        userSelect: "none",
        WebkitUserSelect: "none",
        transition: "background 1s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "rgba(255,255,255,0.25)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.4)",
            border: "none",
            borderRadius: 99,
            color: "#1a237e",
            fontSize: 13,
            padding: "5px 12px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          ← 나가기
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <span style={{ fontWeight: 900, color: "#1a237e", fontSize: 16 }}>
            피카츄 런
          </span>
        </div>
        <div
          style={{
            background: "rgba(250,204,21,0.25)",
            border: "1px solid rgba(250,204,21,0.5)",
            borderRadius: 10,
            padding: "4px 10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, color: "#5d4037" }}>최고</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#e65100" }}>
            {best > 0 ? `${best}m` : "—"}
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
            gap: 14,
            padding: 24,
            background: "linear-gradient(180deg,#87ceeb,#c8e6c9)",
            overflowY: "auto",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900, color: "#1a237e" }}>
            ⚡ 피카츄 런!
          </div>
          <div style={{ position: "relative", display: "inline-block" }}>
            <div
              style={{
                position: "absolute",
                top: -14,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#fff",
                border: "2.5px solid #1a237e",
                borderRadius: 14,
                padding: "7px 14px",
                whiteSpace: "nowrap",
                zIndex: 2,
                fontSize: 14,
                fontWeight: 900,
                color: "#c62828",
                boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
              }}
            >
              싫어!! 라이츄 되기 싫어!! 😡
              <div
                style={{
                  position: "absolute",
                  bottom: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderTop: "10px solid #1a237e",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -7,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderTop: "8px solid #fff",
                }}
              />
            </div>
            <img
              src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/25.png"
              alt="피카츄"
              style={{
                width: 120,
                height: 120,
                objectFit: "contain",
                filter: "drop-shadow(0 4px 16px rgba(250,204,21,0.9))",
                marginTop: 36,
                animation: "pikaAngry 0.5s ease-in-out infinite alternate",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.75)",
              borderRadius: 16,
              padding: "10px 20px",
            }}
          >
            <img
              src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items/thunder-stone.png"
              alt="천둥의돌"
              style={{
                width: 36,
                height: 36,
                objectFit: "contain",
                filter: "drop-shadow(0 0 8px #7c3aed)",
              }}
            />
            <div style={{ fontSize: 24 }}>→→→</div>
            <img
              src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/25.png"
              alt="피카츄"
              style={{
                width: 44,
                height: 44,
                objectFit: "contain",
                transform: "scaleX(-1)",
                animation: "pikaRun 0.3s linear infinite",
              }}
            />
            <div style={{ fontSize: 22 }}>💨</div>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#37474f",
              lineHeight: 1.9,
              background: "rgba(255,255,255,0.8)",
              padding: "10px 18px",
              borderRadius: 14,
              textAlign: "center",
            }}
          >
            <b style={{ color: "#5c35aa" }}>천둥의 돌</b>을 피해 최대한 달려요!
            <br />
            <span style={{ color: "#e65100" }}>
              탭 = 점프 · 공중 탭 = 2단 점프
            </span>
            <br />
            <span style={{ fontSize: 11, color: "#546e7a" }}>
              점점 빨라지니 집중! 🔥
            </span>
          </div>
          <button
            onClick={startGame}
            style={{
              background: "linear-gradient(135deg,#f9a825,#fbc02d)",
              border: "none",
              borderRadius: 20,
              color: "#1a237e",
              fontWeight: 900,
              fontSize: 18,
              padding: "14px 48px",
              cursor: "pointer",
              boxShadow: "0 6px 0 #e65100",
            }}
          >
            달려!
          </button>
        </div>
      )}

      {phase === "playing" && (
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            touchAction: "none",
            WebkitTapHighlightColor: "transparent",
          }}
          onPointerDown={jump}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                s.speed > 2.0
                  ? "linear-gradient(180deg,#2d1b69,#4a2d9e 55%,#7b5ea7 80%)"
                  : "linear-gradient(180deg,#5bb8f5,#aee4f7 55%,#c8f0c8 80%)",
            }}
          />
          {[8, 38, 65, 88].map((base, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${
                  ((((base - s.dist * 0.15 * (1 + i * 0.1)) % 120) + 120) %
                    120) -
                  10
                }%`,
                top: `${5 + i * 5}%`,
                width: `${12 + i * 4}%`,
                height: 16,
                background:
                  s.speed > 2.0
                    ? "rgba(180,160,255,0.5)"
                    : "rgba(255,255,255,0.9)",
                borderRadius: 99,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 16,
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 2,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: s.speed > 2.0 ? "#fde047" : "#37474f",
                textShadow: "0 1px 4px rgba(255,255,255,0.8)",
              }}
            >
              {s.score}m
            </div>
            <div
              style={{
                fontSize: 10,
                color: s.speed > 1.5 ? "#ef4444" : "#546e7a",
                background: "rgba(255,255,255,0.5)",
                borderRadius: 99,
                padding: "1px 6px",
              }}
            >
              {s.speed.toFixed(1)}x
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${GROUND_Y}%`,
              bottom: 0,
              background: "linear-gradient(180deg,#7cb342,#558b2f)",
              borderTop: "3px solid #8bc34a",
            }}
          >
            {[...Array(14)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  bottom: "60%",
                  width: 2,
                  height: 10,
                  background: "#558b2f",
                  borderRadius: 99,
                  left: `${(i * 8 - ((s.dist * 0.8) % 8) + 8) % 110}%`,
                }}
              />
            ))}
          </div>
          {(s.dustParts || []).map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${p.x - p.life * 3}%`,
                top: `${p.y}%`,
                width: `${p.life * 8}px`,
                height: `${p.life * 8}px`,
                borderRadius: "50%",
                background: `rgba(250,204,21,${p.life * 0.5})`,
                pointerEvents: "none",
              }}
            />
          ))}
          {s.speed > 1.5 &&
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${6 + i * 4}%`,
                  top: `${GROUND_Y - CHAR_H / 2 + i * 2 - 2}%`,
                  width: `${2 + (s.speed - 1.5) * 2}%`,
                  height: 2,
                  background: `rgba(250,204,21,${(s.speed - 1.5) * 0.4})`,
                  borderRadius: 99,
                }}
              />
            ))}
          <div
            style={{
              position: "absolute",
              left: `${CHAR_X}%`,
              top: `${s.charY - CHAR_H}%`,
              transform: "translateX(-50%)",
              width: `${CHAR_W}%`,
              height: `${CHAR_H}%`,
            }}
          >
            <img
              src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/25.png"
              alt="피카츄"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 2px 8px rgba(250,204,21,0.8))",
                transform: s.onGround
                  ? `scaleX(-1) translateY(${[0, -2, -3, -2][runFrame]}px)`
                  : "scaleX(-1) rotate(-20deg) translateY(-4px)",
                transition: "transform 0.05s",
              }}
            />
            {!s.onGround && s.jumpCount === 2 && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-30%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 14,
                }}
              >
                ⚡
              </div>
            )}
          </div>
          {s.obstacles.map((obs) => (
            <div
              key={obs.id_u}
              style={{
                position: "absolute",
                left: `${obs.x}%`,
                top: `${obs.y}%`,
                width: `${obs.w || OBSTACLE_W}%`,
                height: `${obs.h}%`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={obs.img}
                alt="천둥의 돌"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 6px #7c3aed) brightness(1.2)",
                }}
              />
            </div>
          ))}
          {s.score < 5 && (
            <div
              style={{
                position: "absolute",
                bottom: "26%",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 12,
                color: "#37474f",
                opacity: 0.8,
                whiteSpace: "nowrap",
                background: "rgba(255,255,255,0.6)",
                borderRadius: 99,
                padding: "2px 10px",
              }}
            >
              탭 = 점프 · 공중 탭 = 2단 점프
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
            gap: 18,
            padding: 28,
            background: "linear-gradient(180deg,#87ceeb,#c8e6c9)",
          }}
        >
          {result.isBest && (
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
          )}
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/26.png"
              alt="라이츄"
              style={{
                width: 130,
                height: 130,
                objectFit: "contain",
                filter: "drop-shadow(0 4px 20px rgba(250,150,21,0.7))",
                animation: "raichuCry 1s ease-in-out infinite alternate",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "38%",
                left: "28%",
                fontSize: 18,
                animation: "tearDrop 1.2s ease-in infinite",
              }}
            >
              💧
            </div>
            <div
              style={{
                position: "absolute",
                top: "38%",
                right: "28%",
                fontSize: 18,
                animation: "tearDrop 1.2s ease-in infinite 0.4s",
              }}
            >
              💧
            </div>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#37474f",
              fontWeight: 700,
              background: "rgba(255,255,255,0.7)",
              borderRadius: 12,
              padding: "6px 16px",
            }}
          >
            라이츄가 슬퍼하고 있어요 😢
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#546e7a", marginBottom: 4 }}>
              달린 거리
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: "#1a237e",
                lineHeight: 1,
              }}
            >
              {result.score}m
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={startGame}
              style={{
                background: "linear-gradient(135deg,#f9a825,#fbc02d)",
                border: "none",
                borderRadius: 16,
                color: "#1a237e",
                fontWeight: 900,
                fontSize: 16,
                padding: "12px 28px",
                cursor: "pointer",
                boxShadow: "0 4px 0 #e65100",
              }}
            >
              다시 달려!
            </button>
            <button
              onClick={onClose}
              style={{
                background: "rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.15)",
                borderRadius: 16,
                color: "#37474f",
                fontWeight: 700,
                fontSize: 16,
                padding: "12px 28px",
                cursor: "pointer",
              }}
            >
              나가기
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pikaAngry { from{transform:rotate(-8deg) scale(1.05)} to{transform:rotate(8deg) scale(0.97)} }
        @keyframes pikaRun { 0%{transform:scaleX(-1) translateY(0)} 50%{transform:scaleX(-1) translateY(-3px)} }
        @keyframes raichuCry { 0%{transform:rotate(-3deg) translateY(0)} 100%{transform:rotate(3deg) translateY(4px)} }
        @keyframes tearDrop { 0%{opacity:1;transform:translateY(0)} 80%{opacity:1;transform:translateY(18px)} 100%{opacity:0;transform:translateY(22px)} }
      `}</style>
    </div>
  );
}
