const { io } = require('socket.io-client');

console.log('🧪 Testing WebSocket connection...');

const socket = io('http://localhost:3000', {
  path: '/api/websocket',
  transports: ['polling', 'websocket'],
  timeout: 5000,
  forceNew: true
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server:', socket.id);
  
  // Test shopper registration
  socket.emit('shopper-register', {
    userId: 'test-user-123',
    location: { lat: 40.7128, lng: -74.0060 }
  });
});

socket.on('registered', (data) => {
  console.log('👤 Shopper registered:', data);
  
  // Test location update
  socket.emit('location-update', {
    userId: 'test-user-123',
    location: { lat: 40.7129, lng: -74.0061 }
  });
});

socket.on('new-order', (data) => {
  console.log('📦 New order received:', data);
});

socket.on('batch-orders', (data) => {
  console.log('📦 Batch orders received:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket server');
});

socket.on('connect_error', (error) => {
  console.error('💥 Connection error:', error.message);
});

socket.on('error', (error) => {
  console.error('💥 Socket error:', error);
});

// Keep the script running for 30 seconds
setTimeout(() => {
  console.log('🛑 Test completed, disconnecting...');
  socket.disconnect();
  process.exit(0);
}, 30000);
