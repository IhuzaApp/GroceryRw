import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const SEARCH_ALL_PRODUCTS = gql`
 query SearchAllProducts($keyword: String!, $shopKeyword: String!) {
  Products(where: {is_active: {_eq: true}, ProductName: {name: {_ilike: $keyword}}, Shop: {name: {_ilike: $shopKeyword}}}) {
    id
    final_price
    shop_id
    Shop {
      id
      name
      latitude
      longitude
      address
      image
      description
      operating_hours
      logo
      phone
      tin
      ssd
    }
    ProductName {
      name
      description
      barcode
      create_at
      image
      sku
      Products {
        created_at
        final_price
        measurement_unit
        quantity
        sku
        Shop {
          id
          image
          latitude
          logo
          name
        }
      }
    }
    category
    price
    measurement_unit
    productName_id
    quantity
    sku
    shop_id
  }
  restaurant_menu(where: {is_active: {_eq: true}, dishes: {name: {_ilike: $keyword}}, Restaurants: {name: {_ilike: $shopKeyword}}}) {
    price
    Restaurants {
      id
      name
      lat
      long
      email
      is_active
      location
      logo
      phone
      profile
      ussd
    }
    dishes {
      name
      description
      category
      ingredients
    }
    SKU
    discount
    image
    preparingTime
    promo
    promo_type
    promotion_id
    quantity
    product_id
    restaurant_id
    updated_at
  }
  business_stores(where: {is_active: {_eq: true}, name: {_ilike: $shopKeyword}}) {
    id
    name
    latitude
    longitude
    PlasBusinessProductsOrSerives(where: {_or: [{status: {_ilike: "%active%"}}, {status: {_is_null: true}}], name: {_ilike: $keyword}}) {
      id
      name
      price
      Description
      category
      minimumOrders
      maxOrders
      Image
      BusinessProductRatings {
        comment
        created_at
        feedback
        product_id
        ratings
        user_id
      }
      enabled
      delveryArea
      is_service
      status
    }
    Category {
      id
      image
      is_active
      description
      name
    }
    address
    category_id
    business_id
    description
  }
  dishes {
    description
    created_at
    category
    image
    ingredients
    name
    restaurant_menus {
      SKU
      created_at
      discount
      dish_id
      image
      price
      promo
      promo_type
      promotion_id
      quantity
      restaurant_id
      updated_at
      product_id
      preparingTime
    }
    update_at
  }
}

`;

const SEARCH_ALL_STORES = gql`
  query SearchAllStores($keyword: String!) {
  Shops(where: {is_active: {_eq: true}, name: {_ilike: $keyword}}, limit: 40) {
    id
    name
    description
    address
    operating_hours
    phone
    latitude
    longitude
    Category {
      name
      created_at
      description
      image
    }
    Orders {
      Ratings {
        rating
        review
      }
      assigned_at
      applied_promotions
      OrderID
    }
    ssd
    tin
    image
  }
  Restaurants(where: {is_active: {_eq: true}, name: {_ilike: $keyword}}, limit: 40) {
    id
    name
    location
    profile
    phone
    email
    lat
    long
    tin
    ussd
    logo
  }
  business_stores(where: {is_active: {_eq: true}, name: {_ilike: $keyword}}, limit: 60) {
    id
    name
    description
    address
    operating_hours
    latitude
    longitude
    Category {
      name
      description
      image
      is_active
    }
    category_id
    business_account {
      account_type
      business_email
      business_location
      business_phone
      business_name
    }
  }
  Categories {
    is_active
    name
    image
    id
    description
    created_at
    business_stores {
      name
    }
    Shops {
      name
    }
  }
}

`;

const GET_ADDRESSES = gql`
  query GetAddresses($user_id: uuid!) {
    Addresses(where: { user_id: { _eq: $user_id } }) {
      id
      street
      city
      postal_code
      is_default
      latitude
      longitude
    }
  }
`;

const GET_PAYMENT_METHODS = gql`
  query GetPaymentMethods($user_id: uuid!) {
    Payment_Methods(where: { user_id: { _eq: $user_id } }) {
      id
      method
      names
      number
      is_default
    }
    personalWallet(where: { user_id: { _eq: $user_id } }) {
      balance
    }
    Refunds(where: { user_id: { _eq: $user_id }, paid: { _eq: false } }) {
      id
      amount
    }
  }
`;

