import { NextApiRequest, NextApiResponse } from "next";

const shops = [
  { name: "Walmart", items: ["Milk", "Bread", "Eggs"], amount: 25.5 },
  { name: "Target", items: ["Apples", "Cereal", "Coffee"], amount: 32.75 },
  {
    name: "Whole Foods",
    items: ["Organic Chicken", "Quinoa", "Kale"],
    amount: 45.99,
  },
  {
    name: "Costco",
    items: ["Bulk Paper Towels", "Pizza", "Water"],
    amount: 89.99,
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Select 1-2 random shops
    const selectedShops = shops
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 1);

    const totalAmount = selectedShops.reduce(
      (sum, shop) => sum + shop.amount,
      0
    );
    const itemsList = selectedShops
      .map(
        (shop) => `${shop.items[Math.floor(Math.random() * shop.items.length)]}`
      )
      .join(", ");

    const dummyNotifications = [
      {
        shopper_id: "test-shopper-1",
        message:
          `📦 New orders from ${selectedShops
            .map((s) => s.name)
            .join(" & ")}!\n` +
          `🛒 Items include: ${itemsList}\n` +
          `💰 Potential earnings: $${totalAmount.toFixed(2)}`,
        orders: selectedShops.map((shop) => ({
          id: `dummy-order-${Math.random().toString(36).substr(2, 9)}`,
          shop_name: shop.name,
          amount: shop.amount,
        })),
      },
    ];

    return res.status(200).json({
      success: true,
      notifications: dummyNotifications,
      play_sound: true,
      message: "Generated dummy notifications for testing",
    });
  } catch (error) {
    console.error("Error generating dummy notifications:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate dummy notifications" });
  }
}
