import { env } from "../../../config/env.js";

export class OpenAILlmProvider {
  constructor({ apiKey = env.openAiApiKey, model = env.openAiLlmModel } = {}) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async polishSalesReply({ draftReply, transcript, intent, metadata, storeName }) {
    if (!this.apiKey) return draftReply;

    const payload = {
      model: this.model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are a Thai-first voice sales assistant for an e-commerce business. " +
                "Rewrite the draft reply in natural, polite Thai. " +
                "Be concise, helpful, not pushy, and never invent unavailable stock or policy details. " +
                "If the customer is asking about sales, make the reply warm and conversion-oriented.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(
                {
                  storeName,
                  transcript,
                  intent,
                  metadata,
                  draftReply,
                },
                null,
                2,
              ),
            },
          ],
        },
      ],
    };

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI LLM request failed: ${response.status} ${errorText}`);
    }

    const json = await response.json();
    return json.output_text?.trim() || draftReply;
  }
}
