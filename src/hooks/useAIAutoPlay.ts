// src/hooks/useAIAutoPlay.ts
// ══════════════════════════════════════════════════════════
//  🤖 AI 자동 플레이 + 턴 타이머 훅
//
//  담당:
//   - AI 플레이어 턴 처리 (덱 뽑기, 버리기, 쇼다운 판단)
//   - 턴 타이머 표시 (timerBar width 갱신)
//   - 시간 초과 / 연결 끊김 → autoPlay
// ══════════════════════════════════════════════════════════
import { useEffect } from "react";
import {
  checkWin,
  sortHand,
  aiDiscard,
  aiDiscardTeam,
  aiFindBestDiscardPile,
  reshuffleDeck,
  applyWinner,
  getTeammateIdx,
  canFormSets,
  getAiSdRate,
} from "../lib/gameLogic";
import { SE } from "../lib/sounds";
import { LEAGUES, SD_DEFAULT } from "../lib/constants";

interface UseAIAutoPlayParams {
  gs: any;
  screen: string;
  roomCode: string;
  roomData: any;
  isHost: boolean;

  gsRef: React.MutableRefObject<any>;
  myIdxRef: React.MutableRefObject<number>;
  myNameRef: React.MutableRefObject<string>;
  roomCodeRef: React.MutableRefObject<string>;
  heartbeatsRef: React.MutableRefObject<any>;
  drawnCardRef: React.MutableRefObject<any>;
  aiRef: React.MutableRefObject<any>;
  aiProcessingSeqRef: React.MutableRefObject<number>;
  autoPlayRef: React.MutableRefObject<boolean>;
  timerBarRef: React.MutableRefObject<any>;
  timerRafRef: React.MutableRefObject<any>;
  playerDeckDrawsRef: React.MutableRefObject<number>;

  setGs: (v: any) => void;
  setAiThinking: (v: any) => void;
  setShowdownAnim: (v: any) => void;
  setTimeLeft: (v: number) => void;
  setDrawnCard: (v: any) => void;
  setSelId: (v: any) => void;

  pushGs: (g: any) => Promise<void>;
  autoPlayTurn: (ti: number) => void;
}

