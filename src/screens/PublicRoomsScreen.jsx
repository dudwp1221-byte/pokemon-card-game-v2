import { useState, useEffect } from "react";
import { db } from "../lib/db";

export default function PublicRoomsScreen({
  myName,
  myProfile,
  myCoins,
  tImgs,
  lobbyBg,
  winW,
  onBack,
  onJoined,
}) {
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState("");
  // ✅ 추가: 버튼 연타 방지
  const [joining, setJoining] = useState(false);
  const W = Math.min(400, winW - 24);

  useEffect(() => {
    const unsub = db.onValue(
      "rooms",
      (data) => {
        if (!data) {
          setRooms([]);
          return;
        }
        const list = Object.values(data).filter(
          (r) =>
            r &&
            r.isPublic &&
            r.status === "waiting" &&
            (r.humans?.length || 0) < (r.maxHumans || 2)
        );
        setRooms(
          list.sort((a, b) => (b.humans?.length || 0) - (a.humans?.length || 0))
        );
      },
      800
    );
    return () => unsub();
  }, []);

  // ✅ 수정: 버튼 연타 방지 + transaction으로 동시 참가 데이터 덮어씌기 방지
  const join = async (code) => {
    if (joining) return;
    setJoining(true);
    setErr("⏳ 접속 중...");
    try {
      const preCheck = await db.get("rooms/" + code);
      if (!preCheck) {
        setErr("방을 찾을 수 없어요.");
        setJoining(false);
        return;
      }
      if ((preCheck.bet || 0) > myCoins) {
        setErr(
          `코인이 부족해요. (필요: ${preCheck.bet}코인, 보유: ${myCoins}코인)`
        );
        setJoining(false);
        return;
      }

      let joinErr = "";
      let joinedRd = null;

      await db.transaction("rooms/" + code, (current) => {
        if (!current) {
          joinErr = "방을 찾을 수 없어요.";
          return undefined;
        }
        if (current.status !== "waiting") {
          joinErr = "이미 시작된 방이에요.";
          return undefined;
        }
        const humans = current.humans || [];
        if (humans.length >= current.maxHumans) {
          joinErr = "방이 꽉 찼어요.";
          return undefined;
        }
        if (humans.some((h) => h.name === myName)) {
          joinErr = "이미 이 방에 참가 중인 닉네임이에요.";
          return undefined;
        }
        const emoji = ["🙂", "😎", "🤩", "😏", "🥳"][humans.length] || "😊";
        const me = {
          name: myName || "나",
          emoji,
          portraitName: myProfile?.trainerId || undefined,
          coins: myCoins,
          profile: {
            title: myProfile?.title || null,
            badge: myProfile?.badge || null,
            borderStyle: myProfile?.borderStyle || "none",
          },
        };
        joinedRd = { ...current, humans: [...humans, me] };
        return joinedRd;
      });

      if (joinErr) {
        setErr(joinErr);
        setJoining(false);
        return;
      }
      if (!joinedRd) {
        setErr("⚠️ 접속 오류");
        setJoining(false);
        return;
      }

      setErr("");
      setJoining(false);
      onJoined(code, joinedRd, joinedRd.humans.length - 1);
    } catch {
      setErr("⚠️ 접속 오류");
      setJoining(false);
    }
  };

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
        {/* ── 상단 바 ── */}
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

        {/* ── 스크린 ── */}
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
                  marginBottom: 2,
                }}
              >
                NETWORK SEARCH
              </div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>
                🌐 공개 매칭
              </div>
            </div>
            <div
              style={{
                background: "rgba(74,222,128,0.15)",
                border: "1px solid rgba(74,222,128,0.3)",
                borderRadius: 8,
                padding: "3px 10px",
              }}
            >
              <span
                style={{
                  color: "#4ade80",
                  fontSize: 10,
                  fontFamily: "monospace",
                  fontWeight: 700,
                }}
              >
                {rooms.length} ROOMS
              </span>
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

        {/* ── 흰 패널 ── */}
        <div
          style={{
            background: "#FEFEFE",
            borderRadius: 20,
            padding: 12,
            boxShadow: "inset 0 2px 0 #fff,inset 0 -2px 0 rgba(180,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {err && (
            <div
              style={{
                background: "#FEF2F2",
                color: "#DC2626",
                borderRadius: 10,
                padding: "9px 12px",
                fontSize: 12,
                fontWeight: 600,
                border: "1.5px solid #FECACA",
              }}
            >
              ⚠️ {err}
            </div>
          )}

          {rooms.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "#94a3b8",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 14,
                  marginBottom: 4,
                  color: "#374151",
                }}
              >
                대기 중인 공개방이 없어요
              </div>
              <div style={{ fontSize: 11 }}>
                방 만들기에서 공개방을 만들어보세요!
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxHeight: 340,
                overflowY: "auto",
              }}
            >
              {rooms.map((room) => {
                const cur = room.humans?.length || 0;
                const max = room.maxHumans || 2;
                const full = cur >= max;
                const cantAfford = (room.bet || 0) > myCoins;
                const disabled = full || cantAfford;
                return (
                  <div
                    key={room.code}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 12px",
                      borderRadius: 14,
                      border: disabled
                        ? "1.5px solid #E5E7EB"
                        : "1.5px solid #BAE6FD",
                      background: disabled ? "#F9FAFB" : "#F0F9FF",
                      boxShadow: disabled
                        ? "0 3px 0 #e2e8f0"
                        : "0 3px 0 #bae6fd",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 13,
                          color: "#0C4A6E",
                          marginBottom: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {room.title || `${room.host}의 방`}
                      </div>
                      {room.title && (
                        <div
                          style={{
                            fontSize: 10,
                            color: "#64748B",
                            marginBottom: 3,
                          }}
                        >
                          방장: {room.host}
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "#0284C7",
                            fontWeight: 700,
                          }}
                        >
                          👥 {cur}/{max}명
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            background: "#E0F2FE",
                            color: "#0284C7",
                            borderRadius: 6,
                            padding: "1px 6px",
                            fontWeight: 700,
                          }}
                        >
                          #{room.code}
                        </span>
                        {room.bet && (
                          <span
                            style={{
                              fontSize: 10,
                              // ✅ 코인 부족하면 빨간색으로 표시
                              background: cantAfford ? "#FEF2F2" : "#FFFBEB",
                              color: cantAfford ? "#DC2626" : "#D97706",
                              borderRadius: 6,
                              padding: "1px 6px",
                              fontWeight: 700,
                            }}
                          >
                            🪙 {room.bet}
                            {cantAfford ? " (부족)" : ""}
                          </span>
                        )}
                      </div>
                      <div
                        style={{ display: "flex", gap: 3, flexWrap: "wrap" }}
                      >
                        {(room.humans || []).map((h, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "#374151",
                              background: "#fff",
                              borderRadius: 6,
                              padding: "2px 7px",
                              border: "1px solid #BAE6FD",
                            }}
                          >
                            {h.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => !disabled && !joining && join(room.code)}
                      disabled={disabled || joining}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "none",
                        background:
                          disabled || joining
                            ? "#D1D5DB"
                            : "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: disabled || joining ? "not-allowed" : "pointer",
                        flexShrink: 0,
                        boxShadow:
                          disabled || joining ? "none" : "0 3px 0 #166534",
                      }}
                    >
                      {joining
                        ? "⏳"
                        : full
                        ? "만석"
                        : cantAfford
                        ? "부족"
                        : "참가"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ height: 1, background: "#f1f5f9" }} />

          <button
            onClick={onBack}
            style={{
              width: "100%",
              padding: "11px 0",
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
        </div>
      </div>
      <style>{`@keyframes scanLine{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
    </div>
  );
}
