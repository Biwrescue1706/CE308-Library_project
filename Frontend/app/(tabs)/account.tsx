import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function AccountScreen() {
  const router = useRouter();
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
    axios
      .post(`${API_URL}/auth/logout`)
      .then(() => {
        console.log("✅ Logout successful");
        router.replace("./login"); // เปลี่ยนเส้นทางไปหน้า login
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
          <Text>
            📅 วันสมัครสมาชิก:{" "}
            {new Date(user?.joinDate).toLocaleDateString()}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("../account/inforpersonal")}
          >
            <Text style={styles.buttonText}>ข้อมูลส่วนตัว</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("../account/contact")}
          >
            <Text style={styles.buttonText}>ช่องทางติดต่อ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

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
