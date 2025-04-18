import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function AccountScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUser = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/users/me`, { withCredentials: true })
      .then((response) => {
        setUsers(response.data?.user || response.data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching user data:", error);
        setUsers(null);
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!loading && users === null) {
      Alert.alert("หมดเวลาใช้งาน", "กรุณาเข้าสู่ระบบใหม่");
      router.replace("/(auth)/login");
    }
  }, [loading, users]);

  const handleLogout = () => {
    axios
      .post(`${API_URL}/users/logout`, {}, { withCredentials: true })
      .then(() => {
        setUsers(null);
        router.replace("/");
      })
      .catch((error) => console.error("❌ Error logging out:", error));
  };

  // 📌 แปลงวันที่เป็นภาษาไทย + พ.ศ.
  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("th-TH", { month: "long" });
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchUser();
          }}
        />
      }
    >

      {loading ? (
        <ActivityIndicator size="large" color="tomato" />
      ) : users ? (
        <>
          <Text style={styles.header}>👤 บัญชีของฉัน</Text>
          <View style={styles.userInfoBox}>
            <Text style={styles.infoText}>📧 อีเมล: {users.email}</Text>
            <Text style={styles.infoText}>🆔 รหัสสมาชิก: {users.memberId}</Text>
            <Text style={styles.infoText}>👤 ชื่อใช้งาน : {users.username}</Text>
            <Text style={styles.infoText}>
              👤 ชื่อ ภาษาไทย: {users.titleTH} {users.firstNameTH} {users.lastNameTH}
            </Text>
            <Text style={styles.infoText}>📞 เบอร์โทร: {users.phone}</Text>
            <Text style={styles.infoText}>
              📅 วันสมัครสมาชิก: {formatThaiDate(users.registrationDate || users.createdAt)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/account/profile")} // ← ปรับตาม path ที่คุณใช้จริง
          >
            <Text style={styles.buttonText}>📄 โปรไฟล์ของฉัน</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/account/inforpersonal")}
          >
            <Text style={styles.buttonText}>✏️ แก้ไขข้อมูลส่วนตัว</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/account/changePassword")}
          >
            <Text style={styles.buttonText}>🔒 เปลี่ยนรหัสผ่าน</Text>
          </TouchableOpacity>

          {users?.role === "admin" && (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/account/addBooks")}
              >
                <Text style={styles.buttonText}>📚 จัดการหนังสือ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/account/manageusers")}
              >
                <Text style={styles.buttonText}>👥 จัดการสมาชิก</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/account/contact")}
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
      ) : (
        <View style={styles.container}>
          <Text style={styles.header}>👤 บัญชีของฉัน</Text>
          <Text>⛔ ไม่พบข้อมูลผู้ใช้</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#C8E6B2",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    shadowColor: "#000",
    width: "100%",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
    width: 300,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
  },
  userInfoBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
  loginButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
});
