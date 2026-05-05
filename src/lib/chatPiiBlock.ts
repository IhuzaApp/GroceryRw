import { notifyPIIDetectionToSlack } from "./slackSystemNotifier";

/**
 * Chat PII blocking for security: prevent sending and mask display of
 * phone numbers and email addresses in customer/shopper chat.
 */

const PHONE_PATTERN =
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}(?:[-.\s]?\d{2,4})?|\b\d{7,15}\b/g;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const KEYWORD_PATTERN =
  /\b(whatsapp|number|email|contact|call|phone|reach me|talk outside|telegram|instagram|ig|dm me)\b/i;

const MASK_PHONE = "[phone not allowed]";
const MASK_EMAIL = "[email not allowed]";

export interface PiiCheckResult {
  blocked: boolean;
  reason?: "phone" | "email" | "keyword";
}

export interface PiiNotificationContext {
  senderId: string;
  senderName: string;
  conversationId: string;
}

/**
 * Returns whether the message contains blocked PII (phone or email).
 * Use before sending a message to block it and show an error.
 * If notificationContext is provided, it will notify Slack on detection.
 */
export function containsBlockedPii(
  text: string,
  notificationContext?: PiiNotificationContext
): PiiCheckResult {
  if (!text || typeof text !== "string") return { blocked: false };
  const t = text.trim();
  PHONE_PATTERN.lastIndex = 0;
  EMAIL_PATTERN.lastIndex = 0;

  const hasPhone = PHONE_PATTERN.test(t);
  const hasEmail = EMAIL_PATTERN.test(t);
  const hasKeyword = KEYWORD_PATTERN.test(t);

  if (hasPhone || hasEmail || hasKeyword) {
    const reason = hasPhone ? "phone" : hasEmail ? "email" : "keyword";

    if (notificationContext) {
      notifyPIIDetectionToSlack({
        ...notificationContext,
        message: t,
        detectedType:
          hasPhone && hasEmail
            ? "both"
            : ((hasPhone ? "phone" : hasEmail ? "email" : "keyword") as any),
      }).catch((err) => console.error("PII Slack notification failed:", err));
    }

    return { blocked: true, reason };
  }

  return { blocked: false };
}

/**
 * Sanitizes message text for display: masks any phone numbers and emails
 * so they are never shown in the chat UI (e.g. from old messages).
 */
export function sanitizeMessageForDisplay(text: string): string {
  if (!text || typeof text !== "string") return "";
  PHONE_PATTERN.lastIndex = 0;
  EMAIL_PATTERN.lastIndex = 0;
  let out = text.replace(PHONE_PATTERN, MASK_PHONE);
  PHONE_PATTERN.lastIndex = 0;
  EMAIL_PATTERN.lastIndex = 0;
  out = out.replace(EMAIL_PATTERN, MASK_EMAIL);
  return out;
}

export function getBlockedMessage(
  reason: "phone" | "email" | "keyword"
): string {
  if (reason === "phone")
    return "Sharing phone numbers is not allowed in chat for security.";
  if (reason === "email")
    return "Sharing email addresses is not allowed in chat for security.";
  return "For your security, please keep all conversations and contact details within this chat.";
}
