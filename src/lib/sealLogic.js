// ============================================================
//  PokéSet – 띠부띠부씰 수집 시스템 로직
// ============================================================

const CDN =
  "https://cdn.jsdelivr.net/gh/dudwp1221-byte/pokeset-images@main";

// ─── 씰 등급 정의 ───────────────────────────────────────────
export const SEAL_GRADES = {
  COMMON: {
    id: "COMMON",
    label: "일반",
    color: "#aaaaaa",
    bg: "#2a2a2a",
    prob: 0.5,
  },
  RARE: {
    id: "RARE",
    label: "레어",
    color: "#4fc3f7",
    bg: "#0d2a3a",
    prob: 0.3,
  },
  SR: {
    id: "SR",
    label: "슈퍼레어",
    color: "#ce93d8",
    bg: "#2a0d3a",
    prob: 0.15,
  },
  LEGENDARY: {
    id: "LEGENDARY",
    label: "레전더리",
    color: "#ffd700",
    bg: "#3a2a00",
    prob: 0.04,
  },
  HOLO: {
    id: "HOLO",
    label: "홀로그램",
    color: "#ff80ab",
    bg: "#3a0020",
    prob: 0.01,
  },
};

// ─── 스프라이트 URL 헬퍼 ────────────────────────────────────
const sprite = (id) =>
  `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${id}.png`;
const artSprite = (id) =>
  `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${id}.png`;
