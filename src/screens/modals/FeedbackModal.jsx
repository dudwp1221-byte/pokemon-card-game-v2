// src/screens/modals/FeedbackModal.jsx
import { useState } from "react";
import {
  sendFeedback,
  FEEDBACK_TYPE,
  FEEDBACK_TYPE_LABELS,
} from "../../lib/feedbackLogic";
import { getPlayerUid } from "../../lib/db";

export default function FeedbackModal({
  myProfile,
  myName,
  page = "lobby",
  onClose,
}) {
  const [type, setType] = useState(FEEDBACK_TYPE.BUG);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const nickname =
    myProfile?.nickname ?? myProfile?.name ?? myName ?? "트레이너";

  const handleSubmit = async () => {
    if (sending || sent) return;
    if (!text.trim()) {
      setError("내용을 입력해주세요");
      return;
    }
    setError("");
    setSending(true);

    const result = await sendFeedback({
      nickname,
      uid: getPlayerUid(),
      type,
      text,
      page,
    });

    setSending(false);
    if (result.ok) {
      setSent(true);
      setTimeout(() => onClose?.(), 1500);
    } else {
      setError(result.error || "전송 실패");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 220,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "system-ui,sans-serif",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 420,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>💬</span>
            <span style={{ fontWeight: 900, fontSize: 16, color: "#111827" }}>
              의견 보내기
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: 8,
              color: "#6b7280",
              fontSize: 13,
              padding: "5px 12px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ✕ 닫기
          </button>
        </div>

        {/* 본문 */}
        <div style={{ padding: "18px 20px" }}>
          {sent ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#16a34a",
                  marginBottom: 6,
                }}
              >
                전달 완료!
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                소중한 의견 감사합니다 💌
              </div>
            </div>
          ) : (
            <>
              {/* 닉네임 표시 */}
              <div
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  marginBottom: 14,
                }}
              >
                보내는 사람:{" "}
                <span style={{ fontWeight: 700, color: "#374151" }}>
                  {nickname}
                </span>
              </div>

              {/* 종류 선택 */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                종류
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {Object.entries(FEEDBACK_TYPE_LABELS).map(([key, info]) => {
                  const selected = type === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setType(key)}
                      style={{
                        flex: 1,
                        padding: "12px 8px",
                        borderRadius: 12,
                        border: `2px solid ${
                          selected ? info.color : "#e5e7eb"
                        }`,
                        background: selected ? `${info.color}15` : "#fff",
                        cursor: "pointer",
                        fontWeight: selected ? 800 : 600,
                        fontSize: 13,
                        color: selected ? info.color : "#6b7280",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 4 }}>
                        {info.emoji}
                      </div>
                      {info.label}
                    </button>
                  );
                })}
              </div>

              {/* 텍스트 입력 */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                내용
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 500))}
                placeholder={
                  type === "bug"
                    ? "어떤 상황에서 어떤 문제가 있었는지 알려주세요!"
                    : "어떤 기능이 있으면 좋을지 자유롭게 적어주세요!"
                }
                rows={6}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid #e5e7eb",
                  fontFamily: "inherit",
                  fontSize: 14,
                  lineHeight: 1.5,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <div
                style={{
                  fontSize: 11,
                  color: text.length >= 500 ? "#ef4444" : "#9ca3af",
                  textAlign: "right",
                  marginTop: 4,
                }}
              >
                {text.length} / 500
              </div>

              {error && (
                <div
                  style={{
                    fontSize: 12,
                    color: "#ef4444",
                    marginTop: 8,
                    padding: "8px 12px",
                    background: "#fef2f2",
                    borderRadius: 8,
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              {/* 보내기 버튼 */}
              <button
                onClick={handleSubmit}
                disabled={sending || !text.trim()}
                style={{
                  width: "100%",
                  marginTop: 16,
                  padding: "13px 0",
                  borderRadius: 12,
                  border: "none",
                  background:
                    !text.trim() || sending
                      ? "#e5e7eb"
                      : "linear-gradient(135deg,#3b82f6,#2563eb)",
                  color: !text.trim() || sending ? "#9ca3af" : "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: !text.trim() || sending ? "not-allowed" : "pointer",
                }}
              >
                {sending ? "전송 중..." : "📤 보내기"}
              </button>

              <div
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  textAlign: "center",
                  marginTop: 10,
                  lineHeight: 1.6,
                }}
              >
                답장이 필요한 의견은 우편함으로 보내드려요 💌
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