export function useAIAutoPlay({
  gs,
  screen,
  roomCode,
  roomData,
  isHost,
  gsRef,
  myIdxRef,
  myNameRef,
  roomCodeRef,
  heartbeatsRef,
  drawnCardRef,
  aiRef,
  aiProcessingSeqRef,
  autoPlayRef,
  timerBarRef,
  timerRafRef,
  playerDeckDrawsRef,
  setGs,
  setAiThinking,
  setShowdownAnim,
  setTimeLeft,
  setDrawnCard,
  setSelId,
  pushGs,
  autoPlayTurn,
}: UseAIAutoPlayParams) {
  // ── 1. 타이머 바 애니메이션 ──────────────────────
  useEffect(() => {
    if (!gs || gs.winner || screen !== "game") return;
    const LIMIT = gs.wildRule === "speed" ? 15 : 30;
    const tick = () => {
      const cur = gsRef.current;
      if (!cur || cur.winner) return;
      const elapsed = cur.turnStartedAt
        ? (Date.now() - cur.turnStartedAt) / 1000
        : 0;
      const left = Math.max(0, LIMIT - elapsed);
      if (timerBarRef.current) {
        timerBarRef.current.style.width = (left / LIMIT) * 100 + "%";
        timerBarRef.current.style.background =
          left <= 10 ? "#EF4444" : left <= 20 ? "#F59E0B" : "#4ADE80";
      }
      timerRafRef.current = requestAnimationFrame(tick);
    };
    timerRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current);
    };
  }, [gs?.cur, gs?.turnStartedAt, gs?.winner, screen]);

  // ── 2. 타이머 카운트다운 + autoPlay 트리거 ──────
  useEffect(() => {
    if (!gs || gs.winner || screen !== "game") return;
    autoPlayRef.current = false;
    const LIMIT = gs.wildRule === "speed" ? 15 : 30;
    const id = setInterval(() => {
      const cur = gsRef.current;
      if (!cur || cur.winner) return;
      const elapsed = cur.turnStartedAt
        ? (Date.now() - cur.turnStartedAt) / 1000
        : 0;
      const left = Math.max(0, Math.ceil(LIMIT - elapsed));
      setTimeLeft(left);
      const ci = cur.cur;
      const cp = cur.players[ci];
      const hb = heartbeatsRef.current;
      const dc =
        roomCodeRef.current &&
        !cp?.isAI &&
        cp?.id !== myIdxRef.current &&
        hb[cp?.id] &&
        Date.now() - hb[cp?.id] > 12000;
      const amHost =
        myIdxRef.current === 0 ||
        !!(roomData?.host && roomData.host === myNameRef.current);
      if ((left <= 0 || dc) && !autoPlayRef.current) {
        if (ci === myIdxRef.current || (amHost && roomCodeRef.current)) {
          autoPlayRef.current = true;
          autoPlayTurn(ci);
        }
      }
    }, 500);
    setTimeLeft(LIMIT);
    return () => clearInterval(id);
  }, [gs?.cur, gs?.turnStartedAt, gs?.winner, screen]);

  // ── 3. AI 턴 처리 ──────────────────────────────
  useEffect(() => {
    if (!gs || gs.winner || screen !== "game") return;
    const iAmHost =
      !roomCodeRef.current ||
      myIdxRef.current === 0 ||
      !!(roomData?.host && roomData.host === myNameRef.current);
    if (!iAmHost) return;
    const cur = gs.players[gs.cur];
    if (!cur?.isAI) return;
    const currentSeq = gs._seq || 0;
    if (aiProcessingSeqRef.current === currentSeq) return;
    aiProcessingSeqRef.current = currentSeq;
    const spd = cur.aiSpeed || 1.0;
    const thinkMs = (1400 + Math.random() * 1800) * spd;
    const decideMs = (600 + Math.random() * 800) * spd;
    setAiThinking(gs.cur);
    const t1 = setTimeout(() => {
      const t2 = setTimeout(() => {
        setAiThinking(null);
        SE.aiPlay();
        setGs((prev: any) => {
          if (!prev || prev.winner) return prev;
          if ((prev._seq || 0) !== currentSeq) return prev;
          const g = JSON.parse(JSON.stringify(prev));
          g._seq = (g._seq || 0) + 1;
          const ai = g.players[g.cur];
          if (!ai?.isAI) return prev;
          const groups = (
            LEAGUES.find((l: any) => l.id === (g.leagueId || "kanto")) ||
            LEAGUES[0]
          ).groups;
          const sd = g.sdAmount || SD_DEFAULT;
          const leagueId = g.leagueId || "kanto";
          const bestPile = aiFindBestDiscardPile(
            g.players,
            g.cur,
            ai.hand,
            leagueId,
            g.wildRule
          );
          let card: any;
          if (bestPile) {
            card = g.players[(bestPile as any).playerIdx].discardPile.shift();
          } else {
            if (g.deck.length <= 1) reshuffleDeck(g);
            if (!g.deck.length) return prev;
            card = g.deck.shift();
          }
          const nine = [...ai.hand, card];
          if (checkWin(nine, g.wildRule)) {
            ai.hand = sortHand(nine, groups);
            applyWinner(g, ai.name);
            if (roomCodeRef.current) pushGs(g);
            return g;
          }
          const aiTeammateIdx = g.teamMode
            ? getTeammateIdx(g.cur, g.teams)
            : null;
          const aiTmHand =
            aiTeammateIdx !== null ? g.players[aiTeammateIdx]?.hand : null;
          const sdRate = getAiSdRate(leagueId);
          // 4세트 룰이면 3세트 이상, 기본은 2세트 이상
          const sdThreshold = g.wildRule === "4set" ? 3 : 2;
          if (g.teamMode && aiTeammateIdx !== null) {
            const tmName = g.players[aiTeammateIdx]?.name;
            const tmDeclared = tmName && g.showdownUsed[tmName];
            if (
              !g.showdownUsed[ai.name] &&
              (g.coins[ai.name] || 0) >= sd &&
              canFormSets(nine, sdThreshold) &&
              Math.random() < (tmDeclared ? sdRate + 0.15 : sdRate)
            ) {
              g.coins[ai.name] -= sd;
              g.showdownUsed[ai.name] = true;
              setShowdownAnim({
                name: ai.name.replace(" (AI)", ""),
                key: Date.now(),
              });
              setTimeout(() => setShowdownAnim(null), 2000);
            }
          } else if (
            !g.teamMode &&
            !g.showdownUsed[ai.name] &&
            (g.coins[ai.name] || 0) >= sd &&
            canFormSets(nine, sdThreshold) &&
            Math.random() < sdRate
          ) {
            g.coins[ai.name] -= sd;
            g.showdownUsed[ai.name] = true;
            setShowdownAnim({
              name: ai.name.replace(" (AI)", ""),
              key: Date.now(),
            });
            setTimeout(() => setShowdownAnim(null), 2000);
          }
          const di = g.teamMode
            ? aiDiscardTeam(nine, aiTmHand, leagueId)
            : aiDiscard(nine, leagueId);
          const disc = nine.splice(di, 1)[0];
          ai.hand = sortHand(nine, groups);
          (ai.discardPile = ai.discardPile || []).unshift(disc);
          // 4세트 룰: 버린 후 12장이 4세트 완성이면 승리
          if (checkWin(ai.hand, g.wildRule)) {
            applyWinner(g, ai.name);
            if (roomCodeRef.current) pushGs(g);
            return g;
          }
          g.phase = "draw";
          g.cur = (g.cur + 1) % g.players.length;
          g.turnStartedAt = Date.now();
          if (roomCodeRef.current) pushGs(g);
          return g;
        });
      }, decideMs);
      aiRef.current = t2;
    }, thinkMs);
    aiRef.current = t1;
    return () => {
      clearTimeout(aiRef.current);
      setAiThinking(null);
    };
  }, [gs, roomCode, isHost, pushGs, screen]);
}
