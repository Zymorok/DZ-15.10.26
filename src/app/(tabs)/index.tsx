import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { INTERVIEW_TOPICS, INTERVIEW_LEVELS, InterviewTopic } from "@/constants/topics";
import { getCustomApiKey, getEnvApiKey, getApiKey } from "@/services/storage";

export default function HomeScreen() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<InterviewTopic>(INTERVIEW_TOPICS[0]);
  const [selectedLevel, setSelectedLevel] = useState<typeof INTERVIEW_LEVELS[number]>(INTERVIEW_LEVELS[1]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [keySource, setKeySource] = useState<"secure_store" | "env" | null>(null);

  useFocusEffect(
    useCallback(() => {
      checkKey();
    }, [])
  );

  const checkKey = async () => {
    const customKey = await getCustomApiKey();
    if (customKey) {
      setHasApiKey(true);
      setKeySource("secure_store");
      return;
    }
    const envKey = getEnvApiKey();
    if (envKey) {
      setHasApiKey(true);
      setKeySource("env");
      return;
    }
    setHasApiKey(false);
    setKeySource(null);
  };

  const handleStart = async () => {
    const key = await getApiKey();
    if (!key) {
      Alert.alert(
        "API-ключ відсутній",
        "Для проходження співбесіди налаштуйте безкоштовний ключ OpenRouter у вкладці Налаштування або вкажіть його у файлі .env.",
        [
          { text: "Скасувати", style: "cancel" },
          { text: "Налаштувати", onPress: () => router.push("/(tabs)/settings") },
        ]
      );
      return;
    }

    // Перехід на екран співбесіди з передачею параметрів
    router.push({
      pathname: "/interview",
      params: {
        topicId: selectedTopic.id,
        levelId: selectedLevel.id,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      {/* Верхня панель */}
      <View className="flex-row items-center justify-between border-b border-slate-800 px-5 py-3 bg-slate-900/60">
        <Text className="text-xl font-extrabold text-white">AI Interviewer</Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/settings")}
          className="rounded-full bg-slate-800 p-2 border border-slate-700 active:bg-slate-700"
        >
          <Text className="text-xs">⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerClassName="p-4 pb-6" showsVerticalScrollIndicator={false}>
        {/* Статус ключа */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/settings")}
          activeOpacity={0.8}
          className={`flex-row items-center gap-2 rounded-full px-3.5 py-1 mb-3 self-start border ${
            hasApiKey
              ? "bg-accent-success/20 border-accent-success/40"
              : "bg-accent-warning/20 border-accent-warning/40"
          }`}
        >
          <View
            className={`w-2 h-2 rounded-full ${
              hasApiKey ? "bg-accent-success" : "bg-accent-warning"
            }`}
          />
          <Text
            className={`text-[11px] font-semibold ${
              hasApiKey ? "text-accent-success" : "text-accent-warning"
            }`}
          >
            {hasApiKey
              ? keySource === "env"
                ? "API-ключ підключено (.env)"
                : "API-ключ підключено (SecureStore)"
              : "Потрібно налаштувати ключ"}
          </Text>
        </TouchableOpacity>

        <Text className="text-xl font-bold text-white mb-0.5">
          Оберіть напрям співбесіди
        </Text>
        <Text className="text-xs text-slate-400 mb-3.5">
          AI проведе технічний скринінг знань та надасть розгорнутий фідбек.
        </Text>

        {/* Список тем */}
        <View className="gap-2.5 mb-4">
          {INTERVIEW_TOPICS.map((topic) => {
            const isSelected = selectedTopic.id === topic.id;
            return (
              <TouchableOpacity
                key={topic.id}
                onPress={() => setSelectedTopic(topic)}
                activeOpacity={0.8}
                className={`rounded-2xl p-3 border transition-all ${
                  isSelected
                    ? "bg-primary/20 border-primary"
                    : "bg-background-card border-slate-800"
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">{topic.icon}</Text>
                  <View className="flex-1">
                    <Text className="font-bold text-white text-sm">
                      {topic.title}
                    </Text>
                    <Text className="text-[11px] text-slate-400 mt-0.5 leading-tight" numberOfLines={2}>
                      {topic.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Вибір рівня */}
        <Text className="text-sm font-bold text-white mb-2">Рівень складності</Text>
        <View className="flex-row gap-2 mb-4">
          {INTERVIEW_LEVELS.map((lvl) => {
            const isSelected = selectedLevel.id === lvl.id;
            return (
              <TouchableOpacity
                key={lvl.id}
                onPress={() => setSelectedLevel(lvl)}
                className={`flex-1 rounded-xl py-2 px-1 border items-center justify-center ${
                  isSelected
                    ? "bg-accent-purple/20 border-accent-purple"
                    : "bg-background-card border-slate-800"
                }`}
              >
                <Text
                  className={`text-[11px] font-bold text-center leading-tight ${
                    isSelected ? "text-accent-purple" : "text-slate-300"
                  }`}
                  numberOfLines={2}
                >
                  {lvl.title}
                </Text>
                <Text className="text-[9px] text-slate-500 mt-0.5">
                  {lvl.questionsCount} питань
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Кнопка старту */}
        <TouchableOpacity
          onPress={handleStart}
          activeOpacity={0.8}
          className="rounded-2xl bg-primary py-3.5 items-center shadow-lg active:bg-primary-dark"
        >
          <Text className="font-bold text-white text-sm">
            🚀 Розпочати співбесіду
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
