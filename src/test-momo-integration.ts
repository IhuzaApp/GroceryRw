import { momoService } from "./lib/momoService";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function testMomo() {
  console.log("🚀 [Test] Starting MoMo Integration Test...");

  try {
    // 1. Test Token Generation
    console.log("\n1️⃣ Testing Token Generation...");
    const token = await momoService.getAccessToken();
    console.log("✅ Token received:", token ? "***TOKEN_SUCCESS***" : "FAILED");

    // 2. Test RequestToPay
    console.log("\n2️⃣ Testing RequestToPay...");
    const { referenceId } = await momoService.requestToPay({
      amount: "100",
      currency: "RWF",
      externalId: "TEST-ORDER-123",
      payerNumber: "250780000000",
      payerMessage: "Test Payment",
      payeeNote: "Success Test",
    });
    console.log("✅ Request accepted. Reference ID:", referenceId);

    // 3. Test Status Check
    console.log("\n3️⃣ Testing Status Check...");
    const statusData = await momoService.getPaymentStatus(referenceId);
    console.log("✅ Status retrieved:", statusData.status);
    console.log("Full status data:", JSON.stringify(statusData, null, 2));

    console.log("\n🎉 [Test] MoMo Integration Test Passed!");
  } catch (error) {
    console.error("\n❌ [Test] MoMo Integration Test Failed!");
    console.error(error);
    process.exit(1);
  }
}

testMomo();
