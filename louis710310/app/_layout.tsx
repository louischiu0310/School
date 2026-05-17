import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 讓系統一啟動，100% 只讀取我們塞滿完整功能的 index */}
      <Stack.Screen name="index" /> 
    </Stack>
  );
}