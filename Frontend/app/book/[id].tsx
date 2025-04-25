import React, { useEffect, useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import Constants from "expo-constants";
import BookInfoCard from "../components/BookInfoCard";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [book, setBook] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_URL}/books/getBooks/${id}`, { withCredentials: true })
      .then((res) => setBook(res.data))
      .catch(() => {
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลหนังสือได้");
      });
  }, [id]);

  const handleAddToCart = () => {
    axios
      .post(
        `${API_URL}/cart/add`,
        { bookId: book.id, quantity },
        { withCredentials: true }
      )
      .then(() => {
        Alert.alert("✅ เพิ่มเข้าตะกร้าสำเร็จ");
        router.push("/(tabs)/cart");
      })
      .catch(() => {
        Alert.alert("ไม่สามารถเพิ่มเข้าตะกร้าได้", "คุณมีหนังสือเล่มนี้อยู่ในตะกร้าแล้ว");
      });
  };

  const handleBorrow = () => {
    if (!book || book.availableCopies <= 0) {
      Alert.alert("❌", "หนังสือหมดแล้ว");
      return;
    }

    if (quantity > book.availableCopies) {
      Alert.alert("❌", "จำนวนที่ต้องการยืมมากกว่าจำนวนที่มี");
      return;
    }

    axios
      .post(
        `${API_URL}/loans/borrow`,
        { bookId: book.id, borrowedQuantity: quantity },
        { withCredentials: true }
      )
      .then(() => {
        Alert.alert("✅ ยืมสำเร็จ");
        router.push("/(tabs)/history");
      })
      .catch(() => {
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถยืมหนังสือได้");
      });
  };

  if (!book) return null;

  return (
    <View style={styles.container}>
      <BookInfoCard
        title={book.title}
        author={book.author}
        category={book.category}
        availableCopies={book.availableCopies}
        quantity={quantity}
        setQuantity={setQuantity}
        onAddToCart={handleAddToCart}
        onBorrow={handleBorrow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#00FA9A",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
