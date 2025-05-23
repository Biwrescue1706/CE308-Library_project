import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;
axios.defaults.withCredentials = true;

export default function LoginScreen() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!usernameOrEmail) {
      Alert.alert("⚠️ กรุณากรอกชื่อผู้ใช้หรือ Email", "กรุณากรอกชื่อผู้ใช้หรือ Email ให้ถูกต้อง");
      return;
    }
    if (!password) {
      Alert.alert("⚠️ กรุณากรอกรหัสผ่าน", "กรุณากรอกรหัสผ่านให้ถูกต้อง");
      return;
    }
    
    try {
      const res = await axios.post(
        `${API_URL}/users/login`,
        { usernameOrEmail, password },
        { withCredentials: true }
      );

      const { user } = res.data;

      if (user.role === "admin") {
        router.replace("/");
        console.log("ผู้ดูแลระบบได้เข้าสู่ระบบแล้ว");
        Alert.alert("เข้าสู่ระบบสําเร็จ", "ยินดีต้อนรับเข้าสู่ระบบผู้ดูแลระบบ");
      } else {
        router.replace("/");
        console.log("ผู้ใช้งานได้เข้าสู่ระบบแล้ว");
        Alert.alert("เข้าสู่ระบบสําเร็จ", "ยินดีต้อนรับเข้าสู่ระบบผู้ใช้งาน");
      }
    } catch (err: any) {
      console.error("❌ Login error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        Alert.alert("เกิดข้อผิดพลาด", "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else {
        Alert.alert("เกิดข้อผิดพลาด", "มีปัญหากับการเชื่อมต่อ โปรดลองใหม่");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.header}>🔑 เข้าสู่ระบบ</Text>

        <Text style={styles.label}>Username หรือ Email</Text>
        <TextInput
          style={styles.input}
          placeholder="กรอก Username หรือ Email"
          value={usernameOrEmail}
          onChangeText={setUsernameOrEmail}
          autoCapitalize="none"
        />

        <Text style={styles.label}>รหัสผ่าน</Text>
        <View style={{ position: "relative" }}>
          <TextInput
            style={styles.input}
            placeholder="รหัสผ่าน"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showPasswordToggle}
          >
            <Text style={{ color: "#007bff", fontWeight: "bold" }}>
              {showPassword ? "🙈" : "👁️"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text>ยังไม่มีบัญชี?</Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.registerText}>สมัครสมาชิก</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity onPress={() => router.push("/(auth)/forgotPassword")}>
            <Text style={styles.forgotPassword}>ฉันลืมรหัสผ่าน</Text>
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
    backgroundColor: "#00FA9A",
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
  forgotPasswordContainer: {
    alignItems: "center",
    marginTop: 15,
  },
  forgotPassword: {
    color: "#007bff",
    fontWeight: "bold",
  },
  showPasswordToggle: {
    position: "absolute",
    right: 10,
    top: 15,
  },
});
