// src/games/RocketDodgeGame.jsx
// 로켓단 탈출! – 프로거 스타일, 레인을 피해 위쪽 탈출구로 나가라
import { useState, useEffect, useRef, useCallback } from "react";
import { recordScore, getBestScore } from "../lib/miniGameLogic";
import { useSFX, useBGM } from "../lib/sounds"; // ⭐ 사운드 import

const COLS = 9;
const ROWS = 7;
const GAME_SECS = 60;
const INIT_LIVES = 3;

const ROCKET_IMGS = [
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png",
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png",
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/110.png",
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/100.png",
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png",
];

const LANE_CFG = [
  { dir: 1, speed: 0.3, count: 2, color: "#ef4444", imgIdx: 0 },
  { dir: -1, speed: 0.45, count: 2, color: "#f97316", imgIdx: 1 },
  { dir: 1, speed: 0.55, count: 2, color: "#a855f7", imgIdx: 2 },
  { dir: -1, speed: 0.38, count: 2, color: "#ef4444", imgIdx: 3 },
  { dir: 1, speed: 0.7, count: 2, color: "#f97316", imgIdx: 4 },
];

function initRockets(mul = 1) {
  return LANE_CFG.flatMap((cfg, li) => {
    const spacing = COLS / cfg.count;
    return Array.from({ length: cfg.count }, (_, i) => ({
      lane: li + 1,
      x: Math.random() * COLS,
      dir: cfg.dir,
      speed: cfg.speed * mul,
      color: cfg.color,
      img: ROCKET_IMGS[cfg.imgIdx],
      w: 1.2,
    }));
  });
}

