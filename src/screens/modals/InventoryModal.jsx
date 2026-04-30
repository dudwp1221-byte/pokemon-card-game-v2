import { useState, useEffect } from "react";
import { SHOP_ITEMS } from "../../lib/constants";
import { getInventory } from "../../lib/storage";
import { loadShopAsset } from "../../lib/assets";
import { EmoteMedia } from "../../components/misc";

export default function InventoryModal({
  emoteLoadout,
  setEmoteLoadout,
  onClose,
}) {
  const [inv, setInv] = useState({});
  const [imgs, setImgs] = useState({});
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    (async () => {
      const inventory = await getInventory();
      setInv(inventory);

      const imgMap = {};
      await Promise.all(
        SHOP_ITEMS.filter((i) => i.type === "emote" && inventory[i.id]).map(
          async (item) => {
            const url = await loadShopAsset(item.file, [
              "png",
              "jpg",
              "jpeg",
              "webp",
              "gif",
              "mp4",
            ]);
            if (url) imgMap[item.id] = url;
          }
        )
      );
      setImgs(imgMap);

      // ✅ 수정: emoteLoadout 정리 시 인벤토리가 비어있으면 정리하지 않음
      // 기존: 네트워크 지연으로 inventory가 빈 객체면 emoteLoadout 전체 초기화됨
      // 수정: inventory에 실제 아이템이 있을 때만 정리, 없으면 현재 loadout 유지
      const validIds = new Set(
        SHOP_ITEMS.filter((i) => i.type === "emote" && inventory[i.id]).map(
          (i) => i.id
        )
      );

      if (Object.keys(inventory).length > 0) {
        // 인벤토리가 로드된 경우에만 loadout 정리
        setEmoteLoadout((prev) => {
          const cleaned = prev.filter((id) => validIds.has(id));
          if (cleaned.length !== prev.length) {
            window.__cloudSave?.({ emoteLoadout: cleaned });
            return cleaned;
          }
          return prev;
        });
      }
      // 인벤토리가 비어있으면 loadout 그대로 유지 (네트워크 오류 가능성)

      setLoad(false);
    })();
  }, []);

  const owned = SHOP_ITEMS.filter((i) => i.type === "emote" && inv[i.id]);

  const toggle = (id) => {
    setEmoteLoadout((prev) => {
      const next = prev.includes(id)
        ? prev.filter((e) => e !== id)
        : prev.length >= 6
        ? prev
        : [...prev, id];
      window.__cloudSave?.({ emoteLoadout: next });
      return next;
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
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
          animation: "invPopIn 0.25s ease",
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
              🎒 가방
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
                EMOTE BAG
              </div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>
                🎒 이모티콘 가방
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
                {emoteLoadout.length}/6
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

        {/* 흰 패널 */}
        <div
          style={{
            background: "#FEFEFE",
            borderRadius: 20,
            padding: 12,
            boxShadow: "inset 0 2px 0 #fff,inset 0 -2px 0 rgba(180,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* 장착 슬롯 */}
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#6B7280",
                marginBottom: 7,
                letterSpacing: 0.5,
              }}
            >
              인게임 이모티콘 선택
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6,1fr)",
                gap: 6,
                padding: 10,
                background: "#F3F4F6",
                borderRadius: 14,
                border: "1.5px solid #E5E7EB",
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => {
                const id = emoteLoadout[i];
                const item = id ? SHOP_ITEMS.find((s) => s.id === id) : null;
                const vid = item ? id : null;
                return (
                  <div
                    key={i}
                    onClick={() => vid && toggle(vid)}
                    style={{
                      aspectRatio: "1",
                      borderRadius: 10,
                      border: vid
                        ? "2px solid #22c55e"
                        : "1.5px dashed #D1D5DB",
                      background: vid ? "#F0FDF4" : "#fff",
                      cursor: vid ? "pointer" : "default",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: vid ? "0 2px 0 #bbf7d0" : "0 2px 0 #e2e8f0",
                    }}
                  >
                    {item ? (
                      imgs[vid] ? (
                        <EmoteMedia src={imgs[vid]} size={36} />
                      ) : (
                        <span style={{ fontSize: 18 }}>{item.emoji}</span>
                      )
                    ) : (
                      <span style={{ fontSize: 18, color: "#D1D5DB" }}>+</span>
                    )}
                    {vid && (
                      <div
                        style={{
                          position: "absolute",
                          top: -1,
                          right: -1,
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: "#EF4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "#fff",
                            fontSize: 8,
                            fontWeight: 700,
                          }}
                        >
                          ✕
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ height: 1, background: "#f1f5f9" }} />

          {/* 보유 이모티콘 */}
          <div style={{ maxHeight: "32vh", overflowY: "auto" }}>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#9CA3AF",
                }}
              >
                ⏳ 로딩 중...
              </div>
            ) : owned.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#9CA3AF",
                  fontSize: 12,
                }}
              >
                상점에서 이모티콘을 구매하세요!
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 7,
                }}
              >
                {owned.map((item) => {
                  const sel = emoteLoadout.includes(item.id);
                  const full = !sel && emoteLoadout.length >= 6;
                  return (
                    <div
                      key={item.id}
                      onClick={() => !full && toggle(item.id)}
                      style={{
                        textAlign: "center",
                        cursor: full ? "not-allowed" : "pointer",
                        padding: 8,
                        borderRadius: 12,
                        border: sel
                          ? "1.5px solid #22c55e"
                          : "1.5px solid #E5E7EB",
                        background: sel ? "#F0FDF4" : "#F9FAFB",
                        opacity: full ? 0.5 : 1,
                        boxShadow: sel ? "0 3px 0 #bbf7d0" : "0 3px 0 #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          margin: "0 auto 4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {imgs[item.id] ? (
                          <EmoteMedia src={imgs[item.id]} size={44} />
                        ) : (
                          <span style={{ fontSize: 28 }}>{item.emoji}</span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: sel ? 700 : 400,
                          color: sel ? "#16a34a" : "#6B7280",
                        }}
                      >
                        {item.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "13px 0",
              borderRadius: 28,
              border: "2px solid #15803d",
              background: "linear-gradient(160deg,#4ade80,#22c55e 40%,#16a34a)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 4px 0 #166534,0 8px 24px rgba(22,163,74,0.3)",
            }}
          >
            ✅ 완료
          </button>
        </div>
      </div>
      <style>{`
        @keyframes scanLine { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes invPopIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}
