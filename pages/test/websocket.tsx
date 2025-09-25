import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '../../src/hooks/useWebSocket';

export default function WebSocketTest() {
  const { data: session } = useSession();
  const { isConnected, sendLocation, acceptOrder, rejectOrder } = useWebSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [testLocation, setTestLocation] = useState({ lat: 40.7128, lng: -74.0060 });

  useEffect(() => {
    const handleWebSocketNewOrder = (event: CustomEvent) => {
      setMessages(prev => [...prev, { type: 'new-order', data: event.detail, timestamp: new Date() }]);
    };

    const handleWebSocketBatchOrders = (event: CustomEvent) => {
      setMessages(prev => [...prev, { type: 'batch-orders', data: event.detail, timestamp: new Date() }]);
    };

    const handleWebSocketOrderExpired = (event: CustomEvent) => {
      setMessages(prev => [...prev, { type: 'order-expired', data: event.detail, timestamp: new Date() }]);
    };

    window.addEventListener('websocket-new-order', handleWebSocketNewOrder as EventListener);
    window.addEventListener('websocket-batch-orders', handleWebSocketBatchOrders as EventListener);
    window.addEventListener('websocket-order-expired', handleWebSocketOrderExpired as EventListener);

    return () => {
      window.removeEventListener('websocket-new-order', handleWebSocketNewOrder as EventListener);
      window.removeEventListener('websocket-batch-orders', handleWebSocketBatchOrders as EventListener);
      window.removeEventListener('websocket-order-expired', handleWebSocketOrderExpired as EventListener);
    };
  }, []);

  const sendTestLocation = () => {
    sendLocation(testLocation);
    setMessages(prev => [...prev, { type: 'location-sent', data: testLocation, timestamp: new Date() }]);
  };

  const testAcceptOrder = () => {
    acceptOrder('test-order-123');
    setMessages(prev => [...prev, { type: 'accept-sent', data: 'test-order-123', timestamp: new Date() }]);
  };

  const testRejectOrder = () => {
    rejectOrder('test-order-123');
    setMessages(prev => [...prev, { type: 'reject-sent', data: 'test-order-123', timestamp: new Date() }]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  if (!session) {
    return <div className="p-8">Please sign in to test WebSocket</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">WebSocket Test Page</h1>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 rounded-lg border">
        <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? '🔌 Connected' : '❌ Disconnected'}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          User ID: {session.user?.id}
        </p>
      </div>

      {/* Test Controls */}
      <div className="mb-6 p-4 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Location</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.000001"
                value={testLocation.lat}
                onChange={(e) => setTestLocation(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="Latitude"
              />
              <input
                type="number"
                step="0.000001"
                value={testLocation.lng}
                onChange={(e) => setTestLocation(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="Longitude"
              />
              <button
                onClick={sendTestLocation}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Send Location
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Order Actions</label>
            <div className="flex gap-2">
              <button
                onClick={testAcceptOrder}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Test Accept
              </button>
              <button
                onClick={testRejectOrder}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Test Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="mb-6 p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">WebSocket Messages</h2>
          <button
            onClick={clearMessages}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet. Try sending a location or wait for orders.</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded border">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{msg.type}</span>
                  <span className="text-xs text-gray-500">{msg.timestamp.toLocaleTimeString()}</span>
                </div>
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {JSON.stringify(msg.data, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">How to Test:</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Make sure you're signed in as a shopper</li>
          <li>2. Check that WebSocket shows "Connected" status</li>
          <li>3. Send a test location to register with the server</li>
          <li>4. Create a test order in the admin panel</li>
          <li>5. Watch for real-time order notifications</li>
          <li>6. Test Accept/Reject buttons</li>
        </ol>
      </div>
    </div>
  );
}
