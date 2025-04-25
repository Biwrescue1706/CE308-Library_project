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
import OverdueLoanCard from "../components/OverdueLoanCard";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function OverdueLoansScreen() {
  const [loans, setLoans] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOverdueLoans = async () => {
      try {
        await axios.get(`${API_URL}/users/me`, { withCredentials: true });
        const res = await axios.get(`${API_URL}/loans/overdue`, { withCredentials: true });
        setLoans(res.data);
      } catch (err) {
        router.replace("/(auth)/login");
      }
    };

    fetchOverdueLoans();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚠️ รายการค้างคืน</Text>

      {loans.length === 0 ? (
        <Text style={styles.empty}>ไม่มีรายการค้างคืน</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {loans.map((loan, index) => (
            <OverdueLoanCard key={loan.id} loan={loan} index={index} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00FA9A",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#fff",
    marginTop: 10,
    width: 325,
    height: 50,
    alignSelf: "center",
    marginBottom: 10,
    borderRadius: 10,
    lineHeight: 50,
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
  },
});
