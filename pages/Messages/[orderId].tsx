import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import RootLayout from '@components/ui/layout';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, Button, Input, Loader, Panel } from 'rsuite';
import { 
  collection, query, where, orderBy, addDoc, 
  serverTimestamp, onSnapshot, Timestamp,
  doc, getDoc, updateDoc, getDocs
} from 'firebase/firestore';
import { db, storage } from '../../src/lib/firebase';
import { formatCurrency } from '../../src/lib/formatCurrency';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
  text?: string;         // Customer message format
  message?: string;      // Shopper message format (for compatibility)
  senderId: string;
  senderType: "customer" | "shopper";
  recipientId: string;
  timestamp: any;
  read: boolean;
  image?: string;
}

// Message component
interface MessageProps {
  message: Message;
  isCurrentUser: boolean;
  senderName: string;
}

const Message: React.FC<MessageProps> = ({ message, isCurrentUser, senderName }) => {
  // Get message content from either text or message field
  const messageContent = message.text || message.message || "";
  
  return (
    <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <Avatar
          src="/placeholder.svg?height=40&width=40"
          alt="Shopper"
          size="xs"
          circle
          className="mr-2 self-end"
        />
      )}
      <div className={`max-w-[75%] ${isCurrentUser ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-900'} p-3 rounded-lg`}>
        {!isCurrentUser && (
          <div className="text-xs font-medium mb-1 text-gray-600">{senderName}</div>
        )}
        <div className="text-sm whitespace-pre-wrap">{messageContent}</div>
        {message.image && (
          <div className="mt-2">
            <Image
              src={message.image}
              alt="Shared image"
              width={300}
              height={200}
              className="max-w-full rounded-lg"
            />
          </div>
        )}
        <div className="mt-1 flex items-center justify-end">
          <span className="text-xs text-gray-500">
            {formatMessageDate(message.timestamp)}
          </span>
        </div>
      </div>
      {isCurrentUser && (
        <Avatar
          src="/placeholder.svg?height=40&width=40"
          alt="You"
          size="xs"
          circle
          className="ml-2 self-end"
        />
      )}
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
  const [isSending, setIsSending] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shopper, setShopper] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

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
            // The shopper ID might be in assignedTo.id or shopper_id
            const shopperId = data.order.assignedTo?.id || data.order.shopper_id;
            if (shopperId) {
              setShopper({
                id: shopperId,
                name: data.order.assignedTo?.name || "Shopper",
                avatar: data.order.assignedTo?.profile_picture || "/placeholder.svg?height=80&width=80"
              });
              
              // Get or create conversation immediately if we have shopper ID
              if (session?.user?.id) {
                getOrCreateConversation(shopperId);
              }
            } else {
              console.error("No shopper assigned to this order");
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
  }, [orderId, status, session?.user?.id]);

  // Get or create conversation
  const getOrCreateConversation = async (shopperId: string) => {
    if (!orderId || !session?.user?.id) return;

    try {
      console.log("Creating conversation with:", {
        orderId,
        customerId: session.user.id,
        shopperId
      });
      
      // Check if conversation exists
      const conversationsRef = collection(db, "chat_conversations");
      const q = query(
        conversationsRef,
        where("orderId", "==", orderId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Conversation exists
        const conversationDoc = querySnapshot.docs[0];
        console.log("Found existing conversation:", conversationDoc.id);
        setConversationId(conversationDoc.id);
      } else {
        // Create new conversation
        const newConversation = {
          orderId,
          customerId: session.user.id,
          shopperId: shopperId,
          createdAt: serverTimestamp(),
          lastMessage: "",
          lastMessageTime: serverTimestamp(),
          unreadCount: 0,
        };
        
        console.log("Creating new conversation:", newConversation);
        const docRef = await addDoc(conversationsRef, newConversation);
        console.log("Created conversation:", docRef.id);
        setConversationId(docRef.id);
      }
    } catch (error) {
      console.error("Error getting/creating conversation:", error);
    }
  };

  // Set up messages listener
  useEffect(() => {
    if (!conversationId || !session?.user?.id) return;
    
    console.log("Setting up message listener for conversation:", conversationId);
    
    // Set up listener for messages in this conversation
    const messagesRef = collection(db, "chat_conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Messages snapshot received, count:", snapshot.docs.length);
      
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to regular Date if needed
        timestamp: doc.data().timestamp instanceof Timestamp
          ? doc.data().timestamp.toDate()
          : doc.data().timestamp,
      })) as Message[];
      
      console.log("Processed messages:", messagesList);
      setMessages(messagesList);
      
      // Mark messages as read if they were sent to the current user
      messagesList.forEach(async (message) => {
        if (
          message.senderType === "shopper" && 
          !message.read
        ) {
          const messageRef = doc(db, "chat_conversations", conversationId, "messages", message.id);
          await updateDoc(messageRef, { read: true });
          
          // Update unread count in conversation
          const convRef = doc(db, "chat_conversations", conversationId);
          await updateDoc(convRef, {
            unreadCount: 0,
          });
        }
      });
      
      // Scroll to bottom after messages load
      setTimeout(scrollToBottom, 100);
    }, (error) => {
      console.error("Error in messages listener:", error);
    });
    
    return () => unsubscribe();
  }, [conversationId, session?.user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!newMessage.trim() || !session?.user?.id || !conversationId || !shopper?.id) {
      console.log("Cannot send message, missing data:", {
        hasMessage: !!newMessage.trim(),
        hasUser: !!session?.user?.id,
        hasConversation: !!conversationId,
        hasShopperId: !!shopper?.id
      });
      return;
    }
    
    try {
      setIsSending(true);
      
      console.log("Sending message:", {
        text: newMessage.trim(),
        senderId: session.user.id,
        senderName: session.user.name || 'Customer',
        recipientId: shopper.id
      });
      
      // Add new message to Firestore
      const messagesRef = collection(db, "chat_conversations", conversationId, "messages");
      await addDoc(messagesRef, {
        text: newMessage.trim(),     // Use text field for customer messages
        message: newMessage.trim(),  // Also include message field for compatibility
        senderId: session.user.id,
        senderName: session.user.name || 'Customer',
        senderType: "customer",
        recipientId: shopper.id,
        timestamp: serverTimestamp(),
        read: false
      });
      
      // Update conversation with last message
      const convRef = doc(db, "chat_conversations", conversationId);
      await updateDoc(convRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        unreadCount: 1, // Increment unread count for shopper
      });
      
      // Clear input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachmentClick = () => {
    setShowAttachmentOptions(!showAttachmentOptions);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !session?.user?.id || !conversationId || !shopper?.id) return;
    
    try {
      setUploadingImage(true);
      const file = e.target.files[0];
      
      console.log("Uploading image for conversation:", conversationId);
      
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `chat_images/${orderId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log("Image uploaded, URL:", downloadURL);
      
      // Add message with image
      const messagesRef = collection(db, "chat_conversations", conversationId, "messages");
      await addDoc(messagesRef, {
        text: "",         // Use text field for customer messages
        message: "",      // Also include message field for compatibility
        senderId: session.user.id,
        senderName: session.user.name || 'Customer',
        senderType: "customer",
        recipientId: shopper.id,
        timestamp: serverTimestamp(),
        read: false,
        image: downloadURL
      });
      
      // Update conversation
      const convRef = doc(db, "chat_conversations", conversationId);
      await updateDoc(convRef, {
        lastMessage: "📷 Image",
        lastMessageTime: serverTimestamp(),
        unreadCount: 1, // Increment unread count for shopper
      });
      
      setShowAttachmentOptions(false);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
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
              <h1 className="text-2xl font-bold">Sign In Required</h1>
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
              <h1 className="text-2xl font-bold">Order Not Found</h1>
            </div>
            <div className="rounded-lg bg-red-50 p-6 text-center">
              <h2 className="mb-4 text-xl font-semibold text-red-700">Order Not Found</h2>
              <p className="mb-6 text-red-600">The order you are looking for does not exist or you don't have access to it.</p>
              <Link href="/Messages" passHref>
                <Button appearance="primary" color="red">
                  Back to Messages
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
              Chat with {shopper?.name || 'Shopper'}
            </h1>
          </div>

          {/* Order Info */}
          <Panel shaded bordered className="mb-6">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  Order #{formatOrderID(order.OrderID)}
                </h3>
                <p className="text-sm text-gray-500">
                  {order.shop?.name || 'Shop'}
                </p>
              </div>
              <div className="text-right">
                <div className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  {order.status === 'shopping' ? 'Shopping' : 
                    order.status === 'packing' ? 'Packing' : 
                    order.status === 'on_the_way' ? 'On the way' : 
                    order.status}
                </div>
                <p className="mt-1 text-sm font-bold">
                  {formatCurrency(order.total || 0)}
                </p>
              </div>
            </div>
          </Panel>

          {/* Chat Messages */}
          <Panel shaded bordered className="mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
            <div className="p-4">
              {messages.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-gray-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mb-3 h-12 w-12"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p>No messages yet</p>
                  <p className="text-sm">
                    Start the conversation with your shopper
                  </p>
                </div>
              ) : (
                <div>
                  {messages.map((message) => (
                    <Message
                      key={message.id}
                      message={message}
                      isCurrentUser={message.senderType === "customer"}
                      senderName={message.senderType === "shopper" ? (shopper?.name || "Shopper") : "You"}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </Panel>

          {/* Message Input */}
          <Panel shaded bordered>
            <div className="relative">
              <div className="flex items-center">
                <div className="relative">
                  <Button
                    appearance="subtle"
                    className="flex h-10 w-10 items-center justify-center p-0"
                    onClick={handleAttachmentClick}
                    disabled={isSending || uploadingImage}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5 text-gray-500"
                    >
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                    </svg>
                  </Button>

                  {/* Attachment Options Popup */}
                  {showAttachmentOptions && (
                    <div className="absolute bottom-12 left-0 z-10 rounded-lg bg-white p-2 shadow-lg">
                      <div className="flex flex-col gap-2">
                        <button
                          className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5 text-blue-500"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span>Gallery</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                <textarea
                  className="flex-1 resize-none rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={1}
                  style={{ maxHeight: "100px" }}
                  disabled={isSending || uploadingImage}
                />

                <Button
                  appearance={newMessage.trim() ? "primary" : "subtle"}
                  className={`ml-2 flex h-10 w-10 items-center justify-center rounded-full p-0 ${
                    newMessage.trim() ? "bg-blue-500 text-white" : "text-gray-400"
                  }`}
                  onClick={() => handleSendMessage()}
                  disabled={(!newMessage.trim() && !uploadingImage) || isSending}
                >
                  {isSending || uploadingImage ? (
                    <Loader size="sm" />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                    >
                      <path d="M22 2L11 13" />
                      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  )}
                </Button>
              </div>

              {/* Quick Replies */}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  appearance="ghost"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setNewMessage("How's my order going?")}
                >
                  How's my order going?
                </Button>
                <Button
                  appearance="ghost"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setNewMessage("Any issues with my items?")}
                >
                  Any issues with items?
                </Button>
                <Button
                  appearance="ghost"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setNewMessage("Thanks for your help!")}
                >
                  Thanks!
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </RootLayout>
  );
} 