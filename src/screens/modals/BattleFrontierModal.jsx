// src/screens/modals/BattleFrontierModal.jsx
import { WILD_RULES } from "../../lib/wildRules";
import PokeModalShell from "../../components/PokeModalShell";

export default function BattleFrontierModal({
  onClose,
  onSolo,
  onCreateRoom,
  onPublicRooms,
  onJoinRoom,
  winW,
}) {
  // 배틀프런티어 = 항상 특수룰
  const BTN = [
    {
      icon: "🤖",
      label: "솔로 도전",
      sub: "AI 상대 · 특수룰",
      fn: () => onSolo(true),
      border: "#a78bfa",
    },
    {
      icon: "🏠",
      label: "방 만들기",
      sub: "친구 초대 · 특수룰",
      fn: () => onCreateRoom(true),
      border: "#4ade80",
    },
    {
      icon: "🌐",
      label: "공개방 참가",
      sub: "랜덤 매칭 · 특수룰",
      fn: () => onPublicRooms(true),
      border: "#60a5fa",
    },
    {
      icon: "🔑",
      label: "코드로 입장",
      sub: "비공개 · 특수룰",
      fn: () => onJoinRoom(true),
      border: "#fbbf24",
    },
  ];

  return (
    <PokeModalShell
      onClose={onClose}
      title="배틀프런티어"
      titleIcon="🏟️"
      screenColor="rgba(139,92,246,0.8)"
      winW={winW}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* 특수룰 미리보기 (항상 표시) */}
        <div
          style={{
            background:
              "linear-gradient(135deg,rgba(167,139,250,0.1),rgba(99,102,241,0.06))",
            borderRadius: 12,
            padding: "10px 12px",
            border: "1.5px solid rgba(167,139,250,0.25)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "#7c3aed",
              marginBottom: 6,
            }}
          >
            ✨ 특수룰 — 랜덤 특수룰 적용
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {Object.values(WILD_RULES).map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: `${r.color}15`,
                  border: `1px solid ${r.color}40`,
                  borderRadius: 99,
                  padding: "3px 9px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: r.color,
                }}
              >
                <span>{r.emoji}</span>
                <span>{r.name}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 7 }}>
            게임 시작 직전 랜덤으로 1개가 모두에게 공개돼요
          </div>
        </div>

        <div style={{ height: 1, background: "#f1f5f9" }} />

        {/* 모드 버튼 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {BTN.map((b) => (
            <button
              key={b.label}
              onClick={b.fn}
              style={{
                width: "100%",
                padding: "13px 14px",
                borderRadius: 12,
                border: `1.5px solid ${b.border}44`,
                background: `${b.border}10`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{b.icon}</span>
              <div style={{ textAlign: "left", flex: 1 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    color: "#111827",
                    marginBottom: 2,
                  }}
                >
                  {b.label}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>{b.sub}</div>
              </div>
              <span style={{ color: "#d1d5db", fontSize: 16 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </PokeModalShell>
  );
}
