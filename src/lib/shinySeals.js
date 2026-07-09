// src/lib/shinySeals.js

const STORAGE_KEY = "pokeset_shiny_dex";

// ── PokeAPI 공식 아트워크 이로치 버전 ──
export function getShinyArtwork(pokeId) {
  return `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/shiny/${pokeId}.png`;
}

// ── 이로치 씰 등급별 가중치 (낮을수록 희귀) ──
// 등급 라벨 없음, 확률만 차등 적용
const SHINY_WEIGHTS = {
  // ✦ Ultra (weight 5) — 전설 포켓몬
  150: 5,
  151: 5,
  144: 5,
  145: 5,
  146: 5,
  // ✦ Super Rare (weight 20) — 최종진화 인기 포켓몬
  3: 20,
  6: 20,
  9: 20,
  130: 20,
  149: 20,
  131: 20,
  143: 20,
  142: 20,
  25: 20,
  133: 20,
  59: 20,
  65: 20,
  68: 20,
  94: 20,
  38: 20,
  134: 20,
  135: 20,
  136: 20,
  127: 20,
  128: 20,
  // ✦ Rare (weight 50) — 중간진화 / 강한 포켓몬
  2: 50,
  5: 50,
  8: 50,
  26: 50,
  45: 50,
  51: 50,
  53: 50,
  55: 50,
  57: 50,
  62: 50,
  71: 50,
  73: 50,
  76: 50,
  78: 50,
  80: 50,
  82: 50,
  85: 50,
  87: 50,
  91: 50,
  93: 50,
  97: 50,
  99: 50,
  101: 50,
  103: 50,
  105: 50,
  106: 50,
  107: 50,
  108: 50,
  110: 50,
  112: 50,
  115: 50,
  117: 50,
  119: 50,
  121: 50,
  122: 50,
  123: 50,
  124: 50,
  125: 50,
  126: 50,
  139: 50,
  141: 50,
  148: 50,
  // 나머지는 기본값 100 (Common)
};

function getWeight(pokeId) {
  return SHINY_WEIGHTS[pokeId] ?? 100;
}

// ── 1세대 포켓몬 151마리 ──
const GEN1 = [
  [1, "이상해씨"],
  [2, "이상해풀"],
  [3, "이상해꽃"],
  [4, "파이리"],
  [5, "리자드"],
  [6, "리자몽"],
  [7, "꼬부기"],
  [8, "어니부기"],
  [9, "거북왕"],
  [10, "캐터피"],
  [11, "단데기"],
  [12, "버터플"],
  [13, "흰둥이"],
  [14, "딱충이"],
  [15, "독침붕"],
  [16, "구구"],
  [17, "피죤"],
  [18, "피죤투"],
  [19, "꼬렛"],
  [20, "레트라"],
  [21, "깨비참"],
  [22, "깨비드릴조"],
  [23, "아보"],
  [24, "아보크"],
  [25, "피카츄"],
  [26, "라이츄"],
  [27, "모래두지"],
  [28, "고지"],
  [29, "니드런♀"],
  [30, "니드리나"],
  [31, "니드퀸"],
  [32, "니드런♂"],
  [33, "니드리노"],
  [34, "니드킹"],
  [35, "삐삐"],
  [36, "픽시"],
  [37, "식스테일"],
  [38, "나인테일"],
  [39, "푸린"],
  [40, "푸크린"],
  [41, "주뱃"],
  [42, "골뱃"],
  [43, "뚜벅초"],
  [44, "냄새꼴"],
  [45, "라플레시아"],
  [46, "파라스"],
  [47, "파라섹트"],
  [48, "콘팡"],
  [49, "도나리"],
  [50, "디그다"],
  [51, "닥트리오"],
  [52, "나옹"],
  [53, "페르시온"],
  [54, "고라파덕"],
  [55, "골덕"],
  [56, "망키"],
  [57, "성원숭"],
  [58, "가디"],
  [59, "윈디"],
  [60, "발챙이"],
  [61, "슈륙챙이"],
  [62, "강챙이"],
  [63, "케이시"],
  [64, "윤겔라"],
  [65, "후딘"],
  [66, "알통몬"],
  [67, "근육몬"],
  [68, "괴력몬"],
  [69, "모다피"],
  [70, "우츠동"],
  [71, "우츠보트"],
  [72, "왕눈해"],
  [73, "독파리"],
  [74, "꼬마돌"],
  [75, "데구리"],
  [76, "딱구리"],
  [77, "포니타"],
  [78, "날쌩마"],
  [79, "야돈"],
  [80, "야도란"],
  [81, "코일"],
  [82, "레어코일"],
  [83, "파오리"],
  [84, "두두"],
  [85, "두트리오"],
  [86, "쥬쥬"],
  [87, "쥬레곤"],
  [88, "질퍽이"],
  [89, "질뻐기"],
  [90, "셀러"],
  [91, "파르셀"],
  [92, "고오스"],
  [93, "고우스트"],
  [94, "팬텀"],
  [95, "롱스톤"],
  [96, "슬리프"],
  [97, "슬리퍼"],
  [98, "크랩"],
  [99, "킹크랩"],
  [100, "찌리리공"],
  [101, "붐볼"],
  [102, "아라리"],
  [103, "나시"],
  [104, "탕구리"],
  [105, "텅구리"],
  [106, "시라소몬"],
  [107, "홍수몬"],
  [108, "내루미"],
  [109, "또가스"],
  [110, "또도가스"],
  [111, "뿔카노"],
  [112, "코뿌리"],
  [113, "럭키"],
  [114, "덩쿠리"],
  [115, "캥카"],
  [116, "쏘드라"],
  [117, "시드라"],
  [118, "콘치"],
  [119, "왕콘치"],
  [120, "별가사리"],
  [121, "아쿠스타"],
  [122, "마임맨"],
  [123, "스라크"],
  [124, "루주라"],
  [125, "에레브"],
  [126, "마그마"],
  [127, "쁘사이저"],
  [128, "켄타로스"],
  [129, "잉어킹"],
  [130, "갸라도스"],
  [131, "라프라스"],
  [132, "메타몽"],
  [133, "이브이"],
  [134, "샤미드"],
  [135, "쥬피썬더"],
  [136, "부스터"],
  [137, "폴리곤"],
  [138, "암나이트"],
  [139, "암스타"],
  [140, "투구"],
  [141, "투구푸스"],
  [142, "프테라"],
  [143, "잠만보"],
  [144, "프리져"],
  [145, "썬더"],
  [146, "파이어"],
  [147, "미뇽"],
  [148, "신뇽"],
  [149, "망나뇽"],
  [150, "뮤츠"],
  [151, "뮤"],
];

