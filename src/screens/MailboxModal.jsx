// src/screens/MailboxModal.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  getLetters,
  markRead,
  claimLetter,
  markAllRead,
} from "../lib/mailboxLogic";
import {
  FESTIVAL_TITLES,
  getWeeklyCosplaySeal,
} from "../lib/miniGameLeaderboardLogic";
import { COSPLAY_PIKACHU_SEALS } from "../lib/eventLogic";
import { ALL_SEALS } from "../lib/sealLogic";
import { getPlayerUid } from "../lib/db";

const ALL_SEALS_MAP = (() => {
  const map = {};
  COSPLAY_PIKACHU_SEALS.forEach((s) => {
    map[s.id] = {
      id: s.id,
      name: s.name,
      pokeId: s.pokeId,
      rarity: "event",
      glow: s.color,
      desc: "포켓 페스티벌 랭킹 보상 · 주간 한정",
    };
  });
  ALL_SEALS.forEach((s) => {
    const key = String(s.id);
    map[key] = {
      id: key,
      name: s.name ?? `No.${s.id}`,
      pokeId: s.id,
      rarity: s.grade?.toLowerCase() ?? "common",
      glow: "#4ade80",
      desc: "랜덤 띠부씰",
    };
  });
  return map;
})();

const TITLE_MAP = (() => {
  const map = {};
  FESTIVAL_TITLES.forEach((t) => {
    map[t.key] = t;
  });
  return map;
})();

function findSeal(sealId) {
  return ALL_SEALS_MAP[sealId] ?? null;
}
function findTitle(titleKey) {
  return TITLE_MAP[titleKey] ?? null;
}

// ── 포켓덱스 헤더 ──
function PokedexHeader({ onClose, title, titleIcon, rightEl }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "4px 4px 10px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            flexShrink: 0,
            position: "relative",
            background:
              "radial-gradient(circle at 32% 28%,#bfdbfe,#2563EB 55%,#1e3a8a)",
            boxShadow:
              "0 0 0 4px rgba(255,255,255,0.3),0 0 20px rgba(59,130,246,0.6),0 4px 8px rgba(0,0,0,0.5)",
            border: "2px solid rgba(255,255,255,0.45)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "18%",
              left: "18%",
              width: "38%",
              height: "38%",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.7)",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          {[
            { c: "#f87171", g: "#ef4444" },
            { c: "#fbbf24", g: "#f59e0b" },
            { c: "#4ade80", g: "#22c55e" },
          ].map(({ c, g }, i) => (
            <div
              key={i}
              style={{
                width: 13,
                height: 13,
                borderRadius: "50%",
                background: c,
                boxShadow: `0 0 7px ${g}`,
                border: "1.5px solid rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span
            style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: 17,
              letterSpacing: 1,
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            ⚡ PokéSet
          </span>
        </div>
        {rightEl}
        <button
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.3)",
            background: "rgba(0,0,0,0.3)",
            color: "rgba(255,255,255,0.8)",
            fontSize: 14,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          ✕
        </button>
      </div>
      <div
        style={{
          background: "#0a0f1a",
          borderRadius: 14,
          border: "5px solid #fff",
          boxShadow: "0 0 0 2px #bbb,inset 0 2px 12px rgba(0,0,0,0.9)",
          overflow: "hidden",
          marginBottom: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: 2,
            background:
              "linear-gradient(90deg,transparent,rgba(74,222,128,0.2),transparent)",
            animation: "mbScan 2.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                color: "rgba(74,222,128,0.65)",
                fontSize: 9,
                fontFamily: "monospace",
                letterSpacing: 1,
                marginBottom: 1,
              }}
            >
              MAILBOX
            </div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>
              {titleIcon} {title}
            </div>
          </div>
          <span
            style={{
              color: "rgba(74,222,128,0.4)",
              fontSize: 9,
              fontFamily: "monospace",
            }}
          >
            POKÉDEX
          </span>
        </div>
        <div style={{ display: "flex", height: 3 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background:
                  i % 3 === 0 ? "rgba(74,222,128,0.45)" : "transparent",
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// ── 편지 행 ──
function LetterRow({ letter, onClick }) {
  const hasReward =
    letter.rewards?.seals?.length > 0 ||
    letter.rewards?.titles?.length > 0 ||
    letter.rewards?.coins > 0;
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 13px",
        background: letter.read ? "#f9fafb" : "#eff6ff",
        border: `1.5px solid ${!letter.read ? "#93c5fd" : "#e5e7eb"}`,
        borderRadius: 12,
        marginBottom: 6,
        cursor: "pointer",
        boxShadow: letter.read ? "0 2px 0 #e2e8f0" : "0 2px 0 #bfdbfe",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          background: letter.type === "ranking" ? "#fffbeb" : "#f5f3ff",
          border: `1.5px solid ${
            letter.type === "ranking" ? "#fde68a" : "#e9d5ff"
          }`,
        }}
      >
        {letter.type === "ranking"
          ? "🏆"
          : letter.type === "event"
          ? "🎉"
          : "📢"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginBottom: 2,
          }}
        >
          {!letter.read && (
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#3b82f6",
                flexShrink: 0,
              }}
            />
          )}
          <div
            style={{
              fontSize: 13,
              fontWeight: letter.read ? 600 : 800,
              color: letter.read ? "#6b7280" : "#111827",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {letter.title}
          </div>
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#9ca3af",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {letter.sender} ·{" "}
          {letter.sentAt
            ? new Date(letter.sentAt).toLocaleDateString("ko-KR")
            : "방금"}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 3,
          flexShrink: 0,
        }}
      >
        {hasReward && (
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              borderRadius: 99,
              padding: "2px 7px",
              background: letter.claimed ? "#f3f4f6" : "#fffbeb",
              color: letter.claimed ? "#9ca3af" : "#d97706",
              border: `1px solid ${letter.claimed ? "#e5e7eb" : "#fde68a"}`,
            }}
          >
            {letter.claimed ? "수령완료" : "보상있음"}
          </div>
        )}
        <span style={{ fontSize: 12, color: "#d1d5db" }}>›</span>
      </div>
    </div>
  );
}

