require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Try to get token from environment, fallback to direct token for testing
let token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.log('⚠️  TELEGRAM_BOT_TOKEN not found in environment variables');
  console.log('Using direct token for testing...');
  token = '8108990584:AAEYZ6mqRIAxYCPdT8Ax74k7Fuglzy4kKsU';
}

const bot = new TelegramBot(token, { polling: true });

// API base URL (for local development)
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

console.log('🤖 Telegram Bot is starting...');
console.log('📝 Listening for /start messages...');
console.log('🔗 API Base URL:', API_BASE_URL);

/**
 * Update shopper's Telegram ID in database
 */
async function updateShopperTelegramId(shopperId, telegramId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/telegram/bot-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update_telegram_id',
        shopperId,
        telegramId
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Database updated: Shopper ${shopperId} -> Telegram ${telegramId}`);
      return true;
    } else {
      console.error(`❌ Database update failed:`, result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    return false;
  }
}



/**
 * Get shopper by Telegram ID
 */
async function getShopperByTelegramId(telegramId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/telegram/bot-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get_by_telegram_id',
        telegramId
      })
    });

    const result = await response.json();
    
    if (result.success) {
      return result.shopper;
    } else {
      console.error(`❌ Failed to get shopper:`, result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting shopper:', error.message);
    return null;
  }
}

/**
 * Create a simple text-based earnings chart
 */
function createEarningsChart(orders) {
  if (!orders || orders.length === 0) {
    return "No orders today";
  }

  // Group orders by hour
  const hourlyData = {};
  orders.forEach(order => {
    const hour = new Date(order.completed_at).getHours();
    if (!hourlyData[hour]) {
      hourlyData[hour] = { count: 0, earnings: 0 };
    }
    hourlyData[hour].count++;
    hourlyData[hour].earnings += order.earnings || 0;
  });

  // Create chart
  let chart = "";
  const maxEarnings = Math.max(...Object.values(hourlyData).map(d => d.earnings));
  
  for (let hour = 0; hour < 24; hour++) {
    const data = hourlyData[hour] || { count: 0, earnings: 0 };
    const barLength = maxEarnings > 0 ? Math.round((data.earnings / maxEarnings) * 10) : 0;
    const bar = "█".repeat(barLength) + "░".repeat(10 - barLength);
    
    chart += `${hour.toString().padStart(2, '0')}:00 ${bar} $${data.earnings.toFixed(2)} (${data.count} orders)\n`;
  }

  return chart;
}

/**
 * Create a simple text-based weekly chart
 */
function createWeeklyChart(dailyData) {
  if (!dailyData || Object.keys(dailyData).length === 0) {
    return "No orders this week";
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxEarnings = Math.max(...Object.values(dailyData).map(d => d.earnings));
  
  let chart = "";
  days.forEach(day => {
    const data = dailyData[day] || { count: 0, earnings: 0 };
    const barLength = maxEarnings > 0 ? Math.round((data.earnings / maxEarnings) * 10) : 0;
    const bar = "█".repeat(barLength) + "░".repeat(10 - barLength);
    
    chart += `${day} ${bar} $${data.earnings.toFixed(2)} (${data.count} orders)\n`;
  });

  return chart;
}

/**
 * Create a simple text-based monthly chart
 */
function createMonthlyChart(weeklyData) {
  if (!weeklyData || Object.keys(weeklyData).length === 0) {
    return "No orders this month";
  }

  const maxEarnings = Math.max(...Object.values(weeklyData).map(d => d.earnings));
  
  let chart = "";
  Object.keys(weeklyData).forEach(week => {
    const data = weeklyData[week];
    const barLength = maxEarnings > 0 ? Math.round((data.earnings / maxEarnings) * 10) : 0;
    const bar = "█".repeat(barLength) + "░".repeat(10 - barLength);
    
    chart += `${week} ${bar} $${data.earnings.toFixed(2)} (${data.count} orders)\n`;
  });

  return chart;
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || 'NoUsername';
  const name = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
  const userId = msg.from.id;

  console.log('✅ /start received!');
  console.log('👤 User Info:');
  console.log(`   Name: ${name}`);
  console.log(`   Username: @${username}`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Chat ID: ${chatId}`);
  console.log('---');

  // Check if user is already connected
  const existingShopper = await getShopperByTelegramId(chatId.toString());
  
  if (existingShopper) {
    await bot.sendMessage(
      chatId, 
      `Hi ${name}! 🎉\n\nYou're already connected to PlaseraBot!\n\nYour Chat ID: ${chatId}\nShopper: ${existingShopper.full_name}\nStatus: ${existingShopper.status}\n\nUse /online or /offline to update your status.`
    );
  } else {
    await bot.sendMessage(
      chatId, 
      `Hi ${name}! 🎉\n\nYou're now connected to PlaseraBot!\n\nYour Chat ID: ${chatId}\n\nTo complete the connection, please use the link from your shopper dashboard.`
    );
  }
});

bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || 'NoUsername';
  const name = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
  const userId = msg.from.id;
  const shopperId = match[1]; // This is the shopper ID from the deep link

  console.log('✅ /start with shopper ID received!');
  console.log('👤 User Info:');
  console.log(`   Name: ${name}`);
  console.log(`   Username: @${username}`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Chat ID: ${chatId}`);
  console.log(`   Shopper ID: ${shopperId}`);
  console.log('---');

  // Update database with Telegram connection
  const dbUpdateSuccess = await updateShopperTelegramId(shopperId, chatId.toString());

  if (dbUpdateSuccess) {
    await bot.sendMessage(
      chatId, 
      `Hi ${name}! 🎉\n\nYou're now connected to PlaseraBot!\n\nYour Chat ID: ${chatId}\nShopper ID: ${shopperId}\n\nThis connection will be used to send you order notifications.\n\nUse /online or /offline to update your status.`
    );
  } else {
    await bot.sendMessage(
      chatId, 
      `Hi ${name}! 🎉\n\nThere was an issue connecting your account. Please try again or contact support.\n\nYour Chat ID: ${chatId}\nShopper ID: ${shopperId}`
    );
  }
});

// Handle online/offline status updates (session-based, not database)
bot.onText(/\/online/, async (msg) => {
  const chatId = msg.chat.id;
  const name = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

  console.log(`🟢 /online command from chat ${chatId}`);

  const shopper = await getShopperByTelegramId(chatId.toString());
  
  if (shopper) {
    // Instead of updating database, we'll send a message that the user should use the web interface
    await bot.sendMessage(
      chatId,
      `🟢 ${name}, to go ONLINE, please use the "Start Plas" button in your shopper dashboard.\n\n` +
      `The online/offline status is managed through your web session, not through Telegram commands.\n\n` +
      `This ensures your location and session state are properly synchronized.`
    );
  } else {
    await bot.sendMessage(
      chatId,
      `❌ You're not connected as a shopper. Please use /start to connect your account first.`
    );
  }
});

bot.onText(/\/offline/, async (msg) => {
  const chatId = msg.chat.id;
  const name = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

  console.log(`🔴 /offline command from chat ${chatId}`);

  const shopper = await getShopperByTelegramId(chatId.toString());
  
  if (shopper) {
    // Instead of updating database, we'll send a message that the user should use the web interface
    await bot.sendMessage(
      chatId,
      `🔴 ${name}, to go OFFLINE, please use the "Go Offline" button in your shopper dashboard.\n\n` +
      `The online/offline status is managed through your web session, not through Telegram commands.\n\n` +
      `This ensures your location and session state are properly synchronized.`
    );
  } else {
    await bot.sendMessage(
      chatId,
      `❌ You're not connected as a shopper. Please use /start to connect your account first.`
    );
  }
});

// Handle help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    `🤖 PlaseraBot Commands:\n\n` +
    `/start - Connect your account\n` +
    `/start [shopperId] - Connect with shopper ID\n` +
    `/online - Get instructions to go online\n` +
    `/offline - Get instructions to go offline\n` +
    `/status - Check your current status\n` +
    `/today - View today's orders and earnings\n` +
    `/week - View this week's orders and earnings\n` +
    `/month - View this month's orders and earnings\n` +
    `/orders - View available orders (40+ min old)\n` +
    `/help - Show this help message`
  );
});

// Handle status check
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const name = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

  const shopper = await getShopperByTelegramId(chatId.toString());
  
  if (shopper) {
    await bot.sendMessage(
      chatId,
      `📊 ${name}, your status:\n\n` +
      `🆔 Shopper ID: ${shopper.id}\n` +
      `📝 Name: ${shopper.full_name}\n` +
      `📱 Status: ${shopper.status}\n` +
      `🚗 Transport: ${shopper.transport_mode}\n` +
      `📍 Location: ${shopper.address}`
    );
  } else {
    await bot.sendMessage(
      chatId,
      `❌ You're not connected as a shopper. Please use /start to connect your account first.`
    );
  }
});

