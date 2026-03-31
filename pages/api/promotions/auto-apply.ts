import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import crypto from "crypto";

const GET_AUTO_PROMOTIONS = gql`
  query GetAutoPromotions {
    promotions(where: { status: { _eq: "active" }, promotion_scope: { _in: ["public", "all_orders"] }, code: { _eq: "" } }) {
      affects
      applies_to_id
      applies_to_type
      budget_limit
      budget_used
      buy_quantity
      code
      commission_cap
      commission_type
      commission_value
      created_at
      customer_discount_percent
      delivery_paid_by
      discount_type
      discount_value
      end_date
      end_time
      free_delivery
      funded_by
      id
      influencer_code
      influencer_id
      max_discount
      max_platform_loss
      min_order_value
      min_profit_required
      min_purchase_amount
      name
      priority
      promotion_scope
      promotion_type
      restaurant_id
      shop_id
      stacking_type
      start_date
      start_time
      status
      update_on
      usage_limit
      usage_per_customer
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cart } = req.body;

    if (!cart || !cart.cart_id) {
       return res.status(400).json({ error: "Cart data is required" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Fetch all potentially applicable auto-promotions
    const result = await hasuraClient.request<{
      promotions: any[];
    }>(GET_AUTO_PROMOTIONS);

    const activePromos = result.promotions || [];
    let subtotal_discount = 0;
    let service_fee_discount = 0;
    let delivery_fee_discount = 0;
    let promotions_applied: any[] = [];

    const now = new Date();
    const subtotal = Number(cart.subtotal || 0);
    const serviceFee = Number(cart.service_fee || 0);
    const deliveryFee = Number(cart.delivery_fee || 0);
    const totalWithFees = subtotal + serviceFee + deliveryFee;

    for (const promo of activePromos) {
      // 1. Date/Time Validation
      const startDate = new Date(`${promo.start_date}T${promo.start_time || "00:00:00"}`);
      const endDate = promo.end_date ? new Date(`${promo.end_date}T${promo.end_time || "23:59:59"}`) : null;

      if (now < startDate || (endDate && now > endDate)) continue;

      // 2. Budget Check
      const budgetLimit = parseFloat(promo.budget_limit || "0");
      if (budgetLimit > 0 && promo.budget_used >= budgetLimit) continue;

      // 3. Usage Limit Check
      const usageLimit = parseInt(promo.usage_limit || "0");
      if (usageLimit > 0 && promo.usage_count >= usageLimit) continue;

      // 4. Scope Validation
      if (promo.promotion_scope === "shop") {
        const targetShopId = promo.shop_id || promo.applies_to_id;
        if (targetShopId && cart.cart_id !== targetShopId) continue;
      }

      if (promo.promotion_scope === "restaurant") {
        const targetRestaurantId = promo.restaurant_id || promo.applies_to_id;
        if (targetRestaurantId && cart.restaurant_id !== targetRestaurantId) continue;
      }

      // 5. Min Order Value
      if (promo.min_order_value && subtotal < parseFloat(promo.min_order_value)) continue;

      // Calculation logic
      const discountValue = parseFloat(promo.discount_value || "0");
      const customerDiscountPercent = parseFloat(promo.customer_discount_percent || "0");
      const effectivePercentage = customerDiscountPercent > 0 ? customerDiscountPercent : discountValue;
      
      let currentSubtotalDiscount = 0;
      let calculationTrace = "";

      if (promo.promotion_type === "bogo") {
        const buyQty = parseInt(promo.buy_quantity || "1");
        const cartItems = cart.items || [];
        const totalQty = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        
        if (totalQty >= buyQty + 1) {
          // Simplistic BOGO: Discount the cheapest item
          const prices = cartItems.map((item: any) => parseFloat(item.price || "0")).sort((a: number, b: number) => a - b);
          currentSubtotalDiscount = prices[0] || 0;
          calculationTrace = `BOGO: Applied on cheapest item (${currentSubtotalDiscount})`;
        } else {
          calculationTrace = `BOGO: Not enough items (Need ${buyQty + 1}, have ${totalQty})`;
        }
      } else if (promo.affects === "subtotal" || promo.affects === "total") {
        const baseAmount = promo.affects === "total" ? totalWithFees : subtotal;

        if (promo.discount_type === "percentage") {
          currentSubtotalDiscount = (baseAmount * effectivePercentage) / 100;
          calculationTrace = `${promo.discount_type}: ${effectivePercentage}% of ${baseAmount} = ${currentSubtotalDiscount}`;
        } else {
          currentSubtotalDiscount = discountValue;
          calculationTrace = `${promo.discount_type}: Fixed amount ${discountValue}`;
        }
        
        if (promo.max_discount && currentSubtotalDiscount > promo.max_discount) {
          calculationTrace += ` (Capped at ${promo.max_discount})`;
          currentSubtotalDiscount = promo.max_discount;
        }
      }

      subtotal_discount += currentSubtotalDiscount;
      console.log(`[API Auto-Apply] Applied: ${promo.name || promo.id}, Trace: ${calculationTrace}`);
      if (promo.free_delivery) {
        delivery_fee_discount += cart.delivery_fee || 0;
        calculationTrace += (calculationTrace ? " + " : "") + "Free Delivery Applied";
      }

      promotions_applied.push({
        promotion_id: promo.id,
        code: promo.code,
        funded_by: promo.funded_by,
        stacking_type: promo.stacking_type,
        calculation_trace: calculationTrace,
      });

      // Handle stacking
      if (promo.stacking_type === 'exclusive') break;
    }

    const final_total = totalWithFees - (subtotal_discount + service_fee_discount + delivery_fee_discount);

    // Generate pricing token
    const pricingToken = crypto.createHash('sha256')
      .update(JSON.stringify({ 
        cart_id: cart.cart_id, 
        items: cart.items.length, 
        subtotal: cart.subtotal,
        total_discount: subtotal_discount + service_fee_discount + delivery_fee_discount,
        timestamp: Math.floor(Date.now() / 60000) // 1 minute window
      }))
      .digest('hex');

    return res.status(200).json({
      success: true,
      pricing_token: pricingToken,
      discounts: {
        subtotal_discount,
        service_fee_discount,
        delivery_fee_discount,
        total_discount: subtotal_discount + service_fee_discount + delivery_fee_discount,
        discount_breakdown: {
          subtotal: subtotal_discount,
          service_fee: service_fee_discount,
          delivery_fee: delivery_fee_discount,
        },
      },
      promotions_applied,
      final_total,
    });

  } catch (error) {
    console.error("Error in auto-apply:", error);
    return res.status(500).json({ error: "Failed to auto-apply promotions" });
  }
}
