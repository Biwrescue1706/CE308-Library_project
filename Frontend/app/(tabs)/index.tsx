import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";
import BookItem from "../components/BookItem";
import PageNavigator from "../components/PageNavigator";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function HomeScreen() {
  const [books, setBooks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  const fetchBooks = () => {
    axios
      .get(`${API_URL}/books/getAllBooks`, { withCredentials: true })
      .then((res) => {
        const filteredAndSorted = res.data
          .filter((book: any) => book.availableCopies > 0)
          .sort((a: any, b: any) => {
            const titleCompare = a.title.localeCompare(b.title); // ASC
            if (titleCompare !== 0) return titleCompare;
            return a.category.localeCompare(b.category); // ASC
          });
  
        setBooks(filteredAndSorted);
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
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <BookItem
            id={item.id}
            title={item.title}
            category={item.category}
          />
        )}
      />

      {totalPages > 1 && (
        <PageNavigator
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
    marginBottom: 10,
    backgroundColor: "#D0E8FF",
    paddingVertical: 5,
    borderRadius: 10,
  },
});
