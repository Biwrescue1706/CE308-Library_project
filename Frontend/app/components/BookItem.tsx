import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";

interface BookItemProps {
  id: string;
  title: string;
  category: string;
}

const BookItem: React.FC<BookItemProps> = ({ id, title, category }) => {
  const router = useRouter();

  return (
    <View style={styles.bookContainer}>
      <Text style={styles.bookTitle}>📖 {title}</Text>
      <Text style={styles.bookText}>
        <Text style={styles.bold}>หมวดหมู่ :</Text> {category}
      </Text>
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => router.push(`/book/${id}`)}
      >
        <Text style={styles.detailText}>🔍 ดูรายละเอียด</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bookContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    width: "48%", // ✅ รองรับ 2 คอลัมน์
    elevation: 3,
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
});

export default BookItem;
