import React, { useState, useEffect, useRef, useCallback } from "react";

import {
  db,
  incGames,
  saveLeaderboard,
  registerPresence,
  uploadRoomAssets,
  downloadRoomAssets,
  saveUserData,
} from "./lib/db";
import {
  persistImgs,
  loadImgs,
  persistCoins,
  getInventory,
  getEquipped,
} from "./lib/storage";
import { SE, loadSoundsFromCDN, loadShopAudio } from "./lib/sounds";
import { loadFromGithubCDN, loadBgImages, loadShopAsset } from "./lib/assets";
import { LEAGUES, SHOP_ITEMS, SD_DEFAULT } from "./lib/constants";
import { ALL_SEALS, saveSealDex } from "./lib/sealLogic";
import {
  checkWin,
  sortHand,
  aiDiscard,
  aiDiscardTeam,
  aiFindBestDiscardPile,
  reshuffleDeck,
  applyWinner,
  normalizeGs,
  initGs,
  initGsTeam,
  pickTrainers,
  refreshBrokeAI,
  randCode,
  getTeammateIdx,
  findSets,
  canFormSets,
  getAiSdRate,
} from "./lib/gameLogic";
import { addWin, updateStats } from "./lib/titleLogic";
import {
  incrementMission,
  hasUnclaimedMissions,
  restoreDailyMissionsFromCloud,
} from "./lib/dailyMissions";
import {
  hasAttendanceBadge,
  canCheckInToday,
  restoreAttendanceFromCloud,
} from "./lib/attendance";
import {
  loadTournamentData,
  startTournament,
  winRound,
  loseRound,
  getStreakBonus,
  syncTournamentToCloud,
} from "./lib/tournamentLogic";
import * as _tl from "./lib/tournamentLogic";

// 신버전 exports 폴백 (tournamentLogic.js 구버전 호환)
const buyTicketAndStart: () => any =
  (_tl as any).buyTicketAndStart ?? startTournament;
const TICKET_COST: number = (_tl as any).TICKET_COST ?? 1000;
const DAILY_MAX_WINS: number = (_tl as any).DAILY_MAX_WINS ?? 3;
const TOTAL_ROUNDS: number = (_tl as any).TOTAL_ROUNDS ?? 3;
const ROUND_CONFIGS: any[] = (_tl as any).ROUND_CONFIGS ?? [
  {
    round: 1,
    name: "1라운드",
    leagueId: "kanto",
    label: "관동급",
    emoji: "⚡",
    color: "#6366F1",
  },
  {
    round: 2,
    name: "2라운드",
    leagueId: "kanto",
    label: "관동급",
    emoji: "🔥",
    color: "#F59E0B",
  },
  {
    round: 3,
    name: "결승",
    leagueId: "kanto",
    label: "관동급",
    emoji: "🏆",
    color: "#EF4444",
  },
];
import {
  giveRandomShinySeal,
  SHINY_SEALS,
  loadShinyDex,
  saveShinyDex,
} from "./lib/shinySeals";
import {
  loadCapDex,
  saveCapDex,
  ALL_EVENT_SEALS,
  loadEventProgress,
  saveEventProgress,
  onLeagueWin,
  onLeagueLose,
  onTournamentClear,
  onDailyLogin,
  onMissionComplete,
  onLikeGiven,
  getEventDaysLeft,
  getCurrentEvent,
} from "./lib/eventLogic";
import { WILD_RULES, selectWildRule } from "./lib/wildRules";
import BattleFrontierModal from "./screens/modals/BattleFrontierModal";
import MultiModal from "./screens/modals/MultiModal";
import WildRuleReveal from "./screens/WildRuleReveal";
import AchievementModal from "./screens/modals/AchievementModal";
import BFEventModal from "./screens/modals/BFEventModal";
import PocketFestivalModal from "./screens/PocketFestivalModal";
import MailboxModal from "./screens/MailboxModal";
import MiniGameLeaderboardModal from "./screens/MiniGameLeaderboardModal";
import MyHomeScreen from "./screens/MyHomeScreen";
import {
  uploadGameScore,
  checkAndSendWeeklyRewards,
  migrateScoresToLeaderboard,
  mergeDelayedWeekData,
  dedupeW119Nicknames,
} from "./lib/miniGameLeaderboardLogic";
import {
  getUnreadCount as getMailboxUnreadCount,
  sendLetter,
  sendLetterOnce,
  LETTER_TYPE,
} from "./lib/mailboxLogic";
import { getPlayerUid } from "./lib/db";
import {
  loadAchStats,
  saveAchStats,
  recordGameResult,
  findNewlyAchieved,
  markAchieved,
  getUnclaimedCount,
  updateAchStat,
} from "./lib/achievementLogic";
import { recordBFEvent, getBFEventUnclaimedCount } from "./lib/bfEventLogic";
import { logError, installGlobalErrorHandlers } from "./lib/errorLogger";

import { StadiumBg } from "./components/misc";

// ★ 리팩토링: 외부 분리 모듈
import AdminPanel from "./components/AdminPanel";
import { useAdminCheats } from "./hooks/useAdminCheats";
import { useRoomSync } from "./hooks/useRoomSync";
import { useAIAutoPlay } from "./hooks/useAIAutoPlay";

import LoginScreen from "./screens/LoginScreen";
import LobbyScreen from "./screens/LobbyScreen";
import {
  RoomCreateScreen,
  RoomJoinScreen,
  RoomWaitScreen,
} from "./screens/RoomScreens";
import RouletteScreen from "./screens/RouletteScreen";
import PublicRoomsScreen from "./screens/PublicRoomsScreen";
import GameScreen from "./screens/GameScreen";
import BreadOpenScreen from "./screens/BreadOpenScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import InteractiveTutorial from "./screens/InteractiveTutorial";
import RulesModal from "./screens/modals/RulesModal";
import TeamRulesModal from "./screens/modals/TeamRulesModal";
import ProfileEditor from "./screens/modals/ProfileEditor";
import ShopModal from "./screens/modals/ShopModal";
import LeaderboardModal from "./screens/modals/LeaderboardModal";
import InventoryModal from "./screens/modals/InventoryModal";
import SealDexModal from "./screens/modals/SealDexModal";
import LeagueModal from "./screens/modals/LeagueModal";
import DailyMissionsModal from "./screens/modals/DailyMissionsModal";
import FeaturedSealModal from "./screens/modals/FeaturedSealModal";
import AttendanceModal from "./screens/modals/AttendanceModal";
import TournamentModal from "./screens/modals/TournamentModal";
import ShinyRevealModal from "./screens/modals/ShinyRevealModal";
import EventModal from "./screens/modals/EventModal";
import FeedbackModal from "./screens/modals/FeedbackModal";

const BREAD_TUT_KEY = "pokeset_bread_tut_done";

// ── 에러 경계 (흰화면 방지) ──────────────────────────────
class ErrorBoundary extends React.Component<
  { children: any },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error("🚨 ErrorBoundary:", error, info);
    // ★ FIX: 에러 로거에 자동 기록
    try {
      logError(error, {
        source: "boundary",
        page: "ErrorBoundary",
        extra: { componentStack: info?.componentStack?.slice(0, 500) },
      });
    } catch {}
  }
  render() {
    if (this.state.hasError)
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "linear-gradient(135deg,#1a0505,#2d0808)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            fontFamily: "system-ui",
            padding: 24,
          }}
        >
          <div style={{ fontSize: 48 }}>⚡</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>
            PokéSet
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
              lineHeight: 1.8,
            }}
          >
            앗! 오류가 발생했어요.
            <br />
            페이지를 새로고침 해주세요.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 28px",
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              border: "none",
              borderRadius: 16,
              color: "#fff",
              fontWeight: 900,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            🔄 새로고침
          </button>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.2)",
              marginTop: 8,
            }}
          >
            {String(this.state.error?.message ?? this.state.error ?? "")}
          </div>
        </div>
      );
    return this.props.children;
  }
}

const isBreadTutorialFresh = () => !localStorage.getItem(BREAD_TUT_KEY);
const markBreadTutorialDone = () => localStorage.setItem(BREAD_TUT_KEY, "1");

const GS: any = GameScreen;

