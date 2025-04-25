import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import LoanHistoryCard from "../components/LoanHistoryCard";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const fetchHistory = () => {
    setRefreshing(true);
    axios
      .get(`${API_URL}/users/me`, { withCredentials: true })
      .then(() => {
        setIsLoggedIn(true);
        return axios.get(`${API_URL}/loans/my-borrow`, { withCredentials: true });
      })
      .then((res) => {
        setHistory(res.data);
        setRefreshing(false);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleReturnBook = (loanId: string) => {
    const quantity = returnQuantities[loanId] || 1;
    axios
      .post(`${API_URL}/loans/return/${loanId}`, { quantity }, { withCredentials: true })
      .then(() => {
        setReturnQuantities((prev) => ({ ...prev, [loanId]: 0 }));
        fetchHistory();
      })
      .catch((err) => console.error("❌ Error returning book:", err));
  };

  const handleReturnAll = () => {
    const returnable = history.filter(
      (item) => !item.returned && (item.borrowedQuantity - item.returnedQuantity) > 0
    );
    const returnData = returnable.map((item) => ({
      loanId: item.id,
      quantity: item.borrowedQuantity - item.returnedQuantity,
    }));
    axios
      .post(`${API_URL}/loans/return-all`, { returnData }, { withCredentials: true })
      .then(() => {
        setReturnQuantities({});
        fetchHistory();
      })
      .catch((err) => {
        console.error("❌ Error returning all books:", err);
      });
  };

  if (isLoggedIn === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>⚠️ กรุณาเข้าสู่ระบบก่อนดูประวัติ</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.buttonText}>🔑 เข้าสู่ระบบ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasReturnable = history.some(
    (item) => !item.returned && item.borrowedQuantity - item.returnedQuantity > 0
  );

  const sortedHistory = [...history].sort((a, b) => {
    const loanDateA = new Date(a.loanDate).getTime();
    const loanDateB = new Date(b.loanDate).getTime();
    if (loanDateA !== loanDateB) {
      return loanDateA - loanDateB;
    }
    return a.title.localeCompare(b.title, 'th-TH');
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 ประวัติการยืมหนังสือ</Text>

      <FlatList
        data={sortedHistory}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchHistory} />}
        renderItem={({ item }) => (
          <LoanHistoryCard
            item={item}
            quantity={returnQuantities[item.id] || 1}
            onDecrease={() =>
              setReturnQuantities((prev) => ({
                ...prev,
                [item.id]: Math.max(1, (prev[item.id] || 1) - 1),
              }))
            }
            onIncrease={() =>
              setReturnQuantities((prev) => ({
                ...prev,
                [item.id]: Math.min(
                  item.borrowedQuantity - item.returnedQuantity,
                  (prev[item.id] || 1) + 1
                ),
              }))
            }
            onChange={(val) =>
              setReturnQuantities((prev) => ({
                ...prev,
                [item.id]: Math.max(1, Math.min(item.borrowedQuantity - item.returnedQuantity, val)),
              }))
            }
            onReturn={() => handleReturnBook(item.id)}
          />
        )}
      />

      {hasReturnable && (
        <TouchableOpacity style={styles.returnAllButton} onPress={handleReturnAll}>
          <Text style={styles.buttonText}>🔁 คืนหนังสือทั้งหมด</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00FA9A",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 20,
  },
  returnAllButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
});
