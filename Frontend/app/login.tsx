import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

// 👉 เปิดใช้งาน cookie (สำคัญมาก)
axios.defaults.withCredentials = true;

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("⚠️ กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/users/login`,
        { username, password },
        { withCredentials: true } // 🟢 ให้แน่ใจว่าแนบ cookies ไปด้วย
      );

      const { user } = res.data;

      console.log("✅ เข้าสู่ระบบแล้ว:", user);

      Alert.alert("✅ เข้าสู่ระบบสำเร็จ");

      if (user.role === "admin") {
        router.replace("/addBooks");
      } else {
        router.replace("./(tabs)/index");
      }
    } catch (err: any) {
      console.error("❌ Login error:", err.response?.data || err.message);
      Alert.alert(
        "❌ เข้าสู่ระบบล้มเหลว",
        err.response?.data?.error || "โปรดลองใหม่"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.header}>🔐 เข้าสู่ระบบ</Text>

        <Text style={styles.label}>ชื่อผู้ใช้</Text>
        <TextInput
          style={styles.input}
          placeholder="username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>รหัสผ่าน</Text>
        <TextInput
          style={styles.input}
          placeholder="รหัสผ่าน"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text>ยังไม่มีบัญชี?</Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.registerText}>สมัครสมาชิก</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#C8E6B2",
  },
  loginBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 5,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#007bff",
    marginLeft: 5,
    fontWeight: "bold",
  },
});
