import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Button,
  Alert, TextInput, TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import Constants from "expo-constants";

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
      .catch((err) => {
        console.error("❌ ไม่พบหนังสือ:", err);
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
      .catch((err) => {
        Alert.alert("ไม่สามารถเพิ่มเข้าตะกร้าได้");
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
        { bookId: book.id, quantity },
        { withCredentials: true }
      )
      .then(() => {
        router.push("/(tabs)/history");
      })
      .catch(() => {
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถยืมหนังสือได้");
      });
  };

  if (!book) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>📖 {book.title}</Text>
        <Text style={styles.detail}>ผู้แต่ง: {book.author}</Text>
        <Text style={styles.detail}>หมวดหมู่: {book.category}</Text>
        <Text style={styles.detail}>คำอธิบาย: {book.description}</Text>
        <Text style={styles.detail}>จำนวนที่เหลือ: {book.availableCopies}</Text>

        <View style={styles.quantityRow}>
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={quantity.toString()}
            onChangeText={(text) => {
              const num = Number(text);
              if (!isNaN(num)) {
                if (num > book.availableCopies) {
                  setQuantity(book.availableCopies);
                } else if (num < 1) {
                  setQuantity(1);
                } else {
                  setQuantity(num);
                }
              }
            }}
            keyboardType="numeric"
          />
          <TouchableOpacity
            onPress={() => {
              if (quantity < book.availableCopies) {
                setQuantity(quantity + 1);
              }
            }}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.maxNote}>สูงสุด {book.availableCopies} เล่ม</Text>

        {book.availableCopies > 0 ? (
          <>
            <Button title="🛒 เพิ่มเข้าตะกร้า" onPress={handleAddToCart} />
            <View style={{ height: 10 }} />
            <Button title="📚 ยืมหนังสือ" onPress={handleBorrow} />
          </>
        ) : (
          <Text style={styles.outOfStock}>❌ หนังสือหมดแล้ว</Text>
        )}
      </View>
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
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginHorizontal: 10,
    minWidth: 60,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  quantityButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  maxNote: {
    textAlign: "center",
    color: "gray",
    fontSize: 12,
    marginBottom: 12,
  },
  outOfStock: {
    textAlign: "center",
    color: "red",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
});
