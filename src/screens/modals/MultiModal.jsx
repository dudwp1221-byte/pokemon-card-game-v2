// src/screens/modals/MultiModal.jsx
import PokeModalShell from "../../components/PokeModalShell";

export default function MultiModal({
  onClose,
  onCreateRoom,
  onPublicRooms,
  onJoinRoom,
  winW,
}) {
  const BTN = [
    {
      icon: "🏠",
      label: "방 만들기",
      sub: "방을 만들고 친구를 초대해요",
      fn: onCreateRoom,
      color: "#4ade80",
      shadow: "#bbf7d0",
    },
    {
      icon: "🌐",
      label: "공개방 참가",
      sub: "열린 방에서 랜덤 매칭해요",
      fn: onPublicRooms,
      color: "#60a5fa",
      shadow: "#bfdbfe",
    },
    {
      icon: "🔑",
      label: "코드로 입장",
      sub: "코드를 입력하고 참가해요",
      fn: onJoinRoom,
      color: "#fbbf24",
      shadow: "#fef08a",
    },
  ];

  return (
    <PokeModalShell
      onClose={onClose}
      title="멀티플레이"
      titleIcon="👥"
      screenColor="rgba(59,130,246,0.85)"
      winW={winW}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {BTN.map((b) => (
          <button
            key={b.label}
            onClick={b.fn}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 14,
              border: `1.5px solid ${b.color}55`,
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: `0 3px 0 ${b.shadow}`,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${b.color}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 24 }}>{b.icon}</span>
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 14,
                  color: "#111827",
                  marginBottom: 3,
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
    </PokeModalShell>
  );
}
