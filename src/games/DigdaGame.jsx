// src/games/DigdaGame.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { recordScore, getBestScore } from "../lib/miniGameLogic";
import { useSFX, useBGM } from "../lib/sounds"; // ⭐ 사운드 import (sounds 복수형)

const CREATURES = {
  diglett: {
    id: "diglett",
    name: "디그다",
    points: 1,
    danger: false,
    img: "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/50.png",
  },
  dugtrio: {
    id: "dugtrio",
    name: "닥트리오",
    points: 3,
    danger: false,
    img: "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/51.png",
  },
  alolan_diglett: {
    id: "alolan_diglett",
    name: "알로라 디그다",
    points: 5,
    danger: false,
    img: "https://cdn.jsdelivr.net/gh/dudwp1221-byte/pokeset-images@main/Alolan_Dugtrio.png",
  },
  geodude: {
    id: "geodude",
    name: "모래두지",
    points: -3,
    danger: true,
    img: "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/27.png",
  },
};

function getSpawnPool(elapsed) {
  if (elapsed < 15)
    return [
      ...Array(13).fill("diglett"),
      ...Array(4).fill("dugtrio"),
      ...Array(3).fill("geodude"),
    ];
  if (elapsed < 30)
    return [
      ...Array(4).fill("diglett"),
      ...Array(12).fill("dugtrio"),
      ...Array(2).fill("alolan_diglett"),
      ...Array(4).fill("geodude"),
    ];
  return [
    ...Array(2).fill("diglett"),
    ...Array(6).fill("dugtrio"),
    ...Array(7).fill("alolan_diglett"),
    ...Array(5).fill("geodude"),
  ];
}

function getStayMs(cid, elapsed, fever) {
  let min, max;
  if (elapsed < 15) {
    min = 2000;
    max = 3000;
  } else if (elapsed < 30) {
    min = 1500;
    max = 2500;
  } else {
    min = 1000;
    max = 1800;
  }
  if (cid === "geodude") {
    min += 500;
    max = Math.min(max + 500, 3000);
  }
  return Math.max(
    1000,
    Math.round((min + Math.random() * (max - min)) * (fever ? 0.7 : 1))
  );
}

function getSpawnConfig(elapsed, fever) {
  let count, delay;
  if (elapsed < 15) {
    count = Math.random() < 0.5 ? 1 : 2;
    delay = 900;
  } else if (elapsed < 30) {
    count = Math.random() < 0.4 ? 2 : 3;
    delay = 700;
  } else {
    count = Math.random() < 0.3 ? 3 : 4;
    delay = 500;
  }
  if (fever) {
    count = Math.min(count + 1, 6);
    delay = Math.max(delay - 150, 300);
  }
  return { count, delay };
}

const TOTAL_TIME = 45;
const GRID_SIZE = 9;
const FEVER_COMBO = 8;
const FEVER_DURATION = 6000;
const FEVER_COOLDOWN = 8000;

const COMBO_MSG = ["", "", "NICE!", "GREAT!", "SUPER!", "FEVER!!", "🔥MAX!!"];
const COMBO_COLORS = [
  "",
  "",
  "#4ade80",
  "#34d399",
  "#fbbf24",
  "#fb923c",
  "#ef4444",
];

const FEVER_SPARKS = Array.from({ length: 24 }, (_, i) => ({
  left: `${4 + ((i * 4.1) % 92)}%`,
  top:
    i < 8
      ? `${5 + i * 2}%`
      : i < 16
      ? `${70 + (i - 8) * 3}%`
      : i % 2 === 0
      ? `${20 + (i - 16) * 7}%`
      : `${40 + (i - 16) * 5}%`,
  d: `${(i * 0.13).toFixed(2)}s`,
  sz: i % 3 === 0 ? 10 : i % 3 === 1 ? 7 : 12,
  c: ["#fbbf24", "#fb923c", "#ef4444", "#a78bfa", "#fff"][i % 5],
}));

