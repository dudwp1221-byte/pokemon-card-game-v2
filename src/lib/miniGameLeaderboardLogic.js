// src/lib/miniGameLeaderboardLogic.js
// ══════════════════════════════════════════════════════════
//  미니게임 주간 랭킹 + 우편함 보상
//  월요일 00:00 KST 기준 매주 초기화
// ══════════════════════════════════════════════════════════
import { db, getPlayerUid } from "./db";
import { MINI_GAMES, getNormalizedScore } from "./miniGameLogic";
import {
  sendLetter,
  isRewardAlreadySent,
  markRewardSent,
  LETTER_TYPE,
} from "./mailboxLogic";

// ── admin 판별 ──
function isAdmin(nickname) {
  return (nickname ?? "").trim().toLowerCase() === "admin";
}

// ══════════════════════════════════════════════════════════
//  주차 계산 (KST 월요일 00:00 기준)
//  ★★★ FIX: MONDAY_EPOCH_UTC 가 10시간 어긋나 있던 것 보정
//      이전: 1703998800000 (2023-12-31 14:00 KST, 일요일 오후)
//      이후: 1704034800000 (2024-01-01 00:00 KST, 월요일 자정)
//      weekIndex 결과는 동일하게 떨어지므로 기존 DB 키(w119/w121)와 호환 ✅
// ══════════════════════════════════════════════════════════
const KST_OFFSET = 9 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function getKstMondayMs(now = Date.now()) {
  const nowKst = now + KST_OFFSET;
  const dayOfWeek = new Date(nowKst).getUTCDay();
  const daysToMon = (dayOfWeek + 6) % 7;
  const monKst = nowKst - daysToMon * 86400000;
  const d = new Date(monKst);
  const monMidnightKst =
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - KST_OFFSET;
  return monMidnightKst;
}

// ★ FIX: 진짜 KST 월요일 자정 (2024-01-01 00:00 KST)
const MONDAY_EPOCH_UTC = 1704034800000;
const DELAYED_RESET = 1777215600000; // 4/27 00:00 KST
const DELAYED_WEEK_START = 1776006000000; // 4/13 00:00 KST
const DELAYED_WEEK_INDEX = Math.floor(
  (DELAYED_WEEK_START - MONDAY_EPOCH_UTC) / WEEK_MS
);

export function getCurrentWeekKey(now = Date.now()) {
  if (now < DELAYED_RESET) return `w${DELAYED_WEEK_INDEX}`;
  const mon = getKstMondayMs(now);
  return `w${Math.floor((mon - MONDAY_EPOCH_UTC) / WEEK_MS)}`;
}

// ★ FIX: 4/27~5/3 사이엔 무조건 w119 반환 (정산 연기 케어)
//        그 외엔 "DB 에 데이터가 존재하는 가장 최근 주차" 를 fallback 으로 사용
//        → 점프 (w119 → w121) 로 인해 w120 이 비어있어도 안전
export function getPrevWeekKey(now = Date.now()) {
  if (now >= DELAYED_RESET && now < DELAYED_RESET + WEEK_MS) {
    return `w${DELAYED_WEEK_INDEX}`;
  }
  const cur = parseInt(getCurrentWeekKey(now).slice(1), 10);
  return `w${cur - 1}`;
}

// ★ NEW: 데이터가 실제로 존재하는 직전 주차를 비동기로 찾는 헬퍼
//        보상 발송 시 prevWeekKey 가 빈 노드여도 한 단계 더 거슬러 올라감
//        (최대 4주까지 fallback)
export async function resolvePrevWeekWithData(now = Date.now()) {
  // 1) 기본 prevWeek 시도
  const primary = getPrevWeekKey(now);
  const hasPrimary = await hasLeaderboardData(primary);
  if (hasPrimary) return primary;

  // 2) primary 가 비어있으면 그 이전 주차들로 fallback
  const cur = parseInt(getCurrentWeekKey(now).slice(1), 10);
  for (let i = 1; i <= 4; i++) {
    const candidate = `w${cur - i}`;
    if (candidate === primary) continue;
    const has = await hasLeaderboardData(candidate);
    if (has) {
      console.log(`🔄 [prevWeek fallback] ${primary} → ${candidate}`);
      return candidate;
    }
  }
  return primary;
}

async function hasLeaderboardData(weekKey) {
  // miniGameLeaderboard 또는 miniGameScores 둘 중 하나에 데이터가 있으면 true
  const lb = await db.get(`miniGameLeaderboard/${weekKey}`).catch(() => null);
  if (lb && Object.keys(lb).length > 0) return true;
  const sc = await db.get(`miniGameScores/${weekKey}`).catch(() => null);
  if (sc && Object.keys(sc).length > 0) return true;
  return false;
}

