import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { LEVELS, SCENARIOS } from "@/constants/scenarios";
import { FeedbackCard } from "@/components/FeedbackCard";
import { SpeakButton } from "@/components/SpeakButton";
import { sendChatToOpenRouter } from "@/services/openrouter";
import { buildRoleplayPrompt, SUMMARY_PROMPT } from "@/services/roleplay-prompts";
import { parseReply, parseSummary } from "@/services/roleplay-parser";
import { savePhrase } from "@/services/vocabulary";
import { OpenRouterAPIMessage } from "@/types";
import { LanguageLevel, RoleplayMessage, SessionSummary, VocabularyItem } from "@/types/roleplay";

type Action = "start" | "send" | "finish";

export default function RoleplayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ scenarioId?: string; level?: string }>();
  const scenario = SCENARIOS.find((item) => item.id === params.scenarioId) || SCENARIOS[0];
  const level: LanguageLevel = LEVELS.includes(params.level as LanguageLevel) ? params.level as LanguageLevel : "B1";
  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState<Action | null>("start");
  const [error, setError] = useState("");
  const [failedAction, setFailedAction] = useState<Action | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [savedPhrases, setSavedPhrases] = useState<string[]>([]);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const list = useRef<FlatList<RoleplayMessage>>(null);
  const requestId = useRef(0);
  const locked = useRef(false);

  const request = useCallback(async (action: Action, history: RoleplayMessage[]) => {
    const currentId = ++requestId.current;
    locked.current = true;
    setLoading(action);
    setError("");
    setFailedAction(null);
    const conversation: OpenRouterAPIMessage[] = [
      { role: "system", content: buildRoleplayPrompt(scenario, level) },
      { role: "user", content: "Begin the roleplay." },
      ...history.map((item) => ({ role: item.role, content: item.content })),
    ];
    if (action === "finish") conversation.push({ role: "system", content: SUMMARY_PROMPT });
    if (action === "send") conversation.push({ role: "system", content: "Analyze the latest learner answer and return ONLY the JSON object from the required format. reply must contain ONLY your short in-character English response, never corrections, translations or field labels. Put all grammar feedback ONLY in correction, betterPhrasing and translation. betterPhrasing and its Ukrainian translation must not be empty. Continue this conversation instead of greeting again." });

    try {
      const response = await sendChatToOpenRouter({ messages: conversation, temperature: 0.4 });
      if (currentId !== requestId.current) return;
      if (action === "finish") {
        setSummary(parseSummary(response));
      } else {
        const reply = parseReply(response, action === "send");
        const updated = history.map((item, index) => index === history.length - 1 && item.role === "user"
          ? { ...item, feedback: reply } : item);
        setMessages([...updated, { id: `${Date.now()}-ai`, role: "assistant", content: reply.reply }]);
      }
    } catch (failure) {
      if (currentId !== requestId.current) return;
      setError(failure instanceof Error ? failure.message : "Не вдалося отримати відповідь AI.");
      setFailedAction(action);
    } finally {
      if (currentId === requestId.current) {
        setLoading(null);
        locked.current = false;
      }
    }
  }, [scenario, level]);

  useEffect(() => {
    const counter = requestId;
    const timer = setTimeout(() => { void request("start", []); }, 0);
    return () => { clearTimeout(timer); counter.current++; void Speech.stop(); };
  }, [request]);

  function handleLeave() {
    if (summary) router.replace("/(tabs)");
    else setLeaveOpen(true);
  }

  useEffect(() => {
    if (Platform.OS === "web") return;
    const listener = BackHandler.addEventListener("hardwareBackPress", () => {
      if (summary) router.replace("/(tabs)");
      else setLeaveOpen(true);
      return true;
    });
    return () => listener.remove();
  }, [router, summary]);

  function handleSend() {
    const text = input.trim();
    if (!text || locked.current || failedAction || summary) return;
    const next: RoleplayMessage[] = [...messages, { id: `${Date.now()}-user`, role: "user", content: text }];
    setMessages(next);
    setInput("");
    void request("send", next);
  }

  function handleEdit() {
    const last = messages[messages.length - 1];
    if (failedAction === "send" && last?.role === "user") {
      setInput(last.content);
      setMessages(messages.slice(0, -1));
      setFailedAction(null);
      setError("");
    }
  }

  async function handleSave(item: VocabularyItem) {
    try {
      await savePhrase(item);
      setSavedPhrases((previous) => [...previous, item.phrase]);
    } catch {
      setError("Не вдалося зберегти фразу.");
    }
  }

  const canFinish = messages.some((item) => item.role === "user") && !loading && !failedAction && !summary;

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <View className="flex-row items-center gap-3 border-b border-slate-700 px-4 py-3">
        <TouchableOpacity onPress={handleLeave} accessibilityRole="button" accessibilityLabel="Назад" className="p-2">
          <Text className="text-2xl text-white">‹</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-sm font-bold text-white" numberOfLines={2}>{scenario.title}</Text>
          <Text className="text-xs text-blue-300 mt-1">Рівень {level}</Text>
        </View>
        {!summary ? (
          <TouchableOpacity
            disabled={!canFinish}
            onPress={() => { Keyboard.dismiss(); void request("finish", messages); }}
            accessibilityRole="button"
            className={`rounded-lg border border-slate-600 p-2 ${canFinish ? "opacity-100" : "opacity-40"}`}
          >
            <Text className="text-xs text-slate-200">Завершити</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <FlatList
          ref={list}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View className="mb-4">
              <View className={`max-w-[92%] rounded-2xl px-4 py-3 ${item.role === "user" ? "self-end bg-primary" : "self-start bg-background-card border border-slate-700"}`}>
                <Text className="text-xs font-semibold text-blue-200 mb-1">{item.role === "user" ? "Ви" : "AI · Співрозмовник"}</Text>
                <Text selectable className="text-base text-white leading-6">{item.content}</Text>
                {item.role === "assistant" ? <SpeakButton text={item.content} /> : null}
              </View>
              {item.role === "user" && item.feedback ? <FeedbackCard feedback={item.feedback} /> : null}
            </View>
          )}
          ListFooterComponent={summary ? (
            <View className="rounded-2xl border border-blue-500 bg-background-card p-5">
              <Text className="text-xl font-bold text-white">Підсумок розмови</Text>
              <Text className="text-blue-300 text-3xl font-bold mt-3">{summary.score} / 10</Text>
              <Text className="text-sm text-slate-400 mt-1">Оцінка розмовної англійської</Text>
              <Text className="text-base font-bold text-white mt-5 mb-2">На що звернути увагу</Text>
              {summary.mistakes.length ? summary.mistakes.map((mistake, index) => (
                <Text key={index} className="text-sm text-slate-200 leading-6 mb-2">• {mistake}</Text>
              )) : <Text className="text-sm text-emerald-300">Помилок у цій розмові не виявлено.</Text>}
              <Text className="text-base font-bold text-white mt-4 mb-2">Три корисні вирази</Text>
              {summary.expressions.map((item, index) => (
                <View key={index} className="py-3 border-b border-slate-700">
                  <Text className="text-sm font-semibold text-white">{item.phrase}</Text>
                  <Text className="text-sm text-slate-300 mt-1">{item.translation}</Text>
                  <TouchableOpacity disabled={savedPhrases.includes(item.phrase)} onPress={() => handleSave(item)} accessibilityRole="button" className="py-2">
                    <Text className="text-xs text-blue-300">{savedPhrases.includes(item.phrase) ? "✓ У словничку" : "+ Зберегти фразу"}</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={() => router.replace("/(tabs)/vocabulary")} accessibilityRole="button" className="rounded-xl bg-primary p-3 items-center mt-4">
                <Text className="text-white font-semibold">Відкрити словничок</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        />
        {loading ? (
          <View className="flex-row justify-center gap-3 p-4">
            <ActivityIndicator color="#60A5FA" />
            <Text className="text-sm text-slate-300">{loading === "finish" ? "Готуємо підсумок..." : "AI готує відповідь..."}</Text>
          </View>
        ) : null}
        {error ? (
          <View className="p-4 bg-amber-950 border-t border-amber-700">
            <Text accessibilityRole="alert" className="text-sm text-amber-200">{error}</Text>
            {failedAction ? <View className="flex-row gap-5 mt-3">
              <TouchableOpacity onPress={() => { if (!locked.current) void request(failedAction, messages); }} accessibilityRole="button">
                <Text className="text-sm font-bold text-blue-300">Повторити</Text>
              </TouchableOpacity>
              {failedAction === "send" ? <TouchableOpacity onPress={handleEdit} accessibilityRole="button">
                <Text className="text-sm font-bold text-blue-300">Редагувати</Text>
              </TouchableOpacity> : null}
              <TouchableOpacity onPress={() => router.push("/(tabs)/settings")} accessibilityRole="button">
                <Text className="text-sm font-bold text-blue-300">Налаштування</Text>
              </TouchableOpacity>
            </View> : null}
          </View>
        ) : null}
        {!summary ? <View className="flex-row gap-3 items-end p-3 border-t border-slate-700">
          <TextInput
            value={input}
            onChangeText={setInput}
            editable={!loading && !failedAction}
            placeholder="Ваша відповідь англійською..."
            placeholderTextColor="#94A3B8"
            accessibilityLabel="Ваша відповідь англійською"
            autoCapitalize="sentences"
            multiline
            maxLength={2000}
            className="flex-1 rounded-2xl bg-background-card border border-slate-600 px-4 py-3 text-white text-base"
            style={{ minHeight: 48, maxHeight: 120 }}
          />
          <TouchableOpacity onPress={handleSend} disabled={!!loading || !!failedAction || !input.trim()} accessibilityRole="button" accessibilityLabel="Надіслати" className={`rounded-xl bg-primary p-4 ${loading || failedAction || !input.trim() ? "opacity-40" : "opacity-100"}`}>
            <Text className="text-white font-bold">➤</Text>
          </TouchableOpacity>
        </View> : null}
      </KeyboardAvoidingView>

      <Modal visible={leaveOpen} transparent animationType="fade" onRequestClose={() => setLeaveOpen(false)}>
        <View className="flex-1 bg-black/70 justify-center p-6">
          <View className="rounded-2xl bg-background-card p-6 border border-slate-600">
            <Text className="text-lg font-bold text-white">Вийти з розмови?</Text>
            <Text className="text-sm text-slate-300 mt-3 leading-6">Розмова не зберігається. Фрази у словничку залишаться.</Text>
            <TouchableOpacity onPress={() => { setLeaveOpen(false); router.replace("/(tabs)"); }} accessibilityRole="button" className="mt-5 rounded-xl bg-primary p-3 items-center">
              <Text className="text-white font-semibold">Вийти</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLeaveOpen(false)} accessibilityRole="button" className="mt-2 p-3 items-center">
              <Text className="text-slate-300">Залишитися</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
