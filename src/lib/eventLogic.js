// src/lib/eventLogic.js
// 2주 사이클로 모자 피카츄 8종 순환 이벤트

export const CAP_PIKACHU_SEALS = [
  {
    id: "cap_original",
    pokeId: 10094,
    name: "관동 피카츄",
    cap: "오리지널",
    color: "#E8763A",
    emoji: "🧢",
    grade: "EVENT",
  },
  {
    id: "cap_hoenn",
    pokeId: 10095,
    name: "호연 피카츄",
    cap: "호연",
    color: "#4FC3F7",
    emoji: "🎩",
    grade: "EVENT",
  },
  {
    id: "cap_sinnoh",
    pokeId: 10096,
    name: "신오 피카츄",
    cap: "신오",
    color: "#ce93d8",
    emoji: "⛑️",
    grade: "EVENT",
  },
  {
    id: "cap_unova",
    pokeId: 10097,
    name: "하나 피카츄",
    cap: "하나",
    color: "#66BB6A",
    emoji: "🪖",
    grade: "EVENT",
  },
  {
    id: "cap_kalos",
    pokeId: 10098,
    name: "칼로스 피카츄",
    cap: "칼로스",
    color: "#F06292",
    emoji: "🎓",
    grade: "EVENT",
  },
  {
    id: "cap_alola",
    pokeId: 10099,
    name: "알로라 피카츄",
    cap: "알로라",
    color: "#FFD54F",
    emoji: "🌺",
    grade: "EVENT",
  },
  {
    id: "cap_partner",
    pokeId: 10148,
    name: "파트너 피카츄",
    cap: "파트너",
    color: "#ffd700",
    emoji: "⭐",
    grade: "EVENT",
  },
  {
    id: "cap_worldcap",
    pokeId: 10160,
    name: "월드캡 피카츄",
    cap: "월드캡",
    color: "#ff80ab",
    emoji: "🏆",
    grade: "EVENT",
  },
].map((s) => ({
  ...s,
  artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${s.pokeId}.png`,
  artworkFallback: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${s.pokeId}.png`,
}));

export const COSPLAY_PIKACHU_SEALS = [
  {
    id: "cosplay_rockstar",
    pokeId: 10080,
    name: "록스타 피카츄",
    color: "#E91E8C",
    emoji: "🎸",
    grade: "EVENT",
  },
  {
    id: "cosplay_belle",
    pokeId: 10081,
    name: "벨 피카츄",
    color: "#ce93d8",
    emoji: "👗",
    grade: "EVENT",
  },
  {
    id: "cosplay_popstar",
    pokeId: 10082,
    name: "팝스타 피카츄",
    color: "#ff80ab",
    emoji: "🎤",
    grade: "EVENT",
  },
  {
    id: "cosplay_phd",
    pokeId: 10083,
    name: "박사 피카츄",
    color: "#4FC3F7",
    emoji: "🎓",
    grade: "EVENT",
  },
  {
    id: "cosplay_libre",
    pokeId: 10084,
    name: "레슬러 피카츄",
    color: "#66BB6A",
    emoji: "🤼",
    grade: "EVENT",
  },
  {
    id: "cosplay_base",
    pokeId: 10085,
    name: "코스프레 피카츄",
    color: "#FFD54F",
    emoji: "✨",
    grade: "EVENT",
  },
].map((s) => ({
  ...s,
  artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${s.pokeId}.png`,
  artworkFallback: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${s.pokeId}.png`,
}));

export const PARTNER_SEALS = [
  {
    id: "partner_pikachu",
    pokeId: 10158,
    name: "파트너 피카츄",
    color: "#F5C400",
    emoji: "⚡",
    grade: "EVENT",
  },
  {
    id: "partner_eevee",
    pokeId: 10159,
    name: "파트너 이브이",
    color: "#C8873A",
    emoji: "🍃",
    grade: "EVENT",
  },
].map((s) => ({
  ...s,
  artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${s.pokeId}.png`,
  artworkFallback: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${s.pokeId}.png`,
}));

