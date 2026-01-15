import L from "leaflet";
import { formatCurrencySync } from "../../../../utils/formatCurrency";

/**
 * Helper function to create popup HTML with proper button styling
 */
export const createPopupHTML = (
  order: any,
  theme: "light" | "dark",
  isPending: boolean = false
) => {
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
                color: ${isDark ? "#10b981" : "#059669"};
              ">
                <svg width="12px" height="12px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path opacity="0.5" d="M10 2C9.0335 2 8.25 2.7835 8.25 3.75C8.25 4.7165 9.0335 5.5 10 5.5H14C14.9665 5.5 15.75 4.7165 15.75 3.75C15.75 2.7835 14.9665 2 14 2H10Z" fill="currentColor"></path> 
                  <path opacity="0.5" d="M3.86327 16.2052C3.00532 12.7734 2.57635 11.0575 3.47718 9.90376C4.37801 8.75 6.14672 8.75 9.68413 8.75H14.3148C17.8522 8.75 19.6209 8.75 20.5218 9.90376C21.4226 11.0575 20.9936 12.7734 20.1357 16.2052C19.59 18.3879 19.3172 19.4792 18.5034 20.1146C17.6896 20.75 16.5647 20.75 14.3148 20.75H9.68413C7.43427 20.75 6.30935 20.75 5.49556 20.1146C4.68178 19.4792 4.40894 18.3879 3.86327 16.2052Z" fill="currentColor"></path> 
                  <path d="M15.5805 4.5023C15.6892 4.2744 15.75 4.01931 15.75 3.75C15.75 3.48195 15.6897 3.22797 15.582 3.00089C16.2655 3.00585 16.7983 3.03723 17.2738 3.22309C17.842 3.44516 18.3362 3.82266 18.6999 4.31242C19.0669 4.8065 19.2391 5.43979 19.4762 6.31144L19.5226 6.48181L20.0353 9.44479C19.6266 9.16286 19.0996 8.99533 18.418 8.89578L18.0567 6.80776C17.7729 5.76805 17.6699 5.44132 17.4957 5.20674C17.2999 4.94302 17.0337 4.73975 16.7278 4.62018C16.508 4.53427 16.2424 4.50899 15.5805 4.5023Z" fill="currentColor"></path> 
                  <path d="M8.41799 3.00089C8.31027 3.22797 8.25 3.48195 8.25 3.75C8.25 4.01931 8.31083 4.27441 8.41951 4.50231C7.75766 4.509 7.49208 4.53427 7.27227 4.62018C6.96633 4.73975 6.70021 4.94302 6.50436 5.20674C6.33015 5.44132 6.22715 5.76805 5.94337 6.80776L5.58207 8.89569C4.90053 8.99518 4.37353 9.1626 3.96484 9.44433L4.47748 6.48181L4.52387 6.31145C4.76095 5.4398 4.9332 4.8065 5.30013 4.31242C5.66384 3.82266 6.15806 3.44516 6.72624 3.22309C7.20177 3.03724 7.73449 3.00586 8.41799 3.00089Z" fill="currentColor"></path> 
                  <path d="M8.75 12.75C8.75 12.3358 8.41421 12 8 12C7.58579 12 7.25 12.3358 7.25 12.75V16.75C7.25 17.1642 7.58579 17.5 8 17.5C8.41421 17.5 8.75 17.1642 8.75 16.75V12.75Z" fill="currentColor"></path> 
                  <path d="M16 12C16.4142 12 16.75 12.3358 16.75 12.75V16.75C16.75 17.1642 16.4142 17.5 16 17.5C15.5858 17.5 15.25 17.1642 15.25 16.75V12.75C15.25 12.3358 15.5858 12 16 12Z" fill="currentColor"></path> 
                  <path d="M12.75 12.75C12.75 12.3358 12.4142 12 12 12C11.5858 12 11.25 12.3358 11.25 12.75V16.75C11.25 17.1642 11.5858 17.5 12 17.5C12.4142 17.5 12.75 17.1642 12.75 16.75V12.75Z" fill="currentColor"></path> 
                </svg>
              </div>
              <div>
                <div style="font-size: 14px; font-weight: 500; color: ${isDark ? "#f3f4f6" : "#111827"};">
                  ${order.itemsCount} items
                </div>
                <div style="font-size: 12px; color: ${isDark ? "#9ca3af" : "#6b7280"};">
                  ${order.createdAt}
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: ${isDark ? "#374151" : "#f3f4f6"}; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                🚚
              </div>
              <div>
                <div style="font-size: 14px; font-weight: 500; color: ${isDark ? "#f3f4f6" : "#111827"};">
                  Delivery Address
                </div>
                <div style="font-size: 12px; color: ${isDark ? "#9ca3af" : "#6b7280"};">
                  ${order.addressStreet}, ${order.addressCity}
                </div>
              </div>
            </div>
          </div>

          <!-- Accept Button -->
          <button id="accept-batch-${order.id}" style="width: 100%; margin-top: 20px; padding: 12px 16px; background: ${isDark ? "#10b981" : "#059669"}; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>✓</span>
            Accept Batch
          </button>
        </div>
      </div>
    `;
  } else {
    // Available order popup
    const isReelOrder = order.orderType === "reel";
    const isRestaurantOrder = order.orderType === "restaurant";

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
          icon: `<svg width="20px" height="20px" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> <style>.cls-1{fill:#c73b40;}.cls-2{fill:#d26266;}.cls-3{fill:#ffff97;}.cls-4{fill:#ffffac;}.cls-5{fill:#e6e6e6;}.cls-6{fill:#eabc75;}.cls-7{fill:#fccb7e;}</style> </defs> <title></title> <g data-name="Layer 25" id="Layer_25"> <path class="cls-1" d="M53.733,20.32A1,1,0,0,0,53,20H27a1,1,0,0,0-1,1.076l1.142,14.905a1,1,0,0,0,1.57.744,4,4,0,0,1,4.682.095,1,1,0,0,0,1.206,0,3.975,3.975,0,0,1,4.794,0,1,1,0,0,0,1.206,0,3.975,3.975,0,0,1,4.794,0,1,1,0,0,0,1.206,0,4,4,0,0,1,4.682-.095,1,1,0,0,0,1.57-.744L54,21.076A1,1,0,0,0,53.733,20.32Z"></path> <path class="cls-1" d="M51.733,20.32A1,1,0,0,0,51,20H25a1,1,0,0,0-1,1.076l1.142,14.905a1,1,0,0,0,1.57.744,4,4,0,0,1,4.682.095,1,1,0,0,0,1.206,0,3.975,3.975,0,0,1,4.794,0,1,1,0,0,0,1.206,0,3.975,3.975,0,0,1,4.794,0,1,1,0,0,0,1.206,0,4,4,0,0,1,4.682-.095,1,1,0,0,0,1.57-.744L52,21.076A1,1,0,0,0,51.733,20.32Z"></path> <path class="cls-2" d="M53.733,20.32A1,1,0,0,0,53,20H51a1,1,0,0,1,1,1.076L50.855,35.981a.986.986,0,0,1-.135.417,3.944,3.944,0,0,1,.565.327,1,1,0,0,0,1.57-.744L54,21.076A1,1,0,0,0,53.733,20.32Z"></path> <path class="cls-3" d="M52.432,35.086A6.015,6.015,0,0,0,46,34.821a5.97,5.97,0,0,0-6,0,5.97,5.97,0,0,0-6,0,6.019,6.019,0,0,0-6.432.265,1,1,0,0,0-.423.9l2.076,27.1a1,1,0,0,0,1,.924H49.782a1,1,0,0,0,1-.924l2.076-27.095A1,1,0,0,0,52.432,35.086Z"></path> <path class="cls-3" d="M50.432,35.086A6.015,6.015,0,0,0,44,34.821a5.97,5.97,0,0,0-6,0,5.97,5.97,0,0,0-6,0,6.019,6.019,0,0,0-6.432.265,1,1,0,0,0-.423.9l2.076,27.1a1,1,0,0,0,1,.924H47.782a1,1,0,0,0,1-.924l2.076-27.095A1,1,0,0,0,50.432,35.086Z"></path> <path class="cls-4" d="M52.432,35.086a6.016,6.016,0,0,0-4.4-.979,5.948,5.948,0,0,1,2.4.979,1,1,0,0,1,.423.9l-2.076,27.1a1,1,0,0,1-1,.924h2a1,1,0,0,0,1-.924l2.076-27.095A1,1,0,0,0,52.432,35.086Z"></path> <rect class="cls-5" height="18" rx="1" width="6" x="37"></rect> <rect class="cls-3" height="6" rx="1" width="32" x="24" y="16"></rect> <path class="cls-4" d="M55,16H53a1,1,0,0,1,1,1v4a1,1,0,0,1-1,1h2a1,1,0,0,0,1-1V17A1,1,0,0,0,55,16Z"></path> <path d="M35.6,56H12.4a1,1,0,0,1-.988-.844l-1.894-12A1,1,0,0,1,10.5,42H20.768a1,1,0,0,1,.717.3L24,44.9,26.515,42.3a1,1,0,0,1,.717-.3H37.5a1,1,0,0,1,.987,1.156l-1.894,12A1,1,0,0,1,35.6,56ZM13.249,54h21.5L36.33,44H27.655l-2.937,3.029a1.029,1.029,0,0,1-1.436,0L20.345,44H11.67Z"></path> <path class="cls-6" d="M19.994,18H15.987a1,1,0,0,0-1,1V37.359a1.119,1.119,0,0,0,.843.992l.1.025c.8.178,1.676.335,2.68.48.28.041.563.069.846.1l.423.043a1.032,1.032,0,0,0,.111.006,1,1,0,0,0,1-1V19A1,1,0,0,0,19.994,18Z"></path> <path class="cls-6" d="M28.006,16H24a1,1,0,0,0-1,1V38.255a1,1,0,0,0,1,1c.79,0,1.635-.033,2.656-.107h0c.357-.026.708-.068,1.059-.111l.4-.048A1,1,0,0,0,29.006,38V17A1,1,0,0,0,28.006,16Z"></path> <path class="cls-6" d="M36.019,20H32.013a1,1,0,0,0-1,1V37.348a1,1,0,0,0,1,1,1.016,1.016,0,0,0,.225-.026c.8-.184,1.6-.4,2.463-.662.556-.168,1.1-.351,1.649-.543a1,1,0,0,0,.669-.943V21A1,1,0,0,0,36.019,20Z"></path> <path class="cls-7" d="M15.987,20H11.981a1,1,0,0,0-1,1V36.19a1,1,0,0,0,.669.944c.53.185,1.063.363,1.6.526.893.271,1.714.491,2.512.674a.942.942,0,0,0,.223.025,1,1,0,0,0,1-1V21A1,1,0,0,0,15.987,20Z"></path> <path class="cls-7" d="M24,16H19.994a1,1,0,0,0-1,1V38a1,1,0,0,0,.89.994l.414.049c.33.039.661.079,1,.1h0c1.009.073,1.851.107,2.668.107a1,1,0,0,0,1.035-1V17A1,1,0,0,0,24,16Z"></path> <path class="cls-7" d="M32.013,18H28.006a1,1,0,0,0-1,1V38a1,1,0,0,0,1,1,1.014,1.014,0,0,0,.11-.006l.407-.041c.274-.026.547-.053.817-.093,1-.146,1.881-.3,2.68-.48l.209-.052a1,1,0,0,0,.784-.976V19A1,1,0,0,0,32.013,18Z"></path> <path class="cls-1" d="M39.96,35.16l-1.18,7.23L36.6,55.82l-1.2,7.34a1.008,1.008,0,0,1-.99.84H13.54a1.008,1.008,0,0,1-.99-.84l-1.2-7.38L9.18,42.45,7.99,35.16a1,1,0,0,1,.22-.81,1.1,1.1,0,0,1,1.22-.26c.61.28,1.24.54,1.87.79.33.13.67.25,1.01.37.5.17,1.01.34,1.52.5.85.25,1.63.46,2.38.63a.527.527,0,0,0,.12.03c.79.18,1.62.33,2.57.47.25.03.5.06.75.08l.89.1c.3.03.6.07.9.09a30.774,30.774,0,0,0,5.08,0c.32-.02.64-.06.96-.1l.85-.09c.24-.02.48-.05.72-.08.96-.14,1.79-.29,2.54-.46l.21-.05c.74-.17,1.5-.38,2.32-.62.53-.16,1.05-.34,1.57-.52.32-.11.65-.23.97-.35.63-.25,1.25-.51,1.86-.79a.99.99,0,0,1,.42-.09h.04a1.011,1.011,0,0,1,.76.35A1,1,0,0,1,39.96,35.16Z"></path> <path class="cls-2" d="M39.74,34.35a1.011,1.011,0,0,0-.76-.35h-.04a.99.99,0,0,0-.42.09c-.246.113-.5.211-.749.318a.992.992,0,0,1,.189.752l-1.18,7.23L34.6,55.82l-1.2,7.34a1.008,1.008,0,0,1-.99.84h2a1.008,1.008,0,0,0,.99-.84l1.2-7.34,2.18-13.43,1.18-7.23A1,1,0,0,0,39.74,34.35Z"></path> <path class="cls-3" d="M38.78,42.39,36.6,55.82a1.081,1.081,0,0,1-.59.18H11.99a1.033,1.033,0,0,1-.64-.22L9.18,42.45a.3.3,0,0,1,.07-.1,1.037,1.037,0,0,1,.78-.35H20.66a1.07,1.07,0,0,1,.74.3L24,44.9l2.6-2.6a1.07,1.07,0,0,1,.74-.3H37.97a1.037,1.037,0,0,1,.78.35A.138.138,0,0,1,38.78,42.39Z"></path> <path class="cls-4" d="M38.75,42.35a1.037,1.037,0,0,0-.78-.35h-2a1.037,1.037,0,0,1,.78.35.138.138,0,0,1,.03.04L34.6,55.82a1.081,1.081,0,0,1-.59.18h2a1.081,1.081,0,0,0,.59-.18l2.18-13.43A.138.138,0,0,0,38.75,42.35Z"></path> </g> </g></svg>`,
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

    return `
      <div style="min-width: 280px; max-width: 320px; background: ${isDark ? "#1f2937" : "#ffffff"}; border-radius: 12px; overflow: hidden; box-shadow: ${isDark ? "0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(75, 85, 99, 0.3)" : "0 10px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(229, 231, 235, 0.5)"};">
        <!-- Header -->
        <div style="background: ${isDark ? "#374151" : "#f9fafb"}; padding: 16px; border-bottom: 1px solid ${isDark ? "#4b5563" : "#e5e7eb"};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 500; color: ${isDark ? "#9ca3af" : "#6b7280"}; text-transform: uppercase; letter-spacing: 0.5px;">
              Order #${order.id.slice(-6)}
            </span>
            <span style="font-size: 18px; font-weight: 700; color: ${orderConfig.color};">
              ${formatCurrencySync(parseFloat(order.estimatedEarnings || order.total || "0"))}
            </span>
          </div>
          
          <!-- Order Type Badge -->
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 6px; background: ${orderConfig.bgColor}; color: ${orderConfig.color}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
            <span>${orderConfig.icon}</span>
            ${orderConfig.label}
          </div>

          <div style="font-size: 16px; font-weight: 600; color: ${isDark ? "#f3f4f6" : "#111827"}; margin-bottom: 4px;">
            ${isReelOrder ? order.reel?.title || "Reel Order" : order.shopName}
          </div>
          <div style="font-size: 14px; color: ${isDark ? "#9ca3af" : "#6b7280"};">
            ${isReelOrder ? `From: ${order.customerName || "Reel Creator"}` : order.shopAddress}
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 16px;">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: ${isDark ? "#374151" : "#f3f4f6"}; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                ${orderConfig.icon}
              </div>
              <div>
                <div style="font-size: 14px; font-weight: 500; color: ${isDark ? "#f3f4f6" : "#111827"};">
                  ${order.items || "N/A"} items
                </div>
                <div style="font-size: 12px; color: ${isDark ? "#9ca3af" : "#6b7280"};">
                  ${order.createdAt}
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: ${isDark ? "#374151" : "#f3f4f6"}; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                🚚
              </div>
              <div>
                <div style="font-size: 14px; font-weight: 500; color: ${isDark ? "#f3f4f6" : "#111827"};">
                  Delivery Address
                </div>
                <div style="font-size: 12px; color: ${isDark ? "#9ca3af" : "#6b7280"};">
                  ${order.customerAddress}
                </div>
              </div>
            </div>

            ${isReelOrder && order.deliveryNote ? `
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: ${isDark ? "#374151" : "#f3f4f6"}; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                  📝
                </div>
                <div>
                  <div style="font-size: 14px; font-weight: 500; color: ${isDark ? "#f3f4f6" : "#111827"};">
                    Delivery Note
                  </div>
                  <div style="font-size: 12px; color: ${isDark ? "#9ca3af" : "#6b7280"};">
                    ${order.deliveryNote}
                  </div>
                </div>
              </div>
            ` : ""}
          </div>

          <!-- Accept Button -->
          <button id="accept-batch-${order.id}" style="width: 100%; margin-top: 20px; padding: 12px 16px; background: ${orderConfig.buttonColor}; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>✓</span>
            Accept Batch
          </button>
        </div>
      </div>
    `;
  }
};

