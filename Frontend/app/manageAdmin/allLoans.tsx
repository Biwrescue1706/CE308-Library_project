// app/admin/allLoans.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function AllLoansScreen() {
  const router = useRouter();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/loans/all`, { withCredentials: true })
      .then((res) => setLoans(res.data))
      .catch((err) => console.error("❌", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📚 รายการยืมทั้งหมด</Text>
      {loading ? (
        <ActivityIndicator size="large" color="tomato" />
      ) : (
        loans.map((loan: any, index) => (
          <View key={loan.id} style={styles.card}>
            <Text>#{index + 1} - {loan.title}</Text>
            <Text>👤 {loan.username}</Text>
            <Text>📅 ยืม: {new Date(loan.loanDate).toLocaleDateString()}</Text>
            <Text>📅 ครบกำหนด: {new Date(loan.dueDate).toLocaleDateString()}</Text>
            <Text>📦 จำนวน: {loan.quantity}</Text>
            <Text>✅ คืนแล้ว: {loan.returned ? "✅" : "❌"}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#C8E6B2" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
});
