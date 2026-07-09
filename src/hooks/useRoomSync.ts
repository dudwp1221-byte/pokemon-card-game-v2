// src/hooks/useRoomSync.ts
// ══════════════════════════════════════════════════════════
//  🏠 Firebase 방 실시간 동기화 훅
//
//  담당:
//   - rooms/{code} onValue 구독 (게임 상태, 이모트, nextReady)
//   - heartbeat 전송 (5초마다)
//   - 호스트 takeover (호스트 끊기면 다음 사람이 승계)
//   - beforeunload 핸들러 (방 정리)
//   - 이전 방 재접속 (새로고침 대응)
//   - room_wait → game 전환
// ══════════════════════════════════════════════════════════
import { useEffect } from 'react';
import { db, downloadRoomAssets } from '../lib/db';
import { normalizeGs } from '../lib/gameLogic';
import { SHOP_ITEMS } from '../lib/constants';

interface UseRoomSyncParams {
  screen: string;
  roomCode: string;
  roomData: any;
  myIdx: number;
  myName: string;
  loggedIn: boolean;
  isHost: boolean;

  // refs
  myNameRef: React.MutableRefObject<string>;
  myIdxRef: React.MutableRefObject<number>;
  roomCodeRef: React.MutableRefObject<string>;
  gsRef: React.MutableRefObject<any>;
  autoStartAtRef: React.MutableRefObject<number | null>;
  drawnCardRef: React.MutableRefObject<any>;
  lgRef: React.MutableRefObject<any>;
  battleFrontierRuleRef: React.MutableRefObject<string | null>;
  isBattleFrontierGameRef: React.MutableRefObject<boolean>;
  kantoImgsRef: React.MutableRefObject<any>;
  heartbeatIntervalRef: React.MutableRefObject<any>;
  beforeUnloadHandlerRef: React.MutableRefObject<any>;
  processedEmoteTs: React.MutableRefObject<any>;
  nextGameStartingRef: React.MutableRefObject<boolean>;
  handledSeqRef: React.MutableRefObject<number>;
  aiProcessingSeqRef: React.MutableRefObject<number>;
  lastKnownSeqRef: React.MutableRefObject<number>;
  transitioningFromWaitRef: React.MutableRefObject<boolean>;
  nextReadyTimeoutRef: React.MutableRefObject<any>;
  aiRef: React.MutableRefObject<any>;
  hostTakeoverDoneRef: React.MutableRefObject<string>;
  justTookOverAsHostRef: React.MutableRefObject<boolean>;
  justReconnectedRef: React.MutableRefObject<boolean>;
  waitingForNextRef: React.MutableRefObject<boolean>;
  hostForceStartRef: React.MutableRefObject<any>;

  // setters
  setRoomData: (v: any) => void;
  setHeartbeats: (v: any) => void;
  setNextReadyMap: (v: any) => void;
  setGs: (v: any) => void;
  setActiveEmotes: (v: any) => void;
  setScreen: (v: string) => void;
  setDrawnCard: (v: any) => void;
  setSelId: (v: any) => void;
  setDiscardingId: (v: any) => void;
  setRoomCode: (v: string) => void;
  setMyIdx: (v: number) => void;
  setWaitingForNext: (v: boolean) => void;
  setAiThinking: (v: any) => void;
  setShowdownAnim: (v: any) => void;
  setAutoStartAt: (v: number | null) => void;
  setPendingPlayers: (v: any) => void;
  setRoulettePreset: (v: any) => void;
  setLoading: (v: boolean) => void;
  setShowWildReveal: (v: boolean) => void;
  setBattleFrontierRule: (v: string | null) => void;
  setImages: (v: any) => void;
  setTImgs: (v: any) => void;
  setCustomTrainers: (v: any) => void;

  // callback
  startNextGame: (
    g: any,
    seq: number,
    humans: string[],
    bet: number,
    leagueId: string
  ) => void;
}

