const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

async function testBotAPI() {
  console.log('🧪 Testing Bot API Endpoint...\n');

  // Test data
  const testShopperId = '067a1b10-f886-4d15-921f-0b27b440800c';
  const testTelegramId = '7871631863';

  try {
    // Test 1: Update Telegram ID
    console.log('1️⃣ Testing update_telegram_id...');
    const updateResponse = await fetch(`${API_BASE_URL}/api/telegram/bot-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update_telegram_id',
        shopperId: testShopperId,
        telegramId: testTelegramId
      })
    });

    const updateResult = await updateResponse.json();
    console.log('Response:', updateResult);

    if (updateResult.success) {
      console.log('✅ Telegram ID update successful!\n');
    } else {
      console.log('❌ Telegram ID update failed:', updateResult.error, '\n');
    }

    // Test 2: Get shopper by Telegram ID
    console.log('2️⃣ Testing get_by_telegram_id...');
    const getResponse = await fetch(`${API_BASE_URL}/api/telegram/bot-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get_by_telegram_id',
        telegramId: testTelegramId
      })
    });

    const getResult = await getResponse.json();
    console.log('Response:', getResult);

    if (getResult.success && getResult.shopper) {
      console.log('✅ Shopper found by Telegram ID!');
      console.log('Shopper details:', getResult.shopper);
    } else {
      console.log('❌ Failed to get shopper by Telegram ID:', getResult.error);
    }



  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBotAPI(); 