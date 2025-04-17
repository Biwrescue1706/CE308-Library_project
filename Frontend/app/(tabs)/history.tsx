import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // 📌 ดึงประวัติการยืมหนังสือ
  useEffect(() => {
    axios
      .get(`${API_URL}/users/me`)
      .then(() => {
        setIsLoggedIn(true);
        return axios.get(`${API_URL}/users/history`);
      })
      .then((response) => {
        setHistory(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log("❌ ยังไม่ล็อกอินหรือดึงข้อมูลล้มเหลว:", error.message);
        setIsLoggedIn(false);
        setLoading(false);
      });
  }, []);

  // 📌 คืนหนังสือ
  const handleReturnBook = (loanId: string) => {
    axios
      .post(`${API_URL}/lons/return`, { loanId })
      .then(() => {
        setHistory((prev) =>
          prev.map((item) =>
            item.id === loanId ? { ...item, returned: true } : item
          )
        );
      })
      .catch((error) => console.error("❌ Error returning book:", error));
  };

  // 📌 ยังไม่ล็อกอิน
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
          renderItem={({ item }) => (
            <View style={styles.historyContainer}>
              <Text style={styles.bookTitle}>📖 {item.bookTitle}</Text>
              <Text>
                📅 วันที่ยืม:{" "}
                {new Date(item.borrowDate).toLocaleDateString("th-TH")}
              </Text>
              <Text>
                ⏳ วันครบกำหนดคืน:{" "}
                {new Date(item.dueDate).toLocaleDateString("th-TH")}
              </Text>
              <Text style={{ color: item.returned ? "green" : "red" }}>
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

// 🎨 Styles
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
    fontSize: 18,
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
});
