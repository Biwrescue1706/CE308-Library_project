import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function ChangePasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showpassword, setShowPassword] = useState(false);

   const router = useRouter();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("ผิดพลาด", "รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/users/change-password`,
        { password: newPassword },
        { withCredentials: true }
      );
      Alert.alert("สำเร็จ", "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
      setNewPassword("");
      setConfirmPassword("");
      router.replace("/(auth)/login");
    } catch (err) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเปลี่ยนรหัสผ่านได้");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>เปลี่ยนรหัสผ่านใหม่</Text>

        <TextInput
          style={styles.input}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="กรอกรหัสผ่านใหม่"
        />

        <TextInput
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="ยืนยันรหัสผ่านใหม่"
        />

        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>ยืนยันเปลี่ยนรหัสผ่าน</Text>
        </TouchableOpacity>
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
  label: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#0de136",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
