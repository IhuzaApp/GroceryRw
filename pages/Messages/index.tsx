import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import RootLayout from '@components/ui/layout';
import { 
  collection, query, where, orderBy, getDocs, onSnapshot,
  doc, updateDoc, Timestamp, Unsubscribe
} from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, Loader, Panel, Placeholder, Avatar } from 'rsuite';
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
  if (!id) return "0000";
  const s = id.toString();
  return s.length >= 4 ? s : s.padStart(4, "0");
}

// Define conversation interface
interface Conversation {
  id: string;
  orderId: string;
  customerId: string;
  shopperId: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  order?: any;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [orders, setOrders] = useState<Record<string, any>>({});

  // Fetch conversations and their associated orders
  useEffect(() => {
    // Only fetch if user is authenticated
    if (status === 'authenticated' && session?.user?.id) {
      const userId = session.user.id;
      
      const fetchConversationsAndOrders = async () => {
        try {
          setLoading(true);
          
          console.log("Fetching conversations for user:", userId);
          
          // Get conversations where the current user is the customer
          const conversationsRef = collection(db, "chat_conversations");
          
          // Option 1: Remove the orderBy to avoid needing the composite index
          const q = query(
            conversationsRef,
            where("customerId", "==", userId)
            // orderBy removed to avoid needing the composite index
          );
          
          // Set up real-time listener for conversations
          const unsubscribe = onSnapshot(q, async (snapshot) => {
            console.log("Conversations snapshot received, count:", snapshot.docs.length);
            
            // Get conversations and sort them in memory instead
            let conversationList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              // Convert Firestore timestamp to regular Date if needed
              lastMessageTime: doc.data().lastMessageTime instanceof Timestamp
                ? doc.data().lastMessageTime.toDate()
                : doc.data().lastMessageTime,
            })) as Conversation[];
            
            console.log("Conversations:", conversationList);
            
            // Sort conversations by lastMessageTime in memory
            conversationList.sort((a, b) => {
              const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
              const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
              return timeB - timeA; // descending order (newest first)
            });
            
            setConversations(conversationList);
            
            // Fetch order details for each conversation
            const orderIds = conversationList
              .map(conv => conv.orderId)
              .filter(id => id && typeof id === 'string' && id.trim() !== '');
            
            console.log("Order IDs to fetch:", orderIds);
            
            // Only fetch orders that we don't already have
            const ordersToFetch = orderIds.filter(id => !orders[id]);
            
            if (ordersToFetch.length > 0) {
              console.log("Fetching orders:", ordersToFetch);
              
              const orderDetailsPromises = ordersToFetch.map(async (orderId) => {
                try {
                  // Validate UUID format before fetching
                  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                  if (!uuidRegex.test(orderId)) {
                    console.error(`Invalid order ID format: ${orderId}`);
                    return { orderId, order: { error: true, message: 'Invalid ID format' } };
                  }
                  
                  const res = await fetch(`/api/queries/orderDetails?id=${orderId}`);
                  
                  // Check if response is ok before trying to parse JSON
                  if (!res.ok) {
                    console.error(`Error fetching order ${orderId}: ${res.status} ${res.statusText}`);
                    return { orderId, order: { error: true, status: res.status } };
                  }
                  
                  const data = await res.json();
                  console.log(`Order ${orderId} data:`, data.order);
                  return { orderId, order: data.order };
                } catch (error) {
                  console.error(`Error fetching order ${orderId}:`, error);
                  return { orderId, order: { error: true } };
                }
              });
              
              const orderResults = await Promise.all(orderDetailsPromises);
              console.log("Order results:", orderResults);
              
              // Create a new orders object to avoid mutation
              const newOrders = { ...orders };
              let hasValidOrders = false;
              
              orderResults.forEach(({ orderId, order }) => {
                // Store the order data or error placeholder
                newOrders[orderId] = order || { error: true };
                if (order && !order.error) {
                  hasValidOrders = true;
                }
              });
              
              // Only update state if we have valid orders to prevent unnecessary re-renders
              if (hasValidOrders || Object.keys(orders).length === 0) {
                setOrders(newOrders);
              }
            }
            
            setLoading(false);
          }, (error) => {
            // Handle Firestore listener errors
            console.error("Firestore listener error:", error);
            setLoading(false);
          });
          
          return unsubscribe;
        } catch (error) {
          console.error('Error fetching conversations:', error);
          setLoading(false);
          return undefined;
        }
      };
      
      const unsubscribePromise = fetchConversationsAndOrders();
      return () => {
        unsubscribePromise.then(unsubscribe => {
          if (unsubscribe) {
            unsubscribe();
          }
        });
      };
    }
  }, [session, status]);
  
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
  if (conversations.length === 0) {
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

  // Render conversations
  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        <div className="container mx-auto">
          <h1 className="mb-6 text-2xl font-bold">Messages</h1>
          
          <div className="space-y-4">
            {conversations.map((conversation) => {
              const order = orders[conversation.orderId];
              const hasUnread = conversation.unreadCount > 0;
              const hasError = order?.error;
              
              return (
                <Panel 
                  key={conversation.id}
                  shaded 
                  bordered
                  className={`cursor-pointer transition-colors ${
                    hasUnread ? 'border-l-4 border-l-green-500' : ''
                  } ${hasError ? 'opacity-70' : ''}`}
                  onClick={() => handleChatClick(conversation.orderId)}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">
                          {hasError ? (
                            <span>Order {conversation.orderId.substring(0, 8)}...</span>
                          ) : (
                            <>Order #{order ? formatOrderID(order.OrderID) : formatOrderID(conversation.orderId)}</>
                          )}
                        </h3>
                        {hasUnread && (
                          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {hasError ? 'Order details unavailable' : (order?.shop?.name || 'Shop')}
                      </p>
                      <p className="mt-2 text-sm">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    <div className="text-right">
                      {order && !hasError && (
                        <div className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          {order.status === 'shopping' ? 'Shopping' : 
                            order.status === 'packing' ? 'Packing' : 
                            order.status === 'on_the_way' ? 'On the way' : 
                            order.status}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {timeAgo(conversation.lastMessageTime)}
                      </p>
                      {hasUnread && (
                        <span className="mt-2 inline-block rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
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