import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import SearchResultCard from "../components/SearchResultCard";
import PageNavigator from "../components/PageNavigator";

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
}

export default function SearchScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 14;

  const fetchBooks = () => {
    setRefreshing(true);
    axios
      .get(`${API_URL}/books/getAllBooks`, { withCredentials: true })
      .then((res) => {
        setBooks(res.data);
        setFilteredBooks([]);
        setSearchText(""); // ✅ เคลียร์ช่องค้นหา
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
    setCurrentPage(1);
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
              <SearchResultCard
                id={item.id}
                title={item.title}
                author={item.author}
                category={item.category}
              />
            )}
            ListEmptyComponent={<Text style={styles.empty}>ไม่พบหนังสือที่ค้นหา</Text>}
          />

          {totalPages > 1 && (
            <PageNavigator
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            />
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
  empty: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});
