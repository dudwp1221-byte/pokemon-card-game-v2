import { useState } from "react";
import { CardFace } from "../../components/CardFace";

const mc = (group, type, isJoker = false, id = 0) => ({
  id,
  group,
  type,
  isJoker,
});

// 포켓덱스 모달 래퍼
function Shell({ onClose, title, screenLabel, screenTitle, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1025,
        fontFamily: "system-ui,sans-serif",
        padding: 12,
      }}
    >
      <div
        style={{
          width: Math.min(400, window.innerWidth - 24),
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          borderRadius: 28,
          padding: 12,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.7),inset 0 2px 0 rgba(255,130,110,0.5),inset 0 -3px 0 rgba(0,0,0,0.35)",
          border: "3px solid #8B0000",
          animation: "tutPop 0.25s ease",
        }}
      >
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
              {title}
            </span>
          </div>
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
          }}
        >
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg,transparent,rgba(74,222,128,0.2),transparent)",
              animation: "scanLine 2.5s ease-in-out infinite",
            }}
          />
          <div style={{ padding: "8px 14px" }}>
            <div
              style={{
                color: "rgba(74,222,128,0.65)",
                fontSize: 9,
                fontFamily: "monospace",
                letterSpacing: 1,
                marginBottom: 1,
              }}
            >
              {screenLabel}
            </div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>
              {screenTitle}
            </div>
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
        <div
          style={{
            background: "#FEFEFE",
            borderRadius: 20,
            padding: 12,
            boxShadow: "inset 0 2px 0 #fff,inset 0 -2px 0 rgba(180,0,0,0.12)",
          }}
        >
          {children}
        </div>
      </div>
      <style>{`
        @keyframes scanLine { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes tutPop   { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}

function buildSteps(images) {
  const CF = ({ card, w, h }) => (
    <CardFace card={card} images={images} w={w} h={h} />
  );
  const Row = ({ set, msg, sub, good = true }) => (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginBottom: 7,
        }}
      >
        {set.map((c, i) => (
          <CF key={i} card={c} w={58} h={80} />
        ))}
      </div>
      <div
        style={{
          background: good ? "#F0FDF4" : "#FEF2F2",
          borderRadius: 10,
          padding: 9,
          border: `1.5px solid ${good ? "#bbf7d0" : "#FECACA"}`,
          boxShadow: `0 3px 0 ${good ? "#bbf7d0" : "#FECACA"}`,
          fontSize: 12,
          color: good ? "#15803D" : "#DC2626",
          fontWeight: 700,
        }}
      >
        {msg}
        {sub && (
          <>
            <br />
            <span style={{ fontWeight: 400, fontSize: 10, color: "#6B7280" }}>
              {sub}
            </span>
          </>
        )}
      </div>
    </div>
  );

  return [
    {
      title: "🎯 게임 목표",
      content: (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🏆</div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              color: "#1e3a5f",
              marginBottom: 10,
            }}
          >
            세트 3개를 완성하면 승리!
          </div>
          <div
            style={{
              background: "#EEF2FF",
              borderRadius: 12,
              padding: "11px 14px",
              fontSize: 12,
              color: "#374151",
              lineHeight: 1.8,
              border: "1.5px solid #C7D2FE",
              boxShadow: "0 3px 0 #c7d2fe",
            }}
          >
            카드를 한 장씩 뽑고 버리면서
            <br />
            <b>내 패 9장으로 세트 3개</b>를 만드세요.
          </div>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            {[
              mc("electric", "A", false, 1),
              mc("water", "B", false, 2),
              mc("fire", "C", false, 3),
              mc("grass", "A", false, 4),
              mc("poison", "B", false, 5),
              mc("ground", "C", false, 6),
              mc("normal", "A", false, 7),
              mc("rock", "B", false, 8),
              mc("electric", "C", false, 9),
            ].map((c) => (
              <CF key={c.id} card={c} w={34} h={47} />
            ))}
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: "#9CA3AF" }}>
            ↑ 9장의 패로 세트 3개 완성
          </div>
        </div>
      ),
    },
    {
      title: "✅ 세트 ① 완전히 같은 카드 3장",
      content: (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 12,
              color: "#374151",
              marginBottom: 12,
              lineHeight: 1.7,
            }}
          >
            <b>똑같은 카드</b>를 3장 모으면 세트예요!
          </div>
          <Row
            set={[
              mc("electric", "A", false, 1),
              mc("electric", "A", false, 2),
              mc("electric", "A", false, 3),
            ]}
            msg="✅ 전기A + 전기A + 전기A = 세트!"
          />
          <Row
            set={[
              mc("fire", "C", false, 4),
              mc("fire", "C", false, 5),
              mc("fire", "C", false, 6),
            ]}
            msg="✅ 불C + 불C + 불C = 세트!"
          />
        </div>
      ),
    },
    {
      title: "✅ 세트 ② 같은 속성 A·B·C 각 1장",
      content: (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 12,
              color: "#374151",
              marginBottom: 12,
              lineHeight: 1.7,
            }}
          >
            <b>같은 속성</b>의 A·B·C 카드를 각 1장씩 모아도 세트!
          </div>
          <Row
            set={[
              mc("electric", "A", false, 1),
              mc("electric", "B", false, 2),
              mc("electric", "C", false, 3),
            ]}
            msg="✅ 전기A + 전기B + 전기C = 세트!"
          />
          <Row
            set={[
              mc("water", "A", false, 4),
              mc("water", "B", false, 5),
              mc("water", "C", false, 6),
            ]}
            msg="✅ 물A + 물B + 물C = 세트!"
          />
        </div>
      ),
    },
    {
      title: "❌ 이건 세트가 아니에요!",
      content: (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 12,
              color: "#374151",
              marginBottom: 12,
              lineHeight: 1.7,
            }}
          >
            헷갈리기 쉬운 경우예요!
          </div>
          <Row
            set={[
              mc("electric", "A", false, 1),
              mc("electric", "A", false, 2),
              mc("electric", "B", false, 3),
            ]}
            msg="❌ 전기A + 전기A + 전기B → 세트 아님!"
            sub="(A가 2장 중복)"
            good={false}
          />
          <Row
            set={[
              mc("electric", "A", false, 4),
              mc("water", "B", false, 5),
              mc("fire", "C", false, 6),
            ]}
            msg="❌ 전기A + 물B + 불C → 세트 아님!"
            sub="(서로 다른 속성)"
            good={false}
          />
        </div>
      ),
    },
    {
      title: "🌀 조커 카드",
      content: (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 12,
              color: "#374151",
              marginBottom: 12,
              lineHeight: 1.7,
            }}
          >
            조커는 <b>어떤 카드로도 대체</b> 가능해요!
          </div>
          <Row
            set={[
              mc("electric", "A", false, 1),
              mc("electric", "A", false, 2),
              mc("joker", "1", true, 3),
            ]}
            msg="✅ 전기A + 전기A + 조커 = 세트!"
            sub="(조커가 전기A 역할 대신)"
          />
          <Row
            set={[
              mc("water", "A", false, 4),
              mc("joker", "2", true, 5),
              mc("water", "C", false, 6),
            ]}
            msg="✅ 물A + 조커 + 물C = 세트!"
            sub="(조커가 물B 역할 대신)"
          />
        </div>
      ),
    },
    {
      title: "🃏 턴 진행 방법",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            {
              ico: "📦",
              bg: "#EEF2FF",
              bc: "#C7D2FE",
              tc: "#4338CA",
              n: "① 카드 뽑기",
              c: "덱(뒤집힌 더미) 또는 상대방이 버린 카드 중 1장을 가져와요.",
            },
            {
              ico: "🗑️",
              bg: "#FFFBEB",
              bc: "#FCD34D",
              tc: "#92400E",
              n: "② 카드 버리기",
              c: "패가 9장이 되면 1장을 골라 버려요.",
            },
            {
              ico: "🏆",
              bg: "#F0FDF4",
              bc: "#bbf7d0",
              tc: "#15803D",
              n: "③ 세트 3개 완성 → 즉시 승리!",
              c: "카드를 뽑는 순간 9장이 모두 세트를 이루면 자동으로 게임이 끝나요.",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 12,
                background: s.bg,
                border: `1.5px solid ${s.bc}`,
                boxShadow: `0 3px 0 ${s.bc}`,
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{s.ico}</span>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 12,
                    color: s.tc,
                    marginBottom: 2,
                  }}
                >
                  {s.n}
                </div>
                <div
                  style={{ fontSize: 11, color: "#374151", lineHeight: 1.6 }}
                >
                  {s.c}
                </div>
              </div>
            </div>
          ))}
          <div
            style={{
              background: "#F3F4F6",
              borderRadius: 10,
              padding: 9,
              border: "1.5px solid #E5E7EB",
              fontSize: 11,
              color: "#6B7280",
              textAlign: "center",
            }}
          >
            💡 30초 안에 행동하지 않으면 자동으로 턴이 넘어가요
          </div>
        </div>
      ),
    },
    {
      title: "⚔️ 승리 선언 (고급 전략)",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            {
              ico: "🕐",
              bg: "#FEF2F2",
              bc: "#FECACA",
              tc: "#DC2626",
              n: "언제?",
              c: "버릴 때 '⚔️ 승리 선언!' 버튼을 눌러요.",
            },
            {
              ico: "💰",
              bg: "#FFFBEB",
              bc: "#FCD34D",
              tc: "#92400E",
              n: "비용",
              c: "선언 즉시 코인이 차감돼요.",
            },
            {
              ico: "🎉",
              bg: "#F0FDF4",
              bc: "#bbf7d0",
              tc: "#15803D",
              n: "성공하면?",
              c: "팟 × 2배를 획득! 리스크 대비 큰 보상이에요.",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 12,
                background: s.bg,
                border: `1.5px solid ${s.bc}`,
                boxShadow: `0 3px 0 ${s.bc}`,
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{s.ico}</span>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 12,
                    color: s.tc,
                    marginBottom: 2,
                  }}
                >
                  {s.n}
                </div>
                <div
                  style={{ fontSize: 11, color: "#374151", lineHeight: 1.6 }}
                >
                  {s.c}
                </div>
              </div>
            </div>
          ))}
          <div
            style={{
              background: "#EEF2FF",
              borderRadius: 12,
              padding: "10px 12px",
              border: "1.5px solid #C7D2FE",
              boxShadow: "0 3px 0 #c7d2fe",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontWeight: 900,
                fontSize: 13,
                color: "#4338CA",
                marginBottom: 3,
              }}
            >
              💡 전략 팁
            </div>
            <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.7 }}>
              세트 2개 이상 완성됐을 때 선언하면 효과적이에요.
              <br />
              무리하게 선언하면 코인만 날릴 수 있어요!
            </div>
          </div>
        </div>
      ),
    },
  ];
}

export default function TutorialModal({ onClose, images = {} }) {
  const [step, setStep] = useState(0);
  const steps = buildSteps(images);
  const TOTAL = steps.length;
  const cur = steps[step];

  return (
    <Shell
      onClose={onClose}
      title="🎓 튜토리얼"
      screenLabel="TUTORIAL"
      screenTitle={`${step + 1}/${TOTAL} ${cur.title}`}
    >
      {/* 진행 바 */}
      <div
        style={{
          height: 6,
          background: "#F3F4F6",
          borderRadius: 99,
          marginBottom: 12,
          overflow: "hidden",
          border: "1.5px solid #E5E7EB",
        }}
      >
        <div
          style={{
            width: `${((step + 1) / TOTAL) * 100}%`,
            height: "100%",
            background: "linear-gradient(90deg,#E8190A,#f87171)",
            borderRadius: 99,
            transition: "width 0.3s ease",
          }}
        />
      </div>
      {/* 콘텐츠 */}
      <div
        style={{
          minHeight: 200,
          maxHeight: "44vh",
          overflowY: "auto",
          marginBottom: 12,
        }}
      >
        {cur.content}
      </div>
      {/* 버튼 */}
      <div style={{ display: "flex", gap: 8 }}>
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 28,
              border: "1.5px solid #E5E7EB",
              background: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              color: "#374151",
              boxShadow: "0 3px 0 #e2e8f0",
            }}
          >
            ← 이전
          </button>
        )}
        {step < TOTAL - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            style={{
              flex: 2,
              padding: "11px 0",
              borderRadius: 28,
              border: "2px solid #15803d",
              background: "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: "0 4px 0 #166534",
            }}
          >
            다음 →
          </button>
        ) : (
          <button
            onClick={onClose}
            style={{
              flex: 2,
              padding: "11px 0",
              borderRadius: 28,
              border: "2px solid #15803d",
              background: "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: "0 4px 0 #166534",
            }}
          >
            🎮 게임 시작!
          </button>
        )}
      </div>
    </Shell>
  );
}
