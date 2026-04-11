import "dotenv/config";
import { PindoSMS } from "pindo-sms";

async function testSMS() {
  const token = process.env.PINDO_API_TOKEN;
  if (!token) {
    console.error("❌ PINDO_API_TOKEN not found");
    return;
  }

  const pindo = new PindoSMS(token);
  const phoneNumber = "+250783332000";
  const message = 'Test with final "plas" sender ID.';

  try {
    const result = await pindo.sendSMS({
      to: phoneNumber,
      text: message,
      sender: "Plas",
    });
    console.log('✅ Success! Sender ID "plas" works.');
    console.log("ID:", result.sms_id);
  } catch (err: any) {
    console.error("❌ Error:", err.message || err);
  }
}

testSMS();
