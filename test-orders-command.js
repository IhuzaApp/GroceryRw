const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

async function testAvailableOrders() {
  console.log('🧪 Testing Available Orders API...\n');

  try {
    // Test the new available-orders endpoint
    console.log('1️⃣ Testing available-orders endpoint...');
    const response = await fetch(`${API_BASE_URL}/api/telegram/available-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Available orders API successful!');
      console.log(`📦 Total Orders: ${result.data.totalCount}`);
      console.log(`🛒 Regular Orders: ${result.data.regularCount}`);
      console.log(`🎬 Reel Orders: ${result.data.reelCount}`);
      
      if (result.data.orders && result.data.orders.length > 0) {
        console.log('\n📋 Sample Orders:');
        result.data.orders.slice(0, 3).forEach((order, index) => {
          console.log(`  ${index + 1}. ${order.type.toUpperCase()} - $${order.earnings}`);
          if (order.type === 'reel') {
            console.log(`     📝 ${order.title}`);
            console.log(`     👤 ${order.customerName}`);
          } else {
            console.log(`     🏪 ${order.shopName}`);
            console.log(`     📦 ${order.itemsCount} items`);
          }
          console.log(`     ⏰ ${order.minutesAgo} minutes ago`);
        });
      } else {
        console.log('\n📭 No orders available (older than 40 minutes)');
      }
    } else {
      console.log('❌ Available orders API failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAvailableOrders(); 