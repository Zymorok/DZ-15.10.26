import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import * as Speech from "expo-speech";

export function SpeakButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");

  async function handlePress() {
    try {
      await Speech.stop();
      if (speaking) {
        setSpeaking(false);
        return;
      }
      setError("");
      setSpeaking(true);
      Speech.speak(text, {
        language: "en-US",
        rate: 0.9,
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
        onError: () => {
          setSpeaking(false);
          setError("Озвучення недоступне на цьому пристрої.");
        },
      });
    } catch {
      setSpeaking(false);
      setError("Озвучення недоступне на цьому пристрої.");
    }
  }

  return (
    <View>
      <TouchableOpacity onPress={handlePress} accessibilityRole="button" className="self-start py-2">
        <Text className="text-xs font-semibold text-blue-300">{speaking ? "■ Зупинити" : "🔊 Прослухати"}</Text>
      </TouchableOpacity>
      {error ? <Text className="text-xs text-amber-300">{error}</Text> : null}
    </View>
  );
}