// Handle today's orders and earnings
bot.onText(/\/today/, async (msg) => {
  const chatId = msg.chat.id;
  const name = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

  console.log(`📅 /today command from chat ${chatId}`);

  const shopper = await getShopperByTelegramId(chatId.toString());
  
  if (shopper) {
    try {
      // Fetch today's data
      const response = await fetch(`${API_BASE_URL}/api/telegram/today-earnings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: shopper.user_id
        })
      });

      const data = await response.json();
      
      if (data && data.success && data.data) {
        const { totalEarnings, orderCount, orders } = data.data;
        
        // Create a simple text-based chart
        const chart = createEarningsChart(orders);
        
        await bot.sendMessage(
          chatId,
          `📅 ${name}, here's your today's summary:\n\n` +
          `💰 Total Earnings: $${totalEarnings.toFixed(2)}\n` +
          `📦 Orders Completed: ${orderCount}\n` +
          `📊 Average per Order: $${orderCount > 0 ? (totalEarnings / orderCount).toFixed(2) : '0.00'}\n\n` +
          `📈 Earnings Chart:\n${chart}\n\n` +
          `🕐 Last updated: ${new Date().toLocaleTimeString()}`
        );
      } else {
        await bot.sendMessage(
          chatId,
          `📅 ${name}, no orders completed today yet.\n\n` +
          `💰 Total Earnings: $0.00\n` +
          `📦 Orders Completed: 0\n\n` +
          `Keep up the great work! 🚀`
        );
      }
    } catch (error) {
      console.error('Error fetching today\'s data:', error);
      await bot.sendMessage(
        chatId,
        `❌ Sorry, there was an error fetching today's data. Please try again later.`
      );
    }
  } else {
    await bot.sendMessage(
      chatId,
      `❌ You're not connected as a shopper. Please use /start to connect your account first.`
    );
  }
});

// Handle week's orders and earnings
bot.onText(/\/week/, async (msg) => {
  const chatId = msg.chat.id;
  const name = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

  console.log(`📅 /week command from chat ${chatId}`);

  const shopper = await getShopperByTelegramId(chatId.toString());
  
  if (shopper) {
    try {
      console.log(`🔍 Fetching week data for shopper:`, {
        shopperId: shopper.id,
        user_id: shopper.user_id,
        full_name: shopper.full_name
      });
      
      // Fetch week's data
      const response = await fetch(`${API_BASE_URL}/api/telegram/week-earnings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: shopper.user_id
        })
      });

      const data = await response.json();
      
      if (data && data.success && data.data) {
        const { totalEarnings, orderCount, dailyData } = data.data;
        
        // Create a simple text-based chart
        const chart = createWeeklyChart(dailyData);
        
        await bot.sendMessage(
          chatId,
          `📅 ${name}, here's your this week's summary:\n\n` +
          `💰 Total Earnings: $${totalEarnings.toFixed(2)}\n` +
          `📦 Orders Completed: ${orderCount}\n` +
          `📊 Average per Order: $${orderCount > 0 ? (totalEarnings / orderCount).toFixed(2) : '0.00'}\n\n` +
          `📈 Daily Chart:\n${chart}\n\n` +
          `🕐 Last updated: ${new Date().toLocaleTimeString()}`
        );
      } else {
        await bot.sendMessage(
          chatId,
          `📅 ${name}, no orders completed this week yet.\n\n` +
          `💰 Total Earnings: $0.00\n` +
          `📦 Orders Completed: 0\n\n` +
          `Keep up the great work! 🚀`
        );
      }
    } catch (error) {
      console.error('Error fetching week\'s data:', error);
      await bot.sendMessage(
        chatId,
        `❌ Sorry, there was an error fetching this week's data. Please try again later.`
      );
    }
  } else {
    await bot.sendMessage(
      chatId,
      `❌ You're not connected as a shopper. Please use /start to connect your account first.`
    );
  }
});

