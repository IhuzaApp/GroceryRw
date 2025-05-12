import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import RootLayout from '@components/ui/layout';
import Link from 'next/link';
import { Avatar, Button, Input, Loader, Panel } from 'rsuite';
import { 
  collection, query, where, orderBy, addDoc, 
  serverTimestamp, onSnapshot, Timestamp,
  doc, getDoc, updateDoc
} from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import { formatCurrency } from '../../src/lib/formatCurrency';

// Helper to format date for messages
function formatMessageDate(timestamp: any) {
  if (!timestamp) return '';
  
  const date = timestamp instanceof Timestamp 
    ? timestamp.toDate() 
    : new Date(timestamp);
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  if (isToday) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isYesterday) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
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

// Message component
interface MessageProps {
  message: Message;
  isCurrentUser: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isCurrentUser }) => {
  return (
    <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isCurrentUser ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-900'} p-3 rounded-lg`}>
        <div className="text-sm">{message.text}</div>
        <div className="text-xs text-right mt-1 text-gray-500">
          {formatMessageDate(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

// Chat page component
export default function ChatPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shopper, setShopper] = useState<any>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch order details
  useEffect(() => {
    if (orderId && status === 'authenticated') {
      const fetchOrder = async () => {
        try {
          const res = await fetch(`/api/queries/orderDetails?id=${orderId}`);
          const data = await res.json();
          
          if (data.order) {
            setOrder(data.order);
            
            // Fetch shopper details if available
            if (data.order.shopper_id) {
              const shopperDocRef = doc(db, 'shoppers', data.order.shopper_id);
              const shopperDoc = await getDoc(shopperDocRef);
              
              if (shopperDoc.exists()) {
                setShopper(shopperDoc.data());
              }
            }
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchOrder();
    }
  }, [orderId, status]);

  // Set up messages listener
  useEffect(() => {
    if (orderId && status === 'authenticated') {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('orderId', '==', orderId),
        orderBy('timestamp', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        
        setMessages(messagesList);
        
        // Mark messages as read
        messagesList.forEach(async (message) => {
          if (
            message.recipientId === session?.user?.id && 
            !message.read
          ) {
            const messageRef = doc(db, 'messages', message.id);
            await updateDoc(messageRef, { read: true });
          }
        });
        
        // Scroll to bottom after messages load
        setTimeout(scrollToBottom, 100);
      });
      
      return () => unsubscribe();
    }
  }, [orderId, session, status]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !session?.user?.id || !orderId || !order?.shopper_id) {
      return;
    }
    
    try {
      // Add new message to Firestore
      await addDoc(collection(db, 'messages'), {
        orderId,
        text: newMessage.trim(),
        senderId: session.user.id,
        senderName: session.user.name || 'Customer',
        recipientId: order.shopper_id,
        timestamp: serverTimestamp(),
        read: false
      });
      
      // Clear input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <RootLayout>
        <div className="p-4 md:ml-16">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center mb-6">
              <Link href="/Messages" passHref>
                <Button appearance="link" className="mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Loading...</h1>
            </div>
            <div className="flex justify-center p-12">
              <Loader size="lg" content="Loading messages..." />
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
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center mb-6">
              <Link href="/Messages" passHref>
                <Button appearance="link" className="mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Chat</h1>
            </div>
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

  // Render order not found
  if (!order) {
    return (
      <RootLayout>
        <div className="p-4 md:ml-16">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center mb-6">
              <Link href="/Messages" passHref>
                <Button appearance="link" className="mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Chat</h1>
            </div>
            <div className="rounded-lg bg-yellow-50 p-6 text-center">
              <h2 className="mb-4 text-xl font-semibold text-yellow-700">Order Not Found</h2>
              <p className="mb-6 text-yellow-600">
                The order you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Link href="/Messages" passHref>
                <Button appearance="primary" color="yellow">
                  Return to Messages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Link href="/Messages" passHref>
              <Button appearance="link" className="mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">
              Chat: Order #{formatOrderID(order.OrderID)}
            </h1>
          </div>
          
          {/* Order info panel */}
          <Panel bordered className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">
                  {order.shop?.name || 'Shop'}
                </h3>
                <p className="text-gray-600">
                  Status: <span className="font-medium">{order.status}</span>
                </p>
                <p className="text-gray-600">
                  Total: <span className="font-medium">{formatCurrency(order.total)}</span>
                </p>
              </div>
              <div className="text-right">
                <Link href={`/CurrentPendingOrders/viewOrderDetails?id=${order.id}`} passHref>
                  <Button appearance="ghost" color="blue">
                    View Order Details
                  </Button>
                </Link>
              </div>
            </div>
            
            {shopper && (
              <div className="flex items-center mt-4 pt-4 border-t">
                <Avatar circle className="mr-3" size="sm">
                  {shopper.name ? shopper.name.charAt(0).toUpperCase() : 'S'}
                </Avatar>
                <div>
                  <p className="font-medium">
                    Your Shopper: {shopper.name || 'Shopper'}
                  </p>
                  {shopper.phone && (
                    <p className="text-sm text-gray-600">
                      Contact: {shopper.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </Panel>
          
          {/* Messages container */}
          <Panel bordered className="mb-4 p-0 overflow-hidden flex flex-col" style={{ height: '60vh' }}>
            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No messages yet. Send a message to your shopper!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <Message 
                    key={message.id}
                    message={message}
                    isCurrentUser={message.senderId === session?.user?.id}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message input */}
            <div className="border-t p-3 bg-gray-50">
              <form onSubmit={handleSendMessage} className="flex">
                <Input 
                  value={newMessage}
                  onChange={(value) => setNewMessage(value)}
                  placeholder="Type a message..."
                  className="flex-1 mr-2"
                />
                <Button 
                  appearance="primary" 
                  color="green"
                  type="submit"
                  disabled={!newMessage.trim()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </Button>
              </form>
            </div>
          </Panel>
        </div>
      </div>
    </RootLayout>
  );
} 