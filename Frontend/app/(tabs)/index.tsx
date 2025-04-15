import { useRouter } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";
import { getAllBooks, deleteBook, updateBook, borrowBook, getMe } from "../utils/api";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    getMe()
      .then((res) => setUserRole(res.data.user.role))
      .catch((err) => console.error("❌ ไม่สามารถดึง role ผู้ใช้ได้:", err));
  }, []);

  useFocusEffect(
    useCallback(() => {
      getAllBooks()
        .then((res) => setBooks(res.data))
        .catch((error) => console.error("❌ เกิดข้อผิดพลาดในการดึงหนังสือ :", error));
    }, [])
  );

  const handleDelete = (id: string) => {
    deleteBook(id)
      .then(() => {
        setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
      })
      .catch((error) => console.error("❌ เกิดข้อผิดพลาดในการลบหนังสือ :", error));
  };

  const handleEdit = (book: any) => {
    setSelectedBook(book);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedBook(null);
  };

  const handleBorrow = async (book: any) => {
    if (book.availableCopies > 0) {
      try {
        const updatedBook = await borrowBook(book.id);
        setBooks((prevBooks) =>
          prevBooks.map((b) => (b.id === book.id ? updatedBook.data : b))
        );
      } catch (error) {
        console.error("❌ Error borrowing book:", error);
      }
    }
  };

  const handleUpdate = () => {
    if (selectedBook) {
      const updatedFields = {
        title: selectedBook.title,
        author: selectedBook.author,
        description: selectedBook.description,
        category: selectedBook.category,
        totalCopies: selectedBook.totalCopies,
        availableCopies: selectedBook.availableCopies,
      };

      updateBook(selectedBook.id, updatedFields)
        .then(() => {
          closeModal();
          setBooks((prevBooks) =>
            prevBooks.map((book) =>
              book.id === selectedBook.id ? { ...selectedBook } : book
            )
          );
        })
        .catch((error) => console.error("❌ Error updating book:", error));
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
        renderItem={({ item }) => (
          <View style={styles.bookContainer}>
            <Text style={styles.bookTitle}>📖 {item.title}</Text>
            <Text>ผู้แต่ง : {item.author}</Text>
            <Text>คำอธิบาย : {item.description}</Text>
            <Text>หมวดหมู่ : {item.category}</Text>
            <Text>จํานวนหนังสือที่เหลือ : {item.availableCopies}</Text>

            <View style={styles.buttonGroup}>
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
            <TextInput
              style={styles.input}
              placeholder="ชื่อหนังสือ"
              value={selectedBook?.title}
              onChangeText={(text) => setSelectedBook({ ...selectedBook, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="ผู้แต่ง"
              value={selectedBook?.author}
              onChangeText={(text) => setSelectedBook({ ...selectedBook, author: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="คำอธิบาย"
              value={selectedBook?.description}
              onChangeText={(text) => setSelectedBook({ ...selectedBook, description: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="หมวดหมู่"
              value={selectedBook?.category}
              onChangeText={(text) => setSelectedBook({ ...selectedBook, category: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="จำนวนทั้งหมด"
              value={String(selectedBook?.totalCopies)}
              onChangeText={(text) =>
                setSelectedBook({ ...selectedBook, totalCopies: parseInt(text) })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="จำนวนหนังสือที่เหลือ"
              value={String(selectedBook?.availableCopies)}
              onChangeText={(text) =>
                setSelectedBook({ ...selectedBook, availableCopies: parseInt(text) })
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
  input: {
    width: "100%",
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
});
