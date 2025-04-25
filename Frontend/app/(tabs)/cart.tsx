import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, RefreshControl,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import CartItemCard from "../components/CartItemCard";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function CartScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const fetchCart = () => {
    setRefreshing(true);
    axios
      .get(`${API_URL}/users/me`, { withCredentials: true })
      .then(() => {
        setIsLoggedIn(true);
        return axios.get(`${API_URL}/cart/cart`, { withCredentials: true });
      })
      .then((res) => {
        setItems(res.data);
        setRefreshing(false);
      })
      .catch((err) => {
        console.error("❌ ตรวจสอบ token ล้มเหลว:", err);
        setIsLoggedIn(false);
        setRefreshing(false);
        if (err.response?.status === 401 || err.response?.status === 403) {
          Alert.alert("หมดเวลาใช้งาน", "กรุณาเข้าสู่ระบบใหม่");
          router.replace("/(auth)/login");
        }
      });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = (bookId: string) => {
    axios
      .delete(`${API_URL}/cart/remove/${bookId}`, { withCredentials: true })
      .then(() => {
        Alert.alert("✅ ลบสำเร็จ");
        fetchCart();
      })
      .catch((err) => console.error("❌ ลบไม่สำเร็จ:", err));
  };

  const handleClear = () => {
    axios
      .delete(`${API_URL}/cart/clear`, { withCredentials: true })
      .then(() => {
        fetchCart();
      })
      .catch((err) => console.error("❌ ล้างตะกร้าไม่สำเร็จ:", err));
  };

  const handleBorrowAll = () => {
    axios
      .post(
        `${API_URL}/loans/borrow-multiple`,
        {
          item: items.map((item) => ({
            bookId: item.book.id,
            borrowedQuantity: item.quantity ?? 1,
          })),
        },
        { withCredentials: true }
      )
      .then(() => {
        Alert.alert("✅ ยืมสำเร็จ");
        handleClear();
        router.replace("/(tabs)/history");
      })
      .catch((err) => {
        console.error("❌ ยืมไม่สำเร็จ:", err.response?.data || err);
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถยืมหนังสือได้");
      });
  };

  const handleUpdateQuantity = (bookId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemove(bookId);
      return;
    }

    axios
      .patch(
        `${API_URL}/cart/update/${bookId}`,
        { quantity: newQty },
        { withCredentials: true }
      )
      .then(() => {
        setItems((prev) =>
          prev.map((item) =>
            item.book.id === bookId ? { ...item, quantity: newQty } : item
          )
        );
      })
      .catch((err) => {
        console.error("❌ อัปเดตจำนวนล้มเหลว:", err);
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตจำนวนได้");
      });
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.center}>
        <Text>กรุณาเข้าสู่ระบบเพื่อดูตะกร้าหนังสือ</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={items}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchCart} />}
      ListHeaderComponent={<Text style={styles.header}>🛒 ตะกร้าหนังสือ</Text>}
      ListEmptyComponent={<Text style={styles.empty}>ไม่มีรายการในตะกร้า</Text>}
      renderItem={({ item }) => (
        <CartItemCard
          title={item.book.title}
          author={item.book.author}
          quantity={item.quantity}
          availableCopies={item.book.availableCopies}
          onIncrease={() => handleUpdateQuantity(item.book.id, item.quantity + 1)}
          onDecrease={() => handleUpdateQuantity(item.book.id, item.quantity - 1)}
          onRemove={() => handleRemove(item.book.id)}
        />
      )}
      ListFooterComponent={
        items.length > 0 ? (
          <>
            <TouchableOpacity style={styles.borrowButton} onPress={handleBorrowAll}>
              <Text style={styles.buttonText}>📚 ยืมหนังสือทั้งหมด</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.buttonText}>🗑️ ล้างตะกร้าทั้งหมด</Text>
            </TouchableOpacity>
          </>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#00FA9A",
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C8E6B2",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  borrowButton: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "#ff9800",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 50,
  },
});
