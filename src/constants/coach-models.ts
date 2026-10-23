import { AIModelOption } from "@/types";

export const AVAILABLE_MODELS: AIModelOption[] = [
  {
    id: "openrouter/free",
    name: "OpenRouter Free",
    description: "Автоматичний вибір безкоштовної моделі.",
    isFree: true,
    tier: "free",
  },
  {
    id: "nvidia/nemotron-3.5-super-vl:free",
    name: "NVIDIA Nemotron 3.5 Super VL",
    description: "Безкоштовна модель для діалогів і мовних підказок.",
    isFree: true,
    tier: "free",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o mini",
    description: "Платна модель. Потрібні кошти на балансі OpenRouter.",
    isFree: false,
    tier: "budget",
  },
];

export const DEFAULT_MODEL = "nvidia/nemotron-3.5-super-vl:free";
