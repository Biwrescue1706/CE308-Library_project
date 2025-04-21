import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const fetchBooks = () => {
    setRefreshing(true);
    axios
      .get(`${API_URL}/books/getAllBooks`, { withCredentials: true })
      .then((res) => {
        setBooks(res.data);
        setFilteredBooks([]);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        console.error("❌ ไม่สามารถโหลดหนังสือได้:", err);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    setCurrentPage(1); // reset หน้า
    if (text.trim() === "") {
      setFilteredBooks([]);
    } else {
      const filtered = books.filter((book) =>
        book.title.toLowerCase().includes(text.toLowerCase()) ||
        book.category.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  };

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 ค้นหาชื่อหนังสือหรือหมวดหมู่"
        value={searchText}
        onChangeText={handleSearch}
      />

      {searchText.trim() !== "" && (
        <>
          <FlatList
            data={paginatedBooks}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchBooks} />}
            renderItem={({ item }) => (
              <View style={styles.bookItem}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text>ผู้แต่ง: {item.author}</Text>
                <Text>หมวดหมู่: {item.category}</Text>
                <TouchableOpacity onPress={() => router.push(`/book/${item.id}`)}>
                  <Text style={styles.button}>🔍 ดูรายละเอียด</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>ไม่พบหนังสือที่ค้นหา</Text>}
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
                onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00FA9A",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C8E6B2",
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  bookItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: "48%",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  button: {
    color: "#007bff",
    marginTop: 10,
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
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
