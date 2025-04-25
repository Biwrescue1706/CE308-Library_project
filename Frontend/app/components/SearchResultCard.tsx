import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

interface Props {
  id: string;
  title: string;
  author: string;
  category: string;
}

const SearchResultCard: React.FC<Props> = ({ id, title, author, category }) => {
  const router = useRouter();

  return (
    <View style={styles.bookItem}>
      <Text style={styles.bookTitle}>{title}</Text>
      <Text>ผู้แต่ง: {author}</Text>
      <Text>หมวดหมู่: {category}</Text>
      <TouchableOpacity onPress={() => router.push(`/book/${id}`)}>
        <Text style={styles.button}>🔍 ดูรายละเอียด</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default SearchResultCard;
