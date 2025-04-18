import { useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function HomeScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const fetchBooks = () => {
    axios
      .get(`${API_URL}/books/getAllBooks`, { withCredentials: true })
      .then((res) => setBooks(res.data))
      .catch((err) => console.error("❌ ดึงหนังสือผิดพลาด:", err));
  };

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      axios
        .get(`${API_URL}/users/me`, { withCredentials: true })
        .then((res) => setUserRole(res.data.user.role))
        .catch((err) => {
          console.log("🔒 ไม่พบ session:", err.response?.status);
          setUserRole("");
          router.replace("/");
        });
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBooks();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert("ยืนยัน", "คุณต้องการลบหนังสือนี้ใช่หรือไม่?", [
      { text: "ยกเลิก" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: () => {
          axios
            .delete(`${API_URL}/books/deleteBooks/${id}`, { withCredentials: true })
            .then(() => {
              setBooks((prev) => prev.filter((b) => b.id !== id));
            })
            .catch((err) => console.error("❌ ลบหนังสือผิดพลาด:", err));
        },
      },
    ]);
  };

  const handleEdit = (book: any) => {
    setSelectedBook({ ...book });
    setModalVisible(true);
  };

  const handleUpdate = () => {
    if (selectedBook) {
      const updateData = {
        title: selectedBook.title,
        author: selectedBook.author,
        description: selectedBook.description,
        category: selectedBook.category,
        totalCopies: Number(selectedBook.totalCopies),
        availableCopies: Number(selectedBook.availableCopies),
      };

      axios
        .put(`${API_URL}/books/editBooks/${selectedBook.id}`, updateData, {
          withCredentials: true,
        })
        .then(() => {
          setBooks((prev) =>
            prev.map((b) => (b.id === selectedBook.id ? selectedBook : b))
          );
          setModalVisible(false);
        })
        .catch((err) => console.error("❌ แก้ไขผิดพลาด:", err));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 รายการหนังสือ</Text>

      <FlatList
        data={[...books].sort((a, b) =>
          a.title.localeCompare(b.title) || a.availableCopies - b.availableCopies
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.bookContainer}>
            <Text style={styles.bookTitle}>📖 {item.title}</Text>
            <Text style={styles.bookText}>
              <Text style={styles.bold}>หมวดหมู่หนังสือ: </Text>{item.category}
            </Text>
            <Text style={styles.bookText}>
              <Text style={styles.bold}>จำนวนที่เหลือ: </Text>{item.availableCopies} <Text style={styles.bold}>เล่ม</Text>
            </Text>

            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => router.push(`./book/${item.id}`)}
            >
              <Text style={styles.detailText}>🔍 ดูรายละเอียด</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal แก้ไข */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>แก้ไขหนังสือ</Text>

            <TextInput
              style={styles.input}
              value={selectedBook?.title}
              onChangeText={(text) => setSelectedBook({ ...selectedBook, title: text })}
              placeholder="ชื่อหนังสือ"
            />
            <TextInput
              style={styles.input}
              value={selectedBook?.author}
              onChangeText={(text) => setSelectedBook({ ...selectedBook, author: text })}
              placeholder="ผู้แต่ง"
            />
            <TextInput
              style={styles.input}
              value={selectedBook?.category}
              onChangeText={(text) => setSelectedBook({ ...selectedBook, category: text })}
              placeholder="หมวดหมู่"
            />
            <TextInput
              style={styles.input}
              value={selectedBook?.availableCopies?.toString()}
              keyboardType="numeric"
              onChangeText={(text) =>
                setSelectedBook({ ...selectedBook, availableCopies: parseInt(text) })
              }
              placeholder="จำนวนที่เหลือ"
            />

            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <TouchableOpacity style={styles.modalSave} onPress={handleUpdate}>
                <Text style={styles.buttonText}>💾 บันทึก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, { backgroundColor: "#888" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>❌ ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C8E6B2",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    backgroundColor: "#D0E8FF",
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    width: "48%",
    marginBottom: 15,
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
  adminButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#ffc107",
    flex: 1,
    marginRight: 5,
    borderRadius: 5,
    alignItems: "center",
    padding: 8,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    flex: 1,
    borderRadius: 5,
    alignItems: "center",
    padding: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalSave: {
    flex: 1,
    backgroundColor: "#28a745",
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});