// ── 편지 상세 모달 ──
function LetterDetailModal({ letter, onClose, onClaim, claiming }) {
  const rewards = letter.rewards ?? {};
  const seals = (rewards.seals ?? []).map(findSeal).filter(Boolean);
  const titles = (rewards.titles ?? []).map(findTitle).filter(Boolean);
  const hasReward =
    seals.length > 0 || titles.length > 0 || (rewards.coins ?? 0) > 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "system-ui,sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 420,
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px",
            borderBottom: "1.5px solid #f1f5f9",
            flexShrink: 0,
            background: "#fff",
          }}
        >
          <button
            onClick={onClose}
            disabled={claiming}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: 99,
              color: "#6b7280",
              fontSize: 12,
              padding: "6px 12px",
              cursor: claiming ? "not-allowed" : "pointer",
              fontWeight: 700,
              whiteSpace: "nowrap",
              opacity: claiming ? 0.5 : 1,
            }}
          >
            ← 목록
          </button>
          <div
            style={{
              flex: 1,
              fontWeight: 800,
              color: "#111827",
              fontSize: 14,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {letter.title}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
              padding: "8px 12px",
              background: "#f8fafc",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
            }}
          >
            <span style={{ fontSize: 18 }}>✉️</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>
                {letter.sender}
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>
                {letter.sentAt
                  ? new Date(letter.sentAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : ""}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#1f2937",
              lineHeight: 2,
              marginBottom: 20,
              whiteSpace: "pre-line",
              background: "#fafafa",
              borderRadius: 12,
              padding: "16px 18px",
              border: "1px solid #f1f5f9",
            }}
          >
            {letter.body}
          </div>

          {hasReward && (
            <div
              style={{
                background: "#fffbeb",
                border: "1.5px solid #fde68a",
                borderRadius: 14,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#92400e",
                  marginBottom: 10,
                }}
              >
                📦 보상 목록
              </div>
              {seals.map((seal) => {
                const rc =
                  seal.rarity === "event" || seal.rarity === "legendary"
                    ? "#d97706"
                    : seal.rarity === "holo"
                    ? "#ec4899"
                    : seal.rarity === "rare"
                    ? "#2563eb"
                    : "#6b7280";
                const rl =
                  seal.rarity === "event"
                    ? "EVENT"
                    : seal.rarity === "legendary"
                    ? "LEGENDARY"
                    : seal.rarity === "holo"
                    ? "HOLO"
                    : seal.rarity === "rare"
                    ? "RARE"
                    : "COMMON";
                return (
                  <div
                    key={seal.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "#fff",
                      borderRadius: 12,
                      padding: "10px 12px",
                      marginBottom: 7,
                      border: `1.5px solid ${rc}33`,
                    }}
                  >
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${seal.pokeId}.png`}
                      alt={seal.name}
                      style={{ width: 48, height: 48, objectFit: "contain" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#111827",
                        }}
                      >
                        {seal.name}
                      </div>
                      <div
                        style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}
                      >
                        {seal.desc}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: rc,
                          marginTop: 2,
                        }}
                      >
                        ★ {rl}
                      </div>
                    </div>
                  </div>
                );
              })}
              {titles.map((title) => (
                <div
                  key={title.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#fff",
                    borderRadius: 12,
                    padding: "10px 12px",
                    marginBottom: 7,
                    border: "1.5px solid #fde68a",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 11,
                      background: "#fffbeb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                    }}
                  >
                    {title.label.split(" ")[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#d97706",
                      }}
                    >
                      {title.label}
                    </div>
                    <div
                      style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}
                    >
                      {title.flavor}
                    </div>
                    <div
                      style={{ fontSize: 10, color: "#d97706", marginTop: 1 }}
                    >
                      칭호 · 랭킹 한정
                    </div>
                  </div>
                </div>
              ))}
              {(rewards.coins ?? 0) > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#fff",
                    borderRadius: 12,
                    padding: "12px 14px",
                    border: "1.5px solid #fde68a",
                  }}
                >
                  <span style={{ fontSize: 28 }}>🪙</span>
                  <div
                    style={{ fontSize: 16, fontWeight: 900, color: "#d97706" }}
                  >
                    {rewards.coins.toLocaleString()} 코인
                  </div>
                </div>
              )}
            </div>
          )}

          {hasReward && !letter.claimed && (
            <button
              onClick={claiming ? undefined : onClaim}
              disabled={claiming}
              style={{
                width: "100%",
                padding: "14px 0",
                background: claiming
                  ? "#d1d5db"
                  : "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)",
                border: "none",
                borderRadius: 28,
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
                cursor: claiming ? "not-allowed" : "pointer",
                boxShadow: claiming ? "none" : "0 4px 0 #166534",
              }}
            >
              {claiming ? "수령 중..." : "🎁 보상 수령하기"}
            </button>
          )}
          {letter.claimed && (
            <div
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#9ca3af",
                padding: 14,
                border: "1.5px solid #e5e7eb",
                borderRadius: 12,
              }}
            >
              ✅ 이미 수령한 편지입니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 메인 ──
export default function MailboxModal({
  myProfile,
  onClose,
  onClaimReward,
  winW,
}) {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [claiming, setClaiming] = useState(false);

  // ★ 락: setState 는 비동기라 동시 클릭 방어 안 됨 → ref 로 즉시 락
  const claimingRef = useRef(false);
  // ★ 이미 claim 성공한 letterId 기록 (같은 세션에서 재시도 차단)
  const claimedInSessionRef = useRef(new Set());

  const W = Math.min(400, (winW || 390) - 32);
  const userId = getPlayerUid();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getLetters(userId);
    setLetters(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpen = useCallback(
    async (letter) => {
      setSelected(letter);
      if (!letter.read) {
        await markRead(userId, letter.id);
        setLetters((prev) =>
          prev.map((l) => (l.id === letter.id ? { ...l, read: true } : l))
        );
      }
    },
    [userId]
  );

  const handleClaim = useCallback(async () => {
    // ── 1차 방어: 즉시 락 (setState 는 느려서 안 됨) ──
    if (!selected) return;
    if (claimingRef.current) return;
    if (claimedInSessionRef.current.has(selected.id)) return;
    if (selected.claimed) return;

    claimingRef.current = true;
    setClaiming(true);

    let txResult = null;
    try {
      // ── 2차 방어: Firebase transaction (서버 원자성) ──
      txResult = await claimLetter(userId, selected.id);
    } catch (e) {
      console.error("claimLetter threw:", e);
    }

    // 성공하지 못했으면 → 여기서 끝. 로컬 상태도 건들지 않음.
    if (!txResult || !txResult.claimed) {
      if (txResult?.alreadyClaimed) {
        // 서버가 "이미 수령됨" 이라고 했으므로 UI 만 동기화
        setSelected((prev) => (prev ? { ...prev, claimed: true } : prev));
        setLetters((prev) =>
          prev.map((l) => (l.id === selected.id ? { ...l, claimed: true } : l))
        );
      }
      claimingRef.current = false;
      setClaiming(false);
      return;
    }

    // ── 3차 방어: 세션 락 ──
    claimedInSessionRef.current.add(selected.id);

    // ── 보상 지급 — onClaimReward 가 Firebase 저장까지 await 하고 돌아오길 기대 ──
    try {
      await onClaimReward?.({
        seals: txResult.rewards?.seals ?? [],
        titles: txResult.rewards?.titles ?? [],
        coins: txResult.rewards?.coins ?? 0,
        letterTitle: txResult.title,
        letterId: selected.id,
      });
    } catch (e) {
      console.error("onClaimReward error:", e);
      // 설령 여기서 실패해도 서버 letter 는 이미 claimed=true 이므로
      // 재시도 불가. 이게 원자적 설계의 핵심.
    }

    // ── UI 동기화 ──
    setSelected((prev) => (prev ? { ...prev, claimed: true } : prev));
    setLetters((prev) =>
      prev.map((l) => (l.id === selected.id ? { ...l, claimed: true } : l))
    );

    claimingRef.current = false;
    setClaiming(false);
  }, [selected, userId, onClaimReward]);

  const handleMarkAllRead = useCallback(async () => {
    await markAllRead(userId);
    setLetters((prev) => prev.map((l) => ({ ...l, read: true })));
  }, [userId]);

  const unreadCount = letters.filter((l) => !l.read).length;
  const unclaimedCount = letters.filter(
    (l) =>
      !l.claimed &&
      (l.rewards?.seals?.length > 0 ||
        l.rewards?.titles?.length > 0 ||
        l.rewards?.coins > 0)
  ).length;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.78)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1020,
          fontFamily: "system-ui,sans-serif",
          padding: 16,
        }}
      >
        <div
          style={{
            width: W,
            maxHeight: "90vh",
            background: "linear-gradient(160deg,#E8190A,#C01208)",
            borderRadius: 28,
            padding: 12,
            boxShadow:
              "0 16px 48px rgba(0,0,0,0.7),inset 0 2px 0 rgba(255,130,110,0.5),inset 0 -3px 0 rgba(0,0,0,0.35)",
            border: "3px solid #8B0000",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <PokedexHeader
            onClose={onClose}
            title="우편함"
            titleIcon="📬"
            rightEl={
              unreadCount > 0 ? (
                <div
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: 11,
                    borderRadius: 99,
                    padding: "2px 8px",
                    boxShadow: "0 2px 8px rgba(239,68,68,0.5)",
                  }}
                >
                  {unreadCount}개 미확인
                </div>
              ) : null
            }
          />
          <div
            style={{
              background: "#FEFEFE",
              borderRadius: 16,
              padding: 12,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "inset 0 2px 0 #fff,inset 0 -2px 0 rgba(180,0,0,0.12)",
            }}
          >
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  width: "100%",
                  padding: "8px 0",
                  borderRadius: 10,
                  border: "1.5px solid #e5e7eb",
                  background: "#f8fafc",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                  color: "#6b7280",
                  marginBottom: 8,
                  boxShadow: "0 2px 0 #e2e8f0",
                }}
              >
                모두 읽음 처리
              </button>
            )}
            {unclaimedCount > 0 && (
              <div
                style={{
                  background: "#fffbeb",
                  border: "1.5px solid #fde68a",
                  borderRadius: 10,
                  padding: "8px 12px",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  boxShadow: "0 2px 0 #fde68a",
                }}
              >
                <span style={{ fontSize: 14 }}>🎁</span>
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: "#d97706" }}
                >
                  수령 대기 중인 보상 {unclaimedCount}개
                </span>
              </div>
            )}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {loading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "#9ca3af",
                    fontSize: 13,
                  }}
                >
                  불러오는 중...
                </div>
              ) : letters.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "#9ca3af",
                    fontSize: 13,
                    lineHeight: 2,
                  }}
                >
                  📭 편지가 없어요
                  <br />
                  랭킹에 오르면 보상 편지가 도착해요!
                </div>
              ) : (
                letters.map((letter) => (
                  <LetterRow
                    key={letter.id}
                    letter={letter}
                    onClick={() => handleOpen(letter)}
                  />
                ))
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "11px 0",
                borderRadius: 28,
                border: "1.5px solid #e5e7eb",
                background: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                color: "#6b7280",
                boxShadow: "0 3px 0 #e2e8f0",
                marginTop: 8,
                flexShrink: 0,
              }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <LetterDetailModal
          letter={selected}
          onClose={() => {
            if (claimingRef.current) return; // 수령 중엔 못 닫음
            setSelected(null);
          }}
          onClaim={handleClaim}
          claiming={claiming}
        />
      )}

      <style>{`@keyframes mbScan { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>
    </>
  );
}
