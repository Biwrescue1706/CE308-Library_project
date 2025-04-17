import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator, Modal, RefreshControl,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function AddBooksScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
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
          router.replace("/(auth)/login");
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
      setBooks(res.data);
    } catch (error) {
      console.error("❌ Fetch books error:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveBook = async () => {
    const { title, author, description, category, totalCopies, availableCopies } = form;

    if (!title || !author || !description || !category) {
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
            description,
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
            description,
            category,
            totalCopies: parseInt(totalCopies),
            availableCopies: parseInt(availableCopies),
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
      description: "",
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
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
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

      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.colIndex]}>ลำดับ</Text>
            <Text style={[styles.tableCell, styles.colTitle]}>ชื่อหนังสือ</Text>
            <Text style={[styles.tableCell, styles.colCreator]}>ผู้สร้าง</Text>
            <Text style={[styles.tableCell, styles.colUpdater]}>ผู้แก้ไข</Text>
            <Text style={[styles.tableCell, styles.colAction]}>แก้ไข</Text>
            <Text style={[styles.tableCell, styles.colAction, styles.lastCell]}>ลบ</Text>
          </View>

          {books.map((book, index) => (
            <View key={book.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colIndex]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.colTitle]}>{book.title}</Text>
              <Text style={[styles.tableCell, styles.colCreator]}>{book.createdBy?.username || "-"}</Text>
              <Text style={[styles.tableCell, styles.colUpdater]}>{book.updatedBy?.username || "-"}</Text>
              <Text style={[styles.tableCell, styles.colAction]}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#ffc107" }]}
                  onPress={() => {
                    setForm({
                      title: book.title,
                      author: book.author,
                      description: book.description,
                      category: book.category,
                      totalCopies: book.totalCopies.toString(),
                      availableCopies: book.availableCopies.toString(),
                    });
                    setIsEditMode(true);
                    setEditingBookId(book.id);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.actionText}>✏️ แก้ไขหนังสือ </Text>
                </TouchableOpacity>
              </Text>
              <Text style={[styles.tableCell, styles.colAction, styles.lastCell]}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#dc3545" }]}
                  onPress={() => handleDelete(book.id)}
                >
                  <Text style={styles.actionText}>🗑️ ลบหนังสือ</Text>
                </TouchableOpacity>
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>
            {isEditMode ? "✏️ แก้ไขหนังสือ" : "📖 เพิ่มหนังสือ"}
          </Text>

          {[
            "title",
            "author",
            "description",
            "category",
            "totalCopies",
            "availableCopies",
          ].map((key) => (
            <View key={key}>
              <Text style={styles.label}>{getLabel(key)}</Text>
              <TextInput
                style={styles.input}
                value={form[key as keyof typeof form]}
                onChangeText={(text) => handleChange(key, text)}
                keyboardType={
                  key === "totalCopies" || key === "availableCopies"
                    ? "numeric"
                    : "default"
                }
                multiline={key === "description"}
                numberOfLines={key === "description" ? 4 : 1}
              />
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
    case "title":
      return "ชื่อหนังสือ";
    case "author":
      return "ผู้แต่ง";
    case "description":
      return "รายละเอียด";
    case "category":
      return "หมวดหมู่";
    case "totalCopies":
      return "จำนวนทั้งหมด";
    case "availableCopies":
      return "จำนวนที่สามารถยืมได้";
    default:
      return key;
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#C8E6B2",
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
  label: {
    fontSize: 16,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  tableHeader: {
    marginTop : 20 ,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
  },
  lastCell: {
    borderRightWidth: 0,
  },
  actionButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginHorizontal: 2,
    borderRadius: 5,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  colIndex: { width: 50 },
  colTitle: { width: 200 },
  colCreator: { width: 150 },
  colUpdater: { width: 150 },
  colAction: { width: 150 },
});
