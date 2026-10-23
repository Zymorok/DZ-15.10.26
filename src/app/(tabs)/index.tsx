import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { LEVELS, SCENARIOS } from "@/constants/scenarios";
import { LanguageLevel } from "@/types/roleplay";
import { getApiKey } from "@/services/storage";

export default function HomeScreen() {
  const router = useRouter();
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [level, setLevel] = useState<LanguageLevel>("B1");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [error, setError] = useState("");

  useFocusEffect(useCallback(() => {
    let active = true;
    getApiKey().then((key) => { if (active) setHasApiKey(!!key); });
    return () => { active = false; };
  }, []));

  async function handleStart() {
    if (!await getApiKey()) {
      setError("Спочатку додайте ключ OpenRouter у налаштуваннях.");
      return;
    }
    setError("");
    // Перехід на екран співбесіди з передачею параметрів
    router.push({ pathname: "/roleplay", params: { scenarioId, level } });
  }

  return (
    <SafeAreaView className="flex-1 bg-background-dark" edges={["top", "left", "right"]}>
      {/* Верхня панель */}
      <View className="border-b border-slate-800 px-5 py-4">
        <Text className="text-xl font-bold text-white">Language Coach</Text>
        <Text className="mt-1 text-sm text-slate-400">Англійська для реальних ситуацій</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28 }}>
        {/* Статус ключа */}
        <TouchableOpacity onPress={() => router.push("/(tabs)/settings")} accessibilityRole="button">
          <Text className={hasApiKey ? "text-emerald-400 text-sm mb-5" : "text-amber-400 text-sm mb-5"}>
            {hasApiKey ? "● Ключ додано · Налаштування" : "● Додайте ключ OpenRouter →"}
          </Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white mb-3">Оберіть ситуацію</Text>
        {/* Список тем */}
        <View className="gap-3">
          {SCENARIOS.map((scenario) => (
            <TouchableOpacity
              key={scenario.id}
              accessibilityRole="button"
              accessibilityLabel={scenario.title}
              accessibilityState={{ selected: scenarioId === scenario.id }}
              onPress={() => setScenarioId(scenario.id)}
              className={`rounded-2xl border p-4 ${scenarioId === scenario.id ? "border-blue-400 bg-blue-950" : "border-slate-700 bg-background-card"}`}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">{scenario.icon}</Text>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-white">{scenario.title}</Text>
                  <Text className="mt-1 text-xs leading-5 text-slate-300">{scenario.description}</Text>
                </View>
                {scenarioId === scenario.id ? <Text className="text-blue-300">✓</Text> : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* Вибір рівня */}
        <Text className="text-lg font-bold text-white mt-6 mb-3">Ваш рівень</Text>
        <View className="flex-row gap-3">
          {LEVELS.map((item) => (
            <TouchableOpacity
              key={item}
              accessibilityRole="button"
              accessibilityLabel={`Рівень ${item}`}
              accessibilityState={{ selected: level === item }}
              onPress={() => setLevel(item)}
              className={`flex-1 rounded-xl border py-3 items-center ${level === item ? "border-blue-400 bg-primary" : "border-slate-700 bg-background-card"}`}
            >
              <Text className="font-bold text-white">{item}</Text>
              <Text className="text-[10px] text-slate-200 mt-1">
                {item === "A2" ? "Початковий" : item === "B1" ? "Середній" : "Вище середнього"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {error ? <Text accessibilityRole="alert" className="text-amber-300 mt-4">{error}</Text> : null}
        {/* Кнопка старту */}
        <TouchableOpacity onPress={handleStart} accessibilityRole="button" className="mt-5 rounded-2xl bg-primary p-4 items-center">
          <Text className="font-bold text-white">Почати розмову</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
