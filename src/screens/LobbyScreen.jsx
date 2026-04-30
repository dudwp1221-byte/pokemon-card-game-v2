// src/screens/LobbyScreen.jsx
import { useState } from "react";
import TrainerPortrait from "../components/TrainerPortrait";
import ProfileBorder from "../components/ProfileBorder";
import { TitleBadge, BadgeIcon } from "./modals/ProfileEditor";
import { SE } from "../lib/sounds";
import { ALL_SEALS } from "../lib/sealLogic";
import { SHINY_SEALS } from "../lib/shinySeals";
import { getAttendance } from "../lib/attendance";
import { getSeasonDaysLeft } from "../lib/tournamentLogic";
import {
  getCurrentWeeklyMissions,
  loadBFEventProgress,
  getDaysLeft,
} from "../lib/bfEventLogic";
import {
  getWeeklyCosplaySeal,
  getMsUntilNextReset,
} from "../lib/miniGameLeaderboardLogic";
import PokeModalShell from "../components/PokeModalShell";

const sfx = (fn) => {
  SE.buttonClick();
  fn?.();
};

function SettingsModal({
  onClose,
  mutedBGM,
  mutedSFX,
  onToggleBGM,
  onToggleSFX,
  onShowTutorial,
  onShowRules,
  winW,
}) {
  return (
    <PokeModalShell
      onClose={onClose}
      title="설정"
      titleIcon="⚙️"
      screenColor="rgba(148,163,184,0.8)"
      winW={winW}
      zIndex={1200}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#9ca3af",
            letterSpacing: 1,
          }}
        >
          🔈 사운드
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          {[
            {
              icon: "🎵",
              label: "BGM",
              onClick: onToggleBGM,
              isMuted: mutedBGM,
            },
            {
              icon: "🔊",
              label: "SFX",
              onClick: onToggleSFX,
              isMuted: mutedSFX,
            },
          ].map(({ icon, label, onClick, isMuted }) => (
            <button
              key={label}
              onClick={onClick}
              style={{
                flex: 1,
                padding: "14px 0",
                borderRadius: 12,
                cursor: "pointer",
                border: `1.5px solid ${isMuted ? "#fecaca" : "#e5e7eb"}`,
                background: isMuted ? "#fef2f2" : "#f8fafc",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                boxShadow: isMuted ? "0 3px 0 #fca5a5" : "0 3px 0 #e2e8f0",
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  position: "relative",
                  display: "inline-flex",
                }}
              >
                {icon}
                {isMuted && (
                  <svg
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                    }}
                    viewBox="0 0 20 20"
                  >
                    <line
                      x1="3"
                      y1="3"
                      x2="17"
                      y2="17"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: isMuted ? "#ef4444" : "#374151",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: isMuted ? "#fca5a5" : "#9ca3af",
                }}
              >
                {isMuted ? "OFF" : "ON"}
              </span>
            </button>
          ))}
        </div>
        <div style={{ height: 1, background: "#f1f5f9" }} />
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#9ca3af",
            letterSpacing: 1,
          }}
        >
          📚 게임 정보
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          <button
            onClick={() => {
              onShowTutorial?.();
              onClose();
            }}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 12,
              border: "1.5px solid #e5e7eb",
              background: "#f8fafc",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 3px 0 #e2e8f0",
            }}
          >
            <span style={{ fontSize: 24 }}>🎓</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>
              튜토리얼
            </span>
          </button>
          <button
            onClick={() => {
              onShowRules?.();
              onClose();
            }}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 12,
              border: "1.5px solid #e5e7eb",
              background: "#f8fafc",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 3px 0 #e2e8f0",
            }}
          >
            <span style={{ fontSize: 24 }}>📋</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>
              규칙
            </span>
          </button>
        </div>
      </div>
    </PokeModalShell>
  );
}

function getSeasonNum() {
  const epoch = new Date("2024-01-01T00:00:00+09:00");
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return Math.floor(Math.floor((kst - epoch) / 86400000) / 14) + 1;
}

const ALL_SEALS_MERGED = [...ALL_SEALS, ...SHINY_SEALS];