export function weekKeyToDateStr(weekKey) {
  const n = parseInt(weekKey.slice(1), 10);
  const monday = new Date(MONDAY_EPOCH_UTC + n * WEEK_MS + KST_OFFSET);
  return monday.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

export function getMsUntilNextReset() {
  const now = Date.now();
  if (now < DELAYED_RESET) return DELAYED_RESET - now;
  const nextMonday = getKstMondayMs(now) + WEEK_MS;
  return Math.max(0, nextMonday - now);
}

// ══════════════════════════════════════════════════════════
//  주차별 코스프레 피카츄 씰 순환
// ══════════════════════════════════════════════════════════
// ★ FIX: w120 점프 버그로 벨 피카츄가 통째로 누락됐던 것 보정
//   - 배열에서 벨을 맨 뒤로 이동 → 한 사이클 후(w125) 부활
//   - 입력 weekIndex 정규화: w120 빈자리를 메꿔서 사용자가 본 매핑(w121=팝스타) 유지
//   결과 매핑:
//     w119 = 록스타 (저번주, 이미 발송됨)
//     w121 = 팝스타 (이번주, 로비에 노출 중)
//     w122 = 박사
//     w123 = 레슬러
//     w124 = 코스프레
//     w125 = 벨 ← 부활 ⭐
//     w126 = 록스타 (새 사이클)
const COSPLAY_ROTATION = [
  {
    id: "cosplay_rockstar",
    name: "록스타 피카츄",
    emoji: "🎸",
    color: "#E91E8C",
    pokeId: 10080,
  },
  {
    id: "cosplay_popstar",
    name: "팝스타 피카츄",
    emoji: "🎤",
    color: "#ff80ab",
    pokeId: 10082,
  },
  {
    id: "cosplay_phd",
    name: "박사 피카츄",
    emoji: "🎓",
    color: "#4FC3F7",
    pokeId: 10083,
  },
  {
    id: "cosplay_libre",
    name: "레슬러 피카츄",
    emoji: "🤼",
    color: "#66BB6A",
    pokeId: 10084,
  },
  {
    id: "cosplay_base",
    name: "코스프레 피카츄",
    emoji: "✨",
    color: "#FFD54F",
    pokeId: 10085,
  },
  {
    id: "cosplay_belle",
    name: "벨 피카츄",
    emoji: "👗",
    color: "#ce93d8",
    pokeId: 10081,
  },
];
const ROTATION_OFFSET = 5;

export function getWeeklyCosplaySeal(weekKey) {
  const raw = parseInt((weekKey ?? getCurrentWeekKey()).slice(1), 10);
  // ★ FIX: w120 가 코드상 존재하지 않는 점프 버그 보정
  //   w120 이상은 -1 해서 빈자리를 메꿈
  const n = raw >= 120 ? raw - 1 : raw;
  return COSPLAY_ROTATION[
    (n - ROTATION_OFFSET + COSPLAY_ROTATION.length * 100) %
      COSPLAY_ROTATION.length
  ];
}

function getCoinReward(rank) {
  if (rank === 1) return 5000;
  if (rank === 2) return 3500;
  if (rank === 3) return 2500;
  if (rank <= 5) return 1500;
  if (rank <= 10) return 1000;
  return 500;
}

const RANDOM_SEAL_POOL = [
  1, 4, 7, 25, 39, 52, 54, 56, 58, 63, 66, 69, 72, 74, 77, 79, 81, 84, 86, 88,
  90, 92, 95, 96, 98, 100, 102, 104, 106, 108, 110, 111, 113, 114, 116, 118,
  120, 122, 124, 125, 126, 129, 131, 133, 137, 143, 147,
];
function pickRandomSealId() {
  const pokeId =
    RANDOM_SEAL_POOL[Math.floor(Math.random() * RANDOM_SEAL_POOL.length)];
  return String(pokeId);
}

export const FESTIVAL_TITLES = [
  {
    key: "mg_festival_champion",
    label: "🏆 페스티벌 챔피언",
    flavor: "포켓 페스티벌의 진정한 지배자",
    topN: 1,
  },
  {
    key: "mg_festival_elite",
    label: "⭐ 페스티벌 엘리트",
    flavor: "모든 미니게임을 정복한 엘리트",
    topN: 3,
  },
  {
    key: "mg_festival_top10",
    label: "🎮 페스티벌 TOP 10",
    flavor: "이번 주 페스티벌 상위 10인",
    topN: 10,
  },
];

function getTitleForRank(rank) {
  if (rank === 1) return FESTIVAL_TITLES[0];
  if (rank <= 3) return FESTIVAL_TITLES[1];
  if (rank <= 10) return FESTIVAL_TITLES[2];
  return null;
}

export const MG_REWARDS = [];
export function getRewardByGameId() {
  return null;
}
export const MINI_GAME_TITLES = FESTIVAL_TITLES.map((t) => ({
  key: t.key,
  label: t.label,
  desc: `포켓 페스티벌 합산 주간 TOP ${t.topN} 한정`,
  flavor: t.flavor,
  check: () => false,
}));

// ══════════════════════════════════════════════════════════
//  ★ NEW: 현재 주차 legacy UID 일괄 정리
//
//  배경:
//   - getPlayerUid 가 "user_{닉네임}" 형식으로 통일되기 전에
//     랜덤 uid (예: "1abc123def...") 로 점수 올린 데이터가 남아있을 수 있음
//   - 결과: 같은 닉네임이 리더보드에 여러 번 나타남
//
//  동작:
//   - miniGameScores/{weekKey} 와 miniGameLeaderboard/{weekKey} 둘 다 청소
//   - 닉네임 별로 그룹핑 → "user_{닉네임}" 형식이 keeper 우선,
//     없으면 점수 가장 높은 uid 가 keeper
//   - keeper 이외의 uid 데이터는 점수를 keeper 로 통합 후 삭제
//
//  옵션:
//   - weekKey: 정리할 주차 (기본값: 현재 주차)
//   - dryRun: true → 삭제 없이 콘솔 로그만
// ══════════════════════════════════════════════════════════
export async function cleanupLegacyUidsForWeek({
  weekKey,
  dryRun = false,
} = {}) {
  const WK = weekKey ?? getCurrentWeekKey();
  console.log(`🔄 [legacy UID 정리] ${WK} 시작 ${dryRun ? "(DRY-RUN)" : ""}`);

  const stats = {
    weekKey: WK,
    dryRun,
    gamesProcessed: 0,
    duplicateGroupsFound: 0,
    legacyUidsRemoved: 0,
    scoresMerged: 0,
    overallEntriesRemoved: 0,
    keepers: [],
    errors: [],
  };

  // keeper uid 결정 헬퍼
  // 1순위: "user_{nickname}" 형식 (현재 표준)
  // 2순위: 점수 가장 높은 uid
  const expectedKeeperUid = (nickname) =>
    `user_${encodeURIComponent(nickname.trim()).replace(/%/g, "_")}`;

  function pickKeeper(nickname, entries) {
    const expected = expectedKeeperUid(nickname);
    // 표준 형식이 entries 안에 있으면 그게 무조건 keeper
    const standard = entries.find((e) => e.uid === expected);
    if (standard) return standard;
    // 없으면 점수 최고
    return [...entries].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  }

  try {
    // ── PHASE 1: 게임별 점수 정리 ──
    const allGameScores = await db
      .get(`miniGameScores/${WK}`)
      .catch(() => null);

    if (allGameScores && typeof allGameScores === "object") {
      for (const [gameId, gameData] of Object.entries(allGameScores)) {
        if (!gameData || typeof gameData !== "object") continue;
        stats.gamesProcessed += 1;

        // 닉네임 별로 그룹핑
        const byNick = {};
        for (const [uid, entry] of Object.entries(gameData)) {
          if (!entry || typeof entry !== "object") continue;
          const nick = (entry.nickname ?? "").trim();
          if (!nick || isAdmin(nick)) continue;
          if (!byNick[nick]) byNick[nick] = [];
          byNick[nick].push({ uid, score: Number(entry.score ?? 0) });
        }

        // 중복인 닉네임만 처리
        for (const [nick, entries] of Object.entries(byNick)) {
          if (entries.length < 2) continue;
          stats.duplicateGroupsFound += 1;

          const keeper = pickKeeper(nick, entries);
          const removes = entries.filter((e) => e.uid !== keeper.uid);

          // 모든 점수 중 최고
          const bestScore = Math.max(...entries.map((e) => e.score));

          console.log(
            `  🎮 [${gameId}] ${nick}: ${
              entries.length
            }개 → keeper=${keeper.uid.slice(0, 16)}… (최고 ${bestScore}점)`
          );

          if (!dryRun) {
            // keeper 에 최고점 저장
            if (bestScore > keeper.score) {
              try {
                await db.set(`miniGameScores/${WK}/${gameId}/${keeper.uid}`, {
                  score: bestScore,
                  nickname: nick,
                  uid: keeper.uid,
                  updatedAt: Date.now(),
                });
                stats.scoresMerged += 1;
              } catch (e) {
                stats.errors.push(
                  `merge ${gameId}/${keeper.uid}: ${e?.message ?? e}`
                );
              }
            }
            // legacy uid 삭제
            for (const r of removes) {
              try {
                await db.remove(`miniGameScores/${WK}/${gameId}/${r.uid}`);
                stats.legacyUidsRemoved += 1;
              } catch (e) {
                stats.errors.push(
                  `remove ${gameId}/${r.uid}: ${e?.message ?? e}`
                );
              }
            }
          } else {
            stats.legacyUidsRemoved += removes.length;
          }
        }
      }
    }

    // ── PHASE 2: 종합 랭킹 정리 ──
    const overall = await db.get(`miniGameLeaderboard/${WK}`).catch(() => null);
    if (overall && typeof overall === "object") {
      const byNick = {};
      for (const [uid, data] of Object.entries(overall)) {
        if (!data || typeof data !== "object") continue;
        const nick = (data.nickname ?? "").trim();
        if (!nick || isAdmin(nick)) continue;
        if (!byNick[nick]) byNick[nick] = [];
        byNick[nick].push({ uid, ...data });
      }

      for (const [nick, entries] of Object.entries(byNick)) {
        if (entries.length < 2) continue;

        const keeper = pickKeeper(nick, entries);
        const removes = entries.filter((e) => e.uid !== keeper.uid);

        // games 필드 병합 (게임별 최고)
        const mergedGames = { ...(keeper.games || {}) };
        for (const r of removes) {
          for (const [gid, sc] of Object.entries(r.games || {})) {
            const cur = Number(mergedGames[gid] ?? 0);
            const incoming = Number(sc ?? 0);
            if (incoming > cur) mergedGames[gid] = incoming;
          }
        }

        const newTotal = Object.entries(mergedGames).reduce(
          (sum, [gid, raw]) => sum + getNormalizedScore(gid, Number(raw) || 0),
          0
        );

        stats.keepers.push({
          nickname: nick,
          uid: keeper.uid,
          oldTotal: keeper.total ?? 0,
          newTotal,
          removedUids: removes.length,
        });

        console.log(
          `📌 [종합] ${nick}: keeper=${keeper.uid.slice(0, 16)}… (${
            keeper.total ?? 0
          } → ${newTotal})`
        );

        if (!dryRun) {
          await db.set(`miniGameLeaderboard/${WK}/${keeper.uid}`, {
            uid: keeper.uid,
            nickname: nick,
            games: mergedGames,
            total: newTotal,
            updatedAt: Date.now(),
          });
          for (const r of removes) {
            try {
              await db.remove(`miniGameLeaderboard/${WK}/${r.uid}`);
              stats.overallEntriesRemoved += 1;
            } catch (e) {
              stats.errors.push(
                `remove leaderboard ${r.uid}: ${e?.message ?? e}`
              );
            }
          }
        } else {
          stats.overallEntriesRemoved += removes.length;
        }
      }
    }

    console.log(`🎉 [legacy UID 정리] 완료:`, stats);
    return stats;
  } catch (e) {
    console.error("❌ [legacy UID 정리] 실패:", e);
    stats.errors.push(e.message);
    return stats;
  }
}

// ══════════════════════════════════════════════════════════
//  ★ NEW: 주간 보상 정산 감사 (auditWeeklyRewards)
//
//  매주 월요일 정산이 정상으로 되었는지 점검.
//  어드민이 게임 접속할 때 자동 호출되어,
//  "지난 주 참가한 사람 수" vs "보상 우편 발송된 사람 수" 비교.
//
//  반환:
//    {
//      weekKey,           // 점검 대상 주차
//      participants,      // 참가자 수 (점수 데이터 있는 사람)
//      sentCount,         // 보상 우편 발송된 사람 수
//      missingCount,      // 누락 의심 수
//      missingUids,       // 누락된 uid 목록 (최대 50개)
//      severity,          // "ok" | "warning" | "critical"
//      checkedAt,
//    }
//
//  severity 기준:
//   - ok       : 모두 발송 완료
//   - warning  : 1~5명 누락 (개별 케이스 가능, 자동 sendWeekly 가 처리할 수 있음)
//   - critical : 6명 이상 누락 (시스템 사고 의심, 즉시 점검 필요)
// ══════════════════════════════════════════════════════════
export async function auditWeeklyRewards({ weekKey } = {}) {
  const WK = weekKey ?? (await resolvePrevWeekWithData());

  console.log(`🔍 [auditWeeklyRewards] ${WK} 점검 시작`);

  const result = {
    weekKey: WK,
    participants: 0,
    sentCount: 0,
    missingCount: 0,
    missingUids: [],
    severity: "ok",
    checkedAt: Date.now(),
    error: null,
  };

  try {
    // ── 참가자 목록 수집 (miniGameScores 기준) ──
    const allScores = await db.get(`miniGameScores/${WK}`).catch(() => null);

    if (!allScores || typeof allScores !== "object") {
      console.log(`ℹ️ [auditWeeklyRewards] ${WK} 데이터 없음 — 점검 종료`);
      result.severity = "ok";
      return result;
    }

    // 게임별 점수에서 uid 모두 모음 (admin 제외)
    const participantUids = new Set();
    for (const gameData of Object.values(allScores)) {
      if (!gameData || typeof gameData !== "object") continue;
      for (const [uid, entry] of Object.entries(gameData)) {
        if (!entry || typeof entry !== "object") continue;
        const nickname = (entry.nickname ?? "").trim();
        if (!nickname || isAdmin(nickname)) continue;
        participantUids.add(uid);
      }
    }
    result.participants = participantUids.size;

    if (result.participants === 0) {
      console.log(`ℹ️ [auditWeeklyRewards] ${WK} 참가자 없음`);
      return result;
    }

    // ── 발송 완료된 uid 목록 (weeklyRewardsSent) ──
    const sentData = await db.get(`weeklyRewardsSent/${WK}`).catch(() => null);

    const sentUids = new Set();
    if (sentData && typeof sentData === "object") {
      for (const [uid, info] of Object.entries(sentData)) {
        if (info?.sentGames?.includes("overall")) {
          sentUids.add(uid);
        }
      }
    }
    result.sentCount = sentUids.size;

    // ── 누락된 uid 찾기 ──
    const missing = [];
    for (const uid of participantUids) {
      if (!sentUids.has(uid)) missing.push(uid);
    }
    result.missingCount = missing.length;
    result.missingUids = missing.slice(0, 50); // 최대 50개만 반환

    // ── severity 판정 ──
    if (result.missingCount === 0) {
      result.severity = "ok";
    } else if (result.missingCount <= 5) {
      result.severity = "warning";
    } else {
      result.severity = "critical";
    }

    console.log(
      `📊 [auditWeeklyRewards] ${WK} → 참가 ${result.participants} / 발송 ${result.sentCount} / 누락 ${result.missingCount} (${result.severity})`
    );
    return result;
  } catch (e) {
    console.error("❌ [auditWeeklyRewards] 실패:", e);
    result.error = e?.message ?? String(e);
    result.severity = "warning";
    return result;
  }
}

// ══════════════════════════════════════════════════════════
//  ★ NEW: 임의 주차 보상 일괄 재발송 (감사 후 누락 복구용)
//
//  rebuildAndSendW119Rewards 의 일반화 버전.
//  audit 함수가 누락 감지하면 어드민이 이 함수로 복구.
//
//  옵션:
//   - weekKey: 보상 발송할 주차 (필수 아님, 미지정 시 resolvePrevWeekWithData)
//   - dryRun: true → 실제 발송 없이 누가 받게 될지 미리보기만
//
//  반환:
//    {
//      weekKey,
//      aggregatedUsers,      // 집계된 참가자 수
//      sentLetters,          // 새로 발송한 우편 수
//      skippedAlreadySent,   // 이미 받아서 건너뛴 수
//      totalPlayers,
//      preview,              // dryRun 시: 발송 예정 목록
//      errors,
//    }
// ══════════════════════════════════════════════════════════
export async function rebuildAndSendRewardsForWeek({
  weekKey,
  dryRun = false,
} = {}) {
  const WK = weekKey ?? (await resolvePrevWeekWithData());
  console.log(`🔄 [보상 일괄발송] ${WK} 시작 ${dryRun ? "(DRY-RUN)" : ""}`);

  const stats = {
    weekKey: WK,
    dryRun,
    aggregatedUsers: 0,
    sentLetters: 0,
    skippedAlreadySent: 0,
    totalPlayers: 0,
    preview: [],
    errors: [],
  };

  try {
    // 1) miniGameScores/{WK} → 사용자별 집계
    const gameIds = MINI_GAMES.filter((g) => g.available).map((g) => g.id);
    const userMap = {};

    for (const gameId of gameIds) {
      const data = await db
        .get(`miniGameScores/${WK}/${gameId}`)
        .catch(() => null);
      if (!data) continue;
      Object.entries(data).forEach(([uid, val]) => {
        const nick = (val?.nickname ?? "").trim();
        if (!nick || isAdmin(nick)) return;
        if (!userMap[uid]) {
          userMap[uid] = { uid, nickname: nick, games: {}, total: 0 };
        }
        const score = Number(val.score ?? 0);
        userMap[uid].games[gameId] = score;
        userMap[uid].total += getNormalizedScore(gameId, score);
      });
    }

    // 2) miniGameLeaderboard/{WK} 갱신 (조회용)
    if (!dryRun) {
      for (const u of Object.values(userMap)) {
        await db.set(`miniGameLeaderboard/${WK}/${u.uid}`, {
          uid: u.uid,
          nickname: u.nickname,
          games: u.games,
          total: u.total,
          updatedAt: Date.now(),
        });
        stats.aggregatedUsers += 1;
      }
    } else {
      stats.aggregatedUsers = Object.keys(userMap).length;
    }

    // 3) 랭킹 정렬 후 발송
    const sorted = Object.values(userMap).sort((a, b) => b.total - a.total);
    stats.totalPlayers = sorted.length;

    for (let i = 0; i < sorted.length; i++) {
      const u = sorted[i];
      const rank = i + 1;

      const already = await isRewardAlreadySent(WK, u.uid, "overall");
      if (already) {
        stats.skippedAlreadySent += 1;
        continue;
      }

      const coins = getCoinReward(rank);
      const cosplay = getWeeklyCosplaySeal(WK);

      let title, body, rewards;
      if (rank <= 10) {
        title = `🏆 주간 랭킹 보상 도착!`;
        body =
          `지난 주 포켓 페스티벌 합산 ${rank}위 (총 ${stats.totalPlayers}명 참가)!\n` +
          `이번 주 한정 코스프레 씰과 보상을 수령하세요.`;
        rewards = { seals: [cosplay.id], titles: [], coins };
      } else {
        const randomSealId = pickRandomSealId();
        title = `🎮 포켓 페스티벌 참가 보상!`;
        body =
          `지난 주 포켓 페스티벌에 참가해줘서 고마워요!\n` +
          `${rank}위 (총 ${stats.totalPlayers}명 참가)\n` +
          `다음 주엔 TOP 10에 도전해보세요!`;
        rewards = { seals: [randomSealId], titles: [], coins };
      }

      if (dryRun) {
        stats.preview.push({
          uid: u.uid,
          nickname: u.nickname,
          rank,
          coins,
          willReceive: rank <= 10 ? "씰+코인" : "랜덤씰+코인",
        });
        continue;
      }

      try {
        const letterId = await sendLetter(u.uid, {
          type: LETTER_TYPE.RANKING,
          title,
          body,
          sender: "포켓 페스티벌",
          rewards,
          weekKey: WK,
          gameId: "overall",
          meta: {
            rank,
            total: u.total,
            totalPlayers: stats.totalPlayers,
            cosplaySeal: rank <= 10 ? cosplay : null,
          },
        });

        if (letterId) {
          await markRewardSent(WK, u.uid, "overall");
          stats.sentLetters += 1;
          console.log(`  📨 ${u.nickname} (${rank}위) ← ${coins}코인`);
        }
      } catch (e) {
        stats.errors.push(`${u.nickname}: ${e?.message ?? e}`);
      }
    }

    console.log(`🎉 [보상 일괄발송] ${WK} 완료:`, stats);
    return stats;
  } catch (e) {
    console.error("❌ [보상 일괄발송] 실패:", e);
    stats.errors.push(e?.message ?? String(e));
    return stats;
  }
}

// ══════════════════════════════════════════════════════════
//  마이그레이션: 기존 데이터를 miniGameLeaderboard로 모으기
//  (기존 함수 그대로 유지 — 변경 없음)
// ══════════════════════════════════════════════════════════
export async function migrateScoresToLeaderboard(weekKey) {
  const wk = weekKey || getCurrentWeekKey();
  console.log(`🔄 [마이그레이션] 시작: ${wk}`);

  const gameIds = MINI_GAMES.filter((g) => g.available).map((g) => g.id);
  const userMap = {};

  for (const gameId of gameIds) {
    const path = `miniGameScores/${wk}/${gameId}`;
    const data = await db.get(path).catch(() => null);
    if (!data) continue;

    Object.entries(data).forEach(([uid, val]) => {
      const nickname = val.nickname || "트레이너";
      if (isAdmin(nickname)) return;

      if (!userMap[nickname]) {
        userMap[nickname] = { nickname, uids: [], games: {}, total: 0 };
      }

      if (!userMap[nickname].uids.find((u) => u.uid === uid)) {
        userMap[nickname].uids.push({ uid, score: val.score || 0 });
      }

      const currentBest = userMap[nickname].games[gameId] || 0;
      if ((val.score || 0) > currentBest) {
        userMap[nickname].games[gameId] = val.score || 0;
      }
    });
  }

  Object.values(userMap).forEach((userData) => {
    userData.total = Object.values(userData.games).reduce(
      (sum, score) => sum + score,
      0
    );
  });

  for (const [nickname, userData] of Object.entries(userMap)) {
    const bestUid = userData.uids.sort((a, b) => b.score - a.score)[0].uid;

    await db.set(`miniGameLeaderboard/${wk}/${bestUid}`, {
      uid: bestUid,
      nickname,
      games: userData.games,
      total: userData.total,
      updatedAt: Date.now(),
    });

    console.log(
      `✅ ${nickname}: ${userData.total}점 (중복 UID: ${userData.uids.length}개)`
    );
  }

  console.log(`🎉 [마이그레이션] 완료: ${Object.keys(userMap).length}명`);
  return userMap;
}

// ══════════════════════════════════════════════════════════
//  게임 점수 업로드 (자동 중복 정리 포함) — 기존 그대로
// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
//  게임 점수 업로드 (★ FIX: 안전한 중복 정리)
//
//  버그 수정 사항:
//  1. 점수 스킵 시 leaderboard 통째 삭제 ❌ → 본인 leaderboard 만 갱신
//  2. 점수 스킵 시 다른 uid 데이터 삭제 ❌ → 더 높은 점수만 keeper 로 통합
//  3. 새 점수 저장 시 다른 uid 삭제하면서 점수 손실 가능 → keeper 점수 보존
//
//  핵심 원칙:
//  - 같은 닉네임의 다른 uid (legacy 랜덤 uid 등) 가 있으면 항상 "최고 점수"
//    를 stableUserId 로 통합. 절대 점수가 줄어드는 방향으로 움직이지 않음.
// ══════════════════════════════════════════════════════════
export async function uploadGameScore(gameId, userId, nickname, score) {
  console.log("🎮 [uploadGameScore] 호출:", {
    gameId,
    userId,
    nickname,
    score,
  });

  if (isAdmin(nickname)) {
    console.log("❌ [uploadGameScore] admin 차단됨");
    return false;
  }

  if (!nickname || !nickname.trim()) {
    console.log("❌ [uploadGameScore] 닉네임 없음 - 업로드 거부");
    return false;
  }

  const localNickname = localStorage.getItem("pks_nickname");
  if (!localNickname || localNickname.trim() !== nickname.trim()) {
    console.warn(
      `⚠️ [uploadGameScore] 로컬 닉네임(${localNickname}) ≠ 파라미터(${nickname}), 로컬 우선`
    );
    if (!localNickname) {
      console.log("❌ [uploadGameScore] 로컬 닉네임도 없음 - 업로드 거부");
      return false;
    }
    nickname = localNickname;
  }

  const weekKey = getCurrentWeekKey();
  const stableUserId = userId || getPlayerUid();

  // ── 1) 같은 닉네임을 가진 모든 uid 데이터 수집 (legacy uid 포함) ──
  const gamePath = `miniGameScores/${weekKey}/${gameId}`;
  const existingData = (await db.get(gamePath).catch(() => null)) || {};

  const duplicateKeys = []; // stableUserId 가 아닌 다른 uid
  Object.entries(existingData).forEach(([key, val]) => {
    if (val?.nickname === nickname && key !== stableUserId) {
      duplicateKeys.push({ key, score: Number(val.score ?? 0) });
    }
  });

  // ── 2) 본인 stableUserId 의 기존 점수 ──
  const myExisting = existingData[stableUserId];
  const myExistingScore = Number(myExisting?.score ?? 0);

  // ── 3) "이번 주 최고 점수" 계산: 본인 + 모든 legacy uid + 새 점수 중 최대 ──
  const allScores = [
    myExistingScore,
    ...duplicateKeys.map((d) => d.score),
    Number(score) || 0,
  ];
  const newBest = Math.max(...allScores);

  // ── 4) 본인 uid 에 최고점 저장 (변화가 있을 때만) ──
  if (newBest > myExistingScore) {
    await db.set(`${gamePath}/${stableUserId}`, {
      score: newBest,
      nickname: nickname || "트레이너",
      uid: stableUserId,
      updatedAt: Date.now(),
    });
    console.log(
      `✅ [uploadGameScore] ${gameId} 갱신: ${myExistingScore} → ${newBest}`
    );
  } else {
    console.log(
      `⏭️ [uploadGameScore] ${gameId} 갱신 없음 (${myExistingScore} >= ${newBest})`
    );
  }

  // ── 5) legacy uid 정리 (★ FIX: 항상 안전) ──
  //   본인 uid 가 newBest 를 갖고 있는 게 보장됐으므로,
  //   legacy uid 들은 안전하게 삭제 가능. 점수 손실 없음.
  if (duplicateKeys.length > 0) {
    console.log(
      `🧹 [uploadGameScore] legacy UID ${duplicateKeys.length}개 정리`
    );
    for (const dup of duplicateKeys) {
      try {
        await db.remove(`${gamePath}/${dup.key}`);
        console.log(
          `  ✂️ scores 삭제: ${dup.key.slice(0, 12)}… (${
            dup.score
          }점, keeper에 흡수됨)`
        );
        // ★ FIX: 해당 legacy uid 의 leaderboard 엔트리만 삭제 (전체 X)
        await db
          .remove(`miniGameLeaderboard/${weekKey}/${dup.key}`)
          .catch(() => {});
      } catch (e) {
        console.error(`  ❌ 삭제 실패:`, e);
      }
    }
  }

  // ── 6) miniGameLeaderboard (종합) 갱신 ──
  //   ★ FIX: 통째 삭제 ❌. 본인 엔트리만 read-modify-write
  const overallPath = `miniGameLeaderboard/${weekKey}/${stableUserId}`;
  const overall = (await db.get(overallPath).catch(() => null)) || {};
  const games = { ...(overall.games || {}) };

  // 이 게임의 신규 최고 점수 반영
  games[gameId] = newBest;

  // 정규화 합산
  const total = Object.entries(games).reduce(
    (sum, [gid, raw]) => sum + getNormalizedScore(gid, Number(raw) || 0),
    0
  );

  await db.set(overallPath, {
    uid: stableUserId,
    nickname: nickname || overall.nickname || "트레이너",
    games,
    total,
    updatedAt: Date.now(),
  });

  console.log(`✅ [uploadGameScore] 종합 갱신 완료: total=${total}`);
  return newBest > myExistingScore; // 실제 갱신 여부
}

export async function getTopScores(gameId, topN = 10, weekKey) {
  const wk = weekKey ?? getCurrentWeekKey();
  try {
    const data = await db
      .get(`miniGameScores/${wk}/${gameId}`)
      .catch(() => null);
    if (!data) return [];
    return Object.entries(data)
      .map(([uid, val]) => ({ uid, ...val }))
      .filter((e) => !isAdmin(e.nickname))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, topN)
      .map((e, i) => ({ ...e, rank: i + 1 }));
  } catch (e) {
    return [];
  }
}

