import type { NextApiRequest, NextApiResponse } from "next";
import { resend } from "../../../src/lib/resend";
import { sendSMS } from "../../../src/lib/pindo";
import { generatePosInvoicePdf } from "../../../src/lib/posInvoiceGenerator";
import { insertSystemLog } from "../queries/system-logs";
import { logErrorToSlack } from "../../../src/lib/slackErrorReporter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { formData, selectedPlan, billingCycle, invoiceNumber } = req.body;

  if (!formData || !selectedPlan) {
    return res.status(400).json({ error: "Missing required data" });
  }

  try {
    const amount =
      billingCycle === "yearly"
        ? selectedPlan.price_yearly
        : selectedPlan.price_monthly;
    const features = selectedPlan.modules?.map((m: any) => m.name) || [];

    // 1. Generate PDF Invoice
    const pdfDataUri = await generatePosInvoicePdf({
      invoiceNumber: invoiceNumber || `INV-POS-${Date.now()}`,
      businessName: formData.name,
      businessAddress: formData.address,
      businessEmail: formData.email,
      businessPhone: formData.phone,
      planName: selectedPlan.name,
      billingCycle: billingCycle,
      amount: amount,
      features: features,
      issuedAt: new Date().toLocaleDateString(),
      dueDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
    });

    // Extract base64 from Data URI
    const base64Content = pdfDataUri.split(",")[1];

    // 2. Send Business Email
    const businessEmailPromise = resend.emails.send({
      from: "PLAS POS <noreply@plas.rw>",
      to: formData.email,
      subject: `Welcome to PLAS POS - Application Received: ${formData.name}`,
      attachments: [
        {
          filename: `invoice-${formData.name
            .replace(/\s+/g, "-")
            .toLowerCase()}.pdf`,
          content: base64Content,
        },
      ],
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #43af4a;">Welcome to PLAS POS!</h2>
          <p>Dear ${formData.name} Team,</p>
          <p>Thank you for showing interest in <strong>PLAS POS</strong>. We have successfully received your registration and payment.</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; font-size: 16px;">Registration Summary</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Business Name:</strong> ${formData.name}</li>
              <li><strong>TIN Number:</strong> ${formData.tin}</li>
              <li><strong>Category:</strong> ${selectedPlan.name} Plan</li>
              <li><strong>Billing Cycle:</strong> ${billingCycle.toUpperCase()}</li>
              <li><strong>Contact:</strong> ${formData.phone}</li>
            </ul>
          </div>

          <p><strong>Your application is currently under review.</strong> our support agent will reach out to you shortly to finalize the verification and guide you through the next steps.</p>
          
          <h3 style="font-size: 16px;">What you'll have access to:</h3>
          <ul style="color: #555;">
            ${features.map((f: string) => `<li>${f}</li>`).join("")}
          </ul>

          <p>We've attached your official subscription invoice to this email for your records.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Thanks again for choosing PLAS. We look forward to working with you!</p>
        </div>
      `,
    });

    // 3. Send Admin Personal Email
    const adminEmailPromise = resend.emails.send({
      from: "PLAS POS <noreply@plas.rw>",
      to: formData.ownerEmail,
      subject: `Account Created Successfully - PLAS POS Admin`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #43af4a;">Hello ${formData.fullnames},</h2>
          <p>Your administrator account for <strong>${formData.name}</strong> has been created successfully.</p>
          
          <p>You can now sign in to your business dashboard to manage your products, sales, and staff once your business is approved.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://dash.plas.rw" style="background-color: #43af4a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Sign In to Your Account</a>
          </div>

          <p style="font-size: 14px; color: #555;">If the button above doesn't work, copy and paste this link into your browser:<br/>
          <a href="https://dash.plas.rw">https://dash.plas.rw</a></p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">If you did not expect this email, please ignore it.</p>
        </div>
      `,
    });

    // 4. Send Admin SMS
    const adminSmsPromise = sendSMS(
      formData.ownerPhone,
      `Hello ${formData.fullnames}, your POS account for ${formData.name} has been registered successfully. It is currently under review. Thank you for choosing PLAS!`
    );

    // Run all notifications
    await Promise.allSettled([
      businessEmailPromise,
      adminEmailPromise,
      adminSmsPromise,
    ]);

    await insertSystemLog(
      "info",
      `POS Registration successful: ${formData.name}`,
      "POS:Registration",
      { business: formData.name, email: formData.email, owner: formData.fullnames }
    );

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error sending POS registration notifications:", error);

    const log = await insertSystemLog(
      "error",
      `POS Registration failed: ${formData.name || 'Unknown'}`,
      "POS:Registration",
      { error: error.message, stack: error.stack }
    );

    await logErrorToSlack(
      "POS Registration API",
      error,
      { formData, selectedPlan, billingCycle },
      log?.id
    );

    return res
      .status(500)
      .json({ error: "Failed to send notifications", details: error.message });
  }
}
