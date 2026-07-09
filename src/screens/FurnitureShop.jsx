// src/screens/FurnitureShop.jsx
import { useState, useMemo } from "react";
import {
  FURNITURE_CATALOG,
  CATEGORIES,
  getFurnitureUrl,
} from "../lib/myHomeLogic";

export default function FurnitureShop({
  onClose,
  coin,
  purchasedFurniture,
  onBuy,
}) {
  const [activeCat, setActiveCat] = useState("bedroom");
  const [preview, setPreview] = useState(null); // itemId

  const items = useMemo(
    () => FURNITURE_CATALOG.filter((f) => f.category === activeCat),
    [activeCat]
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: "12px 16px",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: 99,
            border: "none",
            background: "#f0f0f0",
            cursor: "pointer",
          }}
        >
          ←
        </button>
        <div style={{ flex: 1, fontWeight: 800, fontSize: 15 }}>
          🛒 가구 상점
        </div>
        <div
          style={{
            padding: "4px 10px",
            background: "rgba(255,215,0,0.2)",
            border: "1px solid rgba(255,215,0,0.4)",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 800,
            color: "#B8860B",
          }}
        >
          🪙 {coin?.toLocaleString() ?? 0}
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "8px 10px",
          background: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          overflowX: "auto",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            style={{
              flexShrink: 0,
              padding: "6px 14px",
              borderRadius: 99,
              border: "1px solid rgba(0,0,0,0.1)",
              background: activeCat === cat.id ? "#4a7bec" : "#f5f5f5",
              color: activeCat === cat.id ? "#fff" : "#333",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* 가구 그리드 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          background: "#fafafa",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 10,
          alignContent: "start",
        }}
      >
        {items.map((item) => {
          const ownedCount = purchasedFurniture.filter(
            (id) => id === item.id
          ).length;
          const canAfford = coin >= item.cost;

          return (
            <div
              key={item.id}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 10,
                border: "1px solid rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                  cursor: "pointer",
                  background: "linear-gradient(180deg, #f8f4e8, #ede3cc)",
                  borderRadius: 8,
                }}
                onClick={() => setPreview(item.id)}
              >
                <img
                  src={getFurnitureUrl(item.id, "SW")}
                  alt={item.name}
                  draggable={false}
                  style={{
                    maxWidth: "90%",
                    maxHeight: "90%",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  textAlign: "center",
                  minHeight: 28,
                  marginBottom: 2,
                }}
              >
                {item.name}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: "#666",
                  marginBottom: 6,
                }}
              >
                {item.w}×{item.h} 타일
                {ownedCount > 0 && ` · 보유 ${ownedCount}`}
              </div>

              <button
                onClick={() => onBuy(item.id)}
                disabled={!canAfford}
                style={{
                  width: "100%",
                  padding: "6px",
                  borderRadius: 8,
                  border: "none",
                  background: canAfford ? "#4a7bec" : "#ddd",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: canAfford ? "pointer" : "not-allowed",
                }}
              >
                🪙 {item.cost.toLocaleString()}
              </button>
            </div>
          );
        })}
      </div>

      {/* 프리뷰 모달 */}
      {preview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setPreview(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              maxWidth: 340,
              width: "100%",
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 15,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {FURNITURE_CATALOG.find((f) => f.id === preview)?.name}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {["SW", "SE", "NE", "NW"].map((d) => (
                <div
                  key={d}
                  style={{
                    background: "linear-gradient(180deg, #f8f4e8, #ede3cc)",
                    borderRadius: 10,
                    padding: 10,
                    textAlign: "center",
                  }}
                >
                  <img
                    src={getFurnitureUrl(preview, d)}
                    alt={d}
                    draggable={false}
                    style={{
                      width: "100%",
                      height: 100,
                      objectFit: "contain",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      marginTop: 4,
                      color: "#666",
                    }}
                  >
                    {d}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#666",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              구매 후 방향을 회전할 수 있어요
            </div>
            <button
              onClick={() => setPreview(null)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "none",
                background: "#f0f0f0",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
