import { useState, useEffect, useRef, useCallback } from "react";
import GameScreen from "./GameScreen";
import { CardFace } from "../components/CardFace";
import {
  initGs,
  checkWin,
  sortHand,
  reshuffleDeck,
  applyWinner,
  findSets,
} from "../lib/gameLogic";
import { loadFromGithubCDN } from "../lib/assets";
import { LEAGUES, GMAP } from "../lib/constants";

const MY_IDX = 2;

function makeTutorialGs() {
  const players = [
    {
      name: "상대1 (AI)",
      emoji: "🔥",
      isAI: true,
      portraitName: "지우",
      aiSpeed: 1,
    },
    {
      name: "상대2 (AI)",
      emoji: "💧",
      isAI: true,
      portraitName: "이슬",
      aiSpeed: 1,
    },
    { name: "나", emoji: "😊", isAI: false, portraitName: undefined },
    {
      name: "상대3 (AI)",
      emoji: "⚡",
      isAI: true,
      portraitName: "마티스",
      aiSpeed: 1,
    },
  ];
  const coins = {
    나: 300,
    "상대1 (AI)": 300,
    "상대2 (AI)": 300,
    "상대3 (AI)": 300,
  };
  const gs = initGs(players, coins, MY_IDX, LEAGUES[0].bet, LEAGUES[0].id);
  const groups = LEAGUES[0].groups;
  let id = 9000;
  const mc = (g, t) => ({ id: id++, group: g, type: t, isJoker: false });

  gs.players[MY_IDX].hand = sortHand(
    [
      mc("electric", "A"),
      mc("electric", "B"),
      mc("water", "A"),
      mc("water", "A"),
      mc("fire", "A"),
      mc("fire", "B"),
      mc("ground", "A"),
      mc("ground", "B"),
    ],
    groups
  );
  gs.deck.unshift(mc("water", "A"), mc("electric", "C"));
  gs.players[0].hand = sortHand(
    [
      mc("fire", "C"),
      mc("poison", "A"),
      mc("poison", "B"),
      mc("poison", "C"),
      mc("ground", "A"),
      mc("ground", "B"),
      mc("rock", "A"),
      mc("rock", "B"),
    ],
    groups
  );
  const junk = (i) => {
    gs.players[i].hand = sortHand(
      [
        mc("poison", "A"),
        mc("ground", "B"),
        mc("rock", "C"),
        mc("normal", "A"),
        mc("poison", "C"),
        mc("ground", "A"),
        mc("rock", "B"),
        mc("normal", "C"),
      ],
      groups
    );
  };
  junk(1);
  junk(3);
  gs._seq = 0;
  return gs;
}

function aiDiscardTutorial(hand) {
  const cnt = {};
  for (const c of hand) if (!c.isJoker) cnt[c.group] = (cnt[c.group] || 0) + 1;
  let maxG = null,
    maxN = 0;
  for (const [g, n] of Object.entries(cnt))
    if (n > maxN) {
      maxN = n;
      maxG = g;
    }
  if (maxG) {
    const i = hand.findIndex((c) => c.group === maxG && !c.isJoker);
    if (i >= 0) return i;
  }
  return hand.length - 1;
}

