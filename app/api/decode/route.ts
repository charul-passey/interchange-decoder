import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { network, cardType, merchantCategory } = await req.json();

    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `You are a payments expert. Provide accurate interchange fee data for:
- Card network: ${network}
- Card type: ${cardType}
- Merchant category: ${merchantCategory}

Return ONLY valid JSON with no markdown:
{
  "rate": "e.g. 1.80% + $0.10",
  "issuerCut": "e.g. 1.60% + $0.05",
  "networkFee": "e.g. 0.13%",
  "acquirerMarkup": "e.g. 0.07% + $0.05 (typical range)",
  "explanation": "2-3 sentence plain-English explanation of why this specific rate applies to this card/merchant combo",
  "tips": ["specific actionable tip for a merchant in this category", "another tip", "a third tip"],
  "regulatoryContext": "Any relevant regulation (e.g. Durbin Amendment for debit, Amex opt-out rules) or leave empty string"
}`
      }]
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim()
      .replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    return NextResponse.json(JSON.parse(raw));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
