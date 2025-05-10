import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  onSnapshot,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderType: 'customer' | 'shopper';
  message: string;
  timestamp: any;
  isRead: boolean;
  image?: string;
}

export interface ChatConversation {
  id?: string;
  orderId: string;
  customerId: string;
  shopperId: string;
  createdAt: any;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount: number;
}

/**
 * Create a new chat conversation between customer and shopper for an order
 */
export const createConversation = async (
  orderId: string, 
  customerId: string, 
  shopperId: string
): Promise<string> => {
  try {
    // Check if conversation already exists
    const existingConv = await getConversationByOrderId(orderId);
    if (existingConv) {
      return existingConv.id as string;
    }
    
    // Create new conversation
    const docRef = await addDoc(collection(db, "chat_conversations"), {
      orderId,
      customerId,
      shopperId,
      createdAt: serverTimestamp(),
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      unreadCount: 0
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

/**
 * Get a conversation by order ID
 */
export const getConversationByOrderId = async (orderId: string): Promise<ChatConversation | null> => {
  try {
    const q = query(collection(db, "chat_conversations"), where("orderId", "==", orderId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as ChatConversation;
  } catch (error) {
    console.error("Error getting conversation:", error);
    throw error;
  }
};

/**
 * Add a message to a conversation
 */
export const addMessage = async (
  conversationId: string, 
  message: string, 
  senderId: string,
  senderType: 'customer' | 'shopper',
  image?: string
): Promise<string> => {
  try {
    // Check if conversation exists
    const convRef = doc(db, "chat_conversations", conversationId);
    const convSnap = await getDoc(convRef);
    
    if (!convSnap.exists()) {
      throw new Error("Conversation not found");
    }
    
    // Add message to conversation
    const messagesRef = collection(db, "chat_conversations", conversationId, "messages");
    const messageData = {
      senderId,
      senderType,
      message,
      timestamp: serverTimestamp(),
      isRead: false,
      ...(image && { image })
    };
    
    const docRef = await addDoc(messagesRef, messageData);
    
    // Update conversation with last message
    await updateDoc(convRef, {
      lastMessage: message,
      lastMessageTime: serverTimestamp(),
      unreadCount: convSnap.data().unreadCount + 1
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
};

/**
 * Mark all messages in a conversation as read
 */
export const markMessagesAsRead = async (
  conversationId: string, 
  userId: string
): Promise<void> => {
  try {
    // Get messages where sender is not the current user and are unread
    const messagesRef = collection(db, "chat_conversations", conversationId, "messages");
    const q = query(messagesRef, where("senderId", "!=", userId), where("isRead", "==", false));
    const querySnapshot = await getDocs(q);
    
    // Update each message
    const updatePromises = querySnapshot.docs.map(doc => {
      return updateDoc(doc.ref, {
        isRead: true
      });
    });
    
    await Promise.all(updatePromises);
    
    // Reset unread count in conversation
    const convRef = doc(db, "chat_conversations", conversationId);
    await updateDoc(convRef, {
      unreadCount: 0
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

/**
 * Set up a listener for messages in a conversation
 */
export const listenForMessages = (
  conversationId: string, 
  callback: (messages: ChatMessage[]) => void
): () => void => {
  try {
    const messagesRef = collection(db, "chat_conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to regular Date if needed
        timestamp: doc.data().timestamp instanceof Timestamp 
          ? doc.data().timestamp.toDate() 
          : doc.data().timestamp
      })) as ChatMessage[];
      
      callback(messages);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error("Error setting up message listener:", error);
    throw error;
  }
};

/**
 * Get all conversations for a user (either customer or shopper)
 */
export const getUserConversations = async (
  userId: string, 
  userType: 'customer' | 'shopper'
): Promise<ChatConversation[]> => {
  try {
    const field = userType === 'customer' ? 'customerId' : 'shopperId';
    const q = query(
      collection(db, "chat_conversations"), 
      where(field, "==", userId),
      orderBy("lastMessageTime", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps
      createdAt: doc.data().createdAt instanceof Timestamp 
        ? doc.data().createdAt.toDate() 
        : doc.data().createdAt,
      lastMessageTime: doc.data().lastMessageTime instanceof Timestamp 
        ? doc.data().lastMessageTime.toDate() 
        : doc.data().lastMessageTime
    })) as ChatConversation[];
  } catch (error) {
    console.error("Error getting user conversations:", error);
    throw error;
  }
}; 