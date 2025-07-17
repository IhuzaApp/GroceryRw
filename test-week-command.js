const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

async function testWeekEarnings() {
  console.log('🧪 Testing Week Earnings API...\n');

  // Test data
  const testShopperId = '067a1b10-f886-4d15-921f-0b27b440800c';

  try {
    // Test the new week-earnings endpoint
    console.log('1️⃣ Testing week-earnings endpoint...');
    const response = await fetch(`${API_BASE_URL}/api/telegram/week-earnings`, {
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
      console.log('✅ Week earnings API successful!');
      console.log(`💰 Total Earnings: $${result.data.totalEarnings}`);
      console.log(`📦 Orders Completed: ${result.data.orderCount}`);
      
      if (result.data.dailyData && Object.keys(result.data.dailyData).length > 0) {
        console.log('\n📅 Daily Breakdown:');
        Object.entries(result.data.dailyData).forEach(([day, data]) => {
          console.log(`  ${day}: $${data.earnings} (${data.count} orders)`);
        });
      }
    } else {
      console.log('❌ Week earnings API failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWeekEarnings(); 