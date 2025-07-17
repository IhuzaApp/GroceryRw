const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_BOT_TOKEN = '8108990584:AAEYZ6mqRIAxYCPdT8Ax74k7Fuglzy4kKsU';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://your-domain.vercel.app/api/telegram/webhook';

async function setupWebhook() {
  try {
    console.log('🔧 Setting up Telegram webhook...');
    
    const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
    
    // Set webhook URL
    const result = await bot.setWebhook(WEBHOOK_URL);
    
    if (result) {
      console.log('✅ Webhook set successfully!');
      console.log(`📡 Webhook URL: ${WEBHOOK_URL}`);
      
      // Get webhook info
      const webhookInfo = await bot.getWebhookInfo();
      console.log('📊 Webhook Info:', webhookInfo);
      
    } else {
      console.error('❌ Failed to set webhook');
    }
    
  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
  }
}

// Run setup
setupWebhook(); 