export default function TeamRulesModal({ onClose }) {
  const rows = [
    {
      bg: "#EEF2FF",
      bc: "#C7D2FE",
      content: (
        <>
          <b>🔵A팀(0·2번) vs 🔴B팀(1·3번)</b>
          <br />
          4인 전원 (나 + AI 3명)
        </>
      ),
    },
    {
      bg: "#F0FDF4",
      bc: "#BBF7D0",
      content: (
        <>
          🏆 팀원 중 1명이 9장 3세트 완성 → <b>팀 전체 승리!</b>
        </>
      ),
    },
    {
      bg: "#FFF9C4",
      bc: "#FCD34D",
      content: (
        <>
          💰 팟 분배: <b>승리자 pot÷2</b> + <b>팀원 pot÷2</b>
          <br />
          승부선언 성공 시: 승리자 pot×2 / 팀원 pot÷2
        </>
      ),
    },
    {
      bg: "#F3E5F5",
      bc: "#CE93D8",
      content: (
        <>
          🤝 팀원 패는 <b>완성 세트 속성만</b> 힌트로 표시
        </>
      ),
    },
    {
      bg: "#FEF2F2",
      bc: "#FECACA",
      content: <>⚔️ 덱: 카드 4장씩 × 8속성 × 3종 + 조커 2장 = 98장</>,
    },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 1020,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 24,
          width: 340,
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
            👥 팀 배틀 규칙
          </h3>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "1px solid #E5E7EB",
              background: "#F9FAFB",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              color: "#6B7280",
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            fontSize: 13,
            color: "#374151",
          }}
        >
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                background: r.bg,
                borderRadius: 10,
                padding: "10px 12px",
                border: "1px solid " + r.bc,
              }}
            >
              {r.content}
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: 16,
            padding: "11px 0",
            borderRadius: 9,
            border: "none",
            background: "linear-gradient(135deg,#3B82F6,#1D4ED8)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ✅ 확인
        </button>
      </div>
    </div>
  );
}
