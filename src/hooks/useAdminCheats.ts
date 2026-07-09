// src/hooks/useAdminCheats.ts
// ══════════════════════════════════════════════════════════
//  🎮 어드민 키보드 치트 훅
//
//  단축키 모음 (admin 닉네임일 때만 동작):
//   - Ctrl+Shift+/        → 프로필 전체 해금
//   - Ctrl+Shift+NumLock  → 씰 전체 해금
//   - Ctrl+Shift+*        → +10,000 코인
//   - Ctrl+Shift+S        → 어드민 패널 토글
//   - Ctrl+Shift+Backspace → 씰 전체 초기화
//   - Ctrl+Shift+-        → 즉시 게임 승리
// ══════════════════════════════════════════════════════════
import { useEffect } from 'react';
import { ALL_SEALS, saveSealDex } from '../lib/sealLogic';
import { SHINY_SEALS, loadShinyDex, saveShinyDex } from '../lib/shinySeals';
import { loadCapDex, saveCapDex, ALL_EVENT_SEALS } from '../lib/eventLogic';
import { saveUserData, saveLeaderboard, db } from '../lib/db';
import { sendLetter, LETTER_TYPE } from '../lib/mailboxLogic';
import { getPlayerUid } from '../lib/db';
import { applyWinner } from '../lib/gameLogic';

interface UseAdminCheatsParams {
  myName: string;
  myCoins: number;
  myProfile: any;
  gsRef: React.MutableRefObject<any>;
  myIdxRef: React.MutableRefObject<number>;
  roomCodeRef: React.MutableRefObject<string>;
  myWinsRef: React.MutableRefObject<any>;
  myStatsRef: React.MutableRefObject<any>;
  setMyWins: (v: any) => void;
  setMyStats: (v: any) => void;
  setMyProfile: (v: any) => void;
  setMyCoins: (v: number) => void;
  setGs: (v: any) => void;
  setShowAdminPanel: (v: boolean | ((p: boolean) => boolean)) => void;
  setPendingShinySeals: (v: any[]) => void;
  setRevealSeals: (v: any[]) => void;
  setMailboxUnread: (v: number | ((p: number) => number)) => void;
  setAndSaveCoins: (v: number) => void;
  showToast: (msg: string, color: string) => void;
  profilePatch: () => any;
}

const isAdmin = (name: string) => (name || '').toLowerCase() === 'admin';