export const MEGA_SEALS = [
  {
    id: "mega_venusaur",
    pokeId: 10033,
    name: "메가 이상해꽃",
    color: "#66BB6A",
    emoji: "🌿",
    grade: "EVENT",
  },
  {
    id: "mega_charizard_x",
    pokeId: 10034,
    name: "메가 리자몽 X",
    color: "#7E57C2",
    emoji: "🔥",
    grade: "EVENT",
  },
  {
    id: "mega_charizard_y",
    pokeId: 10035,
    name: "메가 리자몽 Y",
    color: "#E8763A",
    emoji: "🔥",
    grade: "EVENT",
  },
  {
    id: "mega_blastoise",
    pokeId: 10036,
    name: "메가 거북왕",
    color: "#4FC3F7",
    emoji: "💧",
    grade: "EVENT",
  },
  {
    id: "mega_alakazam",
    pokeId: 10037,
    name: "메가 후딘",
    color: "#F5C400",
    emoji: "🥄",
    grade: "EVENT",
  },
  {
    id: "mega_gengar",
    pokeId: 10038,
    name: "메가 팬텀",
    color: "#705898",
    emoji: "👻",
    grade: "EVENT",
  },
  {
    id: "mega_kangaskhan",
    pokeId: 10039,
    name: "메가 캥카",
    color: "#A8A878",
    emoji: "🦘",
    grade: "EVENT",
  },
  {
    id: "mega_pinsir",
    pokeId: 10040,
    name: "메가 쁘사이저",
    color: "#A8B820",
    emoji: "🦗",
    grade: "EVENT",
  },
  {
    id: "mega_gyarados",
    pokeId: 10041,
    name: "메가 갸라도스",
    color: "#546E7A",
    emoji: "🐉",
    grade: "EVENT",
  },
  {
    id: "mega_aerodactyl",
    pokeId: 10042,
    name: "메가 프테라",
    color: "#B8A038",
    emoji: "🦅",
    grade: "EVENT",
  },
  {
    id: "mega_mewtwo_x",
    pokeId: 10043,
    name: "메가 뮤츠 X",
    color: "#C03028",
    emoji: "🔮",
    grade: "EVENT",
  },
  {
    id: "mega_mewtwo_y",
    pokeId: 10044,
    name: "메가 뮤츠 Y",
    color: "#E91E8C",
    emoji: "🔮",
    grade: "EVENT",
  },
].map((s) => ({
  ...s,
  artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${s.pokeId}.png`,
  artworkFallback: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${s.pokeId}.png`,
}));

export const GMAX_SEALS = [
  {
    id: "gmax_venusaur",
    pokeId: 10195,
    name: "거다이맥스 이상해꽃",
    color: "#66BB6A",
    emoji: "🌱",
    grade: "EVENT",
  },
  {
    id: "gmax_charizard",
    pokeId: 10196,
    name: "거다이맥스 리자몽",
    color: "#E8763A",
    emoji: "🔥",
    grade: "EVENT",
  },
  {
    id: "gmax_blastoise",
    pokeId: 10197,
    name: "거다이맥스 거북왕",
    color: "#4FC3F7",
    emoji: "💧",
    grade: "EVENT",
  },
  {
    id: "gmax_butterfree",
    pokeId: 10198,
    name: "거다이맥스 버터플",
    color: "#A8B820",
    emoji: "🦋",
    grade: "EVENT",
  },
  {
    id: "gmax_pikachu",
    pokeId: 10199,
    name: "거다이맥스 피카츄",
    color: "#F5C400",
    emoji: "⚡",
    grade: "EVENT",
  },
  {
    id: "gmax_meowth",
    pokeId: 10200,
    name: "거다이맥스 나옹",
    color: "#A8A878",
    emoji: "🐱",
    grade: "EVENT",
  },
  {
    id: "gmax_machamp",
    pokeId: 10201,
    name: "거다이맥스 괴력몬",
    color: "#C03028",
    emoji: "💪",
    grade: "EVENT",
  },
  {
    id: "gmax_gengar",
    pokeId: 10202,
    name: "거다이맥스 팬텀",
    color: "#705898",
    emoji: "👻",
    grade: "EVENT",
  },
  {
    id: "gmax_kingler",
    pokeId: 10203,
    name: "거다이맥스 킬리야",
    color: "#4FC3F7",
    emoji: "🦀",
    grade: "EVENT",
  },
  {
    id: "gmax_lapras",
    pokeId: 10204,
    name: "거다이맥스 라프라스",
    color: "#80DEEA",
    emoji: "🧊",
    grade: "EVENT",
  },
  {
    id: "gmax_eevee",
    pokeId: 10205,
    name: "거다이맥스 이브이",
    color: "#C8873A",
    emoji: "⭐",
    grade: "EVENT",
  },
  {
    id: "gmax_snorlax",
    pokeId: 10206,
    name: "거다이맥스 잠만보",
    color: "#546E7A",
    emoji: "😴",
    grade: "EVENT",
  },
].map((s) => ({
  ...s,
  artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${s.pokeId}.png`,
  artworkFallback: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${s.pokeId}.png`,
}));