export async function getUserRank(gameId, userId, weekKey) {
  const wk = weekKey ?? getCurrentWeekKey();
  try {
    const data = await db
      .get(`miniGameScores/${wk}/${gameId}`)
      .catch(() => null);
    if (!data) return null;
    const sorted = Object.entries(data)
      .map(([uid, val]) => ({
        uid,
        nickname: val.nickname,
        score: val.score ?? 0,
      }))
      .filter((e) => !isAdmin(e.nickname))
      .sort((a, b) => b.score - a.score);
    const idx = sorted.findIndex((e) => e.uid === userId);
    return idx >= 0 ? idx + 1 : null;
  } catch (e) {
    return null;
  }
}

export async function getOverallTopScores(topN = 10, weekKey) {
  const wk = weekKey ?? getCurrentWeekKey();
  try {
    const summary = await db.get(`miniGameLeaderboard/${wk}`).catch(() => null);
    if (summary) {
      return Object.values(summary)
        .filter((e) => !isAdmin(e.nickname))
        .map((e) => {
          const recalcTotal = Object.entries(e.games || {}).reduce(
            (sum, [gid, raw]) =>
              sum + getNormalizedScore(gid, Number(raw) || 0),
            0
          );
          return { ...e, total: recalcTotal };
        })
        .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
        .slice(0, topN)
        .map((e, i) => ({ ...e, rank: i + 1 }));
    }

    // 하위호환: miniGameScores 에서 직접 합산
    const gameIds = MINI_GAMES.filter((g) => g.available).map((g) => g.id);
    const userMap = {};
    for (const gameId of gameIds) {
      const data = await db
        .get(`miniGameScores/${wk}/${gameId}`)
        .catch(() => null);
      if (!data) continue;
      Object.entries(data).forEach(([uid, val]) => {
        if (isAdmin(val.nickname)) return;
        if (!userMap[uid]) {
          userMap[uid] = {
            uid,
            nickname: val.nickname ?? "트레이너",
            games: {},
            total: 0,
          };
        }
        userMap[uid].games[gameId] = val.score ?? 0;
        userMap[uid].total += getNormalizedScore(gameId, val.score ?? 0);
      });
    }
    return Object.values(userMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, topN)
      .map((u, i) => ({ ...u, rank: i + 1 }));
  } catch (e) {
    return [];
  }
}

