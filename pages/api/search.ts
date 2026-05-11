import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../src/lib/hasuraClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { q: query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ message: "Query parameter is required" });
  }

  try {
    const searchTerm = `%${query}%`;
    const results: any[] = [];

    if (!hasuraClient) {
      throw new Error("Hasura client not initialized");
    }

    // Search products
    const productsQuery = `
      query SearchProducts($searchTerm: String!) {
        Products(where: {_or: [{ProductName: {name: {_ilike: $searchTerm}}}, {ProductName: {description: {_ilike: $searchTerm}}}]}) {
          id
          ProductName {
            name
            description
          }
          price
          final_price
          image
          Shop {
            id
            name
          }
        }
      }
    `;

    const productsResponse = (await hasuraClient.request(productsQuery, {
      searchTerm,
    })) as any;
    const products = productsResponse.Products.map((product: any) => ({
      ...product,
      name: product.ProductName?.name || product.name,
      description: product.ProductName?.description || product.description,
      type: "product",
      shop_name: product.Shop?.name,
      shop_id: product.Shop?.id,
      image_url: product.image,
      price: product.final_price || product.price,
    }));

    results.push(...products);

    // Search shops
    const shopsQuery = `
      query SearchShops($searchTerm: String!) {
        Shops(where: {_or: [{name: {_ilike: $searchTerm}}, {description: {_ilike: $searchTerm}}]}) {
          id
          name
          description
          address
          image
        }
      }
    `;

    const shopsResponse = (await hasuraClient.request(shopsQuery, {
      searchTerm,
    })) as any;
    const shops = shopsResponse.Shops.map((shop: any) => ({
      ...shop,
      type: "shop",
      image_url: shop.image,
    }));
    results.push(...shops);

    // Search restaurants
    const restaurantsQuery = `
      query SearchRestaurants($searchTerm: String!) {
        Restaurants(where: {_or: [{name: {_ilike: $searchTerm}}, {location: {_ilike: $searchTerm}}]}) {
          id
          name
          location
          profile
          verified
        }
      }
    `;

    const restaurantsResponse = (await hasuraClient.request(restaurantsQuery, {
      searchTerm,
    })) as any;
    const restaurants = restaurantsResponse.Restaurants.map((res: any) => ({
      ...res,
      type: "restaurant",
      image_url: res.profile,
      address: res.location,
    }));
    results.push(...restaurants);

    // Search Pets
    const petsQuery = `
      query SearchPets($searchTerm: String!) {
        pets(where: {_or: [{name: {_ilike: $searchTerm}}, {breed: {_ilike: $searchTerm}}, {story: {_ilike: $searchTerm}}]}) {
          id
          name
          breed
          story
          image
          pet_type
        }
      }
    `;

    const petsResponse = (await hasuraClient.request(petsQuery, {
      searchTerm,
    })) as any;
    const pets = petsResponse.pets.map((pet: any) => ({
      ...pet,
      type: "pet",
      image_url: pet.image,
      description: `${pet.breed} - ${pet.story}`,
    }));
    results.push(...pets);

    // Search Vehicles
    const vehiclesQuery = `
      query SearchVehicles($searchTerm: String!) {
        RentalVehicles(where: {_or: [{name: {_ilike: $searchTerm}}, {category: {_ilike: $searchTerm}}, {location: {_ilike: $searchTerm}}], _and: [{disabled: {_eq: false}}, {status: {_eq: "active"}}]}) {
          id
          name
          category
          location
          main_photo
          price
        }
      }
    `;

    const vehiclesResponse = (await hasuraClient.request(vehiclesQuery, {
      searchTerm,
    })) as any;
    const vehicles = vehiclesResponse.RentalVehicles.map((v: any) => ({
      ...v,
      type: "vehicle",
      image_url: v.main_photo,
      description: v.category,
      address: v.location,
    }));
    results.push(...vehicles);

    // Search Business Services & Products
    const bizItemsQuery = `
      query SearchBizItems($searchTerm: String!) {
        PlasBusinessProductsOrSerive(where: {_or: [{name: {_ilike: $searchTerm}}, {Description: {_ilike: $searchTerm}}]}) {
          id
          name
          Description
          Image
          price
          store_id
        }
      }
    `;

    const bizItemsResponse = (await hasuraClient.request(bizItemsQuery, {
      searchTerm,
    })) as any;
    const bizItems = bizItemsResponse.PlasBusinessProductsOrSerive.map((item: any) => ({
      ...item,
      type: item.store_id ? "business_product" : "service",
      image_url: item.Image,
      description: item.Description,
    }));
    results.push(...bizItems);

    // Search RFQs
    const rfqsQuery = `
      query SearchRFQs($searchTerm: String!) {
        bussines_RFQ(where: {_or: [{title: {_ilike: $searchTerm}}, {description: {_ilike: $searchTerm}}], _and: [{open: {_eq: true}}]}) {
          id
          title
          description
          location
          category
        }
      }
    `;

    const rfqsResponse = (await hasuraClient.request(rfqsQuery, {
      searchTerm,
    })) as any;
    const rfqs = rfqsResponse.bussines_RFQ.map((rfq: any) => ({
      ...rfq,
      name: rfq.title,
      type: "rfq",
      description: rfq.description,
      address: rfq.location,
    }));
    results.push(...rfqs);

    // Search Reels
    const reelsQuery = `
      query SearchReels($searchTerm: String!) {
        Reels(where: {_or: [{title: {_ilike: $searchTerm}}, {description: {_ilike: $searchTerm}}]}) {
          id
          title
          description
          video_url
          User {
            name
            profile_picture
          }
        }
      }
    `;

    const reelsResponse = (await hasuraClient.request(reelsQuery, {
      searchTerm,
    })) as any;
    const reels = reelsResponse.Reels.map((reel: any) => ({
      ...reel,
      name: reel.title,
      type: "reel",
      description: reel.description,
      image_url: reel.User?.profile_picture,
    }));
    results.push(...reels);

    // Search recipes using TheMealDB API
    try {
      const recipesResponse = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
          query
        )}`
      );
      const recipesData = await recipesResponse.json();

      if (recipesData.meals) {
        const recipes = recipesData.meals.map((recipe: any) => ({
          id: recipe.idMeal,
          name: recipe.strMeal,
          description: recipe.strCategory || "Recipe",
          cooking_time: recipe.strArea || "Various",
          image_url: recipe.strMealThumb,
          type: "recipe",
        }));
        results.push(...recipes);
      }
    } catch (error) {
      // If TheMealDB API fails, skip recipes
      console.log("TheMealDB API error, skipping recipes search:", error);
    }

    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = results.sort((a, b) => {
      const aName = (a.name || a.title || "").toLowerCase();
      const bName = (b.name || b.title || "").toLowerCase();
      const searchLower = query.toLowerCase();

      const aExact = aName === searchLower;
      const bExact = bName === searchLower;

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts = aName.startsWith(searchLower);
      const bStarts = bName.startsWith(searchLower);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return 0;
    });

    return res.status(200).json({ results: sortedResults });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
