// src/lib/errorLogger.js
// ════════════════════════════════════════════════════════════
//  🐛 에러 로거
//  - 유저가 만난 에러를 Firebase 에 자동 기록
//  - Firebase 콘솔(Realtime Database → errorLogs) 에서 직접 확인
//
//  사용처:
//   1. App.tsx 의 ErrorBoundary.componentDidCatch
//   2. 전역 window.onerror / unhandledrejection 리스너
//
//  주의:
//   - DB 폭주 방지: 동일 메시지 1분 내 중복은 스킵
//   - 무한 루프 방지: 로거 자체에서 throw 해도 catch 함
// ════════════════════════════════════════════════════════════
import { db, getPlayerUid } from "./db";

const FB_NODE = "errorLogs";
const RECENT_TTL_MS = 60_000; // 1분 내 동일 메시지 스킵
const MAX_STACK_LEN = 2000;
const MAX_MESSAGE_LEN = 500;

// 1분 내 같은 에러는 스킵 (메모리)
const recentSent = new Map(); // message -> ts

function shouldSkip(message) {
  const now = Date.now();
  // 오래된 항목 정리
  for (const [k, v] of recentSent.entries()) {
    if (now - v > RECENT_TTL_MS) recentSent.delete(k);
  }
  if (
    recentSent.has(message) &&
    now - recentSent.get(message) < RECENT_TTL_MS
  ) {
    return true;
  }
  recentSent.set(message, now);
  return false;
}

function safeStr(v, max = MAX_MESSAGE_LEN) {
  if (v == null) return "";
  let s;
  try {
    s = typeof v === "string" ? v : String(v);
  } catch {
    s = "[unstringifiable]";
  }
  return s.length > max ? s.slice(0, max) + "...[truncated]" : s;
}

/**
 * 에러를 Firebase 에 기록
 * @param {Error|string} err - 에러 객체 또는 메시지
 * @param {object} ctx - 추가 컨텍스트 { page?, source?, extra? }
 */
export async function logError(err, ctx = {}) {
  try {
    const message = safeStr(
      err?.message ?? err?.toString?.() ?? err ?? "Unknown error"
    );

    // 중복 스킵
    if (shouldSkip(message)) return null;

    // 닉네임 (없을 수도 있음 - 로그인 전 에러)
    let nickname = "";
    let uid = "";
    try {
      nickname = localStorage.getItem("pks_nickname") || "";
      uid = getPlayerUid?.() || "";
    } catch {}

    const id = `err_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      id,
      ts: Date.now(),
      nickname: nickname || "(anonymous)",
      uid: uid || "",
      message,
      stack: safeStr(err?.stack, MAX_STACK_LEN),
      page: safeStr(ctx.page || "", 50),
      source: safeStr(ctx.source || "", 50), // "boundary" | "window.onerror" | "unhandledrejection" | "manual"
      url: safeStr(window.location?.href || "", 200),
      userAgent: safeStr(navigator?.userAgent || "", 200),
      extra: ctx.extra ? safeStr(JSON.stringify(ctx.extra), 500) : "",
      fixed: false,
    };

    await db.set(`${FB_NODE}/${id}`, payload);
    // 콘솔에도 보내서 개발자가 즉시 확인 가능하게
    console.warn("🐛 [errorLogger] 기록됨:", id, message);
    return id;
  } catch (e) {
    // 로거 자체 에러는 절대 throw 하지 않음 (무한 루프 방지)
    try {
      console.error("🐛 [errorLogger] 로거 자체 실패:", e);
    } catch {}
    return null;
  }
}

/**
 * 전역 에러 리스너 설치
 * App 마운트 시 한 번만 호출
 */
let installed = false;
export function installGlobalErrorHandlers(getCurrentPage = () => "") {
  if (installed) return;
  installed = true;

  // JS 런타임 에러
  window.addEventListener("error", (event) => {
    const err = event.error || event.message || "Unknown window error";
    logError(err, {
      source: "window.onerror",
      page: getCurrentPage(),
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // 처리되지 않은 Promise 거부
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    logError(reason instanceof Error ? reason : String(reason), {
      source: "unhandledrejection",
      page: getCurrentPage(),
    });
  });

  console.log("🐛 [errorLogger] 전역 핸들러 설치 완료");
}
