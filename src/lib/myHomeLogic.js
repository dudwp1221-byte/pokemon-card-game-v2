// src/lib/myHomeLogic.js  ── 포켓몬 마이홈 시스템 (Kenney 에셋 기반)
import { db } from "./db";

// ── 상수 ──────────────────────────────────────────────────
export const MAX_POKEMON = 6;
export const MAX_FURNITURE = 20;
export const TAP_DAILY = 5;
export const FRAGMENTS_NEEDED = 3;

// 그리드 (방 크기)
export const GRID_COLS = 8;
export const GRID_ROWS = 8;

// 아이소메트릭 타일 사이즈
export const TILE_W = 40;
export const TILE_H = 20;

export function iso(col, row) {
  return {
    x: (col - row) * TILE_W,
    y: (col + row) * TILE_H,
  };
}

// ── Kenney CDN ────────────────────────────────────────────
export const KENNEY_CDN =
  "https://cdn.jsdelivr.net/gh/dudwp1221-byte/pokeset-images@main/Isometric";

export function getFurnitureUrl(itemId, dir = "SW") {
  return `${KENNEY_CDN}/${itemId}_${dir}.png`;
}

// ══════════════════════════════════════════════════════════
//  🏠 방 테마 (바닥 색상 팔레트)
// ══════════════════════════════════════════════════════════
export const ROOM_THEMES = [
  {
    id: "cozy_wood",
    name: "우드",
    cost: 0,
    floor1: "#D4A373",
    floor2: "#C0895E",
    wall: "#FAEDCD",
    bg: "linear-gradient(180deg,#FAEDCD,#E9D4A8)",
  },
  {
    id: "marble",
    name: "대리석",
    cost: 0,
    floor1: "#E0DDD7",
    floor2: "#C9C5BD",
    wall: "#F5F3EE",
    bg: "linear-gradient(180deg,#F5F3EE,#DDD9D2)",
  },
  {
    id: "tatami",
    name: "다다미",
    cost: 0,
    floor1: "#BFAE70",
    floor2: "#A39251",
    wall: "#E8D9A8",
    bg: "linear-gradient(180deg,#E8D9A8,#C9B87D)",
  },
  {
    id: "mint",
    name: "민트",
    cost: 0,
    floor1: "#A0D0B5",
    floor2: "#80B898",
    wall: "#E8F5EC",
    bg: "linear-gradient(180deg,#E8F5EC,#C8E5D5)",
  },
  {
    id: "pink",
    name: "핑크",
    cost: 0,
    floor1: "#F0B8B8",
    floor2: "#DB8C8C",
    wall: "#FFEAEA",
    bg: "linear-gradient(180deg,#FFEAEA,#F5CFCF)",
  },
  {
    id: "dark",
    name: "다크",
    cost: 0,
    floor1: "#45455A",
    floor2: "#2E2E42",
    wall: "#1E1E2E",
    bg: "linear-gradient(180deg,#1E1E2E,#0E0E1A)",
  },
];

