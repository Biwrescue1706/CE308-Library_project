import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function OverdueLoansScreen() {
  const [loans, setLoans] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${API_URL}/users/me`, { withCredentials: true })
      .then(() => {
        axios
          .get(`${API_URL}/loans/overdue`, { withCredentials: true })
          .then((res) => setLoans(res.data))
          .catch(() => {});
      })
      .catch(() => {
        router.replace("/(auth)/login");
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚠️ รายการค้างคืน</Text>
      {/* Check if loans is empty and display the empty message */}
      {loans.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          ไม่มีรายการที่ยังไม่คืน
        </Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {loans.map((loan, index) => (
            <View key={loan.id} style={styles.card}>
              <Text style={styles.titlebold}>รายการยืมที่ {index + 1}</Text>
              <Text>
                <Text style={styles.bold}>👤 ผู้ยืม : </Text>{loan.username}
              </Text>
              <Text>
                <Text style={styles.bold}>👤 ชื่อ : </Text>{loan.fullNameTH}
              </Text>
              <Text>
                <Text style={styles.bold}>👤 รหัสสมาชิก : </Text>{loan.memberId}
              </Text>
              <Text>
                <Text style={styles.bold}>📞 เบอร์โทรผู้ยืม : </Text>{loan.phone}
              </Text>
              <Text>
                <Text style={styles.bold}>📕 หนังสือ : </Text>{loan.bookTitle}
              </Text>
              <Text>
                <Text style={styles.bold}>📅 ยืม : </Text>{loan.loanDate}
              </Text>
              <Text>
                <Text style={styles.bold}>📅 ครบกำหนด : </Text>{loan.dueDate}
              </Text>
              <Text>
                <Text style={styles.bold}>📦 จำนวน : </Text>{loan.borrowedQuantity}{" "}
                <Text style={styles.bold}>เล่ม</Text>
              </Text>
              <Text style={{ color: "red" }}>
                <Text style={styles.bold}>⏱️ เกินกำหนด : </Text>{loan.lateDays}{" "}
                <Text style={styles.bold}>วัน</Text>
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C8E6B2",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: "#C8E6B2",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#fff",
    marginTop: 10,
    width: 325,
    height: 50,
    marginHorizontal: "auto",
    marginBottom: 10,
    borderRadius: 10,
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
  titlebold: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
});