export async function getOverallUserRank(userId, weekKey) {
  const wk = weekKey ?? getCurrentWeekKey();
  try {
    const summary = await db.get(`miniGameLeaderboard/${wk}`).catch(() => null);
    if (summary && Object.keys(summary).length > 0) {
      const sorted = Object.values(summary)
        .filter((e) => !isAdmin(e.nickname))
        .map((e) => {
          const recalcTotal = Object.entries(e.games || {}).reduce(
            (sum, [gid, raw]) =>
              sum + getNormalizedScore(gid, Number(raw) || 0),
            0
          );
          return { ...e, total: recalcTotal };
        })
        .sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
      const idx = sorted.findIndex((e) => e.uid === userId);
      return idx >= 0
        ? {
            rank: idx + 1,
            total: sorted[idx]?.total ?? 0,
            totalPlayers: sorted.length,
          }
        : null;
    }

    // ★ FIX: leaderboard 가 비어있으면 miniGameScores 에서 직접 합산
    //         (현재 w119 가 이 케이스 — leaderboard 없고 scores 만 있음)
    const gameIds = MINI_GAMES.filter((g) => g.available).map((g) => g.id);
    const userMap = {};
    for (const gameId of gameIds) {
      const data = await db
        .get(`miniGameScores/${wk}/${gameId}`)
        .catch(() => null);
      if (!data) continue;
      Object.entries(data).forEach(([uid, val]) => {
        if (isAdmin(val.nickname)) return;
        if (!userMap[uid])
          userMap[uid] = { uid, nickname: val.nickname, total: 0 };
        userMap[uid].total += getNormalizedScore(gameId, val.score ?? 0);
      });
    }
    const sorted = Object.values(userMap).sort((a, b) => b.total - a.total);
    const idx = sorted.findIndex((e) => e.uid === userId);
    return idx >= 0
      ? {
          rank: idx + 1,
          total: sorted[idx]?.total ?? 0,
          totalPlayers: sorted.length,
        }
      : null;
  } catch (e) {
    return null;
  }
}

