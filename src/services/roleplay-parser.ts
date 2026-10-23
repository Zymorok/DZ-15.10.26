import { RoleplayReply, SessionSummary } from "@/types/roleplay";

function parseObject(text: string) {
  const clean = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("AI повернув відповідь без потрібного формату. Спробуйте ще раз.");
  }
  try {
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    throw new Error("Не вдалося прочитати відповідь AI. Спробуйте ще раз.");
  }
}

export function parseReply(text: string, needsFeedback = false): RoleplayReply {
  const data = parseObject(text);
  if (
    typeof data?.reply !== "string" || !data.reply.trim() ||
    typeof data.hasCorrection !== "boolean" ||
    typeof data.correction !== "string" ||
    typeof data.betterPhrasing !== "string" ||
    typeof data.translation !== "string" ||
    (data.hasCorrection && !data.correction.trim()) ||
    (needsFeedback && (!data.betterPhrasing.trim() || !data.translation.trim()))
  ) {
    throw new Error("У відповіді AI бракує репліки або пояснення. Спробуйте ще раз.");
  }
  return data;
}

export function parseSummary(text: string): SessionSummary {
  const data = parseObject(text);
  if (
    !Number.isInteger(data?.score) || data.score < 1 || data.score > 10 ||
    !Array.isArray(data.mistakes) ||
    !data.mistakes.every((item: unknown) => typeof item === "string") ||
    !Array.isArray(data.expressions) || data.expressions.length !== 3 ||
    !data.expressions.every((item: { phrase?: unknown; translation?: unknown }) =>
      item && typeof item.phrase === "string" && item.phrase.trim() &&
      typeof item.translation === "string" && item.translation.trim())
  ) {
    throw new Error("AI повернув неповний підсумок. Спробуйте завершити розмову ще раз.");
  }
  return data;
}
