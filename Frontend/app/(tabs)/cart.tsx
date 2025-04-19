import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function CartScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        console.error("❌ ตรวจสอบ token ล้มเหลว:", err);
        setIsLoggedIn(false);
        setLoading(false);
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
      .catch((err) => {
        console.error("❌ ลบไม่สำเร็จ:", err);
      });
  };

  const handleClear = () => {
    axios
      .delete(`${API_URL}/cart/clear`, { withCredentials: true })
      .then(() => {
        Alert.alert("✅ ล้างตะกร้าสำเร็จ");
        fetchCart();
      })
      .catch((err) => {
        console.error("❌ ล้างตะกร้าไม่สำเร็จ:", err);
      });
  };

  const handleBorrowAll = () => {
    axios
      .post(
        `${API_URL}/loans/borrow-multiple`,
        {
          items: items.map((item) => ({
            bookId: item.book.id,
            quantity: item.quantity ?? 1,
          })),
        },
        { withCredentials: true }

      )
      .then(() => {
        Alert.alert("✅ ยืมสำเร็จ");
        fetchCart();
        handleClear();
        router.replace("/(tabs)/history");
      })
      .catch((err) => {
        console.error("❌ ยืมไม่สำเร็จ:", err);
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถยืมหนังสือได้");
      });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchCart} />
      }
      ListHeaderComponent={<Text style={styles.header}>🛒 ตะกร้าหนังสือ</Text>}
      ListEmptyComponent={<Text style={styles.empty}>ไม่มีรายการในตะกร้า</Text>}
      renderItem={({ item }) => (
        <View style={styles.itemBox}>
          <Text style={styles.title}>{item.book.title}</Text>
          <Text>ผู้แต่ง: {item.book.author}</Text>
          <Text>จำนวน: {item.quantity ?? 1}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemove(item.book.id)}
          >
            <Text style={styles.buttonText}>ลบ</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "#C8E6B2",
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
  itemBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "#ff9800",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  borrowButton: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
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
