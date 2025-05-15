import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Fetch daily earnings for a shopper for the selected period based on delivery completion time
const GET_DAILY_EARNINGS = gql`
  query GetDailyEarnings(
    $shopper_id: uuid!
    $start_date: timestamptz!
    $end_date: timestamptz!
  ) {
    Orders(
      where: {
        shopper_id: { _eq: $shopper_id }
        status: { _eq: "delivered" }
        updated_at: { _gte: $start_date, _lte: $end_date }
      }
    ) {
      id
      service_fee
      delivery_fee
      updated_at
    }
  }
`;

interface OrdersResponse {
  Orders: Array<{
    id: string;
    service_fee: string | null;
    delivery_fee: string | null;
    updated_at: string;
  }>;
}

// Calculate date ranges for different periods
const getDateRange = (period: string) => {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();

  switch (period) {
    case "today":
      // Today (00:00 to 23:59)
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "this-week":
      // This week (Sunday to Saturday)
      const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
      startDate.setDate(now.getDate() - dayOfWeek); // Go back to Sunday
      startDate.setHours(0, 0, 0, 0);

      endDate.setTime(startDate.getTime());
      endDate.setDate(startDate.getDate() + 6); // Go forward to Saturday
      endDate.setHours(23, 59, 59, 999);
      break;

    case "last-week":
      // Last week (previous Sunday to Saturday)
      const lastWeekDay = now.getDay();
      startDate.setDate(now.getDate() - lastWeekDay - 7); // Go back to previous Sunday
      startDate.setHours(0, 0, 0, 0);

      endDate.setTime(startDate.getTime());
      endDate.setDate(startDate.getDate() + 6); // Go forward to previous Saturday
      endDate.setHours(23, 59, 59, 999);
      break;

    case "this-month":
      // This month (1st day to last day)
      startDate.setDate(1); // First day of current month
      startDate.setHours(0, 0, 0, 0);

      endDate.setMonth(now.getMonth() + 1, 0); // Last day of current month
      endDate.setHours(23, 59, 59, 999);
      break;

    case "last-month":
      // Last month (1st day to last day of previous month)
      startDate.setMonth(now.getMonth() - 1, 1); // First day of previous month
      startDate.setHours(0, 0, 0, 0);

      endDate.setDate(0); // Last day of previous month
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      // Default to this week
      const defaultDayOfWeek = now.getDay();
      startDate.setDate(now.getDate() - defaultDayOfWeek);
      startDate.setHours(0, 0, 0, 0);

      endDate.setTime(startDate.getTime());
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
};

// Calculate total earnings from an order (service fee + delivery fee)
const calculateOrderEarnings = (order: OrdersResponse["Orders"][0]): number => {
  const serviceFee = parseFloat(order.service_fee || "0");
  const deliveryFee = parseFloat(order.delivery_fee || "0");
  return serviceFee + deliveryFee;
};

// Format data for different period types
const formatEarningsData = (
  orders: OrdersResponse["Orders"],
  period: string
) => {
  // For 'today', we show hourly data
  if (period === "today") {
    const hourlyEarningsMap = new Map<number, number>();

    // Initialize all hours with zero earnings
    for (let i = 0; i < 24; i++) {
      hourlyEarningsMap.set(i, 0);
    }

    // Aggregate earnings by hour
    orders.forEach((order) => {
      const orderDate = new Date(order.updated_at);
      const hourIndex = orderDate.getHours();

      const orderEarnings = calculateOrderEarnings(order);

      const currentTotal = hourlyEarningsMap.get(hourIndex) || 0;
      hourlyEarningsMap.set(hourIndex, currentTotal + orderEarnings);
    });

    // Format for display - only include hours with data or important hours
    return Array.from(hourlyEarningsMap.entries())
      .filter(([hour, earnings]) => hour % 3 === 0 || earnings > 0) // Show every 3rd hour or hours with earnings
      .map(([hour, earnings]) => ({
        day: `${hour}:00`,
        earnings,
      }))
      .sort((a, b) => {
        // Sort by hour
        return parseInt(a.day) - parseInt(b.day);
      });
  }

  // For 'this-week' or 'last-week', we show daily data
  else if (period === "this-week" || period === "last-week") {
    const dailyEarningsMap = new Map<number, number>();

    // Initialize all days of the week with zero earnings
    for (let i = 0; i < 7; i++) {
      dailyEarningsMap.set(i, 0);
    }

    // Aggregate earnings by day
    orders.forEach((order) => {
      const orderDate = new Date(order.updated_at);
      const dayIndex = orderDate.getDay(); // 0 = Sunday, 6 = Saturday

      const orderEarnings = calculateOrderEarnings(order);

      const currentTotal = dailyEarningsMap.get(dayIndex) || 0;
      dailyEarningsMap.set(dayIndex, currentTotal + orderEarnings);
    });

    // Format the data for the chart
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return Array.from(dailyEarningsMap.entries())
      .map(([dayIndex, earnings]) => ({
        day: dayNames[dayIndex],
        earnings,
      }))
      .sort((a, b) => {
        // Sort by day of week (starting from Sunday)
        return dayNames.indexOf(a.day) - dayNames.indexOf(b.day);
      });
  }

  // For 'this-month' or 'last-month', we show weekly data
  else {
    const weeklyEarningsMap = new Map<number, number>();

    // Get the first day of the month from the first order or current date
    const firstOrderDate =
      orders.length > 0 ? new Date(orders[0].updated_at) : new Date();
    const startOfMonth = new Date(
      firstOrderDate.getFullYear(),
      firstOrderDate.getMonth(),
      1
    );

    // Calculate number of weeks in the month
    const lastDay = new Date(
      startOfMonth.getFullYear(),
      startOfMonth.getMonth() + 1,
      0
    ).getDate();
    const numWeeks = Math.ceil(lastDay / 7);

    // Initialize all weeks with zero earnings
    for (let i = 0; i < numWeeks; i++) {
      weeklyEarningsMap.set(i, 0);
    }

    // Aggregate earnings by week
    orders.forEach((order) => {
      const orderDate = new Date(order.updated_at);
      const weekIndex = Math.floor((orderDate.getDate() - 1) / 7);

      const orderEarnings = calculateOrderEarnings(order);

      const currentTotal = weeklyEarningsMap.get(weekIndex) || 0;
      weeklyEarningsMap.set(weekIndex, currentTotal + orderEarnings);
    });

    // Format the data for the chart
    return Array.from(weeklyEarningsMap.entries())
      .map(([weekIndex, earnings]) => ({
        day: `Week ${weekIndex + 1}`,
        earnings,
      }))
      .sort((a, b) => {
        // Sort by week number
        const aParts = a.day.split(" ");
        const bParts = b.day.split(" ");
        const aWeek = aParts.length > 1 ? parseInt(aParts[1]) : 0;
        const bWeek = bParts.length > 1 ? parseInt(bParts[1]) : 0;
        return aWeek - bWeek;
      });
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get session to identify the shopper
    const session = await getServerSession(req, res, authOptions as any);
    const shopperId = (session as any)?.user?.id;

    if (!shopperId) {
      return res
        .status(401)
        .json({ error: "You must be logged in as a shopper" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Get period from query params or use default
    const period = (req.query.period as string) || "this-week";

    // Calculate date range based on period
    const { startDate, endDate } = getDateRange(period);

    // Fetch orders for the selected period
    const data = await hasuraClient.request<OrdersResponse>(
      GET_DAILY_EARNINGS,
      {
        shopper_id: shopperId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      }
    );

    // Format data based on the selected period
    const formattedData = formatEarningsData(data.Orders, period);

    // Calculate the total earnings
    const totalEarnings = data.Orders.reduce((total, order) => {
      return total + calculateOrderEarnings(order);
    }, 0);

    // Create a response that includes the earnings structure expected by the Sidebar
    return res.status(200).json({
      success: true,
      data: formattedData,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        type: period,
      },
      // Add this earnings object structure that the sidebar expects
      earnings: {
        active: 0, // Assume 0 for active since we're only fetching completed ones
        completed: totalEarnings,
        total: totalEarnings,
      },
      orderCounts: {
        active: 0, // Assume 0 for active since we're only fetching completed ones
        completed: data.Orders.length,
        total: data.Orders.length,
      },
    });
  } catch (error) {
    console.error("Error fetching daily earnings:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch daily earnings",
    });
  }
}
