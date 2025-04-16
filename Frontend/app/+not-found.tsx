import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function NotFound() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>ไม่พบหน้านี้</Text>
      <Button title="กลับหน้าหลัก" onPress={() => router.replace("/")} />
    </View>
  );
}