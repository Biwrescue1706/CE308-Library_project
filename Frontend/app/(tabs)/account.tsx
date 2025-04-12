import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, Button, ActivityIndicator, StyleSheet 
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function AccountScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 📌 ดึงข้อมูลผู้ใช้จาก API
  useEffect(() => {
    axios
      .get(`${API_URL}/user/me`)
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching user data:", error);
        setLoading(false);
      });
  }, []);

  // 📌 ออกจากระบบ
  const handleLogout = () => {
    axios.post(`${API_URL}/auth/logout`)
      .then(() => {
        console.log("✅ Logout successful");
        // 📌 อาจใช้ navigation.replace("/login") ถ้าต้องการไปหน้า Login
      })
      .catch((error) => console.error("❌ Error logging out:", error));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👤 บัญชีของฉัน</Text>

      {loading ? (
        <ActivityIndicator size="large" color="tomato" />
      ) : (
        <>
          <Text>📧 อีเมล: {user?.email}</Text>
          <Text>🆔 รหัสสมาชิก: {user?.memberId}</Text>
          <Text>👤 ชื่อ: {user?.FNameTH} {user?.LNameTH}</Text>
          <Text>📞 เบอร์โทร: {user?.phone}</Text>
          <Text>📅 วันสมัครสมาชิก: {new Date(user?.joinDate).toLocaleDateString()}</Text>

          {/* ปุ่มไปยังหน้าอื่นๆ */}
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Inforpersonal")}>
            <Text style={styles.buttonText}>ข้อมูลส่วนตัว</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Contact")}>
            <Text style={styles.buttonText}>ช่องทางติดต่อ</Text>
          </TouchableOpacity>

          {/* ปุ่มออกจากระบบ */}
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.buttonText}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// 🎨 **Styles (CSS)**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
    width: 250,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
  },
});