// ══════════════════════════════════════════════════════════
//  이전 주 랭킹 체크 → 우편함 보상 발송
//  ★ FIX: prevWeek 이 비어있으면 데이터 있는 주차로 fallback
// ══════════════════════════════════════════════════════════
export async function checkAndSendWeeklyRewards(userId, nickname) {
  if (isAdmin(nickname)) return [];

  // ★ FIX: 단순 getPrevWeekKey() 대신 데이터 존재 주차로 fallback
  const prevWeek = await resolvePrevWeekWithData();
  console.log(`📬 [checkAndSendWeeklyRewards] prevWeek = ${prevWeek}`);

  const newLetters = [];

  const alreadySent = await isRewardAlreadySent(prevWeek, userId, "overall");
  if (alreadySent) {
    console.log(`✅ [checkAndSendWeeklyRewards] 이미 발송됨 (${prevWeek})`);
    return newLetters;
  }

  const rankInfo = await getOverallUserRank(userId, prevWeek);
  if (!rankInfo) {
    console.log(`ℹ️ [checkAndSendWeeklyRewards] 참가 기록 없음 (${prevWeek})`);
    return newLetters;
  }

  const { rank, total, totalPlayers } = rankInfo;
  const coins = getCoinReward(rank);
  const cosplay = getWeeklyCosplaySeal(prevWeek);
  // ★ FIX: 칭호는 우편함에서 지급하지 않음 (titles 항상 빈 배열)

  let title, body, rewards;

  if (rank <= 10) {
    title = `🏆 주간 랭킹 보상 도착!`;
    body =
      `지난 주 포켓 페스티벌 합산 ${rank}위 (총 ${totalPlayers}명 참가)!\n` +
      `이번 주 한정 코스프레 씰과 보상을 수령하세요.`;
    rewards = {
      seals: [cosplay.id],
      titles: [],
      coins,
    };
  } else {
    const randomSealId = pickRandomSealId();
    title = `🎮 포켓 페스티벌 참가 보상!`;
    body =
      `지난 주 포켓 페스티벌에 참가해줘서 고마워요!\n` +
      `${rank}위 (총 ${totalPlayers}명 참가)\n` +
      `다음 주엔 TOP 10에 도전해보세요!`;
    rewards = { seals: [randomSealId], titles: [], coins };
  }

  const letterId = await sendLetter(userId, {
    type: LETTER_TYPE.RANKING,
    title,
    body,
    sender: "포켓 페스티벌",
    rewards,
    weekKey: prevWeek,
    gameId: "overall",
    meta: {
      rank,
      total,
      totalPlayers,
      cosplaySeal: rank <= 10 ? cosplay : null,
    },
  });

  if (letterId) {
    await markRewardSent(prevWeek, userId, "overall");
    newLetters.push({
      rank,
      total,
      cosplay: rank <= 10 ? cosplay : null,
      coins,
    });
    console.log(
      `📨 [checkAndSendWeeklyRewards] 우편 발송 완료: ${rank}위, ${coins}코인`
    );
  }

  return newLetters;
}

