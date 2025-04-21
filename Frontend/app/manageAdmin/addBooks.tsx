import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator, Modal,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function AddBooksScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [books, setBooks] = useState<any[]>([]);
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

  useEffect(() => {
    const checkRole = async () => {
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
      } catch (error) {
        Alert.alert("กรุณาเข้าสู่ระบบอีกครั้ง");
        router.replace("/(auth)/login");
      }
    };

    checkRole();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API_URL}/books/getAllBooks`);
      const sortedBooks = res.data.sort((a: any, b: any) => a.title.localeCompare(b.title));
      setBooks(sortedBooks);
    } catch (error) {
      alert("❌ โหลดหนังสือไม่สำเร็จ");
    }
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
        Alert.alert("✅ แก้ไขหนังสือสำเร็จ");
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
        Alert.alert("✅ เพิ่มหนังสือสำเร็จ");
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
    Alert.alert("ยืนยัน", "คุณต้องการลบหนังสือใช่หรือไม่?", [
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
            Alert.alert("✅ ลบหนังสือแล้ว");
          } catch (err) {
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
    <ScrollView
      style={{ backgroundColor: "#00FA9A" }}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.header}>📚 เพิ่มหนังสือใหม่</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setIsEditMode(false);
          setEditingBookId(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.buttonText}>➕ สร้างหนังสือใหม่</Text>
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.cardContainer}
      >
        {books.map((book) => (
          <View key={book.id} style={styles.card}>
            <Text style={styles.bookTitle}>📖 {book.title}</Text>
            <Text style={styles.bookText}>
              <Text style={styles.bold}>หมวดหมู่ :</Text> {book.category}
            </Text>
            <Text style={styles.bookText}>
              <Text style={styles.bold}>เหลือ :</Text> {book.availableCopies} เล่ม
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#D2691E" }]}
              onPress={() => {
                setForm({
                  title: book.title,
                  author: book.author,
                  category: book.category,
                  totalCopies: book.totalCopies.toString(),
                  availableCopies: book.availableCopies.toString(),
                });
                setIsEditMode(true);
                setEditingBookId(book.id);
                setModalVisible(true);
              }}
            >
              <Text style={styles.actionText}>✏️ แก้ไขหนังสือ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#0000FF" }]}
              onPress={() => handleDelete(book.id)}
            >
              <Text style={styles.actionText}>🗑️ ลบหนังสือ</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView
          style={{ backgroundColor: "#FFE4B5" }}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.header}>
            {isEditMode ? "✏️ แก้ไขหนังสือ" : "📖 เพิ่มหนังสือ"}
          </Text>

          {["title", "author", "category", "totalCopies"]
            .concat(isEditMode ? ["availableCopies"] : [])
            .map((key) => (
              <View key={key}>
                <Text style={styles.label}>{getLabel(key)}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={form[key as keyof typeof form]}
                    onChangeText={(text) => handleChange(key, text)}
                    keyboardType={
                      key === "totalCopies" || key === "availableCopies"
                        ? "numeric"
                        : "default"
                    }
                  />
                </View>
              </View>
            ))}

          <TouchableOpacity style={styles.button} onPress={handleSaveBook}>
            <Text style={styles.buttonText}>💾 บันทึก</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#6c757d" }]}
            onPress={resetForm}
          >
            <Text style={styles.buttonText}>❌ ยกเลิก</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const getLabel = (key: string) => {
  switch (key) {
    case "title": return "ชื่อหนังสือ";
    case "author": return "ผู้แต่ง";
    case "category": return "หมวดหมู่";
    case "totalCopies": return "จำนวนทั้งหมด";
    case "availableCopies": return "จำนวนที่สามารถยืมได้";
    default: return key;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#00FA9A",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00FA9A",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 0,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginTop: 15,
  },
  inputContainer: {
    backgroundColor: "#fff",  // White background for input
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 8,
    padding: 10,
  },
  input: {
    fontSize: 16,
    backgroundColor: "#fff",  // Ensure the input background is white
  },
  button: {
    backgroundColor: "#DC143C",
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
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
    marginTop: 10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    width: "48%",  // Card width for 2 items per row
    marginBottom: 20,
    elevation: 3,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  bookText: {
    fontSize: 14,
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 5,
    marginTop: 5,
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    padding: 4,
    margin: 4,
    backgroundColor: "#FFE4B5", // White background for the modal content
    borderTopLeftRadius: 10,
    borderTopRightRadius: 20,
    flex: 1,
  },
});
