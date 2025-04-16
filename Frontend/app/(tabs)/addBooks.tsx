import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
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

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    totalCopies: "1",
    availableCopies: "1",
  });

  useEffect(() => {
    const checkRole = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.role !== "admin") {
          Alert.alert("🚫 คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
          router.replace("/");
        } else {
          setUserId(res.data.id);
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Auth error:", error);
        Alert.alert("กรุณาเข้าสู่ระบบอีกครั้ง");
        router.replace("/login");
      }
    };

    checkRole();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddBook = async () => {
    const {
      title,
      author,
      description,
      category,
      totalCopies,
      availableCopies,
    } = form;

    if (
      !title ||
      !author ||
      !description ||
      !category ||
      !totalCopies ||
      !availableCopies
    ) {
      Alert.alert("⚠️ กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert("✅ เพิ่มหนังสือสำเร็จ");
      setForm({
        title: "",
        author: "",
        description: "",
        category: "",
        totalCopies: "1",
        availableCopies: "1",
      });
    } catch (error: any) {
      console.error("❌ Add book error:", error.response?.data || error.message);
      Alert.alert("❌ เพิ่มหนังสือไม่สำเร็จ", error.response?.data?.message || "โปรดลองใหม่");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📚 เพิ่มหนังสือใหม่</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleAddBook}>
        <Text style={styles.buttonText}>💾 บันทึก</Text>
      </TouchableOpacity>
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
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
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
    marginTop: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
