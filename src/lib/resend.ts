import { Resend } from "resend";
import { insertSystemLog } from "../../pages/api/queries/system-logs";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn(
    "RESEND_API_KEY is not set in environment variables. Email sending will be mocked."
  );
}

// Fallback mock to prevent top-level crashes and API route failures
export const resend = resendApiKey
  ? new Resend(resendApiKey)
  : ({
      emails: {
        send: async (payload: any) => {
          console.warn(
            "[MOCK] Email sending disabled. Subject:",
            payload.subject,
            "To:",
            payload.to
          );
          return { id: "mock_email_id" };
        },
      },
    } as unknown as Resend);
