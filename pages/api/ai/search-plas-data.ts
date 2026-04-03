import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

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

      const sanitizedStores = sanitize(allStores);
      console.log(`[AI Search API] All Stores matched: ${sanitizedStores.length}`);
      return res.status(200).json({ results: sanitizedStores });

    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (error: any) {
    console.error("AI Search Error:", error);
    return res.status(500).json({ error: "Failed to search data" });
  }
}
