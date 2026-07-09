// src/components/PokeModalShell.jsx
// 포켓덱스 감성 모달 공통 래퍼

export default function PokeModalShell({
  onClose,
  title, // 스크린 상단 타이틀 텍스트
  titleIcon, // 스크린 상단 아이콘 (선택)
  screenColor = "rgba(74,222,128,0.65)", // 스크린 텍스트 색상
  children, // 흰 패널 안 컨텐츠
  winW,
  zIndex = 1100,
  maxWidth = 380,
  noPadding = false, // 흰 패널 패딩 없애기 (커스텀 스크롤 필요 시)
}) {
  const W = winW ? Math.min(maxWidth, winW - 32) : maxWidth;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex,
        background: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui,sans-serif",
        padding: 16,
        animation: "pkModalFadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: W,
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          borderRadius: 28,
          padding: 12,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.65), inset 0 2px 0 rgba(255,130,110,0.5), inset 0 -3px 0 rgba(0,0,0,0.35)",
          border: "3px solid #8B0000",
          animation: "pkModalPop 0.25s ease",
        }}
      >
        {/* 상단 바 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "4px 4px 10px",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              flexShrink: 0,
              position: "relative",
              background:
                "radial-gradient(circle at 32% 28%,#bfdbfe,#2563EB 55%,#1e3a8a)",
              boxShadow:
                "0 0 0 3px rgba(255,255,255,0.3), 0 0 16px rgba(59,130,246,0.6)",
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
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            {[
              { c: "#f87171", g: "#ef4444" },
              { c: "#fbbf24", g: "#f59e0b" },
              { c: "#4ade80", g: "#22c55e" },
            ].map(({ c, g }, i) => (
              <div
                key={i}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: c,
                  boxShadow: `0 0 6px ${g}`,
                  border: "1.5px solid rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span
              style={{
                color: "#fff",
                fontWeight: 900,
                fontSize: 15,
                letterSpacing: 1,
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              }}
            >
              ⚡ PokéSet
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)",
              background: "rgba(0,0,0,0.3)",
              color: "rgba(255,255,255,0.8)",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* 스크린 (제목) */}
        <div
          style={{
            background: "#0a0f1a",
            borderRadius: 12,
            border: "4px solid #fff",
            boxShadow: "0 0 0 2px #bbb, inset 0 2px 10px rgba(0,0,0,0.9)",
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg,transparent,rgba(74,222,128,0.2),transparent)",
              animation: "pkScanLine 2.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {titleIcon && <span style={{ fontSize: 18 }}>{titleIcon}</span>}
            <div>
              <div
                style={{
                  color: screenColor,
                  fontSize: 8,
                  fontFamily: "monospace",
                  letterSpacing: 1,
                  marginBottom: 1,
                }}
              >
                POKÉSET SYSTEM
              </div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>
                {title}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", height: 2 }}>
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

        {/* 흰 패널 */}
        <div
          style={{
            background: "#FEFEFE",
            borderRadius: 18,
            padding: noPadding ? 0 : 12,
            boxShadow: "inset 0 2px 0 #fff, inset 0 -2px 0 rgba(180,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>

      <style>{`
          @keyframes pkModalFadeIn { from{opacity:0} to{opacity:1} }
          @keyframes pkModalPop    { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
          @keyframes pkScanLine    { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        `}</style>
    </div>
  );
}
