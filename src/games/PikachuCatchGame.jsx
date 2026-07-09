// src/games/PikachuCatchGame.jsx  (잠만보의 간식 타임)
import { useState, useEffect, useRef, useCallback } from "react";
import { recordScore, getBestScore } from "../lib/miniGameLogic";
import { useSFX, useBGM } from "../lib/sounds"; // ⭐ 사운드 import

const TOTAL_TIME = 60;
const INIT_LIVES = 3;
const BASKET_W = 20;
const BASE_FALL = 0.9;

const BERRIES = [
  {
    type: "oran",
    pts: 1,
    danger: false,
    emoji: "🫐",
    color: "#3b82f6",
    label: "+1",
  },
  {
    type: "pecha",
    pts: 2,
    danger: false,
    emoji: "🍑",
    color: "#f472b6",
    label: "+2",
  },
  {
    type: "sitrus",
    pts: 3,
    danger: false,
    emoji: "🍋",
    color: "#facc15",
    label: "+3",
  },
  {
    type: "golden",
    pts: 5,
    danger: false,
    emoji: "⭐",
    color: "#f59e0b",
    label: "+5",
  },
  {
    type: "mago",
    pts: 2,
    danger: false,
    emoji: "🍇",
    color: "#a855f7",
    label: "+2",
  },
  {
    type: "lum",
    pts: 4,
    danger: false,
    emoji: "🌟",
    color: "#6ee7b7",
    label: "+4",
  },
  {
    type: "pepper",
    pts: -2,
    danger: true,
    emoji: "🌶️",
    color: "#ef4444",
    label: "-2❤️",
  },
  {
    type: "dung",
    pts: -1,
    danger: true,
    emoji: "💩",
    color: "#92400e",
    label: "-1❤️",
  },
];

const PATTERNS = [
  "normal",
  "shower",
  "pepper_wave",
  "golden_rain",
  "rainbow",
  "alternating",
  "burst",
  "zigzag",
];
const PATTERN_INFO = {
  shower: {
    msg: "🍇 열매 소나기!",
    bg: "linear-gradient(160deg,#1a2e0d,#2d4a1a,#1a2e0d)",
  },
  pepper_wave: {
    msg: "🌶️ 매운 파도 조심!",
    bg: "linear-gradient(160deg,#4a0000,#8b1a1a,#4a0000)",
  },
  golden_rain: {
    msg: "⭐ 황금 열매 타임!",
    bg: "linear-gradient(160deg,#3d2800,#7a5200,#3d2800)",
  },
  rainbow: {
    msg: "🌈 무지개 열매!",
    bg: "linear-gradient(160deg,#1a1040,#2d0a5e,#1a1040)",
  },
  alternating: {
    msg: "↔️ 좌우 리듬!",
    bg: "linear-gradient(160deg,#0d2a3d,#1a4a6b,#0d2a3d)",
  },
  burst: {
    msg: "💥 폭발 타임!",
    bg: "linear-gradient(160deg,#2d1a00,#5a3300,#2d1a00)",
  },
  zigzag: {
    msg: "〰️ 지그재그!",
    bg: "linear-gradient(160deg,#0a2d0a,#1a5a1a,#0a2d0a)",
  },
};

let _rainbowIdx = 0,
  _altSide = false,
  _zigX = 20,
  _zigDir = 1;

function getSpawnX(pattern, count) {
  if (pattern === "alternating") {
    _altSide = !_altSide;
    return _altSide ? 10 + Math.random() * 30 : 60 + Math.random() * 30;
  }
  if (pattern === "zigzag") {
    _zigX += _zigDir * (12 + Math.random() * 12);
    if (_zigX > 85) {
      _zigX = 85;
      _zigDir = -1;
    }
    if (_zigX < 15) {
      _zigX = 15;
      _zigDir = 1;
    }
    return _zigX;
  }
  if (pattern === "burst") return 10 + (count % 5) * 18 + Math.random() * 6;
  return 6 + Math.random() * 88;
}