// ── 가중치 → 등급 변환 (홀로그램 없음) ──
function getShinyGrade(pokeId) {
  const w = SHINY_WEIGHTS[pokeId] ?? 100;
  if (w <= 5) return "LEGENDARY";
  if (w <= 20) return "SR";
  if (w <= 50) return "RARE";
  return "COMMON";
}

// ── 이로치 씰 목록 생성 ──
export const SHINY_SEALS = GEN1.map(([pokeId, name]) => ({
  id: `shiny_${pokeId}`,
  name,
  grade: getShinyGrade(pokeId),
  pokeId,
  get artwork() {
    return getShinyArtwork(pokeId);
  },
}));

export function getShinyById(id) {
  return SHINY_SEALS.find((s) => s.id === id) || null;
}

// ── 이로치 도감 로드/저장 ──
export function loadShinyDex() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveShinyDex(dex) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dex));
  window.dispatchEvent(new Event("pokeset_shiny_dex_updated"));
}

// ── 랜덤 이로치 씰 지급 (가중치 랜덤, 중복 없음) ──
export function giveRandomShinySeal() {
  const dex = loadShinyDex();

  // 미보유 씰만 후보
  const unowned = SHINY_SEALS.filter((s) => !(dex[s.id]?.count > 0));
  if (unowned.length === 0) return null; // 151마리 완성

  // 가중치 기반 랜덤 선택
  const totalWeight = unowned.reduce((sum, s) => sum + getWeight(s.pokeId), 0);
  let roll = Math.random() * totalWeight;
  let seal = unowned[0];
  for (const s of unowned) {
    roll -= getWeight(s.pokeId);
    if (roll <= 0) {
      seal = s;
      break;
    }
  }

  dex[seal.id] = { count: 1, acquiredAt: Date.now() };
  saveShinyDex(dex);

  try {
    const fn = window.__cloudSave;
    if (typeof fn === "function") fn({ shinyDex: dex }).catch(() => {});
  } catch {}

  return seal;
}

export function hasAnyShinySeal() {
  const dex = loadShinyDex();
  return SHINY_SEALS.some((s) => dex[s.id]?.count > 0);
}

export function getShinyOwnedCount() {
  const dex = loadShinyDex();
  return SHINY_SEALS.filter((s) => dex[s.id]?.count > 0).length;
}
