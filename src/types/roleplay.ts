export type LanguageLevel = "A2" | "B1" | "B2";

export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  role: string;
  situation: string;
}

export interface Feedback {
  hasCorrection: boolean;
  correction: string;
  betterPhrasing: string;
  translation: string;
}

export interface RoleplayReply extends Feedback {
  reply: string;
}

export interface RoleplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  feedback?: Feedback;
}

export interface VocabularyItem {
  phrase: string;
  translation: string;
}

export interface SessionSummary {
  score: number;
  mistakes: string[];
  expressions: VocabularyItem[];
}
