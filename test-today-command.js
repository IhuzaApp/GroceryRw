const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

async function testTodayEarnings() {
  console.log('🧪 Testing Today Earnings API...\n');

  // Test data
  const testShopperId = '067a1b10-f886-4d15-921f-0b27b440800c';

  try {
    // Test the new today-earnings endpoint
    console.log('1️⃣ Testing today-earnings endpoint...');
    const response = await fetch(`${API_BASE_URL}/api/telegram/today-earnings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shopperId: testShopperId
      })
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Today earnings API successful!');
      console.log(`💰 Total Earnings: $${result.data.totalEarnings}`);
      console.log(`📦 Orders Completed: ${result.data.orderCount}`);
      
      if (result.data.orders && result.data.orders.length > 0) {
        console.log('\n📋 Orders:');
        result.data.orders.forEach((order, index) => {
          console.log(`  ${index + 1}. ${order.shopName} - $${order.earnings} (${order.completed_at})`);
        });
      }
    } else {
      console.log('❌ Today earnings API failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTodayEarnings(); 