import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1E293B",
          borderTopColor: "#334155",
          height: 60 + Math.max(insets.bottom, 10),
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#60A5FA",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {/* Вкладка 1: Співбесіда */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Сценарії",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubbles" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: "Словничок",
          tabBarIcon: ({ color }) => <Ionicons name="book" size={22} color={color} />,
        }}
      />
      {/* Вкладка 2: Налаштування */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Налаштування",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-sharp" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

