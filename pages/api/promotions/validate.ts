import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import crypto from "crypto";

const VALIDATE_PROMOTION = gql`
  query ValidatePromotion($code: String!) {
    promotions(
      where: {
        _or: [{ code: { _eq: $code } }, { influencer_code: { _eq: $code } }]
      }
    ) {
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
    // const session = await getServerSession(req, res, authOptions);
    // Note: Promotions are often allowed for guests, but we might want to check session for usage_per_customer later

    const { code, cart } = req.body;
    const subtotal = cart?.subtotal || 0;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Promotion code is required" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Validate promotion code
    const result = await hasuraClient.request<{
      promotions: any[];
    }>(VALIDATE_PROMOTION, {
      code: code.trim().toUpperCase(),
    });

    if (!result.promotions || result.promotions.length === 0) {
      return res.status(200).json({
        valid: false,
        message: "Invalid promotion code",
      });
    }

    const promo = result.promotions[0];
    console.log(
      `[API Validate] Checking promo: ${
        promo.code || promo.influencer_code
      } (Status: ${promo.status})`
    );
    const isInfluencerCode =
      promo.influencer_code?.toUpperCase() === code.trim().toUpperCase();

    // 1. Basic Status Check
    if (promo.status !== "active") {
      return res.status(200).json({
        valid: false,
        message: "This promotion is no longer active",
      });
    }

    // 2. Date/Time Validation
    const now = new Date();
    const startDate = new Date(
      `${promo.start_date}T${promo.start_time || "00:00:00"}`
    );
    const endDate = promo.end_date
      ? new Date(`${promo.end_date}T${promo.end_time || "23:59:59"}`)
      : null;

    if (now < startDate) {
      return res.status(200).json({
        valid: false,
        message: "This promotion has not started yet",
      });
    }

    if (endDate && now > endDate) {
      return res.status(200).json({
        valid: false,
        message: "This promotion has expired",
      });
    }

    // 3. Budget & Usage Limits
    const budgetLimit = parseFloat(promo.budget_limit || "0");
    const usageLimit = parseInt(promo.usage_limit || "0");

    if (budgetLimit > 0 && promo.budget_used >= budgetLimit) {
      return res.status(200).json({
        valid: false,
        message: "This promotion budget has been exhausted",
      });
    }

    if (usageLimit > 0 && promo.usage_count >= usageLimit) {
      return res.status(200).json({
        valid: false,
        message: "This promotion usage limit has been reached",
      });
    }

    // 4. Scope Validation
    if (cart) {
      if (promo.promotion_scope === "shop") {
        const targetShopId = promo.shop_id || promo.applies_to_id;
        if (targetShopId && cart.cart_id !== targetShopId) {
          return res.status(200).json({
            valid: false,
            message: "This promotion is only valid for a specific shop",
          });
        }
      }

      if (promo.promotion_scope === "restaurant") {
        const targetRestaurantId = promo.restaurant_id || promo.applies_to_id;
        if (targetRestaurantId && cart.restaurant_id !== targetRestaurantId) {
          return res.status(200).json({
            valid: false,
            message: "This promotion is only valid for a specific restaurant",
          });
        }
      }

      // 5. Min Order Value
      if (promo.min_order_value && subtotal < promo.min_order_value) {
        return res.status(200).json({
          valid: false,
          message: `Minimum order value of ${promo.min_order_value} required for this promotion`,
        });
      }
    }

    // Calculate discounts
    let subtotalDiscount = 0;
    let serviceFeeDiscount = 0;
    let deliveryFeeDiscount = 0;
    let calculationTrace = "";

    const discountValue = parseFloat(promo.discount_value || "0");
    const customerDiscountPercent = parseFloat(
      promo.customer_discount_percent || "0"
    );

    // Effective percentage to use
    const effectivePercentage =
      customerDiscountPercent > 0 ? customerDiscountPercent : discountValue;

    // subtotal is defined at the top of the handler
    const totalWithFees =
      subtotal + (cart?.service_fee || 0) + (cart?.delivery_fee || 0);

    if (promo.promotion_type === "bogo") {
      const buyQty = parseInt(promo.buy_quantity || "1");
      const cartItems = cart.items || [];
      const totalQty = cartItems.reduce(
        (sum: number, item: any) => sum + (item.quantity || 1),
        0
      );

      if (totalQty >= buyQty + 1) {
        // Simplistic BOGO: Discount the cheapest item
        const prices = cartItems
          .map((item: any) => parseFloat(item.price || "0"))
          .sort((a: number, b: number) => a - b);
        subtotalDiscount = prices[0] || 0;
        calculationTrace = `BOGO: Applied on cheapest item (${subtotalDiscount})`;
      } else {
        calculationTrace = `BOGO: Not enough items (Need ${
          buyQty + 1
        }, have ${totalQty})`;
      }
    } else if (promo.affects === "subtotal" || promo.affects === "total") {
      const baseAmount = promo.affects === "total" ? totalWithFees : subtotal;

      if (promo.discount_type === "percentage") {
        subtotalDiscount = (baseAmount * effectivePercentage) / 100;
        calculationTrace = `${promo.discount_type}: ${effectivePercentage}% of ${baseAmount} = ${subtotalDiscount}`;
      } else {
        subtotalDiscount = discountValue;
        calculationTrace = `${promo.discount_type}: Fixed amount ${discountValue}`;
      }

      if (promo.max_discount && subtotalDiscount > promo.max_discount) {
        calculationTrace += ` (Capped at ${promo.max_discount})`;
        subtotalDiscount = promo.max_discount;
      }
    } else if (promo.affects === "delivery_fee") {
      // Handled by free_delivery flag usually or specific discount
      calculationTrace = "Delivery Fee: Handled separately";
    }

    if (promo.free_delivery) {
      deliveryFeeDiscount = cart?.delivery_fee || 0;
      calculationTrace +=
        (calculationTrace ? " + " : "") + "Free Delivery Applied";
    }

    const finalTotal =
      subtotal +
      (cart?.service_fee || 0) +
      (cart?.delivery_fee || 0) -
      (subtotalDiscount + serviceFeeDiscount + deliveryFeeDiscount);

    // Generate pricing token
    const pricingToken = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          cart_id: cart.cart_id,
          items: cart.items.length,
          subtotal: cart.subtotal,
          total_discount:
            subtotalDiscount + serviceFeeDiscount + deliveryFeeDiscount,
          timestamp: Math.floor(Date.now() / 60000), // 1 minute window
        })
      )
      .digest("hex");

    return res.status(200).json({
      valid: true,
      message: "Promotion applied successfully!",
      is_influencer: isInfluencerCode,
      pricing_token: pricingToken,
      final_total: finalTotal,
      discounts: {
        subtotal_discount: subtotalDiscount,
        service_fee_discount: serviceFeeDiscount,
        delivery_fee_discount: deliveryFeeDiscount,
        total_discount:
          subtotalDiscount + serviceFeeDiscount + deliveryFeeDiscount,
        discount_breakdown: {
          subtotal: subtotalDiscount,
          service_fee: serviceFeeDiscount,
          delivery_fee: deliveryFeeDiscount,
        },
      },
      promotions_applied: [
        {
          promotion_id: promo.id,
          code: promo.code,
          influencer_id: isInfluencerCode ? promo.influencer_id : null,
          funded_by: promo.funded_by,
          stacking_type: promo.stacking_type,
          calculation_trace: calculationTrace,
        },
      ],
    });
  } catch (error) {
    console.error("[API Validate] Error:", error);
    return res.status(500).json({ error: "Failed to validate promotion" });
  }
}
