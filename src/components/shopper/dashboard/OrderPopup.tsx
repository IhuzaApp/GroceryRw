import React from "react";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface PendingOrder {
  id: string;
  status: string;
  shop_id: string;
  customer_id: string;
  latitude: number;
  longitude: number;
  earnings: number;
  shopName: string;
  shopAddress: string;
  shopLat: number;
  shopLng: number;
  createdAt: string;
  itemsCount: number;
  addressStreet: string;
  addressCity: string;
}

interface AvailableOrder {
  id: string;
  shopName: string;
  shopAddress: string;
  customerAddress: string;
  distance: string;
  items: number;
  total: string;
  estimatedEarnings: string;
  createdAt: string;
  orderType?: "regular" | "reel" | "restaurant";
  reel?: {
    id: string;
    title: string;
    description: string;
    Price: string;
    Product: string;
    type: string;
    video_url: string;
  };
  deliveryNote?: string;
  customerName?: string;
  customerPhone?: string;
}

interface OrderPopupProps {
  order: PendingOrder | AvailableOrder;
  theme: "light" | "dark";
  onAcceptOrder: (orderId: string, orderType?: "regular" | "reel" | "restaurant") => void;
  isPending?: boolean;
}

export const PendingOrderPopup: React.FC<OrderPopupProps> = ({
  order,
  theme,
  onAcceptOrder,
}) => {
  const pendingOrder = order as PendingOrder;

  const handleAccept = () => {
    onAcceptOrder(pendingOrder.id, "regular");
  };

  const isDark = theme === "dark";
  
  return (
    <div
      style={{
        minWidth: "280px",
        maxWidth: "320px",
        background: isDark ? "#1f2937" : "#ffffff",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: isDark 
          ? "0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(75, 85, 99, 0.3)"
          : "0 10px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(229, 231, 235, 0.5)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: isDark ? "#374151" : "#f9fafb",
          padding: "16px",
          borderBottom: `1px solid ${isDark ? "#4b5563" : "#e5e7eb"}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: isDark ? "#9ca3af" : "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Order #{pendingOrder.id.slice(-6)}
          </span>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: isDark ? "#10b981" : "#059669",
            }}
          >
            {formatCurrencySync(pendingOrder.earnings)}
          </span>
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: isDark ? "#f3f4f6" : "#111827",
            marginBottom: "4px",
          }}
        >
          {pendingOrder.shopName}
        </div>
        <div
          style={{
            fontSize: "14px",
            color: isDark ? "#9ca3af" : "#6b7280",
          }}
        >
          {pendingOrder.shopAddress}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: isDark ? "#374151" : "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              🛒
            </div>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: isDark ? "#f3f4f6" : "#111827",
                }}
              >
                {pendingOrder.itemsCount} items
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: isDark ? "#9ca3af" : "#6b7280",
                }}
              >
                {pendingOrder.createdAt}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: isDark ? "#374151" : "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              🚚
            </div>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: isDark ? "#f3f4f6" : "#111827",
                }}
              >
                Delivery Address
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: isDark ? "#9ca3af" : "#6b7280",
                }}
              >
                {pendingOrder.addressStreet}, {pendingOrder.addressCity}
              </div>
            </div>
          </div>
        </div>

        {/* Accept Button */}
        <button
          id={`accept-batch-${pendingOrder.id}`}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "12px 16px",
            background: isDark ? "#10b981" : "#059669",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = isDark ? "#059669" : "#047857";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = isDark ? "#10b981" : "#059669";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span>✓</span>
          Accept Batch
        </button>
      </div>
    </div>
  );
};

export const AvailableOrderPopup: React.FC<OrderPopupProps> = ({
  order,
  theme,
  onAcceptOrder,
}) => {
  const availableOrder = order as AvailableOrder;
  const isReelOrder = availableOrder.orderType === "reel";
  const isRestaurantOrder = availableOrder.orderType === "restaurant";

  const handleAccept = () => {
    onAcceptOrder(availableOrder.id, availableOrder.orderType);
  };

  const isDark = theme === "dark";
  
  // Get order type styling
  const getOrderTypeConfig = () => {
    if (isReelOrder) {
      return {
        color: isDark ? "#8b5cf6" : "#7c3aed",
        bgColor: isDark ? "#4c1d95" : "#ede9fe",
        icon: "🎬",
        label: "REEL ORDER",
        buttonColor: isDark ? "#8b5cf6" : "#7c3aed",
        buttonHover: isDark ? "#7c3aed" : "#6d28d9",
      };
    } else if (isRestaurantOrder) {
      return {
        color: isDark ? "#f97316" : "#ea580c",
        bgColor: isDark ? "#9a3412" : "#fed7aa",
        icon: "🍽️",
        label: "RESTAURANT ORDER",
        buttonColor: isDark ? "#f97316" : "#ea580c",
        buttonHover: isDark ? "#ea580c" : "#c2410c",
      };
    } else {
      return {
        color: isDark ? "#10b981" : "#059669",
        bgColor: isDark ? "#064e3b" : "#d1fae5",
        icon: "🏪",
        label: "REGULAR ORDER",
        buttonColor: isDark ? "#10b981" : "#059669",
        buttonHover: isDark ? "#059669" : "#047857",
      };
    }
  };

  const orderConfig = getOrderTypeConfig();

  return (
    <div
      style={{
        minWidth: "280px",
        maxWidth: "320px",
        background: isDark ? "#1f2937" : "#ffffff",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: isDark 
          ? "0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(75, 85, 99, 0.3)"
          : "0 10px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(229, 231, 235, 0.5)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: isDark ? "#374151" : "#f9fafb",
          padding: "16px",
          borderBottom: `1px solid ${isDark ? "#4b5563" : "#e5e7eb"}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: isDark ? "#9ca3af" : "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Order #{availableOrder.id.slice(-6)}
          </span>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: orderConfig.color,
            }}
          >
            {availableOrder.estimatedEarnings}
          </span>
        </div>
        
        {/* Order Type Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 8px",
            borderRadius: "6px",
            background: orderConfig.bgColor,
            color: orderConfig.color,
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "8px",
          }}
        >
          <span>{orderConfig.icon}</span>
          {orderConfig.label}
        </div>

        <div
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: isDark ? "#f3f4f6" : "#111827",
            marginBottom: "4px",
          }}
        >
          {isReelOrder ? availableOrder.reel?.title || "Reel Order" : availableOrder.shopName}
        </div>
        <div
          style={{
            fontSize: "14px",
            color: isDark ? "#9ca3af" : "#6b7280",
          }}
        >
          {isReelOrder 
            ? `From: ${availableOrder.customerName || "Reel Creator"}`
            : availableOrder.shopAddress}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: isDark ? "#374151" : "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              {orderConfig.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: isDark ? "#f3f4f6" : "#111827",
                }}
              >
                {availableOrder.items || "N/A"} items
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: isDark ? "#9ca3af" : "#6b7280",
                }}
              >
                {availableOrder.createdAt}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: isDark ? "#374151" : "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              🚚
            </div>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: isDark ? "#f3f4f6" : "#111827",
                }}
              >
                Delivery Address
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: isDark ? "#9ca3af" : "#6b7280",
                }}
              >
                {availableOrder.customerAddress}
              </div>
            </div>
          </div>

          {isReelOrder && availableOrder.deliveryNote && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: isDark ? "#374151" : "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                📝
              </div>
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: isDark ? "#f3f4f6" : "#111827",
                  }}
                >
                  Delivery Note
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: isDark ? "#9ca3af" : "#6b7280",
                  }}
                >
                  {availableOrder.deliveryNote}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accept Button */}
        <button
          id={`accept-batch-${availableOrder.id}`}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "12px 16px",
            background: orderConfig.buttonColor,
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = orderConfig.buttonHover;
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = orderConfig.buttonColor;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span>✓</span>
          Accept Batch
        </button>
      </div>
    </div>
  );
};

// Main component that decides which popup to render
export const OrderPopup: React.FC<OrderPopupProps> = ({
  order,
  theme,
  onAcceptOrder,
  isPending = false,
}) => {
  if (isPending) {
    return (
      <PendingOrderPopup
        order={order}
        theme={theme}
        onAcceptOrder={onAcceptOrder}
      />
    );
  }

  return (
    <AvailableOrderPopup
      order={order}
      theme={theme}
      onAcceptOrder={onAcceptOrder}
    />
  );
};
