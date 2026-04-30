import TrainerPortrait from "../components/TrainerPortrait";
import ProfileBorder from "../components/ProfileBorder";
import { TitleBadge, BadgeIcon } from "./modals/ProfileEditor";

const BET_OPTIONS = [
  { val: 30, label: "30" },
  { val: 80, label: "80" },
  { val: 150, label: "150" },
];

function PokedexShell({ winW, lobbyBg, title, children }) {
  const W = Math.min(380, winW - 24);
  return (
    <div
      style={{
        minHeight: "100vh",
        background: lobbyBg
          ? `url(${lobbyBg}) center/cover no-repeat`
          : "linear-gradient(135deg,#1a0505,#2d0808)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui,sans-serif",
        padding: "16px 0",
      }}
    >
      <div
        style={{
          width: W,
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          borderRadius: 28,
          padding: 12,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.65),inset 0 2px 0 rgba(255,130,110,0.5),inset 0 -3px 0 rgba(0,0,0,0.35)",
          border: "3px solid #8B0000",
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              flexShrink: 0,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ display: "flex", gap: 2.5 }}>
                {[0, 1, 2, 3].map((j) => (
                  <div
                    key={j}
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.4)",
                      boxShadow: "0 1px 0 rgba(255,255,255,0.12)",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* 스크린 */}
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
          <div
            style={{
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: "rgba(74,222,128,0.65)",
                  fontSize: 9,
                  fontFamily: "monospace",
                  letterSpacing: 1,
                  marginBottom: 2,
                }}
              >
                MODE SELECT
              </div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>
                {title}
              </div>
            </div>
            <div
              style={{
                color: "rgba(74,222,128,0.4)",
                fontSize: 9,
                fontFamily: "monospace",
              }}
            >
              POKÉDEX
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
        @keyframes scanLine    { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes rainbowSpin { to{transform:rotate(360deg)} }
        @keyframes championAura{ 0%,100%{filter:drop-shadow(0 0 4px #6366F1)} 50%{filter:drop-shadow(0 0 10px #8B5CF6)} }
        @keyframes masterAura  { 0%,100%{filter:drop-shadow(0 0 4px #e040fb)} 50%{filter:drop-shadow(0 0 10px #ff80ab)} }
        @keyframes rainbowAura { 0%,100%{filter:drop-shadow(0 0 4px #ff0080)} 50%{filter:drop-shadow(0 0 10px #ff4500)} }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label
        style={{
          display: "block",
          fontWeight: 700,
          fontSize: 11,
          color: "#374151",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputBase = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1.5px solid #E5E7EB",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
  transition: "border 0.2s",
};

function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div
      style={{
        background: "#FEF2F2",
        color: "#DC2626",
        borderRadius: 10,
        padding: "9px 12px",
        marginBottom: 10,
        fontSize: 12,
        fontWeight: 600,
        border: "1.5px solid #FECACA",
      }}
    >
      ⚠️ {msg}
    </div>
  );
}

function PrimaryBtn({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "13px 0",
        borderRadius: 28,
        border: disabled ? "none" : "2px solid #15803d",
        background: disabled
          ? "#D1D5DB"
          : "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)",
        color: disabled ? "#9CA3AF" : "#fff",
        fontWeight: 900,
        fontSize: 15,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled
          ? "none"
          : "0 4px 0 #166534,0 8px 24px rgba(22,163,74,0.3)",
        marginBottom: 8,
      }}
    >
      {children}
    </button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "10px 0",
        borderRadius: 28,
        border: "1.5px solid #E5E7EB",
        background: "#fff",
        fontWeight: 700,
        fontSize: 13,
        cursor: "pointer",
        color: "#6B7280",
        boxShadow: "0 3px 0 #e2e8f0",
      }}
    >
      ← 뒤로
    </button>
  );
}

// ─────────────────────────────────────────
// RoomCreateScreen
// ─────────────────────────────────────────
export function RoomCreateScreen({
  myName,
  setMyName,
  pCount,
  setPCount,
  isPublicRoom,
  setIsPublicRoom,
  roomTitle,
  setRoomTitle,
  betAmount,
  setBetAmount,
  roomErr,
  lobbyBg,
  winW,
  onCreate,
  onBack,
  useFrontierRule = false,
  setUseFrontierRule,
}) {
  return (
    <PokedexShell winW={winW} lobbyBg={lobbyBg} title="🏠 방 만들기">
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <Field
          label={
            <>
              방 제목{" "}
              <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 400 }}>
                (선택)
              </span>
            </>
          }
        >
          <input
            value={roomTitle}
            onChange={(e) => setRoomTitle(e.target.value.slice(0, 24))}
            placeholder={`${myName || "나"}의 방`}
            maxLength={24}
            style={inputBase}
            onFocus={(e) => (e.target.style.border = "1.5px solid #22c55e")}
            onBlur={(e) => (e.target.style.border = "1.5px solid #E5E7EB")}
          />
          <div
            style={{
              fontSize: 10,
              color: "#9CA3AF",
              textAlign: "right",
              marginTop: 3,
            }}
          >
            {roomTitle.length}/24
          </div>
        </Field>

        <Field label="플레이어 수">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { val: 2, label: "2인" },
              { val: 3, label: "3인" },
              { val: 4, label: "4인" },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setPCount(val)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 16,
                  border:
                    pCount === val
                      ? "2px solid #16a34a"
                      : "1.5px solid #E5E7EB",
                  background: pCount === val ? "#F0FDF4" : "#fff",
                  color: pCount === val ? "#16a34a" : "#374151",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  boxShadow:
                    pCount === val ? "0 3px 0 #bbf7d0" : "0 3px 0 #e2e8f0",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="🪙 배팅금">
          <div style={{ display: "flex", gap: 8 }}>
            {BET_OPTIONS.map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setBetAmount(val)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 14,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  border:
                    betAmount === val
                      ? "2px solid #F59E0B"
                      : "1.5px solid #E5E7EB",
                  background: betAmount === val ? "#FFFBEB" : "#fff",
                  color: betAmount === val ? "#D97706" : "#374151",
                  boxShadow:
                    betAmount === val ? "0 3px 0 #fde68a" : "0 3px 0 #e2e8f0",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="방 공개 설정">
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { val: false, icon: "🔒", label: "비공개" },
              { val: true, icon: "🌐", label: "공개" },
            ].map(({ val, icon, label }) => (
              <button
                key={label}
                onClick={() => setIsPublicRoom(val)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 14,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  border:
                    isPublicRoom === val
                      ? "2px solid #6366F1"
                      : "1.5px solid #E5E7EB",
                  background: isPublicRoom === val ? "#EEF2FF" : "#fff",
                  color: isPublicRoom === val ? "#4338CA" : "#374151",
                  boxShadow:
                    isPublicRoom === val
                      ? "0 3px 0 #c7d2fe"
                      : "0 3px 0 #e2e8f0",
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </Field>

        {/* ✨ 특수룰 토글 */}
        {setUseFrontierRule && (
          <div style={{ marginBottom: 10 }}>
            <button
              onClick={() => setUseFrontierRule((v) => !v)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 12,
                cursor: "pointer",
                border: `1.5px solid ${
                  useFrontierRule ? "#a78bfa" : "#E5E7EB"
                }`,
                background: useFrontierRule
                  ? "linear-gradient(135deg,rgba(167,139,250,0.1),rgba(99,102,241,0.05))"
                  : "#f9fafb",
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "all 0.15s",
                boxShadow: useFrontierRule
                  ? "0 3px 0 #ddd6fe"
                  : "0 3px 0 #e2e8f0",
              }}
            >
              <span style={{ fontSize: 20 }}>✨</span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: useFrontierRule ? "#7c3aed" : "#374151",
                  }}
                >
                  특수룰
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: useFrontierRule ? "#a78bfa" : "#9ca3af",
                    marginTop: 1,
                  }}
                >
                  {useFrontierRule
                    ? "랜덤 특수룰이 적용돼요"
                    : "일반 게임 방식으로 진행해요"}
                </div>
              </div>
              {/* 토글 스위치 */}
              <div
                style={{
                  width: 42,
                  height: 24,
                  borderRadius: 99,
                  flexShrink: 0,
                  position: "relative",
                  background: useFrontierRule ? "#7c3aed" : "#d1d5db",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    left: useFrontierRule ? 22 : 4,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                    transition: "left 0.2s",
                  }}
                />
              </div>
            </button>
          </div>
        )}

        <ErrBox msg={roomErr} />
        <PrimaryBtn onClick={onCreate}>
          {useFrontierRule ? "✨ 특수룰로 방 만들기" : "⚡ 방 만들기"}
        </PrimaryBtn>
        <BackBtn onClick={onBack} />
      </div>
    </PokedexShell>
  );
}

// ─────────────────────────────────────────
// RoomJoinScreen
// ─────────────────────────────────────────
export function RoomJoinScreen({
  myName,
  setMyName,
  joinInput,
  setJoinInput,
  roomErr,
  lobbyBg,
  winW,
  onJoin,
  onBack,
}) {
  return (
    <PokedexShell winW={winW} lobbyBg={lobbyBg} title="🔑 코드 입력">
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <Field label="트레이너 이름">
          <input
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
            placeholder="트레이너 이름"
            style={inputBase}
            onFocus={(e) => (e.target.style.border = "1.5px solid #22c55e")}
            onBlur={(e) => (e.target.style.border = "1.5px solid #E5E7EB")}
          />
        </Field>
        <Field label="방 코드">
          <input
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
            placeholder="0000"
            maxLength={4}
            style={{
              ...inputBase,
              fontSize: 26,
              fontWeight: 900,
              textAlign: "center",
              letterSpacing: 10,
              padding: "12px",
            }}
            onFocus={(e) => (e.target.style.border = "1.5px solid #22c55e")}
            onBlur={(e) => (e.target.style.border = "1.5px solid #E5E7EB")}
          />
        </Field>
        <div style={{ height: 10 }} />
        <ErrBox msg={roomErr} />
        <PrimaryBtn onClick={onJoin} disabled={joinInput.length < 4}>
          ⚡ 참가하기
        </PrimaryBtn>
        <BackBtn onClick={onBack} />
      </div>
    </PokedexShell>
  );
}

// ─────────────────────────────────────────
// RoomWaitScreen
// ─────────────────────────────────────────
export function RoomWaitScreen({
  roomCode,
  roomData,
  myIdx,
  myName,
  myProfile,
  pCount,
  lobbyBg,
  winW,
  roomErr,
  tImgs,
  onStart,
  onLeave,
}) {
  const isHost = myIdx === 0;
  const humans = roomData?.humans || [
    {
      name: myName || "나",
      emoji: "😊",
      portraitName: myProfile?.trainerId,
      profile: {
        borderStyle: myProfile?.borderStyle,
        title: myProfile?.title,
        badge: myProfile?.badge,
      },
    },
  ];
  const maxH = roomData?.maxHumans || pCount;
  const bet = roomData?.bet ?? 30;
  const emptySlots = Math.max(0, maxH - humans.length);

  return (
    <PokedexShell winW={winW} lobbyBg={lobbyBg} title="🏠 대기실">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            background: "#EEF2FF",
            borderRadius: 14,
            padding: "12px 0",
            textAlign: "center",
            border: "1.5px solid #c7d2fe",
            boxShadow: "0 3px 0 #c7d2fe",
          }}
        >
          <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 3 }}>
            방 코드
            {roomData?.isPublic && (
              <span
                style={{
                  marginLeft: 6,
                  background: "#E0F2FE",
                  color: "#0284C7",
                  borderRadius: 6,
                  padding: "1px 7px",
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                🌐 공개
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: 10,
              color: "#4338CA",
            }}
          >
            {roomCode}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#D97706",
              marginTop: 4,
            }}
          >
            🪙 배팅금 {bet}코인
          </div>
        </div>

        <div style={{ height: 1, background: "#f1f5f9" }} />

        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#6B7280",
              marginBottom: 7,
            }}
          >
            {humans.length}/{maxH} 참가자
            {emptySlots > 0 && (
              <span style={{ marginLeft: 6, fontSize: 10, color: "#9CA3AF" }}>
                (빈 슬롯 {emptySlots}개 → AI 자동 배정)
              </span>
            )}
          </div>
          {humans.map((h, i) => {
            const prof = h.profile || {};
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 12,
                  marginBottom: 5,
                  background: i === 0 ? "#ECFDF5" : "#F9FAFB",
                  border:
                    i === 0 ? "1.5px solid #bbf7d0" : "1.5px solid #F3F4F6",
                  boxShadow: i === 0 ? "0 2px 0 #bbf7d0" : "0 2px 0 #e5e7eb",
                }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <ProfileBorder
                    borderStyle={prof.borderStyle || "none"}
                    size={36}
                  >
                    {h.portraitName ? (
                      <TrainerPortrait
                        name={h.portraitName}
                        size={34}
                        tImgs={tImgs}
                      />
                    ) : (
                      <span style={{ fontSize: 20 }}>{h.emoji}</span>
                    )}
                  </ProfileBorder>
                  {prof.badge && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: -4,
                        right: -4,
                        zIndex: 5,
                      }}
                    >
                      <BadgeIcon badge={prof.badge} size={16} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {prof.title && (
                      <TitleBadge titleKey={prof.title} fontSize={9} />
                    )}
                    {h.name}
                  </div>
                </div>
                {i === 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "#059669",
                      fontWeight: 700,
                      background: "#ECFDF5",
                      borderRadius: 6,
                      padding: "2px 7px",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    방장
                  </span>
                )}
              </div>
            );
          })}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 12,
                marginBottom: 5,
                background: "#F0FDF4",
                border: "1.5px dashed #86efac",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                🤖
              </div>
              <div>
                <div
                  style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}
                >
                  AI 트레이너
                </div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>
                  시작 시 자동 배정
                </div>
              </div>
            </div>
          ))}
        </div>

        <ErrBox msg={roomErr} />

        {isHost ? (
          <PrimaryBtn onClick={onStart}>
            {emptySlots > 0
              ? `⚡ 게임 시작! (AI ${emptySlots}명 참가)`
              : "⚡ 게임 시작!"}
          </PrimaryBtn>
        ) : (
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#6B7280",
              padding: "10px 0",
              fontStyle: "italic",
            }}
          >
            방장이 시작할 때까지 기다려주세요...
          </div>
        )}
        <button
          onClick={onLeave}
          style={{
            width: "100%",
            padding: "10px 0",
            borderRadius: 28,
            border: "1.5px solid #fecaca",
            background: "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            color: "#ef4444",
            boxShadow: "0 3px 0 #fecaca",
          }}
        >
          나가기
        </button>
      </div>
    </PokedexShell>
  );
}
