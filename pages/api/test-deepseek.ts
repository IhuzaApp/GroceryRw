import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "DeepSeek API key not configured" });
  }

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("DeepSeek API error:", errorData);
      return res.status(response.status).json({
        error: `DeepSeek API error: ${response.statusText}`,
        details: errorData,
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      response: data.choices[0]?.message?.content || "No response",
      fullData: data,
    });
  } catch (error: any) {
    console.error("Error calling DeepSeek API:", error);
    return res.status(500).json({
      error: "Failed to call DeepSeek API",
      details: error.message,
    });
  }
}
