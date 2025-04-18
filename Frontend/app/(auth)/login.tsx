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
axios.defaults.withCredentials = true;

export default function LoginScreen() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!usernameOrEmail) {
      Alert.alert("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }
    if (!password) {
      Alert.alert("กรุณากรอกรหัสผ่านให้ถูกต้อง");
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/users/login`, {
        usernameOrEmail,
        password
      });

      const { user } = res.data;
      console.log("เข้าสู่ระบบแล้ว:", user);

      if (user.role === "admin") {
        router.replace("/(tabs)/account");
      } else {
        router.replace("/");
      }
    } catch (err: any) {
      console.error(" Login error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.header}>🔑 เข้าสู่ระบบ</Text>

        <Text style={styles.label}>อีเมล</Text>
        <TextInput
          style={styles.input}
          placeholder="email"
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

        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity
            onPress={() =>
              router.push("/(auth)/forgotPassword")}
            style={{ marginTop: 10 }}>
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
