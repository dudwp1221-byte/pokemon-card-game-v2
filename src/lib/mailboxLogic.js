// src/lib/mailboxLogic.js
// ══════════════════════════════════════════════════════════
//  우편함 시스템 — Realtime Database 버전
//  ★ 중복 지급 방지: transaction 기반 atomic claim & sendOnce
// ══════════════════════════════════════════════════════════
import { db } from "./db";

export const LETTER_TYPE = {
  RANKING: "ranking",
  SYSTEM: "system",
  EVENT: "event",
};

function makeLetterID() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── 편지 발송 (그냥) ──────────────────────────────────────
// 어드민 테스트 버튼, 주간 랭킹 등 "여러 번 보내도 되는" 경로용
export async function sendLetter(
  userId,
  {
    type = LETTER_TYPE.SYSTEM,
    title = "새 편지",
    body = "",
    sender = "포켓 페스티벌",
    rewards = {},
    weekKey = null,
    gameId = null,
    meta = {},
  } = {}
) {
  try {
    const id = makeLetterID();
    const letter = {
      id,
      type,
      title,
      body,
      sender,
      rewards: {
        seals: rewards.seals ?? [],
        titles: rewards.titles ?? [],
        coins: rewards.coins ?? 0,
      },
      weekKey,
      gameId,
      meta,
      sentAt: Date.now(),
      read: false,
      claimed: false,
      claimedAt: null,
    };
    await db.set(`mailbox/${userId}/${id}`, letter);
    return id;
  } catch (e) {
    console.error("sendLetter:", e);
    return null;
  }
}

// ── 편지 1회성 발송 (atomic) ───────────────────────────────
// 감사 편지처럼 "절대 중복 발송되면 안 되는" 편지용.
// letterKey 예: "thankyou_v1"
// 서버에 sentLetterKeys/{userId}/{letterKey} 가 이미 있으면 skip.
// 없으면 transaction 으로 "발송 기록 + 편지 작성" 을 한 번에 처리.
export async function sendLetterOnce(userId, letterKey, letterData = {}) {
  if (!userId || !letterKey) {
    console.error("sendLetterOnce: userId/letterKey required");
    return { sent: false, reason: "bad-args" };
  }
  const keyPath = `sentLetterKeys/${userId}/${letterKey}`;

  try {
    // ── 1단계: 이미 발송했는지 transaction 으로 "락" ──
    // current 가 이미 존재하면 그대로 두고 abort, 없으면 true 로 쓰기
    let alreadySent = false;
    await db.transaction(keyPath, (current) => {
      if (current) {
        alreadySent = true;
        return undefined; // abort (기존 값 유지)
      }
      return { at: Date.now(), letterKey };
    });

    if (alreadySent) {
      return { sent: false, reason: "already-sent" };
    }

    // ── 2단계: 여기까지 왔으면 "최초 발송 권한" 획득 → 편지 작성 ──
    const id = makeLetterID();
    const letter = {
      id,
      type: letterData.type ?? LETTER_TYPE.SYSTEM,
      title: letterData.title ?? "새 편지",
      body: letterData.body ?? "",
      sender: letterData.sender ?? "PokéSet",
      rewards: {
        seals: letterData.rewards?.seals ?? [],
        titles: letterData.rewards?.titles ?? [],
        coins: letterData.rewards?.coins ?? 0,
      },
      weekKey: letterData.weekKey ?? null,
      gameId: letterData.gameId ?? null,
      meta: { ...(letterData.meta ?? {}), letterKey },
      sentAt: Date.now(),
      read: false,
      claimed: false,
      claimedAt: null,
    };
    await db.set(`mailbox/${userId}/${id}`, letter);
    return { sent: true, id };
  } catch (e) {
    console.error("sendLetterOnce:", e);
    return { sent: false, reason: "error", error: e };
  }
}

// ── 편지 목록 (최신순) ─────────────────────────────────────
export async function getLetters(userId) {
  try {
    const data = await db.get(`mailbox/${userId}`).catch(() => null);
    if (!data) return [];
    return Object.entries(data)
      .map(([id, letter]) => ({ ...letter, id }))
      .sort((a, b) => (b.sentAt ?? 0) - (a.sentAt ?? 0));
  } catch (e) {
    return [];
  }
}

// ── 읽지 않은 편지 수 ──────────────────────────────────────
export async function getUnreadCount(userId) {
  try {
    const letters = await getLetters(userId);
    return letters.filter((l) => !l.read).length;
  } catch (e) {
    return 0;
  }
}

// ── 읽음 처리 ──────────────────────────────────────────────
export async function markRead(userId, letterId) {
  try {
    await db.update(`mailbox/${userId}/${letterId}`, { read: true });
  } catch (e) {}
}

// ── 보상 수령 (★ atomic transaction) ──────────────────────
// 같은 편지를 동시에 여러 기기에서 클릭해도 단 한 번만 성공.
// 반환:
//   { claimed: true, rewards, title }   → 이번에 처음 수령 성공
//   { alreadyClaimed: true }            → 이미 수령됨
//   null                                → 편지 없음 / 네트워크 실패
export async function claimLetter(userId, letterId) {
  if (!userId || !letterId) return null;
  const path = `mailbox/${userId}/${letterId}`;

  let outcome = null; // "first" | "already" | "missing"
  let snapshot = null;

  try {
    await db.transaction(path, (current) => {
      if (!current) {
        outcome = "missing";
        return undefined; // abort
      }
      if (current.claimed) {
        outcome = "already";
        return undefined; // abort — 이미 수령됨
      }
      // 최초 수령 — 이 트랜잭션이 성공해야만 outcome=first
      outcome = "first";
      snapshot = current;
      return {
        ...current,
        claimed: true,
        claimedAt: Date.now(),
        read: true,
      };
    });
  } catch (e) {
    console.error("claimLetter transaction:", e);
    return null;
  }

  if (outcome === "missing") return null;
  if (outcome === "already") return { alreadyClaimed: true };
  if (outcome === "first" && snapshot) {
    return {
      claimed: true,
      rewards: snapshot.rewards || {
        seals: [],
        titles: [],
        coins: 0,
      },
      title: snapshot.title,
    };
  }
  return null;
}

// ── 전체 읽음 처리 ─────────────────────────────────────────
export async function markAllRead(userId) {
  try {
    const letters = await getLetters(userId);
    const unread = letters.filter((l) => !l.read);
    await Promise.all(
      unread.map((l) => db.update(`mailbox/${userId}/${l.id}`, { read: true }))
    );
  } catch (e) {}
}

// ── 이번 주 보상 발송 여부 확인 ────────────────────────────
export async function isRewardAlreadySent(weekKey, userId, gameId) {
  try {
    const data = await db
      .get(`weeklyRewardsSent/${weekKey}/${userId}`)
      .catch(() => null);
    return (data?.sentGames ?? []).includes(gameId);
  } catch (e) {
    return false;
  }
}

// ── 발송 완료 기록 ─────────────────────────────────────────
export async function markRewardSent(weekKey, userId, gameId) {
  try {
    const data = await db
      .get(`weeklyRewardsSent/${weekKey}/${userId}`)
      .catch(() => null);
    const prev = data?.sentGames ?? [];
    await db.set(`weeklyRewardsSent/${weekKey}/${userId}`, {
      sentGames: [...prev, gameId],
      updatedAt: Date.now(),
    });
  } catch (e) {}
}
