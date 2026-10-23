import AsyncStorage from "@react-native-async-storage/async-storage";
import { VocabularyItem } from "@/types/roleplay";

const STORAGE_KEY = "language_coach_vocabulary";

export async function getVocabulary(): Promise<VocabularyItem[]> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (!value) return [];
  try {
    const items = JSON.parse(value);
    return Array.isArray(items) ? items.filter((item) =>
      item && typeof item.phrase === "string" && typeof item.translation === "string") : [];
  } catch {
    return [];
  }
}

export async function savePhrase(item: VocabularyItem) {
  const items = await getVocabulary();
  if (items.some((saved) => saved.phrase.toLowerCase() === item.phrase.toLowerCase())) return;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([item, ...items]));
}

export async function deletePhrase(phrase: string) {
  const items = await getVocabulary();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items.filter((item) => item.phrase !== phrase)));
}
