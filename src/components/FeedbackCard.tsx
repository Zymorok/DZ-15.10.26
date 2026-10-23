import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feedback } from "@/types/roleplay";
import { savePhrase } from "@/services/vocabulary";

export function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    try {
      await savePhrase({ phrase: feedback.betterPhrasing, translation: feedback.translation });
      setSaved(true);
      setError("");
    } catch {
      setError("Не вдалося зберегти фразу.");
    }
  }

  return (
    <View className={`rounded-xl border p-3 mt-2 ${feedback.hasCorrection ? "bg-amber-950 border-amber-700" : "bg-emerald-950 border-emerald-700"}`}>
      <Text className={`font-bold text-xs ${feedback.hasCorrection ? "text-amber-300" : "text-emerald-300"}`}>
        {feedback.hasCorrection ? "Grammar tip" : "Perfect grammar! 👍"}
      </Text>
      {feedback.hasCorrection ? <Text className="text-sm text-slate-100 mt-2 leading-5">{feedback.correction}</Text> : null}
      {feedback.betterPhrasing ? (
        <View className="mt-3">
          <Text className="text-xs text-slate-300">Природніше англійською</Text>
          <Text className="text-sm text-white font-semibold mt-1">{feedback.betterPhrasing}</Text>
          <Text className="text-xs text-slate-300 mt-1">{feedback.translation}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saved} accessibilityRole="button" className="py-2 self-start">
            <Text className="text-xs font-bold text-blue-300">{saved ? "✓ У словничку" : "+ Зберегти фразу"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {error ? <Text className="text-xs text-amber-300">{error}</Text> : null}
    </View>
  );
}