const shinyArtSprite = (id) =>
  `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;

// ─── 포켓몬 씰 목록 (1세대 151종) ─────────────────────────
export const ALL_SEALS = [
  // ── COMMON ──────────────────────────────────────────────
  { id: 1, name: "이상해씨", grade: "COMMON", pokeId: 1 },
  { id: 4, name: "파이리", grade: "COMMON", pokeId: 4 },
  { id: 7, name: "꼬부기", grade: "COMMON", pokeId: 7 },
  { id: 10, name: "캐터피", grade: "COMMON", pokeId: 10 },
  { id: 13, name: "뿔충이", grade: "COMMON", pokeId: 13 },
  { id: 16, name: "구구", grade: "COMMON", pokeId: 16 },
  { id: 19, name: "꼬렛", grade: "COMMON", pokeId: 19 },
  { id: 21, name: "깨비참", grade: "COMMON", pokeId: 21 },
  { id: 23, name: "아보", grade: "COMMON", pokeId: 23 },
  { id: 25, name: "피카츄", grade: "COMMON", pokeId: 25 },
  { id: 27, name: "모래두지", grade: "COMMON", pokeId: 27 },
  { id: 29, name: "니드런♀", grade: "COMMON", pokeId: 29 },
  { id: 32, name: "니드런♂", grade: "COMMON", pokeId: 32 },
  { id: 35, name: "삐삐", grade: "COMMON", pokeId: 35 },
  { id: 37, name: "식스테일", grade: "COMMON", pokeId: 37 },
  { id: 39, name: "푸린", grade: "COMMON", pokeId: 39 },
  { id: 41, name: "주뱃", grade: "COMMON", pokeId: 41 },
  { id: 43, name: "뚜벅쵸", grade: "COMMON", pokeId: 43 },
  { id: 46, name: "파라스", grade: "COMMON", pokeId: 46 },
  { id: 48, name: "콘팡", grade: "COMMON", pokeId: 48 },
  { id: 50, name: "디그다", grade: "COMMON", pokeId: 50 },
  { id: 52, name: "나옹", grade: "COMMON", pokeId: 52 },
  { id: 54, name: "고라파덕", grade: "COMMON", pokeId: 54 },
  { id: 56, name: "망키", grade: "COMMON", pokeId: 56 },
  { id: 58, name: "가디", grade: "COMMON", pokeId: 58 },
  { id: 60, name: "발챙이", grade: "COMMON", pokeId: 60 },
  { id: 63, name: "캐이시", grade: "COMMON", pokeId: 63 },
  { id: 66, name: "알통몬", grade: "COMMON", pokeId: 66 },
  { id: 69, name: "모다피", grade: "COMMON", pokeId: 69 },
  { id: 72, name: "왕눈해", grade: "COMMON", pokeId: 72 },
  { id: 74, name: "꼬마돌", grade: "COMMON", pokeId: 74 },
  { id: 77, name: "포니타", grade: "COMMON", pokeId: 77 },
  { id: 79, name: "야돈", grade: "COMMON", pokeId: 79 },
  { id: 81, name: "코일", grade: "COMMON", pokeId: 81 },
  { id: 83, name: "파오리", grade: "COMMON", pokeId: 83 },
  { id: 84, name: "두두", grade: "COMMON", pokeId: 84 },
  { id: 86, name: "쥬쥬", grade: "COMMON", pokeId: 86 },
  { id: 88, name: "질퍽이", grade: "COMMON", pokeId: 88 },
  { id: 90, name: "셀러", grade: "COMMON", pokeId: 90 },
  { id: 92, name: "고오스", grade: "COMMON", pokeId: 92 },
  { id: 95, name: "롱스톤", grade: "COMMON", pokeId: 95 },
  { id: 96, name: "슬리프", grade: "COMMON", pokeId: 96 },
  { id: 98, name: "크랩", grade: "COMMON", pokeId: 98 },
  { id: 100, name: "찌리리공", grade: "COMMON", pokeId: 100 },
  { id: 102, name: "아라리", grade: "COMMON", pokeId: 102 },
  { id: 104, name: "탕구리", grade: "COMMON", pokeId: 104 },
  { id: 108, name: "내루미", grade: "COMMON", pokeId: 108 },
  { id: 109, name: "또가스", grade: "COMMON", pokeId: 109 },
  { id: 111, name: "뿔카노", grade: "COMMON", pokeId: 111 },
  { id: 113, name: "럭키", grade: "COMMON", pokeId: 113 },
  { id: 114, name: "덩쿠리", grade: "COMMON", pokeId: 114 },
  // ── RARE ────────────────────────────────────────────────
  { id: 2, name: "이상해풀", grade: "RARE", pokeId: 2 },
  { id: 5, name: "리자드", grade: "RARE", pokeId: 5 },
  { id: 8, name: "어니부기", grade: "RARE", pokeId: 8 },
  { id: 11, name: "단데기", grade: "RARE", pokeId: 11 },
  { id: 14, name: "딱충이", grade: "RARE", pokeId: 14 },
  { id: 17, name: "피죤", grade: "RARE", pokeId: 17 },
  { id: 20, name: "레트라", grade: "RARE", pokeId: 20 },
  { id: 22, name: "깨비드릴조", grade: "RARE", pokeId: 22 },
  { id: 24, name: "아보크", grade: "RARE", pokeId: 24 },
  { id: 26, name: "라이츄", grade: "RARE", pokeId: 26 },
  { id: 28, name: "고지", grade: "RARE", pokeId: 28 },
  { id: 30, name: "니드리나", grade: "RARE", pokeId: 30 },
  { id: 33, name: "니드리노", grade: "RARE", pokeId: 33 },
  { id: 36, name: "픽시", grade: "RARE", pokeId: 36 },
  { id: 38, name: "나인테일", grade: "RARE", pokeId: 38 },
  { id: 40, name: "푸크린", grade: "RARE", pokeId: 40 },
  { id: 42, name: "골뱃", grade: "RARE", pokeId: 42 },
  { id: 44, name: "냄새꼬", grade: "RARE", pokeId: 44 },
  { id: 47, name: "파라섹트", grade: "RARE", pokeId: 47 },
  { id: 49, name: "도나리", grade: "RARE", pokeId: 49 },
  { id: 51, name: "닥트리오", grade: "RARE", pokeId: 51 },
  { id: 53, name: "페르시온", grade: "RARE", pokeId: 53 },
  { id: 55, name: "골덕", grade: "RARE", pokeId: 55 },
  { id: 57, name: "성원숭", grade: "RARE", pokeId: 57 },
  { id: 59, name: "윈디", grade: "RARE", pokeId: 59 },
  { id: 61, name: "슈륙챙이", grade: "RARE", pokeId: 61 },
  { id: 64, name: "윤겔라", grade: "RARE", pokeId: 64 },
  { id: 67, name: "근육몬", grade: "RARE", pokeId: 67 },
  { id: 70, name: "우츠동", grade: "RARE", pokeId: 70 },
  { id: 73, name: "독파리", grade: "RARE", pokeId: 73 },
  { id: 75, name: "데구리", grade: "RARE", pokeId: 75 },
  { id: 78, name: "날쌩마", grade: "RARE", pokeId: 78 },
  { id: 80, name: "야도란", grade: "RARE", pokeId: 80 },
  { id: 82, name: "레어코일", grade: "RARE", pokeId: 82 },
  { id: 85, name: "두트리오", grade: "RARE", pokeId: 85 },
  { id: 87, name: "쥬레곤", grade: "RARE", pokeId: 87 },
  { id: 89, name: "질뻐기", grade: "RARE", pokeId: 89 },
  { id: 91, name: "파르셀", grade: "RARE", pokeId: 91 },
  { id: 93, name: "고우스트", grade: "RARE", pokeId: 93 },
  { id: 97, name: "슬리퍼", grade: "RARE", pokeId: 97 },
  { id: 99, name: "킹크랩", grade: "RARE", pokeId: 99 },
  { id: 101, name: "붐볼", grade: "RARE", pokeId: 101 },
  { id: 103, name: "나시", grade: "RARE", pokeId: 103 },
  { id: 105, name: "텅구리", grade: "RARE", pokeId: 105 },
  { id: 110, name: "또도가스", grade: "RARE", pokeId: 110 },
  { id: 112, name: "코뿌리", grade: "RARE", pokeId: 112 },
  // ── SUPER RARE ──────────────────────────────────────────
  { id: 3, name: "이상해꽃", grade: "SR", pokeId: 3 },
  { id: 6, name: "리자몽", grade: "SR", pokeId: 6 },
  { id: 9, name: "거북왕", grade: "SR", pokeId: 9 },
  { id: 12, name: "버터플", grade: "SR", pokeId: 12 },
  { id: 15, name: "독침붕", grade: "SR", pokeId: 15 },
  { id: 18, name: "피죤투", grade: "SR", pokeId: 18 },
  { id: 31, name: "니드퀸", grade: "SR", pokeId: 31 },
  { id: 34, name: "니드킹", grade: "SR", pokeId: 34 },
  { id: 45, name: "라플레시아", grade: "SR", pokeId: 45 },
  { id: 62, name: "강챙이", grade: "SR", pokeId: 62 },
  { id: 65, name: "후딘", grade: "SR", pokeId: 65 },
  { id: 68, name: "괴력몬", grade: "SR", pokeId: 68 },
  { id: 71, name: "우츠보트", grade: "SR", pokeId: 71 },
  { id: 76, name: "딱구리", grade: "SR", pokeId: 76 },
  { id: 94, name: "팬텀", grade: "SR", pokeId: 94 },
  { id: 106, name: "시라소몬", grade: "SR", pokeId: 106 },
  { id: 107, name: "홍수몬", grade: "SR", pokeId: 107 },
  { id: 115, name: "캥카", grade: "SR", pokeId: 115 },
  { id: 116, name: "쏘드라", grade: "SR", pokeId: 116 },
  { id: 117, name: "시드라", grade: "SR", pokeId: 117 },
  { id: 118, name: "콘치", grade: "SR", pokeId: 118 },
  { id: 119, name: "왕콘치", grade: "SR", pokeId: 119 },
  { id: 120, name: "별가사리", grade: "SR", pokeId: 120 },
  { id: 121, name: "아쿠스타", grade: "SR", pokeId: 121 },
  { id: 122, name: "마임맨", grade: "SR", pokeId: 122 },
  { id: 123, name: "스라크", grade: "SR", pokeId: 123 },
  { id: 124, name: "루주라", grade: "SR", pokeId: 124 },
  { id: 125, name: "에레브", grade: "SR", pokeId: 125 },
  { id: 126, name: "마그마", grade: "SR", pokeId: 126 },
  { id: 127, name: "쁘사이저", grade: "SR", pokeId: 127 },
  { id: 128, name: "켄타로스", grade: "SR", pokeId: 128 },
  { id: 129, name: "잉어킹", grade: "SR", pokeId: 129 },
  { id: 130, name: "갸라도스", grade: "SR", pokeId: 130 },
  { id: 131, name: "라프라스", grade: "SR", pokeId: 131 },
  { id: 132, name: "메타몽", grade: "SR", pokeId: 132 },
  { id: 133, name: "이브이", grade: "SR", pokeId: 133 },
  { id: 134, name: "샤미드", grade: "SR", pokeId: 134 },
  { id: 135, name: "쥬피썬더", grade: "SR", pokeId: 135 },
  { id: 136, name: "부스터", grade: "SR", pokeId: 136 },
  { id: 137, name: "폴리곤", grade: "SR", pokeId: 137 },
  { id: 138, name: "암나이트", grade: "SR", pokeId: 138 },
  { id: 139, name: "암스타", grade: "SR", pokeId: 139 },
  { id: 140, name: "투구", grade: "SR", pokeId: 140 },
  { id: 141, name: "투구푸", grade: "SR", pokeId: 141 },
  { id: 142, name: "프테라", grade: "SR", pokeId: 142 },
  { id: 143, name: "잠만보", grade: "SR", pokeId: 143 },
  // ── LEGENDARY ───────────────────────────────────────────
  { id: 144, name: "프리져", grade: "LEGENDARY", pokeId: 144 },
  { id: 145, name: "썬더", grade: "LEGENDARY", pokeId: 145 },
  { id: 146, name: "파이어", grade: "LEGENDARY", pokeId: 146 },
  { id: 147, name: "미뇽", grade: "LEGENDARY", pokeId: 147 },
  { id: 148, name: "신뇽", grade: "LEGENDARY", pokeId: 148 },
  { id: 149, name: "망나뇽", grade: "LEGENDARY", pokeId: 149 },
  { id: 150, name: "뮤츠", grade: "LEGENDARY", pokeId: 150 },
  // ── HOLO ────────────────────────────────────────────────
  { id: 151, name: "뮤", grade: "HOLO", pokeId: 151 },
  { id: 1001, name: "피카츄(홀로)", grade: "HOLO", pokeId: 25 },
  { id: 1004, name: "이브이(홀로)", grade: "HOLO", pokeId: 133 },
  { id: 1002, name: "리자몽(홀로)", grade: "HOLO", pokeId: 6 },
  { id: 1005, name: "이상해꽃(홀로)", grade: "HOLO", pokeId: 3 },
  { id: 1006, name: "거북왕(홀로)", grade: "HOLO", pokeId: 9 },
  { id: 1007, name: "망나뇽(홀로)", grade: "HOLO", pokeId: 149 },
  { id: 1003, name: "뮤츠(홀로)", grade: "HOLO", pokeId: 150 },
  // ── 이로치 HOLO ─────────────────────────────────────────
  {
    id: 1008,
    name: "황금 잉어킹",
    grade: "HOLO",
    pokeId: 129,
    holoType: "shinyArt",
  },
  {
    id: 1009,
    name: "붉은 갸라도스",
    grade: "HOLO",
    pokeId: 130,
    holoType: "shinyArt",
  },
].map((s) => ({
  ...s,
  sprite: sprite(s.pokeId),
  artwork:
    s.holoType === "shinyArt" ? shinyArtSprite(s.pokeId) : artSprite(s.pokeId),
}));

const SEALS_BY_GRADE = Object.fromEntries(
  Object.keys(SEAL_GRADES).map((g) => [
    g,
    ALL_SEALS.filter((s) => s.grade === g),
  ])
);

// ─── 빵 종류 정의 ─────────────────────────────────────────
export const BREAD_TYPES = {
  basic: {
    id: "basic",
    name: "이상해씨의 초코파운드",
    price: 150,
    desc: "달콤한 초코파운드. 일반~레어 씰이 들어있어요.",
    color: "#4a8a3a",
    gradient: "linear-gradient(135deg,#2d6a2d,#1a3a1a)",
    bagGradient: "linear-gradient(160deg,#1a3a1a,#2d5a2d)",
    bagLine1: "디그다의",
    bagLine2: "딸기 카스타드빵",
    imgUrl: `${CDN}/bread1.png`,
    pokeImg:
      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/50.png",
    pool: { COMMON: 0.73, RARE: 0.26, SR: 0.01, LEGENDARY: 0, HOLO: 0 },
  },
  cream: {
    id: "cream",
    name: "파이리의 화르륵 핫소스빵",
    price: 400,
    desc: "매콤달콤 핫소스빵. 레어~슈퍼레어 씰 확률 UP!",
    color: "#E8763A",
    gradient: "linear-gradient(135deg,#b84010,#7a1a00)",
    bagGradient: "linear-gradient(160deg,#0a4a6a,#1a8ab5)",
    bagLine1: "꼬부기의",
    bagLine2: "등껍질 크림빵",
    imgUrl: `${CDN}/bread2.png`,
    pokeImg:
      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/7.png",
    pool: { COMMON: 0.42, RARE: 0.42, SR: 0.15, LEGENDARY: 0.01, HOLO: 0 },
  },
  choco: {
    id: "choco",
    name: "꼬부기의 달콤바삭 초코칩",
    price: 900,
    desc: "달콤바삭 초코칩빵. 전설 포켓몬이 나올지도?",
    color: "#4fc3f7",
    gradient: "linear-gradient(135deg,#0d5a8a,#052a50)",
    bagGradient: "linear-gradient(160deg,#1a0a05,#3d1a0a)",
    bagLine1: "돌아온 고오스",
    bagLine2: "초코케익",
    imgUrl: `${CDN}/bread3.png`,
    pokeImg:
      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/92.png",
    pool: { COMMON: 0.18, RARE: 0.35, SR: 0.44, LEGENDARY: 0.02, HOLO: 0.01 },
  },
  champion: {
    id: "champion",
    name: "피카피카 촉촉치즈케잌",
    price: 2200,
    desc: "레전더리 확정! 홀로그램 씰도 노려볼 수 있어요.",
    color: "#ffd700",
    gradient: "linear-gradient(135deg,#c8900a,#8a5c00)",
    bagGradient: "linear-gradient(160deg,#050518,#0f0f35)",
    bagLine1: "돌아온 로켓단",
    bagLine2: "초코롤",
    imgUrl: `${CDN}/bread4.png`,
    pokeImg:
      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/52.png",
    pool: { COMMON: 0.08, RARE: 0.27, SR: 0.57, LEGENDARY: 0.05, HOLO: 0.03 },
  },
};

// ─── 가챠 뽑기 핵심 함수 ────────────────────────────────────
// ✅ 부동소수점 오차 방지 — 마지막 항목을 fallback으로 처리
export function rollSeal(breadId) {
  const bread = BREAD_TYPES[breadId];
  if (!bread) throw new Error(`Unknown bread: ${breadId}`);
  const rand = Math.random();
  let cumulative = 0;
  const entries = Object.entries(bread.pool);
  for (let i = 0; i < entries.length; i++) {
    const [grade, prob] = entries[i];
    cumulative += prob;
    if (rand < cumulative || i === entries.length - 1) {
      const pool = SEALS_BY_GRADE[grade];
      if (!pool || pool.length === 0) continue;
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  // fallback: COMMON 반환 (안전망)
  const fallback = SEALS_BY_GRADE["COMMON"];
  return fallback[Math.floor(Math.random() * fallback.length)];
}

// ─── 도감 & 인벤토리 유틸 ───────────────────────────────────
const STORAGE_KEY = "pokeset_sealdex";

export function loadSealDex() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveSealDex(dex) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dex));
}

export function acquireSeal(seal) {
  const dex = loadSealDex();
  const key = String(seal.id);
  const prev = dex[key] || { count: 0, shards: 0 };
  const isNew = prev.count === 0;
  const count = prev.count + 1;
  const SHARD_MAP = { COMMON: 1, RARE: 3, SR: 8, LEGENDARY: 20, HOLO: 50 };
  const shardsGained = isNew ? 0 : SHARD_MAP[seal.grade] ?? 1;
  const shards = prev.shards + shardsGained;
  dex[key] = { count, shards };
  saveSealDex(dex);
  return { dex, seal, isNew, count, shardsGained };
}

export function getDexProgress(dex) {
  const total = ALL_SEALS.length;
  const collected = ALL_SEALS.filter(
    (s) => dex[String(s.id)]?.count > 0
  ).length;
  return { collected, total, percent: Math.round((collected / total) * 100) };
}

// ✅ 버그 수정: null 값 안전하게 처리 (v?.shards)
export function getTotalShards(dex) {
  return Object.values(dex).reduce((sum, v) => sum + (v?.shards || 0), 0);
}

export const DEX_REWARDS = [
  { percent: 25, reward: "배경: 포켓몬센터", icon: "🏥" },
  { percent: 50, reward: "이모티콘팩: 전설의 트레이너", icon: "🏆" },
  { percent: 75, reward: "배경: 포켓몬리그", icon: "⚡" },
  { percent: 100, reward: "칭호: 포켓몬 마스터 + 뮤츠(홀로) 확정", icon: "✨" },
];

export function checkDexRewards(dex) {
  const { percent } = getDexProgress(dex);
  return DEX_REWARDS.filter((r) => percent >= r.percent);
}
