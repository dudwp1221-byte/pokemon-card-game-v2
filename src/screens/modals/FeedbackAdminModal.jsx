// src/screens/modals/FeedbackAdminModal.jsx
import { useState, useEffect, useCallback } from "react";
import {
  getAllFeedback,
  markFeedbackRead,
  toggleFeedbackResolved,
  saveFeedbackReply,
  FEEDBACK_TYPE_LABELS,
} from "../../lib/feedbackLogic";
import { sendLetter, LETTER_TYPE } from "../../lib/mailboxLogic";

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}일 전`;
  return new Date(ts).toLocaleDateString("ko-KR");
}

export default function FeedbackAdminModal({ onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | bug | suggestion
  const [showResolved, setShowResolved] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyCoins, setReplyCoins] = useState(0);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAllFeedback();
    setList(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = list.filter((f) => {
    if (filter !== "all" && f.type !== filter) return false;
    if (!showResolved && f.resolved) return false;
    return true;
  });

  const unreadCount = list.filter((f) => !f.read).length;
  const unresolvedCount = list.filter((f) => !f.resolved).length;

  const handleMarkRead = async (f) => {
    await markFeedbackRead(f.id);
    setList((prev) =>
      prev.map((x) => (x.id === f.id ? { ...x, read: true } : x))
    );
  };

  const handleToggleResolved = async (f) => {
    const next = !f.resolved;
    await toggleFeedbackResolved(f.id, next);
    setList((prev) =>
      prev.map((x) => (x.id === f.id ? { ...x, resolved: next } : x))
    );
  };

  const handleStartReply = (f) => {
    setReplyTarget(f);
    setReplyText("");
    setReplyCoins(0);
    if (!f.read) handleMarkRead(f);
  };

  const handleSendReply = async () => {
    if (!replyTarget || !replyText.trim() || sending) return;
    if (!replyTarget.uid) {
      alert("이 피드백에는 uid 가 없어 답장 우편을 보낼 수 없어요.");
      return;
    }
    setSending(true);

    try {
      // 1) 우편함으로 답장 발송
      const typeLabel = FEEDBACK_TYPE_LABELS[replyTarget.type]?.label ?? "의견";
      await sendLetter(replyTarget.uid, {
        type: LETTER_TYPE.SYSTEM,
        title: `💌 ${typeLabel}에 답장이 도착했어요`,
        body:
          `안녕하세요 ${replyTarget.nickname}님!\n\n` +
          `보내주신 의견에 답장드려요.\n\n` +
          `─────────────────\n` +
          `📝 보내주신 내용:\n` +
          `"${replyTarget.text}"\n` +
          `─────────────────\n\n` +
          `💬 답장:\n${replyText.trim()}\n\n` +
          (replyCoins > 0
            ? `소중한 의견 감사합니다! 보상 코인을 함께 보내드려요 🎁`
            : `소중한 의견 감사합니다 💌`),
        sender: "PokéSet 운영팀",
        rewards: { coins: Math.max(0, replyCoins) },
      });

      // 2) 피드백 자체에 답장 기록
      await saveFeedbackReply(replyTarget.id, replyText.trim());

      // 3) 로컬 갱신
      setList((prev) =>
        prev.map((x) =>
          x.id === replyTarget.id
            ? {
                ...x,
                read: true,
                reply: replyText.trim(),
                repliedAt: Date.now(),
              }
            : x
        )
      );
      setReplyTarget(null);
      setReplyText("");
      setReplyCoins(0);
    } catch (e) {
      alert("답장 발송 실패: " + (e?.message ?? e));
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 230,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "system-ui,sans-serif",
      }}
    >
      <div
        style={{
          background: "#0d0d0d",
          border: "2px solid #22c55e",
          borderRadius: 18,
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid #1f2937",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 15,
                color: "#22c55e",
                letterSpacing: 1,
              }}
            >
              📋 FEEDBACK INBOX
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>
              총 {list.length}개 · 미읽 {unreadCount} · 미해결 {unresolvedCount}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={load}
              style={{
                background: "#1f2937",
                border: "none",
                borderRadius: 8,
                color: "#9ca3af",
                fontSize: 12,
                padding: "5px 10px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ↻ 새로고침
            </button>
            <button
              onClick={onClose}
              style={{
                background: "#1f2937",
                border: "none",
                borderRadius: 8,
                color: "#9ca3af",
                fontSize: 12,
                padding: "5px 10px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ✕ 닫기
            </button>
          </div>
        </div>

        {/* 필터 */}
        <div
          style={{
            padding: "10px 18px",
            borderBottom: "1px solid #1f2937",
            display: "flex",
            gap: 6,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { key: "all", label: "전체" },
            { key: "bug", label: "🐛 버그" },
            { key: "suggestion", label: "💡 건의" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                background: filter === f.key ? "#22c55e22" : "#1f2937",
                border: `1px solid ${
                  filter === f.key ? "#22c55e" : "transparent"
                }`,
                borderRadius: 8,
                color: filter === f.key ? "#22c55e" : "#9ca3af",
                fontSize: 11,
                padding: "5px 10px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {f.label}
            </button>
          ))}
          <label
            style={{
              fontSize: 11,
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
            />
            해결됨 표시
          </label>
        </div>

        {/* 리스트 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
          {loading ? (
            <div style={{ textAlign: "center", color: "#6b7280", padding: 30 }}>
              로딩 중...
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#374151",
                padding: 40,
                fontSize: 14,
                lineHeight: 2,
              }}
            >
              📭 피드백이 없어요
            </div>
          ) : (
            filtered.map((f) => {
              const meta = FEEDBACK_TYPE_LABELS[f.type] ?? {
                emoji: "❓",
                label: f.type,
                color: "#9ca3af",
              };
              return (
                <div
                  key={f.id}
                  style={{
                    background: f.resolved
                      ? "#0a1f0a"
                      : !f.read
                      ? "#1a1a2e"
                      : "#111",
                    border: `1px solid ${
                      !f.read ? `${meta.color}55` : "#1f2937"
                    }`,
                    borderRadius: 12,
                    padding: "11px 13px",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{meta.emoji}</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: meta.color,
                      }}
                    >
                      {meta.label}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#fff",
                        marginLeft: 4,
                      }}
                    >
                      {f.nickname}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "#6b7280",
                        marginLeft: "auto",
                      }}
                    >
                      {timeAgo(f.createdAt)}
                    </span>
                    {!f.read && (
                      <span
                        style={{
                          fontSize: 8,
                          fontWeight: 900,
                          background: "#ef4444",
                          color: "#fff",
                          borderRadius: 99,
                          padding: "1px 6px",
                        }}
                      >
                        NEW
                      </span>
                    )}
                    {f.resolved && (
                      <span
                        style={{
                          fontSize: 8,
                          fontWeight: 900,
                          background: "#22c55e22",
                          color: "#22c55e",
                          borderRadius: 99,
                          padding: "1px 6px",
                          border: "1px solid #22c55e55",
                        }}
                      >
                        해결됨
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: "#e5e7eb",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.5,
                      marginBottom: 8,
                    }}
                  >
                    {f.text}
                  </div>

                  {f.reply && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        background: "#0a0a1a",
                        borderLeft: "2px solid #3b82f6",
                        padding: "7px 10px",
                        marginBottom: 8,
                        borderRadius: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          color: "#3b82f6",
                          fontWeight: 800,
                          marginBottom: 3,
                        }}
                      >
                        📤 답장 ({timeAgo(f.repliedAt ?? Date.now())})
                      </div>
                      {f.reply}
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: 9,
                      color: "#4b5563",
                      marginBottom: 6,
                    }}
                  >
                    page: {f.page} · uid: {f.uid?.slice(0, 16) ?? "—"}
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    {!f.reply && f.uid && (
                      <button
                        onClick={() => handleStartReply(f)}
                        style={{
                          flex: 1,
                          padding: "6px 0",
                          borderRadius: 8,
                          border: "1px solid #3b82f655",
                          background: "#3b82f622",
                          color: "#60a5fa",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        💌 답장
                      </button>
                    )}
                    {!f.read && (
                      <button
                        onClick={() => handleMarkRead(f)}
                        style={{
                          flex: 1,
                          padding: "6px 0",
                          borderRadius: 8,
                          border: "1px solid #1f2937",
                          background: "#0a0a1a",
                          color: "#9ca3af",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        읽음
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleResolved(f)}
                      style={{
                        flex: 1,
                        padding: "6px 0",
                        borderRadius: 8,
                        border: `1px solid ${
                          f.resolved ? "#22c55e55" : "#1f2937"
                        }`,
                        background: f.resolved ? "#22c55e22" : "#0a0a1a",
                        color: f.resolved ? "#22c55e" : "#9ca3af",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {f.resolved ? "✓ 해결됨" : "○ 미해결"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 답장 작성 오버레이 */}
        {replyTarget && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              zIndex: 1,
            }}
            onClick={() => !sending && setReplyTarget(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#0d0d0d",
                border: "2px solid #3b82f6",
                borderRadius: 16,
                padding: "16px 18px",
                width: "100%",
                maxWidth: 440,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: "#60a5fa",
                  marginBottom: 4,
                }}
              >
                💌 {replyTarget.nickname}님에게 답장
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  background: "#0a0a1a",
                  padding: "8px 10px",
                  borderRadius: 6,
                  marginTop: 8,
                  marginBottom: 12,
                  maxHeight: 80,
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                }}
              >
                "{replyTarget.text}"
              </div>

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value.slice(0, 500))}
                placeholder="답장 내용을 입력하세요..."
                rows={5}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #1f2937",
                  background: "#0a0a1a",
                  color: "#e5e7eb",
                  fontFamily: "inherit",
                  fontSize: 13,
                  lineHeight: 1.5,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  color: "#4b5563",
                  textAlign: "right",
                  marginTop: 3,
                }}
              >
                {replyText.length} / 500
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 12,
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  보너스 코인:
                </span>
                {[0, 100, 500, 1000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setReplyCoins(v)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: `1px solid ${
                        replyCoins === v ? "#fcd34d" : "#1f2937"
                      }`,
                      background: replyCoins === v ? "#fcd34d22" : "#0a0a1a",
                      color: replyCoins === v ? "#fcd34d" : "#6b7280",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {v === 0 ? "없음" : `+${v}`}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setReplyTarget(null)}
                  disabled={sending}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 10,
                    border: "1px solid #1f2937",
                    background: "#0a0a1a",
                    color: "#9ca3af",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: sending ? "not-allowed" : "pointer",
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sending}
                  style={{
                    flex: 2,
                    padding: "10px 0",
                    borderRadius: 10,
                    border: "none",
                    background:
                      !replyText.trim() || sending
                        ? "#1f2937"
                        : "linear-gradient(135deg,#3b82f6,#2563eb)",
                    color: !replyText.trim() || sending ? "#4b5563" : "#fff",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor:
                      !replyText.trim() || sending ? "not-allowed" : "pointer",
                  }}
                >
                  {sending ? "발송 중..." : "📤 우편으로 답장"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
