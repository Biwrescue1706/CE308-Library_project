import { useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  Modal, TextInput, Button, StyleSheet, RefreshControl,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function HomeScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchBooks = () => {
    axios
      .get(`${API_URL}/books/getAllBooks`, { withCredentials: true })
      .then((response) => setBooks(response.data))
      .catch((error) => {
        console.error("❌ เกิดข้อผิดพลาดในการดึงหนังสือ:");
        console.log("📦 error.response:", error.response?.data);
        console.log("📦 error.message:", error.message);
        console.log("📦 error.config:", error.config?.url);
      });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBooks();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  useFocusEffect(
    useCallback(() => {
      axios
        .get(`${API_URL}/users/me`, { withCredentials: true })
        .then((response) => setUserRole(response.data.user.role))
        .catch((error) => {
          console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
          console.log("🚫 ไม่พบ session หรือ Token:", error.response?.status);
          setUserRole(""); // 🧼 เคลียร์ role กลับเป็นผู้ใช้ทั่วไป
          router.replace("/");
        });
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [])
  );

  const handleDelete = (id: string) => {
    axios
      .delete(`${API_URL}/books/deleteBooks/${id}`, { withCredentials: true })
      .then(() => {
        setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
      })
      .catch((error) => console.error("❌ เกิดข้อผิดพลาดในการลบหนังสือ:", error));
  };

  const handleEdit = (book: any) => {
    setSelectedBook({ ...book });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedBook(null);
  };

  const handleBorrow = async (book: any) => {
    if (book.availableCopies > 0) {
      try {
        await axios.post(
          `${API_URL}/loans/borrow`,
          { items: [{ bookId: book.id, quantity: 1 }] },
          { withCredentials: true }
        );
        setBooks((prev) =>
          prev.map((b) =>
            b.id === book.id ? { ...b, availableCopies: b.availableCopies - 1 } : b
          )
        );
      } catch (err) {
        console.error("❌ ยืมหนังสือผิดพลาด:", err);
      }
    }
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
          closeModal();
        })
        .catch((err) => console.error("❌ อัปเดตผิดพลาด:", err));
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.bookContainer}>
            <Text style={styles.bookTitle}>📖 {item.title}</Text>
            <Text>หมวดหมู่ : {item.category}</Text>
            <Text>จํานวนหนังสือที่เหลือ : {item.availableCopies}</Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity onPress={() => router.push(`./book/${item.id}`)}>
                <Text style={{ color: "#007bff", marginTop: 10, textAlign: "center" }}>
                  🔍 ดูรายละเอียด
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.borrowButton}
                onPress={() => handleBorrow(item)}
                disabled={item.availableCopies === 0}
              >
                <Text style={styles.buttonText}>
                  {item.availableCopies > 0 ? "📖 ยืม" : "❌ หมด"}
                </Text>
              </TouchableOpacity>
              {userRole === "admin" && (
                <>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(item)}
                  >
                    <Text style={styles.buttonText}>✏️ แก้ไข</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={styles.buttonText}>🗑️ ลบ</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      />

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📝 แก้ไขหนังสือ</Text>
            <Text style={styles.inputLabel}>ชื่อหนังสือ : </Text>
            <TextInput
              style={styles.input}
              placeholder="ชื่อหนังสือ"
              value={selectedBook?.title || ""}
              onChangeText={(text) => setSelectedBook({ ...selectedBook, title: text })}
            />
            <Text style={styles.inputLabel}> ผู้แต่ง : </Text>
            <TextInput
              style={styles.input}
              placeholder="ผู้แต่ง"
              value={selectedBook?.author || ""}
              onChangeText={(text) => setSelectedBook({ ...selectedBook, author: text })}
            />
            <Text style={styles.inputLabel}> คำอธิบาย : </Text>
            <TextInput
              style={styles.input}
              placeholder="คำอธิบาย"
              value={selectedBook?.description || ""}
              onChangeText={(text) => setSelectedBook({ ...selectedBook, description: text })}
            />
            <Text style={styles.inputLabel}> หมวดหมู่ : </Text>
            <TextInput
              style={styles.input}
              placeholder="หมวดหมู่"
              value={selectedBook?.category || ""}
              onChangeText={(text) => setSelectedBook({ ...selectedBook, category: text })}
            />
            <Text style={styles.inputLabel}> จำนวนทั้งหมด : </Text>
            <TextInput
              style={styles.input}
              placeholder="จำนวนทั้งหมด"
              keyboardType="numeric"
              value={selectedBook?.totalCopies?.toString() || ""}
              onChangeText={(text) =>
                setSelectedBook({ ...selectedBook, totalCopies: Number(text) })
              }
            />
            <Text style={styles.inputLabel}> จำนวนหนังสือที่เหลือ : </Text>
            <TextInput
              style={styles.input}
              placeholder="จำนวนหนังสือที่เหลือ"
              keyboardType="numeric"
              value={selectedBook?.availableCopies?.toString() || ""}
              onChangeText={(text) =>
                setSelectedBook({ ...selectedBook, availableCopies: Number(text) })
              }
            />
            <Button title="💾 บันทึก" onPress={handleUpdate} />
            <Button title="❌ ยกเลิก" onPress={closeModal} />
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
    padding: 25,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  bookContainer: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  borrowButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#0de136",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputLabel: {
    alignSelf: "flex-start",
    fontWeight: "600",
    marginTop: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
});
