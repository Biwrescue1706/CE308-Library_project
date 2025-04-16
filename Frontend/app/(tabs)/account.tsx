import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  ScrollView,
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
        console.log("✅ /users/me response:", response.data);
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

  const handleLogout = () => {
    axios
      .post(`${API_URL}/users/logout`, {}, { withCredentials: true })
      .then(() => {
        console.log("✅ Logout successful");
        setUsers(null);
        router.replace("/");
      })
      .catch((error) => console.error("❌ Error logging out:", error));
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
        setRefreshing(true);
        fetchUser();
      }} />}
    >
      <Text style={styles.header}>👤 บัญชีของฉัน</Text>

      {loading ? (
        <ActivityIndicator size="large" color="tomato" />
      ) : users ? (
        <>
          <Text>📧 อีเมล: {users.email}</Text>
          <Text>🆔 รหัสสมาชิก: {users.memberId}</Text>
          <Text>👤 ชื่อใช้งาน : {users.username}</Text>
          <Text>👤 ชื่อ ภาษาไทย: {users.titleTH} {users.firstNameTH} {users.lastNameTH}</Text>
          <Text>👤 ชื่อ ภาษาอังกฤษ: {users.titleEN} {users.firstNameEN} {users.lastNameEN}</Text>
          <Text>📞 เบอร์โทร: {users.phone}</Text>
          <Text>
            📅 วันสมัครสมาชิก:{" "}
            {new Date(users.registrationDate || users.createdAt).toLocaleDateString()}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/account/inforpersonal")}
          >
            <Text style={styles.buttonText}>ข้อมูลส่วนตัว</Text>
          </TouchableOpacity>

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
        <Text>⛔ ไม่พบข้อมูลผู้ใช้</Text>
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
