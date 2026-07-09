// src/lib/achievementLogic.js
// 업적 시스템 - 정의 / 통계 / 진행도 / 보상

const STATS_KEY = "pokeset_ach_stats";
const PROGRESS_KEY = "pokeset_ach_progress";

// ── 히든 업적 전용 칭호 ────────────────────────────────────
// titleLogic.js의 TITLES 배열에 추가 필요
export const ACHIEVEMENT_TITLES = [
  { key: "ach_speedy", label: "⚡ 속전속결", flavor: "눈 깜짝할 새에 끝났다" },
  { key: "ach_broke", label: "💀 빈털터리", flavor: "바닥을 쳐봤다" },
  {
    key: "ach_first_blood",
    label: "🎯 선빵러",
    flavor: "선제공격이 최선의 방어",
  },
  { key: "ach_greedy", label: "🦅 욕심쟁이", flavor: "남의 것이 더 맛있다" },
  {
    key: "ach_slowpoke",
    label: "🐢 느림보",
    flavor: "천천히, 하지만 확실하게",
  },
  { key: "ach_bf_addict", label: "🏟️ 특수룰 중독", flavor: "오늘도 특수룰" },
  {
    key: "ach_shiny_addict",
    label: "✨ 이로치 중독",
    flavor: "이로치가 너무 좋아",
  },
];

// ── 기본 통계 구조 ────────────────────────────────────────
function defaultStats() {
  return {
    totalGames: 0,
    totalWins: 0,
    multiWins: 0,
    currentStreak: 0,
    maxStreak: 0,
    sdSuccess: 0,
    sdTotal: 0,
    totalSets: 0,
    jokerSets: 0,
    totalCoinsEarned: 0,
    brokeWins: 0, // 코인 0 상태에서 역전승
    brokeEnding: 0, // 코인 0으로 게임 끝내기
    fastWins: 0, // 5턴 이하 승리
    slowWins: 0, // 20턴 이상 승리
    decklessWins: 0, // 덱 사용 없이 승리
    firstTurnSd: 0, // 첫 턴 더블배팅 선언
    bfTotal: 0,
    bfWins: 0,
    bfRuleWins: {
      no_discard: 0,
      jackpot: 0,
      speed: 0,
      reveal: 0,
      "4set": 0,
      bonus: 0,
    },
    bfRulesCleared: [],
    bfJackpotSd: 0,
    bfBonusTimes: 0,
    bfDailyGames: { date: "", count: 0 },
    tournamentClears: 0,
    shinyDailyWins: { date: "", count: 0 },
    shinyConsecDays: 0,
    shinyConsecDate: "",
    breadCount: 0,
    attendanceStreak: 0,
    sealCount: 0,
  };
}

// ── 통계 저장/로드 ────────────────────────────────────────
export function loadAchStats() {
  try {
    const s = localStorage.getItem(STATS_KEY);
    return s ? { ...defaultStats(), ...JSON.parse(s) } : defaultStats();
  } catch {
    return defaultStats();
  }
}

export function saveAchStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

// ── 진행도 저장/로드 ──────────────────────────────────────
// 구조: { [achId]: { stage: number, claimed: number } }
// stage: 달성된 최고 단계 인덱스 (-1 = 미달성)
// claimed: 수령한 최고 단계 인덱스 (-1 = 미수령)
export function loadAchProgress() {
  try {
    const s = localStorage.getItem(PROGRESS_KEY);
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

export function saveAchProgress(prog) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog));
  } catch {}
}

