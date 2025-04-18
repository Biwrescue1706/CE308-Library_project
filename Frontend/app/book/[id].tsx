import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Button,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number>(1);

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
        console.error("❌ เพิ่มเข้าตะกร้าไม่สำเร็จ:", err);
        Alert.alert("ไม่สามารถเพิ่มเข้าตะกร้าได้");
      });
  };

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
      <View style={styles.card}>
        <Text style={styles.title}>📖 {book.title}</Text>
        <Text style={styles.detail}>ผู้แต่ง: {book.author}</Text>
        <Text style={styles.detail}>หมวดหมู่: {book.category}</Text>
        <Text style={styles.detail}>คำอธิบาย: {book.description}</Text>
        <Text style={styles.detail}>จำนวนที่เหลือ: {book.availableCopies}</Text>

        <View style={styles.quantityRow}>
          <TouchableOpacity
            onPress={() =>
              setQuantity(Math.max(1, quantity - 1))}
            style={styles.quantityButton}>
            <Text style={styles.quantityText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={quantity.toString()}
            onChangeText={(text) => setQuantity(Number(text) || 1)}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.quantityButton}>
            <Text style={styles.quantityText}>+</Text>
          </TouchableOpacity>
        </View>

        <Button title="🛒 เพิ่มเข้าตะกร้า" onPress={handleAddToCart} />

        <View style={{ height: 10 }} />

        <Button title="📚 ยืมหนังสือ" onPress={handleBorrow} disabled={book.availableCopies <= 0} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#C8E6B2",
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C8E6B2",
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
    marginBottom: 10,
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
});
