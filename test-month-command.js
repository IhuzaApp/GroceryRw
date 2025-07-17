const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

async function testMonthEarnings() {
  console.log('🧪 Testing Month Earnings API...\n');

  // Test data
  const testShopperId = '067a1b10-f886-4d15-921f-0b27b440800c';

  try {
    // Test the new month-earnings endpoint
    console.log('1️⃣ Testing month-earnings endpoint...');
    const response = await fetch(`${API_BASE_URL}/api/telegram/month-earnings`, {
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
      console.log('✅ Month earnings API successful!');
      console.log(`💰 Total Earnings: $${result.data.totalEarnings}`);
      console.log(`📦 Orders Completed: ${result.data.orderCount}`);
      
      if (result.data.weeklyData && Object.keys(result.data.weeklyData).length > 0) {
        console.log('\n📅 Weekly Breakdown:');
        Object.entries(result.data.weeklyData).forEach(([week, data]) => {
          console.log(`  ${week}: $${data.earnings} (${data.count} orders)`);
        });
      }
    } else {
      console.log('❌ Month earnings API failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMonthEarnings(); 