// ══════════════════════════════════════════════════════════
//  🔧 1회성 마이그레이션: w120 → w119 병합 (기존 그대로)
// ══════════════════════════════════════════════════════════
const MERGE_FLAG_PATH = "system/migrations/w120_to_w119_merged";

export async function mergeDelayedWeekData({ force = false } = {}) {
  if (!force) {
    const already = await db.get(MERGE_FLAG_PATH).catch(() => null);
    if (already?.done) {
      console.log("✅ [w120→w119 병합] 이미 완료됨:", already);
      return { skipped: true, ...already };
    }
  }

  console.log("🔄 [w120→w119 병합] 시작");
  const SRC = "w120";
  const DST = "w119";
  const stats = {
    mergedUsers: 0,
    mergedGameEntries: 0,
    overwrittenBecauseHigher: 0,
    keptBecauseLower: 0,
    errors: [],
  };

  try {
    const srcGames = await db.get(`miniGameScores/${SRC}`).catch(() => null);
    if (srcGames) {
      for (const [gameId, gameData] of Object.entries(srcGames)) {
        if (!gameData || typeof gameData !== "object") continue;
        for (const [uid, entry] of Object.entries(gameData)) {
          if (!entry || typeof entry !== "object") continue;
          const srcScore = Number(entry.score ?? 0);
          const dstPath = `miniGameScores/${DST}/${gameId}/${uid}`;
          const dstEntry = await db.get(dstPath).catch(() => null);
          const dstScore = Number(dstEntry?.score ?? 0);
          if (srcScore > dstScore) {
            await db.set(dstPath, {
              score: srcScore,
              nickname: entry.nickname || dstEntry?.nickname || "트레이너",
              uid,
              updatedAt: Date.now(),
            });
            stats.overwrittenBecauseHigher += 1;
          } else {
            stats.keptBecauseLower += 1;
          }
          stats.mergedGameEntries += 1;
        }
      }
    }

    const srcOverall = await db
      .get(`miniGameLeaderboard/${SRC}`)
      .catch(() => null);
    if (srcOverall) {
      for (const [uid, srcData] of Object.entries(srcOverall)) {
        if (!srcData || typeof srcData !== "object") continue;
        const dstPath = `miniGameLeaderboard/${DST}/${uid}`;
        const dstData = (await db.get(dstPath).catch(() => null)) || {};
        const mergedGames = { ...(dstData.games || {}) };
        for (const [gameId, score] of Object.entries(srcData.games || {})) {
          const cur = Number(mergedGames[gameId] ?? 0);
          const incoming = Number(score ?? 0);
          if (incoming > cur) mergedGames[gameId] = incoming;
        }
        const newTotal = Object.values(mergedGames).reduce(
          (sum, v) => sum + (Number(v) || 0),
          0
        );
        await db.set(dstPath, {
          uid,
          nickname: dstData.nickname || srcData.nickname || "트레이너",
          games: mergedGames,
          total: newTotal,
          updatedAt: Date.now(),
        });
        stats.mergedUsers += 1;
      }
    }

    await db.remove(`miniGameScores/${SRC}`).catch((e) => {
      stats.errors.push(`remove miniGameScores/${SRC}: ${e.message}`);
    });
    await db.remove(`miniGameLeaderboard/${SRC}`).catch((e) => {
      stats.errors.push(`remove miniGameLeaderboard/${SRC}: ${e.message}`);
    });

    const result = { done: true, completedAt: Date.now(), ...stats };
    await db.set(MERGE_FLAG_PATH, result);
    console.log("🎉 [w120→w119 병합] 완료:", result);
    return result;
  } catch (e) {
    console.error("❌ [w120→w119 병합] 실패:", e);
    stats.errors.push(e.message);
    return { done: false, ...stats };
  }
}

// ══════════════════════════════════════════════════════════
//  ★ NEW: w119 점수 → leaderboard 집계 + 보상 우편 일괄 발송
//  지금 발생한 문제 즉시 복구용. 어드민 패널에서 1회 수동 실행.
//  - miniGameScores/w119 의 모든 점수를 정규화 합산
//  - miniGameLeaderboard/w119 에 집계 저장
//  - TOP 10 + 참가자 전원에게 우편 발송 (idempotent: 이미 보낸 사람은 skip)
// ══════════════════════════════════════════════════════════
const W119_REWARD_FLAG_PATH = "system/migrations/w119_rewards_sent_v1";

export async function rebuildAndSendW119Rewards({ force = false } = {}) {
  if (!force) {
    const already = await db.get(W119_REWARD_FLAG_PATH).catch(() => null);
    if (already?.done) {
      console.log("✅ [w119 보상 일괄발송] 이미 완료됨:", already);
      return { skipped: true, ...already };
    }
  }

  const WK = "w119";
  console.log(`🔄 [w119 보상 일괄발송] 시작`);

  const stats = {
    aggregatedUsers: 0,
    sentLetters: 0,
    skippedAlreadySent: 0,
    errors: [],
  };

  try {
    // 1) miniGameScores/w119 → 사용자별 정규화 합산
    const gameIds = MINI_GAMES.filter((g) => g.available).map((g) => g.id);
    const userMap = {};

    for (const gameId of gameIds) {
      const data = await db
        .get(`miniGameScores/${WK}/${gameId}`)
        .catch(() => null);
      if (!data) continue;
      Object.entries(data).forEach(([uid, val]) => {
        const nick = (val?.nickname ?? "").trim();
        if (!nick || isAdmin(nick)) return;
        if (!userMap[uid]) {
          userMap[uid] = { uid, nickname: nick, games: {}, total: 0 };
        }
        const score = Number(val.score ?? 0);
        userMap[uid].games[gameId] = score;
        userMap[uid].total += getNormalizedScore(gameId, score);
      });
    }

    // 2) miniGameLeaderboard/w119 에 저장 (조회용)
    for (const u of Object.values(userMap)) {
      await db.set(`miniGameLeaderboard/${WK}/${u.uid}`, {
        uid: u.uid,
        nickname: u.nickname,
        games: u.games,
        total: u.total,
        updatedAt: Date.now(),
      });
      stats.aggregatedUsers += 1;
    }

    // 3) 랭킹 정렬 후 우편 발송
    const sorted = Object.values(userMap).sort((a, b) => b.total - a.total);
    const totalPlayers = sorted.length;

    for (let i = 0; i < sorted.length; i++) {
      const u = sorted[i];
      const rank = i + 1;

      // 이미 발송됐으면 skip
      const already = await isRewardAlreadySent(WK, u.uid, "overall");
      if (already) {
        stats.skippedAlreadySent += 1;
        continue;
      }

      const coins = getCoinReward(rank);
      const cosplay = getWeeklyCosplaySeal(WK);
      // ★ FIX: 칭호는 우편함에서 지급하지 않음

      let title, body, rewards;
      if (rank <= 10) {
        title = `🏆 주간 랭킹 보상 도착!`;
        body =
          `지난 주 포켓 페스티벌 합산 ${rank}위 (총 ${totalPlayers}명 참가)!\n` +
          `이번 주 한정 코스프레 씰과 보상을 수령하세요.`;
        rewards = {
          seals: [cosplay.id],
          titles: [],
          coins,
        };
      } else {
        const randomSealId = pickRandomSealId();
        title = `🎮 포켓 페스티벌 참가 보상!`;
        body =
          `지난 주 포켓 페스티벌에 참가해줘서 고마워요!\n` +
          `${rank}위 (총 ${totalPlayers}명 참가)\n` +
          `다음 주엔 TOP 10에 도전해보세요!`;
        rewards = { seals: [randomSealId], titles: [], coins };
      }

      const letterId = await sendLetter(u.uid, {
        type: LETTER_TYPE.RANKING,
        title,
        body,
        sender: "포켓 페스티벌",
        rewards,
        weekKey: WK,
        gameId: "overall",
        meta: {
          rank,
          total: u.total,
          totalPlayers,
          cosplaySeal: rank <= 10 ? cosplay : null,
        },
      });

      if (letterId) {
        await markRewardSent(WK, u.uid, "overall");
        stats.sentLetters += 1;
        console.log(`  📨 ${u.nickname} (${rank}위) ← ${coins}코인`);
      }
    }

    const result = {
      done: true,
      completedAt: Date.now(),
      totalPlayers,
      ...stats,
    };
    await db.set(W119_REWARD_FLAG_PATH, result);
    console.log(`🎉 [w119 보상 일괄발송] 완료:`, result);
    return result;
  } catch (e) {
    console.error("❌ [w119 보상 일괄발송] 실패:", e);
    stats.errors.push(e.message);
    return { done: false, ...stats };
  }
}

