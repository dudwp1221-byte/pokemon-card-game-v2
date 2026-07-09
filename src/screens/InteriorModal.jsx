// src/screens/InteriorModal.jsx
// 마이홈 인테리어 편집 모달 - 러그/조명/스티커 구매 및 배치
import { useState } from "react";
import {
  RUGS,
  MOODS,
  TABLE_LAMPS,
  STICKERS,
  MAX_POINT_RUGS,
  MAX_TABLE_LAMPS,
  MAX_STICKERS,
  placePointRug,
  removePointRug,
  placeTableLamp,
  removeTableLamp,
  placeSticker,
  removeSticker,
  addPurchase,
} from "../lib/myHomeLogic";

const TABS = [
  { id: "rug", label: "바닥", emoji: "🟫" },
  { id: "mood", label: "무드", emoji: "💡" },
  { id: "lamp", label: "램프", emoji: "🕯️" },
  { id: "sticker", label: "포스터", emoji: "🖼️" },
];

function ItemCard({
  item,
  owned,
  applied,
  canAfford,
  onBuy,
  onApply,
  onRemove,
}) {
  return (
    <div
      style={{
        background: applied ? "#2a2a4e" : "#16162a",
        border: `2px solid ${applied ? "#aaaaff" : "#333366"}`,
        borderRadius: 10,
        padding: "10px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div style={{ fontSize: 28 }}>{item.emoji}</div>
      <div
        style={{
          fontSize: 10,
          color: "#ddddf0",
          fontWeight: 700,
          textAlign: "center",
          minHeight: 26,
          fontFamily: "'Courier New',monospace",
        }}
      >
        {item.name}
      </div>

      {applied ? (
        <button
          onClick={onRemove}
          style={{
            width: "100%",
            background: "#553333",
            border: "1px solid #aa6666",
            borderRadius: 5,
            color: "#ffaaaa",
            fontWeight: 900,
            fontSize: 10,
            padding: "4px",
            cursor: "pointer",
          }}
        >
          해제
        </button>
      ) : owned ? (
        <button
          onClick={onApply}
          style={{
            width: "100%",
            background: "#4444aa",
            border: "none",
            borderRadius: 5,
            color: "#fff",
            fontWeight: 900,
            fontSize: 10,
            padding: "4px",
            cursor: "pointer",
          }}
        >
          적용
        </button>
      ) : (
        <button
          onClick={onBuy}
          disabled={!canAfford}
          style={{
            width: "100%",
            background: canAfford ? "#5050cc" : "#333",
            border: "none",
            borderRadius: 5,
            color: canAfford ? "#fff" : "#666",
            fontWeight: 900,
            fontSize: 10,
            padding: "4px",
            cursor: canAfford ? "pointer" : "not-allowed",
          }}
        >
          🪙{item.cost}
        </button>
      )}
    </div>
  );
}

// 배치 모드용 카드 (포인트 러그/램프/스티커)
function PlaceableCard({ item, owned, canAfford, onBuy, onPlace, count, max }) {
  return (
    <div
      style={{
        background: "#16162a",
        border: "2px solid #333366",
        borderRadius: 10,
        padding: "10px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div style={{ fontSize: 28 }}>{item.emoji}</div>
      <div
        style={{
          fontSize: 10,
          color: "#ddddf0",
          fontWeight: 700,
          textAlign: "center",
          minHeight: 26,
          fontFamily: "'Courier New',monospace",
        }}
      >
        {item.name}
      </div>
      {owned ? (
        <button
          onClick={onPlace}
          disabled={count >= max}
          style={{
            width: "100%",
            background: count >= max ? "#333" : "#4444aa",
            border: "none",
            borderRadius: 5,
            color: count >= max ? "#666" : "#fff",
            fontWeight: 900,
            fontSize: 10,
            padding: "4px",
            cursor: count >= max ? "not-allowed" : "pointer",
          }}
        >
          {count >= max ? "가득함" : "배치"}
        </button>
      ) : (
        <button
          onClick={onBuy}
          disabled={!canAfford}
          style={{
            width: "100%",
            background: canAfford ? "#5050cc" : "#333",
            border: "none",
            borderRadius: 5,
            color: canAfford ? "#fff" : "#666",
            fontWeight: 900,
            fontSize: 10,
            padding: "4px",
            cursor: canAfford ? "pointer" : "not-allowed",
          }}
        >
          🪙{item.cost}
        </button>
      )}
    </div>
  );
}

export default function InteriorModal({
  home,
  myCoins,
  onSave,
  onSpendCoins,
  onClose,
  onStartPlacing, // (type, itemId) => 배치 모드 진입
}) {
  const [tab, setTab] = useState("rug");

  const buy = (type, item) => {
    if (myCoins < item.cost) return;
    onSpendCoins?.(item.cost);
    const fieldMap = {
      rug: "purchasedRugs",
      mood: "purchasedMoods",
      lamp: "purchasedLamps",
      sticker: "purchasedStickers",
    };
    const field = fieldMap[type];
    onSave({ ...home, [field]: addPurchase(home[field], item.id) });
  };

  const applyRug = (item) => {
    onSave({ ...home, rugId: item.id });
  };
  const applyMood = (item) => {
    onSave({ ...home, moodId: item.id });
  };

  // ── 바닥(전체 러그 + 포인트 러그) ─────────────────────
  const renderRugTab = () => {
    const fullRugs = RUGS.filter((r) => r.zone === "full");
    const pointRugs = RUGS.filter((r) => r.zone === "point");
    const appliedFullId = home.rugId ?? "rug_none";
    const purchased = home.purchasedRugs ?? ["rug_none"];
    const pointCount = (home.pointRugs ?? []).length;

    return (
      <>
        <div style={sectionTitleStyle}>🟫 전체 바닥</div>
        <div style={gridStyle}>
          {fullRugs.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              owned={purchased.includes(item.id)}
              applied={appliedFullId === item.id}
              canAfford={myCoins >= item.cost}
              onBuy={() => buy("rug", item)}
              onApply={() => applyRug(item)}
              onRemove={() => applyRug({ id: "rug_none" })}
            />
          ))}
        </div>

        <div style={sectionTitleStyle}>
          🟠 포인트 러그 ({pointCount}/{MAX_POINT_RUGS})
        </div>
        <div
          style={{
            fontSize: 9,
            color: "#6666aa",
            padding: "0 4px 8px",
            fontFamily: "'Courier New',monospace",
          }}
        >
          💡 배치 버튼을 누르면 방에 탭해서 위치 지정
        </div>
        <div style={gridStyle}>
          {pointRugs.map((item) => (
            <PlaceableCard
              key={item.id}
              item={item}
              owned={purchased.includes(item.id)}
              canAfford={myCoins >= item.cost}
              onBuy={() => buy("rug", item)}
              onPlace={() => onStartPlacing?.("pointRug", item.id)}
              count={pointCount}
              max={MAX_POINT_RUGS}
            />
          ))}
        </div>
      </>
    );
  };

  // ── 무드 조명 ────────────────────────────────────────
  const renderMoodTab = () => {
    const appliedId = home.moodId ?? "mood_off";
    const purchased = home.purchasedMoods ?? ["mood_off"];
    return (
      <>
        <div style={sectionTitleStyle}>💡 무드 조명</div>
        <div
          style={{
            fontSize: 9,
            color: "#6666aa",
            padding: "0 4px 8px",
            fontFamily: "'Courier New',monospace",
          }}
        >
          💡 방 전체 색감/밝기를 조절해요
        </div>
        <div style={gridStyle}>
          {MOODS.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              owned={purchased.includes(item.id)}
              applied={appliedId === item.id}
              canAfford={myCoins >= item.cost}
              onBuy={() => buy("mood", item)}
              onApply={() => applyMood(item)}
              onRemove={() => applyMood({ id: "mood_off" })}
            />
          ))}
        </div>
      </>
    );
  };

  // ── 테이블 램프 ───────────────────────────────────────
  const renderLampTab = () => {
    const purchased = home.purchasedLamps ?? [];
    const lampCount = (home.tableLamps ?? []).length;
    return (
      <>
        <div style={sectionTitleStyle}>
          🕯️ 테이블 램프 ({lampCount}/{MAX_TABLE_LAMPS})
        </div>
        <div
          style={{
            fontSize: 9,
            color: "#6666aa",
            padding: "0 4px 8px",
            fontFamily: "'Courier New',monospace",
          }}
        >
          💡 배치 후 방을 탭해서 위치 지정
        </div>
        <div style={gridStyle}>
          {TABLE_LAMPS.map((item) => (
            <PlaceableCard
              key={item.id}
              item={item}
              owned={purchased.includes(item.id)}
              canAfford={myCoins >= item.cost}
              onBuy={() => buy("lamp", item)}
              onPlace={() => onStartPlacing?.("lamp", item.id)}
              count={lampCount}
              max={MAX_TABLE_LAMPS}
            />
          ))}
        </div>
      </>
    );
  };

  // ── 스티커 ──────────────────────────────────────────
  const renderStickerTab = () => {
    const purchased = home.purchasedStickers ?? [];
    const stickerCount = (home.stickers ?? []).length;
    return (
      <>
        <div style={sectionTitleStyle}>
          🖼️ 포스터/스티커 ({stickerCount}/{MAX_STICKERS})
        </div>
        <div
          style={{
            fontSize: 9,
            color: "#6666aa",
            padding: "0 4px 8px",
            fontFamily: "'Courier New',monospace",
          }}
        >
          💡 배치 후 벽면을 탭해서 붙이기
        </div>
        <div style={gridStyle}>
          {STICKERS.map((item) => (
            <PlaceableCard
              key={item.id}
              item={item}
              owned={purchased.includes(item.id)}
              canAfford={myCoins >= item.cost}
              onBuy={() => buy("sticker", item)}
              onPlace={() => onStartPlacing?.("sticker", item.id)}
              count={stickerCount}
              max={MAX_STICKERS}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 320,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#1a1a2e",
          borderRadius: "16px 16px 0 0",
          width: "100%",
          maxWidth: 480,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          border: "2px solid #4444aa",
          borderBottom: "none",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            borderBottom: "1px solid #333366",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontWeight: 900,
              color: "#aaaaff",
              fontSize: 14,
              fontFamily: "'Courier New',monospace",
            }}
          >
            🎨 인테리어
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div
              style={{
                background: "#0d0d1a",
                border: "1px solid #4444aa",
                borderRadius: 5,
                padding: "3px 8px",
                fontSize: 11,
                fontWeight: 900,
                color: "#ffcc44",
              }}
            >
              🪙{(myCoins ?? 0).toLocaleString()}
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#333366",
                border: "1px solid #4444aa",
                borderRadius: 6,
                color: "#aaaaff",
                fontWeight: 900,
                fontSize: 12,
                padding: "4px 12px",
                cursor: "pointer",
              }}
            >
              닫기
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "10px 10px 8px",
            borderBottom: "1px solid #222244",
            flexShrink: 0,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: "8px 4px",
                background: tab === t.id ? "#4444aa" : "#16162a",
                border: `1px solid ${tab === t.id ? "#aaaaff" : "#333366"}`,
                borderRadius: 6,
                color: tab === t.id ? "#fff" : "#8888cc",
                fontWeight: 900,
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "'Courier New',monospace",
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* 내용 */}
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          {tab === "rug" && renderRugTab()}
          {tab === "mood" && renderMoodTab()}
          {tab === "lamp" && renderLampTab()}
          {tab === "sticker" && renderStickerTab()}
        </div>
      </div>
    </div>
  );
}

const sectionTitleStyle = {
  fontSize: 12,
  fontWeight: 900,
  color: "#aaaaff",
  padding: "6px 4px 8px",
  fontFamily: "'Courier New',monospace",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 8,
  marginBottom: 16,
};
