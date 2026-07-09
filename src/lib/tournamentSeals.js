// src/lib/tournamentSeals.js

const STORAGE_KEY = "pokeset_tournament_dex";

// ── 시즌별 씰 정의 ──
// 파일명 규칙: public/seals/tournament_entry_s{n}.png
//              public/seals/tournament_champion_s{n}.png
export const TOURNAMENT_SEALS = [
  // 시즌 1
  {
    id: "t_entry_s1",
    name: "참가의 증표 S1",
    grade: "EVENT",
    season: 1,
    type: "entry",
    artwork: "/seals/tournament_entry_s1.png",
    description: "시즌 1 토너먼트 참가 기념 씰",
  },
  {
    id: "t_champ_s1",
    name: "챔피언의 증표 S1",
    grade: "EVENT_CHAMPION",
    season: 1,
    type: "champion",
    artwork: "/seals/tournament_champion_s1.png",
    description: "시즌 1 토너먼트 우승 기념 씰",
  },
  // 시즌 2
  {
    id: "t_entry_s2",
    name: "참가의 증표 S2",
    grade: "EVENT",
    season: 2,
    type: "entry",
    artwork: "/seals/tournament_entry_s2.png",
    description: "시즌 2 토너먼트 참가 기념 씰",
  },
  {
    id: "t_champ_s2",
    name: "챔피언의 증표 S2",
    grade: "EVENT_CHAMPION",
    season: 2,
    type: "champion",
    artwork: "/seals/tournament_champion_s2.png",
    description: "시즌 2 토너먼트 우승 기념 씰",
  },
  // 시즌 3
  {
    id: "t_entry_s3",
    name: "참가의 증표 S3",
    grade: "EVENT",
    season: 3,
    type: "entry",
    artwork: "/seals/tournament_entry_s3.png",
    description: "시즌 3 토너먼트 참가 기념 씰",
  },
  {
    id: "t_champ_s3",
    name: "챔피언의 증표 S3",
    grade: "EVENT_CHAMPION",
    season: 3,
    type: "champion",
    artwork: "/seals/tournament_champion_s3.png",
    description: "시즌 3 토너먼트 우승 기념 씰",
  },
  // 시즌 4
  {
    id: "t_entry_s4",
    name: "참가의 증표 S4",
    grade: "EVENT",
    season: 4,
    type: "entry",
    artwork: "/seals/tournament_entry_s4.png",
    description: "시즌 4 토너먼트 참가 기념 씰",
  },
  {
    id: "t_champ_s4",
    name: "챔피언의 증표 S4",
    grade: "EVENT_CHAMPION",
    season: 4,
    type: "champion",
    artwork: "/seals/tournament_champion_s4.png",
    description: "시즌 4 토너먼트 우승 기념 씰",
  },
  // 시즌 5
  {
    id: "t_entry_s5",
    name: "참가의 증표 S5",
    grade: "EVENT",
    season: 5,
    type: "entry",
    artwork: "/seals/tournament_entry_s5.png",
    description: "시즌 5 토너먼트 참가 기념 씰",
  },
  {
    id: "t_champ_s5",
    name: "챔피언의 증표 S5",
    grade: "EVENT_CHAMPION",
    season: 5,
    type: "champion",
    artwork: "/seals/tournament_champion_s5.png",
    description: "시즌 5 토너먼트 우승 기념 씰",
  },
];

// ── 현재 시즌 씰 가져오기 ──
export function getCurrentSeasonSeals(seasonNum) {
  return TOURNAMENT_SEALS.filter((s) => s.season === seasonNum);
}

export function getSealById(id) {
  return TOURNAMENT_SEALS.find((s) => s.id === id) || null;
}

// ── 토너먼트 도감 로드/저장 ──
export function loadTournamentDex() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveTournamentDex(dex) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dex));
  window.dispatchEvent(new Event("pokeset_tournament_dex_updated"));
}

// ── 씰 지급 ──
export function giveTournamentSeal(sealId) {
  const dex = loadTournamentDex();
  const key = String(sealId);
  dex[key] = { count: (dex[key]?.count || 0) + 1, acquiredAt: Date.now() };
  saveTournamentDex(dex);
  try {
    const fn = window.__cloudSave;
    if (typeof fn === "function") fn({ tournamentDex: dex }).catch(() => {});
  } catch {}
  return dex;
}

// ── 이미 보유 중인지 체크 ──
export function hasTournamentSeal(sealId) {
  const dex = loadTournamentDex();
  return (dex[String(sealId)]?.count || 0) > 0;
}

// ── 보유한 씰 ID 목록 (대표씰/리더보드용) ──
export function getOwnedTournamentSealIds() {
  const dex = loadTournamentDex();
  return Object.keys(dex).filter((k) => dex[k]?.count > 0);
}

// ── 전체 씰 목록 (ALL_SEALS 병합용) ──
export function getAllSealsWithTournament(allSeals) {
  return [...allSeals, ...TOURNAMENT_SEALS];
}
