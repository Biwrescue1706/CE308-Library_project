import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function ActiveLoansScreen() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/loans/active`, { withCredentials: true })
      .then((res) => setLoans(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>⏳ รายการที่ยังไม่คืน</Text>
      {loading ? (
        <ActivityIndicator size="large" color="orange" />
      ) : (
        loans.map((loan: any, index) => (
          <View key={loan.id} style={styles.card}>
            <Text style={styles.bold}>#{index + 1} - {loan.title}</Text>
            <Text><Text style={styles.bold}>👤 ผู้ยืม : </Text>{loan.username}</Text>
            <Text><Text style={styles.bold}>👤 ชื่อผู้ยืม : </Text> {loan.fullNameTH} </Text>
            <Text><Text style={styles.bold}>📅 ยืม : </Text>{new Date(loan.loanDate).toLocaleDateString()}</Text>
            <Text><Text style={styles.bold}>📅 ครบกำหนด : </Text>{new Date(loan.dueDate).toLocaleDateString()}</Text>
            <Text><Text style={styles.bold}>📦 จำนวน : </Text>{loan.quantity} เล่ม</Text>
            <Text><Text style={styles.bold}>📞 เบอร์โทร : </Text>{(loan.phone)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#C8E6B2",
    flexGrow: 1,
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
