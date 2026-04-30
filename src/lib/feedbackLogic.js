// src/lib/feedbackLogic.js
// ══════════════════════════════════════════════════════════
//  유저 피드백 시스템 (버그신고 + 건의사항)
// ══════════════════════════════════════════════════════════
import { db } from "./db";

export const FEEDBACK_TYPE = {
  BUG: "bug",
  SUGGESTION: "suggestion",
};

export const FEEDBACK_TYPE_LABELS = {
  bug: { emoji: "🐛", label: "버그신고", color: "#ef4444" },
  suggestion: { emoji: "💡", label: "건의사항", color: "#3b82f6" },
};

function makeFeedbackId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── 피드백 발송 ──────────────────────────────────────────
export async function sendFeedback({
  nickname,
  uid,
  type,
  text,
  page = "unknown",
}) {
  if (!nickname || !text?.trim()) {
    return { ok: false, error: "닉네임 또는 내용이 비어있어요" };
  }
  if (text.length > 500) {
    return { ok: false, error: "500자 이내로 작성해주세요" };
  }
  if (!Object.values(FEEDBACK_TYPE).includes(type)) {
    return { ok: false, error: "잘못된 피드백 종류" };
  }

  const id = makeFeedbackId();
  const data = {
    id,
    nickname: nickname.trim(),
    uid: uid || null,
    type,
    text: text.trim(),
    page,
    createdAt: Date.now(),
    read: false,
    resolved: false,
    reply: null,
    repliedAt: null,
  };

  try {
    await db.set(`feedback/${id}`, data);
    return { ok: true, id };
  } catch (e) {
    console.error("sendFeedback:", e);
    return { ok: false, error: "전송 실패" };
  }
}

// ── 모든 피드백 조회 (어드민용, 최신순) ────────────────────
export async function getAllFeedback() {
  try {
    const data = await db.get("feedback").catch(() => null);
    if (!data) return [];
    return Object.values(data).sort(
      (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
    );
  } catch (e) {
    console.error("getAllFeedback:", e);
    return [];
  }
}

// ── 미읽 개수 (어드민 뱃지용) ──────────────────────────────
export async function getUnreadFeedbackCount() {
  const all = await getAllFeedback();
  return all.filter((f) => !f.read).length;
}

// ── 읽음 처리 ──────────────────────────────────────────────
export async function markFeedbackRead(id) {
  try {
    await db.update(`feedback/${id}`, { read: true });
  } catch (e) {}
}

// ── 해결 처리 토글 ─────────────────────────────────────────
export async function toggleFeedbackResolved(id, resolved) {
  try {
    await db.update(`feedback/${id}`, { resolved: !!resolved });
  } catch (e) {}
}

// ── 답장 저장 (우편 발송은 호출자가 별도로) ────────────────
export async function saveFeedbackReply(id, replyText) {
  try {
    await db.update(`feedback/${id}`, {
      reply: replyText,
      repliedAt: Date.now(),
      read: true,
    });
  } catch (e) {
    console.error("saveFeedbackReply:", e);
  }
}
