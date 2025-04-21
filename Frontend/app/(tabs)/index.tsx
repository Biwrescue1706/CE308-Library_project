import { useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function HomeScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchBooks = () => {
    axios
      .get(`${API_URL}/books/getAllBooks`, { withCredentials: true })
      .then((res) => {
        const sortedBooks = res.data.sort((a: any, b: any) =>
          a.title.localeCompare(b.title)
        );
        setBooks(sortedBooks);
      })
      .catch((error) => console.error(error));
  };

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBooks();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const totalPages = Math.ceil(books.length / itemsPerPage);
  const paginatedBooks = books.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 รายการหนังสือ</Text>

      <FlatList
        data={paginatedBooks}
        keyExtractor={(item) => item.id}
        numColumns={1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.bookContainer}>
            <Text style={styles.bookTitle}>📖 {item.title}</Text>
            <Text style={styles.bookText}>
              <Text style={styles.bold}>หมวดหมู่:</Text> {item.category}
            </Text>
            <Text style={styles.bookText}>
              <Text style={styles.bold}>เหลือ:</Text> {item.availableCopies} เล่ม
            </Text>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => router.push(`/book/${item.id}`)}
            >
              <Text style={styles.detailText}>🔍 ดูรายละเอียด</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={[
              styles.pageButton,
              currentPage === 1 && styles.pageButtonDisabled,
            ]}
          >
            <Text style={styles.pageText}>⬅️ ก่อนหน้า</Text>
          </TouchableOpacity>

          <Text style={styles.pageNumber}>
            หน้า {currentPage} / {totalPages}
          </Text>

          <TouchableOpacity
            onPress={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            style={[
              styles.pageButton,
              currentPage === totalPages && styles.pageButtonDisabled,
            ]}
          >
            <Text style={styles.pageText}>ถัดไป ➡️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00FA9A",
    padding: 5,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    backgroundColor: "#D0E8FF",
    paddingVertical: 5,
    borderRadius: 10,
  },
  bookContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    width: "90%",  // Set width to 30% for 3 columns
    marginBottom: 15,
    marginRight: 15,
    marginLeft: 15,
    elevation: 3,
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  bookText: {
    fontSize: 14,
  },
  bold: {
    fontWeight: "bold",
  },
  detailButton: {
    marginTop: 10,
    backgroundColor: "#0d6efd",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  detailText: {
    color: "#fff",
    fontWeight: "bold",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  pageButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#007bff",
    borderRadius: 8,
  },
  pageButtonDisabled: {
    backgroundColor: "#ccc",
  },
  pageText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pageNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
