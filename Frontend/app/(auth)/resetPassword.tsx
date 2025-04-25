import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import Constants from "expo-constants";
import PasswordInput from "./../components/PasswordInput";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function ResetPasswordScreen() {
  const { userId } = useLocalSearchParams(); // รับ userId จาก query param
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      await axios.post(`${API_URL}/users/reset-password`, {
        userId,
        newPassword,
      });

      Alert.alert("สำเร็จ", "คุณได้ตั้งรหัสผ่านใหม่แล้ว");
      router.replace("/(auth)/login");
    } catch (err: any) {
      console.error("❌ Reset password error:", err.response?.data || err.message);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถรีเซ็ตรหัสผ่านได้");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.header}>🔐 ตั้งรหัสผ่านใหม่</Text>

        <PasswordInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="รหัสผ่านใหม่"
          showPassword={showNewPassword}
          toggleShowPassword={() => setShowNewPassword(!showNewPassword)}
        />

        <PasswordInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="ยืนยันรหัสผ่านใหม่"
          showPassword={showConfirmPassword}
          toggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>ยืนยัน</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00FA9A",
    justifyContent: "center",
    padding: 20,
  },
  box: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
