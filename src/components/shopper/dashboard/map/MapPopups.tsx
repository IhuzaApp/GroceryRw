import { formatCurrencySync } from "../../../../utils/formatCurrency";

/**
 * Create popup HTML for pending orders
 * @param order Order data
 * @param theme Current theme ('light' or 'dark')
 * @param isPending Whether this is a pending order
 * @returns HTML string for popup
 */
export function createPopupHTML(
  order: any,
  theme: "light" | "dark",
  isPending: boolean = false
): string {
  const isDark = theme === "dark";

  if (isPending) {
    return `
      <div style="
        min-width: 280px;
        max-width: 320px;
        background: ${isDark ? "#1f2937" : "#ffffff"};
        border-radius: 12px;
        overflow: hidden;
        box-shadow: ${
          isDark
            ? "0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(75, 85, 99, 0.3)"
            : "0 10px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(229, 231, 235, 0.5)"
        };
      ">
        <!-- Header -->
        <div style="
          background: ${isDark ? "#374151" : "#f9fafb"};
          padding: 16px;
          border-bottom: 1px solid ${isDark ? "#4b5563" : "#e5e7eb"};
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="
              font-size: 12px;
              font-weight: 500;
              color: ${isDark ? "#9ca3af" : "#6b7280"};
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">
              Order #${order.id.slice(-6)}
            </span>
            <span style="
              font-size: 18px;
              font-weight: 700;
              color: ${isDark ? "#10b981" : "#059669"};
            ">
              ${formatCurrencySync(order.earnings)}
            </span>
          </div>
          <div style="
            font-size: 16px;
            font-weight: 600;
            color: ${isDark ? "#f3f4f6" : "#111827"};
            margin-bottom: 4px;
          ">
            ${order.shopName}
          </div>
          <div style="
            font-size: 14px;
            color: ${isDark ? "#9ca3af" : "#6b7280"};
          ">
            ${order.shopAddress}
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 16px;">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: ${isDark ? "#374151" : "#f3f4f6"};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
              ">
                🛒
              </div>
              <div>
                <div style="
                  font-size: 14px;
                  font-weight: 500;
                  color: ${isDark ? "#f3f4f6" : "#111827"};
                ">
                  ${order.itemsCount} items
                </div>
                <div style="
                  font-size: 12px;
                  color: ${isDark ? "#9ca3af" : "#6b7280"};
                ">
                  ${order.createdAt}
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: ${isDark ? "#374151" : "#f3f4f6"};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
              ">
                🚚
              </div>
              <div>
                <div style="
                  font-size: 14px;
                  font-weight: 500;
                  color: ${isDark ? "#f3f4f6" : "#111827"};
                ">
                  Delivery Address
                </div>
                <div style="
                  font-size: 12px;
                  color: ${isDark ? "#9ca3af" : "#6b7280"};
                ">
                  ${order.addressStreet}, ${order.addressCity}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div style="
          padding: 16px;
          border-top: 1px solid ${isDark ? "#4b5563" : "#e5e7eb"};
        ">
          <button
            data-order-id="${order.id}"
            class="accept-order-btn"
            style="
              width: 100%;
              padding: 12px;
              background: linear-gradient(135deg, ${
                isDark ? "#10b981" : "#059669"
              } 0%, ${isDark ? "#059669" : "#047857"} 100%);
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 15px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(16, 185, 129, 0.4)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.3)';"
          >
            Accept Order
          </button>
        </div>
      </div>
    `;
  }

  // Regular popup (simpler version)
  return `
    <div style="
      min-width: 200px;
      padding: 12px;
      background: ${isDark ? "#1f2937" : "#ffffff"};
      border-radius: 8px;
      color: ${isDark ? "#f3f4f6" : "#111827"};
    ">
      <div style="font-weight: 600; margin-bottom: 4px;">${
        order.shopName || order.name
      }</div>
      <div style="font-size: 14px; color: ${isDark ? "#9ca3af" : "#6b7280"};">
        ${order.shopAddress || order.address || ""}
      </div>
    </div>
  `;
}

/**
 * Create shop marker popup content
 * @param shop Shop data
 * @param isDark Whether dark theme is active
 * @returns HTML string for shop popup
 */
export function createShopPopupContent(shop: any, isDark: boolean): string {
  return `
    <div style="padding: 8px;">
      <strong style="color: ${isDark ? "#f3f4f6" : "#111827"};">${
    shop.name
  }</strong>
      ${
        shop.logo
          ? `<br/><img src="${shop.logo}" alt="${shop.name}" style="max-width: 100px; margin-top: 8px; border-radius: 4px;" />`
          : ""
      }
    </div>
  `;
}

/**
 * Create order marker popup content
 * @param order Order data
 * @param isReelOrder Whether this is a reel order
 * @returns HTML string for order popup
 */
export function createOrderPopupContent(
  order: any,
  isReelOrder: boolean = false
): string {
  const earnings = order.earnings || order.estimatedEarnings || 0;
  const itemsCount = order.itemsCount || order.items || 1;

  return `
    <div style="min-width: 220px; padding: 12px;">
      <div style="font-weight: 600; margin-bottom: 8px; font-size: 15px;">
        ${order.shopName}
      </div>
      <div style="margin-bottom: 6px;">
        <span style="font-weight: 500;">Earnings:</span> ${formatCurrencySync(
          earnings
        )}
      </div>
      <div style="margin-bottom: 6px;">
        <span style="font-weight: 500;">Items:</span> ${itemsCount}
      </div>
      ${
        isReelOrder
          ? '<div style="margin-top: 8px; padding: 4px 8px; background: #fef3c7; color: #92400e; border-radius: 4px; display: inline-block; font-size: 12px; font-weight: 600;">📹 Reel Order</div>'
          : ""
      }
      <div style="margin-top: 8px; font-size: 13px; color: #6b7280;">
        ${order.addressStreet}, ${order.addressCity}
      </div>
    </div>
  `;
}