function getSpawnType(elapsed, pattern) {
  if (pattern === "shower")
    return Math.random() < 0.7
      ? "oran"
      : Math.random() < 0.5
      ? "mago"
      : "pecha";
  if (pattern === "pepper_wave")
    return Math.random() < 0.6
      ? "pepper"
      : Math.random() < 0.4
      ? "dung"
      : "oran";
  if (pattern === "golden_rain")
    return Math.random() < 0.5
      ? "golden"
      : Math.random() < 0.5
      ? "lum"
      : "sitrus";
  if (pattern === "rainbow") {
    const types = ["oran", "pecha", "mago", "sitrus", "lum", "golden"];
    _rainbowIdx = (_rainbowIdx + 1) % types.length;
    return types[_rainbowIdx];
  }
  if (pattern === "alternating")
    return Math.random() < 0.15
      ? "pepper"
      : Math.random() < 0.5
      ? "sitrus"
      : "pecha";
  if (pattern === "zigzag")
    return Math.random() < 0.18
      ? "pepper"
      : Math.random() < 0.4
      ? "mago"
      : "sitrus";
  if (pattern === "burst")
    return Math.random() < 0.12
      ? "pepper"
      : Math.random() < 0.3
      ? "golden"
      : "oran";
  const r = Math.random();
  if (elapsed < 15)
    return r < 0.55 ? "oran" : r < 0.75 ? "pecha" : r < 0.9 ? "mago" : "pepper";
  if (elapsed < 35)
    return r < 0.35
      ? "oran"
      : r < 0.5
      ? "pecha"
      : r < 0.65
      ? "mago"
      : r < 0.8
      ? "sitrus"
      : "pepper";
  return r < 0.2
    ? "oran"
    : r < 0.38
    ? "sitrus"
    : r < 0.52
    ? "lum"
    : r < 0.65
    ? "golden"
    : r < 0.8
    ? "mago"
    : "pepper";
}

