import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// GraphQL query to fetch a single order with nested details
const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($id: uuid!) {
    Orders(where: { id: { _eq: $id } }, limit: 1) {
      id
      OrderID
      placedAt: created_at
      estimatedDelivery: delivery_time
      deliveryNotes: delivery_notes
      total
      serviceFee: service_fee
      deliveryFee: delivery_fee
      status
      deliveryPhotoUrl: delivery_photo_url
      discount
      combinedOrderId: combined_order_id
      voucherCode: voucher_code
      shop_id
      pin
      shop: Shop {
        id
        name
        address
        image
        phone
        latitude
        longitude
        operating_hours
      }
      Order_Items {
        id
        product_id
        quantity
        price
        product: Product {
          id
          price
          final_price
          measurement_unit
          category
          quantity
          sku
          image
          productName_id
          ProductName {
            barcode
            create_at
            description
            id
            image
            name
            sku
          }
          created_at
          is_active
          reorder_point
          shop_id
          supplier
          updated_at
        }
        order_id
      }
      Shoppers {
        id
        name
        email
        phone
        profile_picture
        shopper {
          id
          full_name
          profile_photo
          phone_number
          address
          Employment_id
        }
        Ratings {
          created_at
          customer_id
          delivery_experience
          id
          order_id
          packaging_quality
          professionalism
          rating
          reel_order_id
          review
          reviewed_at
          shopper_id
          updated_at
        }
      }
      address: Address {
        id
        street
        city
        postal_code
        latitude
        longitude
        is_default
      }
      delivery_address_id
      shopper_id
      updated_at
      user_id
      assigned_at
      orderedBy {
        created_at
        email
        gender
        id
        is_active
        is_guest
        name
        password_hash
        profile_picture
        phone
        updated_at
        role
      }
    }
  }
`;

const GET_REEL_ORDER_DETAILS = gql`
  query GetReelOrderDetails($id: uuid!) {
    reel_orders_by_pk(id: $id) {
      id
      OrderID
      status
      created_at
      total
      service_fee
      delivery_fee
      quantity
      reel: Reel {
        id
        title
        description
        Price
        Product
        Shops {
          id
          name
          address
          image
          logo
        }
      }
      orderedBy: User {
        id
        name
        email
        profile_picture
        phone
      }
    }
  }
`;

const GET_RESTAURANT_ORDER_DETAILS = gql`
  query GetRestaurantOrderDetails($id: uuid!) {
    restaurant_orders_by_pk(id: $id) {
      id
      OrderID
      status
      created_at
      total
      delivery_fee
      restaurant_id
      Restaurant {
        id
        name
        location
        logo
      }
      orderedBy {
        id
        name
        email
        profile_picture
        phone
      }
    }
  }
`;

const GET_BUSINESS_ORDER_DETAILS = gql`
  query GetBusinessOrderDetails($id: uuid!) {
    businessProductOrders_by_pk(id: $id) {
      id
      status
      created_at
      total
      service_fee
      transportation_fee
      store_id
      business_store {
        id
        name
        image
      }
      orderedBy {
        id
        name
        email
        profile_picture
        phone
      }
    }
  }
`;

const GET_VEHICLE_BOOKING_DETAILS = gql`
  query GetVehicleBookingDetails($id: uuid!) {
    vehicleBookings_by_pk(id: $id) {
      id
      amount
      status
      pickup_date
      return_date
      customer_id
      RentalVehicles {
        id
        name
        main_photo
        category
        location
        logisticsAccounts {
          id
          fullname
          businessName
          User {
            id
            name
            profile_picture
          }
        }
      }
      orderedBy: User {
        id
        name
        email
        profile_picture
        phone
      }
    }
  }
`;

const GET_PET_ADOPTION_DETAILS = gql`
  query GetPetAdoptionDetails($id: uuid!) {
    petAdoption_by_pk(id: $id) {
      id
      status
      created_at
      amount
      pet_id
      customer_id
      address
      comment
      pets {
        id
        name
        image
        pet_vendors {
          id
          organisationName
          fullname
          user: User {
            id
            name
            profile_picture
          }
        }
      }
      orderedBy: User {
        id
        name
        email
        profile_picture
        phone
      }
    }
  }
