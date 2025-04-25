import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AdminMenuButton from "../components/AdminMenuButton";

export default function ManageAdminScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🛠️ ระบบจัดการของแอดมิน</Text>

      <AdminMenuButton label="👥 จัดการสมาชิก" onPress={() => router.push("/manageAdmin/manageusers")} />
      <AdminMenuButton label="📚 จัดการหนังสือ" onPress={() => router.push("/manageAdmin/addBooks")} />
      <AdminMenuButton label="📚 ดูรายการการยืมทั้งหมด" onPress={() => router.push("/manageAdmin/allLoans")} />
      <AdminMenuButton label="📚 ดูรายการยืมที่ยังไม่คืน" onPress={() => router.push("/manageAdmin/activeLoans")} />
      <AdminMenuButton label="📚 ดูรายการยืมที่ค้างคืน" onPress={() => router.push("/manageAdmin/overdueLoans")} />
      <AdminMenuButton label="📈 หนังสือที่ยืมบ่อย" onPress={() => router.push("/manageAdmin/topBorrowed")} />
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
    textAlign: "center",
    backgroundColor: "#fff",
    width: 340,
    borderRadius: 10,
    marginBottom: 50,
    paddingVertical: 10,
  },
});