export function useAdminCheats({
  myName,
  myCoins,
  myProfile,
  gsRef,
  myIdxRef,
  roomCodeRef,
  myWinsRef,
  myStatsRef,
  setMyWins,
  setMyStats,
  setMyProfile,
  setMyCoins,
  setGs,
  setShowAdminPanel,
  setPendingShinySeals,
  setRevealSeals,
  setMailboxUnread,
  setAndSaveCoins,
  showToast,
  profilePatch,
}: UseAdminCheatsParams) {
  // ── Ctrl+Shift+/ → 프로필 전체 해금 ─────────────
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.shiftKey || e.key !== '/') return;
      if (!isAdmin(myName)) return;
      const maxWins = {
        solo: 999,
        multi: 999,
        total: 999,
        kantoSolo: 999,
        johtoSolo: 999,
        hoennSolo: 999,
      };
      const maxStats = {
        doubleWin: 999,
        streak: 999,
        maxStreak: 999,
        perfectWin: 999,
        multiKill: 999,
        broke: 999,
      };
      setMyWins(maxWins);
      setMyStats(maxStats);
      myWinsRef.current = maxWins;
      myStatsRef.current = maxStats;
      setMyProfile((p: any) => ({ ...p, wins: maxWins, stats: maxStats }));
      const nick = localStorage.getItem('pks_nickname');
      if (nick) saveUserData(nick, { wins: maxWins, stats: maxStats });
      showToast('✅ ADMIN CHEAT — 프로필 전체 해금', '#14532d');
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [myName]);

  // ── Ctrl+Shift+NumLock → 씰 전체 해금 ───────────
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.shiftKey || e.code !== 'NumLock') return;
      if (!isAdmin(myName)) return;
      const sealCount = ALL_SEALS?.length ?? 0;
      if (sealCount === 0) return;

      // 띠부씰
      const existing = JSON.parse(
        localStorage.getItem('pokeset_sealdex') || '{}'
      );
      const newDex = { ...existing };
      ALL_SEALS.forEach((seal: any) => {
        const k = String(seal.id);
        if (!(newDex[k]?.count > 0)) newDex[k] = { count: 1, shards: 0 };
      });
      saveSealDex(newDex);
      window.dispatchEvent(new Event('pokeset_dex_updated'));

      // 이로치씰
      const shinyDex = loadShinyDex();
      SHINY_SEALS.forEach((seal: any) => {
        if (!(shinyDex[seal.id]?.count > 0))
          shinyDex[seal.id] = { count: 1, acquiredAt: Date.now() };
      });
      saveShinyDex(shinyDex);
      const nick3 = localStorage.getItem('pks_nickname');
      if (nick3) saveUserData(nick3, { shinyDex }).catch(() => {});

      // 모자씰 + 코스프레씰
      const capDexAll = loadCapDex();
      ALL_EVENT_SEALS.forEach((seal: any) => {
        if (!(capDexAll[seal.id]?.count > 0))
          capDexAll[seal.id] = { count: 1, acquiredAt: Date.now() };
      });
      saveCapDex(capDexAll);
      window.dispatchEvent(new Event('pokeset_cap_dex_updated'));

      const nick = localStorage.getItem('pks_nickname');
      if (nick) {
        saveUserData(nick, { sealDex: newDex }).catch(() => {});
        saveLeaderboard(nick, myCoins, newDex);
      }
      showToast(
        `✅ ADMIN CHEAT — 띠부씰 ${sealCount}개 + 이로치씰 151마리 + 이벤트씰 ${ALL_EVENT_SEALS.length}종 해금`,
        '#14532d'
      );
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [myName, myCoins]);

  // ── Ctrl+Shift+* → 코인 10000 충전 ──────────────
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.shiftKey) return;
      if (e.key !== '*' && e.code !== 'NumpadMultiply') return;
      if (!isAdmin(myName)) return;
      setAndSaveCoins(myCoins + 10000);
      showToast('✅ ADMIN CHEAT — +10,000코인', '#14532d');
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [myName, myCoins]);

  // ── Ctrl+Shift+S → 어드민 패널 토글 ─────────────
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.shiftKey || e.key !== 'S') return;
      if (!isAdmin(myName)) return;
      e.preventDefault();
      setShowAdminPanel((p: boolean) => !p);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [myName]);

  // ── Ctrl+Shift+Backspace → 씰 전체 초기화 ───────
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.shiftKey) return;
      if (e.key !== 'Backspace' && e.code !== 'Backspace') return;
      if (!isAdmin(myName)) return;

      saveSealDex({});
      window.dispatchEvent(new Event('pokeset_dex_updated'));
      localStorage.removeItem('pokeset_shiny_dex');
      window.dispatchEvent(new Event('pokeset_shiny_dex_updated'));
      localStorage.removeItem('pokeset_cap_dex');
      window.dispatchEvent(new Event('pokeset_cap_dex_updated'));
      localStorage.removeItem('pokeset_pending_shinies');
      setPendingShinySeals([]);
      setRevealSeals([]);

      const nick = localStorage.getItem('pks_nickname');
      if (nick) {
        saveUserData(nick, { sealDex: {}, shinyDex: {} }).catch(() => {});
        saveLeaderboard(nick, myCoins, {}, profilePatch());
      }
      showToast(
        '✅ ADMIN CHEAT — 띠부씰 + 이로치씰 + 모자씰 전체 초기화',
        '#dc2626'
      );
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [myName, myCoins]);

  // ── 어드민 감사편지 전역 함수 ────────────────────
  useEffect(() => {
    if (!isAdmin(myName)) return;
    (window as any).__sendThankYou = () => {
      const userId = getPlayerUid();
      const nickname =
        myProfile?.nickname ??
        myProfile?.name ??
        localStorage.getItem('pks_nickname') ??
        myName;
      const targetId =
        userId || encodeURIComponent(nickname).replace(/%/g, '_');
      showToast(`📬 발송 시도 중... (userId: ${targetId})`, '#6366f1');
      sendLetter(targetId, {
        type: LETTER_TYPE.SYSTEM,
        title: '트레이너님께 드리는 감사 인사 💌',
        body: `${myName} 트레이너님!

아직 부족한 프로토타입인데도
꾸준히 접속해서 플레이해 주셔서
정말 감사합니다. 🙏

버그도 있고 불편한 점도 많았을 텐데
그럼에도 함께해 주신 덕분에
큰 힘이 됐습니다.

재밌게 즐겨주셔서 감사합니다! ⚡`,
        sender: 'PokéSet',
        rewards: { coins: 10000 },
      })
        .then((id: any) => {
          if (id) {
            setMailboxUnread((n: number) => n + 1);
            showToast(`✅ 감사 편지 발송 완료 (id: ${id})`, '#14532d');
          } else {
            showToast('❌ 편지 발송 실패 (id null 반환)', '#dc2626');
          }
        })
        .catch((err: any) => {
          showToast(`❌ 오류: ${err?.message ?? String(err)}`, '#dc2626');
        });
    };
    return () => {
      delete (window as any).__sendThankYou;
    };
  }, [myName, myProfile]);

  // ── Ctrl+Shift+- → 즉시 게임 승리 ────────────────
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.shiftKey) return;
      if (e.key !== '-' && e.key !== '_' && e.code !== 'Minus') return;
      if (!isAdmin(myName)) return;
      const cur = gsRef.current;
      if (!cur || cur.winner) return;
      const myPlayerName = cur.players[myIdxRef.current]?.name;
      if (!myPlayerName) return;
      setGs((prev: any) => {
        if (!prev || prev.winner) return prev;
        const g = JSON.parse(JSON.stringify(prev));
        g._seq = (g._seq || 0) + 1;
        applyWinner(g, myPlayerName);
        if (roomCodeRef.current)
          db.update('rooms/' + roomCodeRef.current, { gs: g }).catch(() => {});
        return g;
      });
      showToast('✅ ADMIN CHEAT — 즉시 승리', '#14532d');
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [myName]);
}
