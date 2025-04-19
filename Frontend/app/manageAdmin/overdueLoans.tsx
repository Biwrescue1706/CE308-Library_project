// app/admin/overdueLoans.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function OverdueLoansScreen() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/loans/overdue`, { withCredentials: true })
      .then((res) => setLoans(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>⚠️ รายการค้างคืน</Text>
      {loading ? (
        <ActivityIndicator size="large" color="red" />
      ) : (
        loans.map((loan: any, index) => (
          <View key={loan.id} style={styles.card}>
            <Text>#{index + 1} - {loan.title}</Text>
            <Text>👤 {loan.fullNameTH} ({loan.username})</Text>
            <Text>📅 ยืม: {new Date(loan.loanDate).toLocaleDateString()}</Text>
            <Text>📅 ครบกำหนด: {new Date(loan.dueDate).toLocaleDateString()}</Text>
            <Text>📦 จำนวน: {loan.quantity}</Text>
            <Text style={{ color: "red" }}>⏱️ เกินกำหนด {loan.lateDays} วัน</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#FFEBEE" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
});
