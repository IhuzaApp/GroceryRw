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
  Timestamp,
  or,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export type ChatCollection = "chat_conversations" | "business_conversations";

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderType: "customer" | "shopper" | "business";
  message: string;
  timestamp: any;
  isRead: boolean;
  image?: string;
}

export interface ChatConversation {
  id?: string;
  collectionPath: ChatCollection;
  type?: "order" | "business";
  orderId?: string | null;
  businessId?: string; // The business that initiated the chat (e.g. RFQ creator)
  counterpartId?: string; // The person being talked to (e.g. Supplier)
  rfqId?: string; // Optional RFQ link
  title?: string; // Optional title (e.g. RFQ Title)
  customerId?: string;
  shopperId?: string;
  createdAt: any;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount: number;
}

/**
 * Create a new chat conversation
 */
export const createConversation = async (
  orderId: string | null,
  customerId: string,
  shopperId: string,
  type: "order" | "business" = "order",
  metadata?: Partial<ChatConversation>,
  customCollection: ChatCollection = "chat_conversations"
): Promise<string> => {
  try {
    console.log(
      `🔍 [Chat Service] Creating conversation in ${customCollection}:`,
      {
        orderId,
        customerId,
        shopperId,
        type,
        ...metadata,
      }
    );

    // Check if conversation already exists (for order type in chat_conversations)
    if (
      customCollection === "chat_conversations" &&
      type === "order" &&
      orderId
    ) {
      const existingConv = await getConversationByOrderId(orderId);
      if (existingConv) {
        console.log(
          "🔍 [Chat Service] Conversation already exists:",
          existingConv.id
        );
        return existingConv.id as string;
      }
    }

    // Create new conversation
    const conversationData: any = {
      type,
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      unreadCount: 0,
      ...metadata,
    };

    // Only populate customer/shopper IDs if they are explicitly provided or relevant
    if (customerId) conversationData.customerId = customerId;
    if (shopperId) conversationData.shopperId = shopperId;
    if (orderId) conversationData.orderId = orderId;

    const docRef = await addDoc(
      collection(db!, customCollection),
      conversationData
    );

    console.log(
      `🔍 [Chat Service] Conversation created in ${customCollection}:`,
      docRef.id
    );
    return docRef.id;
  } catch (error) {
    console.error(
      `❌ [Chat Service] Error creating conversation in ${customCollection}:`,
      error
    );
    throw error;
  }
};

/**
 * Get or create a business conversation (B2B / RFQ)
 */
export const getOrCreateBusinessConversation = async (
  businessId: string,
  counterpartId: string,
  rfqId?: string,
  title?: string
): Promise<string> => {
  try {
    const customCollection: ChatCollection = "business_conversations";

    // Check if a conversation between these two for this RFQ already exists
    const conversationsRef = collection(db!, customCollection);
    let q = query(
      conversationsRef,
      where("businessId", "==", businessId),
      where("counterpartId", "==", counterpartId)
    );

    if (rfqId) {
      q = query(q, where("rfqId", "==", rfqId));
    }

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }

    // Create new business conversation in business_conversations collection
    return await createConversation(
      null,
      "",
      "",
      "business",
      {
        businessId,
        counterpartId,
        rfqId,
        title: title || "Business Chat",
      },
      customCollection
    );
  } catch (error) {
    console.error(
      "❌ [Chat Service] Error in getOrCreateBusinessConversation:",
      error
    );
    throw error;
  }
};

/**
 * Get a conversation by order ID (exclusively from chat_conversations)
 */
export const getConversationByOrderId = async (
  orderId: string
): Promise<ChatConversation | null> => {
  try {
    const q = query(
      collection(db!, "chat_conversations"),
      where("orderId", "==", orderId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      collectionPath: "chat_conversations",
      ...doc.data(),
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
  senderType: "customer" | "shopper" | "business",
  image?: string,
  collectionPath: ChatCollection = "chat_conversations"
): Promise<string> => {
  try {
    console.log(`🔍 [Chat Service] Adding message to ${collectionPath}:`, {
      conversationId,
      message,
      senderId,
      senderType,
      image,
    });

    if (!conversationId || (!message && !image) || !senderId || !senderType) {
      throw new Error("Missing required parameters for message");
    }

    const convRef = doc(db!, collectionPath, conversationId);
    const convSnap = await getDoc(convRef);

    if (!convSnap.exists()) {
      throw new Error(
        `Conversation not found in ${collectionPath}: ${conversationId}`
      );
    }

    const messagesRef = collection(
      db!,
      collectionPath,
      conversationId,
      "messages"
    );

    const messageData = {
      senderId,
      senderType,
      message: message.trim(),
      timestamp: serverTimestamp(),
      isRead: false,
      ...(image && { image }),
    };

    const docRef = await addDoc(messagesRef, messageData);

    await updateDoc(convRef, {
      lastMessage: message.trim(),
      lastMessageTime: serverTimestamp(),
      unreadCount: (convSnap.data().unreadCount || 0) + 1,
    });

    return docRef.id;
  } catch (error) {
    console.error("❌ [Chat Service] Error adding message:", error);
    throw error;
  }
};

/**
 * Mark all messages in a conversation as read
 */
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string,
  collectionPath: ChatCollection = "chat_conversations"
): Promise<void> => {
  try {
    const messagesRef = collection(
      db!,
      collectionPath,
      conversationId,
      "messages"
    );
    const q = query(messagesRef, where("isRead", "==", false));
    const querySnapshot = await getDocs(q);

    // Filter by senderId locally to avoid needing a composite index for != combined with ==
    const updatePromises = querySnapshot.docs
      .filter((doc) => doc.data().senderId !== userId)
      .map((doc) => {
        return updateDoc(doc.ref, {
          isRead: true,
        });
      });

    await Promise.all(updatePromises);

    const convRef = doc(db!, collectionPath, conversationId);
    await updateDoc(convRef, {
      unreadCount: 0,
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
  collectionPath: ChatCollection,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  try {
    const messagesRef = collection(
      db!,
      collectionPath,
      conversationId,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp:
          doc.data().timestamp instanceof Timestamp
            ? doc.data().timestamp.toDate()
            : doc.data().timestamp,
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
 * Get all conversations for a user from a specific collection
 */
export const getCollectionConversations = async (
  userId: string,
  collectionPath: ChatCollection
): Promise<ChatConversation[]> => {
  try {
    const conversationsRef = collection(db!, collectionPath);
    let q;

    if (collectionPath === "chat_conversations") {
      q = query(
        conversationsRef,
        or(where("customerId", "==", userId), where("shopperId", "==", userId)),
        orderBy("lastMessageTime", "desc")
      );
    } else {
      q = query(
        conversationsRef,
        or(
          where("businessId", "==", userId),
          where("counterpartId", "==", userId)
        ),
        orderBy("lastMessageTime", "desc")
      );
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      collectionPath,
      ...doc.data(),
      createdAt:
        doc.data().createdAt instanceof Timestamp
          ? doc.data().createdAt.toDate()
          : doc.data().createdAt,
      lastMessageTime:
        doc.data().lastMessageTime instanceof Timestamp
          ? doc.data().lastMessageTime.toDate()
          : doc.data().lastMessageTime,
    })) as ChatConversation[];
  } catch (error) {
    console.error(`Error getting conversations from ${collectionPath}:`, error);
    throw error;
  }
};
