import type { NextApiRequest, NextApiResponse } from "next";
import { logErrorToSlack } from "../../src/lib/slackErrorReporter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query" });

    console.log(`[AI Web Search] Querying DDG for: "${query}"`);

    // Use DuckDuckGo Instant Answer API — no API key required
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      query
    )}&format=json&no_html=1&skip_disambig=1`;
    const ddgRes = await fetch(ddgUrl, {
      headers: { "Accept-Encoding": "gzip" },
    });
    const ddg = await ddgRes.json();

    const snippets: string[] = [];

    // Main answer / definition
    if (ddg.AbstractText) snippets.push(ddg.AbstractText);
    if (ddg.Answer) snippets.push(ddg.Answer);

    // Related topics (encyclopedia-style entries)
    if (Array.isArray(ddg.RelatedTopics)) {
      for (const t of ddg.RelatedTopics) {
        if (t.Text && !t.Topics) snippets.push(t.Text);
        // Handle grouped topics (e.g. "Seafood" varieties)
        if (t.Topics) {
          for (const sub of t.Topics) {
            if (sub.Text) snippets.push(sub.Text);
          }
        }
        if (snippets.length >= 12) break;
      }
    }

    console.log(`[AI Web Search] Extracted ${snippets.length} snippets`);

    return res.status(200).json({
      query,
      // Return clean text only — no URLs passed to the AI
      results: snippets.slice(0, 12),
    });
  } catch (error: any) {
    console.error("AI Web Search Error:", error);
    await logErrorToSlack("AI Web Search API", error, {
      query: req.body?.query,
    });
    return res.status(500).json({ error: "Failed to fetch web data" });
  }
}