export function useRoomSync({
  screen,
  roomCode,
  roomData,
  myIdx,
  myName,
  loggedIn,
  isHost,
  myNameRef,
  myIdxRef,
  roomCodeRef,
  gsRef,
  autoStartAtRef,
  drawnCardRef,
  lgRef,
  battleFrontierRuleRef,
  isBattleFrontierGameRef,
  kantoImgsRef,
  heartbeatIntervalRef,
  beforeUnloadHandlerRef,
  processedEmoteTs,
  nextGameStartingRef,
  handledSeqRef,
  aiProcessingSeqRef,
  lastKnownSeqRef,
  transitioningFromWaitRef,
  nextReadyTimeoutRef,
  aiRef,
  hostTakeoverDoneRef,
  justTookOverAsHostRef,
  justReconnectedRef,
  waitingForNextRef,
  hostForceStartRef,
  setRoomData,
  setHeartbeats,
  setNextReadyMap,
  setGs,
  setActiveEmotes,
  setScreen,
  setDrawnCard,
  setSelId,
  setDiscardingId,
  setRoomCode,
  setMyIdx,
  setWaitingForNext,
  setAiThinking,
  setShowdownAnim,
  setAutoStartAt,
  setPendingPlayers,
  setRoulettePreset,
  setLoading,
  setShowWildReveal,
  setBattleFrontierRule,
  setImages,
  setTImgs,
  setCustomTrainers,
  startNextGame,
}: UseRoomSyncParams) {
  const unsubRef = { current: null as any };

  // ── 1. heartbeat 전송 (5초마다) ────────────────
  useEffect(() => {
    if (!roomCode || !['game', 'room_wait'].includes(screen)) {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      return;
    }
    const sendHb = () => {
      if (!roomCodeRef.current || !myNameRef.current) return;
      db.update('rooms/' + roomCodeRef.current + '/hb', {
        [myIdxRef.current]: Date.now(),
      }).catch(() => {});
    };
    sendHb();
    heartbeatIntervalRef.current = setInterval(sendHb, 5000);
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [roomCode, screen, myIdx]);

  // ── 2. 방 구독 (onValue) ─────────────────────────
  useEffect(() => {
    const needs =
      screen === 'room_wait' ||
      (screen === 'game' && roomCode) ||
      (screen === 'roulette' && roomCode && !isHost);
    if (!needs || !roomCode) return;
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    unsubRef.current = db.onValue(
      'rooms/' + roomCode,
      (rd: any) => {
        // 방이 삭제된 경우 로비로
        if (!rd) {
          if (screen === 'game' || screen === 'room_wait') {
            if (Object.keys(kantoImgsRef.current).length > 0) {
              setImages(kantoImgsRef.current);
              (window as any).__hotpotImages = kantoImgsRef.current;
            }
            setScreen('lobby');
            setGs(null);
            setDrawnCard(null);
            setSelId(null);
            setDiscardingId(null);
            setRoomCode('');
            setRoomData(null);
            setMyIdx(0);
            setWaitingForNext(false);
            waitingForNextRef.current = false;
            nextGameStartingRef.current = false;
            handledSeqRef.current = -1;
            aiProcessingSeqRef.current = -1;
            transitioningFromWaitRef.current = false;
            clearTimeout(aiRef.current);
            setAiThinking(null);
            setShowdownAnim(null);
            setAutoStartAt(null);
            processedEmoteTs.current = {};
            localStorage.removeItem('pks_room_code');
            localStorage.removeItem('pks_room_idx');
          }
          return;
        }

        setRoomData(rd);
        if (rd.hb) setHeartbeats(rd.hb);
        setNextReadyMap(rd.nextReady || {});

        // ── host takeover 로직 ──
        if (screen === 'game' && rd.hb && rd.gs) {
          const hostName = rd.host;
          const hostPlayerIdx = (rd.gs.players || []).findIndex(
            (p: any) => p.name === hostName
          );
          if (
            hostPlayerIdx !== -1 &&
            !rd.gs.players[hostPlayerIdx]?.isAI &&
            rd.hb[hostPlayerIdx] !== undefined &&
            Date.now() - rd.hb[hostPlayerIdx] > 15000 &&
            myNameRef.current !== hostName
          ) {
            const aliveHumans = (rd.humans || [])
              .filter((h: any) => h.name !== hostName)
              .map((h: any) => ({
                name: h.name,
                idx: (rd.gs.players || []).findIndex(
                  (p: any) => p.name === h.name
                ),
              }))
              .filter(
                ({ idx }: any) =>
                  idx !== -1 &&
                  rd.hb[idx] !== undefined &&
                  Date.now() - rd.hb[idx] < 15000
              )
              .sort((a: any, b: any) => a.idx - b.idx);
            const newHost = aliveHumans[0];
            if (newHost && newHost.name === myNameRef.current) {
              const takeoverKey = hostName + '_' + (rd.gs._seq || 0);
              if (hostTakeoverDoneRef.current !== takeoverKey) {
                hostTakeoverDoneRef.current = takeoverKey;
                db.update('rooms/' + roomCode, { host: newHost.name })
                  .then(() => {
                    nextGameStartingRef.current = false;
                    handledSeqRef.current = (gsRef.current?._seq ?? 0) - 1;
                    aiProcessingSeqRef.current = -1;
                    justTookOverAsHostRef.current = true;
                    setTimeout(() => {
                      justTookOverAsHostRef.current = false;
                    }, 1000);
                  })
                  .catch(() => {
                    hostTakeoverDoneRef.current = '';
                  });
              }
            }
          }
        }

        // ── 이모트 표시 ──
        if (rd.emotes) {
          Object.entries(rd.emotes).forEach(([idx, data]: any) => {
            if (!data) return;
            const i = parseInt(idx);
            if (i === myIdxRef.current) return;
            if (processedEmoteTs.current[i] === data.ts) return;
            processedEmoteTs.current[i] = data.ts;
            const display =
              data.img ||
              SHOP_ITEMS.find((s: any) => s.id === data.e)?.emoji ||
              '😊';
            setActiveEmotes((p: any) => ({ ...p, [i]: display }));
            setTimeout(
              () =>
                setActiveEmotes((p: any) => {
                  const n = { ...p };
                  delete n[i];
                  return n;
                }),
              3000
            );
          });
        }

        // ── room_wait → roulette/game 전환 ──
        if (
          screen === 'room_wait' &&
          !transitioningFromWaitRef.current &&
          (rd.status === 'roulette' || rd.status === 'playing') &&
          rd.gs
        ) {
          transitioningFromWaitRef.current = true;
          setGs(rd.gs);
          setPendingPlayers(rd.gs.players);
          setRoulettePreset(rd.rouletteWinner ?? rd.gs.cur);
          setDrawnCard(null);
          setSelId(null);
          setLoading(true);
          if (rd.gs.wildRule) {
            battleFrontierRuleRef.current = rd.gs.wildRule;
            setBattleFrontierRule(rd.gs.wildRule);
            isBattleFrontierGameRef.current = true;
            setTimeout(() => {
              setLoading(false);
              setShowWildReveal(true);
            }, 1300);
          } else {
            isBattleFrontierGameRef.current = false;
            battleFrontierRuleRef.current = null;
            setTimeout(() => {
              setLoading(false);
              setScreen('roulette');
            }, 1300);
          }
        }

        // ── game 중 gs 변동 동기화 ──
        if (screen === 'game' && rd.gs) {
          const local = gsRef.current;
          const inSeq = rd.gs._seq || 0;
          const curSeq = local?._seq || 0;
          if (inSeq > curSeq) {
            const prevSD = local?.showdownUsed || {};
            const newSD = rd.gs.showdownUsed || {};
            Object.entries(newSD).forEach(([name, used]: any) => {
              if (used && !prevSD[name]) {
                setShowdownAnim({
                  name: name.replace(' (AI)', ''),
                  key: Date.now(),
                });
                setTimeout(() => setShowdownAnim(null), 2000);
              }
            });
            setGs(normalizeGs(rd.gs));
            if (inSeq > lastKnownSeqRef.current + 1)
              aiProcessingSeqRef.current = -1;
            lastKnownSeqRef.current = inSeq;
            const isMyDiscardPhase =
              rd.gs.cur === myIdxRef.current &&
              rd.gs.phase === 'discard' &&
              drawnCardRef.current != null;
            if (!isMyDiscardPhase && rd.gs.cur !== myIdxRef.current) {
              setDrawnCard(null);
              setSelId(null);
            }
          }
        }

        // ── autoStartAt 동기화 ──
        if (
          rd.autoStartAt !== undefined &&
          rd.autoStartAt !== autoStartAtRef.current
        )
          setAutoStartAt(rd.autoStartAt ?? null);

        // ── 호스트: 다음 게임 시작 처리 ──
        const iAmHost = rd.host === myNameRef.current;
        if (
          rd.nextReady &&
          rd.gs?.winner &&
          iAmHost &&
          !nextGameStartingRef.current
        ) {
          const currentSeq = rd.gs._seq || 0;
          if (handledSeqRef.current >= currentSeq) return;
          const humanPl = (rd.gs.players || []).filter((p: any) => !p.isAI);
          const currentHumans =
            rd.humans && rd.humans.length > 0
              ? (rd.humans as any[]).map((h: any) => h.name)
              : humanPl.map((p: any) => p.name);
          if (currentHumans.length === 0) {
            db.remove('rooms/' + roomCode).catch(() => {});
            return;
          }
          const activePlayers = humanPl.filter((p: any) =>
            currentHumans.includes(p.name)
          );
          const allReady =
            activePlayers.length > 0 &&
            activePlayers.every((p: any) => {
              const sk = p.name.replace(/[.#$[\]/]/g, '_');
              return !!rd.nextReady[sk];
            });
          if (!allReady) {
            if (!nextReadyTimeoutRef.current) {
              const startAt = Date.now();
              db.update('rooms/' + roomCode, { autoStartAt: startAt }).catch(
                () => {}
              );
              setAutoStartAt(startAt);
              nextReadyTimeoutRef.current = setTimeout(() => {
                nextReadyTimeoutRef.current = null;
                db.update('rooms/' + roomCode, { autoStartAt: null }).catch(
                  () => {}
                );
                setAutoStartAt(null);
                if (!nextGameStartingRef.current && gsRef.current?.winner)
                  hostForceStartRef.current?.();
              }, 15000);
            }
            return;
          }
          if (nextReadyTimeoutRef.current) {
            clearTimeout(nextReadyTimeoutRef.current);
            nextReadyTimeoutRef.current = null;
            db.update('rooms/' + roomCode, { autoStartAt: null }).catch(
              () => {}
            );
            setAutoStartAt(null);
          }
          startNextGame(
            rd.gs,
            currentSeq,
            currentHumans,
            rd.gs.bet || lgRef.current.bet,
            rd.gs.leagueId || lgRef.current.id
          );
        }
      },
      800
    );
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [screen, roomCode, isHost, myIdx]);

  // ── 3. localStorage 로 현재 방 코드 기억 ─────────
  useEffect(() => {
    if (roomCode && screen === 'game') {
      localStorage.setItem('pks_room_code', roomCode);
      localStorage.setItem('pks_room_idx', String(myIdx));
    } else if (!roomCode) {
      localStorage.removeItem('pks_room_code');
      localStorage.removeItem('pks_room_idx');
    }
  }, [roomCode, screen, myIdx]);

  // ── 4. 새로고침 시 이전 방 재접속 ────────────────
  useEffect(() => {
    if (!loggedIn || !myName) return;
    const savedCode = localStorage.getItem('pks_room_code');
    if (!savedCode) return;
    db.get('rooms/' + savedCode)
      .then((rd: any) => {
        if (!rd || rd.status !== 'playing' || !rd.gs) {
          localStorage.removeItem('pks_room_code');
          localStorage.removeItem('pks_room_idx');
          return;
        }
        const idx = (rd.humans || []).findIndex((h: any) => h.name === myName);
        if (idx === -1) {
          localStorage.removeItem('pks_room_code');
          localStorage.removeItem('pks_room_idx');
          return;
        }
        setRoomCode(savedCode);
        setRoomData(rd);
        setMyIdx(idx);
        handledSeqRef.current = rd.gs._seq ?? -1;
        aiProcessingSeqRef.current = rd.gs._seq ?? -1;
        justReconnectedRef.current = true;
        setTimeout(() => {
          justReconnectedRef.current = false;
        }, 2000);
        setGs(normalizeGs(rd.gs));
        setScreen('game');
      })
      .catch(() => {
        localStorage.removeItem('pks_room_code');
        localStorage.removeItem('pks_room_idx');
      });
  }, [loggedIn, myName]);

  // ── 5. beforeunload 핸들러 ──────────────────────
  useEffect(() => {
    if (!roomCode || screen !== 'game') {
      if (beforeUnloadHandlerRef.current) {
        window.removeEventListener(
          'beforeunload',
          beforeUnloadHandlerRef.current
        );
        beforeUnloadHandlerRef.current = null;
      }
      return;
    }
    if (beforeUnloadHandlerRef.current)
      window.removeEventListener(
        'beforeunload',
        beforeUnloadHandlerRef.current
      );
    const h = () => {
      const isHostNow = myIdxRef.current === 0;
      const hasWinner = !!gsRef.current?.winner;
      const code = roomCodeRef.current;
      if (isHostNow && !hasWinner) {
        fetch(
          `https://yeongje-pocketchallenge-default-rtdb.firebaseio.com/rooms/${code}.json`,
          { method: 'DELETE', keepalive: true }
        ).catch(() => {});
      } else {
        fetch(
          `https://yeongje-pocketchallenge-default-rtdb.firebaseio.com/rooms/${code}/hb/${myIdxRef.current}.json`,
          { method: 'DELETE', keepalive: true }
        ).catch(() => {});
      }
    };
    beforeUnloadHandlerRef.current = h;
    window.addEventListener('beforeunload', h);
    return () => {
      window.removeEventListener('beforeunload', h);
      beforeUnloadHandlerRef.current = null;
    };
  }, [roomCode, screen, myIdx]);

  // ── 6. 방 에셋 다운로드 (방에서 쓰는 이미지들) ──
  useEffect(() => {
    if (screen !== 'game' || !roomCode) return;
    const triesRef = { current: 0 };
    const tryLoad = async () => {
      const { cards, trainers, customs }: any = await downloadRoomAssets(
        roomCode
      );
      let got = false;
      if (cards && Object.keys(cards).length > 0) {
        setImages(cards);
        (window as any).__hotpotImages = cards;
        got = true;
      }
      if (trainers && Object.keys(trainers).length > 0) {
        setTImgs(trainers);
        (window as any).__trainerImages = trainers;
        got = true;
      }
      if (customs?.length > 0) {
        setCustomTrainers(customs);
        (window as any).__customTrainers = customs;
      }
      if (!got && triesRef.current < 5) {
        triesRef.current += 1;
        setTimeout(tryLoad, 2000);
      }
    };
    tryLoad();
  }, [screen, roomCode, isHost]);

  // ── 7. 프로필 갱신 시 방에 동기화 ────────────────
  // (기존 App.tsx 에 있던 useEffect — 프로필 변경 시 humans 에 반영)
  // 이 부분은 App.tsx 에 남겨두는 게 깔끔해서 여기서는 분리 안 함
}
