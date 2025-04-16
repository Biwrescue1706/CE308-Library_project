// 📁 app/book/[id].tsx
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Button, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_URL}/books/getBooks/${id}`, { withCredentials: true })
      .then((res) => {
        setBook(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ ไม่พบหนังสือ:", err);
        setLoading(false);
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลหนังสือได้");
      });
  }, [id]);

  const handleBorrow = () => {
    if (!book || book.availableCopies <= 0) {
      Alert.alert("❌", "หนังสือหมดแล้ว");
      return;
    }

    axios
      .post(
        `${API_URL}/loans/borrow`,
        { items: [{ bookId: book.id, quantity: 1 }] },
        { withCredentials: true }
      )
      .then(() => {
        Alert.alert("✅ ยืมสำเร็จ");
        setBook((prev: any) => ({
          ...prev,
          availableCopies: prev.availableCopies - 1,
        }));
      })
      .catch((err) => {
        console.error("❌ ยืมหนังสือไม่สำเร็จ:", err);
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถยืมหนังสือได้");
      });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.center}>
        <Text>ไม่พบข้อมูลหนังสือ</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 {book.title}</Text>
      <Text style={styles.detail}>ผู้แต่ง: {book.author}</Text>
      <Text style={styles.detail}>หมวดหมู่: {book.category}</Text>
      <Text style={styles.detail}>คำอธิบาย: {book.description}</Text>
      <Text style={styles.detail}>จำนวนที่เหลือ: {book.availableCopies}</Text>

      <Button title="📚 ยืมหนังสือ" onPress={handleBorrow} disabled={book.availableCopies <= 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#C8E6B2",
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
