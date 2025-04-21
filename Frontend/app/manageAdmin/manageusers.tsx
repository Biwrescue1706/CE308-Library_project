import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function ManageUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newRole, setNewRole] = useState("user");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fetchUser = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/users/me`, { withCredentials: true })
      .then((response) => {
        if (response.data.user.role !== "admin") {
          router.replace("/");
        } else {
          fetchUsers();
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching user data:", error);
        router.replace("/");
      });
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${API_URL}/users/admin/all-users`, {
        withCredentials: true,
      });
      const sortedUsers = res.data.sort((a: any, b: any) => a.username.localeCompare(b.username));
      setUsers(sortedUsers);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleDelete = async (username: string) => {
    try {
      await axios.delete(`${API_URL}/users/delete/${username}`, {
        withCredentials: true,
      });
      setUsers((prev) => prev.filter((u) => u.username !== username));
    } catch (err) {
      console.error("❌ Error deleting user:", err);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถลบผู้ใช้งานได้");
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setNewRole(user.role);
    setNewPassword("");
    setShowPassword(false);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      if (newRole !== "user" && newRole !== "admin") {
        Alert.alert("⚠️ Role ต้องเป็น 'user' หรือ 'admin'");
        return;
      }

      const data: any = {};
      if (newRole) data.role = newRole;
      if (newPassword) data.password = newPassword;

      await axios.put(`${API_URL}/users/update/${editingUser.username}`, data, {
        withCredentials: true,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.username === editingUser.username ? { ...u, ...data } : u
        )
      );

      setModalVisible(false);
      Alert.alert("✅ สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว");
    } catch (err) {
      Alert.alert("❌ เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตข้อมูลได้");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👥 จัดการสมาชิก</Text>

      {loading ? (
        <ActivityIndicator size="large" color="tomato" />
      ) : (
        <ScrollView horizontal>
          <View style={{ minWidth: 500 }}>
            <View style={styles.tableHeader}>
              <Text style={styles.cellHeaderSmall}>ลำดับ</Text>
              <Text style={styles.cellHeaderLarge}>ชื่อผู้ใช้งาน</Text>
              <Text style={styles.cellHeader}>✏️ แก้ไขสมาชิก</Text>
              <Text style={styles.cellHeader}>🗑️ ลบสมาชิก</Text>
            </View>

            <ScrollView
              style={{ maxHeight: 500 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={fetchUsers} />
              }
            >
              {users.map((item, index) => (
                <View
                  key={item.id}
                  style={styles.tableRow}
                >
                  <Text style={styles.cellSmall}>{index + 1}</Text>
                  <Text style={styles.cellLarge}>{item.username}</Text>
                  <View style={styles.cellButtonWrapper}>
                    <TouchableOpacity style={styles.buttonSmall} onPress={() => handleEdit(item)}>
                      <Text style={styles.buttonTextWhite}>✏️ แก้ไขสมาชิก</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.cellButtonWrapper}>
                    <TouchableOpacity
                      style={[styles.buttonSmall, styles.deleteButton]}
                      onPress={() => handleDelete(item.username)}
                    >
                      <Text style={styles.buttonTextWhite}>🗑️ ลบ</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>แก้ไขผู้ใช้: {editingUser?.username}</Text>

            <Text style={styles.label}>Role</Text>
            <View style={styles.pickerContainer}>
              {['user', 'admin'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleOption, newRole === role && styles.selectedRole]}
                  onPress={() => setNewRole(role)}
                >
                  <Text>{role === 'user' ? '👤 user' : '🛡️ admin'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>รหัสผ่านใหม่ (ไม่บังคับ)</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="กรอกรหัสผ่านใหม่"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.toggleText}>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>💾 บันทึก</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>❌ ยกเลิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00FA9A",
    padding: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 50,
    backgroundColor: "#fff",
    margin: 10,
    height: 50,
    width: 300,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",

  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    borderBottomWidth: 1,
  },
  cellHeaderSmall: {
    width: 60,
    fontWeight: "bold",
    textAlign: "center",
    padding: 8,
    borderRightWidth: 1,
    borderColor: "#000",
  },
  cellHeaderLarge: {
    width: 200,
    fontWeight: "bold",
    textAlign: "center",
    padding: 8,
    borderRightWidth: 1,
    borderColor: "#000",
  },
  cellHeader: {
    width: 200,
    fontWeight: "bold",
    textAlign: "center",
    padding: 8,
    borderRightWidth: 1,
    borderColor: "#000",
  },
  cellSmall: {
    width: 60,
    textAlign: "center",
    padding: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  cellLarge: {
    width: 200,
    textAlign: "center",
    padding: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  cellButtonWrapper: {
    width: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  buttonSmall: {
    backgroundColor: "#007bff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  buttonTextWhite: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  actionText: {
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleText: {
    marginLeft: 10,
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: "#28a745",
    padding: 15,
    marginTop: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelText: {
    textAlign: "center",
    color: "red",
    marginTop: 10,
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  roleOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    backgroundColor: "#fff",
    width: "40%",
    alignItems: "center",
  },
  selectedRole: {
    backgroundColor: "#b3f0c6",
    borderColor: "#28a745",
  },
});