export default function PikachuCatchGame({ onClose, onGameEnd }) {
  const [phase, setPhase] = useState("ready");
  const [, forceUpdate] = useState(0);
  const [result, setResult] = useState(null);
  const [curPattern, setCurPattern] = useState("normal");
  const [patternMsg, setPatternMsg] = useState(null);
  const [hitFlash, setHitFlash] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [hitPopups, setHitPopups] = useState([]);
  const [heartShake, setHeartShake] = useState(false);

  // ⭐ 사운드 훅
  const { play } = useSFX();
  useBGM("snorlaxBgm", { enabled: phase === "playing" });

  const stateRef = useRef({
    basketX: 50,
    items: [],
    score: 0,
    lives: INIT_LIVES,
    timeLeft: TOTAL_TIME,
    elapsed: 0,
    nextId: 0,
    nextSpawnIn: 55,
    spawnCounter: 0,
    pattern: "normal",
    patternTimer: 0,
    patternDuration: 0,
    nextPatternIn: 300,
  });

  const phaseRef = useRef("ready");
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const touchXRef = useRef(null);
  const containerRef = useRef(null);
  const best = getBestScore("pikachu_catch");
  const popupIdRef = useRef(0);

  const triggerHitEffect = useCallback(
    (itemType, itemX) => {
      setHitFlash(true);
      setTimeout(() => setHitFlash(false), 350);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      setHeartShake(true);
      setTimeout(() => setHeartShake(false), 500);
      play("catchPepper"); // ⭐ 고추/응가 피격 사운드
      const pid = popupIdRef.current++;
      const msg = itemType === "pepper" ? "🌶️ 매워!" : "💩 악취!";
      setHitPopups((prev) => [...prev, { id: pid, x: itemX, msg }]);
      setTimeout(
        () => setHitPopups((prev) => prev.filter((p) => p.id !== pid)),
        900
      );
    },
    [play]
  );

  const endGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    phaseRef.current = "result";
    setPhase("result");
    const finalScore = stateRef.current.score;
    const res = recordScore("pikachu_catch", finalScore);
    setResult({ score: finalScore, ...res });
    // ⭐ 게임 종료
    play("gameOverMG");
    if (res.isBest || res.isNew) setTimeout(() => play("newRecord"), 700);
    onGameEnd?.(finalScore);
  }, [onGameEnd, play]);

  const triggerPattern = useCallback(
    (s) => {
      const choices = PATTERNS.filter((p) => p !== "normal");
      const p = choices[Math.floor(Math.random() * choices.length)];
      const info = PATTERN_INFO[p] || { msg: p };
      s.pattern = p;
      s.patternDuration =
        p === "burst" || p === "shower" ? 120 : p === "pepper_wave" ? 150 : 200;
      s.patternTimer = s.patternDuration;
      s.nextPatternIn = 300 + Math.random() * 200;
      _altSide = false;
      _zigX = 20;
      _zigDir = 1;
      _rainbowIdx = 0;
      setCurPattern(p);
      setPatternMsg(info.msg);
      play("catchPattern"); // ⭐ 패턴 시작
      setTimeout(() => setPatternMsg(null), 2000);
    },
    [play]
  );

  const gameLoop = useCallback(
    (timestamp) => {
      if (phaseRef.current !== "playing") return;
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 16.67, 2);
      lastTimeRef.current = timestamp;
      const s = stateRef.current;

      s.elapsed += dt / 60;
      s.timeLeft = Math.max(0, TOTAL_TIME - s.elapsed);
      if (s.timeLeft <= 0) {
        endGame();
        return;
      }

      if (touchXRef.current !== null && containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const targetX = (touchXRef.current / cw) * 100;
        s.basketX += (targetX - s.basketX) * 0.3;
      }
      s.basketX = Math.max(
        BASKET_W / 2,
        Math.min(100 - BASKET_W / 2, s.basketX)
      );

      if (s.patternTimer > 0) {
        s.patternTimer -= dt;
        if (s.patternTimer <= 0) {
          s.pattern = "normal";
          setCurPattern("normal");
        }
      } else {
        s.nextPatternIn -= dt;
        if (s.nextPatternIn <= 0) triggerPattern(s);
      }

      const speedMult = 1 + s.elapsed / 50;
      s.items = s.items.map((item) => ({
        ...item,
        y: item.y + item.speed * dt * speedMult,
      }));

      const baseSpawn =
        s.pattern === "shower" || s.pattern === "pepper_wave" ? 18 : 55;
      const minSpawn = s.pattern === "shower" ? 12 : 28;
      s.spawnCounter += dt;
      const spawnThreshold = Math.max(minSpawn, baseSpawn - s.elapsed * 0.4);
      if (s.spawnCounter >= spawnThreshold) {
        s.spawnCounter = 0;
        const spawnNum =
          s.pattern === "burst" ? 2 + Math.floor(Math.random() * 3) : 1;
        for (let si = 0; si < spawnNum; si++) {
          const type = getSpawnType(s.elapsed, s.pattern);
          const berry = BERRIES.find((b) => b.type === type);
          const px = getSpawnX(s.pattern, s.nextId + si);
          s.items.push({
            id: s.nextId++,
            type,
            ...berry,
            x: px,
            y: -8 - si * 12,
            speed: BASE_FALL + Math.random() * 0.5 + (s.elapsed > 30 ? 0.3 : 0),
            rotate: Math.random() * 360,
            rotateSpeed: (Math.random() - 0.5) * 5,
          });
        }
      }

      const basketL = s.basketX - BASKET_W / 2;
      const basketR = s.basketX + BASKET_W / 2;
      const remaining = [];
      const hitItems = [];

      for (const item of s.items) {
        if (item.y > 86 && item.y < 98) {
          if (item.x >= basketL && item.x <= basketR) {
            s.score = Math.max(0, s.score + item.pts);
            if (item.danger) {
              s.lives--;
              hitItems.push({ type: item.type, x: item.x });
              if (s.lives <= 0) {
                hitItems.forEach((h) => triggerHitEffect(h.type, h.x));
                setTimeout(() => endGame(), 400);
                phaseRef.current = "ending";
                forceUpdate((n) => n + 1);
                return;
              }
            } else {
              // ⭐ 열매 획득 사운드 (포인트별)
              if (item.pts >= 4) play("catchBig");
              else if (item.pts >= 2) play("catchMedium");
              else play("catchSmall");
            }
            continue;
          }
        }
        if (item.y > 106) continue;
        remaining.push({
          ...item,
          rotate: item.rotate + item.rotateSpeed * dt,
        });
      }
      s.items = remaining;

      if (hitItems.length > 0) {
        hitItems.forEach((h) => triggerHitEffect(h.type, h.x));
      }

      forceUpdate((n) => n + 1);
      rafRef.current = requestAnimationFrame(gameLoop);
    },
    [endGame, triggerPattern, triggerHitEffect, play]
  );

  const startGame = useCallback(() => {
    stateRef.current = {
      basketX: 50,
      items: [],
      score: 0,
      lives: INIT_LIVES,
      timeLeft: TOTAL_TIME,
      elapsed: 0,
      nextId: 0,
      nextSpawnIn: 55,
      spawnCounter: 0,
      pattern: "normal",
      patternTimer: 0,
      patternDuration: 0,
      nextPatternIn: 300,
    };
    lastTimeRef.current = null;
    phaseRef.current = "playing";
    setCurPattern("normal");
    setPatternMsg(null);
    setHitFlash(false);
    setShaking(false);
    setHitPopups([]);
    setHeartShake(false);
    setPhase("playing");
    setResult(null);
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const handlePointerMove = useCallback((e) => {
    const t = e.touches?.[0] || e;
    if (containerRef.current)
      touchXRef.current =
        t.clientX - containerRef.current.getBoundingClientRect().left;
  }, []);
  const handlePointerStart = useCallback((e) => {
    const t = e.touches?.[0] || e;
    if (containerRef.current)
      touchXRef.current =
        t.clientX - containerRef.current.getBoundingClientRect().left;
  }, []);
  const handlePointerEnd = useCallback(() => {
    touchXRef.current = null;
  }, []);

  const s = stateRef.current;
  const timerColor =
    s.timeLeft <= 10 ? "#ef4444" : s.timeLeft <= 20 ? "#fbbf24" : "#4ade80";
  const bgMain =
    PATTERN_INFO[curPattern]?.bg ||
    "linear-gradient(160deg,#1a2e0d,#2d4a1a,#1a2e0d)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: bgMain,
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui,sans-serif",
        transition: "background 0.5s",
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
          <span style={{ fontSize: 18 }}>😴</span>
          <span style={{ fontWeight: 900, color: "#fff", fontSize: 16 }}>
            잠만보의 간식 타임!
          </span>
        </div>
        <div
          style={{
            background: "rgba(250,204,21,0.12)",
            border: "1px solid rgba(250,204,21,0.3)",
            borderRadius: 10,
            padding: "4px 10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
            최고
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fde047" }}>
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
            gap: 16,
            padding: 28,
          }}
        >
          <img
            src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/143.png"
            alt="잠만보"
            style={{
              width: 120,
              height: 120,
              objectFit: "contain",
              filter: "drop-shadow(0 0 20px #fde047)",
              animation: "snorlaxBounce 1.5s ease-in-out infinite",
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
              잠만보의 간식 타임! 😴
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 2,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              화면 좌우로 드래그해서 잠만보를 이동해요
              <br />
              🫐<b style={{ color: "#60a5fa" }}>+1</b> · 🍑
              <b style={{ color: "#f472b6" }}>+2</b> · 🍇
              <b style={{ color: "#a855f7" }}>+2</b> · 🍋
              <b style={{ color: "#facc15" }}>+3</b> · 🌟
              <b style={{ color: "#6ee7b7" }}>+4</b> · ⭐
              <b style={{ color: "#f59e0b" }}>+5</b>
              <br />
              <span style={{ color: "#ef4444" }}>
                🌶️ 고추 / 💩 은 잠만보가 싫어해요!
              </span>
              <br />
              <span style={{ color: "#a78bfa", fontSize: 11 }}>
                🌈 무지개 / ↔️ 좌우 / 💥 폭발 / 〰️ 지그재그 패턴!
              </span>
            </div>
          </div>
          <button
            onClick={startGame}
            style={{
              background: "linear-gradient(135deg,#15803d,#22c55e)",
              border: "none",
              borderRadius: 20,
              color: "#fff",
              fontWeight: 900,
              fontSize: 18,
              padding: "14px 48px",
              cursor: "pointer",
              boxShadow: "0 6px 0 #14532d",
            }}
          >
            먹자!
          </button>
        </div>
      )}

      {phase === "playing" && (
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            touchAction: "none",
            animation: shaking ? "hitShake 0.35s ease-out" : "none",
          }}
          ref={containerRef}
          onMouseDown={handlePointerStart}
          onMouseMove={handlePointerMove}
          onTouchStart={handlePointerStart}
          onTouchMove={handlePointerMove}
          onMouseLeave={handlePointerEnd}
          onMouseUp={handlePointerEnd}
          onTouchEnd={handlePointerEnd}
        >
          {hitFlash && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 50,
                pointerEvents: "none",
                background: "rgba(239,68,68,0.35)",
                animation: "flashIn 0.35s ease-out forwards",
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 16px",
              zIndex: 10,
              background: "rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, color: timerColor }}>
              {Math.ceil(s.timeLeft)}s
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fde047" }}>
              {s.score}
            </div>
            <div
              style={{
                display: "flex",
                gap: 3,
                animation: heartShake ? "heartShake 0.4s ease-out" : "none",
              }}
            >
              {Array(INIT_LIVES)
                .fill(0)
                .map((_, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 18,
                      opacity: i < s.lives ? 1 : 0.2,
                      filter:
                        i === s.lives && heartShake
                          ? "drop-shadow(0 0 8px #ef4444)"
                          : "none",
                    }}
                  >
                    ❤️
                  </span>
                ))}
            </div>
          </div>
          {patternMsg && (
            <div
              style={{
                position: "absolute",
                top: "14%",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.82)",
                color: "#fff",
                fontWeight: 900,
                fontSize: 22,
                borderRadius: 16,
                padding: "10px 28px",
                zIndex: 20,
                whiteSpace: "nowrap",
                animation: "msgPop 0.45s cubic-bezier(.34,1.56,.64,1)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                border: "2px solid rgba(255,255,255,0.2)",
                letterSpacing: 1,
              }}
            >
              {patternMsg}
            </div>
          )}
          {hitPopups.map((popup) => (
            <div
              key={popup.id}
              style={{
                position: "absolute",
                left: `${popup.x}%`,
                top: "75%",
                transform: "translateX(-50%)",
                fontSize: 20,
                fontWeight: 900,
                color: "#ef4444",
                textShadow: "0 0 12px #ef4444, 0 2px 4px rgba(0,0,0,0.8)",
                zIndex: 30,
                pointerEvents: "none",
                animation: "hitPopup 0.9s ease-out forwards",
                whiteSpace: "nowrap",
              }}
            >
              {popup.msg}
            </div>
          ))}
          {s.items.map((item) => (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%,-50%) rotate(${
                  item.rotate || 0
                }deg)`,
                fontSize:
                  item.type === "golden"
                    ? 46
                    : item.type === "lum"
                    ? 42
                    : item.type === "pepper" || item.type === "dung"
                    ? 40
                    : 38,
                filter: item.danger
                  ? "drop-shadow(0 0 10px #ef4444) drop-shadow(0 0 4px #ff0000)"
                  : item.type === "golden"
                  ? "drop-shadow(0 0 10px #ffd700)"
                  : "drop-shadow(0 2px 5px rgba(0,0,0,0.4))",
                pointerEvents: "none",
                zIndex: 5,
                animation: item.danger
                  ? "dangerWiggle 0.4s ease-in-out infinite"
                  : "none",
              }}
            >
              {item.emoji}
            </div>
          ))}
          <div
            style={{
              position: "absolute",
              bottom: "6%",
              left: `${s.basketX}%`,
              transform: "translateX(-50%)",
              width: `${BASKET_W * 1.2}%`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              userSelect: "none",
              zIndex: 10,
              animation: shaking ? "snorlaxHit 0.35s ease-out" : "none",
            }}
          >
            <img
              src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/143.png"
              alt="잠만보"
              style={{
                width: "100%",
                objectFit: "contain",
                filter: hitFlash
                  ? "drop-shadow(0 4px 12px rgba(0,0,0,0.5)) drop-shadow(0 0 20px #ef4444)"
                  : "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
                transition: "filter 0.1s",
              }}
            />
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
          <img
            src="https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/143.png"
            alt="잠만보"
            style={{
              width: 110,
              height: 110,
              objectFit: "contain",
              filter: "drop-shadow(0 0 16px #4ade80)",
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
              모은 열매
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: "#fde047",
                lineHeight: 1,
              }}
            >
              {result.score}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={startGame}
              style={{
                background: "linear-gradient(135deg,#15803d,#22c55e)",
                border: "none",
                borderRadius: 16,
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
                padding: "12px 28px",
                cursor: "pointer",
                boxShadow: "0 4px 0 #14532d",
              }}
            >
              다시 먹기
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
        @keyframes snorlaxBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes msgPop        { from{transform:translateX(-50%) scale(0.7);opacity:0} to{transform:translateX(-50%) scale(1);opacity:1} }
        @keyframes flashIn    { 0%{opacity:1} 100%{opacity:0} }
        @keyframes hitShake   { 0%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 75%{transform:translateX(-3px)} 100%{transform:translateX(0)} }
        @keyframes snorlaxHit { 0%{transform:translateX(-50%) scale(1)} 25%{transform:translateX(calc(-50% - 8px)) scale(0.95)} 75%{transform:translateX(calc(-50% + 8px)) scale(0.95)} 100%{transform:translateX(-50%) scale(1)} }
        @keyframes heartShake { 0%{transform:scale(1)} 25%{transform:scale(1.3) rotate(-10deg)} 50%{transform:scale(0.9) rotate(10deg)} 75%{transform:scale(1.1)} 100%{transform:scale(1)} }
        @keyframes hitPopup   { 0%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} 60%{opacity:0.8;transform:translateX(-50%) translateY(-40px) scale(1.1)} 100%{opacity:0;transform:translateX(-50%) translateY(-70px) scale(0.8)} }
        @keyframes dangerWiggle { 0%,100%{transform:translate(-50%,-50%) rotate(-8deg) scale(1.05)} 50%{transform:translate(-50%,-50%) rotate(8deg) scale(1.05)} }
      `}</style>
    </div>
  );
}
