import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* ใช้ (tabs) เป็น Navigation หลัก */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* หน้าจออื่นๆ ที่อยู่นอก Tab เช่น Profile */}
      <Stack.Screen name="(screens)/profile" options={{ headerShown: false }} />

      {/* Auth */}
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/resetPassword" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/forgotPassword" options={{ headerShown: false }} />

      {/* account */}
      
      <Stack.Screen name="account/contact" options={{ headerShown: false }} />
      <Stack.Screen name="account/changePassword" options={{ headerShown: false }} />
      <Stack.Screen name="account/manageAdmin" options={{ headerShown: false }} />
      <Stack.Screen name="account/manageProfile" options={{ headerShown: false }} />

      {/* manageProfile */}
      <Stack.Screen name="manageProfile/inforpersonal" options={{ headerShown: false }} />
      <Stack.Screen name="manageProfile/profile" options={{ headerShown: false }} />
      
      {/* manageAdmin */}
      <Stack.Screen name="manageAdmin/addBooks" options={{ headerShown: false }} />
      <Stack.Screen name="manageAdmin/manageusers" options={{ headerShown: false }} />
      <Stack.Screen name="manageAdmin/allLoans" options={{ headerShown: false }} />
      <Stack.Screen name="manageAdmin/activeLoans" options={{ headerShown: false }} />
      <Stack.Screen name="manageAdmin/overdueLoans" options={{ headerShown: false }} />
      
      {/* book */}
      <Stack.Screen name="book/[id]" options={{ headerShown: false }} />
      {/* Error Page สำหรับหน้าไม่พบ */}
      <Stack.Screen name="+not-found" />

    </Stack>
  );
}
