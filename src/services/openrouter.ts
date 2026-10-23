import { OpenRouterAPIMessage } from "@/types";
import { getApiKey, getSelectedModel } from "./storage";
import { AVAILABLE_MODELS, DEFAULT_MODEL } from "@/constants/coach-models";

export interface SendChatOptions {
  messages: OpenRouterAPIMessage[];
  temperature?: number;
  maxTokens?: number;
}

export async function sendChatToOpenRouter({
  messages,
  temperature = 0.7,
  maxTokens = 1800,
}: SendChatOptions): Promise<string> {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error("API-ключ відсутній. Будь ласка, вкажіть ключ у налаштуваннях.");
  }

  const savedModel = await getSelectedModel();
  const validModelIds = AVAILABLE_MODELS.map((m) => m.id);
  const model = savedModel && validModelIds.includes(savedModel) ? savedModel : DEFAULT_MODEL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const request = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-OpenRouter-Title": "AI Language Roleplay Coach",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        provider: { require_parameters: true },
      }),
    });

    if (request.status === 401) throw new Error("Невірний API-ключ. Перевірте його у налаштуваннях.");
    if (request.status === 402) throw new Error("Недостатньо коштів. Оберіть безкоштовну модель у налаштуваннях.");
    if (request.status === 429) throw new Error("Ліміт запитів вичерпано. Зачекайте або оберіть іншу модель.");
    if (!request.ok) throw new Error(`OpenRouter тимчасово недоступний (${request.status}). Спробуйте ще раз або змініть модель.`);
    const response = await request.json();

    if (!("choices" in response) || !response.choices || response.choices.length === 0) {
      throw new Error("Модель повернула пусту відповідь.");
    }

    const choice = response.choices[0];
    let rawContent = "";

    if (typeof choice.message?.content === "string") {
      rawContent = choice.message.content;
    } else if (Array.isArray(choice.message?.content)) {
      rawContent = (choice.message.content as { text?: string }[])
        .map((item) => item.text || "")
        .join("");
    }

    // Видаляємо теги <think>...</think> та внутрішні роздуми моделі
    rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "");
    rawContent = rawContent.replace(/^<think>[\s\S]*$/gi, "");

    const cleanReply = rawContent.trim();
    if (!cleanReply) {
      throw new Error("Модель повернула пусту відповідь.");
    }

    return cleanReply;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("AI не відповів вчасно. Спробуйте ще раз.");
    }
    if (error instanceof TypeError) throw new Error("Немає зв’язку з OpenRouter. Перевірте інтернет.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
