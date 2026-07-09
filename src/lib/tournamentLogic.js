// src/lib/tournamentLogic.js

const STORAGE_KEY = "pokeset_tournament";

function todayKST() {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

export function isTournamentOpen() {
  return true;
}
export function getMsUntilOpen() {
  return 0;
}

export function getSeasonKey() {
  const epoch = new Date("2024-01-01T00:00:00+09:00");
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `S${Math.floor(Math.floor((kst - epoch) / 86400000) / 14) + 1}`;
}
export function getSeasonNum() {
  return parseInt(getSeasonKey().replace("S", ""), 10);
}
export function getSeasonDaysLeft() {
  const epoch = new Date("2024-01-01T00:00:00+09:00");
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return 14 - (Math.floor((kst - epoch) / 86400000) % 14);
}

function getDefault() {
  return {
    lastDate: todayKST(),
    freeUsed: false,
    ticketActive: false,
    currentRound: 0,
    todayResult: null,
    dailyWins: 0, // 오늘 우승 횟수 (최대 3)
    streak: 0,
    lastWinDate: null,
    seasonKey: getSeasonKey(),
    seasonWins: 0,
  };
}

export function loadTournamentData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefault();
    let data = JSON.parse(raw);
    // 자정 리셋: 무료 복구, 진행 중 라운드/티켓 유지
    if (data.lastDate !== todayKST()) {
      data = { ...data, lastDate: todayKST(), freeUsed: false, dailyWins: 0 };
    }
    if (data.seasonKey !== getSeasonKey()) {
      data = { ...data, seasonKey: getSeasonKey(), seasonWins: 0 };
    }
    // currentRound > 0 이면 반드시 진행 중 (이긴 기록 있음) → ticketActive 강제 true
    if (data.currentRound > 0) {
      data.ticketActive = true;
    } else if (data.ticketActive === undefined || data.ticketActive === null) {
      data.ticketActive = false;
    }
    return data;
  } catch {
    return getDefault();
  }
}

export function saveTournamentData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── 3라운드 구성 ──
export const ROUND_CONFIGS = [
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

export const TOTAL_ROUNDS = 3;
export const TICKET_COST = 1000;
export const DAILY_MAX_WINS = 3; // 하루 최대 우승 횟수

// 무료 도전 시작 (ticketActive=true)
export function startTournament() {
  const data = loadTournamentData();
  data.freeUsed = true;
  data.ticketActive = true;
  data.currentRound = 1;
  data.todayResult = null;
  saveTournamentData(data);
  return data;
}

// 티켓 구매 후 1라운드부터 재시작
export function buyTicketAndStart() {
  const data = loadTournamentData();
  data.ticketActive = true;
  data.currentRound = 1;
  data.todayResult = null;
  saveTournamentData(data);
  return data;
}

// 라운드 승리
export function winRound(round) {
  const data = loadTournamentData();
  if (round < TOTAL_ROUNDS) {
    data.currentRound = round + 1; // 티켓 유지, 다음 라운드
  } else {
    // 챔피언!
    data.currentRound = 0;
    data.ticketActive = false;
    data.todayResult = "win";
    data.dailyWins = (data.dailyWins || 0) + 1;
    data.seasonWins = (data.seasonWins || 0) + 1;
    const today = todayKST();
    if (data.lastWinDate) {
      const diff = Math.round(
        (new Date(today + "T00:00:00+09:00") -
          new Date(data.lastWinDate + "T00:00:00+09:00")) /
          86400000
      );
      data.streak = diff === 1 ? (data.streak || 0) + 1 : 1;
    } else {
      data.streak = 1;
    }
    data.lastWinDate = today;
  }
  saveTournamentData(data);
  return data;
}

// 패배 → 티켓 소멸, 처음부터
export function loseRound() {
  const data = loadTournamentData();
  data.currentRound = 0;
  data.ticketActive = false;
  data.todayResult = "lose";
  saveTournamentData(data);
  return data;
}

export function getSeasonGrade(wins) {
  if (wins >= 10) return { label: "골드", color: "#F59E0B", emoji: "🥇" };
  if (wins >= 5) return { label: "실버", color: "#94A3B8", emoji: "🥈" };
  if (wins >= 1) return { label: "브론즈", color: "#CD7F32", emoji: "🥉" };
  return null;
}

export function getStreakBonus(streak) {
  if (streak >= 7) return { coins: 500, label: "7일 연속 우승!" };
  if (streak >= 3) return { coins: 200, label: "3일 연속 우승!" };
  return null;
}

export function syncTournamentToCloud(data) {
  try {
    const fn = window.__cloudSave;
    if (typeof fn === "function") fn({ tournament: data }).catch(() => {});
  } catch {}
}
