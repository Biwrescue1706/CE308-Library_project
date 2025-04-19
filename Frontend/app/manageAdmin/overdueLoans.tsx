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
            <Text><Text style={styles.bold}>👤 ผู้ยืม : </Text>{loan.username}</Text>
            <Text><Text style={styles.bold}>👤 ชื่อ : </Text> {loan.fullNameTH} </Text>
            <Text><Text style={styles.bold}>📕 หนังสือ : </Text>{loan.bookTitle}</Text>
            <Text><Text style={styles.bold}>📅 ยืม : </Text> {new Date(loan.loanDate).toLocaleDateString()}</Text>
            <Text><Text style={styles.bold}>📅 ครบกำหนด : </Text> {new Date(loan.dueDate).toLocaleDateString()}</Text>
            <Text><Text style={styles.bold}>📦 จำนวน : </Text> {loan.quantity} <Text style={styles.bold}> เล่ม </Text></Text>
            <Text style={{ color: "red" }}> <Text style={styles.bold}>⏱️ เกินกำหนด : </Text> {loan.lateDays} <Text style={styles.bold}>วัน</Text> </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#C8E6B2"
  },
  header: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20, 
    textAlign: "center" 
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  bold: {
    fontWeight: "bold",
  },
});