// ══════════════════════════════════════════════════════════
//  🛋️ 가구 카탈로그
// ══════════════════════════════════════════════════════════
export const FURNITURE_CATALOG = [
  // 침실
  {
    id: "bedSingle",
    name: "싱글 침대",
    category: "bedroom",
    cost: 0,
    w: 2,
    h: 2,
  },
  {
    id: "bedDouble",
    name: "더블 침대",
    category: "bedroom",
    cost: 0,
    w: 2,
    h: 2,
  },
  { id: "bedBunk", name: "2층 침대", category: "bedroom", cost: 0, w: 2, h: 2 },
  {
    id: "cabinetBed",
    name: "침대 옆 서랍",
    category: "bedroom",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "cabinetBedDrawer",
    name: "협탁",
    category: "bedroom",
    cost: 0,
    w: 1,
    h: 1,
  },
  { id: "pillow", name: "쿠션", category: "bedroom", cost: 0, w: 1, h: 1 },
  {
    id: "pillowBlue",
    name: "파랑 쿠션",
    category: "bedroom",
    cost: 0,
    w: 1,
    h: 1,
  },

  // 거실
  { id: "loungeSofa", name: "소파", category: "living", cost: 0, w: 2, h: 1 },
  {
    id: "loungeSofaLong",
    name: "긴 소파",
    category: "living",
    cost: 0,
    w: 3,
    h: 1,
  },
  {
    id: "loungeSofaCorner",
    name: "ㄱ자 소파",
    category: "living",
    cost: 0,
    w: 2,
    h: 2,
  },
  {
    id: "loungeSofaOttoman",
    name: "오토만 소파",
    category: "living",
    cost: 0,
    w: 2,
    h: 2,
  },
  {
    id: "loungeChair",
    name: "안락의자",
    category: "living",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "loungeChairRelax",
    name: "릴렉스 의자",
    category: "living",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "loungeDesignChair",
    name: "디자인 의자",
    category: "living",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "loungeDesignSofa",
    name: "디자인 소파",
    category: "living",
    cost: 0,
    w: 2,
    h: 1,
  },
  {
    id: "tableCoffee",
    name: "커피 테이블",
    category: "living",
    cost: 0,
    w: 2,
    h: 1,
  },
  {
    id: "tableCoffeeSquare",
    name: "사각 커피 테이블",
    category: "living",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "tableCoffeeGlass",
    name: "유리 커피 테이블",
    category: "living",
    cost: 0,
    w: 2,
    h: 1,
  },
  {
    id: "cabinetTelevision",
    name: "TV 거치대",
    category: "living",
    cost: 0,
    w: 2,
    h: 1,
  },
  {
    id: "televisionModern",
    name: "TV",
    category: "living",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "televisionVintage",
    name: "빈티지 TV",
    category: "living",
    cost: 0,
    w: 1,
    h: 1,
  },

  // 주방
  {
    id: "kitchenFridge",
    name: "냉장고",
    category: "kitchen",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "kitchenFridgeLarge",
    name: "대형 냉장고",
    category: "kitchen",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "kitchenStove",
    name: "가스레인지",
    category: "kitchen",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "kitchenSink",
    name: "싱크대",
    category: "kitchen",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "kitchenMicrowave",
    name: "전자레인지",
    category: "kitchen",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "kitchenCoffeeMachine",
    name: "커피 머신",
    category: "kitchen",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "kitchenBlender",
    name: "블렌더",
    category: "kitchen",
    cost: 0,
    w: 1,
    h: 1,
  },
  { id: "toaster", name: "토스터", category: "kitchen", cost: 0, w: 1, h: 1 },
  { id: "stoolBar", name: "바 스툴", category: "kitchen", cost: 0, w: 1, h: 1 },
  {
    id: "kitchenBar",
    name: "아일랜드 바",
    category: "kitchen",
    cost: 0,
    w: 2,
    h: 1,
  },

  // 욕실
  { id: "bathtub", name: "욕조", category: "bathroom", cost: 0, w: 2, h: 1 },
  { id: "shower", name: "샤워부스", category: "bathroom", cost: 0, w: 1, h: 1 },
  { id: "toilet", name: "변기", category: "bathroom", cost: 0, w: 1, h: 1 },
  {
    id: "bathroomSink",
    name: "세면대",
    category: "bathroom",
    cost: 0,
    w: 1,
    h: 1,
  },
  { id: "washer", name: "세탁기", category: "bathroom", cost: 0, w: 1, h: 1 },

  // 업무
  { id: "desk", name: "책상", category: "office", cost: 0, w: 2, h: 1 },
  {
    id: "deskCorner",
    name: "코너 책상",
    category: "office",
    cost: 0,
    w: 2,
    h: 2,
  },
  {
    id: "chairDesk",
    name: "사무 의자",
    category: "office",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "bookcaseOpen",
    name: "오픈 책장",
    category: "office",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "bookcaseClosed",
    name: "닫힌 책장",
    category: "office",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "bookcaseClosedWide",
    name: "와이드 책장",
    category: "office",
    cost: 0,
    w: 2,
    h: 1,
  },
  {
    id: "bookcaseOpenLow",
    name: "낮은 책장",
    category: "office",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "computerScreen",
    name: "컴퓨터 모니터",
    category: "office",
    cost: 0,
    w: 1,
    h: 1,
  },
  { id: "laptop", name: "노트북", category: "office", cost: 0, w: 1, h: 1 },

  // 조명
  {
    id: "lampRoundFloor",
    name: "원형 플로어 램프",
    category: "lighting",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "lampSquareFloor",
    name: "사각 플로어 램프",
    category: "lighting",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "lampRoundTable",
    name: "원형 테이블 램프",
    category: "lighting",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "lampSquareTable",
    name: "사각 테이블 램프",
    category: "lighting",
    cost: 0,
    w: 1,
    h: 1,
  },

  // 장식
  {
    id: "plantSmall1",
    name: "작은 화분 1",
    category: "deco",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "plantSmall2",
    name: "작은 화분 2",
    category: "deco",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "plantSmall3",
    name: "작은 화분 3",
    category: "deco",
    cost: 0,
    w: 1,
    h: 1,
  },
  { id: "pottedPlant", name: "큰 화분", category: "deco", cost: 0, w: 1, h: 1 },
  { id: "bear", name: "곰 인형", category: "deco", cost: 0, w: 1, h: 1 },
  { id: "books", name: "책 더미", category: "deco", cost: 0, w: 1, h: 1 },
  { id: "radio", name: "라디오", category: "deco", cost: 0, w: 1, h: 1 },
  { id: "speaker", name: "스피커", category: "deco", cost: 0, w: 1, h: 1 },
  {
    id: "cardboardBoxClosed",
    name: "상자 (닫힘)",
    category: "deco",
    cost: 0,
    w: 1,
    h: 1,
  },
  {
    id: "cardboardBoxOpen",
    name: "상자 (열림)",
    category: "deco",
    cost: 0,
    w: 1,
    h: 1,
  },
  { id: "trashcan", name: "휴지통", category: "deco", cost: 0, w: 1, h: 1 },
  {
    id: "coatRackStanding",
    name: "옷걸이",
    category: "deco",
    cost: 0,
    w: 1,
    h: 1,
  },

  // 러그
  { id: "rugRound", name: "원형 러그", category: "rug", cost: 0, w: 2, h: 2 },
  {
    id: "rugRectangle",
    name: "직사각 러그",
    category: "rug",
    cost: 0,
    w: 3,
    h: 2,
  },
  {
    id: "rugSquare",
    name: "정사각 러그",
    category: "rug",
    cost: 0,
    w: 2,
    h: 2,
  },
  {
    id: "rugRounded",
    name: "라운드 러그",
    category: "rug",
    cost: 0,
    w: 2,
    h: 2,
  },
  { id: "rugDoormat", name: "도어매트", category: "rug", cost: 0, w: 1, h: 1 },
];

