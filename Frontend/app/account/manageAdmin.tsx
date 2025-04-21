import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function ManageAdminScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🛠️ ระบบจัดการของแอดมิน</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/manageAdmin/manageusers")}>
        <Text style={styles.buttonText}>👥 จัดการสมาชิก</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push("/manageAdmin/addBooks")}>
        <Text
          style={styles.buttonText}>
          📚 จัดการหนังสือ
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push("/manageAdmin/allLoans")}>
        <Text
          style={styles.buttonText}>📚 ดูรายการการยืมทั้งหมด
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/manageAdmin/activeLoans")}>
        <Text style={styles.buttonText}>📚 ดูรายการยืมที่ยังไม่คืน</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/manageAdmin/overdueLoans")}>
        <Text style={styles.buttonText}>📚 ดูรายการยืมที่ค้างคืน </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/manageAdmin/topBorrowed")}>
        <Text style={styles.buttonText}>📈 หนังสือที่ยืมบ่อย</Text>
      </TouchableOpacity>
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
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: 270,
    height : 54.5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
