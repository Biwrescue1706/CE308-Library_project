// ✅ (auth)/register.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    titleTH: "",
    firstNameTH: "",
    lastNameTH: "",
    phone: "",
    birthDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const handleRegister = async () => {
    const {
      email,
      username,
      password,
      confirmPassword,
      titleTH,
      firstNameTH,
      lastNameTH,
      birthDate,
      phone,
    } = form;

    if (!email || !username || !password || !confirmPassword || !titleTH || !firstNameTH || !lastNameTH || !phone) {
      Alert.alert("⚠️ กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("❌ รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/users/register`, {
        email,
        username,
        password,
        titleTH,
        firstNameTH,
        lastNameTH,
        birthDate: birthDate.toISOString(),
        phone,
        role: "user", // ✅ เพิ่มค่า role เป็น user โดยอัตโนมัติ
      });

      Alert.alert("✅ สมัครสมาชิกสำเร็จ", "กรุณาเข้าสู่ระบบ");
      router.replace("/login");
    } catch (error: any) {
      console.error("❌ Register error:", error.response?.data || error.message);
      Alert.alert(
        "❌ สมัครไม่สำเร็จ",
        error.response?.data?.message || "โปรดลองใหม่"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Text style={styles.header}>📝 สมัครสมาชิก</Text>

          <Text style={styles.label}>อีเมล</Text>
          <TextInput
            style={styles.input}
            value={form.email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(text) => handleChange("email", text)}
          />

          <Text style={styles.label}>ชื่อผู้ใช้ (Username)</Text>
          <TextInput
            style={styles.input}
            value={form.username}
            onChangeText={(text) => handleChange("username", text)}
          />

          <Text style={styles.label}>รหัสผ่าน</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={form.password}
            onChangeText={(text) => handleChange("password", text)}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ marginHorizontal: 20, marginBottom: 10 }}
          >
            <Text style={{ color: "#007bff" }}>
              {showPassword ? "🙈 ซ่อนรหัสผ่าน" : "👁️ แสดงรหัสผ่าน"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={form.confirmPassword}
            onChangeText={(text) => handleChange("confirmPassword", text)}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ marginHorizontal: 20, marginBottom: 10 }}
          >
            <Text style={{ color: "#007bff" }}>
              {showPassword ? "🙈 ซ่อนรหัสผ่าน" : "👁️ แสดงรหัสผ่าน"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>คำนำหน้า (ไทย)</Text>
          <TextInput
            style={styles.input}
            value={form.titleTH}
            onChangeText={(text) => handleChange("titleTH", text)}
          />

          <Text style={styles.label}>ชื่อ (ไทย)</Text>
          <TextInput
            style={styles.input}
            value={form.firstNameTH}
            onChangeText={(text) => handleChange("firstNameTH", text)}
          />

          <Text style={styles.label}>นามสกุล (ไทย)</Text>
          <TextInput
            style={styles.input}
            value={form.lastNameTH}
            onChangeText={(text) => handleChange("lastNameTH", text)}
          />

          <Text style={styles.label}>เบอร์โทรศัพท์</Text>
          <TextInput
            style={styles.input}
            value={form.phone}
            keyboardType="phone-pad"
            onChangeText={(text) => handleChange("phone", text)}
          />

          <Text style={styles.label}>วันเกิด</Text>
          <TouchableOpacity style={[styles.input, { justifyContent: "center" }]} onPress={() => setShowDatePicker(true)}>
            <Text>{form.birthDate.toLocaleDateString("th-TH")}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={form.birthDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) handleChange("birthDate", selectedDate);
              }}
            />
          )}

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>สมัครสมาชิก</Text>}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text>มีบัญชีอยู่แล้ว?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginText}>เข้าสู่ระบบ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
    backgroundColor: "#C8E6B2",
    flexGrow: 1,
  },
  container: {
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 30,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    margin: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 5,
    margin: 20,
  },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    margin: 5,
    marginRight: 20,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#007bff",
    marginLeft: 5,
    fontWeight: "bold",
  },
});