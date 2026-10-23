import React, { useCallback, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { deletePhrase, getVocabulary } from "@/services/vocabulary";
import { VocabularyItem } from "@/types/roleplay";
import { SpeakButton } from "@/components/SpeakButton";
import * as Speech from "expo-speech";

export default function VocabularyScreen() {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [error, setError] = useState("");

  useFocusEffect(useCallback(() => {
    let active = true;
    getVocabulary().then((value) => {
      if (active) { setItems(value); setError(""); }
    }).catch(() => { if (active) setError("Не вдалося відкрити словничок."); });
    return () => { active = false; void Speech.stop(); };
  }, []));

  async function handleDelete(phrase: string) {
    try {
      await deletePhrase(phrase);
      setItems(await getVocabulary());
    } catch {
      setError("Не вдалося видалити фразу.");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background-dark" edges={["top", "left", "right"]}>
      <View className="p-5 border-b border-slate-800">
        <Text className="text-xl font-bold text-white">Мій словничок</Text>
        <Text className="text-sm text-slate-400 mt-1">Збережено фраз: {items.length}</Text>
      </View>
      {error ? <Text className="text-amber-300 px-5 py-3">{error}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.phrase}
        contentContainerStyle={{ padding: 20, paddingBottom: 28 }}
        ListEmptyComponent={<Text className="text-slate-400 leading-6">Поки порожньо. Зберігайте корисні фрази з підказок під час розмови.</Text>}
        renderItem={({ item }) => (
          <View className="mb-3 rounded-2xl border border-slate-700 bg-background-card p-4">
            <Text className="text-base text-white font-semibold">{item.phrase}</Text>
            <Text className="text-sm text-slate-300 mt-2">{item.translation}</Text>
            <View className="flex-row items-center justify-between mt-2">
              <SpeakButton text={item.phrase} />
              <TouchableOpacity onPress={() => handleDelete(item.phrase)} accessibilityRole="button" accessibilityLabel={`Видалити: ${item.phrase}`} className="p-2">
                <Text className="text-xs text-red-300">Видалити</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