// ── 업적 정의 ─────────────────────────────────────────────
export const ACHIEVEMENTS = [
  // ── 일반: 승리/전투 ──────────────────────────────────────
  {
    id: "first_win",
    name: "첫 승리",
    category: "battle",
    hidden: false,
    icon: "🏆",
    desc: "첫 번째 승리를 달성하세요",
    stages: [{ threshold: 1, coins: 100, seal: false }],
    stat: (s) => s.totalWins,
  },
  {
    id: "wins",
    name: "승리의 길",
    category: "battle",
    hidden: false,
    icon: "⚔️",
    desc: "승리를 쌓아가세요",
    stages: [
      { threshold: 10, coins: 200, seal: false },
      { threshold: 50, coins: 500, seal: false },
      { threshold: 200, coins: 1500, seal: false },
      { threshold: 1000, coins: 5000, seal: false },
    ],
    stat: (s) => s.totalWins,
  },
  {
    id: "streak",
    name: "연승 행진",
    category: "battle",
    hidden: false,
    icon: "🔥",
    desc: "연속으로 승리하세요",
    stages: [
      { threshold: 3, coins: 300, seal: false },
      { threshold: 5, coins: 700, seal: false },
      { threshold: 10, coins: 2000, seal: false },
    ],
    stat: (s) => s.maxStreak,
  },
  {
    id: "comeback",
    name: "역전의 용사",
    category: "battle",
    hidden: false,
    icon: "💪",
    desc: "코인 0 상태에서 역전승 5회",
    stages: [{ threshold: 5, coins: 1000, seal: true }],
    stat: (s) => s.brokeWins,
  },
  {
    id: "sd_success",
    name: "더블배팅 달인",
    category: "battle",
    hidden: false,
    icon: "⚡",
    desc: "더블배팅 성공",
    stages: [
      { threshold: 10, coins: 500, seal: false },
      { threshold: 50, coins: 2000, seal: false },
    ],
    stat: (s) => s.sdSuccess,
  },
  // ── 일반: 세트/카드 ──────────────────────────────────────
  {
    id: "sets",
    name: "세트 마스터",
    category: "card",
    hidden: false,
    icon: "🃏",
    desc: "누적 세트 완성",
    stages: [
      { threshold: 100, coins: 200, seal: false },
      { threshold: 500, coins: 800, seal: false },
      { threshold: 2000, coins: 3000, seal: false },
    ],
    stat: (s) => s.totalSets,
  },
  {
    id: "joker",
    name: "조커 활용",
    category: "card",
    hidden: false,
    icon: "🌀",
    desc: "조커로 세트 완성",
    stages: [
      { threshold: 10, coins: 300, seal: false },
      { threshold: 50, coins: 1000, seal: true },
    ],
    stat: (s) => s.jokerSets,
  },
  // ── 일반: 코인 ───────────────────────────────────────────
  {
    id: "rich",
    name: "큰손",
    category: "coin",
    hidden: false,
    icon: "💰",
    desc: "누적 코인 획득",
    stages: [
      { threshold: 10000, coins: 500, seal: false },
      { threshold: 50000, coins: 2000, seal: false },
    ],
    stat: (s) => s.totalCoinsEarned,
  },
  {
    id: "gambler",
    name: "도박사",
    category: "coin",
    hidden: false,
    icon: "🎰",
    desc: "더블배팅 총 사용 횟수",
    stages: [
      { threshold: 50, coins: 300, seal: false },
      { threshold: 200, coins: 1000, seal: false },
    ],
    stat: (s) => s.sdTotal,
  },
  // ── 일반: 소셜/기타 ──────────────────────────────────────
  {
    id: "multi_wins",
    name: "멀티 고수",
    category: "social",
    hidden: false,
    icon: "👥",
    desc: "멀티 승리",
    stages: [
      { threshold: 10, coins: 300, seal: false },
      { threshold: 50, coins: 1000, seal: false },
    ],
    stat: (s) => s.multiWins,
  },
  {
    id: "collector",
    name: "씰 수집가",
    category: "social",
    hidden: false,
    icon: "📖",
    desc: "씰 도감 등록 종수",
    stages: [
      { threshold: 10, coins: 200, seal: false },
      { threshold: 30, coins: 500, seal: false },
      { threshold: 60, coins: 2000, seal: true },
    ],
    stat: (s) => s.sealCount,
  },
  {
    id: "attendance",
    name: "출석왕",
    category: "social",
    hidden: false,
    icon: "🗓️",
    desc: "30일 연속 출석",
    stages: [{ threshold: 30, coins: 2000, seal: true }],
    stat: (s) => s.attendanceStreak,
  },
  {
    id: "bread",
    name: "빵 마니아",
    category: "social",
    hidden: false,
    icon: "🍞",
    desc: "빵 100개 뽑기",
    stages: [{ threshold: 100, coins: 500, seal: true }],
    stat: (s) => s.breadCount,
  },
  // ── 특수룰 ────────────────────────────────────────────────
  {
    id: "bf_first",
    name: "특수룰 입문",
    category: "bf",
    hidden: false,
    icon: "🏟️",
    desc: "특수룰 첫 게임",
    stages: [{ threshold: 1, coins: 200, seal: false }],
    stat: (s) => s.bfTotal,
  },
  {
    id: "bf_all_rules",
    name: "룰 마스터",
    category: "bf",
    hidden: false,
    icon: "📜",
    desc: "6가지 룰 전부 1회 이상 클리어",
    stages: [{ threshold: 6, coins: 1000, seal: true }],
    stat: (s) => (s.bfRulesCleared || []).length,
  },
  {
    id: "bf_no_discard",
    name: "버림패 고수",
    category: "bf",
    hidden: false,
    icon: "🚫",
    desc: "버림패 금지 룰 승리",
    stages: [
      { threshold: 5, coins: 300, seal: false },
      { threshold: 20, coins: 1000, seal: false },
    ],
    stat: (s) => s.bfRuleWins?.no_discard || 0,
  },
  {
    id: "bf_jackpot",
    name: "잭팟 킹",
    category: "bf",
    hidden: false,
    icon: "💥",
    desc: "잭팟 룰에서 더블배팅 성공",
    stages: [
      { threshold: 3, coins: 500, seal: false },
      { threshold: 10, coins: 2000, seal: true },
    ],
    stat: (s) => s.bfJackpotSd,
  },
  {
    id: "bf_speed",
    name: "번개 승리",
    category: "bf",
    hidden: false,
    icon: "⚡",
    desc: "전광석화 룰 승리",
    stages: [
      { threshold: 5, coins: 300, seal: false },
      { threshold: 20, coins: 1000, seal: false },
    ],
    stat: (s) => s.bfRuleWins?.speed || 0,
  },
  {
    id: "bf_4set",
    name: "4세트 챔피언",
    category: "bf",
    hidden: false,
    icon: "🌀",
    desc: "4세트 룰 승리",
    stages: [
      { threshold: 3, coins: 500, seal: false },
      { threshold: 10, coins: 2000, seal: true },
    ],
    stat: (s) => s.bfRuleWins?.["4set"] || 0,
  },
  {
    id: "bf_bonus",
    name: "보너스 헌터",
    category: "bf",
    hidden: false,
    icon: "🎁",
    desc: "보너스타임 룰 10회 경험",
    stages: [{ threshold: 10, coins: 300, seal: true }],
    stat: (s) => s.bfBonusTimes,
  },
  {
    id: "bf_wins",
    name: "특수룰 챔피언",
    category: "bf",
    hidden: false,
    icon: "🏆",
    desc: "특수룰 승리",
    stages: [
      { threshold: 50, coins: 2000, seal: true },
      { threshold: 200, coins: 8000, seal: true },
    ],
    stat: (s) => s.bfWins,
  },
  // ── 히든 ─────────────────────────────────────────────────
  {
    id: "speedy",
    name: "속전속결",
    category: "hidden",
    hidden: true,
    icon: "⚡",
    desc: "5턴 안에 승리",
    stages: [{ threshold: 1, coins: 1000, seal: true, title: "ach_speedy" }],
    stat: (s) => s.fastWins,
  },
  {
    id: "broke",
    name: "빈털터리",
    category: "hidden",
    hidden: true,
    icon: "💀",
    desc: "코인 0으로 게임 끝내기",
    stages: [{ threshold: 1, coins: 1000, seal: false, title: "ach_broke" }],
    stat: (s) => s.brokeEnding,
  },
  {
    id: "first_blood",
    name: "선빵",
    category: "hidden",
    hidden: true,
    icon: "🎯",
    desc: "첫 턴에 더블배팅 선언",
    stages: [
      { threshold: 1, coins: 1000, seal: false, title: "ach_first_blood" },
    ],
    stat: (s) => s.firstTurnSd,
  },
  {
    id: "greedy",
    name: "욕심쟁이",
    category: "hidden",
    hidden: true,
    icon: "🦅",
    desc: "덱 사용 없이 상대 버린패로만 승리",
    stages: [{ threshold: 1, coins: 1000, seal: false, title: "ach_greedy" }],
    stat: (s) => s.decklessWins,
  },
  {
    id: "slowpoke",
    name: "느린 승리",
    category: "hidden",
    hidden: true,
    icon: "🐢",
    desc: "20턴 이상 걸려서 승리",
    stages: [{ threshold: 1, coins: 1000, seal: false, title: "ach_slowpoke" }],
    stat: (s) => s.slowWins,
  },
  {
    id: "bf_addict",
    name: "특수룰 광인",
    category: "hidden",
    hidden: true,
    icon: "🏟️",
    desc: "특수룰 하루 10판",
    stages: [{ threshold: 1, coins: 1000, seal: true, title: "ach_bf_addict" }],
    stat: (s) => ((s.bfDailyGames?.count || 0) >= 10 ? 1 : 0),
  },
  {
    id: "shiny_addict",
    name: "이로치 중독",
    category: "hidden",
    hidden: true,
    icon: "✨",
    desc: "이로치 토너먼트 3회 우승을 3일 연속",
    stages: [
      { threshold: 1, coins: 1000, seal: true, title: "ach_shiny_addict" },
    ],
    stat: (s) => ((s.shinyConsecDays || 0) >= 3 ? 1 : 0),
  },
];

