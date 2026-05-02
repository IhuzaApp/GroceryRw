import MessagesPage from "./index";

/**
 * Specialized route for deep-linking to a specific order conversation.
 * It reuses the main MessagesPage component which already handles
 * auto-selection via the 'orderId' query parameter.
 */
export default MessagesPage;
