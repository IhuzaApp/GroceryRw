interface Product {
  price: string; // Actual/original price (e.g., 1233)
  final_price: string; // Final price with markup (e.g., 4555)
}

interface CartItem {
  quantity: number;
  Product: Product;
}

export class RevenueCalculator {
  private static calculateTotal(
    items: CartItem[],
    priceType: "price" | "final_price"
  ): number {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.Product[priceType]);
      return sum + price * item.quantity;
    }, 0);
  }

  public static calculateRevenue(items: CartItem[]): {
    actualTotal: string; // What we pay to shop
    customerTotal: string; // What customer pays
    revenue: string; // Our profit
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
}