const GET_SYSTEM_CONFIG = gql`
  query GetSystemConfig {
    system_configuration {
      baseDeliveryFee
      serviceFee
      shoppingTime
      unitsSurcharge
      extraUnits
      cappedDistanceFee
      distanceSurcharge
      currency
    }
  }
`;

const GET_CART_WITH_ITEMS = gql`
  query GetCartWithItems($user_id: uuid!, $shop_id: uuid!) {
    Carts(where: {user_id: {_eq: $user_id}, shop_id: {_eq: $shop_id}, is_active: {_eq: true}}, limit: 1) {
      id
      Cart_Items {
        product_id
        quantity
        price
        Product {
          price
          final_price
        }
      }
      Shop {
        id
        name
        latitude
        longitude
      }
    }
  }
`;

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action, params } = req.body;
    console.log(`[AI Search API] Received action: ${action}`, params);

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    if (action === "search_products") {
      const keyword = `%${params.keyword || ""}%`;
      const shopKeyword = `%${params.store_name || ""}%`;
      const maxPrice = params.max_price ? Number(params.max_price) : null;
      console.log(`[AI Search API] Searching products keyword: ${keyword}, shop: ${shopKeyword}, maxPrice: ${maxPrice}`);

      const result = await hasuraClient.request<any>(SEARCH_ALL_PRODUCTS, { keyword, shopKeyword });

      // Combine all product sources
      let formattedProducts: any[] = [];

      // 1. Regular Shops Products
      (result.Products || []).forEach((p: any) => {
        formattedProducts.push({
          source: "Shop",
          name: p.ProductName?.name || "Unknown Product",
          price: p.final_price,
          description: p.ProductName?.description || "",
          store_name: p.Shop?.name || "Unknown Shop",
          image: p.Shop?.image || p.Shop?.logo,
          category: p.category,
          // Opaque payload for add_to_cart - AI must pass this EXACTLY
          ordering_payload: JSON.stringify({
            item_source: "Shop",
            shopId: p.shop_id,
            productId: p.id
          })
        });
      });

      // 2. Restaurant Menus
      (result.restaurant_menu || []).forEach((m: any) => {
        formattedProducts.push({
          source: "Restaurant",
          name: m.dishes?.name || "Unknown Dish",
          price: m.price,
          description: m.dishes?.description || "",
          store_name: m.Restaurants?.name || "Unknown Restaurant",
          image: m.image || m.Restaurants?.logo,
          category: m.dishes?.category,
          // Opaque payload for add_to_cart - AI must pass this EXACTLY
          ordering_payload: JSON.stringify({
            item_source: "Restaurant",
            restaurant_payload: {
              id: m.Restaurants?.id,
              name: m.Restaurants?.name,
              profile: m.Restaurants?.profile || m.Restaurants?.logo,
              lat: m.Restaurants?.lat,
              long: m.Restaurants?.long
            },
            dish_payload: {
              id: m.product_id,
              name: m.dishes?.name,
              description: m.dishes?.description,
              price: m.price,
              image: m.image,
              category: m.dishes?.category,
              promo: m.promo,
              promo_type: m.promo_type,
              discount: m.discount,
              ingredients: m.dishes?.ingredients,
              preparingTime: m.preparingTime
            }
          })
        });
      });

      // 3. Business Stores + nested Services
      (result.business_stores || []).forEach((store: any) => {
        (store.PlasBusinessProductsOrSerives || []).forEach((s: any) => {
          formattedProducts.push({
            source: "BusinessStore",
            name: s.name,
            price: s.price,
            description: s.Description || "",
            store_name: store.name || "Unknown Store",
            image: s.Image || store.Category?.image,
            category: s.category,
            // Opaque payload for add_to_cart - AI must pass this EXACTLY
            ordering_payload: JSON.stringify({
              item_source: "Shop",
              shopId: store.id,
              productId: s.id
            })
          });
        });
      });

      console.log(`[AI Search API] Combined raw products matched: ${formattedProducts.length}`);

      // Filter by max price locally
      if (maxPrice) {
        formattedProducts = formattedProducts.filter((p: any) => {
          const numPrice = Number(String(p.price).replace(/[^0-9.-]+/g, ""));
          return !isNaN(numPrice) && numPrice <= maxPrice;
        });
        console.log(`[AI Search API] After budget filter (<= ${maxPrice}): ${formattedProducts.length}`);
      }

      // FINAL SANITATION: Truncate large Base64 and flatten objects to prevent AI context bloat
      const sanitize = (list: any[]) => list.map(item => {
        const out: any = {};
        for (const k in item) {
          let v = item[k];
          if (v === null || v === undefined) { out[k] = ""; continue; }
          
          // Don't touch ordering_payload - it must be passed exactly
          if (k === "ordering_payload") {
            out[k] = v;
            continue;
          }

          if (typeof v === "object") { try { v = JSON.stringify(v); } catch(e) { v = "[Object]"; } }
          
          if (typeof v === "string" && v.length > 2000) {
            // Only replace with image placeholder if it's likely an image field
            if (k.toLowerCase().includes("image") || k.toLowerCase().includes("logo") || k.toLowerCase().includes("profile")) {
              v = "/images/groceryPlaceholder.png";
            } else {
              // Otherwise just truncate
              v = v.substring(0, 1000) + "... (truncated)";
            }
          }
          out[k] = v;
        }
        return out;
      });

      const finalResults = sanitize(formattedProducts.slice(0, 15));
      console.log(`[AI Search API] Returning ${finalResults.length} sanitized items to AI`);
      return res.status(200).json({ results: finalResults });

    } else if (action === "search_stores") {
      const keyword = `%${params.keyword || ""}%`;
      console.log(`[AI Search API] Searching ALL stores with keyword: ${keyword}`);

      const result = await hasuraClient.request<any>(SEARCH_ALL_STORES, { keyword });

      let allStores: any[] = [];
      (result.Shops || []).forEach((s: any) => {
        // Extract ratings logic
        let reviews: any[] = [];
        let totalRating = 0;
        let ratingCount = 0;
        if (s.Orders && s.Orders.length > 0) {
          s.Orders.forEach((o: any) => {
            if (o.Ratings && o.Ratings.length > 0) {
              o.Ratings.forEach((r: any) => {
                if (r.review) reviews.push(r.review);
                totalRating += Number(r.rating || 0);
                ratingCount++;
              });
            }
          });
        }
        const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "No rating";

        allStores.push({
          type: "Shop",
          id: s.id,
          name: s.name,
          description: s.description,
          address: s.address,
          category: s.Category?.name,
          phone: s.phone,
          operating_hours: s.operating_hours,
          latitude: s.latitude,
          longitude: s.longitude,
          average_rating: avgRating,
          recent_reviews: reviews.slice(0, 3),
          image: s.image || s.Category?.image
        });
      });

      (result.Restaurants || []).forEach((r: any) => allStores.push({ type: "Restaurant", id: r.id, name: r.name, location: r.location, description: r.profile, phone: r.phone, email: r.email, latitude: r.lat, longitude: r.long, image: r.logo }));
      (result.business_stores || []).forEach((bs: any) => allStores.push({ type: "Business", id: bs.id, name: bs.name, description: bs.description, address: bs.address, category: bs.Category?.name, operating_hours: bs.operating_hours, latitude: bs.latitude, longitude: bs.longitude, image: bs.Category?.image }));
      // Sanitation for store results too
      const sanitize = (list: any[]) => list.map(item => {
        const out: any = {};
        for (const k in item) {
          let v = item[k];
          if (v === null || v === undefined) { out[k] = ""; continue; }
          if (typeof v === "object") { try { v = JSON.stringify(v); } catch(e) { v = "[Object]"; } }
          
          if (typeof v === "string" && v.length > 2000) {
            if (k.toLowerCase().includes("image") || k.toLowerCase().includes("logo") || k.toLowerCase().includes("profile")) {
              v = "/images/groceryPlaceholder.png";
            } else {
              v = v.substring(0, 1000) + "... (truncated)";
            }
          }
          out[k] = v;
        }
        return out;
      });

      console.log(`[AI Search API] All Stores matched: ${sanitizedStores.length}`);
      return res.status(200).json({ results: sanitizedStores });

    } else if (action === "get_user_checkout_details") {
      const session = await getServerSession(req, res, authOptions as any) as any;
      if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });
      const user_id = session.user.id;

      const [addrRes, payRes] = await Promise.all([
        hasuraClient.request<any>(GET_ADDRESSES, { user_id }),
        hasuraClient.request<any>(GET_PAYMENT_METHODS, { user_id })
      ]);

      const wallet = payRes.personalWallet?.[0];
      const refunds = payRes.Refunds || [];
      const totalRefund = refunds.reduce((sum: number, r: any) => sum + parseFloat(r.amount || "0"), 0);

      return res.status(200).json({
        addresses: addrRes.Addresses,
        payment_methods: payRes.Payment_Methods,
        wallet_balance: wallet?.balance || "0",
        refund_balance: totalRefund.toString()
      });

    } else if (action === "get_order_preview") {
      const { shop_id, address_id } = params;
      const session = await getServerSession(req, res, authOptions as any) as any;
      if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });
      const user_id = session.user.id;

      const [cartData, configData] = await Promise.all([
        hasuraClient.request<any>(GET_CART_WITH_ITEMS, { user_id, shop_id: shop_id || params.shopId }),
        hasuraClient.request<any>(GET_SYSTEM_CONFIG)
      ]);

      const cart = cartData.Carts?.[0];
      if (!cart) return res.status(400).json({ error: "No active cart found" });
      const config = configData.system_configuration?.[0];

      // Use the provided address or default from DB
      let selectedAddr = null;
      if (address_id) {
         const addrRes = await hasuraClient.request<any>(gql`query($id: uuid!) { Addresses_by_pk(id: $id) { id latitude longitude street } }`, { id: address_id });
         selectedAddr = addrRes.Addresses_by_pk;
      } else {
         const addrRes = await hasuraClient.request<any>(GET_ADDRESSES, { user_id });
         selectedAddr = addrRes.Addresses.find((a: any) => a.is_default) || addrRes.Addresses[0];
      }

      if (!selectedAddr) return res.status(400).json({ error: "No delivery address found" });

      // Calculate Subtotal
      const subtotal = cart.Cart_Items.reduce((sum: number, item: any) => sum + (parseFloat(item.price) * item.quantity), 0);
      const units = cart.Cart_Items.reduce((sum: number, item: any) => sum + item.quantity, 0);

      // Fee Logic (simplified from checkoutCard.tsx)
      const serviceFee = config ? parseInt(config.serviceFee) : 0;
      const baseDeliveryFee = config ? parseInt(config.baseDeliveryFee) : 0;
      const extraUnits = Math.max(0, units - (config ? parseInt(config.extraUnits) : 0));
      const unitsSurcharge = extraUnits * (config ? parseInt(config.unitsSurcharge) : 0);

      let distanceKm = 0;
      if (cart.Shop?.latitude && selectedAddr.latitude) {
        distanceKm = getDistanceFromLatLonInKm(
          parseFloat(cart.Shop.latitude), parseFloat(cart.Shop.longitude),
          parseFloat(selectedAddr.latitude), parseFloat(selectedAddr.longitude)
        );
      }
      const distanceSurcharge = Math.ceil(Math.max(0, distanceKm - 3)) * (config ? parseInt(config.distanceSurcharge) : 0);
      const deliveryFee = Math.min(config ? parseInt(config.cappedDistanceFee) : 2500, baseDeliveryFee + distanceSurcharge) + unitsSurcharge;

      // Pricing Token (simplified version of backend logic)
      const pricing_token = require("crypto").createHash("sha256").update(JSON.stringify({
        cart_id: cart.id, items: units, subtotal: subtotal, total_discount: 0, timestamp: Math.floor(Date.now() / 60000)
      })).digest("hex");

      return res.status(200).json({
        subtotal,
        service_fee: serviceFee,
        delivery_fee: deliveryFee,
        total: subtotal + serviceFee + deliveryFee,
        address: selectedAddr,
        pricing_token,
        shop_name: cart.Shop?.name
      });
    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (error: any) {
    console.error("AI Search Error:", error);
    return res.status(500).json({ error: "Failed to search data" });
  }
}