`;

const GET_PACKAGE_DELIVERY_DETAILS = gql`
  query GetPackageDeliveryDetails($id: uuid!) {
    package_delivery_by_pk(id: $id) {
      id
      DeliveryCode
      pickupLocation
      dropoffLocation
      status
      delivery_fee
      created_at
      package_image
      receiverName
      receiverPhone
      comment
      deliveryMethod
      distance
      user_id
      shopper_id
      shopper {
        id
        full_name
        profile_photo
        Employment_id
      }
      orderedBy: User {
        id
        name
        email
        profile_picture
        phone
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id, type } = req.query;
  if (!id || (Array.isArray(id) && id.length === 0)) {
    return res.status(400).json({ error: "Missing order ID" });
  }

  const orderId = Array.isArray(id) ? id[0] : id;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(orderId)) {
    return res.status(400).json({ error: "Invalid order ID format" });
  }

  console.log(
    `[OrderDetails] Fetching details for ID: ${orderId}, Type: ${type || "all"}`
  );

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const handleRegularOrder = async (order: any) => {
      let shopperStats = null;
      if (order.Shoppers) {
        const shopperId = order.Shoppers.id;
        const GET_SHOPPER_STATS = gql`
          query GetShopperStats($shopperId: uuid!) {
            Ratings(where: { shopper_id: { _eq: $shopperId } }) {
              rating
            }
            RecentReviews: Ratings(
              where: {
                shopper_id: { _eq: $shopperId }
                _and: [
                  { review: { _is_null: false } }
                  { review: { _neq: "" } }
                ]
              }
              order_by: { reviewed_at: desc_nulls_last }
              limit: 5
            ) {
              id
              rating
              review
              reviewed_at
              customer_id
              User {
                id
                name
                profile_picture
              }
            }
            Orders_aggregate(
              where: {
                shopper_id: { _eq: $shopperId }
                status: { _eq: "delivered" }
              }
            ) {
              aggregate {
                count
              }
            }
            reel_orders_aggregate(
              where: {
                shopper_id: { _eq: $shopperId }
                status: { _eq: "delivered" }
              }
            ) {
              aggregate {
                count
              }
            }
            restaurant_orders_aggregate(
              where: {
                shopper_id: { _eq: $shopperId }
                status: { _eq: "delivered" }
              }
            ) {
              aggregate {
                count
              }
            }
          }
        `;

        const statsData = await hasuraClient.request<any>(GET_SHOPPER_STATS, {
          shopperId,
        });

        const averageRating =
          statsData.Ratings.length > 0
            ? statsData.Ratings.reduce(
                (sum: number, r: any) => sum + parseFloat(r.rating || "0"),
                0
              ) / statsData.Ratings.length
            : 0;

        const totalDeliveredOrders =
          (statsData.Orders_aggregate?.aggregate?.count || 0) +
          (statsData.reel_orders_aggregate?.aggregate?.count || 0) +
          (statsData.restaurant_orders_aggregate?.aggregate?.count || 0);

        shopperStats = {
          rating: averageRating,
          orders_aggregate: {
            aggregate: {
              count: totalDeliveredOrders,
            },
          },
          recentReviews: statsData.RecentReviews || [],
        };
      }

      const formattedOrder = {
        ...order,
        orderType: "order",
        placedAt: new Date(order.placedAt).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        assignedTo: order.Shoppers
          ? {
              ...order.Shoppers,
              rating: shopperStats?.rating || 0,
              orders_aggregate: shopperStats?.orders_aggregate || {
                aggregate: { count: 0 },
              },
              recentReviews: shopperStats?.recentReviews || [],
            }
          : null,
      };

      return res.status(200).json({ order: formattedOrder });
    };

    const handleVehicleBooking = (booking: any) => {
      const vendor = booking.RentalVehicles?.logisticsAccounts;
      const ownerUser = Array.isArray(vendor?.User)
        ? vendor.User[0]
        : vendor?.User;

      const customerUser = Array.isArray(booking.orderedBy)
        ? booking.orderedBy[0]
        : booking.orderedBy;

      const formattedBooking = {
        id: booking.id,
        OrderID: booking.id.substring(0, 8).toUpperCase(),
        placedAt: new Date(booking.pickup_date).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        total: booking.amount,
        status: booking.status,
        pickup_date: booking.pickup_date,
        return_date: booking.return_date,
        orderType: "vehicle",
        shop: {
          id: vendor?.id || "vehicle-vendor",
          name: vendor?.businessName || vendor?.fullname || "Vehicle Partner",
          image: ownerUser?.profile_picture || null,
        },
        assignedTo: ownerUser
          ? {
              id: ownerUser.id,
              name: vendor?.fullname || vendor?.businessName || "Owner",
              profile_picture: ownerUser.profile_picture || null,
              shopper: {
                full_name: vendor?.fullname || vendor?.businessName || "Owner",
                profile_photo: ownerUser.profile_picture || null,
                Employment_id: "VEHICLE",
              },
            }
          : null,
        orderedBy: customerUser || null,
        Order_Items: [
          {
            id: booking.id,
            product: {
              ProductName: {
                name: booking.RentalVehicles?.name || "Rental Vehicle",
              },
              image: booking.RentalVehicles?.main_photo,
              category: booking.RentalVehicles?.category,
              location: booking.RentalVehicles?.location,
            },
          },
        ],
      };
      return res.status(200).json({ order: formattedBooking });
    };

    const handleReelOrder = (reelOrder: any) => {
      return res.status(200).json({
        order: {
          ...reelOrder,
          orderType: "reel",
          placedAt: new Date(reelOrder.created_at).toLocaleString(),
          shop: reelOrder.reel?.Shops,
          orderedBy: reelOrder.orderedBy || null,
          Order_Items: [
            {
              id: reelOrder.id,
              product: {
                ProductName: {
                  name: reelOrder.reel?.title || "Reel Product",
                },
                image:
                  reelOrder.reel?.Shops?.image || reelOrder.reel?.Shops?.logo,
              },
            },
          ],
        },
      });
    };

    const handleRestaurantOrder = (restOrder: any) => {
      return res.status(200).json({
        order: {
          ...restOrder,
          orderType: "restaurant",
          placedAt: new Date(restOrder.created_at).toLocaleString(),
          orderedBy: restOrder.orderedBy || null,
          shop: restOrder.Restaurant
            ? {
                id: restOrder.Restaurant.id,
                name: restOrder.Restaurant.name,
                address: restOrder.Restaurant.location,
                logo: restOrder.Restaurant.logo,
              }
            : null,
        },
      });
    };

    const handleBusinessOrder = (bizOrder: any) => {
      return res.status(200).json({
        order: {
          ...bizOrder,
          orderType: "business",
          placedAt: new Date(bizOrder.created_at).toLocaleString(),
          orderedBy: bizOrder.orderedBy || null,
          shop: bizOrder.business_store,
        },
      });
    };

    const handlePetAdoption = (petAdoption: any) => {
      return res.status(200).json({
        order: {
          id: petAdoption.id,
          OrderID: petAdoption.id.substring(0, 8).toUpperCase(),
          status: petAdoption.status,
          created_at: petAdoption.created_at,
          placedAt: new Date(petAdoption.created_at).toLocaleString(),
          total: petAdoption.amount,
          orderType: "pet",
          orderedBy: petAdoption.orderedBy || null,
          shop: {
            id: petAdoption.pets?.pet_vendors?.id,
            name:
              petAdoption.pets?.pet_vendors?.organisationName ||
              petAdoption.pets?.pet_vendors?.fullname,
            image: petAdoption.pets?.pet_vendors?.user?.profile_picture,
          },
          Order_Items: [
            {
              id: petAdoption.id,
              product: {
                ProductName: {
                  name: petAdoption.pets?.name || "Pet",
                },
                image: petAdoption.pets?.image,
              },
            },
          ],
        },
      });
    };

    const handlePackageDelivery = (pkg: any) => {
      return res.status(200).json({
        order: {
          id: pkg.id,
          OrderID: pkg.DeliveryCode || pkg.id.substring(0, 8).toUpperCase(),
          status: pkg.status,
          created_at: pkg.created_at,
          placedAt: new Date(pkg.created_at).toLocaleString(),
          total: pkg.delivery_fee,
          orderType: "package",
          orderedBy: pkg.orderedBy || null,
          shop: {
            name: "Package Delivery",
            image: pkg.package_image,
          },
          assignedTo: pkg.shopper
            ? {
                id: pkg.shopper_id,
                name: pkg.shopper.full_name,
                profile_picture: pkg.shopper.profile_photo,
                shopper: pkg.shopper,
              }
            : null,
          Order_Items: [
            {
              id: pkg.id,
              product: {
                ProductName: {
                  name: `Package to ${pkg.receiverName}`,
                },
                image: pkg.package_image,
              },
            },
          ],
        },
      });
    };

    if (type) {
      const typeStr = Array.isArray(type) ? type[0] : type;
      switch (typeStr) {
        case "order": {
          const data = await hasuraClient.request<any>(GET_ORDER_DETAILS, {
            id: orderId,
          });
          if (data.Orders?.length > 0)
            return handleRegularOrder(data.Orders[0]);
          break;
        }
        case "vehicle":
        case "car": {
          const data = await hasuraClient.request<any>(
            GET_VEHICLE_BOOKING_DETAILS,
            { id: orderId }
          );
          if (data.vehicleBookings_by_pk)
            return handleVehicleBooking(data.vehicleBookings_by_pk);
          break;
        }
        case "reel": {
          const data = await hasuraClient.request<any>(GET_REEL_ORDER_DETAILS, {
            id: orderId,
          });
          if (data.reel_orders_by_pk)
            return handleReelOrder(data.reel_orders_by_pk);
          break;
        }
        case "restaurant": {
          const data = await hasuraClient.request<any>(
            GET_RESTAURANT_ORDER_DETAILS,
            { id: orderId }
          );
          if (data.restaurant_orders_by_pk)
            return handleRestaurantOrder(data.restaurant_orders_by_pk);
          break;
        }
        case "business": {
          const data = await hasuraClient.request<any>(
            GET_BUSINESS_ORDER_DETAILS,
            { id: orderId }
          );
          if (data.businessProductOrders_by_pk)
            return handleBusinessOrder(data.businessProductOrders_by_pk);
          break;
        }
        case "pet": {
          const data = await hasuraClient.request<any>(
            GET_PET_ADOPTION_DETAILS,
            { id: orderId }
          );
          if (data.petAdoption_by_pk)
            return handlePetAdoption(data.petAdoption_by_pk);
          break;
        }
        case "package": {
          const data = await hasuraClient.request<any>(
            GET_PACKAGE_DELIVERY_DETAILS,
            { id: orderId }
          );
          if (data.package_delivery_by_pk)
            return handlePackageDelivery(data.package_delivery_by_pk);
          break;
        }
      }
    }

    const data = await hasuraClient.request<any>(GET_ORDER_DETAILS, {
      id: orderId,
    });
    if (data.Orders && data.Orders.length > 0) {
      return handleRegularOrder(data.Orders[0]);
    }

    const vehicleData = await hasuraClient.request<any>(
      GET_VEHICLE_BOOKING_DETAILS,
      { id: orderId }
    );
    if (vehicleData.vehicleBookings_by_pk)
      return handleVehicleBooking(vehicleData.vehicleBookings_by_pk);

    const reelData = await hasuraClient.request<any>(GET_REEL_ORDER_DETAILS, {
      id: orderId,
    });
    if (reelData.reel_orders_by_pk)
      return handleReelOrder(reelData.reel_orders_by_pk);

    const restData = await hasuraClient.request<any>(
      GET_RESTAURANT_ORDER_DETAILS,
      { id: orderId }
    );
    if (restData.restaurant_orders_by_pk)
      return handleRestaurantOrder(restData.restaurant_orders_by_pk);

    const bizData = await hasuraClient.request<any>(
      GET_BUSINESS_ORDER_DETAILS,
      { id: orderId }
    );
    if (bizData.businessProductOrders_by_pk)
      return handleBusinessOrder(bizData.businessProductOrders_by_pk);

    const petData = await hasuraClient.request<any>(GET_PET_ADOPTION_DETAILS, {
      id: orderId,
    });
    if (petData.petAdoption_by_pk)
      return handlePetAdoption(petData.petAdoption_by_pk);

    const pkgData = await hasuraClient.request<any>(
      GET_PACKAGE_DELIVERY_DETAILS,
      { id: orderId }
    );
    if (pkgData.package_delivery_by_pk)
      return handlePackageDelivery(pkgData.package_delivery_by_pk);

    return res.status(404).json({ error: "Order or Booking not found" });
  } catch (error: any) {
    console.error("Order Details Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
}