export const ALL_EVENT_SEALS = [
  ...CAP_PIKACHU_SEALS,
  ...COSPLAY_PIKACHU_SEALS,
  ...PARTNER_SEALS,
  ...MEGA_SEALS,
  ...GMAX_SEALS,
];

export function getCapArtwork(pokeId) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokeId}.png`;
}

// ── 모자씰 도감 ──
const CAP_DEX_KEY = "pokeset_cap_dex";
export function loadCapDex() {
  try {
    const r = localStorage.getItem(CAP_DEX_KEY);
    return r ? JSON.parse(r) : {};
  } catch {
    return {};
  }
}
export function saveCapDex(dex) {
  try {
    localStorage.setItem(CAP_DEX_KEY, JSON.stringify(dex));
  } catch {}
}
export function getCapOwnedCount() {
  const dex = loadCapDex();
  return ALL_EVENT_SEALS.filter((s) => dex[s.id]?.count > 0).length;
}

// ── 사이클 계산 ──
// 기준: 2026-04-13 월요일 00:00 KST
const CYCLE_ORIGIN = new Date("2026-04-13T00:00:00+09:00").getTime();
const CYCLE_MS = 14 * 24 * 60 * 60 * 1000; // 14일

// 이번 사이클 종료일 연기: 4월 27일 00:00 KST
const DELAYED_END_UTC = new Date("2026-04-27T00:00:00+09:00").getTime();

export function getCurrentEvent() {
  const elapsed = Date.now() - CYCLE_ORIGIN;
  const cycleIdx = Math.floor(elapsed / CYCLE_MS);
  const sealIdx = ((cycleIdx % 8) + 8) % 8;

  const cycleStartMs = CYCLE_ORIGIN + cycleIdx * CYCLE_MS;
  // 이번 사이클(idx=0)이면 연기된 종료일 사용, 아니면 정상
  const cycleEndMs =
    cycleIdx === 0 ? DELAYED_END_UTC - 1 : cycleStartMs + CYCLE_MS - 1;

  const kstStartStr = new Date(cycleStartMs + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return {
    idx: sealIdx,
    seal: CAP_PIKACHU_SEALS[sealIdx],
    startDate: new Date(cycleStartMs),
    endDate: new Date(cycleEndMs),
    eventId: `event_${kstStartStr}`,
  };
}

export function getEventDaysLeft() {
  const { endDate } = getCurrentEvent();
  const diff = endDate.getTime() - Date.now();
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
}

// ── 스탬프 정의 ──
export const STAMP_DEFS = [
  {
    id: "wins",
    label: "리그 5승",
    desc: "이벤트 기간 중 어떤 리그든 5번 이기기",
    icon: "⚔️",
    target: 5,
  },
  {
    id: "streak",
    label: "리그 3연승",
    desc: "이벤트 기간 중 3연승 달성하기",
    icon: "🔥",
    target: 3,
  },
  {
    id: "tournament",
    label: "이로치 토너먼트 완주",
    desc: "이로치 토너먼트 3라운드 제패 1회",
    icon: "✨",
    target: 1,
  },
  {
    id: "loginDays",
    label: "5일 접속",
    desc: "이벤트 기간 중 5일 이상 접속하기",
    icon: "📅",
    target: 5,
  },
  {
    id: "missionDays",
    label: "일일 미션 3일 완료",
    desc: "이벤트 기간 중 일일 미션을 3일 완료",
    icon: "📋",
    target: 3,
  },
  {
    id: "likesGiven",
    label: "좋아요 5명에게 주기",
    desc: "다른 트레이너에게 좋아요를 5번 주기",
    icon: "❤️",
    target: 5,
  },
];

export const STAMP_TOTAL = STAMP_DEFS.length;
export const STAMP_REQUIRED = 4;

// ── 로컬스토리지 ──
const STORAGE_KEY = "pokeset_event_progress";
const DEFAULT_PROGRESS = () => ({
  eventId: "",
  stamps: Array(STAMP_TOTAL).fill(false),
  progress: {
    wins: 0,
    streak: 0,
    tournament: 0,
    loginDays: [],
    missionDays: [],
    likesGiven: 0,
  },
  rewarded: false,
  fullRewarded: false,
});

export function loadEventProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    const { eventId } = getCurrentEvent();
    if (!saved || saved.eventId !== eventId) {
      const fresh = DEFAULT_PROGRESS();
      fresh.eventId = eventId;
      saveEventProgress(fresh);
      return fresh;
    }
    return saved;
  } catch {
    return DEFAULT_PROGRESS();
  }
}
export function saveEventProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function todayKST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function recheckStamps(data) {
  const p = data.progress;
  STAMP_DEFS.forEach((def, i) => {
    let val = 0;
    if (def.id === "loginDays") val = (p.loginDays || []).length;
    else if (def.id === "missionDays") val = (p.missionDays || []).length;
    else if (def.id === "streak") val = p.streak || 0;
    else val = p[def.id] || 0;
    data.stamps[i] = val >= def.target;
  });
  return data;
}

export function onLeagueWin(prev) {
  const d = { ...prev, progress: { ...prev.progress } };
  d.progress.wins = (d.progress.wins || 0) + 1;
  d.progress.streak = (d.progress.streak || 0) + 1;
  return recheckStamps(d);
}
export function onLeagueLose(prev) {
  const d = { ...prev, progress: { ...prev.progress } };
  d.progress.streak = 0;
  return recheckStamps(d);
}
export function onTournamentClear(prev) {
  const d = { ...prev, progress: { ...prev.progress } };
  d.progress.tournament = (d.progress.tournament || 0) + 1;
  return recheckStamps(d);
}
export function onDailyLogin(prev) {
  const d = { ...prev, progress: { ...prev.progress } };
  const t = todayKST();
  const days = [...(d.progress.loginDays || [])];
  if (!days.includes(t)) days.push(t);
  d.progress.loginDays = days;
  return recheckStamps(d);
}
export function onMissionComplete(prev) {
  const d = { ...prev, progress: { ...prev.progress } };
  const t = todayKST();
  const days = [...(d.progress.missionDays || [])];
  if (!days.includes(t)) days.push(t);
  d.progress.missionDays = days;
  return recheckStamps(d);
}
export function onLikeGiven(prev) {
  const d = { ...prev, progress: { ...prev.progress } };
  d.progress.likesGiven = (d.progress.likesGiven || 0) + 1;
  return recheckStamps(d);
}

export function getStampCount(data) {
  return (data.stamps || []).filter(Boolean).length;
}
export function canClaimReward(data) {
  return getStampCount(data) >= STAMP_REQUIRED && !data.rewarded;
}
export function canClaimFullReward(data) {
  return getStampCount(data) >= STAMP_TOTAL && !data.fullRewarded;
}
