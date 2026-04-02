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
          product_id: p.id,           // UUID for add_to_cart
          shop_id: p.shop_id,         // UUID for add_to_cart
          id: p.Shop?.id,
          image: p.Shop?.image || p.Shop?.logo,
          store_name: p.Shop?.name || "Unknown Shop",
          latitude: p.Shop?.latitude,
          longitude: p.Shop?.longitude,
          name: p.ProductName?.name || "Unknown Product",
          description: p.ProductName?.description || "",
          price: p.final_price,
          category: p.category
        });
      });

      // 2. Restaurant Menus
      (result.restaurant_menu || []).forEach((m: any) => {
        formattedProducts.push({
          source: "Restaurant",
          id: m.Restaurants?.id,
          image: m.image || m.Restaurants?.logo,
          store_name: m.Restaurants?.name || "Unknown Restaurant",
          latitude: m.Restaurants?.lat,
          longitude: m.Restaurants?.long,
          name: m.dishes?.name || "Unknown Dish",
          description: m.dishes?.description || "",
          price: m.price,
          category: m.dishes?.category
        });
      });

      // 3. Business Stores + nested Services
      (result.business_stores || []).forEach((store: any) => {
        (store.PlasBusinessProductsOrSerives || []).forEach((s: any) => {
          formattedProducts.push({
            source: "BusinessStore",
            id: store.id,
            image: s.Image || store.Category?.image,
            store_name: store.name || "Unknown Store",
            latitude: store.latitude,
            longitude: store.longitude,
            name: s.name,
            description: s.Description || "",
            price: s.price,
            category: s.category
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

      // Shuffle or just return top 15 logically
      const finalResults = formattedProducts.slice(0, 15);
      console.log(`[AI Search API] Returning ${finalResults.length} items to AI`);

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
      console.log(`[AI Search API] All Stores matched: ${allStores.length}`);
      return res.status(200).json({ results: allStores });

    } else if (action === "add_to_cart") {
      const { product_id, shop_id, quantity = 1 } = params;
      if (!product_id || !shop_id) {
        return res.status(400).json({ error: "Missing product_id or shop_id" });
      }
      console.log(`[AI Cart] Adding product ${product_id} from shop ${shop_id} x${quantity}`);

      const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
      const cartRes = await fetch(`${baseUrl}/api/cart-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.cookie || "",
        },
        body: JSON.stringify({ shop_id, product_id, quantity: Number(quantity) }),
      });
      const cartData = await cartRes.json();
      if (!cartRes.ok) {
        return res.status(cartRes.status).json({ error: cartData.error || "Failed to add to cart" });
      }
      return res.status(200).json({ success: true, cart: cartData });
    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (error: any) {
    console.error("AI Search Error:", error);
    return res.status(500).json({ error: "Failed to search data" });
  }
}
