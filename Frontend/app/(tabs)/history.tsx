import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  // Handle returning a book based on selected quantity
  const handleReturnBook = (loanId: string) => {
    const quantity = returnQuantities[loanId] || 1;
    const currentDate = new Date().toLocaleDateString();  // Capture current date
    axios
      .post(`${API_URL}/loans/return/${loanId}`, { quantity }, { withCredentials: true })
      .then(() => {
        setReturnQuantities((prev) => ({ ...prev, [loanId]: 0 }));  // Reset return quantity
        fetchHistory();  // Refresh the list
      })
      .catch((err) => console.error("❌ Error returning book:", err));
  };

  // Handle returning all books
  const handleReturnAll = () => {
    const returnable = history.filter(
      (item) => !item.returned && (item.borrowedQuantity - item.returnedQuantity) > 0
    );

    // Prepare the data for the return-all request
    const returnData = returnable.map((item) => ({
      loanId: item.id,
      quantity: item.borrowedQuantity - item.returnedQuantity, // Number of books to return
    }));

    // Send the return-all request
    axios
      .post(`${API_URL}/loans/return-all`, { returnData }, { withCredentials: true })
      .then(() => {
        setReturnQuantities({});  // Reset return quantities for all items
        fetchHistory();  // Refresh the list
      })
      .catch((err) => {
        console.error("❌ Error returning all books:", err);
      });
  };

  // Check if the user is logged in
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

  // Sort by loan date (from oldest to newest) and title (A-Z, and ก-ฮ)
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
        renderItem={({ item }) => {
          const remaining = item.borrowedQuantity - item.returnedQuantity;
          return (
            <View style={styles.historyContainer}>
              <Text style={styles.bookTitle}>📖 {item.title}</Text>
              <Text><Text style={styles.bold}>📦 ยืมทั้งหมด : </Text>{item.borrowedQuantity} เล่ม</Text>
              <Text><Text style={styles.bold}>📦 คืนแล้ว : </Text>{item.returnedQuantity} เล่ม</Text>
              <Text><Text style={styles.bold}>📦 ค้างคืน : </Text>{remaining} เล่ม</Text>
              <Text><Text style={styles.bold}>📅 วันที่ยืม : </Text>{item.loanDate}</Text>
              <Text><Text style={styles.bold}>⏳ ครบกำหนด : </Text>{item.dueDate}</Text>

              {item.returned && item.returnDate ? (
                <Text><Text style={styles.bold}>📅 วันที่คืน : </Text>{item.returnDate}</Text>
              ) : (
                <Text><Text style={styles.bold}>📅 วันที่คืน : </Text> ⏳ ยังไม่ได้คืนหนังสือ</Text>
              )}

              <Text style={styles.bold}>สถานะการคืน :
                <Text style={{ color: item.returned ? "green" : "red" }}>
                  {item.returned ? "✅ คืนหนังสือครบแล้ว" : "⏳ ยังไม่ได้คืนหนังสือ"}
                </Text>
              </Text>

              {!item.returned && (
                <>
                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() =>
                        setReturnQuantities((prev) => ({
                          ...prev,
                          [item.id]: Math.max(1, (prev[item.id] || 1) - 1),
                        }))
                      }
                    >
                      <Text style={styles.qtyText}>➖</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.qtyInput}
                      value={String(returnQuantities[item.id] || 1)}
                      onChangeText={(text) =>
                        setReturnQuantities((prev) => ({
                          ...prev,
                          [item.id]: Math.max(1, Math.min(remaining, parseInt(text) || 1)),
                        }))
                      }
                      keyboardType="numeric"
                    />
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() =>
                        setReturnQuantities((prev) => ({
                          ...prev,
                          [item.id]: Math.min(remaining, (prev[item.id] || 1) + 1),
                        }))
                      }
                    >
                      <Text style={styles.qtyText}>➕</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.returnButton}
                    onPress={() => handleReturnBook(item.id)}
                  >
                    <Text style={styles.buttonText}>🔄 คืนหนังสือที่เลือก</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        }}
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
  },
  returnAllButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center",
  },
  historyContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
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
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "center",
  },
  qtyButton: {
    backgroundColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  qtyText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  qtyInput: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    textAlign: "center",
    width: 60,
  },
});
