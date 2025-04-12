import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 📌 ดึงประวัติการยืมหนังสือ
  useEffect(() => {
    axios
      .get(`${API_URL}/user/history`)
      .then((response) => {
        setHistory(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching history:", error);
        setLoading(false);
      });
  }, []);

  // 📌 คืนหนังสือ
  const handleReturnBook = (loanId: string) => {
    axios
      .post(`${API_URL}/books/return`, { loanId })
      .then(() => {
        setHistory((prev) =>
          prev.map((item) =>
            item.id === loanId ? { ...item, returned: true } : item
          )
        );
      })
      .catch((error) => console.error("❌ Error returning book:", error));
  };

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
              <Text>📅 วันที่ยืม: {new Date(item.borrowDate).toLocaleDateString()}</Text>
              <Text>⏳ วันครบกำหนดคืน: {new Date(item.dueDate).toLocaleDateString()}</Text>
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

// 🎨 **Styles (CSS)**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
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
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