export default function DigdaGame({ onClose, onGameEnd }) {
  const [phase, setPhase] = useState("ready");
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feverActive, setFeverActive] = useState(false);
  const [feverMsg, setFeverMsg] = useState(false);
  const [holes, setHoles] = useState(() =>
    Array(GRID_SIZE)
      .fill(null)
      .map((_, i) => ({
        id: i,
        creature: null,
        visible: false,
        hitAnim: false,
        dangerAnim: false,
        leaving: false,
      }))
  );
  const [floats, setFloats] = useState([]);
  const [hitEffects, setHitEffects] = useState([]);
  const [finalResult, setFinalResult] = useState(null);
  const [countDown, setCountDown] = useState(3);
  const [patternMsg, setPatternMsg] = useState(null);

  // ⭐ 사운드 훅
  const { play } = useSFX();
  useBGM("digdaBgm", { enabled: phase === "playing" || phase === "countdown" });

  const timerRef = useRef(null);
  const spawnRef = useRef(null);
  const patternRef = useRef(null);
  const feverTimerRef = useRef(null);
  const feverCoolRef = useRef(false);
  const feverActiveRef = useRef(false);
  const comboRef = useRef(0);
  const scoreRef = useRef(0);
  const timeRef = useRef(TOTAL_TIME);
  const elapsedRef = useRef(0);
  const activeRef = useRef(0);
  const floatIdRef = useRef(0);
  const maxComboRef = useRef(0);
  const phaseRef = useRef("ready");
  const curPatternRef = useRef("normal");

  const triggerFever = useCallback(() => {
    if (feverActiveRef.current || feverCoolRef.current) return;
    feverActiveRef.current = true;
    setFeverActive(true);
    setFeverMsg(true);
    play("feverStart"); // ⭐ 피버 시작
    setTimeout(() => setFeverMsg(false), 1200);
    feverTimerRef.current = setTimeout(() => {
      feverActiveRef.current = false;
      setFeverActive(false);
      comboRef.current = 0;
      setCombo(0);
      feverCoolRef.current = true;
      setTimeout(() => {
        feverCoolRef.current = false;
      }, FEVER_COOLDOWN);
    }, FEVER_DURATION);
  }, [play]);

  const spawnFloat = useCallback((text, color, holeId) => {
    const id = floatIdRef.current++;
    setFloats((p) => [...p, { id, text, color, holeId }]);
    setTimeout(() => setFloats((p) => p.filter((f) => f.id !== id)), 950);
    const eid = floatIdRef.current++;
    setHitEffects((p) => [
      ...p,
      { id: eid, holeId, danger: color === "#ef4444" },
    ]);
    setTimeout(() => setHitEffects((p) => p.filter((e) => e.id !== eid)), 420);
  }, []);

  const spawnOne = useCallback((targetHole = null) => {
    setHoles((prev) => {
      const empty = prev
        .filter((h) => !h.visible && !h.leaving)
        .map((h) => h.id);
      if (empty.length === 0) return prev;
      const holeId =
        targetHole !== null
          ? targetHole
          : empty[Math.floor(Math.random() * empty.length)];
      if (prev[holeId]?.visible || prev[holeId]?.leaving) return prev;
      const pool = getSpawnPool(elapsedRef.current);
      const cid = pool[Math.floor(Math.random() * pool.length)];
      const creature = CREATURES[cid];
      activeRef.current++;
      const stayMs = getStayMs(cid, elapsedRef.current, feverActiveRef.current);

      setTimeout(() => {
        setHoles((p) =>
          p.map((h) =>
            h.id === holeId && h.visible && !h.hitAnim
              ? { ...h, leaving: true }
              : h
          )
        );
        setTimeout(() => {
          setHoles((p) =>
            p.map((h) =>
              h.id === holeId && h.leaving
                ? { ...h, visible: false, leaving: false, creature: null }
                : h
            )
          );
          activeRef.current = Math.max(0, activeRef.current - 1);
        }, 300);
      }, stayMs);

      const staged = prev.map((h) =>
        h.id === holeId
          ? {
              ...h,
              creature,
              visible: false,
              hitAnim: false,
              dangerAnim: false,
              leaving: false,
            }
          : h
      );
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHoles((p) =>
            p.map((h) =>
              h.id === holeId && !h.visible && !h.leaving
                ? { ...h, visible: true }
                : h
            )
          );
        });
      });
      return staged;
    });
  }, []);

  const doWave = useCallback(() => {
    Array.from({ length: GRID_SIZE }).forEach((_, i) => {
      setTimeout(() => {
        if (phaseRef.current === "playing") spawnOne(i);
      }, i * 120);
    });
  }, [spawnOne]);
  const doSyncAll = useCallback(() => {
    setHoles((prev) => {
      const pool = getSpawnPool(elapsedRef.current);
      return prev.map((h) => {
        if (h.visible || h.leaving) return h;
        const cid = pool[Math.floor(Math.random() * pool.length)];
        const creature = CREATURES[cid];
        activeRef.current++;
        const stayMs = getStayMs(
          cid,
          elapsedRef.current,
          feverActiveRef.current
        );
        setTimeout(() => {
          setHoles((p) =>
            p.map((ph) =>
              ph.id === h.id && ph.visible && !ph.hitAnim
                ? { ...ph, leaving: true }
                : ph
            )
          );
          setTimeout(() => {
            setHoles((p) =>
              p.map((ph) =>
                ph.id === h.id && ph.leaving
                  ? { ...ph, visible: false, leaving: false, creature: null }
                  : ph
              )
            );
            activeRef.current = Math.max(0, activeRef.current - 1);
          }, 300);
        }, stayMs);
        return {
          ...h,
          creature,
          visible: true,
          hitAnim: false,
          dangerAnim: false,
          leaving: false,
        };
      });
    });
  }, []);
  const doBurst = useCallback(() => {
    const count = 4 + Math.floor(Math.random() * 3);
    const indices = [...Array(GRID_SIZE).keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    indices.forEach((i) => spawnOne(i));
  }, [spawnOne]);
  const doZigzag = useCallback(() => {
    [0, 2, 4, 6, 8, 7, 5, 3, 1].forEach((holeId, i) => {
      setTimeout(() => {
        if (phaseRef.current === "playing") spawnOne(holeId);
      }, i * 100);
    });
  }, [spawnOne]);
  const doRotate = useCallback(() => {
    [0, 1, 2, 5, 8, 7, 6, 3].forEach((holeId, i) => {
      setTimeout(() => {
        if (phaseRef.current === "playing") spawnOne(holeId);
      }, i * 130);
    });
  }, [spawnOne]);
  const doLine = useCallback(() => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
    ];
    const line = lines[Math.floor(Math.random() * lines.length)];
    line.forEach((i) => spawnOne(i));
  }, [spawnOne]);
  const doNormal = useCallback(
    (count) => {
      for (let i = 0; i < count; i++)
        setTimeout(() => {
          if (phaseRef.current === "playing") spawnOne();
        }, i * 60);
    },
    [spawnOne]
  );

  const spawnCreature = useCallback(() => {
    const pat = curPatternRef.current;
    const { count } = getSpawnConfig(
      elapsedRef.current,
      feverActiveRef.current
    );
    if (pat === "wave") doWave();
    else if (pat === "sync_all") doSyncAll();
    else if (pat === "burst") doBurst();
    else if (pat === "zigzag") doZigzag();
    else if (pat === "rotate") doRotate();
    else if (pat === "line") doLine();
    else doNormal(count);
  }, [doNormal, doWave, doSyncAll, doBurst, doZigzag, doRotate, doLine]);

  const triggerPattern = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const specials = ["wave", "sync_all", "burst", "zigzag", "rotate", "line"];
    const pat =
      Math.random() < 0.45
        ? "normal"
        : specials[Math.floor(Math.random() * specials.length)];
    const msgs = {
      wave: "🌊 웨이브!",
      sync_all: "💥 전체 등장!",
      burst: "⚡ 버스트!",
      zigzag: "↔️ 지그재그!",
      rotate: "🔄 회전!",
      line: "🎯 라인!",
      normal: "",
    };
    curPatternRef.current = pat;
    if (msgs[pat]) {
      play("patternMsg"); // ⭐ 패턴 알림
      setPatternMsg(msgs[pat]);
      setTimeout(() => setPatternMsg(null), 1400);
    }
    if (pat !== "normal")
      setTimeout(() => {
        curPatternRef.current = "normal";
      }, 7000 + Math.random() * 5000);
    patternRef.current = setTimeout(
      triggerPattern,
      8000 + Math.random() * 7000
    );
  }, [play]);

  const handleTap = useCallback(
    (holeId) => {
      if (phaseRef.current !== "playing") return;
      setHoles((prev) => {
        const hole = prev.find((h) => h.id === holeId);
        if (!hole?.visible || hole.hitAnim || hole.leaving) return prev;
        const { creature } = hole;
        activeRef.current = Math.max(0, activeRef.current - 1);
        if (creature.danger) {
          // ⭐ 데구리 꽝 + 콤보 끊김
          play("geodudeHit");
          if (comboRef.current > 0) play("comboBreak");
          if (feverActiveRef.current) {
            clearTimeout(feverTimerRef.current);
            feverActiveRef.current = false;
            setFeverActive(false);
            feverCoolRef.current = true;
            setTimeout(() => {
              feverCoolRef.current = false;
            }, FEVER_COOLDOWN);
          }
          comboRef.current = 0;
          const pen = Math.abs(creature.points);
          scoreRef.current = Math.max(0, scoreRef.current - pen);
          setScore(scoreRef.current);
          setCombo(0);
          spawnFloat(`-${pen}`, "#ef4444", holeId);
        } else {
          // ⭐ 포켓몬별 타격 사운드
          if (creature.id === "diglett") play("digdaPop");
          else if (creature.id === "dugtrio") play("daktrioPop");
          else if (creature.id === "alolan_diglett") play("alolaPop");

          comboRef.current++;
          if (comboRef.current > maxComboRef.current) {
            maxComboRef.current = comboRef.current;
            setMaxCombo(comboRef.current);
          }
          const mult = Math.min(comboRef.current, 6);
          const fever2 = feverActiveRef.current ? 2 : 1;
          const earned = creature.points * mult * fever2;
          scoreRef.current += earned;
          setScore(scoreRef.current);
          setCombo(comboRef.current);

          // ⭐ 3콤보마다 보너스
          if (comboRef.current >= 3 && comboRef.current % 3 === 0)
            play("comboBonus");

          const txt =
            comboRef.current >= 2
              ? `+${earned} ×${mult}${fever2 > 1 ? " 🔥" : ""}`
              : `+${earned}`;
          spawnFloat(txt, COMBO_COLORS[mult] || "#4ade80", holeId);
          if (comboRef.current >= FEVER_COMBO) triggerFever();
        }
        return prev.map((h) =>
          h.id === holeId
            ? { ...h, hitAnim: true, dangerAnim: creature.danger }
            : h
        );
      });
      setTimeout(() => {
        setHoles((p) =>
          p.map((h) =>
            h.id === holeId
              ? {
                  ...h,
                  visible: false,
                  hitAnim: false,
                  dangerAnim: false,
                  leaving: false,
                  creature: null,
                }
              : h
          )
        );
      }, 220);
    },
    [spawnFloat, triggerFever, play]
  );

  const endGame = useCallback(() => {
    phaseRef.current = "result";
    setPhase("result");
    clearInterval(timerRef.current);
    clearTimeout(spawnRef.current);
    clearTimeout(patternRef.current);
    clearTimeout(feverTimerRef.current);
    const result = recordScore("diglett", scoreRef.current);
    setFinalResult({
      score: scoreRef.current,
      ...result,
      maxCombo: maxComboRef.current,
    });
    // ⭐ 게임 종료
    play("gameOverMG");
    if (result.isNew) setTimeout(() => play("newRecord"), 700);
    onGameEnd?.(scoreRef.current);
  }, [onGameEnd, play]);

  const startGame = useCallback(() => {
    comboRef.current = 0;
    scoreRef.current = 0;
    maxComboRef.current = 0;
    timeRef.current = TOTAL_TIME;
    elapsedRef.current = 0;
    activeRef.current = 0;
    feverActiveRef.current = false;
    feverCoolRef.current = false;
    curPatternRef.current = "normal";
    phaseRef.current = "playing";
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(TOTAL_TIME);
    setFeverActive(false);
    setFeverMsg(false);
    setHoles(
      Array(GRID_SIZE)
        .fill(null)
        .map((_, i) => ({
          id: i,
          creature: null,
          visible: false,
          hitAnim: false,
          dangerAnim: false,
          leaving: false,
        }))
    );
    setPhase("playing");

    timerRef.current = setInterval(() => {
      timeRef.current--;
      elapsedRef.current = TOTAL_TIME - timeRef.current;
      setTimeLeft(timeRef.current);
      // ⭐ 10초 경고
      if (timeRef.current === 10) play("timeWarning");
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current);
        clearTimeout(spawnRef.current);
        clearTimeout(patternRef.current);
        endGame();
      }
    }, 1000);

    const scheduleSpawn = () => {
      if (phaseRef.current !== "playing") return;
      const pat = curPatternRef.current;
      const { delay } = getSpawnConfig(
        elapsedRef.current,
        feverActiveRef.current
      );
      const d = ["wave", "sync_all", "zigzag", "rotate", "line"].includes(pat)
        ? 3000 + Math.random() * 1000
        : pat === "burst"
        ? 2000
        : delay;
      spawnRef.current = setTimeout(() => {
        spawnCreature();
        if (phaseRef.current === "playing") scheduleSpawn();
      }, d);
    };
    scheduleSpawn();
    patternRef.current = setTimeout(triggerPattern, 12000);
  }, [spawnCreature, endGame, triggerPattern, play]);

  const startCountdown = useCallback(() => {
    phaseRef.current = "countdown";
    setPhase("countdown");
    setCountDown(3);
    play("countdown"); // ⭐ 첫 카운트
    let c = 3;
    const iv = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(iv);
        play("goSignal"); // ⭐ GO!
        startGame();
      } else {
        setCountDown(c);
        play("countdown"); // ⭐ 2, 1
      }
    }, 1000);
  }, [startGame, play]);

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      clearTimeout(spawnRef.current);
      clearTimeout(patternRef.current);
      clearTimeout(feverTimerRef.current);
    },
    []
  );

  const best = getBestScore("diglett");
  const timerPct = (timeLeft / TOTAL_TIME) * 100;
  const timerColor =
    timeLeft <= 10 ? "#ef4444" : timeLeft <= 20 ? "#fbbf24" : "#4ade80";

  const renderHole = (hole) => {
    const { creature, visible, hitAnim, dangerAnim, leaving } = hole;
    const holeFloats = floats.filter((f) => f.holeId === hole.id);
    const holeHits = hitEffects.filter((e) => e.holeId === hole.id);

    let transform, transition;
    if (hitAnim) {
      transform = "translateY(20%) scale(0.2)";
      transition = "transform 0.25s ease-in";
    } else if (leaving) {
      transform = "translateY(18%)";
      transition = "transform 0.3s ease-in";
    } else if (visible) {
      transform = "translateY(-15%) scale(1)";
      transition = "transform 0.45s cubic-bezier(.34,1.3,.64,1)";
    } else {
      transform = "translateY(20%)";
      transition = "none";
    }

    return (
      <div
        key={hole.id}
        onClick={() => visible && !hitAnim && !leaving && handleTap(hole.id)}
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "100%",
          cursor: visible && !hitAnim && !leaving ? "pointer" : "default",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: "8%",
              left: "10%",
              right: "10%",
              height: "48%",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "-6% -4% -2% -4%",
                background:
                  "radial-gradient(ellipse at 50% 60%, #6b4226 0%, #8b5a2b 40%, #a0682e 70%, transparent 100%)",
                borderRadius: "50%",
                filter: "blur(1px)",
                opacity: 0.85,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(ellipse at 50% 25%, #0a0503 0%, #1a0f08 25%, #2d1a0e 50%, #4a2a17 80%, #5c3420 100%)`,
                borderRadius: "50%",
                boxShadow: `inset 0 8px 16px rgba(0,0,0,0.95), inset 0 -4px 8px rgba(139,90,43,0.4), inset 4px 0 6px rgba(0,0,0,0.5), inset -4px 0 6px rgba(0,0,0,0.5)`,
                zIndex: 2,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-40%",
                left: "50%",
                width: "170%",
                height: "180%",
                marginLeft: "-85%",
                transform,
                transition,
                filter: dangerAnim
                  ? "brightness(0.5) sepia(1) saturate(8) hue-rotate(-20deg)"
                  : "none",
                pointerEvents: "none",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                zIndex: 3,
              }}
            >
              {creature && (
                <img
                  src={creature.img}
                  alt={creature.name}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "center bottom",
                    clipPath:
                      creature.id === "diglett"
                        ? "inset(0 0 30% 0)"
                        : creature.id === "dugtrio"
                        ? "inset(0 0 25% 0)"
                        : creature.id === "alolan_diglett"
                        ? "inset(0 0 28% 0)"
                        : creature.id === "geodude"
                        ? "inset(0 0 30% 0)"
                        : "none",
                    filter: dangerAnim
                      ? "none"
                      : creature.id === "alolan_diglett"
                      ? "drop-shadow(0 -2px 8px #a78bfa) drop-shadow(0 2px 4px rgba(0,0,0,0.8))"
                      : "drop-shadow(0 2px 4px rgba(0,0,0,0.8))",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "-18%",
                left: "-12%",
                right: "-12%",
                height: "70%",
                background: `radial-gradient(ellipse at 50% 0%, #6b4226 0%, #7a4a2a 25%, #8b5a2b 55%, #a0682e 100%)`,
                borderRadius: "50% 50% 40% 40% / 85% 85% 15% 15%",
                boxShadow: `inset 0 3px 6px rgba(255,200,140,0.2), inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)`,
                zIndex: 7,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "30%",
                  left: "20%",
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.4)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "65%",
                  width: 2,
                  height: 2,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.3)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "40%",
                  left: "45%",
                  width: 2,
                  height: 2,
                  borderRadius: "50%",
                  background: "rgba(255,220,180,0.3)",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                top: "-2%",
                left: "15%",
                right: "15%",
                height: "12%",
                background:
                  "radial-gradient(ellipse at 50% 100%, rgba(255,220,180,0.5) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
                filter: "blur(2px)",
                zIndex: 8,
              }}
            />
          </div>
          {creature && visible && !hitAnim && !leaving && (
            <>
              {creature.danger && (
                <div
                  style={{
                    position: "absolute",
                    top: "8%",
                    right: "12%",
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 900,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "dangerBadge 0.4s ease-in-out infinite",
                    zIndex: 10,
                    pointerEvents: "none",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
                  }}
                >
                  ✕
                </div>
              )}
              {creature.id === "alolan_diglett" && (
                <div
                  style={{
                    position: "absolute",
                    top: "6%",
                    left: "12%",
                    fontSize: 14,
                    animation: "shineStar 0.6s ease-in-out infinite alternate",
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                >
                  ✨
                </div>
              )}
            </>
          )}
          {holeHits.map((hit) => (
            <div
              key={hit.id}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 15,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "40%",
                  transform: "translate(-50%,-50%)",
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: hit.danger
                    ? "radial-gradient(circle, rgba(239,68,68,0.75) 0%, transparent 70%)"
                    : "radial-gradient(circle, rgba(251,191,36,0.85) 0%, transparent 70%)",
                  animation: "hitFlash 0.35s ease-out forwards",
                }}
              />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "40%",
                    fontSize: i % 2 === 0 ? 13 : 9,
                    color: hit.danger
                      ? "#ef4444"
                      : i % 3 === 0
                      ? "#fbbf24"
                      : i % 3 === 1
                      ? "#fff"
                      : "#4ade80",
                    fontWeight: 900,
                    transform: `translate(-50%,-50%) rotate(${deg}deg)`,
                    animation: `hitStar${i % 4} 0.38s ease-out forwards`,
                    animationDelay: `${i * 15}ms`,
                  }}
                >
                  ★
                </div>
              ))}
            </div>
          ))}
          {holeFloats.map((f) => (
            <div
              key={f.id}
              style={{
                position: "absolute",
                top: "0%",
                left: "50%",
                transform: "translateX(-50%)",
                color: f.color,
                fontWeight: 900,
                fontSize: f.text.includes("🔥")
                  ? 18
                  : f.text.startsWith("-")
                  ? 15
                  : 16,
                zIndex: 20,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                animation: "floatUpBig 0.95s ease-out forwards",
                textShadow: `0 0 14px ${f.color}, 0 2px 6px rgba(0,0,0,0.9)`,
              }}
            >
              {f.text}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const bgColor = feverActive
    ? "linear-gradient(160deg,#1a0000,#3d0500,#1a0000)"
    : "linear-gradient(160deg,#7a4e2d,#c8834a,#7a4e2d)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: bgColor,
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui,sans-serif",
        userSelect: "none",
        WebkitUserSelect: "none",
        transition: "background 0.3s",
      }}
    >
      {feverActive &&
        FEVER_SPARKS.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.left,
              top: s.top,
              width: s.sz,
              height: s.sz,
              zIndex: 1,
              pointerEvents: "none",
              background: s.c,
              clipPath:
                "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
              animation: `feverSpark ${0.5 + i * 0.07}s ease-in-out infinite`,
              animationDelay: s.d,
              boxShadow: `0 0 10px ${s.c}, 0 0 20px ${s.c}88`,
            }}
          />
        ))}
      {feverActive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            boxShadow:
              "inset 0 0 80px rgba(251,146,60,0.55), inset 0 0 160px rgba(239,68,68,0.3)",
            animation: "feverPulse 0.45s ease-in-out infinite alternate",
          }}
        />
      )}

      {/* 헤더 */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
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
            border: "1px solid rgba(255,255,255,0.15)",
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
          <span style={{ fontSize: 18 }}>⛏️</span>
          <span style={{ fontWeight: 900, color: "#fff", fontSize: 16 }}>
            디그다 두더지잡기
          </span>
        </div>
        <div
          style={{
            background: "rgba(253,211,77,0.12)",
            border: "1px solid rgba(253,211,77,0.3)",
            borderRadius: 10,
            padding: "4px 10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
            최고 기록
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fcd34d" }}>
            {best.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 준비 화면 */}
      {phase === "ready" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            padding: 28,
            overflowY: "auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: 52 }}>⛏️</div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#fff",
                marginBottom: 8,
              }}
            >
              디그다 두더지잡기
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.9,
                background: "rgba(0,0,0,0.25)",
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              구멍에서 튀어나오는 포켓몬을 빠르게 탭하세요!
              <br />
              <span style={{ color: "#fbbf24" }}>모래두지</span>를 치면 콤보
              초기화! 콤보 8개 = 🔥 피버!
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {Object.values(CREATURES).map((c) => (
              <div
                key={c.id}
                style={{
                  background: c.danger
                    ? "rgba(239,68,68,0.15)"
                    : c.id === "alolan_diglett"
                    ? "rgba(167,139,250,0.15)"
                    : "rgba(255,255,255,0.12)",
                  border: `1.5px solid ${
                    c.danger
                      ? "rgba(239,68,68,0.4)"
                      : c.id === "alolan_diglett"
                      ? "rgba(167,139,250,0.5)"
                      : "rgba(255,255,255,0.2)"
                  }`,
                  borderRadius: 14,
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 120,
                }}
              >
                <img
                  src={c.img}
                  alt={c.name}
                  style={{ width: 32, height: 32, objectFit: "contain" }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 2,
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: c.danger
                        ? "#ef4444"
                        : c.id === "alolan_diglett"
                        ? "#a78bfa"
                        : c.points >= 3
                        ? "#fbbf24"
                        : "#4ade80",
                    }}
                  >
                    {c.danger ? "💥 콤보 리셋" : `+${c.points}점`}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 14,
              padding: "10px 16px",
              fontSize: 11,
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
              lineHeight: 1.8,
            }}
          >
            🌊웨이브 · 💥전체등장 · ⚡버스트 · ↔️지그재그 · 🔄회전 · 🎯라인
          </div>
          <button
            onClick={startCountdown}
            style={{
              background: "linear-gradient(135deg,#c2410c,#ea580c)",
              border: "none",
              borderRadius: 20,
              color: "#fff",
              fontWeight: 900,
              fontSize: 18,
              padding: "14px 52px",
              cursor: "pointer",
              boxShadow: "0 6px 0 #7c2d12, 0 10px 24px rgba(194,65,12,0.4)",
            }}
          >
            게임 시작!
          </button>
        </div>
      )}

      {/* 카운트다운 */}
      {phase === "countdown" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 100,
              fontWeight: 900,
              color: "#fff",
              animation: "countPop 0.9s ease-out",
              textShadow: "0 0 48px rgba(234,88,12,0.9)",
            }}
          >
            {countDown}
          </div>
        </div>
      )}

      {/* 게임 플레이 */}
      {phase === "playing" && (
        <>
          {feverMsg && (
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 50,
                pointerEvents: "none",
                fontSize: 36,
                fontWeight: 900,
                color: "#fbbf24",
                textShadow: "0 0 24px #fb923c, 0 0 48px #ef4444",
                animation: "feverIn 1.2s ease-out forwards",
                whiteSpace: "nowrap",
              }}
            >
              🔥 FEVER TIME!! 🔥
            </div>
          )}
          {(feverActive || patternMsg) && (
            <div
              style={{
                position: "relative",
                zIndex: 2,
                textAlign: "center",
                padding: "5px 0",
                fontSize: feverActive ? 13 : 12,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: 2,
                flexShrink: 0,
                background: feverActive
                  ? "linear-gradient(90deg,#7c2d12,#c2410c,#ea580c,#c2410c,#7c2d12)"
                  : "rgba(0,0,0,0.6)",
                backgroundSize: "300% 100%",
                animation: feverActive
                  ? "feverBanner 0.7s linear infinite"
                  : "none",
              }}
            >
              {feverActive ? "🔥 FEVER ×2배 🔥" : patternMsg}
            </div>
          )}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 20px",
              flexShrink: 0,
            }}
          >
            <div style={{ textAlign: "center", minWidth: 70 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 1,
                }}
              >
                SCORE
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: feverActive ? "#fbbf24" : "#fff",
                  lineHeight: 1,
                  transition: "color 0.3s",
                }}
              >
                {score.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: timerColor,
                  lineHeight: 1,
                  transition: "color 0.3s",
                  animation:
                    timeLeft <= 10
                      ? "timerShake 0.4s ease-in-out infinite"
                      : "none",
                }}
              >
                {timeLeft}
              </div>
              <div
                style={{
                  width: 90,
                  height: 6,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 99,
                  marginTop: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${timerPct}%`,
                    height: "100%",
                    background: feverActive
                      ? "linear-gradient(90deg,#fbbf24,#ef4444)"
                      : timerColor,
                    borderRadius: 99,
                    transition: "width 1s linear, background 0.3s",
                  }}
                />
              </div>
            </div>
            <div style={{ textAlign: "center", minWidth: 70 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 1,
                }}
              >
                COMBO
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: feverActive
                    ? "#fb923c"
                    : COMBO_COLORS[Math.min(combo, 6)] || "#fff",
                }}
              >
                {combo > 0 ? `×${combo}` : "—"}
              </div>
              {combo >= 2 && (
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: feverActive
                      ? "#fb923c"
                      : COMBO_COLORS[Math.min(combo, 6)],
                    animation: "comboIn 0.25s ease-out",
                  }}
                >
                  {COMBO_MSG[Math.min(combo, 6)]}
                </div>
              )}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px 16px 16px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                width: "100%",
                maxWidth: 360,
              }}
            >
              {holes.map(renderHole)}
            </div>
          </div>
        </>
      )}

      {/* 결과 */}
      {phase === "result" && finalResult && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            padding: 32,
            position: "relative",
            zIndex: 1,
          }}
        >
          {finalResult.isNew && (
            <div
              style={{
                background: "linear-gradient(135deg,#ffd700,#ff8c00)",
                color: "#000",
                fontWeight: 900,
                fontSize: 15,
                padding: "6px 24px",
                borderRadius: 99,
                animation: "pop 0.5s cubic-bezier(.34,1.56,.64,1)",
              }}
            >
              🏆 최고 기록 갱신!
            </div>
          )}
          <div style={{ fontSize: 52 }}>⛏️</div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 4,
              }}
            >
              최종 점수
            </div>
            <div
              style={{
                fontSize: 68,
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1,
                textShadow: "0 0 36px rgba(234,88,12,0.7)",
                animation: "pop 0.6s cubic-bezier(.34,1.56,.64,1)",
              }}
            >
              {finalResult.score.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: "14px 28px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 2,
                }}
              >
                최고 콤보
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fbbf24" }}>
                ×{finalResult.maxCombo}
              </div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 2,
                }}
              >
                역대 최고
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#4ade80" }}>
                {finalResult.best.toLocaleString()}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => {
                setPhase("ready");
                setFinalResult(null);
              }}
              style={{
                background: "linear-gradient(135deg,#c2410c,#ea580c)",
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
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 16,
                color: "rgba(255,255,255,0.8)",
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
        @keyframes floatUpBig  { 0%{transform:translateX(-50%) translateY(0) scale(1.2);opacity:1} 30%{transform:translateX(-50%) translateY(-14px) scale(1.45);opacity:1} 100%{transform:translateX(-50%) translateY(-64px) scale(0.9);opacity:0} }
        @keyframes dangerBadge { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4)} }
        @keyframes timerShake  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        @keyframes comboIn     { from{transform:scale(0.4);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes countPop    { 0%{transform:scale(2.2);opacity:0} 25%{transform:scale(1);opacity:1} 80%{opacity:1} 100%{transform:scale(0.7);opacity:0} }
        @keyframes pop         { from{transform:scale(0.5)} to{transform:scale(1)} }
        @keyframes shineStar   { from{transform:scale(0.8) rotate(-10deg);opacity:0.7} to{transform:scale(1.2) rotate(10deg);opacity:1} }
        @keyframes feverSpark  { 0%,100%{transform:scale(0.3) rotate(0deg);opacity:0.2} 50%{transform:scale(1.6) rotate(180deg);opacity:1} }
        @keyframes feverPulse  { from{opacity:0.5} to{opacity:1} }
        @keyframes feverBanner { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
        @keyframes feverIn     { 0%{transform:translateX(-50%) scale(0.4);opacity:0} 20%{transform:translateX(-50%) scale(1.2);opacity:1} 70%{transform:translateX(-50%) scale(1);opacity:1} 100%{transform:translateX(-50%) scale(1.1);opacity:0} }
        @keyframes hitFlash    { 0%{transform:translate(-50%,-50%) scale(0.4);opacity:1} 100%{transform:translate(-50%,-50%) scale(2.8);opacity:0} }
        @keyframes hitStar0    { 0%{transform:translate(-50%,-50%) rotate(0deg)   translateY(0) scale(1);opacity:1} 100%{transform:translate(-50%,-50%) rotate(0deg)   translateY(-30px) scale(0);opacity:0} }
        @keyframes hitStar1    { 0%{transform:translate(-50%,-50%) rotate(45deg)  translateY(0) scale(1);opacity:1} 100%{transform:translate(-50%,-50%) rotate(45deg)  translateY(-30px) scale(0);opacity:0} }
        @keyframes hitStar2    { 0%{transform:translate(-50%,-50%) rotate(90deg)  translateY(0) scale(1);opacity:1} 100%{transform:translate(-50%,-50%) rotate(90deg)  translateY(-30px) scale(0);opacity:0} }
        @keyframes hitStar3    { 0%{transform:translate(-50%,-50%) rotate(135deg) translateY(0) scale(1);opacity:1} 100%{transform:translate(-50%,-50%) rotate(135deg) translateY(-30px) scale(0);opacity:0} }
      `}</style>
    </div>
  );
}