function SetRevealOverlay({ sets, images, onDone }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 4000,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        animation: "fadeInOv 0.4s ease",
      }}
    >
      <div
        style={{
          color: "#FBBF24",
          fontWeight: 900,
          fontSize: 22,
          letterSpacing: 2,
        }}
      >
        ✨ 세트 2개 완성!
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sets.map((setCards, si) => {
          const grp = setCards.find((c) => !c.isJoker);
          const g = grp ? GMAP[grp.group] : null;
          return (
            <div
              key={si}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "10px 18px",
                border: "2px solid " + (g?.color || "#fff") + "66",
                animation: `popIn 0.3s ease ${si * 0.15}s both`,
              }}
            >
              <span style={{ fontSize: 22 }}>{g?.emoji}</span>
              <span
                style={{
                  color: g?.color || "#fff",
                  fontWeight: 800,
                  fontSize: 15,
                  minWidth: 40,
                }}
              >
                {g?.label}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {setCards.map((c) => (
                  <CardFace key={c.id} card={c} images={images} w={52} h={70} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
        나머지 한 세트는 직접 완성해봐요!
      </div>
      <button
        onClick={onDone}
        style={{
          padding: "12px 36px",
          borderRadius: 40,
          border: "none",
          background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
          color: "#fff",
          fontWeight: 800,
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        계속하기 →
      </button>
      <style>{`@keyframes fadeInOv{from{opacity:0}to{opacity:1}} @keyframes popIn{0%{transform:scale(0.7);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

const STEPS = [
  {
    key: "draw1",
    title: "🃏 카드 더미 가져오기",
    desc: "중앙 덱을 탭해서 카드를 뽑아봐요!",
  },
  {
    key: "discard1",
    title: "🗑️ 카드 버리기",
    desc: "필요없는 카드를 골라서 버려요!\n같은 속성끼리 모으면 유리해요.",
  },
  {
    key: "wait",
    title: "⏳ 상대 차례 기다리기",
    desc: "지금은 상대 차례예요.\n내 차례가 올 때까지 기다려봐요!",
  },
  {
    key: "draw2",
    title: "👀 상대 버린 패를 노려요!",
    desc: "내 차례가 왔어요!\n12시 상대가 불 C를 버렸어요 🔥\n저 카드를 탭해서 가져오세요!",
  },
  {
    key: "discard2",
    title: "🗑️ 카드 버리기",
    desc: "가져온 카드로 세트가 완성돼요!\n필요없는 카드를 버려요.",
  },
  { key: "set_reveal", title: "✨ 세트 2개 완성!", desc: "" },
  {
    key: "finish",
    title: "🏆 마지막 세트 완성!",
    desc: "나머지 한 세트는 직접 만들어봐요!\n세트 3개가 완성되면 승리예요!",
  },
];

export default function InteractiveTutorial({
  images: propImages,
  tImgs: propTImgs,
  onComplete,
  onSkip,
  myCoins = 300,
}) {
  const [images, setImages] = useState({});
  const [tImgs, setTImgs] = useState({});
  const [imgLoading, setImgLoading] = useState(true);
  const [gs, setGs] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [fingerPos, setFingerPos] = useState(null);
  const [showSetReveal, setShowSetReveal] = useState(false);
  const [revealSets, setRevealSets] = useState([]);
  const [drawnCard, setDrawnCard] = useState(null);
  const [drawnKey, setDrawnKey] = useState(0);
  const [selId, setSelId] = useState(null);
  const [discardingId, setDiscardingId] = useState(null);
  const [cardEffects, setCardEffects] = useState([]);
  const [showdownAnim, setShowdownAnim] = useState(null);

  const gsRef = useRef(null);
  const drawnCardRef = useRef(null);
  const prevSetCount = useRef(0);
  const cardEffectId = useRef(0);
  const lastTapRef = useRef({ id: null, time: 0 });
  const timerBarRef = useRef(null);
  const stepIdxRef = useRef(0);
  const topAIDiscarded = useRef(false);
  const finishTaughtRef = useRef(false);
  const injectWinCardRef = useRef(false);
  const finishDrawCountRef = useRef(0);
  // ✅ 버그 수정: AI 타임아웃을 ref로 관리해 언마운트/스킵 시 클리어 보장
  const aiTimersRef = useRef([]);
  const aiActiveRef = useRef(true);

  useEffect(() => {
    gsRef.current = gs;
  }, [gs]);
  useEffect(() => {
    drawnCardRef.current = drawnCard;
  }, [drawnCard]);
  useEffect(() => {
    stepIdxRef.current = stepIdx;
  }, [stepIdx]);

  // ✅ 언마운트 시 모든 AI 타이머 클리어
  useEffect(() => {
    aiActiveRef.current = true;
    return () => {
      aiActiveRef.current = false;
      aiTimersRef.current.forEach(clearTimeout);
      aiTimersRef.current = [];
    };
  }, []);

  const pointAt = useCallback((selector, delay = 0) => {
    let tries = 0;
    const find = () => {
      if (!aiActiveRef.current) return;
      const el = document.querySelector(selector);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setFingerPos({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
          return;
        }
      }
      if (++tries < 20) {
        const t = setTimeout(find, 120);
        aiTimersRef.current.push(t);
      }
    };
    if (delay > 0) {
      const t = setTimeout(find, delay);
      aiTimersRef.current.push(t);
    } else find();
  }, []);

  const hideFinger = useCallback(() => setFingerPos(null), []);

  useEffect(() => {
    if (propImages && Object.keys(propImages).length > 5) {
      setImages(propImages);
      if (propTImgs && Object.keys(propTImgs).length > 0) setTImgs(propTImgs);
      setImgLoading(false);
      return;
    }
    loadFromGithubCDN()
      .then(({ cards, trainers }) => {
        if (Object.keys(cards).length > 0) setImages(cards);
        if (Object.keys(trainers).length > 0) setTImgs(trainers);
      })
      .catch(() => {})
      .finally(() => setImgLoading(false));
  }, []);

  useEffect(() => {
    if (imgLoading) return;
    const g = makeTutorialGs();
    gsRef.current = g;
    setGs(g);
    prevSetCount.current = (findSets(g.players[MY_IDX].hand) || []).length;
  }, [imgLoading]);

  useEffect(() => {
    if (stepIdx !== 6) return;
    if (finishTaughtRef.current) return;
    if (drawnCard) {
      pointAt("[data-tut='drawn-card']", 400);
    }
  }, [drawnCard, stepIdx, pointAt]);

  useEffect(() => {
    if (!gs || gs.cur !== MY_IDX || gs.phase !== "draw") return;
    const s = stepIdxRef.current;
    if (s === 2) {
      setStepIdx(3);
      stepIdxRef.current = 3;
      setFingerPos(null);
    }
    if (s === 3 && topAIDiscarded.current) {
      let t = 0;
      const find = () => {
        if (!aiActiveRef.current) return;
        const el = document.querySelector("[data-tut='top-discard']");
        if (el && el.querySelector("img")) {
          const r = el.getBoundingClientRect();
          setFingerPos({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
          return;
        }
        if (++t < 20) {
          const timer = setTimeout(find, 150);
          aiTimersRef.current.push(timer);
        }
      };
      const timer = setTimeout(find, 300);
      aiTimersRef.current.push(timer);
    }
    if (s === 6 && !finishTaughtRef.current && !drawnCard) {
      pointAt("[data-tut='deck']", 300);
    }
  }, [gs?.cur, gs?.phase]);

  const spawnEffect = (type, el) => {
    const rect = el?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight * 0.7;
    const eid = ++cardEffectId.current;
    setCardEffects((p) => [...p, { id: eid, type, x, y }]);
    setTimeout(() => setCardEffects((p) => p.filter((e) => e.id !== eid)), 900);
  };

  // ✅ 버그 수정: runAI — 모든 setTimeout을 aiTimersRef에 등록
  // aiActiveRef.current 체크로 언마운트/스킵 후 실행 방지
  const runAI = useCallback((fromIdx) => {
    const turn = (curIdx) => {
      const timer = setTimeout(() => {
        if (!aiActiveRef.current) return;
        const cur = gsRef.current;
        if (!cur || cur.winner || cur.cur === MY_IDX) return;
        if (cur.cur !== curIdx) return;
        const g = JSON.parse(JSON.stringify(cur));
        g._seq = (g._seq || 0) + 1;
        const ai = g.players[curIdx];
        if (g.deck.length <= 1) reshuffleDeck(g);
        if (!g.deck.length) return;
        const c = g.deck.shift();
        const nine = [...ai.hand, c];
        let di;
        if (curIdx === 0 && !topAIDiscarded.current) {
          const fi = nine.findIndex(
            (card) => card.group === "fire" && card.type === "C"
          );
          di = fi >= 0 ? fi : aiDiscardTutorial(nine);
          if (fi >= 0) {
            topAIDiscarded.current = true;
            const t = setTimeout(() => {
              if (!aiActiveRef.current) return;
              if (stepIdxRef.current === 2) {
                setStepIdx(3);
                stepIdxRef.current = 3;
              }
            }, 300);
            aiTimersRef.current.push(t);
          }
        } else {
          di = aiDiscardTutorial(nine);
        }
        const disc = nine.splice(di, 1)[0];
        ai.hand = sortHand(nine, LEAGUES[0].groups);
        (ai.discardPile = ai.discardPile || []).unshift(disc);
        const next = (curIdx + 1) % 4;
        g.phase = "draw";
        g.cur = next;
        g.turnStartedAt = Date.now();
        gsRef.current = g;
        setGs(g);
        if (next !== MY_IDX) turn(next);
      }, 1800);
      aiTimersRef.current.push(timer);
    };
    turn(fromIdx);
  }, []);

  const drawDeck = useCallback(
    (e) => {
      const g = JSON.parse(JSON.stringify(gsRef.current));
      if (!g || g.winner || g.cur !== MY_IDX || g.phase !== "draw") return;
      hideFinger();
      g._seq = (g._seq || 0) + 1;

      let card;
      if (stepIdxRef.current === 6 && injectWinCardRef.current) {
        finishDrawCountRef.current += 1;
        if (finishDrawCountRef.current === 2) {
          injectWinCardRef.current = false;
          card = { id: 9998, group: "ground", type: "C", isJoker: false };
        } else {
          if (g.deck.length <= 1) reshuffleDeck(g);
          if (!g.deck.length) return;
          card = g.deck.shift();
        }
      } else {
        if (g.deck.length <= 1) reshuffleDeck(g);
        if (!g.deck.length) return;
        card = g.deck.shift();
      }

      const nine = [...g.players[MY_IDX].hand, card];
      if (checkWin(nine)) {
        g.players[MY_IDX].hand = sortHand(nine, LEAGUES[0].groups);
        applyWinner(g, g.players[MY_IDX].name);
        gsRef.current = g;
        setGs(g);
        return;
      }
      g.phase = "discard";
      gsRef.current = g;
      setGs(g);
      setDrawnCard(card);
      drawnCardRef.current = card;
      setDrawnKey((k) => k + 1);
      setSelId(null);
      spawnEffect("draw", e?.currentTarget);
      if (stepIdxRef.current === 0) {
        setStepIdx(1);
        stepIdxRef.current = 1;
      }
    },
    [hideFinger]
  );

  const drawDiscard = useCallback(
    (pid) => {
      const g = JSON.parse(JSON.stringify(gsRef.current));
      if (!g || g.winner || g.cur !== MY_IDX || g.phase !== "draw") return;
      const p = g.players[pid];
      if (!p || (p.discardPile || []).length === 0) return;
      hideFinger();
      g._seq = (g._seq || 0) + 1;
      const card = p.discardPile.shift();
      const nine = [...g.players[MY_IDX].hand, card];
      if (checkWin(nine)) {
        g.players[MY_IDX].hand = sortHand(nine, LEAGUES[0].groups);
        applyWinner(g, g.players[MY_IDX].name);
        gsRef.current = g;
        setGs(g);
        return;
      }
      g.phase = "discard";
      gsRef.current = g;
      setGs(g);
      setDrawnCard(card);
      drawnCardRef.current = card;
      setDrawnKey((k) => k + 1);
      setSelId(null);
      if (stepIdxRef.current === 3) {
        setStepIdx(4);
        stepIdxRef.current = 4;
        const t = setTimeout(
          () =>
            pointAt("[data-tut-discard='true']") ||
            pointAt("[data-tut='hand-card']", 0),
          500
        );
        aiTimersRef.current.push(t);
      }
    },
    [hideFinger, pointAt]
  );

  const discardById = useCallback(
    (cardId, el) => {
      const g = gsRef.current;
      if (!g || g.winner || g.cur !== MY_IDX || g.phase !== "discard") return;
      const drawn = drawnCardRef.current;
      if (!drawn) return;
      hideFinger();
      if (stepIdxRef.current === 6) finishTaughtRef.current = true;
      spawnEffect("discard", el);
      setDiscardingId(cardId);
      const timer = setTimeout(() => {
        if (!aiActiveRef.current) return;
        setDiscardingId(null);
        const g2 = JSON.parse(JSON.stringify(gsRef.current));
        if (!g2 || g2.winner || g2.cur !== MY_IDX || g2.phase !== "discard")
          return;
        g2._seq = (g2._seq || 0) + 1;
        const me = g2.players[MY_IDX];
        if (cardId === drawn.id) {
          (me.discardPile = me.discardPile || []).unshift(drawn);
        } else {
          const nine = [...me.hand, drawn];
          const idx = nine.findIndex((c) => c.id === cardId);
          if (idx < 0) return;
          const disc = nine.splice(idx, 1)[0];
          (me.discardPile = me.discardPile || []).unshift(disc);
          me.hand = sortHand(nine, LEAGUES[0].groups);
          if (checkWin(me.hand)) {
            applyWinner(g2, me.name);
            gsRef.current = g2;
            setGs(g2);
            setDrawnCard(null);
            drawnCardRef.current = null;
            setSelId(null);
            return;
          }
          const newCount = (findSets(me.hand) || []).length;
          if (newCount > prevSetCount.current) {
            spawnEffect("set", el);
            if (stepIdxRef.current === 4 && newCount >= 2) {
              const t = setTimeout(() => {
                if (!aiActiveRef.current) return;
                const s = findSets(me.hand) || [];
                setRevealSets(s.slice(0, 2));
                setShowSetReveal(true);
                setStepIdx(5);
                stepIdxRef.current = 5;
              }, 400);
              aiTimersRef.current.push(t);
            }
          }
          prevSetCount.current = newCount;
        }
        setDrawnCard(null);
        drawnCardRef.current = null;
        setSelId(null);
        const next = (MY_IDX + 1) % 4;
        g2.phase = "draw";
        g2.cur = next;
        g2.turnStartedAt = Date.now();
        gsRef.current = g2;
        setGs(g2);
        if (stepIdxRef.current === 1) {
          setStepIdx(2);
          stepIdxRef.current = 2;
        }
        runAI(next);
      }, 220);
      aiTimersRef.current.push(timer);
    },
    [hideFinger, runAI]
  );

  const handleCardTap = useCallback(
    (cardId, el) => {
      const g = gsRef.current;
      if (!g || g.phase !== "discard" || g.cur !== MY_IDX) return;
      const now = Date.now(),
        last = lastTapRef.current;
      if (last.id === cardId && now - last.time < 450) {
        lastTapRef.current = { id: null, time: 0 };
        setSelId(cardId);
        discardById(cardId, el);
      } else {
        lastTapRef.current = { id: cardId, time: now };
        setSelId((p) => (p === cardId ? null : cardId));
      }
    },
    [discardById]
  );

  useEffect(() => {
    if (!gs?.winner) return;
    const t = setTimeout(() => {
      if (aiActiveRef.current) onComplete();
    }, 4000);
    aiTimersRef.current.push(t);
    return () => clearTimeout(t);
  }, [gs?.winner]);

  useEffect(() => {
    if (stepIdx >= 5) return;
    const map = {
      0: () => pointAt("[data-tut='deck']", 700),
      1: () =>
        pointAt("[data-tut-discard='true']") ||
        pointAt("[data-tut='hand-card']", 0),
      2: () => hideFinger(),
      3: () => {},
      4: () => {
        const t = setTimeout(
          () =>
            pointAt("[data-tut-discard='true']") ||
            pointAt("[data-tut='hand-card']", 0),
          500
        );
        aiTimersRef.current.push(t);
      },
    };
    map[stepIdx]?.();
  }, [stepIdx, pointAt, hideFinger]);

  if (imgLoading || !gs)
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          background: "linear-gradient(135deg,#1e3a5f,#0f2027)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "4px solid rgba(255,255,255,0.15)",
            borderTop: "4px solid #4ADE80",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
          튜토리얼 준비 중...
        </div>
        <button
          onClick={onSkip}
          style={{
            marginTop: 8,
            padding: "6px 18px",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(0,0,0,0.45)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          건너뛰기
        </button>
      </div>
    );

  const curStep = STEPS[Math.min(stepIdx, STEPS.length - 1)];
  const visibleSteps = STEPS.filter((s) => s.key !== "set_reveal");
  const visibleIdx = visibleSteps.findIndex((s) => s.key === curStep.key);

  // ✅ 스킵 시 모든 타이머 클리어 후 onSkip 호출
  const handleSkip = () => {
    aiActiveRef.current = false;
    aiTimersRef.current.forEach(clearTimeout);
    aiTimersRef.current = [];
    onSkip();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000 }}>
      <GameScreen
        gs={gs}
        myIdx={MY_IDX}
        roomCode={null}
        isHost={true}
        drawnCard={drawnCard}
        drawnKey={drawnKey}
        selId={selId}
        discardingId={discardingId}
        images={images}
        tImgs={tImgs}
        gameBg={null}
        muted={true}
        activeEmotes={{}}
        showEmotePicker={false}
        ownedEmotes={[]}
        emoteLoadout={[]}
        timeLeft={30}
        heartbeats={{}}
        aiThinking={null}
        showdownAnim={showdownAnim}
        showRules={false}
        showHandReveal={false}
        cardEffects={cardEffects}
        timerBarRef={timerBarRef}
        leagueConfig={LEAGUES[0]}
        isMobile={window.innerWidth < 600}
        winW={window.innerWidth}
        sc={1}
        onDrawDeck={drawDeck}
        onDrawDiscard={drawDiscard}
        onDiscardById={discardById}
        onUseShowdown={() => {}}
        onCardTap={handleCardTap}
        onUseEmote={() => {}}
        onToggleMute={() => {}}
        onRerollAI={() => {}}
        onSetShowRules={() => {}}
        onSetShowEmotePicker={() => {}}
        onSetShowHandReveal={() => {}}
        onSetShowExitConfirm={() => {}}
        onNextGame={null}
        onReset={handleSkip}
        setHighlight={true}
        onToggleHighlight={() => {}}
      />

      {showSetReveal && (
        <SetRevealOverlay
          sets={revealSets}
          images={images}
          onDone={() => {
            setShowSetReveal(false);
            injectWinCardRef.current = true;
            finishDrawCountRef.current = 0;
            finishTaughtRef.current = false;
            setStepIdx(6);
            stepIdxRef.current = 6;
          }}
        />
      )}

      {fingerPos && !showSetReveal && (
        <div
          style={{
            position: "fixed",
            left: fingerPos.x,
            top: fingerPos.y,
            zIndex: 3500,
            pointerEvents: "none",
            transform: "translate(-20%,-10%)",
            animation: "fingerBounce 0.8s ease-in-out infinite",
            fontSize: 38,
            filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.8))",
            transition: "left 0.25s ease,top 0.25s ease",
          }}
        >
          👆
        </div>
      )}

      {stepIdx !== 5 && curStep.key !== "set_reveal" && (
        <div
          style={{
            position: "fixed",
            top: 56,
            left: 0,
            right: 0,
            zIndex: 3000,
            padding: "0 12px",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.97)",
              borderRadius: 14,
              padding: "12px 16px",
              border: "2px solid #6366F1",
              boxShadow: "0 6px 24px rgba(0,0,0,0.45)",
              animation: "tutSlide 0.25s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 5,
                marginBottom: 8,
                alignItems: "center",
              }}
            >
              {visibleSteps.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === visibleIdx ? 16 : 5,
                    height: 5,
                    borderRadius: 99,
                    background: i <= visibleIdx ? "#6366F1" : "#E5E7EB",
                    transition: "all 0.3s",
                  }}
                />
              ))}
              <span style={{ fontSize: 10, color: "#9CA3AF", marginLeft: 4 }}>
                {Math.max(1, visibleIdx + 1)}/{visibleSteps.length}
              </span>
            </div>
            <div style={{ fontWeight: 900, fontSize: 15, color: "#1e3a5f" }}>
              {curStep.title}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#4B5563",
                marginTop: 3,
                lineHeight: 1.6,
                whiteSpace: "pre-line",
              }}
            >
              {curStep.desc}
            </div>
          </div>
        </div>
      )}

      <div style={{ position: "fixed", top: 8, right: 12, zIndex: 3001 }}>
        <button
          onClick={handleSkip}
          style={{
            padding: "5px 14px",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(0,0,0,0.45)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          건너뛰기
        </button>
      </div>

      <style>{`
        @keyframes tutSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fingerBounce{0%,100%{transform:translate(-20%,-10%) scale(1)}50%{transform:translate(-20%,-30%) scale(1.15)}}
      `}</style>
    </div>
  );
}
