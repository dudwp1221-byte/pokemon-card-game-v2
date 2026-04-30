// src/games/MewtwoDodgeGame.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { recordScore, getBestScore } from "../lib/miniGameLogic";
import { useSFX, useBGM } from "../lib/sounds"; // ⭐ 사운드

const PLAYER_R = 3.5;
const BULLET_R = 2;
const INIT_LIVES = 3;

export default function MewtwoDodgeGame({ onClose, onGameEnd }) {
  const [phase, setPhase] = useState("ready");
  const [, forceUpdate] = useState(0);
  const [result, setResult] = useState(null);
  const [hitFlash, setHitFlash] = useState(false);

  // ⭐ 사운드
  const { play } = useSFX();
  useBGM("mewtwoBgm", { enabled: phase === "playing" });

  const stateRef = useRef({
    playerX: 50,
    playerY: 75,
    bullets: [],
    lives: INIT_LIVES,
    score: 0,
    frameCount: 0,
    nextWaveIn: 60,
    waveCounter: 0,
    waveNum: 0,
    invincible: 0,
  });

  const phaseRef = useRef("ready");
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const pointerRef = useRef({ x: 50, y: 75 });

  const best = getBestScore("mewtwo_dodge");

  const endGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    clearInterval(timerRef.current);
    phaseRef.current = "result";
    setPhase("result");
    const s = stateRef.current;
    const res = recordScore("mewtwo_dodge", s.score);
    setResult({ score: s.score, ...res });
    play("gameOverMG"); // ⭐
    if (res.isNew) setTimeout(() => play("newRecord"), 700);
    onGameEnd?.(s.score);
  }, [onGameEnd, play]);

  const spawnWave = useCallback((waveNum, playerX, playerY, frameCount) => {
    const bullets = [];
    const isEarly = waveNum <= 10;
    const spd = 0.25 + 1.5 * (1 - Math.exp(-waveNum / 30));
    const pattern = isEarly ? waveNum % 5 : waveNum % 10;

    if (pattern === 0) {
      const count = isEarly ? 4 : 8;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        bullets.push({
          x: 50,
          y: 15,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          id: frameCount + i,
        });
      }
    } else if (pattern === 1) {
      const dx = playerX - 50,
        dy = playerY - 15;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = dx / dist,
        ny = dy / dist;
      const spread = isEarly ? 1 : 3;
      for (let i = -(spread - 1) / 2; i <= (spread - 1) / 2; i++) {
        const ang = Math.atan2(ny, nx) + i * 0.28;
        bullets.push({
          x: 50,
          y: 15,
          vx: Math.cos(ang) * spd * 1.1,
          vy: Math.sin(ang) * spd * 1.1,
          id: frameCount + Math.round(i) + 10,
        });
      }
    } else if (pattern === 2) {
      const count = isEarly ? 4 : 12;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + waveNum * 0.3;
        bullets.push({
          x: 50,
          y: 15,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          id: frameCount + i + 20,
        });
      }
    } else if (pattern === 3) {
      const count = isEarly ? 2 : 5;
      for (let i = 0; i < count; i++) {
        const xPos = isEarly ? 30 + i * 40 : 10 + i * 20;
        bullets.push({
          x: xPos,
          y: 10,
          vx: (Math.random() - 0.5) * 0.2,
          vy: spd,
          sin: true,
          phase: i * 0.8,
          id: frameCount + i + 30,
        });
      }
    } else if (pattern === 4) {
      const count = isEarly ? 3 : 6;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const spd2 = spd * (0.8 + Math.random() * 0.4);
        bullets.push({
          x: 20 + Math.random() * 60,
          y: 8,
          vx: Math.cos(angle) * spd2,
          vy: Math.abs(Math.sin(angle)) * spd2 + 0.15,
          id: frameCount + i + 40,
        });
      }
    } else if (pattern === 5) {
      const count = 4;
      for (let i = 0; i < count; i++) {
        const fromLeft = i % 2 === 0;
        const yPos = 10 + i * 18;
        bullets.push({
          x: fromLeft ? 2 : 98,
          y: yPos,
          vx: fromLeft ? spd * 0.9 : -spd * 0.9,
          vy: spd * 0.5,
          id: frameCount + i + 50,
        });
      }
    } else if (pattern === 6) {
      const count = 8;
      for (let i = 0; i < count; i++) {
        const angle1 = (i / count) * Math.PI * 2 + waveNum * 0.4;
        const angle2 = (i / count) * Math.PI * 2 - waveNum * 0.4;
        bullets.push({
          x: 50,
          y: 15,
          vx: Math.cos(angle1) * spd,
          vy: Math.sin(angle1) * spd,
          id: frameCount + i + 60,
        });
        bullets.push({
          x: 50,
          y: 15,
          vx: Math.cos(angle2) * spd * 0.8,
          vy: Math.sin(angle2) * spd * 0.8,
          id: frameCount + i + 70,
        });
      }
    } else if (pattern === 7) {
      const dx = playerX - 50,
        dy = playerY - 15;
      const baseAng = Math.atan2(dy, dx);
      const spreads = [-0.4, 0, 0.4];
      spreads.forEach((offset, i) => {
        const ang = baseAng + offset;
        bullets.push({
          x: 50,
          y: 15,
          vx: Math.cos(ang) * spd * 1.2,
          vy: Math.sin(ang) * spd * 1.2,
          id: frameCount + i + 80,
        });
      });
      [-0.15, 0.15].forEach((offset, i) => {
        const ang = baseAng + offset;
        bullets.push({
          x: 50,
          y: 15,
          vx: Math.cos(ang) * spd * 0.6,
          vy: Math.sin(ang) * spd * 0.6,
          id: frameCount + i + 83,
        });
      });
    } else if (pattern === 8) {
      const count = 10;
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI * 0.25 + (i / (count - 1)) * Math.PI * 1.5;
        bullets.push({
          x: 50,
          y: 15,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          id: frameCount + i + 90,
        });
      }
    } else {
      const cols = 5;
      for (let i = 0; i < cols; i++) {
        const xPos = 10 + i * 20;
        const delay = i % 2 === 0 ? 0 : 0.5;
        bullets.push({
          x: xPos,
          y: 8 + delay * 15,
          vx: 0,
          vy: spd * (0.9 + delay * 0.2),
          id: frameCount + i + 100,
        });
      }
      bullets.push({
        x: 2,
        y: 30,
        vx: spd * 0.8,
        vy: spd * 0.4,
        id: frameCount + 200,
      });
      bullets.push({
        x: 98,
        y: 30,
        vx: -spd * 0.8,
        vy: spd * 0.4,
        id: frameCount + 201,
      });
    }

    return bullets;
  }, []);

  const gameLoop = useCallback(
    (timestamp) => {
      if (phaseRef.current !== "playing") return;
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 16.67, 2);
      lastTimeRef.current = timestamp;
      const s = stateRef.current;
      s.frameCount++;
      if (s.invincible > 0) s.invincible -= dt;

      const px = pointerRef.current.x,
        py = pointerRef.current.y;
      s.playerX += (px - s.playerX) * 0.22 * dt;
      s.playerY += (py - s.playerY) * 0.22 * dt;
      s.playerX = Math.max(PLAYER_R, Math.min(100 - PLAYER_R, s.playerX));
      s.playerY = Math.max(20, Math.min(92, s.playerY));

      s.waveCounter += dt;
      const waveInterval = Math.max(40, 110 - s.waveNum * 1.4);

      if (s.waveCounter >= waveInterval) {
        s.waveCounter = 0;
        s.waveNum++;
        s.score += 10;
        play("dodgeWave"); // ⭐ 웨이브
        s.bullets = [
          ...s.bullets,
          ...spawnWave(s.waveNum, s.playerX, s.playerY, s.frameCount),
        ];
      }

      s.bullets = s.bullets
        .map((b) => ({
          ...b,
          x:
            b.x +
            (b.sin
              ? Math.sin(b.phase + s.frameCount * 0.05) * 0.5 + b.vx
              : b.vx) *
              dt,
          y: b.y + b.vy * dt,
          phase: b.phase !== undefined ? b.phase + 0.05 * dt : undefined,
        }))
        .filter((b) => b.x > -5 && b.x < 105 && b.y > -5 && b.y < 110);

      if (s.invincible <= 0) {
        for (const b of s.bullets) {
          const dx = b.x - s.playerX,
            dy = b.y - s.playerY;
          if (Math.sqrt(dx * dx + dy * dy) < PLAYER_R + BULLET_R) {
            s.lives--;
            s.invincible = 90;
            s.bullets = [];
            setHitFlash(true);
            setTimeout(() => setHitFlash(false), 300);
            play("dodgeHit"); // ⭐ 피격
            if (s.lives <= 0) {
              endGame();
              return;
            }
            break;
          }
        }
      }

      forceUpdate((n) => n + 1);
      rafRef.current = requestAnimationFrame(gameLoop);
    },
    [endGame, spawnWave, play]
  );

  const handlePointer = useCallback((e) => {
    if (phaseRef.current !== "playing") return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const startGame = useCallback(() => {
    stateRef.current = {
      playerX: 50,
      playerY: 75,
      bullets: [],
      lives: INIT_LIVES,
      score: 0,
      frameCount: 0,
      nextWaveIn: 60,
      waveCounter: 0,
      waveNum: 0,
      invincible: 0,
    };
    pointerRef.current = { x: 50, y: 75 };
    lastTimeRef.current = null;
    phaseRef.current = "playing";
    setPhase("playing");
    setResult(null);
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const s = stateRef.current;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "linear-gradient(180deg,#0a0020,#1a0040)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui,sans-serif",
        userSelect: "none",
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
            color: "rgba(255,255,255,0.7)",
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
            뮤츠 피하기
          </span>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "4px 10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
            최고
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#c4b5fd" }}>
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
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png"
            alt=""
            style={{
              width: 120,
              height: 120,
              objectFit: "contain",
              filter: "drop-shadow(0 0 24px #a855f7)",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#fff",
                marginBottom: 10,
              }}
            >
              뮤츠 피하기
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 2.1,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "12px 20px",
              }}
            >
              화면을 터치/드래그해서 이동하세요!
              <br />
              뮤츠의 사이코키네시스 파동을 피하세요
              <br />
              🔮 공격 패턴이 점점 강해집니다
              <br />
              목숨 3개 · 버틸수록 점수!
            </div>
          </div>
          <button
            onClick={startGame}
            style={{
              background: "linear-gradient(135deg,#7c3aed,#9333ea)",
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
            도전!
          </button>
        </div>
      )}

      {phase === "playing" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "8px 12px",
              flexShrink: 0,
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
              {[...Array(INIT_LIVES)].map((_, i) => (
                <span
                  key={i}
                  style={{ fontSize: 20, opacity: i < s.lives ? 1 : 0.2 }}
                >
                  💜
                </span>
              ))}
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#c4b5fd" }}>
                Wave {s.waveNum}
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fcd34d" }}>
              {s.score}pt
            </div>
          </div>

          <div
            ref={containerRef}
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              touchAction: "none",
              background: hitFlash ? "rgba(168,85,247,0.2)" : "transparent",
              cursor: "none",
            }}
            onPointerMove={handlePointer}
            onPointerDown={handlePointer}
            onTouchMove={(e) => {
              const rect = containerRef.current?.getBoundingClientRect();
              if (rect)
                pointerRef.current = {
                  x: ((e.touches[0].clientX - rect.left) / rect.width) * 100,
                  y: ((e.touches[0].clientY - rect.top) / rect.height) * 100,
                };
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "2%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "14%",
                pointerEvents: "none",
              }}
            >
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png"
                alt=""
                style={{
                  width: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 16px #a855f7)",
                }}
              />
            </div>
            {s.bullets.map((b) => (
              <div
                key={b.id}
                style={{
                  position: "absolute",
                  left: `${b.x - BULLET_R}%`,
                  top: `${b.y - BULLET_R}%`,
                  width: `${BULLET_R * 2}%`,
                  height: `${BULLET_R * 2}%`,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #e879f9, #7c3aed)",
                  boxShadow: "0 0 8px #a855f7",
                  pointerEvents: "none",
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                left: `${s.playerX - PLAYER_R}%`,
                top: `${s.playerY - PLAYER_R}%`,
                width: `${PLAYER_R * 2}%`,
                height: `${PLAYER_R * 2}%`,
                pointerEvents: "none",
                opacity:
                  s.invincible > 0
                    ? Math.floor(s.invincible / 8) % 2 === 0
                      ? 0.3
                      : 1
                    : 1,
              }}
            >
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png"
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 6px #f9a8d4)",
                }}
              />
            </div>
            {s.waveNum < 2 && (
              <div
                style={{
                  position: "absolute",
                  bottom: "15%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.4)",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                터치해서 뮤를 이동시키세요!
              </div>
            )}
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
              🏆 최고 기록!
            </div>
          )}
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png"
            alt=""
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
                color: "#c4b5fd",
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
              Wave {s.waveNum} 돌파
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={startGame}
              style={{
                background: "linear-gradient(135deg,#7c3aed,#9333ea)",
                border: "none",
                borderRadius: 16,
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
                padding: "12px 32px",
                cursor: "pointer",
                boxShadow: "0 4px 0 #4c1d95",
              }}
            >
              다시!
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
    </div>
  );
}