export const CATEGORIES = [
  { id: "bedroom", name: "침실", icon: "🛏️" },
  { id: "living", name: "거실", icon: "🛋️" },
  { id: "kitchen", name: "주방", icon: "🍳" },
  { id: "bathroom", name: "욕실", icon: "🛁" },
  { id: "office", name: "업무", icon: "💻" },
  { id: "lighting", name: "조명", icon: "💡" },
  { id: "deco", name: "장식", icon: "🌿" },
  { id: "rug", name: "러그", icon: "🟫" },
];

export function getFurnitureInfo(id) {
  return FURNITURE_CATALOG.find((f) => f.id === id);
}

// ══════════════════════════════════════════════════════════
//  간식
// ══════════════════════════════════════════════════════════
export const SNACKS = [
  { id: "berry", name: "열매", emoji: "🍓", cost: 0, aff: 8 },
  { id: "pokepuff", name: "포케퍼프", emoji: "🧁", cost: 0, aff: 18 },
  { id: "rare_candy", name: "레어캔디", emoji: "🍬", cost: 0, aff: 32 },
];

// ══════════════════════════════════════════════════════════
//  포켓몬 슬롯
// ══════════════════════════════════════════════════════════
export function makeSlot(pokeId, name, spotIdx = 0) {
  return {
    pokeId,
    name,
    nickname: "",
    affinity: 0,
    fragments: 0,
    sealComplete: false,
    spotIdx,
    lastTapDate: null,
    tapCount: 0,
    lastBathDate: null,
  };
}

// ══════════════════════════════════════════════════════════
//  Firebase
// ══════════════════════════════════════════════════════════
const DEFAULT_HOME = {
  themeId: "cozy_wood",
  slots: [],
  furniture: [],
  purchasedThemes: ["cozy_wood"],
  purchasedFurniture: [],
};

export async function loadMyHome(nickname) {
  try {
    const key = encodeURIComponent(nickname.trim()).replace(/%/g, "_");
    const data = await db.get(`users/${key}/myHome`).catch(() => null);
    if (!data) return { ...DEFAULT_HOME };

    const slots = Array.isArray(data.slots)
      ? data.slots
      : data.slots
      ? Object.values(data.slots).filter(Boolean)
      : [];

    const furniture = Array.isArray(data.furniture)
      ? data.furniture
      : data.furniture
      ? Object.values(data.furniture).filter(Boolean)
      : [];

    return {
      ...DEFAULT_HOME,
      ...data,
      themeId: data.themeId ?? data.roomId ?? "cozy_wood",
      slots: slots.map((s) => ({ ...s, pokeId: Number(s.pokeId) })),
      furniture,
      purchasedThemes: data.purchasedThemes ??
        data.purchasedRooms ?? ["cozy_wood"],
      purchasedFurniture: data.purchasedFurniture ?? [],
    };
  } catch (e) {
    return { ...DEFAULT_HOME };
  }
}

export async function saveMyHome(nick, home) {
  try {
    const key = encodeURIComponent(nick.trim()).replace(/%/g, "_");
    await db.update(`users/${key}/myHome`, { ...home, updatedAt: Date.now() });
  } catch (e) {
    console.error(e);
  }
}

