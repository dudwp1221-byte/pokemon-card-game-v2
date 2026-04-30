// src/components/AdminPanel.tsx
// ══════════════════════════════════════════════════════════
//  🛠️ 어드민 패널
//  - admin 닉네임으로 로그인 후 Ctrl+Shift+S 로 토글
//  - 치트 버튼 + 데이터 정리 버튼 모음
// ══════════════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import { ALL_SEALS, saveSealDex } from "../lib/sealLogic";
import { SHINY_SEALS, loadShinyDex, saveShinyDex } from "../lib/shinySeals";
import { loadCapDex, saveCapDex, ALL_EVENT_SEALS } from "../lib/eventLogic";
import { saveUserData, saveLeaderboard, getPlayerUid } from "../lib/db";
import { sendLetter, LETTER_TYPE } from "../lib/mailboxLogic";
import {
  cleanupLegacyUidsForWeek,
  auditWeeklyRewards,
  rebuildAndSendRewardsForWeek,
} from "../lib/miniGameLeaderboardLogic";
import { getUnreadFeedbackCount } from "../lib/feedbackLogic";
import FeedbackAdminModal from "../screens/modals/FeedbackAdminModal";

const adminBtnStyle = (color: string, danger = false) => ({
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: `1px solid ${color}44`,
  background: danger ? `${color}18` : `${color}18`,
  color,
  fontWeight: 800,
  fontSize: 13,
  cursor: "pointer",
  textAlign: "left" as const,
  display: "flex",
  alignItems: "center",
  gap: 8,
});

const sectionLabelStyle = (color = "#6b7280") => ({
  fontSize: 10,
  fontWeight: 800 as const,
  color,
  letterSpacing: 2,
  marginTop: 8,
});

interface AdminPanelProps {
  myName: string;
  myCoins: number;
  myProfile: any;
  setMyCoins: (v: number | ((p: number) => number)) => void;
  setMyWins: (v: any) => void;
  setMyStats: (v: any) => void;
  setMyProfile: (v: any) => void;
  myWinsRef: React.MutableRefObject<any>;
  myStatsRef: React.MutableRefObject<any>;
  setPendingShinySeals: (v: any[]) => void;
  setRevealSeals: (v: any[]) => void;
  setRevealIsClaim: (v: boolean) => void;
  setShowShinyReveal: (v: boolean) => void;
  setMailboxUnread: (v: number | ((p: number) => number)) => void;
  setAndSaveCoins: (n: number) => void;
  showToast: (msg: string, color: string) => void;
  onClose: () => void;
}