// Handle month's orders and earnings
bot.onText(/\/month/, async (msg) => {
  const chatId = msg.chat.id;
  const name = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

  console.log(`📅 /month command from chat ${chatId}`);

  const shopper = await getShopperByTelegramId(chatId.toString());
  
  if (shopper) {
    try {
      console.log(`🔍 Fetching month data for shopper:`, {
        shopperId: shopper.id,
        user_id: shopper.user_id,
        full_name: shopper.full_name
      });
      
      // Fetch month's data
      const response = await fetch(`${API_BASE_URL}/api/telegram/month-earnings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: shopper.user_id
        })
      });

      const data = await response.json();
      
      if (data && data.success && data.data) {
        const { totalEarnings, orderCount, weeklyData } = data.data;
        
        // Create a simple text-based chart
        const chart = createMonthlyChart(weeklyData);
        
        await bot.sendMessage(
          chatId,
          `📅 ${name}, here's your this month's summary:\n\n` +
          `💰 Total Earnings: $${totalEarnings.toFixed(2)}\n` +
          `📦 Orders Completed: ${orderCount}\n` +
          `📊 Average per Order: $${orderCount > 0 ? (totalEarnings / orderCount).toFixed(2) : '0.00'}\n\n` +
          `📈 Weekly Chart:\n${chart}\n\n` +
          `🕐 Last updated: ${new Date().toLocaleTimeString()}`
        );
      } else {
        await bot.sendMessage(
          chatId,
          `📅 ${name}, no orders completed this month yet.\n\n` +
          `💰 Total Earnings: $0.00\n` +
          `📦 Orders Completed: 0\n\n` +
          `Keep up the great work! 🚀`
        );
      }
    } catch (error) {
      console.error('Error fetching month\'s data:', error);
      await bot.sendMessage(
        chatId,
        `❌ Sorry, there was an error fetching this month's data. Please try again later.`
      );
    }
  } else {
    await bot.sendMessage(
      chatId,
      `❌ You're not connected as a shopper. Please use /start to connect your account first.`
    );
  }
});

// Handle available orders (not picked up for over 40 minutes)
bot.onText(/\/orders/, async (msg) => {
  const chatId = msg.chat.id;
  const name = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

  console.log(`📦 /orders command from chat ${chatId}`);

  const shopper = await getShopperByTelegramId(chatId.toString());
  
  if (shopper) {
    try {
      // Fetch available orders
      const response = await fetch(`${API_BASE_URL}/api/telegram/available-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data && data.success && data.data.orders.length > 0) {
        const { orders, totalCount, regularCount, reelCount } = data.data;
        
        // Create order list message
        let message = `📦 ${name}, here are available orders (not picked up for 40+ minutes):\n\n`;
        message += `📊 Summary: ${totalCount} total orders (${regularCount} regular, ${reelCount} reel)\n\n`;
        
        // Add first 5 orders to the message
        orders.slice(0, 5).forEach((order, index) => {
          const typeIcon = order.type === 'reel' ? '🎬' : '🛒';
          const typeLabel = order.type === 'reel' ? 'REEL' : 'REGULAR';
          
          message += `${index + 1}. ${typeIcon} ${typeLabel}\n`;
          message += `   💰 $${order.earnings.toFixed(2)}\n`;
          
          if (order.type === 'reel') {
            message += `   📝 ${order.title}\n`;
            message += `   👤 ${order.customerName}\n`;
          } else {
            message += `   🏪 ${order.shopName}\n`;
            message += `   📦 ${order.itemsCount} items\n`;
          }
          
          message += `   ⏰ ${order.minutesAgo} minutes ago\n\n`;
        });
        
        if (orders.length > 5) {
          message += `... and ${orders.length - 5} more orders\n\n`;
        }
        
        message += `🚀 Click the button below to view and accept orders on the web dashboard!`;
        
        // Create inline keyboard with button to go to web dashboard
        const keyboard = {
          inline_keyboard: [[
            {
              text: "🚀 View Orders on Web",
              url: `${API_BASE_URL}/Plasa/orders`
            }
          ]]
        };
        
        await bot.sendMessage(chatId, message, { reply_markup: keyboard });
      } else {
        await bot.sendMessage(
          chatId,
          `📦 ${name}, no orders are currently available (older than 40 minutes).\n\n` +
          `All pending orders have been picked up or are still within the 40-minute window.`
        );
      }
    } catch (error) {
      console.error('Error fetching available orders:', error);
      await bot.sendMessage(
        chatId,
        `❌ Sorry, there was an error fetching available orders. Please try again later.`
      );
    }
  } else {
    await bot.sendMessage(
      chatId,
      `❌ You're not connected as a shopper. Please use /start to connect your account first.`
    );
  }
});

// Handle errors
bot.on('error', (error) => {
  console.error('❌ Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error);
});

console.log('✅ Bot is ready! Send /start to @PlaseraBot to test.');
console.log('📊 Database integration: ENABLED');
console.log('🔄 Status updates: ENABLED'); 