import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import ProfileMenuButton from "../components/ProfileMenuButton";

export default function ManageProfileScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📄 จัดการโปรไฟล์ของฉัน</Text>

      <ProfileMenuButton
        label="👤 ดูข้อมูลโปรไฟล์"
        onPress={() => router.push("/manageProfile/profile")}
      />

      <ProfileMenuButton
        label="✏️ แก้ไขข้อมูลส่วนตัว"
        onPress={() => router.push("/manageProfile/inforpersonal")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#00FA9A",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    marginTop: 20,
    backgroundColor: "#fff",
    width: 320,
    height: 50,
    textAlign: "center",
    textAlignVertical: "center",
    borderRadius: 10,
  },
});
