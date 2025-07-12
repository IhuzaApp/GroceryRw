import { NextApiRequest, NextApiResponse } from "next";
import { RevenueCalculator } from "../../src/lib/revenueCalculator";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Test data matching the example from README
    const testItems = [
      {
        quantity: 3,
        Product: {
          price: "1233",
          final_price: "4555",
          name: "Test Product",
        },
      },
    ];

    // Calculate revenue
    const revenueData = RevenueCalculator.calculateRevenue(testItems);
    const productProfits = RevenueCalculator.calculateProductProfits(testItems);

    // Test plasa fee calculation
    const serviceFee = 1000;
    const deliveryFee = 500;
    const deliveryCommissionPercentage = 15; // 15%
    const plasaFee = RevenueCalculator.calculatePlasaFee(
      serviceFee,
      deliveryFee,
      deliveryCommissionPercentage
    );

    // Expected calculations:
    // Customer Pays: 4555 × 3 = 13,665 RWF
    // Shop Gets: 1233 × 3 = 3,699 RWF
    // Our Revenue: 13,665 - 3,699 = 9,966 RWF
    // Plasa Fee: (1000 + 500) × 15% = 225 RWF

    const expectedCustomerTotal = 13665;
    const expectedActualTotal = 3699;
    const expectedRevenue = 9966;
    const expectedPlasaFee = 225;

    const testResults = {
      input: {
        items: testItems,
        serviceFee,
        deliveryFee,
        deliveryCommissionPercentage,
      },
      calculated: {
        revenueData,
        productProfits,
        plasaFee,
      },
      expected: {
        customerTotal: expectedCustomerTotal,
        actualTotal: expectedActualTotal,
        revenue: expectedRevenue,
        plasaFee: expectedPlasaFee,
      },
      validation: {
        customerTotalCorrect: Math.abs(parseFloat(revenueData.customerTotal) - expectedCustomerTotal) < 0.01,
        actualTotalCorrect: Math.abs(parseFloat(revenueData.actualTotal) - expectedActualTotal) < 0.01,
        revenueCorrect: Math.abs(parseFloat(revenueData.revenue) - expectedRevenue) < 0.01,
        plasaFeeCorrect: Math.abs(plasaFee - expectedPlasaFee) < 0.01,
      },
    };

    return res.status(200).json({
      success: true,
      message: "Revenue calculation test completed",
      results: testResults,
    });
  } catch (error) {
    console.error("Revenue calculation test error:", error);
    return res.status(500).json({
      error: "Revenue calculation test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
} 