import { PindoSMS, SMSPayload } from "pindo-sms";

const pindo = new PindoSMS(process.env.PINDO_API_TOKEN!);

export const sendSMS = async (to: string, text: string) => {
  try {
    const payload: SMSPayload = {
      to,
      text,
      sender: "PindoTest", // Default sender ID
    };

    const response = await pindo.sendSMS(payload);
    return response;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    throw error;
  }
};
