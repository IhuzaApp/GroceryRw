import { notifyPIIDetectionToSlack } from "./slackSystemNotifier";

/**
 * Regex for detecting phone numbers.
 * Matches common formats: +123..., 07..., (123) ..., etc.
 */
const PHONE_REGEX =
  /(\+?\d{1,4}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4,6}|(\+?\d{10,14})/g;

/**
 * Regex for detecting email addresses.
 */
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export interface CheckPIIParams {
  message: string;
  senderId: string;
  senderName: string;
  conversationId: string;
}

/**
 * Checks a message for PII (phone or email) and notifies Slack if found.
 * Does NOT block the message, just logs it for security review.
 */
export async function checkAndNotifyPII(params: CheckPIIParams) {
  const { message, senderId, senderName, conversationId } = params;

  const hasPhone = PHONE_REGEX.test(message);
  const hasEmail = EMAIL_REGEX.test(message);

  if (hasPhone || hasEmail) {
    let detectedType: "phone" | "email" | "both" = "phone";
    if (hasPhone && hasEmail) detectedType = "both";
    else if (hasEmail) detectedType = "email";

    await notifyPIIDetectionToSlack({
      senderId,
      senderName,
      conversationId,
      message,
      detectedType,
    });

    return true;
  }

  return false;
}