// ══════════════════════════════════════════════════════════
//  ★ NEW: w119 보상 클레임했는데 코인 못 받은 사람 일괄 재지급
//
//  배경: App.tsx 의 onClaimReward 가 setMyCoins+persistCoins 만 호출하고
//        saveUserData 가 빠져 있어서, 클레임 후 새로고침하면 코인이 사라짐.
//        App.tsx 는 패치됐지만 이미 클레임 누른 사람은 영구 손실 상태.
//
//  동작:
//    1. mailbox/ 전체 스캔
//    2. w119 ranking 우편 중 claimed=true 인 것을 찾음
//    3. coinsCompensated 마커가 없으면 → users/{nick}/coins 에 직접 추가
//    4. 마커 박아서 재실행 시 중복 지급 방지 (멱등성)
//
//  옵션:
//    - dryRun: true   → 누구한테 얼마 지급될지 콘솔에만 출력
//    - force: true    → 시스템 플래그 무시하고 재실행
// ══════════════════════════════════════════════════════════
const W119_COIN_COMPENSATION_FLAG =
  "system/migrations/w119_coin_compensation_v1";

export async function compensateW119MissingCoins({
  dryRun = false,
  force = false,
} = {}) {
  if (!force) {
    const already = await db.get(W119_COIN_COMPENSATION_FLAG).catch(() => null);
    if (already?.done) {
      console.log("✅ [w119 코인 재지급] 이미 완료됨:", already);
      return { skipped: true, ...already };
    }
  }

  console.log(
    `🔄 [w119 코인 재지급] 시작 ${dryRun ? "(DRY-RUN: 실제 지급 안 함)" : ""}`
  );

  const stats = {
    scannedUsers: 0,
    eligibleLetters: 0,
    compensatedUsers: 0,
    totalCoinsGiven: 0,
    skippedAlreadyCompensated: 0,
    skippedNotClaimed: 0,
    notFoundUserDocs: [],
    perUser: [],
    errors: [],
  };

  try {
    // ── 1) 전체 mailbox 스캔 ──
    const allMail = await db.get("mailbox").catch(() => null);
    if (!allMail || typeof allMail !== "object") {
      console.log("ℹ️ mailbox 데이터 없음");
      const result = { done: true, completedAt: Date.now(), dryRun, ...stats };
      if (!dryRun) await db.set(W119_COIN_COMPENSATION_FLAG, result);
      return result;
    }

    // ── 2) 닉네임 → uid 매핑을 위해 users 도 미리 로드 ──
    const allUsers = (await db.get("users").catch(() => null)) || {};
    // uid → 사용자 키(닉네임 인코딩) 역매핑 만들기
    // (mailbox 의 키는 uid, users 의 키는 인코딩된 닉네임)
    const uidToUserKey = {};
    for (const [userKey, userData] of Object.entries(allUsers)) {
      if (!userData || typeof userData !== "object") continue;
      // users 노드에 uid 필드가 있는 경우 우선 사용
      const uid = userData.uid || userKey;
      if (uid) uidToUserKey[uid] = userKey;
      // userKey 자체가 uid일 가능성도 있음 (구버전)
      uidToUserKey[userKey] = userKey;
    }

    // ── 3) 각 사용자별로 처리 ──
    for (const [uid, letters] of Object.entries(allMail)) {
      stats.scannedUsers += 1;
      if (!letters || typeof letters !== "object") continue;

      let userTotalCoins = 0;
      const lettersToMark = [];

      for (const [letterId, letter] of Object.entries(letters)) {
        if (!letter || typeof letter !== "object") continue;

        // 조건: w119 ranking 우편 + claimed + 미보상
        if (letter.weekKey !== "w119") continue;
        if (letter.gameId !== "overall") continue;

        if (!letter.claimed) {
          stats.skippedNotClaimed += 1;
          continue;
        }
        if (letter.coinsCompensated === true) {
          stats.skippedAlreadyCompensated += 1;
          continue;
        }

        const coins = Number(letter?.rewards?.coins ?? 0);
        if (coins <= 0) continue;

        stats.eligibleLetters += 1;
        userTotalCoins += coins;
        lettersToMark.push({ letterId, coins });
      }

      if (userTotalCoins === 0) continue;

      // 사용자 문서 찾기 (uid → userKey)
      let userKey = uidToUserKey[uid];
      // 못 찾으면 uid 가 곧 userKey 인지 시도
      if (!userKey || !allUsers[userKey]) {
        userKey = uid;
      }

      const userData = allUsers[userKey];
      if (!userData) {
        stats.notFoundUserDocs.push({ uid, userKey, coins: userTotalCoins });
        console.warn(
          `⚠️ users 문서 못 찾음: uid=${uid.slice(
            0,
            12
          )}… coins=${userTotalCoins}`
        );
        continue;
      }

      const nickname = userData.nickname || userKey;
      const oldCoins = Number(userData.coins ?? 0);
      const newCoins = oldCoins + userTotalCoins;

      console.log(
        `  💰 ${nickname}: ${oldCoins} → ${newCoins} (+${userTotalCoins})`
      );

      stats.perUser.push({
        nickname,
        uid,
        oldCoins,
        coinsAdded: userTotalCoins,
        newCoins,
        letterCount: lettersToMark.length,
      });

      if (!dryRun) {
        try {
          // 1) 사용자 코인 업데이트
          await db.update(`users/${userKey}`, { coins: newCoins });

          // 2) 각 편지에 마커 박기
          for (const { letterId } of lettersToMark) {
            await db
              .update(`mailbox/${uid}/${letterId}`, {
                coinsCompensated: true,
                coinsCompensatedAt: Date.now(),
              })
              .catch((e) => {
                stats.errors.push(
                  `mark ${uid.slice(0, 8)}/${letterId}: ${e.message ?? e}`
                );
              });
          }

          stats.compensatedUsers += 1;
          stats.totalCoinsGiven += userTotalCoins;
        } catch (e) {
          stats.errors.push(
            `update users/${userKey}: ${e?.message ?? String(e)}`
          );
          console.error(`❌ ${nickname} 업데이트 실패:`, e);
        }
      } else {
        stats.compensatedUsers += 1;
        stats.totalCoinsGiven += userTotalCoins;
      }
    }

    const result = { done: true, completedAt: Date.now(), dryRun, ...stats };
    if (!dryRun) {
      await db.set(W119_COIN_COMPENSATION_FLAG, result);
    }

    console.log(
      `🎉 [w119 코인 재지급] 완료: ${stats.compensatedUsers}명에게 총 ${
        stats.totalCoinsGiven
      }코인 ${dryRun ? "(DRY-RUN)" : "지급"}`
    );
    return result;
  } catch (e) {
    console.error("❌ [w119 코인 재지급] 실패:", e);
    stats.errors.push(e.message);
    return { done: false, ...stats };
  }
}

