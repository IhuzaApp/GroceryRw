interface Product {
  price: string; // Actual/original price (e.g., 1233)
  final_price: string; // Final price with markup (e.g., 4555)
  name?: string; // Product name for revenue tracking
}

interface CartItem {
  quantity: number;
  Product: Product;
}

export class RevenueCalculator {
  /**
   * Calculate total based on price type
   * @param items - Cart items with Product containing price and final_price
   * @param priceType - "price" (base price) or "final_price" (customer price)
   */
  private static calculateTotal(
    items: CartItem[],
    priceType: "price" | "final_price"
  ): number {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.Product[priceType]);
      return sum + price * item.quantity;
    }, 0);
  }

  /**
   * Calculate revenue for cart items
   * @param items - Cart items with Product containing price and final_price
   * @returns Object with actualTotal (base price), customerTotal (final price), and revenue
   */
  public static calculateRevenue(items: CartItem[]): {
    actualTotal: string; // What we pay to shop (base price)
    customerTotal: string; // What customer pays (final price)
    revenue: string; // Our profit (difference)
  } {
    // Calculate what customer pays (using final_price)
    const customerTotal = this.calculateTotal(items, "final_price");

    // Calculate what we pay to shop (using original price)
    const actualTotal = this.calculateTotal(items, "price");

    // Our revenue is the difference
    const revenue = customerTotal - actualTotal;

    return {
      actualTotal: actualTotal.toFixed(2),
      customerTotal: customerTotal.toFixed(2),
      revenue: revenue.toFixed(2),
    };
  }

  public static calculateOrderRevenue(order: {
    total: string;
    Order_Items: Array<{
      quantity: number;
      price: string;
    }>;
  }): {
    orderTotal: string;
    itemsTotal: string;
    revenue: string;
  } {
    const orderTotal = parseFloat(order.total);
    // Order_Items now store base price, so this calculation is correct
    const itemsTotal = order.Order_Items.reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0);

    const revenue = orderTotal - itemsTotal;

    return {
      orderTotal: orderTotal.toFixed(2),
      itemsTotal: itemsTotal.toFixed(2),
      revenue: revenue.toFixed(2),
    };
  }

  /**
   * Calculate product-level profits for revenue tracking
   * @param items - Cart items with Product containing price and final_price
   * @returns Array of product profit details
   */
  public static calculateProductProfits(items: CartItem[]): Array<{
    product: string;
    quantity: number;
    price: number;
    final_price: number;
    profit: number;
  }> {
    return items.map(item => ({
      product: item.Product.name || "Unknown Product",
      quantity: item.quantity,
      price: parseFloat(item.Product.price),
      final_price: parseFloat(item.Product.final_price),
      profit: (parseFloat(item.Product.final_price) - parseFloat(item.Product.price)) * item.quantity
    }));
  }

  /**
   * Calculate plasa fee based on service and delivery fees
   * @param serviceFee - Service fee amount
   * @param deliveryFee - Delivery fee amount
   * @param deliveryCommissionPercentage - Commission percentage from system config
   * @returns Plasa fee amount
   */
  public static calculatePlasaFee(
    serviceFee: number,
    deliveryFee: number,
    deliveryCommissionPercentage: number
  ): number {
    return (serviceFee + deliveryFee) * (deliveryCommissionPercentage / 100);
  }
}