/**
 * Add CSS for dark theme popup styling
 */
export const addDarkThemePopupStyles = (theme: "light" | "dark") => {
  if (typeof document === "undefined") return;
  const existingStyle = document.getElementById("leaflet-dark-popup-styles");
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement("style");
  style.id = "leaflet-dark-popup-styles";
  style.textContent = `
    /* Override Leaflet's default popup styles with maximum specificity */
    .leaflet-popup-content-wrapper,
    .leaflet-popup-content-wrapper.dark-theme-popup,
    .leaflet-popup-content-wrapper.dark-theme-popup:before,
    .leaflet-popup-content-wrapper.dark-theme-popup:after,
    div.leaflet-popup-content-wrapper,
    div.leaflet-popup-content-wrapper.dark-theme-popup {
      background: #1f2937 !important;
      color: #f3f4f6 !important;
      border: 1px solid #4b5563 !important;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(75, 85, 99, 0.3) !important;
    }
    
    .leaflet-popup-content,
    .leaflet-popup-content-wrapper.dark-theme-popup .leaflet-popup-content,
    .leaflet-popup-content-wrapper.dark-theme-popup .leaflet-popup-content *,
    div.leaflet-popup-content {
      background: transparent !important;
      color: #f3f4f6 !important;
      margin: 0 !important;
    }
    
    .leaflet-popup-tip,
    .leaflet-popup-tip.dark-theme-popup,
    .leaflet-popup-tip.dark-theme-popup:before,
    .leaflet-popup-tip.dark-theme-popup:after,
    div.leaflet-popup-tip,
    div.leaflet-popup-tip.dark-theme-popup {
      background: #1f2937 !important;
      border: 1px solid #4b5563 !important;
    }
    
    .leaflet-popup-close-button,
    .leaflet-popup-close-button.dark-theme-popup {
      color: #9ca3af !important;
      font-size: 18px !important;
      padding: 4px !important;
      background: transparent !important;
    }
    
    .leaflet-popup-close-button:hover,
    .leaflet-popup-close-button.dark-theme-popup:hover {
      color: #f3f4f6 !important;
      background: rgba(75, 85, 99, 0.3) !important;
    }

    /* Ensure all popup content inherits dark theme */
    .leaflet-popup-content-wrapper * {
      color: inherit !important;
    }
    
    /* Force button styling */
    .leaflet-popup-content button {
      background: #10b981 !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 12px 16px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
    }
    
    .leaflet-popup-content button:hover {
      background: #059669 !important;
      transform: translateY(-1px) !important;
    }
  `;

  document.head.appendChild(style);

  // Add additional global override for dark theme
  const globalStyle = document.createElement("style");
  globalStyle.id = "leaflet-global-dark-override";
  globalStyle.textContent = `
    /* Global dark theme override for all Leaflet popups when dark theme is active */
    body.dark .leaflet-popup-content-wrapper {
      background: #1f2937 !important;
      color: #f3f4f6 !important;
      border: 1px solid #4b5563 !important;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(75, 85, 99, 0.3) !important;
    }
    
    body.dark .leaflet-popup-content {
      background: transparent !important;
      color: #f3f4f6 !important;
    }
    
    body.dark .leaflet-popup-tip {
      background: #1f2937 !important;
      border: 1px solid #4b5563 !important;
    }
    
    body.dark .leaflet-popup-content button {
      background: #10b981 !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 12px 16px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
    }
    
    body.dark .leaflet-popup-content button:hover {
      background: #059669 !important;
      transform: translateY(-1px) !important;
    }
  `;
  document.head.appendChild(globalStyle);
};

