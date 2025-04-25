import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import LoanCard from "../components/LoanCard";

const API_URL = Constants.expoConfig?.extra?.API_URL;

type Loan = {
  id: string;
  title: string;
  username: string;
  memberId: string;
  phone: string;
  loanDate: string;
  dueDate: string;
  borrowedQuantity: number;
  returnedQuantity: number;
  returnDate: string;
  returned: boolean;
};

export default function OverdueLoansScreen() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/loans/active`, { withCredentials: true })
      .then((res) => setLoans(res.data))
      .catch((err) => console.error("❌ Error fetching overdue loans:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 รายการยืมที่ยังไม่คืน</Text>
      {loading ? (
        <ActivityIndicator size="large" color="tomato" />
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <LoanCard loan={item} index={index} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00FA9A",
    padding: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
});