export default function AdminPanel({
  myName,
  myCoins,
  myProfile,
  setMyCoins,
  setMyWins,
  setMyStats,
  setMyProfile,
  myWinsRef,
  myStatsRef,
  setPendingShinySeals,
  setRevealSeals,
  setRevealIsClaim,
  setShowShinyReveal,
  setMailboxUnread,
  setAndSaveCoins,
  showToast,
  onClose,
}: AdminPanelProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [unreadFeedback, setUnreadFeedback] = useState(0);

  // ★ NEW: 정산 점검 결과
  const [audit, setAudit] = useState<any>(null);
  const [auditing, setAuditing] = useState(false);

  useEffect(() => {
    getUnreadFeedbackCount()
      .then(setUnreadFeedback)
      .catch(() => {});
  }, [showFeedback]); // 모달 닫을 때 갱신

  // ★ NEW: 어드민 패널 열 때 정산 점검 자동 실행
  useEffect(() => {
    setAuditing(true);
    auditWeeklyRewards()
      .then((result) => {
        setAudit(result);
        if (result.severity === "critical") {
          showToast(
            `🚨 정산 누락 의심! ${result.weekKey}: ${result.missingCount}명`,
            "#dc2626"
          );
        } else if (result.severity === "warning") {
          showToast(
            `⚠️ 정산 점검: ${result.weekKey} 누락 ${result.missingCount}명`,
            "#f59e0b"
          );
        }
      })
      .catch((e) => console.error("audit failed:", e))
      .finally(() => setAuditing(false));
  }, []); // 마운트 시 1회

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "system-ui,sans-serif",
      }}
    >
      <div
        style={{
          background: "#0d0d0d",
          border: "2px solid #22c55e",
          borderRadius: 20,
          width: "100%",
          maxWidth: 360,
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 0 40px rgba(34,197,94,0.3)",
        }}
      >
        {/* ── 헤더 ───────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #1f2937",
            position: "sticky",
            top: 0,
            background: "#0d0d0d",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🛠️</span>
            <span
              style={{
                fontWeight: 900,
                color: "#22c55e",
                fontSize: 15,
                letterSpacing: 1,
              }}
            >
              ADMIN PANEL
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#1f2937",
              border: "none",
              borderRadius: 8,
              color: "#9ca3af",
              fontSize: 13,
              padding: "5px 12px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ✕ 닫기
          </button>
        </div>

        {/* ── 버튼들 ─────────────────────────── */}
        <div
          style={{
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* ─ 🔔 정산 점검 (★ NEW) ─ */}
          {audit && (
            <div
              style={{
                background:
                  audit.severity === "critical"
                    ? "#7f1d1d"
                    : audit.severity === "warning"
                    ? "#78350f"
                    : "#0a3a1a",
                border: `1px solid ${
                  audit.severity === "critical"
                    ? "#ef4444"
                    : audit.severity === "warning"
                    ? "#f59e0b"
                    : "#22c55e"
                }`,
                borderRadius: 10,
                padding: "9px 12px",
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color:
                    audit.severity === "critical"
                      ? "#fecaca"
                      : audit.severity === "warning"
                      ? "#fde68a"
                      : "#bbf7d0",
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {audit.severity === "critical"
                  ? "🚨 정산 누락 의심"
                  : audit.severity === "warning"
                  ? "⚠️ 정산 점검 경고"
                  : "✅ 정산 정상"}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.6,
                }}
              >
                {audit.weekKey} · 참가 {audit.participants}명 / 발송{" "}
                {audit.sentCount}명
                {audit.missingCount > 0 && ` · 누락 ${audit.missingCount}명`}
              </div>
              {audit.severity !== "ok" && audit.missingCount > 0 && (
                <div style={{ display: "flex", gap: 5, marginTop: 7 }}>
                  <button
                    onClick={async () => {
                      showToast("🔍 미리보기 실행 중...", "#0ea5e9");
                      try {
                        const result = await rebuildAndSendRewardsForWeek({
                          weekKey: audit.weekKey,
                          dryRun: true,
                        });
                        console.log(
                          `🔍 [DRY-RUN] ${audit.weekKey} 발송 예정:`,
                          result
                        );
                        console.log("발송 예정 목록:", result.preview);
                        showToast(
                          `🔍 ${result.preview.length}명에게 발송 예정 (콘솔 확인)`,
                          "#0ea5e9"
                        );
                      } catch (e: any) {
                        showToast(
                          `❌ 오류: ${e?.message ?? String(e)}`,
                          "#dc2626"
                        );
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(0,0,0,0.3)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🔍 미리보기
                  </button>
                  <button
                    onClick={async () => {
                      if (
                        !window.confirm(
                          `${audit.weekKey} 누락 ${audit.missingCount}명에게 보상 우편을 발송할까요?\n\n` +
                            `• 이미 받은 사람은 자동 skip\n` +
                            `• 점수 데이터 기준으로 랭킹 재계산 후 발송\n\n` +
                            `먼저 미리보기로 확인하셨나요?`
                        )
                      )
                        return;
                      showToast("📨 보상 일괄 발송 중...", "#f97316");
                      try {
                        const result = await rebuildAndSendRewardsForWeek({
                          weekKey: audit.weekKey,
                        });
                        console.log("🎉 발송 완료:", result);
                        showToast(
                          `✅ ${result.sentLetters}명 발송 / ${result.skippedAlreadySent}명 skip`,
                          "#14532d"
                        );
                        // 점검 다시 실행
                        const fresh = await auditWeeklyRewards({
                          weekKey: audit.weekKey,
                        });
                        setAudit(fresh);
                      } catch (e: any) {
                        showToast(
                          `❌ 오류: ${e?.message ?? String(e)}`,
                          "#dc2626"
                        );
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    📨 발송
                  </button>
                </div>
              )}
            </div>
          )}
          {auditing && !audit && (
            <div
              style={{
                fontSize: 10,
                color: "#9ca3af",
                textAlign: "center",
                padding: "6px 0",
              }}
            >
              🔍 정산 점검 중...
            </div>
          )}

          {/* ─ 💰 코인 ─ */}
          <div style={{ ...sectionLabelStyle(), marginTop: 4 }}>💰 코인</div>
          <button
            onClick={() => {
              setAndSaveCoins(myCoins + 10000);
              showToast("✅ +10,000 코인", "#14532d");
            }}
            style={adminBtnStyle("#fbbf24")}
          >
            🪙 코인 +10,000
          </button>
          <button
            onClick={() => {
              setAndSaveCoins(myCoins + 100000);
              showToast("✅ +100,000 코인", "#14532d");
            }}
            style={adminBtnStyle("#f59e0b")}
          >
            🪙 코인 +100,000
          </button>

          {/* ─ 🎴 씰 ─ */}
          <div style={sectionLabelStyle()}>🎴 씰</div>
          <button
            onClick={() => {
              const d = JSON.parse(
                localStorage.getItem("pokeset_sealdex") || "{}"
              );
              ALL_SEALS.forEach((s: any) => {
                const k = String(s.id);
                if (!(d[k]?.count > 0)) d[k] = { count: 1, shards: 0 };
              });
              saveSealDex(d);
              window.dispatchEvent(new Event("pokeset_dex_updated"));
              const nick = localStorage.getItem("pks_nickname");
              if (nick) saveUserData(nick, { sealDex: d }).catch(() => {});
              showToast(`✅ 띠부씰 ${ALL_SEALS.length}종 해금`, "#14532d");
            }}
            style={adminBtnStyle("#4ade80")}
          >
            🎴 띠부씰 전체 해금
          </button>
          <button
            onClick={() => {
              const sd = loadShinyDex();
              SHINY_SEALS.forEach((s: any) => {
                if (!(sd[s.id]?.count > 0))
                  sd[s.id] = { count: 1, acquiredAt: Date.now() };
              });
              saveShinyDex(sd);
              const nick = localStorage.getItem("pks_nickname");
              if (nick) saveUserData(nick, { shinyDex: sd }).catch(() => {});
              showToast("✅ 이로치씰 전체 해금", "#4338CA");
            }}
            style={adminBtnStyle("#a78bfa")}
          >
            ✨ 이로치씰 전체 해금
          </button>
          <button
            onClick={() => {
              const cd = loadCapDex();
              ALL_EVENT_SEALS.forEach((s: any) => {
                if (!(cd[s.id]?.count > 0))
                  cd[s.id] = { count: 1, acquiredAt: Date.now() };
              });
              saveCapDex(cd);
              window.dispatchEvent(new Event("pokeset_cap_dex_updated"));
              showToast(
                `✅ 이벤트씰 ${ALL_EVENT_SEALS.length}종 해금`,
                "#14532d"
              );
            }}
            style={adminBtnStyle("#38bdf8")}
          >
            🎩 이벤트씰 전체 해금
          </button>

          {/* ─ 👤 프로필 ─ */}
          <div style={sectionLabelStyle()}>👤 프로필</div>
          <button
            onClick={() => {
              const mw = {
                solo: 999,
                multi: 999,
                total: 999,
                kantoSolo: 999,
                johtoSolo: 999,
                hoennSolo: 999,
              };
              const ms = {
                doubleWin: 999,
                streak: 999,
                maxStreak: 999,
                perfectWin: 999,
                multiKill: 999,
                broke: 999,
              };
              setMyWins(mw);
              setMyStats(ms);
              myWinsRef.current = mw;
              myStatsRef.current = ms;
              setMyProfile((p: any) => ({ ...p, wins: mw, stats: ms }));
              const nick = localStorage.getItem("pks_nickname");
              if (nick) saveUserData(nick, { wins: mw, stats: ms });
              showToast("✅ 프로필 전체 해금", "#14532d");
            }}
            style={adminBtnStyle("#f472b6")}
          >
            🏆 프로필·칭호 전체 해금
          </button>

          {/* ─ 💬 피드백 (★ NEW) ─ */}
          <div style={sectionLabelStyle("#3b82f6")}>💬 피드백</div>
          <button
            onClick={() => setShowFeedback(true)}
            style={adminBtnStyle("#3b82f6")}
          >
            📋 유저 피드백 보기
            {unreadFeedback > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 900,
                  borderRadius: 99,
                  padding: "1px 7px",
                }}
              >
                {unreadFeedback}
              </span>
            )}
          </button>

          {/* ─ 🧪 테스트 ─ */}
          <div style={sectionLabelStyle()}>🧪 테스트</div>
          <button
            onClick={() => {
              const s =
                SHINY_SEALS[Math.floor(Math.random() * SHINY_SEALS.length)];
              setRevealSeals([s]);
              setRevealIsClaim(false);
              setShowShinyReveal(true);
              onClose();
              showToast("✅ 이로치 등장씬 테스트", "#4338CA");
            }}
            style={adminBtnStyle("#818cf8")}
          >
            ✨ 이로치 등장씬 테스트
          </button>
          <button
            onClick={() => {
              const userId = getPlayerUid();
              const nickname =
                myProfile?.nickname ??
                myProfile?.name ??
                localStorage.getItem("pks_nickname") ??
                myName;
              const targetId =
                userId || encodeURIComponent(nickname).replace(/%/g, "_");
              showToast(`📬 발송 시도 중... (${targetId})`, "#6366f1");
              sendLetter(targetId, {
                type: LETTER_TYPE.SYSTEM,
                title: "트레이너님께 드리는 감사 인사 💌",
                body: `${myName} 트레이너님!

아직 부족한 프로토타입인데도
꾸준히 접속해서 플레이해 주셔서
정말 감사합니다. 🙏

버그도 있고 불편한 점도 많았을 텐데
그럼에도 함께해 주신 덕분에
큰 힘이 됐습니다.

재밌게 즐겨주셔서 감사합니다! ⚡`,
                sender: "PokéSet",
                rewards: { coins: 10000 },
              })
                .then((id: any) => {
                  if (id) {
                    setMailboxUnread((n: number) => n + 1);
                    showToast("✅ 감사 편지 발송 완료", "#14532d");
                  } else showToast("❌ 발송 실패 (id null)", "#dc2626");
                })
                .catch((err: any) =>
                  showToast(`❌ 오류: ${err?.message ?? err}`, "#dc2626")
                );
            }}
            style={adminBtnStyle("#60a5fa")}
          >
            💌 감사 편지 발송 테스트
          </button>

          {/* ─ 🔧 데이터 정리 ─ */}
          <div style={sectionLabelStyle()}>🔧 데이터 정리</div>

          {/* ─ 이번 주 legacy UID 정리 (★ NEW) ─ */}
          <button
            onClick={async () => {
              showToast("🔍 미리보기 실행 중... (콘솔 확인)", "#0ea5e9");
              try {
                const result = await cleanupLegacyUidsForWeek({
                  weekKey: undefined,
                  dryRun: true,
                });
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                console.log("🔍 [DRY-RUN] 이번 주 legacy UID 정리:");
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                console.log("주차:", result.weekKey);
                console.log("처리한 게임 수:", result.gamesProcessed);
                console.log("중복 그룹:", result.duplicateGroupsFound);
                console.log("제거 예정 legacy UID:", result.legacyUidsRemoved);
                console.log("종합 랭킹 keeper:", result.keepers);
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

                if (result.duplicateGroupsFound === 0) {
                  showToast("✅ 중복 없음!", "#14532d");
                } else {
                  showToast(
                    `🔍 중복 ${result.duplicateGroupsFound}그룹 / UID ${result.legacyUidsRemoved}개 정리 예정`,
                    "#0ea5e9"
                  );
                }
              } catch (e: any) {
                console.error(e);
                showToast(`❌ 오류: ${e?.message ?? String(e)}`, "#dc2626");
              }
            }}
            style={adminBtnStyle("#0ea5e9")}
          >
            🔍 이번 주 legacy UID 미리보기
          </button>

          <button
            onClick={async () => {
              if (
                !window.confirm(
                  "이번 주 legacy UID 정리를 실행할까요?\n\n" +
                    "• 같은 닉네임으로 여러 UID 데이터가 있으면\n" +
                    "  표준 형식(user_닉네임)을 keeper 로 정리\n" +
                    "• 점수는 항상 '최고점' 으로 통합 (손실 없음)\n" +
                    "• miniGameScores + miniGameLeaderboard 둘 다 청소\n" +
                    "• 먼저 미리보기로 확인하셨나요?"
                )
              )
                return;

              showToast("🧹 정리 실행 중...", "#0ea5e9");
              try {
                const result = await cleanupLegacyUidsForWeek({
                  weekKey: undefined,
                  dryRun: false,
                });
                console.log("🎉 정리 완료:", result);
                if (result.duplicateGroupsFound === 0) {
                  showToast("✅ 중복 없음!", "#14532d");
                } else {
                  showToast(
                    `✅ 그룹 ${result.duplicateGroupsFound}개 / UID ${result.legacyUidsRemoved}개 정리 / 점수 ${result.scoresMerged}개 병합`,
                    "#14532d"
                  );
                }
                if (result.errors?.length) {
                  console.warn("⚠️ 일부 오류:", result.errors);
                }
              } catch (e: any) {
                console.error(e);
                showToast(`❌ 오류: ${e?.message ?? String(e)}`, "#dc2626");
              }
            }}
            style={adminBtnStyle("#0284c7")}
          >
            🧹 이번 주 legacy UID 정리 실행
          </button>

          {/* ─ ⚠️ 초기화 ─ */}
          <div style={sectionLabelStyle("#ef4444")}>⚠️ 초기화 (주의)</div>
          <button
            onClick={() => {
              if (!window.confirm("씰 전체를 초기화할까요?")) return;
              saveSealDex({});
              window.dispatchEvent(new Event("pokeset_dex_updated"));
              localStorage.removeItem("pokeset_shiny_dex");
              localStorage.removeItem("pokeset_cap_dex");
              localStorage.removeItem("pokeset_pending_shinies");
              setPendingShinySeals([]);
              setRevealSeals([]);
              window.dispatchEvent(new Event("pokeset_shiny_dex_updated"));
              window.dispatchEvent(new Event("pokeset_cap_dex_updated"));
              const nick = localStorage.getItem("pks_nickname");
              if (nick)
                saveUserData(nick, { sealDex: {}, shinyDex: {} }).catch(
                  () => {}
                );
              showToast("✅ 씰 전체 초기화", "#dc2626");
            }}
            style={adminBtnStyle("#ef4444", true)}
          >
            🗑️ 씰 전체 초기화
          </button>
        </div>
      </div>

      {/* ── 피드백 보기 모달 (★ NEW) ── */}
      {showFeedback && (
        <FeedbackAdminModal onClose={() => setShowFeedback(false)} />
      )}
    </div>
  );
}
