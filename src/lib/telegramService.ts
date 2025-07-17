// Telegram Bot Service for sending notifications to shoppers

const TELEGRAM_BOT_TOKEN = '8108990584:AAEYZ6mqRIAxYCPdT8Ax74k7Fuglzy4kKsU';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

interface SendMessageResponse {
  ok: boolean;
  result?: any;
  error_code?: number;
  description?: string;
}

interface Shopper {
  id: string;
  full_name: string;
  status: string;
  active: boolean;
  telegram_id: string;
  user_id: string;
  phone_number: string;
  address: string;
  transport_mode: string;
  created_at: string;
  updated_at: string;
}

export class TelegramService {
  /**
   * Send a message to a specific chat ID
   */
  static async sendMessage(chatId: string, message: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    try {
      const payload: TelegramMessage = {
        chat_id: chatId,
        text: message,
        parse_mode: parseMode
      };

      const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result: SendMessageResponse = await response.json();

      if (!result.ok) {
        console.error('Telegram API error:', result.error_code, result.description);
        return false;
      }

      console.log(`✅ Telegram message sent to chat ${chatId}`);
      return true;

    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  }

  /**
   * Get shopper by Telegram ID from database
   */
  static async getShopperByTelegramId(telegramId: string): Promise<Shopper | null> {
    try {
      const response = await fetch('/api/telegram/update-shopper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_by_telegram_id',
          telegramId
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.shopper;
      }
    } catch (error) {
      console.error('Failed to get shopper by Telegram ID:', error);
    }

    return null;
  }

  /**
   * Send message to a shopper by their shopper ID
   */
  static async sendMessageToShopper(shopperId: string, message: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    try {
      // Get shopper details from database
      const shopper = await this.getShopperById(shopperId);
      
      if (!shopper || !shopper.telegram_id) {
        console.log(`❌ No Telegram connection found for shopper ${shopperId}`);
        return false;
      }

      return await this.sendMessage(shopper.telegram_id, message, parseMode);
    } catch (error) {
      console.error('Failed to send message to shopper:', error);
      return false;
    }
  }

  /**
   * Get shopper by ID from database
   */
  private static async getShopperById(shopperId: string): Promise<Shopper | null> {
    try {
      // This would typically query your database directly
      // For now, we'll use a simple API call
      const response = await fetch(`/api/queries/shopper-profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.shopper;
      }
    } catch (error) {
      console.error('Failed to get shopper by ID:', error);
    }

    return null;
  }

  /**
   * Send order notification to a shopper
   */
  static async sendOrderNotification(shopperId: string, orderDetails: {
    orderId: string;
    shopName: string;
    total: number;
    status: string;
  }): Promise<boolean> {
    const message = `
🛒 <b>New Order Notification</b>

📦 Order ID: <code>${orderDetails.orderId}</code>
🏪 Shop: ${orderDetails.shopName}
💰 Total: $${orderDetails.total.toFixed(2)}
📊 Status: ${orderDetails.status}

Please check your dashboard for more details.
    `.trim();

    return this.sendMessageToShopper(shopperId, message, 'HTML');
  }

  /**
   * Send delivery update to a shopper
   */
  static async sendDeliveryUpdate(shopperId: string, updateDetails: {
    orderId: string;
    status: string;
    estimatedTime?: string;
  }): Promise<boolean> {
    const message = `
🚚 <b>Delivery Update</b>

📦 Order ID: <code>${updateDetails.orderId}</code>
📊 Status: ${updateDetails.status}
${updateDetails.estimatedTime ? `⏰ Estimated Time: ${updateDetails.estimatedTime}` : ''}

Thank you for using our service!
    `.trim();

    return this.sendMessageToShopper(shopperId, message, 'HTML');
  }

  /**
   * Send earnings notification to a shopper
   */
  static async sendEarningsNotification(shopperId: string, earningsDetails: {
    amount: number;
    period: string;
    orderCount: number;
  }): Promise<boolean> {
    const message = `
💰 <b>Earnings Update</b>

📅 Period: ${earningsDetails.period}
💵 Amount: $${earningsDetails.amount.toFixed(2)}
📦 Orders Completed: ${earningsDetails.orderCount}

Great work! Keep it up! 🎉
    `.trim();

    return this.sendMessageToShopper(shopperId, message, 'HTML');
  }

  /**
   * Send general notification to a shopper
   */
  static async sendGeneralNotification(shopperId: string, title: string, message: string): Promise<boolean> {
    const formattedMessage = `
📢 <b>${title}</b>

${message}
    `.trim();

    return this.sendMessageToShopper(shopperId, formattedMessage, 'HTML');
  }

  /**
   * Send status update notification to a shopper
   */
  static async sendStatusUpdate(shopperId: string, status: 'online' | 'offline'): Promise<boolean> {
    const message = `
📱 <b>Status Update</b>

Your status has been updated to: <b>${status.toUpperCase()}</b>

${status === 'online' 
  ? '✅ You are now available to receive orders!' 
  : '🔴 You are now offline and won\'t receive new orders.'
}
    `.trim();

    return this.sendMessageToShopper(shopperId, message, 'HTML');
  }

  /**
   * Send order assignment notification to a shopper
   */
  static async sendOrderAssignment(shopperId: string, orderDetails: {
    orderId: string;
    shopName: string;
    total: number;
    pickupAddress: string;
    deliveryAddress: string;
  }): Promise<boolean> {
    const message = `
🎯 <b>New Order Assigned!</b>

📦 Order ID: <code>${orderDetails.orderId}</code>
🏪 Shop: ${orderDetails.shopName}
💰 Total: $${orderDetails.total.toFixed(2)}

📍 Pickup: ${orderDetails.pickupAddress}
🎯 Delivery: ${orderDetails.deliveryAddress}

Please accept or decline this order in your dashboard.
    `.trim();

    return this.sendMessageToShopper(shopperId, message, 'HTML');
  }
}

export default TelegramService; 