function PokéSet() {
  const [screen, setScreen] = useState("lobby");
  const [loggedIn, setLoggedIn] = useState(false);
  const [myName, setMyName] = useState("");
  const [myProfile, setMyProfile] = useState<any>({
    name: "",
    trainerId: null,
    featuredSealIds: [],
  });
  const [myWins, setMyWins] = useState<any>({ solo: 0, multi: 0, total: 0 });
  const [myStats, setMyStats] = useState<any>({});
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInteractiveTutorial, setShowInteractiveTutorial] = useState(false);
  const [mutedBGM, setMutedBGM] = useState(false);
  const [mutedSFX, setMutedSFX] = useState(false);
  const muted = mutedBGM && mutedSFX;

  const [pCount, setPCount] = useState(2);
  const [isPublicRoom, setIsPublicRoom] = useState(true);
  const [roomTitle, setRoomTitle] = useState("");
  const [betAmount, setBetAmount] = useState(30);
  const [roomCode, setRoomCode] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [roomData, setRoomData] = useState<any>(null);
  const [myIdx, setMyIdx] = useState(0);

  const [gs, setGs] = useState<any>(null);
  const [drawnCard, setDrawnCard] = useState<any>(null);
  const [drawnKey, setDrawnKey] = useState(0);
  const [selId, setSelId] = useState<any>(null);
  const [discardingId, setDiscardingId] = useState<any>(null);

  const [images, setImages] = useState<any>(
    () => (window as any).__hotpotImages || {}
  );
  const [tImgs, setTImgs] = useState<any>(
    () => (window as any).__trainerImages || {}
  );
  const [customTrainers, setCustomTrainers] = useState<any[]>(
    () => (window as any).__customTrainers || []
  );
  const [lobbyBg, setLobbyBg] = useState<any>(null);
  const [loadingBg, setLoadingBg] = useState<any>(null);
  const [gameBg, setGameBg] = useState<any>(null);
  const [sounds, setSounds] = useState<any>({});

  const [showProfile, setShowProfile] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showLobbyRules, setShowLobbyRules] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLeagueModal, setShowLeagueModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showTeamRules, setShowTeamRules] = useState(false);
  const [showHandReveal, setShowHandReveal] = useState(false);
  const [showSealDex, setShowSealDex] = useState(false);
  const [showDailyMissions, setShowDailyMissions] = useState(false);
  const [showFeaturedSeal, setShowFeaturedSeal] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [attendanceBadge, setAttendanceBadge] = useState(() =>
    hasAttendanceBadge()
  );
  const [showTournament, setShowTournament] = useState(false);
  const [showShinyReveal, setShowShinyReveal] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const [eventProg, setEventProg] = useState(() => loadEventProgress());
  const [revealSeals, setRevealSeals] = useState<any[]>([]);
  const [revealIsClaim, setRevealIsClaim] = useState(false);
  const [pendingShinySeals, setPendingShinySeals] = useState<any[]>(() => {
    try {
      const s = localStorage.getItem("pokeset_pending_shinies");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [tournamentRound, setTournamentRound] = useState<number | null>(null);
  const [tournamentBadge, setTournamentBadge] = useState(() => {
    const d = loadTournamentData();
    return d.currentRound > 0;
  });

  const [showBread, setShowBread] = useState(false);
  const [showLobbyBreadTutorial, setShowLobbyBreadTutorial] = useState(false);
  const breadIsTutorialRef = useRef(false);

  const [freeBreadCount, setFreeBreadCount] = useState<number>(() => {
    const s = localStorage.getItem("pokeset_free_bread_count");
    return s ? parseInt(s) : 0;
  });
  const [freePremiumBreadCount, setFreePremiumBreadCount] = useState<number>(
    () => {
      const s = localStorage.getItem("pokeset_free_premium_bread_count");
      return s ? parseInt(s) : 0;
    }
  );
  const [missionBadge, setMissionBadge] = useState(() =>
    hasUnclaimedMissions()
  );
  const [roomErr, setRoomErr] = useState("");
  const [aiThinking, setAiThinking] = useState<any>(null);
  const [pendingPlayers, setPendingPlayers] = useState<any>(null);
  const [pendingCoins, setPendingCoins] = useState<any>(null);
  const [pendingTeamMode, setPendingTeamMode] = useState(false);
  const [roulettePreset, setRoulettePreset] = useState<any>(null);
  const [showdownAnim, setShowdownAnim] = useState<any>(null);
  const [myCoins, setMyCoins] = useState(0);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const waitingForNextRef = useRef(false);
  const [nextReadyMap, setNextReadyMap] = useState<any>({});
  const [autoStartAt, setAutoStartAt] = useState<number | null>(null);
  const [activeEmotes, setActiveEmotes] = useState<any>({});
  const [showEmotePicker, setShowEmotePicker] = useState(false);
  const [ownedEmotes, setOwnedEmotes] = useState<any[]>([]);
  const [emoteLoadout, setEmoteLoadout] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [heartbeats, setHeartbeats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [leagueConfig, setLeagueConfig] = useState<any>(LEAGUES[0]);
  const [winW, setWinW] = useState(() => window.innerWidth);
  const [cardEffects, setCardEffects] = useState<any[]>([]);
  const [setHighlight, setSetHighlight] = useState(true);

  const myProfileRef = useRef<any>(myProfile);
  const myWinsRef = useRef<any>({ solo: 0, multi: 0, total: 0 });
  const myStatsRef = useRef<any>({});
  const prevSetCount = useRef(0);
  const aiRef = useRef<any>(null);
  const autoPlayRef = useRef(false);
  const drawnCardRef = useRef<any>(null);
  const heartbeatsRef = useRef<any>({});
  const gsRef = useRef<any>(null);
  const lastTapRef = useRef<any>({ id: null, time: 0 });
  const lgRef = useRef<any>(LEAGUES[0]);
  const timerBarRef = useRef<any>(null);
  const timerRafRef = useRef<any>(null);
  const kantoImgsRef = useRef<any>({});
  const emoteLoadoutLoaded = useRef(false);
  const processedEmoteTs = useRef<any>({});
  const cardEffectId = useRef(0);
  const nextGameStartingRef = useRef(false);
  const handledSeqRef = useRef<number>(-1);
  const transitioningFromWaitRef = useRef(false);
  const freeChargeRef = useRef(false);
  const freeChargeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const myNameRef = useRef<string>("");
  const nextReadyTimeoutRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<any>(null);
  const lastKnownSeqRef = useRef<number>(-1);
  const aiProcessingSeqRef = useRef<number>(-1);
  const beforeUnloadHandlerRef = useRef<any>(null);
  const hostForceStartRef = useRef<any>(null);
  const myIdxRef = useRef<number>(0);
  const screenRef = useRef<string>("lobby");
  const roomCodeRef = useRef<string>("");
  const autoStartAtRef = useRef<number | null>(null);
  const hostTakeoverDoneRef = useRef<string>("");
  const justReconnectedRef = useRef(false);
  const justTookOverAsHostRef = useRef(false);
  const tournamentRoundRef = useRef<number | null>(null);
  const pendingShowTournamentRef = useRef(false);
  const isTournamentGameRef = useRef(false);
  const pendingBetRef = useRef<number | null>(null);
  // ── 배틀프런티어 ──
  const [showBattleFrontier, setShowBattleFrontier] = useState(false);
  const [showMultiModal, setShowMultiModal] = useState(false);
  const [useFrontierForRoom, setUseFrontierForRoom] = useState(false);
  const [showWildReveal, setShowWildReveal] = useState(false);
  const [battleFrontierRule, setBattleFrontierRule] = useState<string | null>(
    null
  );
  const battleFrontierRuleRef = useRef<string | null>(null);
  const isBattleFrontierGameRef = useRef(false);
  // ── 업적 ──
  const [showAchievements, setShowAchievements] = useState(false);
  const [achUnclaimedCount, setAchUnclaimedCount] = useState(() =>
    getUnclaimedCount()
  );
  const [showBFEvent, setShowBFEvent] = useState(false);
  const [bfEventUnclaimedCount, setBfEventUnclaimedCount] = useState(() =>
    getBFEventUnclaimedCount()
  );
  const [showPocketFestival, setShowPocketFestival] = useState(false);
  const [showMailbox, setShowMailbox] = useState(false);
  const [mailboxUnread, setMailboxUnread] = useState(0);
  const [showMiniGameLeaderboard, setShowMiniGameLeaderboard] = useState(false);
  const [claimToast, setClaimToast] = useState<null | {
    seals: string[];
    titles: string[];
    coins: number;
    letterTitle: string;
  }>(null);
  const [showMyHome, setShowMyHome] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  // 게임 내 추적 ref
  const playerTurnCountRef = useRef(0);
  const playerDeckDrawsRef = useRef(0);
  const playerSdTurn1Ref = useRef(false);
  const gameJokerSetsRef = useRef(0);
  const gameSetsRef = useRef(0);
  const prevJokerSetCountRef = useRef(0);

  useEffect(() => {
    myProfileRef.current = myProfile;
  }, [myProfile]);

  useEffect(() => {
    if (!myProfile?.uid && !myProfile?.nickname) return;
    const userId = getPlayerUid();
    const nickname = myProfile?.nickname ?? myProfile?.name ?? "트레이너";
    getMailboxUnreadCount(userId).then(setMailboxUnread);
    checkAndSendWeeklyRewards(userId, nickname).then((newLetters) => {
      if (newLetters.length > 0) setMailboxUnread((p) => p + newLetters.length);
    });
  }, [myProfile?.nickname]); // eslint-disable-line

  // ★ w120 → w119 병합 마이그레이션 (1회성)
  useEffect(() => {
    if (!loggedIn || !myName) return;
    mergeDelayedWeekData()
      .then((result) => {
        if (result?.done) {
          console.log("✅ w120→w119 병합 완료:", result);
        } else if (result?.skipped) {
          console.log("⏭️ w120→w119 병합 이미 완료됨");
        }
      })
      .catch((e) => console.error("❌ w120→w119 병합 실패:", e));
  }, [loggedIn, myName]);

  useEffect(() => {
    myWinsRef.current = myWins;
  }, [myWins]);
  useEffect(() => {
    myStatsRef.current = myStats;
  }, [myStats]);
  useEffect(() => {
    drawnCardRef.current = drawnCard;
  }, [drawnCard]);
  useEffect(() => {
    heartbeatsRef.current = heartbeats;
  }, [heartbeats]);
  useEffect(() => {
    gsRef.current = gs;
  }, [gs]);
  useEffect(() => {
    lgRef.current = leagueConfig;
  }, [leagueConfig]);
  useEffect(() => {
    myNameRef.current = myName;
  }, [myName]);
  useEffect(() => {
    myIdxRef.current = myIdx;
  }, [myIdx]);
  useEffect(() => {
    roomCodeRef.current = roomCode;
  }, [roomCode]);
  useEffect(() => {
    autoStartAtRef.current = autoStartAt;
  }, [autoStartAt]);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);
  useEffect(() => {
    if (gs && gs._seq === 0) {
      prevSetCount.current = 0;
      prevJokerSetCountRef.current = 0;
    }
  }, [gs?._seq]);
  useEffect(() => {
    const h = () => setWinW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  useEffect(() => {
    return () => {
      if (freeChargeTimerRef.current) clearTimeout(freeChargeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!roomCode || screen !== "room_wait") return;
    if (
      !myProfile.borderStyle &&
      !myProfile.title &&
      !myProfile.badge &&
      !myProfile.trainerId
    )
      return;
    (async () => {
      try {
        const rd: any = await db.get("rooms/" + roomCode);
        if (!rd?.humans) return;
        const updated = rd.humans.map((h: any, i: number) => {
          if (i !== myIdx) return h;
          return {
            ...h,
            portraitName: myProfile.trainerId || h.portraitName,
            profile: {
              title: myProfile.title || null,
              badge: myProfile.badge || null,
              borderStyle: myProfile.borderStyle || "none",
            },
          };
        });
        await db.update("rooms/" + roomCode, { humans: updated });
      } catch (e) {}
    })();
  }, [
    myProfile.borderStyle,
    myProfile.title,
    myProfile.badge,
    myProfile.trainerId,
    roomCode,
    screen,
    myIdx,
  ]);

  useEffect(() => {
    if (!gs || gs.winner) return;
    const seq = gs._seq ?? 0;
    if (seq > handledSeqRef.current) {
      setWaitingForNext(false);
      waitingForNextRef.current = false;
      setNextReadyMap({});
      nextGameStartingRef.current = false;
      setShowdownAnim(null);
      setAutoStartAt(null);
      if (nextReadyTimeoutRef.current) {
        clearTimeout(nextReadyTimeoutRef.current);
        nextReadyTimeoutRef.current = null;
      }
      lastKnownSeqRef.current = seq;
    }
  }, [gs?._seq, gs?.winner]);

  const profilePatch = () => ({
    trainerId: myProfileRef.current?.trainerId,
    bio: myProfileRef.current?.bio,
    borderStyle: myProfileRef.current?.borderStyle,
    title: myProfileRef.current?.title,
    badge: myProfileRef.current?.badge,
    featuredSealIds: myProfileRef.current?.featuredSealIds ?? [],
    wins: myWinsRef.current,
    stats: myStatsRef.current,
    displayName: myName || myProfileRef.current?.name,
  });

  const isHost = myIdx === 0;
  const isMobile = winW < 600;
  const sc = isMobile ? Math.max(0.68, winW / 490) : 1;

  const tryShowBreadTutorial = () => {
    if (isBreadTutorialFresh()) {
      markBreadTutorialDone();
      setShowLobbyBreadTutorial(true);
    }
  };

  const addFreeBread = (count: number) => {
    setFreeBreadCount((prev) => {
      const next = prev + count;
      localStorage.setItem("pokeset_free_bread_count", String(next));
      const nick = localStorage.getItem("pks_nickname");
      if (nick) saveUserData(nick, { freeBreadCount: next });
      return next;
    });
  };
  const useFreeBread = () => {
    setFreeBreadCount((prev) => {
      const next = Math.max(0, prev - 1);
      localStorage.setItem("pokeset_free_bread_count", String(next));
      const nick = localStorage.getItem("pks_nickname");
      if (nick) saveUserData(nick, { freeBreadCount: next });
      return next;
    });
  };
  const addPremiumFreeBread = () => {
    setFreePremiumBreadCount((prev) => {
      const next = prev + 1;
      localStorage.setItem("pokeset_free_premium_bread_count", String(next));
      const nick = localStorage.getItem("pks_nickname");
      if (nick) saveUserData(nick, { freePremiumBreadCount: next });
      return next;
    });
  };
  const usePremiumFreeBread = () => {
    setFreePremiumBreadCount((prev) => {
      const next = Math.max(0, prev - 1);
      localStorage.setItem("pokeset_free_premium_bread_count", String(next));
      const nick = localStorage.getItem("pks_nickname");
      if (nick) saveUserData(nick, { freePremiumBreadCount: next });
      return next;
    });
  };

  const spawnEffect = (type: string, el?: any) => {
    const rect = el?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight * 0.7;
    const eid = ++cardEffectId.current;
    setCardEffects((p) => [...p, { id: eid, type, x, y }]);
    setTimeout(() => setCardEffects((p) => p.filter((e) => e.id !== eid)), 900);
  };

  const showToast = (msg: string, color: string) => {
    const box = document.createElement("div");
    Object.assign(box.style, {
      position: "fixed",
      top: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      background: color,
      color: "#fff",
      font: "bold 13px/1.8 system-ui",
      padding: "12px 20px",
      borderRadius: "12px",
      zIndex: "2147483647",
      pointerEvents: "none",
    });
    box.textContent = msg;
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 2500);
  };

  const setAndSaveCoins = useCallback(async (next: number) => {
    const safeNext = Math.max(0, next);
    setMyCoins(safeNext);
    persistCoins(safeNext);
    const nick = localStorage.getItem("pks_nickname");
    if (nick) await saveUserData(nick, { coins: safeNext }).catch(() => {});
  }, []);

  // ══════════════════════════════════════════════════
  //  ★ useAdminCheats 훅 호출 (7개 useEffect 대체)
  // ══════════════════════════════════════════════════
  useAdminCheats({
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
  });

  useEffect(() => {
    loadFromGithubCDN()
      .then(({ cards, trainers }: any) => {
        if (Object.keys(cards).length > 0) {
          setImages(cards);
          (window as any).__hotpotImages = cards;
          kantoImgsRef.current = cards;
        }
        if (Object.keys(trainers).length > 0) {
          setTImgs(trainers);
          (window as any).__trainerImages = trainers;
        }
      })
      .catch(() => {});
    loadSoundsFromCDN()
      .then((s: any) => {
        if (Object.keys(s).length > 0) {
          setSounds(s);
          SE.load(s);
          SE.startBGM();
        }
      })
      .catch(() => {});
    loadBgImages().then(({ lobbyBg: lb, loadingBg: ld, gameBg: gb }: any) => {
      if (lb) setLobbyBg(lb);
      if (ld) setLoadingBg(ld);
      if (gb) setGameBg(gb);
    });
    registerPresence();
    // ★ FIX: 전역 에러 핸들러 설치 (window.onerror + unhandledrejection)
    installGlobalErrorHandlers(() => screenRef.current);
  }, []);

  useEffect(() => {
    (async () => {
      const c = await loadImgs("pks_cards");
      if (c && Object.keys(c).length > 0) {
        setImages(c);
        (window as any).__hotpotImages = c;
      }
      const t = await loadImgs("pks_trainers");
      if (t && Object.keys(t).length > 0) {
        setTImgs(t);
        (window as any).__trainerImages = t;
      }
      const x = await loadImgs("pks_customs");
      if (x?.length > 0) {
        setCustomTrainers(x);
        (window as any).__customTrainers = x;
      }
      const prof = await loadImgs("pks_profile");
      if (prof) {
        setMyProfile((prev: any) => ({
          ...prev,
          trainerId: prof.trainerId ?? prev.trainerId,
          bio: prof.bio ?? prev.bio,
          borderStyle: prof.borderStyle ?? prev.borderStyle,
          title: prof.title ?? prev.title,
          badge: prof.badge ?? prev.badge,
          featuredSealIds:
            prof.featuredSealIds ??
            (prof.featuredSealId
              ? [Number(prof.featuredSealId)]
              : prev.featuredSealIds ?? []),
        }));
        if (!localStorage.getItem("pks_nickname")) setMyName(prof.name || "");
      }
      const el = await loadImgs("pks_emote_loadout");
      if (el && Array.isArray(el)) setEmoteLoadout(el);
      emoteLoadoutLoaded.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!emoteLoadoutLoaded.current) return;
    persistImgs("pks_emote_loadout", emoteLoadout);
    const nick = localStorage.getItem("pks_nickname");
    if (nick) saveUserData(nick, { emoteLoadout }).catch(() => {});
  }, [emoteLoadout]);

  useEffect(() => {
    const n = myProfile.name || myName;
    if (!n) return;
    getEquipped().then(async (eq: any) => {
      if (eq.lobby_bg) {
        const url = await loadShopAsset(
          SHOP_ITEMS.find((i: any) => i.id === eq.lobby_bg)?.file || "",
          ["png", "jpg", "jpeg", "webp"]
        );
        if (url) setLobbyBg(url);
      }
      if (eq.game_bg) {
        const url = await loadShopAsset(
          SHOP_ITEMS.find((i: any) => i.id === eq.game_bg)?.file || "",
          ["png", "jpg", "jpeg", "webp"]
        );
        if (url) setGameBg(url);
      }
      if (eq.bgm) {
        const url = await loadShopAudio(
          SHOP_ITEMS.find((i: any) => i.id === eq.bgm)?.file || ""
        );
        if (url) {
          const s = { bgm: { data: url } };
          setSounds(s);
          SE.load(s);
          SE.startBGM();
        }
      }
    });
  }, [myProfile.name, myName]);

  useEffect(() => {
    if (
      [
        "game",
        "lobby",
        "room_create",
        "room_join",
        "room_wait",
        "public_rooms",
      ].includes(screen)
    )
      SE.startBGM();
    else SE.stopBGM();
  }, [screen]);

  // ══════════════════════════════════════════════════
  //  게임 승자 결정 시 처리 (큰 useEffect)
  // ══════════════════════════════════════════════════
  useEffect(() => {
    if (!gs?.winner) return;
    const n = gs.players[myIdx]?.name;
    if (!n) return;
    const iWon = gs.winner === n;
    const mode = roomCode ? "multi" : "solo";
    if (iWon) SE.roundWin();
    else SE.lose();
    incrementMission("play3");

    const isTournamentComplete =
      isTournamentGameRef.current &&
      iWon &&
      tournamentRoundRef.current === TOTAL_ROUNDS;

    if (tournamentRoundRef.current !== null) {
      const round = tournamentRoundRef.current;
      if (iWon) {
        const newData = winRound(round);
        syncTournamentToCloud(newData);

        if (round === TOTAL_ROUNDS) {
          const shinySeal = giveRandomShinySeal();
          if (shinySeal) {
            setPendingShinySeals((prev) => {
              const next = [...prev, shinySeal];
              localStorage.setItem(
                "pokeset_pending_shinies",
                JSON.stringify(next)
              );
              return next;
            });
          } else {
            showToast("🏆 챔피언! (이로치 씰 151마리 완성!)", "#4338CA");
          }
          setEventProg((prev: any) => {
            const next = onTournamentClear(prev);
            saveEventProgress(next);
            return next;
          });

          const streakBonus = getStreakBonus(newData.streak);
          if (streakBonus) {
            setTimeout(() => {
              setMyCoins((prev: number) => {
                const n2 = Math.max(0, prev + streakBonus.coins);
                persistCoins(n2);
                const nick = localStorage.getItem("pks_nickname");
                if (nick) saveUserData(nick, { coins: n2 }).catch(() => {});
                return n2;
              });
              showToast(
                `🔥 ${streakBonus.label} +${streakBonus.coins}코인!`,
                "#F59E0B"
              );
            }, 2000);
          }
        }
        setTournamentBadge(round < TOTAL_ROUNDS);
      } else {
        loseRound();
        setTournamentBadge(false);
      }
      tournamentRoundRef.current = null;
      setTournamentRound(null);
      pendingShowTournamentRef.current = true;
    }

    if (iWon) {
      incrementMission("win2");
      if (gs.showdownUsed?.[n]) incrementMission("doubleBet");
      const leagueId = gsRef.current?.leagueId || "kanto";
      const newWins = addWin(myWinsRef.current, mode, leagueId);
      const newStats = updateStats(myStatsRef.current, {
        isDoubleWin: !!gs.showdownUsed?.[n],
        isPerfectWin: !!gs._perfectWin,
        isMultiKill: (gs._winSets ?? 0) >= 3,
        isBroke: (gs.preGameCoins?.[n] ?? 999) <= gs.bet,
        isWin: true,
      });
      setMyWins(newWins);
      setMyStats(newStats);
      myWinsRef.current = newWins;
      myStatsRef.current = newStats;
      setMyProfile((p: any) => ({ ...p, wins: newWins, stats: newStats }));
      if (!isTournamentGameRef.current) {
        setEventProg((prev: any) => {
          const next = onLeagueWin(prev);
          saveEventProgress(next);
          return next;
        });
      }
    } else {
      const newStats = updateStats(myStatsRef.current, { isWin: false });
      setMyStats(newStats);
      myStatsRef.current = newStats;
      if (!isTournamentGameRef.current) {
        setEventProg((prev: any) => {
          const next = onLeagueLose(prev);
          saveEventProgress(next);
          return next;
        });
      }
    }

    const preCoins = gs.preGameCoins?.[n] || 0;
    const postCoins = gs.coins?.[n] || 0;
    const coinsEarned = Math.max(0, postCoins - preCoins);
    const sdWon = iWon && !!gs.showdownUsed?.[n];
    const updatedAchStats = recordGameResult({
      won: iWon,
      isMulti: !!roomCodeRef.current,
      isBattleFrontier: isBattleFrontierGameRef.current,
      isTournament: isTournamentComplete,
      wildRule: gs.wildRule || null,
      playerTurnCount: playerTurnCountRef.current,
      usedDeck: playerDeckDrawsRef.current > 0,
      sdUsed: !!gs.showdownUsed?.[n],
      sdWon,
      usedSdOnTurn1: playerSdTurn1Ref.current,
      coinsEarned,
      coinsAfter: postCoins,
      setsCompleted: gameSetsRef.current,
      jokerSetsCompleted: gameJokerSetsRef.current,
      brokeWin: iWon && (gs.preGameCoins?.[n] ?? 999) <= (gs.bet || 0),
    });
    const newly = findNewlyAchieved(updatedAchStats);
    if (newly.length > 0) {
      markAchieved(newly);
      setAchUnclaimedCount(getUnclaimedCount());
      newly.forEach(({ ach }, i) => {
        setTimeout(
          () =>
            showToast(
              `🏅 업적 달성! "${ach.name}" — 받기 버튼을 눌러보세요!`,
              "#6366f1"
            ),
          i * 800
        );
      });
    }

    recordBFEvent({
      won: iWon,
      wildRule: gs.wildRule || null,
      sdWon,
      sealGained: false,
    });
    const newBfUnclaimed = getBFEventUnclaimedCount();
    setBfEventUnclaimedCount(newBfUnclaimed);
    if (newBfUnclaimed > 0) {
      setTimeout(
        () => showToast("📋 주간 미션 달성! 보상을 받으세요!", "#8b5cf6"),
        600
      );
    }
    setMissionBadge(hasUnclaimedMissions());
    const c = gs.coins[n];
    if (c != null && !isTournamentGameRef.current) {
      const safeC = Math.max(0, c);
      setAndSaveCoins(safeC);
      const dex = JSON.parse(localStorage.getItem("pokeset_sealdex") || "{}");
      const nick2 = localStorage.getItem("pks_nickname");
      if (nick2)
        saveLeaderboard(nick2, safeC, dex, {
          ...profilePatch(),
          displayName: n,
        });
      else saveLeaderboard(n, safeC, dex, profilePatch());
      cloudSave({
        coins: safeC,
        ...(iWon ? { wins: myWinsRef.current, stats: myStatsRef.current } : {}),
      });
    }
  }, [gs?.winner]);

  const startNextGame = useCallback(
    async (
      g: any,
      currentSeq: number,
      currentHumans: string[],
      bet: number,
      leagueId: string
    ) => {
      if (nextGameStartingRef.current) return;
      nextGameStartingRef.current = true;
      handledSeqRef.current = currentSeq;
      clearTimeout(aiRef.current);
      setAiThinking(null);
      setShowdownAnim(null);
      setAutoStartAt(null);
      if (nextReadyTimeoutRef.current) {
        clearTimeout(nextReadyTimeoutRef.current);
        nextReadyTimeoutRef.current = null;
      }
      const wasTeam = g.teamMode || false;
      const rawPl = g.players.map((p: any) => ({
        name: p.name,
        emoji: p.emoji,
        isAI: p.isAI,
        portraitName: p.portraitName,
        profile: p.profile,
      }));
      const coins: any = {};
      Object.keys(g.coins).forEach(
        (k) => (coins[k] = Math.max(0, g.coins[k] || 0))
      );
      let players = refreshBrokeAI(rawPl, coins, bet);
      players.forEach((p: any) => {
        if (p.isAI && !coins[p.name]) coins[p.name] = Math.max(bet * 6, 300);
      });
      players = players.map((p: any) =>
        !p.isAI && !currentHumans.includes(p.name) ? { ...p, isAI: true } : p
      );
      const remainingHumans = players.filter((p: any) => !p.isAI);
      if (remainingHumans.length === 0) {
        db.remove("rooms/" + roomCodeRef.current).catch(() => {});
        nextGameStartingRef.current = false;
        return;
      }
      const wi = players.findIndex((p: any) => p.name === g.winner);
      const newGs = wasTeam
        ? initGsTeam(
            players,
            coins,
            wi >= 0 ? wi : 0,
            bet,
            leagueId,
            g.wildRule
          )
        : initGs(players, coins, wi >= 0 ? wi : 0, bet, leagueId, g.wildRule);
      newGs._seq = currentSeq + 1;
      db.update("rooms/" + roomCodeRef.current, {
        gs: newGs,
        status: "playing",
        nextReady: null,
        autoStartAt: null,
      })
        .then(() => {
          setWaitingForNext(false);
          waitingForNextRef.current = false;
          setNextReadyMap({});
          setDrawnCard(null);
          setSelId(null);
          setDiscardingId(null);
          setGs(newGs);
        })
        .catch(() => {
          nextGameStartingRef.current = false;
          handledSeqRef.current = currentSeq - 1;
        });
    },
    []
  );

  const cloudSave = useCallback(
    async (patch: any) => {
      const nick = localStorage.getItem("pks_nickname");
      if (!nick) return;
      await saveUserData(nick, patch);
      if (patch.sealDex !== undefined) {
        const latestCoins = patch.coins ?? myCoins;
        saveLeaderboard(nick, latestCoins, patch.sealDex, profilePatch());
        incrementMission("getSeal");
        setMissionBadge(hasUnclaimedMissions());
        recordBFEvent({
          won: false,
          wildRule: null,
          sdWon: false,
          sealGained: true,
        });
        const s2 = getBFEventUnclaimedCount();
        setBfEventUnclaimedCount(s2);
      }
    },
    [myCoins]
  );

  useEffect(() => {
    (window as any).__cloudSave = cloudSave;
    return () => {
      (window as any).__cloudSave = null;
    };
  }, [cloudSave]);

  const pushGs = useCallback(async (g: any) => {
    if (!roomCodeRef.current) return;
    await db.update("rooms/" + roomCodeRef.current, { gs: g });
  }, []);

  const autoPlayTurn = useCallback(
    (ti: number) => {
      setGs((prev: any) => {
        if (!prev || prev.winner || prev.cur !== ti) return prev;
        const g = JSON.parse(JSON.stringify(prev));
        g._seq = (g._seq || 0) + 1;
        const pl = g.players[ti];
        const groups = (
          LEAGUES.find((l: any) => l.id === (g.leagueId || "kanto")) ||
          LEAGUES[0]
        ).groups;
        if (g.phase === "draw") {
          if (g.deck.length <= 1) reshuffleDeck(g);
          if (!g.deck.length) return prev;
          const card = g.deck.shift(),
            nine = [...(pl.hand || []), card];
          if (ti === myIdxRef.current) playerDeckDrawsRef.current++;
          if (checkWin(nine, g.wildRule)) {
            pl.hand = sortHand(nine, groups);
            applyWinner(g, pl.name);
            if (roomCodeRef.current) pushGs(g);
            return g;
          }
          const di = aiDiscard(nine, g.leagueId || "kanto"),
            disc = nine.splice(di, 1)[0];
          pl.hand = sortHand(nine, groups);
          (pl.discardPile = pl.discardPile || []).unshift(disc);
          if (checkWin(pl.hand, g.wildRule)) {
            applyWinner(g, pl.name);
            if (roomCodeRef.current) pushGs(g);
            return g;
          }
        } else {
          const drawn = drawnCardRef.current;
          if (drawn) {
            const nine = [...(pl.hand || []), drawn];
            const di = aiDiscard(nine, g.leagueId || "kanto"),
              disc = nine.splice(di, 1)[0];
            pl.hand = sortHand(nine, groups);
            (pl.discardPile = pl.discardPile || []).unshift(disc);
            if (checkWin(pl.hand, g.wildRule)) {
              applyWinner(g, pl.name);
              if (roomCodeRef.current) pushGs(g);
              return g;
            }
          } else {
            if (g.deck.length <= 1) reshuffleDeck(g);
            if (!g.deck.length) return prev;
            const card = g.deck.shift(),
              nine = [...(pl.hand || []), card];
            if (checkWin(nine, g.wildRule)) {
              pl.hand = sortHand(nine, groups);
              applyWinner(g, pl.name);
              if (roomCodeRef.current) pushGs(g);
              return g;
            }
            const di = aiDiscard(nine, g.leagueId || "kanto"),
              disc = nine.splice(di, 1)[0];
            pl.hand = sortHand(nine, groups);
            (pl.discardPile = pl.discardPile || []).unshift(disc);
            if (checkWin(pl.hand, g.wildRule)) {
              applyWinner(g, pl.name);
              if (roomCodeRef.current) pushGs(g);
              return g;
            }
          }
        }
        g.phase = "draw";
        g.cur = (ti + 1) % g.players.length;
        g.turnStartedAt = Date.now();
        if (roomCodeRef.current) pushGs(g);
        return g;
      });
      if (ti === myIdxRef.current) {
        setDrawnCard(null);
        setSelId(null);
      }
    },
    [pushGs]
  );

  // ══════════════════════════════════════════════════
  //  ★ useRoomSync 훅 호출 (6개 useEffect 대체)
  // ══════════════════════════════════════════════════
  useRoomSync({
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
  });

  // ══════════════════════════════════════════════════
  //  ★ useAIAutoPlay 훅 호출 (3개 useEffect 대체)
  // ══════════════════════════════════════════════════
  useAIAutoPlay({
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
  });

  useEffect(() => {
    (async () => {
      try {
        const inv = await getInventory();
        const owned = SHOP_ITEMS.filter(
          (i: any) =>
            i.type === "emote" && inv[i.id] && emoteLoadout.includes(i.id)
        );
        const emotes = await Promise.all(
          owned.map(async (i: any) => {
            const imgUrl = await loadShopAsset(i.file, [
              "png",
              "jpg",
              "jpeg",
              "webp",
              "gif",
              "mp4",
            ]);
            return {
              id: i.id,
              emoji: i.emoji,
              name: i.name,
              imgUrl: imgUrl || null,
            };
          })
        );
        setOwnedEmotes(emotes);
      } catch (e) {}
    })();
  }, [screen, emoteLoadout]);

  useEffect(() => {
    const nick = localStorage.getItem("pks_nickname");
    if (!nick || !loggedIn) return;
    db.get(`users/${encodeURIComponent(nick).replace(/%/g, "_")}`)
      .then((user: any) => {
        if (!user) {
          localStorage.setItem("pokeset_sealdex", JSON.stringify({}));
          return;
        }
        if (user.coins != null) {
          const safeCoins = Math.max(0, user.coins);
          setMyCoins(safeCoins);
          persistCoins(safeCoins);
        } else {
          setMyCoins(300);
          persistCoins(300);
          const k = encodeURIComponent(nick).replace(/%/g, "_");
          db.update(`users/${k}`, { coins: 300 }).catch(() => {});
        }
        const dex =
          user.sealDex && Object.keys(user.sealDex).length > 0
            ? user.sealDex
            : {};
        localStorage.setItem("pokeset_sealdex", JSON.stringify(dex));
        saveLeaderboard(nick, user.coins ?? 300, dex, {
          trainerId: user.trainerId,
          bio: user.bio,
          borderStyle: user.borderStyle,
          title: user.title,
          badge: user.badge,
          wins: user.wins,
          featuredSealIds: user.featuredSealIds,
          displayName: user.nickname || nick,
        });
        if (user.emoteLoadout) setEmoteLoadout(user.emoteLoadout);
        if (user.wins) {
          setMyWins(user.wins);
          myWinsRef.current = user.wins;
        }
        if (user.stats) {
          setMyStats(user.stats);
          myStatsRef.current = user.stats;
        }
        if (user.breadTutorialDone) localStorage.setItem(BREAD_TUT_KEY, "1");
        if (user.freeBreadCount != null) {
          setFreeBreadCount(user.freeBreadCount);
          localStorage.setItem(
            "pokeset_free_bread_count",
            String(user.freeBreadCount)
          );
        }
        if (user.freePremiumBreadCount != null) {
          setFreePremiumBreadCount(user.freePremiumBreadCount);
          localStorage.setItem(
            "pokeset_free_premium_bread_count",
            String(user.freePremiumBreadCount)
          );
        }
        setMyProfile((prev: any) => ({
          ...prev,
          ...(user.trainerId ? { trainerId: user.trainerId } : {}),
          ...(user.bio ? { bio: user.bio } : {}),
          ...(user.borderStyle ? { borderStyle: user.borderStyle } : {}),
          ...(user.title ? { title: user.title } : {}),
          ...(user.badge ? { badge: user.badge } : {}),
          ...(user.wins ? { wins: user.wins } : {}),
          ...(user.stats ? { stats: user.stats } : {}),
          featuredSealIds:
            user.featuredSealIds ??
            (user.featuredSealId
              ? [Number(user.featuredSealId)]
              : prev.featuredSealIds ?? []),
        }));
        if (user.dailyMissions)
          restoreDailyMissionsFromCloud(user.dailyMissions);
        if (user.attendance) restoreAttendanceFromCloud(user.attendance);

        if (user.shinyDex) {
          saveShinyDex(user.shinyDex);
          window.dispatchEvent(new Event("pokeset_shiny_dex_updated"));
        }

        if (user.capDex) {
          localStorage.setItem("pokeset_cap_dex", JSON.stringify(user.capDex));
          window.dispatchEvent(new Event("pokeset_cap_dex_updated"));
        }

        // ★ FIX: 마이그레이션 - 우편으로 받은 코스프레 씰이 capDex 에 없으면 동기화
        //   (예전 onClaimReward 가 capDex 에 저장하지 않아서 이미 받은 사람들 복구용)
        if (
          Array.isArray(user.miniGameSeals) &&
          user.miniGameSeals.length > 0
        ) {
          const capDex = user.capDex || {};
          let changed = false;
          for (const sealId of user.miniGameSeals) {
            if (typeof sealId !== "string") continue;
            // 띠부씰(숫자 ID)은 스킵, 코스프레 씰(문자열 ID)만
            if (/^\d+$/.test(sealId)) continue;
            if (!capDex[sealId] || !(capDex[sealId].count > 0)) {
              capDex[sealId] = { count: 1 };
              changed = true;
            }
          }
          if (changed) {
            localStorage.setItem("pokeset_cap_dex", JSON.stringify(capDex));
            window.dispatchEvent(new Event("pokeset_cap_dex_updated"));
            const k = encodeURIComponent(nick).replace(/%/g, "_");
            db.update(`users/${k}`, { capDex }).catch(() => {});
          }
        }

        if (user.pendingShinySeals) {
          setPendingShinySeals(user.pendingShinySeals);
          localStorage.setItem(
            "pokeset_pending_shinies",
            JSON.stringify(user.pendingShinySeals)
          );
        }

        if (user.tournament) {
          localStorage.setItem(
            "pokeset_tournament",
            JSON.stringify(user.tournament)
          );
          const restoredTournament = loadTournamentData();
          setTournamentBadge(restoredTournament.currentRound > 0);
        }

        if (user.miniGameScores) {
          localStorage.setItem(
            "pokeset_minigame_scores",
            JSON.stringify(user.miniGameScores)
          );
        }

        setAttendanceBadge(hasAttendanceBadge());
        setMissionBadge(hasUnclaimedMissions());
      })
      .catch(() => {});
  }, [loggedIn]);

  const saveProfile = (prof: any) => {
    const merged = {
      ...prof,
      wins: myWinsRef.current,
      featuredSealIds: prof.featuredSealIds ?? myProfile.featuredSealIds ?? [],
    };
    setMyProfile(merged);
    setMyName(prof.name || "나");
    persistImgs("pks_profile", merged);
    const nick = localStorage.getItem("pks_nickname");
    if (nick) {
      saveUserData(nick, {
        trainerId: prof.trainerId,
        bio: prof.bio,
        borderStyle: prof.borderStyle,
        title: prof.title,
        badge: prof.badge,
        featuredSealIds: merged.featuredSealIds,
        stats: myStatsRef.current,
      });
      const dex = JSON.parse(localStorage.getItem("pokeset_sealdex") || "{}");
      saveLeaderboard(nick, myCoins, dex, {
        ...merged,
        wins: myWinsRef.current,
        displayName: prof.name || myName,
      });
    }
  };

  const handleSetFeaturedSeal = (sealIds: number[]) => {
    const updated = { ...myProfile, featuredSealIds: sealIds };
    setMyProfile(updated);
    myProfileRef.current = updated;
    persistImgs("pks_profile", updated);
    const nick = localStorage.getItem("pks_nickname");
    if (nick) saveUserData(nick, { featuredSealIds: sealIds });
  };

  const buildCoins = (players: any[]) =>
    Object.fromEntries(
      players.map((p) => [
        p.name,
        p.isAI ? 200 + Math.floor(Math.random() * 601) : 300,
      ])
    );

  const goRoulette = (
    players: any[],
    coins: any,
    preset: any,
    teamMode = false
  ) => {
    setPendingPlayers(players);
    setPendingCoins(coins);
    setRoulettePreset(preset ?? null);
    setPendingTeamMode(teamMode);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setScreen("roulette");
    }, 1300);
  };

  const reset = (codeOverride?: string) => {
    const code = codeOverride || roomCodeRef.current;
    clearTimeout(aiRef.current);
    setAiThinking(null);
    setWaitingForNext(false);
    waitingForNextRef.current = false;
    nextGameStartingRef.current = false;
    handledSeqRef.current = -1;
    setNextReadyMap({});
    SE.stopBGM();
    localStorage.removeItem("pks_room_code");
    localStorage.removeItem("pks_room_idx");
    processedEmoteTs.current = {};
    if (nextReadyTimeoutRef.current) {
      clearTimeout(nextReadyTimeoutRef.current);
      nextReadyTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    aiProcessingSeqRef.current = -1;
    lastKnownSeqRef.current = -1;
    hostTakeoverDoneRef.current = "";
    justTookOverAsHostRef.current = false;
    if (beforeUnloadHandlerRef.current) {
      window.removeEventListener(
        "beforeunload",
        beforeUnloadHandlerRef.current
      );
      beforeUnloadHandlerRef.current = null;
    }
    setShowdownAnim(null);
    setAutoStartAt(null);
    if (code) {
      db.get("rooms/" + code)
        .then((rd: any) => {
          if (!rd) return;
          const amHost = rd.host === (myNameRef.current || myName || "나");
          const remaining = (rd.humans || []).filter(
            (h: any) => h.name !== (myNameRef.current || myName || "나")
          );
          if (remaining.length === 0) {
            db.remove("rooms/" + code).catch(() => {});
          } else if (amHost) {
            db.update("rooms/" + code, {
              host: remaining[0].name,
              humans: remaining,
              autoStartAt: null,
            }).catch(() => {});
          } else {
            db.update("rooms/" + code, { humans: remaining }).catch(() => {});
          }
        })
        .catch(() => {});
    }
    if (Object.keys(kantoImgsRef.current).length > 0) {
      setImages(kantoImgsRef.current);
      (window as any).__hotpotImages = kantoImgsRef.current;
    }
    setLeagueConfig(LEAGUES[0]);
    lgRef.current = LEAGUES[0];
    isTournamentGameRef.current = false;
    pendingBetRef.current = null;
    isBattleFrontierGameRef.current = false;
    battleFrontierRuleRef.current = null;
    setBattleFrontierRule(null);

    if (pendingShowTournamentRef.current) {
      pendingShowTournamentRef.current = false;
      setTimeout(() => setShowTournament(true), 400);
    }

    setScreen("lobby");
    setGs(null);
    setDrawnCard(null);
    setSelId(null);
    setDiscardingId(null);
    setRoomCode("");
    setRoomData(null);
    setMyIdx(0);
    setRoomErr("");
    setPendingPlayers(null);
    setPendingCoins(null);
    setRoulettePreset(null);
    setShowHandReveal(false);
    setPendingTeamMode(false);
  };

  const handleRouletteComplete = (wi: number) => {
    const pl = pendingPlayers,
      co = pendingCoins,
      isTeam = pendingTeamMode;
    if (!pl || !co) return;
    const lg = lgRef.current;
    const bet = pendingBetRef.current !== null ? pendingBetRef.current : lg.bet;
    pendingBetRef.current = null;
    const wr = battleFrontierRuleRef.current;
    const newGs = isTeam
      ? initGsTeam(pl, co, wi, bet, lg.id, wr)
      : initGs(pl, co, wi, bet, lg.id, wr);
    playerTurnCountRef.current = 0;
    playerDeckDrawsRef.current = 0;
    playerSdTurn1Ref.current = false;
    gameJokerSetsRef.current = 0;
    gameSetsRef.current = 0;
    prevJokerSetCountRef.current = 0;
    newGs.turnStartedAt = Date.now();
    setGs(newGs);
    setDrawnCard(null);
    setSelId(null);
    setDiscardingId(null);
    setPendingPlayers(null);
    setPendingCoins(null);
    setScreen("game");
  };

  const handleRouletteCompleteRoom = async (wi: number) => {
    if (isHost && roomCode)
      await db.update("rooms/" + roomCode, {
        status: "playing",
        "gs/turnStartedAt": Date.now(),
      });
    playerTurnCountRef.current = 0;
    playerDeckDrawsRef.current = 0;
    playerSdTurn1Ref.current = false;
    gameJokerSetsRef.current = 0;
    gameSetsRef.current = 0;
    prevJokerSetCountRef.current = 0;
    setPendingPlayers(null);
    setPendingCoins(null);
    setScreen("game");
  };

  const handleBattleFrontierSolo = (useFrontierRule: boolean = true) => {
    setShowBattleFrontier(false);
    const rule = useFrontierRule ? selectWildRule(false) : null;
    battleFrontierRuleRef.current = rule;
    setBattleFrontierRule(rule);
    isBattleFrontierGameRef.current = true;

    const lg = LEAGUES[0];
    setLeagueConfig(lg);
    lgRef.current = lg;
    incGames();
    const tr = pickTrainers(3, myProfile.trainerId);
    const pl = [
      {
        name: myName || "나",
        emoji: "😊",
        isAI: false,
        id: 0,
        portraitName: myProfile.trainerId || undefined,
        profile: {
          title: myProfile.title || null,
          badge: myProfile.badge || null,
          borderStyle: myProfile.borderStyle || "none",
        },
      },
      ...tr.map((t: any, i: number) => ({
        name: t.n + " (AI)",
        emoji: t.e,
        isAI: true,
        id: i + 1,
        portraitName: t.n,
      })),
    ];
    setMyIdx(0);
    const c0 = buildCoins(pl);
    c0[pl[0].name] = myCoins;
    setPendingPlayers(pl);
    setPendingCoins(c0);
    setRoulettePreset(null);
    setPendingTeamMode(false);

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (rule) {
        setShowWildReveal(true);
      } else {
        setScreen("roulette");
      }
    }, 1300);
  };

  const handleBattleFrontierMulti = (
    type: "create" | "public" | "join",
    useFrontierRule: boolean = true
  ) => {
    setShowBattleFrontier(false);
    const rule = useFrontierRule ? selectWildRule(true) : null;
    battleFrontierRuleRef.current = rule;
    setBattleFrontierRule(rule);
    isBattleFrontierGameRef.current = true;
    if (type === "create") setScreen("room_create");
    else if (type === "public") setScreen("public_rooms");
    else setScreen("room_join");
  };

  const handleNormalMulti = (type: "create" | "public" | "join") => {
    setShowMultiModal(false);
    isBattleFrontierGameRef.current = false;
    battleFrontierRuleRef.current = null;
    setBattleFrontierRule(null);
    if (type === "create") {
      setIsPublicRoom(false);
      setRoomTitle("");
      setScreen("room_create");
      setRoomErr("");
    } else if (type === "public") setScreen("public_rooms");
    else {
      setScreen("room_join");
      setRoomErr("");
    }
  };

  const handleWildRevealComplete = () => {
    setShowWildReveal(false);
    if (roomCodeRef.current) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setScreen("roulette");
      }, 400);
    } else if (isBattleFrontierGameRef.current) {
      setScreen("roulette");
    }
  };

  const confirmLeague = async (lg: any, lgImgs: any) => {
    setShowLeagueModal(false);
    setLeagueConfig(lg);
    lgRef.current = lg;
    if (lg.cardPrefix && lgImgs && Object.keys(lgImgs).length > 0)
      setImages(lgImgs);
    else if (!lg.cardPrefix && Object.keys(kantoImgsRef.current).length > 0)
      setImages(kantoImgsRef.current);
    incGames();
    if (!isBattleFrontierGameRef.current) {
      battleFrontierRuleRef.current = null;
      setBattleFrontierRule(null);
    }
    const tr = pickTrainers(3, myProfile.trainerId);
    const pl = [
      {
        name: myName || "나",
        emoji: "😊",
        isAI: false,
        id: 0,
        portraitName: myProfile.trainerId || undefined,
        profile: {
          title: myProfile.title || null,
          badge: myProfile.badge || null,
          borderStyle: myProfile.borderStyle || "none",
        },
      },
      ...tr.map((t: any, i: number) => ({
        name: t.n + " (AI)",
        emoji: t.e,
        isAI: true,
        id: i + 1,
        portraitName: t.n,
      })),
    ];
    setMyIdx(0);
    const c0 = buildCoins(pl);
    c0[pl[0].name] = myCoins;
    goRoulette(pl, c0, null, false);
  };

  const startTeamBattle = () => {
    isBattleFrontierGameRef.current = false;
    battleFrontierRuleRef.current = null;
    setBattleFrontierRule(null);
    incGames();
    const tr = pickTrainers(3, myProfile.trainerId);
    const pl = [
      {
        name: myName || "나",
        emoji: "😊",
        isAI: false,
        id: 0,
        portraitName: myProfile.trainerId || undefined,
        profile: {
          title: myProfile.title || null,
          badge: myProfile.badge || null,
          borderStyle: myProfile.borderStyle || "none",
        },
      },
      ...tr.map((t: any, i: number) => ({
        name: t.n + " (AI)",
        emoji: t.e,
        isAI: true,
        id: i + 1,
        portraitName: t.n,
      })),
    ];
    setMyIdx(0);
    const c0 = buildCoins(pl);
    c0[pl[0].name] = myCoins;
    goRoulette(pl, c0, null, true);
  };

  const startTournamentRound = useCallback(
    (round: number, leagueId: string, coinsOverride?: number) => {
      const lg = LEAGUES.find((l: any) => l.id === leagueId) || LEAGUES[0];
      setLeagueConfig(lg);
      lgRef.current = lg;
      incGames();
      isBattleFrontierGameRef.current = false;
      battleFrontierRuleRef.current = null;
      setBattleFrontierRule(null);

      const tr = pickTrainers(3, myProfileRef.current.trainerId);
      const myN = myNameRef.current || "나";
      const pl = [
        {
          name: myN,
          emoji: "😊",
          isAI: false,
          id: 0,
          portraitName: myProfileRef.current?.trainerId || undefined,
          profile: {
            title: myProfileRef.current?.title || null,
            badge: myProfileRef.current?.badge || null,
            borderStyle: myProfileRef.current?.borderStyle || "none",
          },
        },
        ...tr.map((t: any, i: number) => ({
          name: t.n + " (AI)",
          emoji: t.e,
          isAI: true,
          id: i + 1,
          portraitName: t.n,
        })),
      ];
      setMyIdx(0);
      const c0 = buildCoins(pl);
      c0[myN] = coinsOverride ?? myCoins;

      isTournamentGameRef.current = true;
      pendingBetRef.current = 0;
      incrementMission("playTournament");
      setMissionBadge(hasUnclaimedMissions());
      tournamentRoundRef.current = round;
      setTournamentRound(round);
      setTournamentBadge(true);
      goRoulette(pl, c0, null, false);
    },
    [myCoins]
  );

  const handleStartTournamentRound = useCallback(
    (round: number, leagueId: string) => {
      setShowTournament(false);
      const data = loadTournamentData();
      if (!data.freeUsed) startTournament();
      startTournamentRound(round, leagueId);
    },
    [myCoins, myName, myProfile]
  );

  const handleBuyTournamentTicket = useCallback(() => {
    handleSpendCoins(TICKET_COST);
    buyTicketAndStart();
    setShowTournament(false);
    const config = ROUND_CONFIGS[0];
    startTournamentRound(1, config.leagueId);
  }, [myCoins, myName, myProfile]);

  const nextGame = useCallback(async () => {
    if (!gsRef.current) return;
    clearTimeout(aiRef.current);
    setAiThinking(null);
    setShowdownAnim(null);
    const g = gsRef.current;

    if (isTournamentGameRef.current && !roomCodeRef.current) {
      isTournamentGameRef.current = false;
      const tData = loadTournamentData();
      if (tData.ticketActive && tData.currentRound > 0) {
        pendingShowTournamentRef.current = false;
        const round = tData.currentRound;
        const config = ROUND_CONFIGS[round - 1];
        const currentCoins = g.coins[myNameRef.current || "나"] ?? myCoins;
        setGs(null);
        setDrawnCard(null);
        setSelId(null);
        setDiscardingId(null);
        startTournamentRound(round, config.leagueId, currentCoins);
      } else {
        reset();
      }
      return;
    }

    const wasTeam = g.teamMode || false;
    if (!roomCodeRef.current) {
      const rawPl = g.players.map((p: any) => ({
        name: p.name,
        emoji: p.emoji,
        isAI: p.isAI,
        portraitName: p.portraitName,
        profile: p.profile,
      }));
      const coins: any = {};
      Object.keys(g.coins).forEach(
        (k) => (coins[k] = Math.max(0, g.coins[k] || 0))
      );
      const lg = lgRef.current;
      const players = refreshBrokeAI(rawPl, coins, lg.bet);
      players.forEach((p: any) => {
        if (p.isAI && !coins[p.name]) coins[p.name] = Math.max(lg.bet * 6, 300);
      });
      const wi = players.findIndex((p: any) => p.name === g.winner);
      setGs(null);
      setDrawnCard(null);
      setSelId(null);
      setDiscardingId(null);
      const newGs = wasTeam
        ? initGsTeam(
            players,
            coins,
            wi >= 0 ? wi : 0,
            lg.bet,
            lg.id,
            g.wildRule
          )
        : initGs(players, coins, wi >= 0 ? wi : 0, lg.bet, lg.id, g.wildRule);
      newGs._seq = (g._seq || 0) + 1;
      setGs(newGs);
      setScreen("game");
      return;
    }
    if (waitingForNextRef.current) return;
    const myPlayerName = g.players[myIdxRef.current]?.name;
    if (!myPlayerName) return;
    const safeKey = myPlayerName.replace(/[.#$[\]/]/g, "_");
    setWaitingForNext(true);
    waitingForNextRef.current = true;
    try {
      await db.update("rooms/" + roomCodeRef.current + "/nextReady", {
        [safeKey]: true,
      });
    } catch (e) {
      setWaitingForNext(false);
      waitingForNextRef.current = false;
    }
  }, []);

  const rerollAI = () => {
    if (!gs || roomCodeRef.current) return;
    clearTimeout(aiRef.current);
    setAiThinking(null);
    const lg = lgRef.current,
      wasTeam = gs.teamMode || false;
    const tr = pickTrainers(3, myProfile.trainerId);
    const pl = [
      {
        name: myName || gs.players[0].name,
        emoji: "😊",
        isAI: false,
        id: 0,
        portraitName: myProfile.trainerId || undefined,
        profile: {
          title: myProfile.title || null,
          badge: myProfile.badge || null,
          borderStyle: myProfile.borderStyle || "none",
        },
      },
      ...tr.map((t: any, i: number) => ({
        name: t.n + " (AI)",
        emoji: t.e,
        isAI: true,
        id: i + 1,
        portraitName: t.n,
      })),
    ];
    const coins = buildCoins(pl);
    coins[pl[0].name] = gs.coins[gs.players[0].name] || 300;
    goRoulette(pl, coins, null, wasTeam);
  };

  const createRoom = async () => {
    if (useFrontierForRoom) {
      const rule = selectWildRule(true);
      battleFrontierRuleRef.current = rule;
      setBattleFrontierRule(rule);
      isBattleFrontierGameRef.current = true;
    } else {
      battleFrontierRuleRef.current = null;
      setBattleFrontierRule(null);
      isBattleFrontierGameRef.current = false;
    }
    if (betAmount > myCoins) {
      setRoomErr(`코인이 부족해요. (보유: ${myCoins}, 판돈: ${betAmount})`);
      return;
    }
    const n = Math.max(2, pCount),
      code = randCode();
    const me = {
      name: myName || "나",
      emoji: "😊",
      portraitName: myProfile.trainerId || undefined,
      coins: myCoins,
      profile: {
        title: myProfile.title || null,
        badge: myProfile.badge || null,
        borderStyle: myProfile.borderStyle || "none",
      },
    };
    const finalTitle = roomTitle.trim() || (myName || "나") + "의 방";
    const rd = {
      code,
      maxHumans: n,
      host: myName || "나",
      title: finalTitle,
      humans: [me],
      gs: null,
      status: "waiting",
      isPublic: isPublicRoom,
      bet: betAmount,
    };
    setRoomCode(code);
    setRoomData(rd);
    setMyIdx(0);
    setRoomErr("⏳ 방 생성 중...");
    try {
      await db.set("rooms/" + code, rd);
      if (beforeUnloadHandlerRef.current)
        window.removeEventListener(
          "beforeunload",
          beforeUnloadHandlerRef.current
        );
      const h = () =>
        fetch(
          `https://yeongje-pocketchallenge-default-rtdb.firebaseio.com/rooms/${code}.json`,
          { method: "DELETE", keepalive: true }
        ).catch(() => {});
      beforeUnloadHandlerRef.current = h;
      window.addEventListener("beforeunload", h);
      setRoomErr("");
      transitioningFromWaitRef.current = false;
      setScreen("room_wait");
    } catch (e) {
      setRoomErr("⚠️ 방 생성 실패");
    }
  };

  const joinRoom = async () => {
    const code = joinInput.trim().toUpperCase();
    if (!code) {
      setRoomErr("방 코드를 입력하세요.");
      return;
    }
    setRoomErr("⏳ 접속 중...");
    try {
      const preCheck: any = await db.get("rooms/" + code);
      if (!preCheck) {
        setRoomErr("방을 찾을 수 없어요.");
        return;
      }
      if ((preCheck.bet || 0) > myCoins) {
        setRoomErr(
          `코인이 부족해요. (필요: ${preCheck.bet}코인, 보유: ${myCoins}코인)`
        );
        return;
      }
      let joinErr = "",
        joinedRd: any = null;
      await db.transaction("rooms/" + code, (current: any) => {
        if (!current) {
          joinErr = "방을 찾을 수 없어요.";
          return undefined;
        }
        if (current.status !== "waiting") {
          joinErr = "이미 시작된 방이에요.";
          return undefined;
        }
        const humans = current.humans || [];
        if (humans.length >= current.maxHumans) {
          joinErr = "방이 꽉 찼어요.";
          return undefined;
        }
        if (humans.some((h: any) => h.name === myName)) {
          joinErr = "이미 이 방에 참가 중인 닉네임이에요.";
          return undefined;
        }
        const emoji = ["🙂", "😎", "🤩", "😏", "🥳"][humans.length] || "😊";
        const me = {
          name: myName || "나",
          emoji,
          portraitName: myProfile.trainerId || undefined,
          coins: myCoins,
          profile: {
            title: myProfile.title || null,
            badge: myProfile.badge || null,
            borderStyle: myProfile.borderStyle || "none",
          },
        };
        joinedRd = { ...current, humans: [...humans, me] };
        return joinedRd;
      });
      if (joinErr) {
        setRoomErr(joinErr);
        return;
      }
      if (!joinedRd) {
        setRoomErr("⚠️ 접속 오류");
        return;
      }
      setRoomCode(code);
      setRoomData(joinedRd);
      setMyIdx(joinedRd.humans.length - 1);
      setRoomErr("");
      transitioningFromWaitRef.current = false;
      setScreen("room_wait");
    } catch (e) {
      setRoomErr("⚠️ 접속 오류");
    }
  };

  const hostStart = async () => {
    if (!roomData) return;
    incGames();
    const wi = Math.floor(Math.random() * 4),
      bet = roomData.bet || 30;
    const tr = pickTrainers(4 - roomData.humans.length);
    const pl = [
      ...roomData.humans.map((h: any, i: number) => ({
        ...h,
        id: i,
        isAI: false,
      })),
      ...tr.map((t: any, ti: number) => ({
        name: t.n + " (AI)",
        emoji: t.e,
        isAI: true,
        id: roomData.humans.length + ti,
        portraitName: t.n,
      })),
    ];
    const coins = buildCoins(pl);
    await Promise.all(
      pl.map(async (p: any) => {
        if (p.isAI) return;
        try {
          const key = encodeURIComponent(p.name).replace(/%/g, "_");
          const userData: any = await db.get(`users/${key}`);
          if (userData?.coins != null)
            coins[p.name] = Math.max(bet, userData.coins);
          else {
            const h = roomData.humans.find((h: any) => h.name === p.name);
            coins[p.name] = Math.max(bet, h?.coins || 300);
          }
        } catch {
          const h = roomData.humans.find((h: any) => h.name === p.name);
          coins[p.name] = Math.max(
            bet,
            (h?.coins || 300) <= 0 ? bet : h?.coins || 300
          );
        }
      })
    );
    const lg = lgRef.current;
    const g = initGs(pl, coins, wi, bet, lg.id, battleFrontierRuleRef.current);
    const upd = { ...roomData, gs: g, status: "roulette", rouletteWinner: wi };
    try {
      await db.set("rooms/" + roomCode, upd);
      setRoomData(upd);
      setGs(g);
      if (Object.keys(images).length > 0 || Object.keys(tImgs).length > 0)
        uploadRoomAssets(roomCode, images, tImgs, customTrainers).catch(
          () => {}
        );
      if (battleFrontierRuleRef.current) {
        setPendingPlayers(pl);
        setPendingCoins(coins);
        setRoulettePreset(wi);
        setPendingTeamMode(false);
        setLoading(true);
        transitioningFromWaitRef.current = true;
        setTimeout(() => {
          setLoading(false);
          setShowWildReveal(true);
        }, 600);
      } else {
        transitioningFromWaitRef.current = true;
        goRoulette(pl, coins, wi, false);
      }
    } catch (e) {
      setRoomErr("⚠️ 게임 시작 실패");
    }
  };

  const drawDeck = (e?: any) => {
    if (!gs || gs.winner || gs.cur !== myIdx || gs.phase !== "draw") return;
    playerTurnCountRef.current++;
    playerDeckDrawsRef.current++;
    const g = JSON.parse(JSON.stringify(gs));
    g._seq = (g._seq || 0) + 1;
    const groups = (
      LEAGUES.find((l: any) => l.id === (g.leagueId || "kanto")) || LEAGUES[0]
    ).groups;
    if (g.deck.length <= 1) reshuffleDeck(g);
    if (!g.deck.length) return;
    const card = g.deck.shift(),
      nine = [...g.players[myIdx].hand, card];
    if (checkWin(nine, g.wildRule)) {
      g.players[myIdx].hand = sortHand(nine, groups);
      applyWinner(g, g.players[myIdx].name);
      setGs(g);
      if (roomCode) pushGs(g);
      return;
    }
    g.phase = "discard";
    setGs(g);
    setDrawnCard(card);
    setDrawnKey((k) => k + 1);
    setSelId(null);
    if (roomCode) pushGs(g);
    SE.draw();
    spawnEffect("draw", e?.currentTarget);
  };

  const drawDiscard = (pid: number) => {
    if (!gs || gs.winner || gs.cur !== myIdx || gs.phase !== "draw") return;
    if (gs.wildRule === "no_discard") return;
    playerTurnCountRef.current++;
    const g = JSON.parse(JSON.stringify(gs));
    g._seq = (g._seq || 0) + 1;
    const groups = (
      LEAGUES.find((l: any) => l.id === (g.leagueId || "kanto")) || LEAGUES[0]
    ).groups;
    const p = g.players[pid];
    if (!p || (p.discardPile || []).length === 0) return;
    const card = p.discardPile.shift(),
      nine = [...g.players[myIdx].hand, card];
    if (checkWin(nine, g.wildRule)) {
      g.players[myIdx].hand = sortHand(nine, groups);
      applyWinner(g, g.players[myIdx].name);
      setGs(g);
      if (roomCode) pushGs(g);
      return;
    }
    g.phase = "discard";
    setGs(g);
    setDrawnCard(card);
    setDrawnKey((k) => k + 1);
    setSelId(null);
    if (roomCode) pushGs(g);
    SE.pickDiscard();
  };

  const discardById = (cardId: any, el?: any) => {
    if (!gs || gs.winner || gs.cur !== myIdx || gs.phase !== "discard") return;
    const drawn = drawnCardRef.current;
    if (!drawn) return;
    spawnEffect("discard", el);
    setDiscardingId(cardId);
    setTimeout(() => {
      setDiscardingId(null);
      const g = JSON.parse(JSON.stringify(gsRef.current));
      if (!g || g.winner || g.cur !== myIdxRef.current || g.phase !== "discard")
        return;
      g._seq = (g._seq || 0) + 1;
      const me = g.players[myIdxRef.current];
      const groups = (
        LEAGUES.find((l: any) => l.id === (g.leagueId || "kanto")) || LEAGUES[0]
      ).groups;
      if (cardId === drawn.id) {
        (me.discardPile = me.discardPile || []).unshift(drawn);
      } else {
        const nine = [...me.hand, drawn];
        const idx = nine.findIndex((c: any) => c.id === cardId);
        if (idx < 0) return;
        const disc = nine.splice(idx, 1)[0];
        (me.discardPile = me.discardPile || []).unshift(disc);
        me.hand = sortHand(nine, groups);
        if (checkWin(me.hand, g.wildRule)) {
          applyWinner(g, me.name);
          setGs(g);
          setDrawnCard(null);
          setSelId(null);
          if (roomCode) pushGs(g);
          return;
        }
        const maxSetsRule = g.wildRule === "4set" ? 4 : 3;
        const newCount = (findSets(me.hand, maxSetsRule) || []).length;
        if (newCount > prevSetCount.current) {
          spawnEffect("set", el);
          SE.setComplete();
          gameSetsRef.current += newCount - prevSetCount.current;
          const curSets = findSets(me.hand, maxSetsRule) || [];
          const curJokerSets = curSets.filter((s: any[]) =>
            s.some((c: any) => c.isJoker)
          ).length;
          if (curJokerSets > prevJokerSetCountRef.current) {
            gameJokerSetsRef.current +=
              curJokerSets - prevJokerSetCountRef.current;
          }
          prevJokerSetCountRef.current = curJokerSets;
        }
        prevSetCount.current = newCount;
      }
      setDrawnCard(null);
      setSelId(null);
      g.phase = "draw";
      g.cur = (g.cur + 1) % g.players.length;
      g.turnStartedAt = Date.now();
      setGs(g);
      if (roomCode) pushGs(g);
    }, 220);
    try {
      SE.discard();
    } catch (e) {}
  };

  const useShowdown = () => {
    if (isTournamentGameRef.current) return;
    if (!gs || gs.winner || gs.cur !== myIdx || gs.phase !== "discard") return;
    const me = gs.players[myIdx],
      sd = gs.sdAmount || SD_DEFAULT;
    if (gs.showdownUsed[me.name] || (gs.coins[me.name] || 0) < sd) return;
    if (playerTurnCountRef.current <= 1) playerSdTurn1Ref.current = true;
    const g = JSON.parse(JSON.stringify(gs));
    g._seq = (g._seq || 0) + 1;
    g.coins[me.name] -= sd;
    g.pot += sd;
    g.showdownUsed[me.name] = true;
    setGs(g);
    if (roomCode) pushGs(g);
    SE.showdown();
    setShowdownAnim({ name: me.name, key: Date.now() });
    setTimeout(() => setShowdownAnim(null), 2000);
  };

  const handleCardTap = (cardId: any, el?: any) => {
    if (!gs || gs.phase !== "discard" || gs.cur !== myIdx) return;
    const now = Date.now(),
      last = lastTapRef.current;
    if (last.id === cardId && now - last.time < 450) {
      lastTapRef.current = { id: null, time: 0 };
      setSelId(cardId);
      discardById(cardId, el);
    } else {
      lastTapRef.current = { id: cardId, time: now };
      setSelId((prev: any) => (prev === cardId ? null : cardId));
      try {
        SE.select();
      } catch (e) {}
    }
  };

  const useEmoteAction = async (eid: string, imgUrl?: string) => {
    const item = SHOP_ITEMS.find((i: any) => i.id === eid);
    const url = imgUrl || ownedEmotes.find((e) => e.id === eid)?.imgUrl || null;
    const display = url || item?.emoji || "😊";
    setShowEmotePicker(false);
    setActiveEmotes((p: any) => ({ ...p, [myIdx]: display }));
    setTimeout(
      () =>
        setActiveEmotes((p: any) => {
          const n = { ...p };
          delete n[myIdx];
          return n;
        }),
      3000
    );
    if (roomCode)
      await db
        .update("rooms/" + roomCode + "/emotes", {
          [myIdx]: { e: eid, img: url, ts: Date.now() },
        })
        .catch(() => {});
  };

  const handleLogin = (user: any) => {
    localStorage.setItem("pks_nickname", user.nickname);
    setMyName(user.nickname);
    myNameRef.current = user.nickname;
    setMyProfile((prev: any) => ({ ...prev, name: user.nickname }));
    setMyCoins(Math.max(0, user.coins ?? 300));
    localStorage.setItem(
      "pokeset_sealdex",
      JSON.stringify(
        user.sealDex && Object.keys(user.sealDex).length > 0 ? user.sealDex : {}
      )
    );
    setLoggedIn(true);
    if (user.isNew) setShowOnboarding(true);
    setEventProg((prev: any) => {
      const next = onDailyLogin(prev);
      saveEventProgress(next);
      return next;
    });

    (async () => {
      try {
        const att = user.attendance ?? {};
        const serverDays = Array.isArray(att.loginDays)
          ? att.loginDays.length
          : typeof att.streak === "number"
          ? att.streak
          : 0;
        const localAtt = JSON.parse(
          localStorage.getItem("pokeset_attendance") || "{}"
        );
        const localDays = Array.isArray(localAtt.loginDays)
          ? localAtt.loginDays.length
          : typeof localAtt.streak === "number"
          ? localAtt.streak
          : 0;
        if (serverDays < 999 && localDays < 999) return;

        const userId = getPlayerUid();
        const result = await sendLetterOnce(userId, "thankyou_v1", {
          type: LETTER_TYPE.SYSTEM,
          title: "트레이너님께 드리는 감사 인사 💌",
          body: `${user.nickname} 트레이너님!

아직 부족한 프로토타입인데도
꾸준히 접속해서 플레이해 주셔서
정말 감사합니다. 🙏

버그도 있고 불편한 점도 많았을 텐데
그럼에도 함께해 주신 덕분에
큰 힘이 됐습니다.

재밌게 즐겨주셔서 감사합니다! ⚡`,
          sender: "PokéSet",
          rewards: { coins: 10000 },
        });
        if (result?.sent) {
          setMailboxUnread((n: number) => n + 1);
        }
      } catch (e) {
        console.error("thankyou letter send:", e);
      }
    })();
  };

  const handleOnboardingComplete = ({ nickname, trainerId }: any) => {
    setMyName(nickname);
    myNameRef.current = nickname;
    setMyProfile((prev: any) => ({ ...prev, name: nickname, trainerId }));
    persistImgs("pks_profile", { name: nickname, trainerId });
    localStorage.setItem("pks_onboarded", "1");
    setShowOnboarding(false);
    setShowInteractiveTutorial(true);
  };

  const saveCoinsToCloud = async (coins: number) => {
    const nick = localStorage.getItem("pks_nickname");
    if (!nick) return;
    await saveUserData(nick, { coins });
  };
  const handleSpendCoins = (amount: number) => {
    const next = Math.max(0, myCoins - amount);
    setAndSaveCoins(next);
  };

  const hostForceStart = useCallback(async () => {
    const code = roomCodeRef.current;
    if (!gsRef.current?.winner || !code) return;
    const rd: any = await db.get("rooms/" + code).catch(() => null);
    if (!rd || rd.host !== myNameRef.current) return;
    if (nextGameStartingRef.current) return;
    const g = gsRef.current,
      currentSeq = g._seq || 0;
    if (handledSeqRef.current >= currentSeq) return;
    nextGameStartingRef.current = true;
    handledSeqRef.current = currentSeq;
    clearTimeout(aiRef.current);
    setAiThinking(null);
    setShowdownAnim(null);
    setAutoStartAt(null);
    db.update("rooms/" + code, { autoStartAt: null }).catch(() => {});
    if (nextReadyTimeoutRef.current) {
      clearTimeout(nextReadyTimeoutRef.current);
      nextReadyTimeoutRef.current = null;
    }
    const wasTeam = g.teamMode || false;
    const rawPl = g.players.map((p: any) => ({
      name: p.name,
      emoji: p.emoji,
      isAI: p.isAI,
      portraitName: p.portraitName,
      profile: p.profile,
    }));
    const coins: any = {};
    Object.keys(g.coins).forEach((k) => {
      coins[k] = Math.max(0, g.coins[k] || 0);
    });
    const bet = g.bet || lgRef.current.bet,
      leagueId = g.leagueId || lgRef.current.id;
    const humanPl = g.players.filter((p: any) => !p.isAI);
    const humanNames =
      rd?.humans?.length > 0
        ? rd.humans.map((h: any) => h.name)
        : humanPl.map((p: any) => p.name);
    let players = refreshBrokeAI(rawPl, coins, bet);
    players.forEach((p: any) => {
      if (p.isAI && !coins[p.name]) coins[p.name] = Math.max(bet * 6, 300);
    });
    players = players.map((p: any) =>
      !p.isAI && !humanNames.includes(p.name) ? { ...p, isAI: true } : p
    );
    const wi = players.findIndex((p: any) => p.name === g.winner);
    const newGs = wasTeam
      ? initGsTeam(players, coins, wi >= 0 ? wi : 0, bet, leagueId, g.wildRule)
      : initGs(players, coins, wi >= 0 ? wi : 0, bet, leagueId, g.wildRule);
    newGs._seq = currentSeq + 1;
    db.update("rooms/" + code, {
      gs: newGs,
      status: "playing",
      nextReady: null,
      autoStartAt: null,
    })
      .then(() => {
        setWaitingForNext(false);
        waitingForNextRef.current = false;
        setNextReadyMap({});
        setDrawnCard(null);
        setSelId(null);
        setDiscardingId(null);
        setGs(newGs);
      })
      .catch(() => {
        nextGameStartingRef.current = false;
        handledSeqRef.current = currentSeq - 1;
      });
  }, []);

  useEffect(() => {
    hostForceStartRef.current = hostForceStart;
  }, [hostForceStart]);

  const handleFreeCharge = useCallback(async () => {
    if (freeChargeRef.current) return;
    const nick = localStorage.getItem("pks_nickname");
    if (!nick) return;
    freeChargeRef.current = true;
    try {
      const next = myCoins + 100;
      setMyCoins(next);
      persistCoins(next);
      await saveUserData(nick, { coins: next }).catch(() => {});
      showToast("🎁 +100코인 충전 완료!", "#14532d");
    } catch {
    } finally {
      if (freeChargeTimerRef.current) clearTimeout(freeChargeTimerRef.current);
      freeChargeTimerRef.current = setTimeout(() => {
        freeChargeRef.current = false;
        freeChargeTimerRef.current = null;
      }, 1000);
    }
  }, [myCoins]);

  const toggleBGM = () => {
    if (mutedBGM) {
      SE.unmuteBGM();
      setMutedBGM(false);
    } else {
      SE.muteBGM();
      setMutedBGM(true);
    }
  };
  const toggleSFX = () => {
    if (mutedSFX) {
      SE.unmuteSFX();
      setMutedSFX(false);
    } else {
      SE.muteSFX();
      setMutedSFX(true);
    }
  };
  const toggleMuteAll = () => {
    if (mutedBGM && mutedSFX) {
      SE.unmuteBGM();
      SE.unmuteSFX();
      setMutedBGM(false);
      setMutedSFX(false);
    } else {
      SE.muteBGM();
      SE.muteSFX();
      setMutedBGM(true);
      setMutedSFX(true);
    }
  };

  const curSd = gs?.sdAmount || SD_DEFAULT;

  const overlays = (
    <>
      {showTutorial && (
        <InteractiveTutorial
          images={images}
          tImgs={tImgs}
          onComplete={() => {
            setShowTutorial(false);
            tryShowBreadTutorial();
          }}
          onSkip={() => {
            setShowTutorial(false);
            tryShowBreadTutorial();
          }}
        />
      )}
      {showLobbyRules && (
        <RulesModal onClose={() => setShowLobbyRules(false)} sdAmt={curSd} />
      )}
      {showTeamRules && (
        <TeamRulesModal onClose={() => setShowTeamRules(false)} />
      )}
      {showLeagueModal && (
        <LeagueModal
          coins={myCoins}
          wins={myWins}
          onSelect={confirmLeague}
          onClose={() => setShowLeagueModal(false)}
        />
      )}
      {showInventory && (
        <InventoryModal
          emoteLoadout={emoteLoadout}
          setEmoteLoadout={setEmoteLoadout}
          onClose={() => setShowInventory(false)}
        />
      )}
      {showShop && (
        <ShopModal
          myName={myName}
          myCoins={myCoins}
          setMyCoins={setMyCoins}
          onApplyBg={(type: string, url: any) => {
            if (type === "lobby_bg") setLobbyBg(url);
            else setGameBg(url);
          }}
          onApplySounds={(s: any) => {
            if (s)
              setSounds((prev: any) => {
                const m = { ...prev, ...s };
                SE.load(m);
                SE.startBGM();
                return m;
              });
            else
              setSounds((prev: any) => {
                const n = { ...prev };
                delete n.bgm;
                SE.load(n);
                return n;
              });
          }}
          onClose={() => setShowShop(false)}
        />
      )}
      {showLeaderboard && (
        <LeaderboardModal
          myName={myName}
          tImgs={tImgs}
          onOpen={() => {
            const nick = localStorage.getItem("pks_nickname");
            if (nick) {
              const dex = JSON.parse(
                localStorage.getItem("pokeset_sealdex") || "{}"
              );
              saveLeaderboard(nick, myCoins, dex, profilePatch());
            }
          }}
          onClose={() => setShowLeaderboard(false)}
          onEarnCoins={(amount: number) => {
            const next = myCoins + amount;
            setMyCoins(next);
            persistCoins(next);
            const nick = localStorage.getItem("pks_nickname");
            if (nick) saveUserData(nick, { coins: next });
            setEventProg((prev: any) => {
              const next2 = onLikeGiven(prev);
              saveEventProgress(next2);
              return next2;
            });
          }}
        />
      )}
      {showProfile && myProfile && (
        <ProfileEditor
          profile={{ ...myProfile, wins: myWins, stats: myStats }}
          tImgs={tImgs}
          onSave={(prof: any) => {
            saveProfile(prof);
            setShowProfile(false);
          }}
          onClose={() => setShowProfile(false)}
          onShowFeaturedSeal={() => setShowFeaturedSeal(true)}
        />
      )}
      {showSealDex && (
        <SealDexModal
          onClose={() => setShowSealDex(false)}
          onRevealShiny={(seal: any) => {
            setRevealSeals([seal]);
            setRevealIsClaim(false);
            setShowShinyReveal(true);
          }}
        />
      )}
      {showDailyMissions && (
        <DailyMissionsModal
          freeBreadCount={freeBreadCount}
          freePremiumBreadCount={freePremiumBreadCount}
          onClaimBread={(count: number) => {
            addFreeBread(count);
            setMissionBadge(hasUnclaimedMissions());
          }}
          onClaimPremiumBread={() => {
            addPremiumFreeBread();
            setMissionBadge(hasUnclaimedMissions());
          }}
          onClaimCoins={(coins: number) => {
            setMyCoins((prev: number) => {
              const next = prev + coins;
              persistCoins(next);
              const nick = localStorage.getItem("pks_nickname");
              if (nick) saveUserData(nick, { coins: next }).catch(() => {});
              return next;
            });
          }}
          onClose={() => {
            setShowDailyMissions(false);
            setMissionBadge(hasUnclaimedMissions());
            setEventProg((prev: any) => {
              const next = onMissionComplete(prev);
              saveEventProgress(next);
              return next;
            });
          }}
        />
      )}
      {showFeaturedSeal && (
        <FeaturedSealModal
          currentSealIds={myProfile.featuredSealIds ?? []}
          onSelect={handleSetFeaturedSeal}
          onClose={() => setShowFeaturedSeal(false)}
        />
      )}
      {showAttendance && (
        <AttendanceModal
          onClaim={(coins, bread, premiumBread, holoSeal) => {
            if (coins > 0) {
              const next = myCoins + coins;
              setMyCoins(next);
              persistCoins(next);
              saveCoinsToCloud(next);
            }
            if (bread > 0) addFreeBread(bread);
            if (premiumBread > 0) addPremiumFreeBread();
            if (holoSeal) {
              const holoPool = (ALL_SEALS as any[]).filter(
                (s) => s.grade === "HOLO"
              );
              const pool =
                holoPool.length > 0 ? holoPool : (ALL_SEALS as any[]);
              if (pool.length > 0) {
                const picked = pool[Math.floor(Math.random() * pool.length)];
                const dex = JSON.parse(
                  localStorage.getItem("pokeset_sealdex") || "{}"
                );
                const key = String(picked.id);
                dex[key] = {
                  count: (dex[key]?.count || 0) + 1,
                  shards: dex[key]?.shards || 0,
                };
                saveSealDex(dex);
                window.dispatchEvent(new Event("pokeset_dex_updated"));
                const nick = localStorage.getItem("pks_nickname");
                if (nick) cloudSave({ sealDex: dex });
              }
            }
            setAttendanceBadge(false);
          }}
          onClose={() => {
            setShowAttendance(false);
            setAttendanceBadge(hasAttendanceBadge());
          }}
        />
      )}
      {showTournament && (
        <TournamentModal
          myCoins={myCoins}
          winW={winW}
          onClose={() => setShowTournament(false)}
          onStartRound={handleStartTournamentRound}
          onBuyTicket={handleBuyTournamentTicket}
          onClaimReward={
            pendingShinySeals.length > 0
              ? () => {
                  setRevealSeals([...pendingShinySeals]);
                  setRevealIsClaim(true);
                  setShowTournament(false);
                  setShowShinyReveal(true);
                }
              : undefined
          }
        />
      )}
      {showShinyReveal && revealSeals.length > 0 && (
        <ShinyRevealModal
          seals={revealSeals}
          onDone={() => {
            setShowShinyReveal(false);
            setRevealSeals([]);
            if (revealIsClaim) {
              setPendingShinySeals([]);
              localStorage.removeItem("pokeset_pending_shinies");
              setRevealIsClaim(false);
            }
          }}
        />
      )}
      {showEvent && (
        <EventModal
          winW={winW}
          onClose={() => setShowEvent(false)}
          onClaimReward={(capSeal: any) => {
            const capDex = loadCapDex();
            capDex[capSeal.id] = {
              count: (capDex[capSeal.id]?.count || 0) + 1,
            };
            saveCapDex(capDex);
            window.dispatchEvent(new Event("pokeset_cap_dex_updated"));

            const nick = localStorage.getItem("pks_nickname");
            if (nick) saveUserData(nick, { capDex });

            const sealWithArtwork = { ...capSeal };
            setRevealSeals([sealWithArtwork]);
            setRevealIsClaim(false);
            setShowEvent(false);
            setShowShinyReveal(true);
            showToast(`🎒 ${capSeal.name} 획득!`, "#ffd700");
          }}
          onClaimFullReward={() => {
            const next = myCoins + 500;
            setMyCoins(next);
            persistCoins(next);
            const nick = localStorage.getItem("pks_nickname");
            if (nick) saveUserData(nick, { coins: next });
            const shinySeal = giveRandomShinySeal();
            if (shinySeal) {
              setPendingShinySeals((prev: any[]) => {
                const arr = [...prev, shinySeal];
                localStorage.setItem(
                  "pokeset_pending_shinies",
                  JSON.stringify(arr)
                );
                return arr;
              });
            }
            showToast("🎉 전부 달성! 코인 +500 & 이로치씰 1장!", "#a0f4ff");
          }}
        />
      )}

      {showExitConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1030,
            fontFamily: "system-ui,sans-serif",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: "28px 32px",
              textAlign: "center",
              width: 300,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚪</div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 18,
                color: "#1e1b4b",
                marginBottom: 8,
              }}
            >
              게임을 나가시겠어요?
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
              {isTournamentGameRef.current && !roomCodeRef.current
                ? "⚠️ 토너먼트 진행 중 나가면 패배 처리됩니다!"
                : roomCode
                ? "방에서 나가면 AI가 대신 플레이해요."
                : "진행 중인 게임이 종료돼요."}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  if (gs) {
                    const n = gs.players[myIdx]?.name;
                    const c = gs.coins[n];
                    if (c != null) {
                      const safeC = Math.max(0, c);
                      setMyCoins(safeC);
                      persistCoins(safeC);
                      const dex = JSON.parse(
                        localStorage.getItem("pokeset_sealdex") || "{}"
                      );
                      const nick = localStorage.getItem("pks_nickname");
                      if (nick)
                        saveLeaderboard(nick, safeC, dex, {
                          ...profilePatch(),
                          displayName: n,
                        });
                      else saveLeaderboard(n, safeC, dex, profilePatch());
                    }
                  }
                  if (isTournamentGameRef.current && !roomCodeRef.current) {
                    loseRound();
                    pendingShowTournamentRef.current = true;
                  }
                  setShowExitConfirm(false);
                  reset();
                }}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#EF4444,#DC2626)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                나가기
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 10,
                  border: "1px solid #D1D5DB",
                  background: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  color: "#374151",
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      {showPocketFestival && (
        <PocketFestivalModal
          onClose={() => setShowPocketFestival(false)}
          onGameEnd={async (gameId: string, score: number) => {
            const userId = getPlayerUid();
            const nickname =
              myProfile?.nickname ?? myProfile?.name ?? "트레이너";
            await uploadGameScore(gameId, userId, nickname, score);
          }}
          myProfile={myProfile}
          onShowLeaderboard={() => setShowMiniGameLeaderboard(true)}
        />
      )}
      {showMailbox && (
        <MailboxModal
          myProfile={myProfile}
          winW={winW}
          onClose={() => {
            setShowMailbox(false);
            const userId = getPlayerUid();
            getMailboxUnreadCount(userId).then(setMailboxUnread);
          }}
          onClaimReward={async ({
            seals,
            titles,
            coins,
            letterTitle,
          }: {
            seals: string[];
            titles: string[];
            coins: number;
            letterTitle: string;
          }) => {
            const nickname = myProfile?.nickname ?? myProfile?.name;

            const normalSealIds = (seals ?? []).filter((id) =>
              /^\d+$/.test(id)
            );
            const eventSealIds = (seals ?? []).filter(
              (id) => !/^\d+$/.test(id)
            );

            const newSeals = [
              ...(myProfile?.miniGameSeals ?? []),
              ...eventSealIds,
            ];
            const newTitles = [
              ...(myProfile?.miniGameTitles ?? []),
              ...(titles ?? []),
            ];
            setMyProfile((prev: any) => ({
              ...prev,
              miniGameSeals: newSeals,
              miniGameTitles: newTitles,
            }));

            if (normalSealIds.length > 0) {
              const dex = JSON.parse(
                localStorage.getItem("pokeset_sealdex") || "{}"
              );
              normalSealIds.forEach((id) => {
                dex[id] = {
                  count: (dex[id]?.count ?? 0) + 1,
                  shards: dex[id]?.shards ?? 0,
                };
              });
              localStorage.setItem("pokeset_sealdex", JSON.stringify(dex));
              window.dispatchEvent(new Event("pokeset_dex_updated"));
              if (nickname) {
                const key = encodeURIComponent(nickname).replace(/%/g, "_");
                db.update(`users/${key}`, { sealDex: dex }).catch(() => {});
              }
            }

            // ★ FIX: 코스프레 씰(이벤트 씰)도 capDex 에 저장
            //   (씰도감 → 🎒 이벤트 탭 → ✨ 코스프레 피카츄 섹션에 표시됨)
            if (eventSealIds.length > 0) {
              const capDex = loadCapDex();
              eventSealIds.forEach((id) => {
                capDex[id] = {
                  count: (capDex[id]?.count ?? 0) + 1,
                };
              });
              saveCapDex(capDex);
              window.dispatchEvent(new Event("pokeset_cap_dex_updated"));
              if (nickname) {
                const key = encodeURIComponent(nickname).replace(/%/g, "_");
                db.update(`users/${key}`, { capDex }).catch(() => {});
              }
            }

            if (nickname) {
              await saveUserData(nickname, {
                miniGameSeals: newSeals,
                miniGameTitles: newTitles,
              });
            }
            if ((coins ?? 0) > 0) {
              // ★ FIX: Firebase 동기화 포함된 setAndSaveCoins 사용
              //   (이전 코드는 로컬에만 저장돼서 새로고침 시 코인 사라짐)
              await setAndSaveCoins(myCoins + coins);
            }
            setClaimToast({
              seals: seals ?? [],
              titles: titles ?? [],
              coins: coins ?? 0,
              letterTitle,
            });
            setTimeout(() => setClaimToast(null), 3500);
          }}
        />
      )}
      {showMyHome && (
        <MyHomeScreen
          myProfile={myProfile}
          myCoins={myCoins}
          onClose={() => setShowMyHome(false)}
          onSpendCoins={(amount: number) => {
            setMyCoins((p: number) => {
              const n = p - amount;
              persistCoins(n);
              return n;
            });
          }}
          onEarnCoins={(amount: number) => {
            setMyCoins((p: number) => {
              const n = p + amount;
              persistCoins(n);
              return n;
            });
          }}
          onAddSeal={(dotSealId: string, pokeId: number) => {
            setMyProfile((prev: any) => {
              const newSeals = [...(prev?.miniGameSeals ?? []), dotSealId];
              if (prev?.nickname) {
                const key = encodeURIComponent(prev.nickname.trim()).replace(
                  /%/g,
                  "_"
                );
                db.update(`users/${key}`, { miniGameSeals: newSeals }).catch(
                  () => {}
                );
              }
              return { ...prev, miniGameSeals: newSeals };
            });
          }}
        />
      )}
      {/* ── 어드민 패널 (★ 분리된 컴포넌트) ── */}
      {showAdminPanel && (myName || "").toLowerCase() === "admin" && (
        <AdminPanel
          myName={myName}
          myCoins={myCoins}
          myProfile={myProfile}
          setMyCoins={setMyCoins}
          setMyWins={setMyWins}
          setMyStats={setMyStats}
          setMyProfile={setMyProfile}
          myWinsRef={myWinsRef}
          myStatsRef={myStatsRef}
          setPendingShinySeals={setPendingShinySeals}
          setRevealSeals={setRevealSeals}
          setRevealIsClaim={setRevealIsClaim}
          setShowShinyReveal={setShowShinyReveal}
          setMailboxUnread={setMailboxUnread}
          setAndSaveCoins={setAndSaveCoins}
          showToast={showToast}
          onClose={() => setShowAdminPanel(false)}
        />
      )}
      {showFeedback && (
        <FeedbackModal
          myProfile={myProfile}
          myName={myName}
          page={screen}
          onClose={() => setShowFeedback(false)}
        />
      )}

      {showMiniGameLeaderboard && (
        <MiniGameLeaderboardModal
          myProfile={myProfile}
          onClose={() => setShowMiniGameLeaderboard(false)}
        />
      )}
      {claimToast && (
        <div
          onClick={() => setClaimToast(null)}
          style={{
            position: "fixed",
            bottom: 88,
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg,#0a001a,#1a0030)",
            border: "2px solid rgba(251,191,36,0.55)",
            borderRadius: 22,
            padding: "16px 22px",
            zIndex: 400,
            cursor: "pointer",
            minWidth: 250,
            boxShadow: "0 12px 40px rgba(251,191,36,0.2)",
            animation: "claimToastIn 0.4s cubic-bezier(.34,1.56,.64,1)",
            fontFamily: "system-ui,sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: "#fcd34d",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            ✅ 보상 수령 완료
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
            }}
          >
            {claimToast.letterTitle}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginTop: 8,
              flexWrap: "wrap",
            }}
          >
            {claimToast.seals?.map((id) => (
              <div
                key={id}
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#4ade80",
                  background: "rgba(74,222,128,0.1)",
                  border: "1px solid rgba(74,222,128,0.25)",
                  borderRadius: 99,
                  padding: "2px 8px",
                }}
              >
                씰 획득
              </div>
            ))}
            {claimToast.titles?.map((k) => (
              <div
                key={k}
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#fcd34d",
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.25)",
                  borderRadius: 99,
                  padding: "2px 8px",
                }}
              >
                칭호 획득
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            탭하여 닫기
          </div>
        </div>
      )}
      {showBFEvent && (
        <BFEventModal
          winW={winW}
          onClose={() => {
            setShowBFEvent(false);
            setBfEventUnclaimedCount(getBFEventUnclaimedCount());
          }}
          onClaimReward={(coins: number) => {
            setMyCoins((prev: number) => {
              const next = prev + coins;
              persistCoins(next);
              const nick = localStorage.getItem("pks_nickname");
              if (nick) saveUserData(nick, { coins: next }).catch(() => {});
              return next;
            });
            setBfEventUnclaimedCount(getBFEventUnclaimedCount());
            showToast(
              `🏟️ BF 미션 보상! +${coins.toLocaleString()}코인`,
              "#8b5cf6"
            );
          }}
        />
      )}
      {showAchievements && (
        <AchievementModal
          onClose={() => setShowAchievements(false)}
          myCoins={myCoins}
          onClaimReward={({ coins, seal, title, achName }) => {
            if (coins > 0) {
              setMyCoins((prev: number) => {
                const next = prev + coins;
                persistCoins(next);
                const nick = localStorage.getItem("pks_nickname");
                if (nick) saveUserData(nick, { coins: next }).catch(() => {});
                return next;
              });
            }
            if (title) {
              setMyProfile((p: any) => {
                const updated = { ...p, title };
                const nick = localStorage.getItem("pks_nickname");
                if (nick)
                  saveUserData(nick, { profile: updated }).catch(() => {});
                return updated;
              });
            }
            if (seal) {
              const pool = (ALL_SEALS as any[]).filter(
                (s: any) => s.grade === "COMMON" || s.grade === "RARE"
              );
              const finalPool = pool.length > 0 ? pool : (ALL_SEALS as any[]);
              const picked =
                finalPool[Math.floor(Math.random() * finalPool.length)];
              const userId = getPlayerUid();
              const nickname =
                myProfile?.nickname ??
                myProfile?.name ??
                localStorage.getItem("pks_nickname") ??
                "트레이너";
              sendLetter(userId, {
                type: LETTER_TYPE.SYSTEM,
                title: `🏅 업적 보상 - ${achName}`,
                body: `업적 달성을 축하합니다!
포켓몬 씰 1장을 보내드려요.`,
                sender: "포켓SET 시스템",
                rewards: { seals: [String(picked.id)], coins: 0 },
              }).then(() => {
                setMailboxUnread((n: number) => n + 1);
              });
            }
            setAchUnclaimedCount(getUnclaimedCount());
            showToast(
              `🏅 "${achName}" 보상 수령! +${coins}코인${
                title ? " + 칭호" : ""
              }${seal ? " + 씰" : ""}`,
              "#6366f1"
            );
          }}
        />
      )}
      {showMultiModal && (
        <MultiModal
          winW={winW}
          onClose={() => setShowMultiModal(false)}
          onCreateRoom={() => {
            setShowMultiModal(false);
            setUseFrontierForRoom(false);
            setIsPublicRoom(false);
            setRoomTitle("");
            setScreen("room_create");
            setRoomErr("");
          }}
          onPublicRooms={() => {
            setShowMultiModal(false);
            handleNormalMulti("public");
          }}
          onJoinRoom={() => {
            setShowMultiModal(false);
            handleNormalMulti("join");
          }}
        />
      )}
      {showBattleFrontier && (
        <BattleFrontierModal
          winW={winW}
          onClose={() => setShowBattleFrontier(false)}
          onSolo={(useFrontier) => handleBattleFrontierSolo(useFrontier)}
          onCreateRoom={(useFrontier) =>
            handleBattleFrontierMulti("create", useFrontier)
          }
          onPublicRooms={(useFrontier) =>
            handleBattleFrontierMulti("public", useFrontier)
          }
          onJoinRoom={(useFrontier) =>
            handleBattleFrontierMulti("join", useFrontier)
          }
        />
      )}
      {showWildReveal && battleFrontierRule && (
        <WildRuleReveal
          ruleId={battleFrontierRule}
          onComplete={handleWildRevealComplete}
        />
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes claimToastIn { from{transform:translateX(-50%) translateY(20px) scale(0.9);opacity:0} to{transform:translateX(-50%) translateY(0) scale(1);opacity:1} }
      `}</style>
    </>
  );

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: loadingBg
            ? `url(${loadingBg}) center/cover no-repeat`
            : "linear-gradient(135deg,#1e3a5f,#0f2027)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.15)",
              borderTop: "4px solid #4ADE80",
              margin: "0 auto 24px",
              animation: "spin 0.9s linear infinite",
            }}
          />
          <div
            style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 22,
              letterSpacing: 2,
            }}
          >
            ⚡ POKÉSET
          </div>
        </div>
      </div>
    );

  if (!loggedIn) return <LoginScreen lobbyBg={lobbyBg} onLogin={handleLogin} />;
  if (showOnboarding)
    return (
      <OnboardingScreen tImgs={tImgs} onComplete={handleOnboardingComplete} />
    );
  if (showInteractiveTutorial)
    return (
      <InteractiveTutorial
        images={images}
        tImgs={tImgs}
        myCoins={myCoins}
        onComplete={() => {
          setShowInteractiveTutorial(false);
          tryShowBreadTutorial();
        }}
        onSkip={() => {
          setShowInteractiveTutorial(false);
          tryShowBreadTutorial();
        }}
      />
    );

  if (showBread)
    return (
      <>
        <BreadOpenScreen
          coins={myCoins}
          hasLeagueWin={false}
          isTutorial={breadIsTutorialRef.current}
          freeBreadCount={freeBreadCount}
          freePremiumBreadCount={freePremiumBreadCount}
          onUsedFreeBread={useFreeBread}
          onUsedPremiumFreeBread={usePremiumFreeBread}
          onSpendCoins={handleSpendCoins}
          onCloudSave={cloudSave}
          onBreadOpened={() => {
            const stats = loadAchStats();
            stats.breadCount = (stats.breadCount || 0) + 1;
            saveAchStats(stats);
            const newly = findNewlyAchieved(stats);
            if (newly.length > 0) {
              markAchieved(newly);
              setAchUnclaimedCount(getUnclaimedCount());
              newly.forEach(({ ach }, i) =>
                setTimeout(
                  () => showToast(`🏅 업적 달성! "${ach.name}"`, "#6366f1"),
                  i * 800
                )
              );
            }
          }}
          onClose={() => {
            breadIsTutorialRef.current = false;
            setShowBread(false);
          }}
        />
        {overlays}
      </>
    );

  if (screen === "roulette") {
    const pl = pendingPlayers || gs?.players || [];
    const rouletteTeams = pendingTeamMode ? { A: [0, 2], B: [1, 3] } : null;
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#020508",
          position: "relative",
          fontFamily: "system-ui,sans-serif",
        }}
      >
        <StadiumBg />
        <RouletteScreen
          players={pl}
          tImgs={tImgs}
          presetWinner={roulettePreset}
          onComplete={
            roomCode ? handleRouletteCompleteRoom : handleRouletteComplete
          }
          teamMode={pendingTeamMode}
          teams={rouletteTeams}
        />
        {overlays}
      </div>
    );
  }

  if (screen === "public_rooms")
    return (
      <PublicRoomsScreen
        myName={myName}
        myProfile={myProfile}
        myCoins={myCoins}
        tImgs={tImgs}
        lobbyBg={lobbyBg}
        winW={winW}
        onBack={() => setScreen("lobby")}
        onJoined={(code: string, rd: any, idx: number) => {
          setRoomCode(code);
          setRoomData(rd);
          setMyIdx(idx);
          setScreen("room_wait");
        }}
      />
    );

  if (screen === "lobby")
    return (
      <>
        <LobbyScreen
          myName={myName}
          myProfile={myProfile}
          myCoins={myCoins}
          tImgs={tImgs}
          lobbyBg={lobbyBg}
          winW={winW}
          mutedBGM={mutedBGM}
          mutedSFX={mutedSFX}
          onShowMulti={() => setShowMultiModal(true)}
          onShowBattleFrontier={() => setShowBattleFrontier(true)}
          onShowAchievements={() => setShowAchievements(true)}
          achUnclaimedCount={achUnclaimedCount}
          onShowBFEvent={() => setShowBFEvent(true)}
          bfEventUnclaimedCount={bfEventUnclaimedCount}
          onShowPocketFestival={() => setShowPocketFestival(true)}
          onShowMailbox={() => setShowMailbox(true)}
          mailboxUnread={mailboxUnread}
          onShowMyHome={() => setShowMyHome(true)}
          onShowProfile={() => setShowProfile(true)}
          onShowTutorial={() => setShowTutorial(true)}
          onShowRules={() => setShowLobbyRules(true)}
          onShowLeague={() => setShowLeagueModal(true)}
          onShowShop={() => setShowShop(true)}
          onShowInventory={() => setShowInventory(true)}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          showBreadHint={showLobbyBreadTutorial}
          onShowBread={() => {
            breadIsTutorialRef.current = showLobbyBreadTutorial;
            setShowLobbyBreadTutorial(false);
            setShowBread(true);
          }}
          onShowSealDex={() => setShowSealDex(true)}
          onToggleBGM={toggleBGM}
          onToggleSFX={toggleSFX}
          missionBadge={missionBadge}
          onShowDailyMissions={() => setShowDailyMissions(true)}
          onShowAttendance={() => setShowAttendance(true)}
          attendanceBadge={attendanceBadge}
          onFreeCharge={handleFreeCharge}
          onShowTournament={() => setShowTournament(true)}
          tournamentBadge={tournamentBadge}
          onShowEvent={() => setShowEvent(true)}
          eventDaysLeft={getEventDaysLeft()}
          eventSeal={getCurrentEvent().seal}
          onShowFeedback={() => setShowFeedback(true)}
        />
        {overlays}
      </>
    );

  if (screen === "room_create")
    return (
      <>
        <RoomCreateScreen
          myName={myName}
          setMyName={setMyName}
          pCount={pCount}
          setPCount={setPCount}
          isPublicRoom={isPublicRoom}
          setIsPublicRoom={setIsPublicRoom}
          roomTitle={roomTitle}
          setRoomTitle={setRoomTitle}
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          roomErr={roomErr}
          lobbyBg={lobbyBg}
          winW={winW}
          onCreate={createRoom}
          onBack={() => setScreen("lobby")}
          useFrontierRule={useFrontierForRoom}
          setUseFrontierRule={setUseFrontierForRoom}
        />
        {overlays}
      </>
    );
  if (screen === "room_join")
    return (
      <>
        <RoomJoinScreen
          myName={myName}
          setMyName={setMyName}
          joinInput={joinInput}
          setJoinInput={setJoinInput}
          roomErr={roomErr}
          lobbyBg={lobbyBg}
          winW={winW}
          onJoin={joinRoom}
          onBack={() => setScreen("lobby")}
        />
        {overlays}
      </>
    );
  if (screen === "room_wait")
    return (
      <>
        <RoomWaitScreen
          roomCode={roomCode}
          roomData={roomData}
          myIdx={myIdx}
          myName={myName}
          myProfile={myProfile}
          pCount={pCount}
          lobbyBg={lobbyBg}
          winW={winW}
          roomErr={roomErr}
          tImgs={tImgs}
          onStart={hostStart}
          onLeave={async () => {
            if (myIdx === 0 && roomCode)
              await db.remove("rooms/" + roomCode).catch(() => {});
            reset();
          }}
        />
        {overlays}
      </>
    );

  if (screen === "game" && gs)
    return (
      <>
        {/* @ts-ignore */}
        <GS
          key="game"
          gs={gs}
          myIdx={myIdx}
          roomCode={roomCode}
          isHost={isHost}
          drawnCard={drawnCard}
          drawnKey={drawnKey}
          selId={selId}
          discardingId={discardingId}
          images={images}
          tImgs={tImgs}
          gameBg={gameBg}
          muted={muted}
          activeEmotes={activeEmotes}
          showEmotePicker={showEmotePicker}
          ownedEmotes={ownedEmotes}
          emoteLoadout={emoteLoadout}
          timeLeft={timeLeft}
          heartbeats={heartbeats}
          aiThinking={aiThinking}
          showdownAnim={showdownAnim}
          showRules={showRules}
          showHandReveal={showHandReveal}
          cardEffects={cardEffects}
          timerBarRef={timerBarRef}
          leagueConfig={leagueConfig}
          isMobile={isMobile}
          winW={winW}
          sc={sc}
          onDrawDeck={(e: any) => drawDeck(e)}
          onDrawDiscard={(pid: number) => drawDiscard(pid)}
          onDiscardById={(id: any, el: any) => discardById(id, el)}
          onUseShowdown={useShowdown}
          onCardTap={(id: any, el: any) => handleCardTap(id, el)}
          onUseEmote={(eid: string, imgUrl: string) =>
            useEmoteAction(eid, imgUrl)
          }
          onToggleMute={toggleMuteAll}
          onRerollAI={rerollAI}
          onSetShowRules={setShowRules}
          onSetShowEmotePicker={setShowEmotePicker}
          onSetShowHandReveal={setShowHandReveal}
          onSetShowExitConfirm={setShowExitConfirm}
          onNextGame={nextGame}
          onReset={reset}
          setHighlight={setHighlight}
          onToggleHighlight={() => setSetHighlight((v) => !v)}
          onHostForceStart={hostForceStart}
          waitingForNext={waitingForNext}
          nextReadyMap={nextReadyMap}
          onFreeCharge={handleFreeCharge}
          autoStartAt={autoStartAt}
        />
        {overlays}
      </>
    );

  return null;
}

// ── ErrorBoundary로 감싼 최종 export ──
export default function PokéSetWithBoundary(props: any) {
  return (
    <ErrorBoundary>
      <PokéSet {...props} />
    </ErrorBoundary>
  );
}
