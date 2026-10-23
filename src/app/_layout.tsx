import "../global.css";

import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Head from "expo-router/head";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Head><title>Language Coach</title></Head>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0F172A" },
        }}
      >
        {/* Головна таб-навігація (Bottom Tabs) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Повноекранний екран співбесіди (поверх табів) */}
        <Stack.Screen
          name="roleplay"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