// ── 현재 달성 단계 반환 (-1: 미달성) ─────────────────────
export function getCurrentStage(ach, stats) {
  const val = ach.stat(stats);
  let stage = -1;
  for (let i = 0; i < ach.stages.length; i++) {
    if (val >= ach.stages[i].threshold) stage = i;
  }
  return stage;
}

// ── 다음 단계까지 진행도 (0~1) ────────────────────────────
export function getProgressRatio(ach, stats) {
  const val = ach.stat(stats);
  const prog = loadAchProgress();
  const claimed = prog[ach.id]?.claimed ?? -1;
  const nextIdx = claimed + 1;
  if (nextIdx >= ach.stages.length) return 1;
  const prev = nextIdx > 0 ? ach.stages[nextIdx - 1].threshold : 0;
  const next = ach.stages[nextIdx].threshold;
  return Math.min(1, (val - prev) / (next - prev));
}

// ── 새로 달성된 단계 탐색 ────────────────────────────────
export function findNewlyAchieved(stats) {
  const prog = loadAchProgress();
  const newly = [];
  for (const ach of ACHIEVEMENTS) {
    const curStage = getCurrentStage(ach, stats);
    const savedStage = prog[ach.id]?.stage ?? -1;
    if (curStage > savedStage) {
      for (let s = savedStage + 1; s <= curStage; s++) {
        newly.push({ ach, stage: s });
      }
    }
  }
  return newly;
}

