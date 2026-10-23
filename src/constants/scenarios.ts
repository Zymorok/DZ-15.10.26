import { LanguageLevel, Scenario } from "@/types/roleplay";

export const LEVELS: LanguageLevel[] = ["A2", "B1", "B2"];

export const SCENARIOS: Scenario[] = [
  {
    id: "coffee",
    title: "Coffee Break Small Talk",
    description: "Розмова з колегою про вихідні, погоду та хобі.",
    icon: "☕",
    role: "a friendly colleague",
    situation: "You meet the learner at the office coffee machine. Discuss weekends, weather and hobbies.",
  },
  {
    id: "standup",
    title: "Daily Scrum Standup",
    description: "Учорашні задачі, сьогоднішні плани та перешкоди.",
    icon: "💼",
    role: "a supportive Scrum team lead",
    situation: "Run a daily standup. Ask what the learner did yesterday, plans for today and any blockers.",
  },
  {
    id: "client",
    title: "Client Demo & Requirements",
    description: "Демонстрація роботи та уточнення вимог замовника.",
    icon: "🤝",
    role: "a client reviewing a software demo",
    situation: "Discuss a software demo, clarify requirements and give constructive client feedback.",
  },
  {
    id: "airport",
    title: "Airport Passport Control",
    description: "Мета подорожі, документи та відповіді офіцеру.",
    icon: "✈️",
    role: "a polite passport control officer",
    situation: "Ask about travel purpose, length of stay and accommodation. Do not request real passport numbers or private documents.",
  },
];
