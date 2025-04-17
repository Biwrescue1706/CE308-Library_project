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

  const fetchBooks = () => {
    setRefreshing(true);
    axios
      .get(`${API_URL}/books/getAllBooks`, { withCredentials: true })
      .then((res) => {
        setBooks(res.data);
        setFilteredBooks(res.data);
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
    if (text.trim() === "") {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter((book) =>
        book.title.toLowerCase().includes(text.toLowerCase()) ||
        book.category.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  };

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

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C8E6B2",
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
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
});
