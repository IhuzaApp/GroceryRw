import { PindoSMS, SMSPayload } from "pindo-sms";

const pindo = new PindoSMS(process.env.PINDO_API_TOKEN!);

const formatPhoneForPindo = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, "");
  if (!phone.startsWith("+")) {
    if (cleanPhone.startsWith("0")) {
      return "+250" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("250")) {
      return "+250" + cleanPhone;
    } else {
      return "+" + cleanPhone;
    }
  }
  return phone;
};

export const sendSMS = async (to: string, text: string) => {
  try {
    const formattedTo = formatPhoneForPindo(to);
    const payload: SMSPayload = {
      to: formattedTo,
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
