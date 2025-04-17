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
  Modal,
  FlatList,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

const API_URL = Constants.expoConfig?.extra?.API_URL;

const titleOptions = [
  // 👤 บุคคลทั่วไป
  "นาย", "นาง", "นางสาว", "ด.ญ.", "ด.ช.",

  // 🎓 วิชาการ
  "ดร.", "ผศ.", "รศ.", "ศ.", "ศาสตราจารย์เกียรติคุณ",
  "ผศ.ดร.", "รศ.ดร.", "ศ.ดร.", "ศาสตราจารย์เกียรติคุณ ดร.",

  // 🪖 รด. / นักศึกษาวิชาทหาร
  "ว่าที่ ร.ต.", "ว่าที่ ร.ต.ดร.", "ว่าที่ ร.ต. หญิง", "ว่าที่ ร.ต.ดร.หญิง",

  // 👮‍♂️ ตำรวจชาย
  "พล.ต.อ.", "พล.ต.ท.", "พล.ต.ต.",
  "พ.ต.อ.", "พ.ต.ท.", "พ.ต.ต.",
  "ร.ต.อ.", "ร.ต.ท.", "ร.ต.ต.",
  "ว่าที่ ร.ต.ต.",
  "ด.ต.", "ส.ต.อ.", "ส.ต.ท.", "ส.ต.ต.",

  // 👮‍♀️ ตำรวจหญิง
  "พล.ต.อ.หญิง", "พล.ต.ท.หญิง", "พล.ต.ต.หญิง",
  "พ.ต.อ.หญิง", "พ.ต.ท.หญิง", "พ.ต.ต.หญิง",
  "ร.ต.อ.หญิง", "ร.ต.ท.หญิง", "ร.ต.ต.หญิง",
  "ว่าที่ ร.ต.ต.หญิง",
  "ด.ต.หญิง", "ส.ต.อ.หญิง", "ส.ต.ท.หญิง", "ส.ต.ต.หญิง",

  // 🪖 ทหารชาย
  "พล.ต.", "พ.อ.", "พ.ท.", "พ.ต.",
  "ร.อ.", "ร.ท.", "ร.ต.",
  "ส.อ.", "ส.ท.", "ส.ต.",
  "พลฯ",

  // 🪖 ทหารหญิง
  "พล.ต.หญิง", "พ.อ.หญิง", "พ.ท.หญิง", "พ.ต.หญิง",
  "ร.อ.หญิง", "ร.ท.หญิง", "ร.ต.หญิง",
  "ส.อ.หญิง", "ส.ท.หญิง", "ส.ต.หญิง",
  "พลฯหญิง"
];

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
  const [showTitleModal, setShowTitleModal] = useState(false);
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
        role: "user",
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
            style={{ marginLeft: 25, marginBottom: 15 }}
          >
            <Text style={{ color: "#007bff" }}>
              {showPassword ? "🙈" : "👁️"}
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
            style={{ marginLeft: 25, marginBottom: 15 }}
          >
            <Text style={{ color: "#007bff" }}>
              {showPassword ? "🙈" : "👁️"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>คำนำหน้า (ไทย)</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowTitleModal(true)}>
            <Text>{form.titleTH || "เลือกคำนำหน้า"}</Text>
          </TouchableOpacity>

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

      {/* Modal เลือกคำนำหน้า */}
      <Modal visible={showTitleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <FlatList
              data={titleOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    handleChange("titleTH", item);
                    setShowTitleModal(false);
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowTitleModal(false)} style={styles.closeModal}>
              <Text style={{ color: "#dc3545" }}>❌ ปิด</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginVertical: 30,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginHorizontal: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 5,
    marginHorizontal: 20,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
    marginHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "80%",
    padding: 20,
    maxHeight: "60%",
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  closeModal: {
    marginTop: 10,
    alignItems: "center",
  },
});
