import { useState, useEffect } from "react";
import { SHOP_ITEMS } from "../../lib/constants";
import {
  getInventory,
  getEquipped,
  buyItem,
  equipItem,
  persistCoins,
} from "../../lib/storage";
import { saveLeaderboard } from "../../lib/db";
import { loadShopAsset } from "../../lib/assets";
import { EmoteMedia } from "../../components/misc";

const CATS = [
  { key: "emote", label: "이모티콘", emoji: "😊" },
  { key: "profile_skin", label: "프로필 스킨", emoji: "🎭" },
  { key: "card_skin", label: "카드 스킨", emoji: "🃏" },
  { key: "game_mat", label: "게임 매트", emoji: "🎮" },
];
const CS_TABS = new Set(["profile_skin", "card_skin", "game_mat"]);

export default function ShopModal({
  myName,
  myCoins,
  setMyCoins,
  onClose,
  onApplyBg,
  onApplySounds,
}) {
  const [tab, setTab] = useState("emote");
  const [inv, setInv] = useState({});
  const [eq, setEq] = useState({});
  const [previews, setPrev] = useState({});
  const [buying, setBuying] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([getInventory(), getEquipped()]).then(([i, e]) => {
      setInv(i);
      setEq(e);
    });
    Promise.all(
      SHOP_ITEMS.filter((i) => i.type !== "bgm").map(async (i) => {
        const url = await loadShopAsset(i.file, [
          "png",
          "jpg",
          "jpeg",
          "webp",
          "gif",
          "mp4",
        ]);
        return [i.id, url];
      })
    ).then((entries) =>
      setPrev(Object.fromEntries(entries.filter(([, v]) => v)))
    );
  }, []);

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2200);
  };

  const handleBuy = async (item) => {
    if (myCoins < item.price) {
      flash("💰 코인이 부족해요!");
      return;
    }
    setBuying(item.id);
    const ok = await buyItem(item.id);
    if (ok) {
      const newInv = { ...inv, [item.id]: true };
      setInv(newInv);
      const nc = myCoins - item.price;
      setMyCoins(nc);
      persistCoins(nc);
      saveLeaderboard(myName, nc);
      window.__cloudSave?.({ coins: nc, inventory: newInv });
      flash(`✅ ${item.name} 구매 완료!`);
    }
    setBuying(null);
  };

  const handleEquip = async (item) => {
    const isEq = eq[item.type] === item.id;
    const newId = isEq ? null : item.id;
    await equipItem(item.type, newId);
    const newEq = { ...eq, [item.type]: newId };
    setEq(newEq);
    if (item.type === "lobby_bg" || item.type === "game_bg")
      onApplyBg(item.type, newId ? previews[item.id] || null : null);
    else if (item.type === "bgm") {
      if (newId)
        loadShopAsset(item.file).then((url) => {
          if (url) onApplySounds({ bgm: { data: url, name: item.file } });
        });
      else onApplySounds(null);
    }
    flash(newId ? `🎮 ${item.name} 장착!` : "장착 해제");
  };

  const items = SHOP_ITEMS.filter((i) => i.type === tab);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1020,
        fontFamily: "system-ui,sans-serif",
        padding: 16,
      }}
    >
      <div
        style={{
          width: Math.min(400, window.innerWidth - 32),
          background: "linear-gradient(160deg,#E8190A,#C01208)",
          borderRadius: 28,
          padding: 12,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.7),inset 0 2px 0 rgba(255,130,110,0.5),inset 0 -3px 0 rgba(0,0,0,0.35)",
          border: "3px solid #8B0000",
          animation: "shopPopIn 0.25s ease",
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
              🛒 상점
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                background: "rgba(0,0,0,0.35)",
                borderRadius: 10,
                padding: "3px 10px",
                border: "1px solid rgba(255,208,60,0.4)",
              }}
            >
              <span
                style={{
                  color: "#fbbf24",
                  fontWeight: 900,
                  fontSize: 13,
                  fontFamily: "monospace",
                }}
              >
                💰{myCoins.toLocaleString()}
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
              padding: "8px 14px",
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
                  marginBottom: 1,
                }}
              >
                ITEM SHOP
              </div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>
                {CATS.find((c) => c.key === tab)?.emoji}{" "}
                {CATS.find((c) => c.key === tab)?.label}
              </div>
            </div>
            <div
              style={{
                color: "rgba(74,222,128,0.4)",
                fontSize: 9,
                fontFamily: "monospace",
              }}
            >
              {items.length} ITEMS
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

        {/* 흰 패널 */}
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
          {/* ── 카테고리 탭 (초록) ── */}
          <div
            style={{
              display: "flex",
              gap: 5,
              overflowX: "auto",
              paddingBottom: 2,
            }}
          >
            {CATS.map((c) => (
              <button
                key={c.key}
                onClick={() => setTab(c.key)}
                style={{
                  padding: "7px 11px",
                  borderRadius: 20,
                  flexShrink: 0,
                  border:
                    tab === c.key ? "2px solid #16a34a" : "1.5px solid #E5E7EB",
                  background: tab === c.key ? "#F0FDF4" : "#fff",
                  color: tab === c.key ? "#16a34a" : "#6B7280",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                  boxShadow:
                    tab === c.key ? "0 3px 0 #bbf7d0" : "0 3px 0 #e2e8f0",
                  transition: "all 0.15s",
                }}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          {/* 아이템 목록 */}
          <div
            style={{
              maxHeight: "45vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            {CS_TABS.has(tab) ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🚧</div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: "#374151",
                    marginBottom: 4,
                  }}
                >
                  추후 업데이트 예정
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                  준비 중이에요!
                </div>
              </div>
            ) : (
              items.map((item) => {
                const owned = !!inv[item.id];
                const isEq = eq[item.type] === item.id;
                const preview = previews[item.id];
                const affordable = myCoins >= item.price;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      padding: "10px 11px",
                      borderRadius: 14,
                      border: isEq
                        ? "1.5px solid #bbf7d0"
                        : owned
                        ? "1.5px solid #c7d2fe"
                        : "1.5px solid #E5E7EB",
                      background: isEq ? "#F0FDF4" : owned ? "#EEF2FF" : "#fff",
                      boxShadow: isEq
                        ? "0 3px 0 #bbf7d0"
                        : owned
                        ? "0 3px 0 #c7d2fe"
                        : "0 3px 0 #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 10,
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#F3F4F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        border: "1.5px solid #E5E7EB",
                      }}
                    >
                      {preview ? (
                        <EmoteMedia src={preview} size={48} />
                      ) : (
                        item.emoji
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          marginBottom: 2,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 13,
                            color: "#111",
                          }}
                        >
                          {item.name}
                        </span>
                        {isEq && (
                          <span
                            style={{
                              background: "#22c55e",
                              color: "#fff",
                              borderRadius: 6,
                              padding: "1px 6px",
                              fontSize: 9,
                              fontWeight: 700,
                            }}
                          >
                            장착중
                          </span>
                        )}
                        {owned && !isEq && (
                          <span
                            style={{
                              background: "#6366F1",
                              color: "#fff",
                              borderRadius: 6,
                              padding: "1px 6px",
                              fontSize: 9,
                              fontWeight: 700,
                            }}
                          >
                            보유
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6B7280",
                          marginBottom: 3,
                        }}
                      >
                        {item.desc}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: affordable ? "#D97706" : "#ef4444",
                        }}
                      >
                        💰 {item.price}
                        {!affordable && !owned && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 500,
                              color: "#ef4444",
                              marginLeft: 4,
                            }}
                          >
                            코인 부족
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                        flexShrink: 0,
                      }}
                    >
                      {!owned && (
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={!!buying || !affordable}
                          style={{
                            padding: "7px 13px",
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: affordable ? "pointer" : "not-allowed",
                            border: affordable ? "2px solid #15803d" : "none",
                            background: affordable
                              ? "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)"
                              : "#D1D5DB",
                            color: "#fff",
                            boxShadow: affordable ? "0 3px 0 #166534" : "none",
                          }}
                        >
                          {buying === item.id ? "⏳" : "구매"}
                        </button>
                      )}
                      {owned && item.type !== "emote" && (
                        <button
                          onClick={() => handleEquip(item)}
                          style={{
                            padding: "7px 13px",
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: "pointer",
                            border: isEq
                              ? "1.5px solid #fca5a5"
                              : "1.5px solid #c7d2fe",
                            background: isEq ? "#FEF2F2" : "#EEF2FF",
                            color: isEq ? "#ef4444" : "#4338CA",
                            boxShadow: isEq
                              ? "0 3px 0 #fca5a5"
                              : "0 3px 0 #c7d2fe",
                          }}
                        >
                          {isEq ? "해제" : "장착"}
                        </button>
                      )}
                      {owned && item.type === "emote" && (
                        <div
                          style={{
                            padding: "7px 10px",
                            background: "#F0FDF4",
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#16a34a",
                            textAlign: "center",
                            border: "1.5px solid #bbf7d0",
                            boxShadow: "0 3px 0 #bbf7d0",
                          }}
                        >
                          ✓ 보유
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {msg && (
            <div
              style={{
                textAlign: "center",
                padding: "8px 12px",
                background: "#F0FDF4",
                borderRadius: 10,
                color: "#16a34a",
                fontWeight: 700,
                fontSize: 12,
                border: "1.5px solid #bbf7d0",
                boxShadow: "0 3px 0 #bbf7d0",
                animation: "shopPopIn 0.2s ease",
              }}
            >
              {msg}
            </div>
          )}

          <button
            onClick={onClose}
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
            닫기
          </button>
        </div>
      </div>
      <style>{`
        @keyframes scanLine  { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes shopPopIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}