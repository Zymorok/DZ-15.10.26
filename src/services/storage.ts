import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_KEY_STORAGE = "coach15_openrouter_key";
const MODEL_STORAGE = "coach15_selected_model";

async function readValue(name: string) {
  if (Platform.OS === "web") return sessionStorage.getItem(name);
  return SecureStore.getItemAsync(name);
}

async function writeValue(name: string, value: string) {
  if (Platform.OS === "web") sessionStorage.setItem(name, value);
  else await SecureStore.setItemAsync(name, value);
}

export async function saveApiKey(key: string): Promise<void> {
  await writeValue(API_KEY_STORAGE, key.trim());
}

/**
 * Отримує діючий API-ключ.
 * Пріоритет:
 * 1. Зашифроване сховище SecureStore (користувач ввів вручну в додатку).
 * 2. Змінна оточення EXPO_PUBLIC_OPENROUTER_API_KEY з файлу .env.
 */
export async function getApiKey(): Promise<string | null> {
  try {
    const key = await readValue(API_KEY_STORAGE);
    if (key && key.trim().length > 0) {
      return key.trim();
    }
  } catch {
    // Якщо SecureStore недоступний, переходимо до fallback на .env
  }

  const envKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }

  return null;
}

/**
 * Повертає ключ суто зі змінної оточення .env (якщо встановлено)
 */
export function getEnvApiKey(): string | null {
  const envKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  return envKey && envKey.trim().length > 0 ? envKey.trim() : null;
}

/**
 * Повертає ключ суто зі сховища SecureStore
 */
export async function getCustomApiKey(): Promise<string | null> {
  try {
    return await readValue(API_KEY_STORAGE);
  } catch {
    return null;
  }
}

export async function deleteApiKey(): Promise<void> {
  if (Platform.OS === "web") sessionStorage.removeItem(API_KEY_STORAGE);
  else await SecureStore.deleteItemAsync(API_KEY_STORAGE);
}

export async function saveSelectedModel(model: string): Promise<void> {
  await writeValue(MODEL_STORAGE, model);
}

export async function getSelectedModel(): Promise<string | null> {
  try {
    return await readValue(MODEL_STORAGE);
  } catch {
    return null;
  }
}
