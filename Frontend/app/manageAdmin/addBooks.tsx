// 📁 app/manageAdmin/addBooks.tsx
import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  StyleSheet, Modal, ActivityIndicator,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import BookCard from "../components/BookCard";
import BookForm from "../components/BookForm";
import PageNavigator from "../components/PageNavigator";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function AddBooksScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    totalCopies: "",
    availableCopies: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  const totalPages = Math.ceil(books.length / itemsPerPage);
  const paginatedBooks = books.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.user;
        if (user.role !== "admin") {
          Alert.alert("🚫 คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
          router.replace("/");
        } else {
          setUserId(user.id);
          await fetchBooks();
          setLoading(false);
        }
      } catch {
        Alert.alert("กรุณาเข้าสู่ระบบใหม่");
        router.replace("/(auth)/login");
      }
    };

    checkAuth();
  }, []);

  const fetchBooks = async () => {
    const res = await axios.get(`${API_URL}/books/getAllBooks`);
    const sorted = res.data.sort((a: any, b: any) => a.title.localeCompare(b.title));
    setBooks(sorted);
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => {
      if (key === "totalCopies" && !isEditMode) {
        return {
          ...prev,
          [key]: value,
          availableCopies: value,
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleSaveBook = async () => {
    const { title, author, category, totalCopies, availableCopies } = form;
    if (!title || !author || !category) {
      Alert.alert("⚠️ กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (isEditMode && editingBookId) {
        await axios.put(
          `${API_URL}/books/editBooks/${editingBookId}`,
          {
            title,
            author,
            category,
            totalCopies: parseInt(totalCopies),
            availableCopies: parseInt(availableCopies),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert("✅ แก้ไขสำเร็จ");
      } else {
        await axios.post(
          `${API_URL}/books/create`,
          {
            title,
            author,
            category,
            totalCopies: parseInt(totalCopies),
            availableCopies: parseInt(totalCopies),
            createdById: userId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert("✅ เพิ่มสำเร็จ");
      }
      resetForm();
      fetchBooks();
    } catch (error: any) {
      Alert.alert("❌ ไม่สำเร็จ", error.response?.data?.message || "โปรดลองใหม่");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      author: "",
      category: "",
      totalCopies: "",
      availableCopies: "",
    });
    setIsEditMode(false);
    setEditingBookId(null);
    setModalVisible(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert("ยืนยัน", "ต้องการลบหนังสือใช่ไหม?", [
      { text: "ยกเลิก" },
      {
        text: "ลบ",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.delete(`${API_URL}/books/deleteBooks/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchBooks();
            Alert.alert("✅ ลบแล้ว");
          } catch {
            Alert.alert("❌ ลบไม่สำเร็จ");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: "#00FA9A" }} contentContainerStyle={styles.container}>
      <Text style={styles.header}>📚 เพิ่มหนังสือใหม่</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setIsEditMode(false);
          setForm({ title: "", author: "", category: "", totalCopies: "", availableCopies: "" });
          setModalVisible(true);
        }}
      >
        <Text style={styles.buttonText}>➕ สร้างหนังสือใหม่</Text>
      </TouchableOpacity>

      <View style={styles.cardContainer}>
        {paginatedBooks.map((book, index) => (
          <View key={book.id} style={styles.cardWrapper}>
            <BookCard
              book={book}
              index={(currentPage - 1) * itemsPerPage + index}
              onEdit={() => {
                setForm({
                  title: book.title,
                  author: book.author,
                  category: book.category,
                  totalCopies: book.totalCopies.toString(),
                  availableCopies: book.availableCopies.toString(),
                });
                setEditingBookId(book.id);
                setIsEditMode(true);
                setModalVisible(true);
              }}
              onDelete={() => handleDelete(book.id)}
            />
          </View>
        ))}
      </View>

      <PageNavigator
        currentPage={currentPage}
        totalPages={totalPages}
        onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      />

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.header}>
            {isEditMode ? "✏️ แก้ไขหนังสือ" : "📖 เพิ่มหนังสือ"}
          </Text>
          <BookForm
            form={form}
            isEditMode={isEditMode}
            onChange={handleChange}
            onSubmit={handleSaveBook}
            onCancel={resetForm}
          />
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#00FA9A",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#DC143C",
    padding: 12,
    marginVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 12,
  },
  modalContainer: {
    padding: 20,
    backgroundColor: "#FFE4B5",
  },
});
