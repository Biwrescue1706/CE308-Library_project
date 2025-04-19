import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  StyleSheet, RefreshControl,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.API_URL;

// ✅ แปลงวันที่เป็น พ.ศ.
const formatThaiDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("th-TH", { month: "long" });
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
};

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const fetchHistory = () => {
    setRefreshing(true);
    axios
      .get(`${API_URL}/users/me`, { withCredentials: true })
      .then(() => {
        setIsLoggedIn(true);
        return axios.get(`${API_URL}/loans/my-borrow`, { withCredentials: true });
      })
      .then((response) => {
        setHistory(response.data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((error) => {
        console.log("❌ ยังไม่ล็อกอินหรือดึงข้อมูลล้มเหลว:", error.message);
        setIsLoggedIn(false);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleReturnBook = (loanId: string) => {
    axios
      .post(`${API_URL}/loans/return/${loanId}`, null, { withCredentials: true })
      .then(() => {
        setHistory((prev) =>
          prev.map((item) =>
            item.id === loanId
              ? { ...item, returned: true, returnDate: new Date() }
              : item
          )
        );
      })
      .catch((error) => console.error("❌ Error returning book:", error));
  };

  if (!loading && isLoggedIn === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>⚠️ กรุณาเข้าสู่ระบบก่อนดูประวัติ</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.buttonText}>🔑 เข้าสู่ระบบ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 ประวัติการยืมหนังสือ</Text>

      {loading ? (
        <ActivityIndicator size="large" color="tomato" />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchHistory} />
          }
          renderItem={({ item }) => (
            <View style={styles.historyContainer}>
              <Text style={styles.bookTitle}>📖 {item.title}</Text>
              <Text><Text style={styles.bold}>📦 จำนวน : </Text>{item.quantity} เล่ม</Text>
              <Text>📅 วันที่ยืม: {formatThaiDate(item.loanDate)}</Text>
              <Text>⏳ วันครบกำหนดคืน: {formatThaiDate(item.dueDate)}</Text>
              {item.returned && item.returnDate && (
                <Text>🗓 วันที่คืน: {formatThaiDate(item.returnDate)}</Text>
              )}
              <Text style={{ color: item.returned ? "green" : "red" }}>สถานะการคืน : 
                {item.returned ? "✅ คืนแล้ว" : "⏳ ยังไม่คืน"}
              </Text>

              {!item.returned && (
                <TouchableOpacity
                  style={styles.returnButton}
                  onPress={() => handleReturnBook(item.id)}
                >
                  <Text style={styles.buttonText}>🔄 คืนหนังสือ</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C8E6B2",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  historyContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 5,
  },
  returnButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  bold: {
    fontWeight: "bold",
  },
});
