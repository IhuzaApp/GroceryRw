import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import RootLayout from '@components/ui/layout';
import { 
  collection, query, where, orderBy, getDocs, onSnapshot,
  doc, updateDoc, Timestamp
} from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, Loader, Panel, Placeholder } from 'rsuite';
import { formatCurrency } from '../../src/lib/formatCurrency';

// Helper to display timestamps as relative time ago
function timeAgo(timestamp: any) {
  if (!timestamp) return '';
  
  const now = new Date().getTime();
  const date = timestamp instanceof Timestamp 
    ? timestamp.toDate().getTime() 
    : new Date(timestamp).getTime();
  
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  
  return new Date(date).toLocaleDateString();
}

// Helper to format order ID
function formatOrderID(id?: string | number): string {
  const s = id != null ? id.toString() : "0";
  return s.length >= 4 ? s : s.padStart(4, "0");
}

// Define message interface
interface Message {
  id: string;
  text: string;
  senderId: string;
  recipientId: string;
  timestamp: any;
  read: boolean;
  [key: string]: any;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});

  // Fetch active orders and their messages
  useEffect(() => {
    // Only fetch if user is authenticated
    if (status === 'authenticated' && session?.user?.id) {
      const userId = session.user.id;
      
      // First, fetch active orders
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/queries/orders?user_id=${userId}`);
          const data = await res.json();
          
          // Filter for non-delivered orders
          const activeOrders = data.orders.filter((order: any) => 
            order.status !== 'delivered' && order.shopper_id
          );
          
          setOrders(activeOrders);
          
          // Then, for each order with a shopper, set up conversation listeners
          activeOrders.forEach((order: any) => {
            if (order.shopper_id) {
              setupConversationListener(order.id);
            }
          });
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchOrders();
    }
  }, [session, status]);
  
  // Set up real-time listener for each order's conversation
  const setupConversationListener = (orderId: string) => {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('orderId', '==', orderId),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      setConversations(prev => ({
        ...prev,
        [orderId]: messages
      }));
      
      // Mark messages as read if they were sent to the current user
      messages.forEach(async (message) => {
        if (
          message.recipientId === session?.user?.id && 
          !message.read
        ) {
          const messageRef = doc(db, 'messages', message.id);
          await updateDoc(messageRef, { read: true });
        }
      });
    }, (error) => {
      console.error(`Error fetching messages for order ${orderId}:`, error);
    });
    
    // Store unsubscribe function for cleanup
    return unsubscribe;
  };
  
  // Redirect to chat page for a specific order
  const handleChatClick = (orderId: string) => {
    router.push(`/Messages/${orderId}`);
  };

  // Render loading state
  if (loading) {
    return (
      <RootLayout>
        <div className="p-4 md:ml-16">
          <div className="container mx-auto">
            <h1 className="mb-6 text-2xl font-bold">Messages</h1>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <Placeholder.Paragraph rows={3} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Render authentication required
  if (status !== 'authenticated') {
    return (
      <RootLayout>
        <div className="p-4 md:ml-16">
          <div className="container mx-auto">
            <h1 className="mb-6 text-2xl font-bold">Messages</h1>
            <div className="rounded-lg bg-blue-50 p-6 text-center">
              <h2 className="mb-4 text-xl font-semibold text-blue-700">Sign in Required</h2>
              <p className="mb-6 text-blue-600">Please sign in to view your messages.</p>
              <Link href="/login" passHref>
                <Button appearance="primary" color="blue">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Render empty state
  if (orders.length === 0) {
    return (
      <RootLayout>
        <div className="p-4 md:ml-16">
          <div className="container mx-auto">
            <h1 className="mb-6 text-2xl font-bold">Messages</h1>
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">No Active Conversations</h2>
              <p className="mb-6 text-gray-600">
                You don't have any active orders with shoppers to chat with.
              </p>
              <Link href="/CurrentPendingOrders" passHref>
                <Button appearance="primary" color="green">
                  View Your Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Render orders with conversations
  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        <div className="container mx-auto">
          <h1 className="mb-6 text-2xl font-bold">Messages</h1>
          
          <div className="space-y-4">
            {orders.map((order) => {
              const orderMessages = conversations[order.id] || [];
              const hasUnread = orderMessages.some((msg) => 
                !msg.read && msg.recipientId === session?.user?.id
              );
              const lastMessage = orderMessages[0];
              
              return (
                <Panel 
                  key={order.id}
                  shaded 
                  bordered
                  className={`cursor-pointer transition-colors ${
                    hasUnread ? 'border-l-4 border-l-green-500' : ''
                  }`}
                  onClick={() => handleChatClick(order.id)}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">
                          Order #{formatOrderID(order.OrderID)}
                        </h3>
                        {hasUnread && (
                          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {order.shop?.name || 'Shop'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {order.status === 'shopping' ? 'Shopping' : 
                          order.status === 'packing' ? 'Packing' : 
                          order.status === 'on_the_way' ? 'On the way' : 
                          'Processing'}
                      </div>
                      <p className="mt-1 text-sm font-medium">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                  
                  {lastMessage && (
                    <div className="mt-3 border-t pt-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 truncate pr-4">
                          <p className="font-medium">
                            {lastMessage.senderId === session?.user?.id ? 'You' : 'Shopper'}:
                          </p>
                          <p className="truncate text-gray-600">
                            {lastMessage.text}
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-xs text-gray-500">
                          {timeAgo(lastMessage.timestamp)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 text-right">
                    <Button 
                      appearance="ghost" 
                      color="green"
                      className="text-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChatClick(order.id);
                      }}
                    >
                      Chat with Shopper
                    </Button>
                  </div>
                </Panel>
              );
            })}
          </div>
        </div>
      </div>
    </RootLayout>
  );
} 