export default function RocketDodgeGame({ onClose, onGameEnd }) {
  const [phase, setPhase] = useState("ready");
  const [disp, setDisp] = useState({
    score: 0,
    lives: INIT_LIVES,
    time: GAME_SECS,
    cross: 0,
  });
  const [flash, setFlash] = useState(null);
  const [, tick] = useState(0);

  // ⭐ 사운드 훅
  const { play } = useSFX();
  useBGM("rocketBgm", { enabled: phase === "playing" });

  const pikaRef = useRef({ row: 6, col: Math.floor(COLS / 2) });
  const rockRef = useRef(initRockets());
  const stateRef = useRef({
    score: 0,
    lives: INIT_LIVES,
    time: GAME_SECS,
    cross: 0,
  });
  const phaseRef = useRef("ready");
  const lastTsRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  const movingRef = useRef(false);

  const sync = () => setDisp({ ...stateRef.current });

  const hitTest = useCallback(() => {
    const p = pikaRef.current;
    if (p.row === 0 || p.row === 6) return false;
    return rockRef.current
      .filter((r) => r.lane === p.row)
      .some((r) => {
        const L = ((r.x % COLS) + COLS) % COLS;
        const R = L + r.w;
        const pc = p.col + 0.5;
        if (R <= COLS) return pc >= L && pc <= R;
        return pc >= L || pc <= R - COLS;
      });
  }, []);

  const endGame = useCallback(() => {
    phaseRef.current = "result";
    setPhase("result");
    cancelAnimationFrame(rafRef.current);
    clearInterval(timerRef.current);
    const res = recordScore("rocket_dodge", stateRef.current.score);
    // ⭐ 게임 종료
    play("gameOverMG");
    if (res?.isNew || res?.isBest) setTimeout(() => play("newRecord"), 700);
    if (onGameEnd) onGameEnd(stateRef.current.score);
  }, [onGameEnd, play]);

  const movePika = useCallback(
    (dr, dc) => {
      if (phaseRef.current !== "playing" || movingRef.current) return;
      movingRef.current = true;
      setTimeout(() => {
        movingRef.current = false;
      }, 120);

      const p = pikaRef.current;
      const nr = Math.max(0, Math.min(ROWS - 1, p.row + dr));
      const nc = (((p.col + dc) % COLS) + COLS) % COLS;
      pikaRef.current = { row: nr, col: nc };
      // ⭐ 이동 효과음 (조용히)
      play("rocketMove");
      tick((n) => n + 1);

      if (nr === 0) {
        // ⭐ 탈출 성공!
        play("rocketEscape");
        stateRef.current.score += 10;
        stateRef.current.cross += 1;
        setFlash("goal");
        setTimeout(() => setFlash(null), 500);
        const mul = 1 + stateRef.current.cross * 0.08;
        rockRef.current = initRockets(mul);
        pikaRef.current = { row: 6, col: Math.floor(COLS / 2) };
        sync();
        return;
      }

      if (hitTest()) {
        // ⭐ 충돌!
        play("rocketHit");
        stateRef.current.lives -= 1;
        setFlash("hit");
        setTimeout(() => setFlash(null), 400);
        pikaRef.current = { row: 6, col: Math.floor(COLS / 2) };
        sync();
        if (stateRef.current.lives <= 0) endGame();
      } else {
        sync();
      }
    },
    [hitTest, endGame, play]
  );

  const loop = useCallback(
    (ts) => {
      if (phaseRef.current !== "playing") return;
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
      lastTsRef.current = ts;

      rockRef.current = rockRef.current.map((r) => ({
        ...r,
        x: (((r.x + r.dir * r.speed * dt * 4) % COLS) + COLS) % COLS,
      }));

      const p = pikaRef.current;
      if (p.row > 0 && p.row < ROWS - 1 && hitTest()) {
        // ⭐ 자동 충돌(로켓이 와서 박음)
        play("rocketHit");
        stateRef.current.lives -= 1;
        setFlash("hit");
        setTimeout(() => setFlash(null), 400);
        pikaRef.current = { row: 6, col: Math.floor(COLS / 2) };
        sync();
        if (stateRef.current.lives <= 0) {
          endGame();
          return;
        }
      }

      tick((n) => n + 1);
      rafRef.current = requestAnimationFrame(loop);
    },
    [hitTest, endGame, play]
  );

  const startGame = useCallback(() => {
    stateRef.current = {
      score: 0,
      lives: INIT_LIVES,
      time: GAME_SECS,
      cross: 0,
    };
    pikaRef.current = { row: 6, col: Math.floor(COLS / 2) };
    rockRef.current = initRockets();
    lastTsRef.current = null;
    phaseRef.current = "playing";
    setPhase("playing");
    setFlash(null);
    sync();

    timerRef.current = setInterval(() => {
      stateRef.current.time -= 1;
      sync();
      if (stateRef.current.time <= 0) endGame();
    }, 1000);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop, endGame]);

  useEffect(() => {
    if (phase !== "playing") return;
    const fn = (e) => {
      const map = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
        w: [-1, 0],
        s: [1, 0],
        a: [0, -1],
        d: [0, 1],
      };
      const mv = map[e.key];
      if (mv) {
        e.preventDefault();
        movePika(...mv);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [phase, movePika]);

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(timerRef.current);
    },
    []
  );

  const CELL = Math.floor(
    Math.min(
      (typeof window !== "undefined" ? window.innerWidth : 360) / COLS,
      44
    )
  );
  const GW = CELL * COLS;
  const GH = CELL * ROWS;

  const ROW_BG = [
    "#065f46",
    "#1e1b4b",
    "#312e81",
    "#1e1b4b",
    "#312e81",
    "#1e1b4b",
    "#1f2937",
  ];

  const pika = pikaRef.current;
  const rockets = rockRef.current;
  const { score, lives, time, cross } = disp;
  const bgColor =
    flash === "hit" ? "#7f1d1d" : flash === "goal" ? "#064e3b" : "#111827";

  if (phase === "ready") {
    const best = getBestScore("rocket_dodge");
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          background: "linear-gradient(180deg,#0f172a 0%,#1e1b4b 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui,sans-serif",
          color: "#fff",
          padding: "20px 16px",
          gap: 12,
          overflowY: "auto",
        }}
      >
        <div style={{ fontSize: 52, lineHeight: 1 }}>🚀⚡</div>
        <div style={{ fontSize: 24, fontWeight: 800 }}>로켓단 탈출!</div>
        <div
          style={{
            background: "rgba(255,255,255,.08)",
            borderRadius: 16,
            padding: "16px 20px",
            maxWidth: 320,
            width: "100%",
            fontSize: 13,
            color: "#c4b5fd",
            lineHeight: 1.8,
            textAlign: "center",
          }}
        >
          ⚡ 피카츄를 조종해 로켓단을 피하고
          <br />
          위쪽 <b style={{ color: "#34d399" }}>🏁 탈출구</b>로 나가세요!
          <br />
          <br />
          탈출 성공 → <b style={{ color: "#fbbf24" }}>+10점</b>
          <br />
          로켓단에 닿으면 ❤️ 잃음
          <br />
          탈출할수록 점점 빨라져요!
        </div>
        <div
          style={{
            background: "rgba(255,255,255,.05)",
            borderRadius: 12,
            padding: "12px 20px",
            maxWidth: 320,
            width: "100%",
            fontSize: 12,
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          ⬆⬇⬅➡ 방향키 또는 아래 버튼으로 이동
        </div>
        {best > 0 && (
          <div style={{ fontSize: 13, color: "#fbbf24" }}>
            🏆 최고점: {best}점
          </div>
        )}
        <button
          onClick={startGame}
          style={{
            marginTop: 4,
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
            border: "none",
            borderRadius: 14,
            color: "#fff",
            fontSize: 17,
            fontWeight: 800,
            padding: "14px 48px",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(124,58,237,.5)",
            width: "100%",
            maxWidth: 240,
          }}
        >
          시작하기
        </button>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#6b7280",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          닫기
        </button>
      </div>
    );
  }

  if (phase === "result") {
    const best = getBestScore("rocket_dodge");
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.92)",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "system-ui,sans-serif",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 48 }}>{score >= 50 ? "🎉" : "😵"}</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>게임 종료!</div>
        <div style={{ color: "#a5b4fc", fontSize: 14 }}>
          탈출 성공 {stateRef.current.cross}회
        </div>
        <div style={{ fontSize: 36, fontWeight: 900, color: "#fbbf24" }}>
          {stateRef.current.score}점
        </div>
        {best === stateRef.current.score && stateRef.current.score > 0 && (
          <div style={{ color: "#34d399", fontSize: 14 }}>🏆 새 기록!</div>
        )}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            onClick={startGame}
            style={{
              padding: "10px 28px",
              borderRadius: 10,
              border: "none",
              background: "#7c3aed",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            다시 하기
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px 28px",
              borderRadius: 10,
              border: "none",
              background: "#374151",
              color: "#fff",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            나가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: bgColor,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui,sans-serif",
        transition: "background .12s",
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 10,
          background: "rgba(0,0,0,.4)",
          padding: "6px 16px",
          borderRadius: 20,
        }}
      >
        <span>
          {Array.from({ length: lives })
            .map(() => "❤️")
            .join("")}
        </span>
        <span>⏱ {time}s</span>
        <span style={{ color: "#fbbf24" }}>🏆 {score}점</span>
        <span style={{ color: "#34d399" }}>🏁 {cross}회</span>
      </div>

      <div
        style={{
          position: "relative",
          width: GW,
          height: GH,
          overflow: "hidden",
          borderRadius: 10,
          border: "2px solid #374151",
          boxShadow: "0 0 20px rgba(124,58,237,.4)",
        }}
      >
        {Array.from({ length: ROWS }).map((_, r) => (
          <div
            key={r}
            style={{
              position: "absolute",
              left: 0,
              top: r * CELL,
              width: GW,
              height: CELL,
              background: ROW_BG[r],
              borderBottom:
                r < ROWS - 1 ? "1px solid rgba(255,255,255,.05)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {r === 0 && (
              <span style={{ fontSize: 14, opacity: 0.8, letterSpacing: 2 }}>
                🏁 탈출구 🏁
              </span>
            )}
          </div>
        ))}

        {rockets.map((r, i) => {
          const lx = ((r.x % COLS) + COLS) % COLS;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: lx * CELL,
                top: r.lane * CELL + 3,
                width: r.w * CELL,
                height: CELL - 6,
                background: r.color + "cc",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 8px ${r.color}88`,
                border: `1px solid ${r.color}`,
                pointerEvents: "none",
                overflow: "hidden",
              }}
            >
              <img
                src={r.img}
                alt=""
                style={{
                  width: "90%",
                  height: "90%",
                  objectFit: "contain",
                  filter: `brightness(1.2) drop-shadow(0 0 3px ${r.color})`,
                  transform: r.dir < 0 ? "scaleX(-1)" : "none",
                }}
              />
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            left: pika.col * CELL + 3,
            top: pika.row * CELL + 3,
            width: CELL - 6,
            height: CELL - 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: CELL * 0.72,
            zIndex: 20,
            filter:
              flash === "hit"
                ? "brightness(3) drop-shadow(0 0 6px red)"
                : "drop-shadow(0 0 4px #fde047)",
            transition: "left .09s ease, top .09s ease",
          }}
        >
          ⚡
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "56px 56px 56px",
          gridTemplateRows: "56px 56px",
          gap: 8,
        }}
      >
        <div />
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            movePika(-1, 0);
          }}
          style={btnStyle("#4f46e5")}
        >
          ⬆
        </button>
        <div />
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            movePika(0, -1);
          }}
          style={btnStyle("#374151")}
        >
          ⬅
        </button>
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            movePika(1, 0);
          }}
          style={btnStyle("#374151")}
        >
          ⬇
        </button>
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            movePika(0, 1);
          }}
          style={btnStyle("#374151")}
        >
          ➡
        </button>
      </div>

      <button
        onClick={onClose}
        style={{
          marginTop: 10,
          background: "none",
          border: "none",
          color: "#6b7280",
          cursor: "pointer",
          fontSize: 12,
        }}
      >
        나가기
      </button>
    </div>
  );
}

function btnStyle(bg) {
  return {
    background: bg,
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontSize: 24,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    touchAction: "none",
    WebkitTapHighlightColor: "transparent",
    boxShadow: "0 3px 8px rgba(0,0,0,.4)",
  };
}