// ══════════════════════════════════════════════════════════
//  가구 배치 / 제거 / 이동
// ══════════════════════════════════════════════════════════
export function canPlaceFurniture(
  furniture,
  itemId,
  col,
  row,
  excludeId = null
) {
  const info = getFurnitureInfo(itemId);
  if (!info) return false;

  if (col < 0 || row < 0) return false;
  if (col + info.w > GRID_COLS) return false;
  if (row + info.h > GRID_ROWS) return false;

  if (info.category === "rug") return true;

  for (const f of furniture) {
    if (excludeId && f.id === excludeId) continue;
    const fInfo = getFurnitureInfo(f.itemId);
    if (!fInfo) continue;
    if (fInfo.category === "rug") continue;

    const overlap =
      col < f.col + fInfo.w &&
      col + info.w > f.col &&
      row < f.row + fInfo.h &&
      row + info.h > f.row;
    if (overlap) return false;
  }

  return true;
}

export function placeFurniture(furniture, itemId, col, row, dir = "SW") {
  if (!canPlaceFurniture(furniture, itemId, col, row)) return furniture;
  if (furniture.length >= MAX_FURNITURE) return furniture;
  const newId = `furn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  return [...furniture, { id: newId, itemId, col, row, dir }];
}

export function removeFurniture(furniture, id) {
  return furniture.filter((f) => f.id !== id);
}

export function moveFurniture(furniture, id, col, row) {
  const item = furniture.find((f) => f.id === id);
  if (!item) return furniture;
  if (!canPlaceFurniture(furniture, item.itemId, col, row, id))
    return furniture;
  return furniture.map((f) => (f.id === id ? { ...f, col, row } : f));
}

export function rotateFurniture(furniture, id) {
  const dirs = ["SW", "SE", "NE", "NW"];
  return furniture.map((f) => {
    if (f.id !== id) return f;
    const curIdx = dirs.indexOf(f.dir ?? "SW");
    return { ...f, dir: dirs[(curIdx + 1) % 4] };
  });
}

// ══════════════════════════════════════════════════════════
//  포켓몬 상호작용
// ══════════════════════════════════════════════════════════
export function tapSlot(slots, pokeId) {
  const today = new Date().toDateString();
  return slots.map((s) => {
    if (s.pokeId !== pokeId) return s;
    const isNew = s.lastTapDate !== today;
    const cnt = isNew ? 1 : (s.tapCount ?? 0) + 1;
    if (!isNew && (s.tapCount ?? 0) >= TAP_DAILY) return s;
    return {
      ...s,
      affinity: Math.min(100, s.affinity + 3),
      tapCount: cnt,
      lastTapDate: today,
    };
  });
}

export function feedSlot(slots, pokeId, snackId) {
  const snack = SNACKS.find((s) => s.id === snackId);
  if (!snack) return slots;
  return slots.map((s) =>
    s.pokeId === pokeId
      ? { ...s, affinity: Math.min(100, s.affinity + snack.aff) }
      : s
  );
}

export function bathSlot(slots, pokeId) {
  const today = new Date().toDateString();
  return slots.map((s) =>
    s.pokeId === pokeId && s.lastBathDate !== today
      ? { ...s, affinity: Math.min(100, s.affinity + 8), lastBathDate: today }
      : s
  );
}

export function renameSlot(slots, pokeId, nick) {
  return slots.map((s) =>
    s.pokeId === pokeId ? { ...s, nickname: nick.trim().slice(0, 10) } : s
  );
}

export function applyDailyVisit(slots) {
  const today = new Date().toDateString();
  return slots.map((s) =>
    s.lastVisitDate === today
      ? s
      : { ...s, affinity: Math.min(100, s.affinity + 8), lastVisitDate: today }
  );
}

// ══════════════════════════════════════════════════════════
//  친밀도
// ══════════════════════════════════════════════════════════
export function getAffinityLevel(aff) {
  if (aff >= 81) return { name: "베프💖", color: "#f472b6", icon: "💖" };
  if (aff >= 51) return { name: "절친⭐", color: "#fbbf24", icon: "⭐" };
  if (aff >= 21) return { name: "친구😊", color: "#4ade80", icon: "😊" };
  return { name: "낯선👋", color: "#94a3b8", icon: "👋" };
}

// ══════════════════════════════════════════════════════════
//  포켓몬 스프라이트 URL
// ══════════════════════════════════════════════════════════
export function getPokemonGif(id) {
  if (id <= 649)
    return `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
  return `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function getDisplayName(s) {
  return s.nickname?.trim() || s.name || `No.${s.pokeId}`;
}