// ══════════════════════════════════════════════════════════
//  🔧 v2: 같은 닉네임 중복 UID 정리 (w119) — 기존 그대로
// ══════════════════════════════════════════════════════════
const DEDUPE_FLAG_PATH = "system/migrations/w119_dedupe_done_v2";

export async function dedupeW119Nicknames({
  force = false,
  dryRun = false,
} = {}) {
  if (!force) {
    const already = await db.get(DEDUPE_FLAG_PATH).catch(() => null);
    if (already?.done) {
      console.log("✅ [w119 중복정리 v2] 이미 완료됨:", already);
      return { skipped: true, ...already };
    }
  }

  console.log(
    `🔄 [w119 중복정리 v2] 시작 ${dryRun ? "(DRY-RUN: 삭제 안 함)" : ""}`
  );

  const WK = "w119";
  const stats = {
    duplicateGroups: 0,
    removedUids: 0,
    mergedGameScores: 0,
    gameLevelCleanups: 0,
    keepers: [],
    removed: [],
    errors: [],
  };

  try {
    console.log("📊 PHASE 1: 게임별 랭킹 정리 시작");
    const allScores = await db.get(`miniGameScores/${WK}`).catch(() => null);
    const nicknameToKeeperUid = {};

    if (allScores && typeof allScores === "object") {
      for (const [gameId, gameData] of Object.entries(allScores)) {
        if (!gameData || typeof gameData !== "object") continue;
        const byNick = {};
        for (const [uid, entry] of Object.entries(gameData)) {
          if (!entry || typeof entry !== "object") continue;
          const nick = (entry.nickname ?? "").trim();
          if (!nick || isAdmin(nick)) continue;
          if (!byNick[nick]) byNick[nick] = [];
          byNick[nick].push({ uid, score: Number(entry.score ?? 0) });
        }
        for (const [nick, entries] of Object.entries(byNick)) {
          if (entries.length < 2) continue;
          const sorted = [...entries].sort((a, b) => b.score - a.score);
          const keeper = sorted[0];
          const removes = sorted.slice(1);
          console.log(
            `  🎮 [${gameId}] ${nick}: 중복 ${
              entries.length
            }개 → keeper ${keeper.uid.slice(0, 10)}… (${keeper.score}점)`
          );
          if (!nicknameToKeeperUid[nick]) nicknameToKeeperUid[nick] = {};
          nicknameToKeeperUid[nick][keeper.uid] =
            (nicknameToKeeperUid[nick][keeper.uid] || 0) + 1;
          if (!dryRun) {
            for (const r of removes) {
              const path = `miniGameScores/${WK}/${gameId}/${r.uid}`;
              try {
                await db.remove(path);
                stats.gameLevelCleanups += 1;
              } catch (e) {
                stats.errors.push(
                  `remove ${gameId}/${r.uid}: ${e.message ?? e}`
                );
              }
            }
          } else {
            stats.gameLevelCleanups += removes.length;
          }
        }
      }
    }

    console.log("🏆 PHASE 2: 종합 랭킹 정리 시작");
    const overall = await db.get(`miniGameLeaderboard/${WK}`).catch(() => null);
    if (!overall || typeof overall !== "object") {
      console.log("ℹ️ 종합 랭킹 데이터 없음");
    } else {
      const byNickname = {};
      for (const [uid, data] of Object.entries(overall)) {
        if (!data || typeof data !== "object") continue;
        const nick = (data.nickname ?? "").trim();
        if (!nick || isAdmin(nick)) continue;
        if (!byNickname[nick]) byNickname[nick] = [];
        byNickname[nick].push({ uid, ...data });
      }
      for (const [nickname, entries] of Object.entries(byNickname)) {
        if (entries.length < 2) continue;
        stats.duplicateGroups += 1;
        const phase1Score = nicknameToKeeperUid[nickname] || {};
        const sorted = [...entries].sort((a, b) => {
          const ap = phase1Score[a.uid] || 0;
          const bp = phase1Score[b.uid] || 0;
          if (ap !== bp) return bp - ap;
          const d = (b.total ?? 0) - (a.total ?? 0);
          if (d !== 0) return d;
          return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
        });
        const keeper = sorted[0];
        const removes = sorted.slice(1);
        console.log(
          `📌 [${nickname}] 종합 중복 ${
            entries.length
          }개 → keeper: ${keeper.uid.slice(0, 10)}… (${keeper.total}점)`
        );
        const mergedGames = { ...(keeper.games || {}) };
        for (const r of removes) {
          for (const [gid, score] of Object.entries(r.games || {})) {
            const cur = Number(mergedGames[gid] ?? 0);
            const incoming = Number(score ?? 0);
            if (incoming > cur) mergedGames[gid] = incoming;
          }
        }
        for (const gameId of Object.keys(allScores || {})) {
          const keeperScorePath = `miniGameScores/${WK}/${gameId}/${keeper.uid}`;
          const entry = await db.get(keeperScorePath).catch(() => null);
          if (entry && typeof entry === "object") {
            const incoming = Number(entry.score ?? 0);
            const cur = Number(mergedGames[gameId] ?? 0);
            if (incoming > cur) mergedGames[gameId] = incoming;
          }
        }
        const newTotal = Object.values(mergedGames).reduce(
          (s, v) => s + (Number(v) || 0),
          0
        );
        stats.keepers.push({
          nickname,
          uid: keeper.uid,
          oldTotal: keeper.total,
          newTotal,
          gamesCount: Object.keys(mergedGames).length,
        });
        if (!dryRun) {
          await db.set(`miniGameLeaderboard/${WK}/${keeper.uid}`, {
            uid: keeper.uid,
            nickname,
            games: mergedGames,
            total: newTotal,
            updatedAt: Date.now(),
          });
          for (const r of removes) {
            await db.remove(`miniGameLeaderboard/${WK}/${r.uid}`).catch((e) => {
              stats.errors.push(
                `remove leaderboard ${r.uid}: ${e.message ?? e}`
              );
            });
            for (const gameId of Object.keys(allScores || {})) {
              const path = `miniGameScores/${WK}/${gameId}/${r.uid}`;
              try {
                const entry = await db.get(path).catch(() => null);
                if (entry && typeof entry === "object") {
                  const rScore = Number(entry.score ?? 0);
                  const keeperPath = `miniGameScores/${WK}/${gameId}/${keeper.uid}`;
                  const kEntry = await db.get(keeperPath).catch(() => null);
                  const kScore = Number(kEntry?.score ?? 0);
                  if (rScore > kScore) {
                    await db.set(keeperPath, {
                      score: rScore,
                      nickname,
                      uid: keeper.uid,
                      updatedAt: Date.now(),
                    });
                    stats.mergedGameScores += 1;
                  }
                  await db.remove(path).catch(() => {});
                }
              } catch (e) {
                stats.errors.push(`cleanup ${gameId}/${r.uid}: ${e.message}`);
              }
            }
            stats.removedUids += 1;
            stats.removed.push({ nickname, uid: r.uid, total: r.total });
          }
        } else {
          for (const r of removes) {
            stats.removedUids += 1;
            stats.removed.push({ nickname, uid: r.uid, total: r.total });
          }
        }
      }
    }

    const result = { done: true, completedAt: Date.now(), dryRun, ...stats };
    if (!dryRun) {
      await db.set(DEDUPE_FLAG_PATH, result);
    }
    console.log(
      `🎉 [w119 중복정리 v2] 완료: 그룹 ${stats.duplicateGroups}개, 종합 ${stats.removedUids}개, 게임별 ${stats.gameLevelCleanups}개 정리`
    );
    return result;
  } catch (e) {
    console.error("❌ [w119 중복정리 v2] 실패:", e);
    stats.errors.push(e.message);
    return { done: false, ...stats };
  }
}