// ── 달성 상태 저장 (클레임 전) ───────────────────────────
export function markAchieved(newlyAchieved) {
  const prog = loadAchProgress();
  for (const { ach, stage } of newlyAchieved) {
    if (!prog[ach.id]) prog[ach.id] = { stage: -1, claimed: -1 };
    prog[ach.id].stage = Math.max(prog[ach.id].stage ?? -1, stage);
  }
  saveAchProgress(prog);
}

// ── 보상 수령 ────────────────────────────────────────────
export function claimAchievement(achId, stageIdx) {
  const prog = loadAchProgress();
  if (!prog[achId]) return false;
  if ((prog[achId].stage ?? -1) < stageIdx) return false;
  if ((prog[achId].claimed ?? -1) >= stageIdx) return false;
  prog[achId].claimed = stageIdx;
  saveAchProgress(prog);
  return true;
}

// ── 미수령 업적 개수 ─────────────────────────────────────
export function getUnclaimedCount() {
  const prog = loadAchProgress();
  let count = 0;
  for (const ach of ACHIEVEMENTS) {
    const p = prog[ach.id];
    if (!p) continue;
    if ((p.stage ?? -1) > (p.claimed ?? -1)) count++;
  }
  return count;
}

// ── 게임 결과 기록 ────────────────────────────────────────
export function recordGameResult({
  won,
  isMulti,
  isBattleFrontier,
  isTournament,
  wildRule,
  playerTurnCount,
  usedDeck,
  sdUsed,
  sdWon,
  usedSdOnTurn1,
  coinsEarned,
  coinsAfter,
  setsCompleted,
  jokerSetsCompleted,
  brokeWin,
}) {
  const stats = loadAchStats();
  const today = new Date().toISOString().slice(0, 10);

  stats.totalGames = (stats.totalGames || 0) + 1;

  if (won) {
    stats.totalWins = (stats.totalWins || 0) + 1;
    stats.currentStreak = (stats.currentStreak || 0) + 1;
    stats.maxStreak = Math.max(stats.maxStreak || 0, stats.currentStreak);
    if (isMulti) stats.multiWins = (stats.multiWins || 0) + 1;
    if (brokeWin) stats.brokeWins = (stats.brokeWins || 0) + 1;
    if (playerTurnCount <= 5) stats.fastWins = (stats.fastWins || 0) + 1;
    if (playerTurnCount >= 20) stats.slowWins = (stats.slowWins || 0) + 1;
    if (!usedDeck) stats.decklessWins = (stats.decklessWins || 0) + 1;
  } else {
    stats.currentStreak = 0;
  }

  if (sdUsed) stats.sdTotal = (stats.sdTotal || 0) + 1;
  if (sdWon) stats.sdSuccess = (stats.sdSuccess || 0) + 1;
  if (usedSdOnTurn1) stats.firstTurnSd = (stats.firstTurnSd || 0) + 1;

  if (coinsEarned > 0)
    stats.totalCoinsEarned = (stats.totalCoinsEarned || 0) + coinsEarned;
  if ((coinsAfter || 0) === 0) stats.brokeEnding = (stats.brokeEnding || 0) + 1;

  stats.totalSets = (stats.totalSets || 0) + (setsCompleted || 0);
  stats.jokerSets = (stats.jokerSets || 0) + (jokerSetsCompleted || 0);

  // 특수룰
  if (isBattleFrontier) {
    stats.bfTotal = (stats.bfTotal || 0) + 1;
    if (stats.bfDailyGames?.date !== today) {
      stats.bfDailyGames = { date: today, count: 1 };
    } else {
      stats.bfDailyGames.count = (stats.bfDailyGames.count || 0) + 1;
    }
    if (won) {
      stats.bfWins = (stats.bfWins || 0) + 1;
      if (wildRule) {
        if (!stats.bfRuleWins) stats.bfRuleWins = {};
        stats.bfRuleWins[wildRule] = (stats.bfRuleWins[wildRule] || 0) + 1;
        if (!stats.bfRulesCleared) stats.bfRulesCleared = [];
        if (!stats.bfRulesCleared.includes(wildRule)) {
          stats.bfRulesCleared.push(wildRule);
        }
      }
    }
    if (wildRule === "jackpot" && sdWon)
      stats.bfJackpotSd = (stats.bfJackpotSd || 0) + 1;
    if (wildRule === "bonus")
      stats.bfBonusTimes = (stats.bfBonusTimes || 0) + 1;
  }

  // 이로치 토너먼트
  if (isTournament && won) {
    stats.tournamentClears = (stats.tournamentClears || 0) + 1;
    if (stats.shinyDailyWins?.date !== today) {
      stats.shinyDailyWins = { date: today, count: 1 };
    } else {
      stats.shinyDailyWins.count = (stats.shinyDailyWins.count || 0) + 1;
    }
    // 3일 연속 3회 우승 체크 (정확히 3회째 도달 시에만 처리)
    if (stats.shinyDailyWins.count === 3) {
      const prevDay = getPrevDay(today);
      if (stats.shinyConsecDate === prevDay) {
        stats.shinyConsecDays = (stats.shinyConsecDays || 0) + 1;
      } else if (stats.shinyConsecDate !== today) {
        stats.shinyConsecDays = 1;
      }
      stats.shinyConsecDate = today;
    }
  }

  saveAchStats(stats);
  return stats;
}

// ── 씰/빵/출석 카운터 업데이트 (외부에서 호출) ──────────
export function updateAchStat(key, value) {
  const stats = loadAchStats();
  stats[key] = value;
  saveAchStats(stats);
}

function getPrevDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