function MissionPanel({
  missionBadge,
  attendanceBadge,
  bfEventUnclaimedCount,
  mailboxUnread,
  onShowDailyMissions,
  onShowBFEvent,
  onShowAttendance,
  onShowMailbox,
  streak,
}) {
  const BTNS = [
    {
      icon: "📋",
      label: "일일 미션",
      badge: missionBadge,
      badgeN: null,
      fn: onShowDailyMissions,
      urgent: missionBadge,
    },
    {
      icon: "🏟️",
      label: "주간 미션",
      badge: bfEventUnclaimedCount > 0,
      badgeN: bfEventUnclaimedCount || null,
      fn: onShowBFEvent,
      urgent: bfEventUnclaimedCount > 0,
    },
    {
      icon: "🗓️",
      label: "출석부",
      badge: attendanceBadge,
      badgeN: null,
      fn: onShowAttendance,
      urgent: attendanceBadge,
    },
    {
      icon: "📬",
      label: "우편함",
      badge: mailboxUnread > 0,
      badgeN: mailboxUnread || null,
      fn: onShowMailbox,
      urgent: mailboxUnread > 0,
    },
  ];

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {BTNS.map((b) => (
        <button
          key={b.label}
          onClick={() => sfx(b.fn)}
          style={{
            flex: 1,
            padding: "12px 4px",
            borderRadius: 12,
            cursor: "pointer",
            border: b.urgent ? "1.5px solid #6366f1" : "1.5px solid #e5e7eb",
            background: b.urgent ? "#eef2ff" : "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            position: "relative",
            boxShadow: b.urgent ? "0 3px 0 #c7d2fe" : "0 3px 0 #e2e8f0",
            transition: "all 0.15s",
          }}
        >
          <span style={{ fontSize: 20 }}>{b.icon}</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: b.urgent ? "#4338ca" : "#64748b",
            }}
          >
            {b.label}
          </span>
          {b.badge && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 14,
                height: 14,
                background: "#ef4444",
                borderRadius: 99,
                fontSize: 7,
                fontWeight: 900,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 3px",
                border: "1.5px solid #fff",
              }}
            >
              {b.badgeN || "!"}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default function LobbyScreen({
  myName,
  myProfile,
  myCoins,
  tImgs,
  lobbyBg,
  winW,
  onShowProfile,
  onShowTutorial,
  onShowRules,
  onShowLeague,
  onShowShop,
  onShowInventory,
  onShowLeaderboard,
  onToggleBGM,
  onToggleSFX,
  mutedBGM,
  mutedSFX,
  onShowBread,
  onShowSealDex,
  showBreadHint = false,
  missionBadge = false,
  onShowDailyMissions,
  onShowAttendance,
  attendanceBadge = false,
  onFreeCharge,
  onShowTournament,
  tournamentBadge = false,
  onShowEvent,
  eventDaysLeft = 0,
  eventSeal = null,
  onShowMulti,
  onShowBattleFrontier,
  onShowAchievements,
  achUnclaimedCount = 0,
  onShowBFEvent,
  bfEventUnclaimedCount = 0,
  onShowPocketFestival,
  onShowMailbox,
  mailboxUnread = 0,
  onShowMyHome,
  onShowFeedback, // ★ NEW
}) {
  const streak = getAttendance().streak || 0;
  const seasonNum = getSeasonNum();
  const daysLeft = getSeasonDaysLeft();
  const weeklySeal = getWeeklyCosplaySeal();
  const festivalDaysLeft = Math.floor(getMsUntilNextReset() / 86400000);
  const W = Math.min(360, winW - 24);
  const seasonUrgent = daysLeft <= 3;
  const [showSettings, setShowSettings] = useState(false);

  const rawIds = myProfile?.featuredSealIds ?? [];
  const featuredSeals = rawIds
    .map((id) => ALL_SEALS_MERGED.find((s) => String(s.id) === String(id)))
    .filter(Boolean);
  const missionTotalBadge =
    (missionBadge ? 1 : 0) +
    (bfEventUnclaimedCount > 0 ? 1 : 0) +
    (attendanceBadge ? 1 : 0) +
    (mailboxUnread > 0 ? 1 : 0);

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
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          mutedBGM={mutedBGM}
          mutedSFX={mutedSFX}
          onToggleBGM={onToggleBGM}
          onToggleSFX={onToggleSFX}
          onShowTutorial={onShowTutorial}
          onShowRules={onShowRules}
          winW={winW}
        />
      )}
      <div
        style={{
          width: W,
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          borderRadius: 28,
          padding: 12,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.65), inset 0 2px 0 rgba(255,130,110,0.5), inset 0 -3px 0 rgba(0,0,0,0.35)",
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
                "0 0 0 4px rgba(255,255,255,0.3), 0 0 20px rgba(59,130,246,0.6), 0 4px 8px rgba(0,0,0,0.5)",
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

        {/* 트레이너 카드 */}
        <div
          style={{
            background: "#0a0f1a",
            borderRadius: 14,
            border: "5px solid #fff",
            boxShadow: "0 0 0 2px #bbb, inset 0 2px 12px rgba(0,0,0,0.9)",
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg,transparent,rgba(74,222,128,0.2),transparent)",
            }}
          />
          <div
            onClick={() => sfx(onShowProfile)}
            style={{
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <ProfileBorder
                borderStyle={myProfile.borderStyle || "none"}
                size={56}
              >
                {myProfile.trainerId ? (
                  <TrainerPortrait
                    name={myProfile.trainerId}
                    size={54}
                    tImgs={tImgs}
                  />
                ) : (
                  <span style={{ fontSize: 28 }}>👤</span>
                )}
              </ProfileBorder>
              {myProfile.badge && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -5,
                    right: -5,
                    zIndex: 10,
                  }}
                >
                  <BadgeIcon badge={myProfile.badge} size={18} />
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    color: "rgba(74,222,128,0.65)",
                    fontSize: 8,
                    fontFamily: "monospace",
                    letterSpacing: 1,
                  }}
                >
                  TRAINER DATA
                </span>
                <span
                  style={{
                    color: "rgba(74,222,128,0.4)",
                    fontSize: 8,
                    fontFamily: "monospace",
                  }}
                >
                  ▶ EDIT
                </span>
              </div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 14,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {myProfile.title && (
                  <TitleBadge titleKey={myProfile.title} fontSize={9} />
                )}
                {myName || "TRAINER"}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 3,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: "#fbbf24",
                    fontFamily: "monospace",
                    fontWeight: 900,
                  }}
                >
                  {myCoins.toLocaleString()} 🪙
                </span>
              </div>
            </div>
            {featuredSeals.length > 0 && (
              <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                {featuredSeals.slice(0, 3).map((s) => (
                  <img
                    key={s.id}
                    src={s.artwork}
                    alt={s.name}
                    style={{ width: 22, height: 22, objectFit: "contain" }}
                  />
                ))}
              </div>
            )}
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

        {/* 메인 패널 */}
        <div
          style={{
            background: "#ECEEF1",
            borderRadius: 20,
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            boxShadow:
              "inset 0 2px 0 rgba(255,255,255,0.9), inset 0 -2px 0 rgba(180,0,0,0.1)",
          }}
        >
          {myCoins < 50 && (
            <button
              onClick={() => onFreeCharge && onFreeCharge()}
              style={{
                padding: "10px 0",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg,#F59E0B,#D97706)",
                color: "#fff",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 800,
                boxShadow: "0 3px 0 #92400E",
              }}
            >
              🎁 무료 충전 +100코인
            </button>
          )}

          {/* ① 게임 시작 */}
          <button
            onClick={() => sfx(onShowLeague)}
            style={{
              width: "100%",
              height: 60,
              borderRadius: 99,
              border: "1.5px solid rgba(255,255,255,0.35)",
              background: "linear-gradient(160deg,#22c55e,#16a34a)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow:
                "0 0 0 2px #14532d, 0 4px 0 #0f3d20, 0 8px 18px rgba(22,163,74,0.35)",
              position: "relative",
              overflow: "hidden",
              marginBottom: 4,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.12) 50%,transparent 65%)",
                pointerEvents: "none",
              }}
            />
            <span style={{ fontSize: 21 }}>⚡</span>
            <span
              style={{
                fontWeight: 900,
                fontSize: 20,
                letterSpacing: 0.5,
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              게임 시작
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
                background: "rgba(0,0,0,0.18)",
                borderRadius: 99,
                padding: "3px 10px",
              }}
            >
              싱글 플레이
            </span>
          </button>

          {/* ② 멀티 + 페스티벌 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <button
              onClick={() => sfx(onShowMulti)}
              style={{
                height: 68,
                borderRadius: 14,
                border: "1.5px solid rgba(255,255,255,0.2)",
                background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingLeft: 8,
                paddingRight: 6,
                boxShadow: "0 4px 0 #1e3a8a",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.08) 55%,transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 13,
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 26 }}>👥</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 13, color: "#fff" }}>
                  멀티플레이
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.75)",
                    marginTop: 2,
                  }}
                >
                  방 만들기 · 공개방
                </div>
              </div>
            </button>
            <button
              onClick={() => sfx(onShowTournament)}
              style={{
                height: 68,
                borderRadius: 14,
                border: "1.5px solid rgba(255,255,255,0.2)",
                background: "linear-gradient(135deg,#4c1d95,#7c3aed)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingLeft: 8,
                paddingRight: 6,
                boxShadow: "0 4px 0 #2e1065",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.07) 55%,transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 13,
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/6.png"
                  alt=""
                  style={{
                    width: 42,
                    height: 42,
                    objectFit: "contain",
                    filter: "drop-shadow(0 0 5px rgba(167,139,250,0.8))",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentNode.innerHTML =
                      "<span style='font-size:22px'>✨</span>";
                  }}
                />
                {tournamentBadge && (
                  <div
                    style={{
                      position: "absolute",
                      top: -3,
                      right: -3,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#ef4444",
                      border: "1.5px solid #4c1d95",
                      boxShadow: "0 0 4px #ef4444",
                    }}
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ fontWeight: 900, fontSize: 12, color: "#e9d5ff" }}
                >
                  이로치 토너먼트
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(196,181,253,0.8)",
                    marginTop: 2,
                  }}
                >
                  {tournamentBadge ? "🔴 진행 중" : "이로치 씰 보상"}
                </div>
              </div>
            </button>
          </div>

          {/* ③ 이로치 + 지우의 여행 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <button
              onClick={() => sfx(onShowPocketFestival)}
              style={{
                height: 68,
                borderRadius: 14,
                border: "1.5px solid rgba(255,255,255,0.2)",
                background: "linear-gradient(135deg,#d97706,#f59e0b)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingLeft: 8,
                paddingRight: 6,
                boxShadow: "0 4px 0 #92400e",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.1) 55%,transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 13,
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${weeklySeal.pokeId}.png`}
                  alt=""
                  style={{ width: 42, height: 42, objectFit: "contain" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexWrap: "nowrap",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: 12,
                      color: "#fff",
                      whiteSpace: "nowrap",
                    }}
                  >
                    포켓페스티벌
                  </span>
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 800,
                      background: "rgba(0,0,0,0.25)",
                      color: "#fff",
                      borderRadius: 99,
                      padding: "2px 5px",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {festivalDaysLeft > 0
                      ? `D-${festivalDaysLeft}`
                      : "오늘 마감"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.85)",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                  }}
                >
                  TOP10 씰 보상
                </div>
              </div>
            </button>
            <button
              onClick={() => sfx(onShowEvent)}
              style={{
                height: 68,
                borderRadius: 14,
                border: "1.5px solid rgba(255,255,255,0.2)",
                background: "linear-gradient(135deg,#0c4a6e,#0284c7)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingLeft: 8,
                paddingRight: 6,
                boxShadow: "0 4px 0 #082f49",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.07) 55%,transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 13,
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {eventSeal ? (
                  <img
                    src={eventSeal.artwork}
                    alt=""
                    style={{ width: 36, height: 36, objectFit: "contain" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentNode.innerHTML =
                        "<span style='font-size:22px'>🗺️</span>";
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 22 }}>🗺️</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    flexWrap: "nowrap",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: 12,
                      color: "#7dd3fc",
                      whiteSpace: "nowrap",
                    }}
                  >
                    지우의 여행
                  </span>
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 800,
                      background: "rgba(0,0,0,0.3)",
                      color: "#fff",
                      borderRadius: 99,
                      padding: "2px 6px",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {eventDaysLeft > 0 ? `D-${eventDaysLeft}` : "마감"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.65)",
                    marginTop: 2,
                  }}
                >
                  이벤트 씰 수집
                </div>
              </div>
            </button>
          </div>

          {/* ④ 미션 패널 */}
          <MissionPanel
            missionBadge={missionBadge}
            attendanceBadge={attendanceBadge}
            bfEventUnclaimedCount={bfEventUnclaimedCount}
            mailboxUnread={mailboxUnread}
            onShowDailyMissions={onShowDailyMissions}
            onShowBFEvent={onShowBFEvent}
            onShowAttendance={onShowAttendance}
            onShowMailbox={onShowMailbox}
            streak={streak}
          />

          {/* ⑤ 빵 + 씰도감 + 마이홈 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 6,
            }}
          >
            {[
              {
                icon: "🍞",
                label: "포켓몬 빵",
                fn: onShowBread,
                hint: showBreadHint,
                color: "#f97316",
              },
              {
                icon: "📖",
                label: "씰 도감",
                fn: onShowSealDex,
                hint: false,
                color: "#6366f1",
              },
              {
                icon: "🏠",
                label: "마이홈",
                fn: onShowMyHome,
                hint: false,
                color: "#14b8a6",
                dev: true,
              },
            ].map((b) => (
              <button
                key={b.label}
                onClick={() => sfx(b.fn)}
                style={{
                  padding: "12px 6px",
                  borderRadius: 12,
                  border: `1.5px solid ${b.hint ? "#fbbf24" : "#e2e8f0"}`,
                  background: b.hint ? "#fffbeb" : "#fff",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: b.hint ? "0 3px 0 #fde68a" : "0 3px 0 #d1d5db",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: `${b.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{b.icon}</span>
                </div>
                <span
                  style={{ fontWeight: 800, fontSize: 10, color: "#374151" }}
                >
                  {b.label}
                </span>
                {b.hint && (
                  <div
                    style={{
                      position: "absolute",
                      top: -3,
                      right: -3,
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: "#ef4444",
                      border: "1.5px solid #fff",
                    }}
                  />
                )}
                {b.dev && (
                  <div
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "#9ca3af",
                      color: "#fff",
                      fontSize: 7,
                      fontWeight: 800,
                      borderRadius: 99,
                      padding: "1px 5px",
                      letterSpacing: 0.3,
                      pointerEvents: "none",
                    }}
                  >
                    개발중
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* ⑥ 유틸 아이콘바 — 💬 의견 추가됨 */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {[
              { icon: "🏆", label: "랭킹", onClick: onShowLeaderboard },
              { icon: "🎒", label: "가방", onClick: onShowInventory },
              { icon: "🛒", label: "상점", onClick: onShowShop },
              {
                icon: "🏅",
                label: "업적",
                onClick: onShowAchievements,
                badge: achUnclaimedCount,
              },
              {
                icon: "💬",
                label: "의견",
                onClick: onShowFeedback,
              },
              {
                icon: "⚙️",
                label: "설정",
                onClick: () => setShowSettings(true),
              },
            ].map(({ icon, label, onClick, badge }) => (
              <button
                key={label}
                onClick={() => sfx(onClick)}
                style={{
                  flex: 1,
                  padding: "10px 2px",
                  borderRadius: 12,
                  cursor: "pointer",
                  border: badge ? "1.5px solid #fcd34d" : "1.5px solid #e2e8f0",
                  background: badge ? "#fffbeb" : "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  position: "relative",
                  boxShadow: badge ? "0 3px 0 #fde68a" : "0 3px 0 #d1d5db",
                }}
              >
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span
                  style={{
                    fontSize: 9,
                    color: badge ? "#92400e" : "#64748b",
                    fontWeight: 700,
                  }}
                >
                  {label}
                </span>
                {badge > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -3,
                      right: -3,
                      minWidth: 14,
                      height: 14,
                      borderRadius: 99,
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: 7,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 3px",
                      border: "1.5px solid #fff",
                    }}
                  >
                    {badge}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
