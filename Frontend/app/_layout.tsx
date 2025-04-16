import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* ใช้ (tabs) เป็น Navigation หลัก */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* หน้าจออื่นๆ ที่อยู่นอก Tab เช่น Profile */}
      <Stack.Screen name="(screens)/profile" options={{ headerShown: false }} />

      {/* Auth */}
      <Stack.Screen name="/(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="/(auth)/register" options={{ headerShown: false }} />
      
      {/* Error Page สำหรับหน้าไม่พบ */}
      <Stack.Screen name="+not-found" />
      
    </Stack>
  );
}