/**
 * Force apply dark theme styles to popup elements
 */
export const forceApplyDarkThemeStyles = (popupElement: HTMLElement) => {
  if (!popupElement) return;

  const wrapper = popupElement.closest(".leaflet-popup-content-wrapper");
  const tip = popupElement.closest(".leaflet-popup-tip");
  const closeButton = popupElement.querySelector(".leaflet-popup-close-button");
  const content = popupElement.querySelector(".leaflet-popup-content");

  if (wrapper) {
    wrapper.classList.add("dark-theme-popup");
    const wrapperEl = wrapper as HTMLElement;
    wrapperEl.style.setProperty("background", "#1f2937", "important");
    wrapperEl.style.setProperty("color", "#f3f4f6", "important");
    wrapperEl.style.setProperty("border", "1px solid #4b5563", "important");
    wrapperEl.style.setProperty("box-shadow", "0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(75, 85, 99, 0.3)", "important");
  }

  if (content) {
    const contentEl = content as HTMLElement;
    contentEl.style.setProperty("background", "transparent", "important");
    contentEl.style.setProperty("color", "#f3f4f6", "important");
    contentEl.style.setProperty("margin", "0", "important");

    contentEl.querySelectorAll("*").forEach((el) => {
      const element = el as HTMLElement;
      if (!element.style.color || element.style.color === "rgb(51, 51, 51)") {
        element.style.setProperty("color", "#f3f4f6", "important");
      }
    });

    contentEl.querySelectorAll("button").forEach((btn) => {
      const button = btn as HTMLElement;
      button.style.setProperty("background", "#10b981", "important");
      button.style.setProperty("color", "white", "important");
      button.style.setProperty("border", "none", "important");
      button.style.setProperty("border-radius", "8px", "important");
      button.style.setProperty("padding", "12px 16px", "important");
      button.style.setProperty("font-size", "14px", "important");
      button.style.setProperty("font-weight", "600", "important");
      button.style.setProperty("cursor", "pointer", "important");
      button.style.setProperty("transition", "all 0.2s ease", "important");
      button.style.setProperty("display", "flex", "important");
      button.style.setProperty("align-items", "center", "important");
      button.style.setProperty("justify-content", "center", "important");
      button.style.setProperty("gap", "8px", "important");
    });
  }

  if (tip) {
    tip.classList.add("dark-theme-popup");
    const tipEl = tip as HTMLElement;
    tipEl.style.setProperty("background", "#1f2937", "important");
    tipEl.style.setProperty("border", "1px solid #4b5563", "important");
  }

  if (closeButton) {
    closeButton.classList.add("dark-theme-popup");
    const closeBtn = closeButton as HTMLElement;
    closeBtn.style.setProperty("color", "#9ca3af", "important");
    closeBtn.style.setProperty("background", "transparent", "important");
  }
};
