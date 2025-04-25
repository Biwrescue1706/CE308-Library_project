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
  FlatList,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
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
      .catch(() => router.replace("/"));
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
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้");
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
        prev.map((u) => (u.username === editingUser.username ? { ...u, ...data } : u))
      );

      setModalVisible(false);
      Alert.alert("✅ สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว");
    } catch {
      Alert.alert("❌ เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตข้อมูลได้");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👥 จัดการสมาชิก</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchUsers} />
        }
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userTitle}>👤 Username: </Text><Text style={styles.usernamebold}> {item.username}</Text>
            <Text style={styles.userRole}>Role : </Text><Text style={styles.roleBold}>{item.role}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                <Text style={styles.buttonTextWhite}>✏️ แก้ไข</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.username)}>
                <Text style={styles.buttonTextWhite}>🗑️ ลบ</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal แก้ไขผู้ใช้ */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>แก้ไขผู้ใช้: {editingUser?.username}</Text>

            <Text style={styles.label}>Role</Text>
            <View style={styles.pickerContainer}>
              {["user", "admin"].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleOption, newRole === role && styles.selectedRole]}
                  onPress={() => setNewRole(role)}
                >
                  <Text>{role === "user" ? "👤 user" : "🛡️ admin"}</Text>
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
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderRadius: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    width: "48%",
    elevation: 2,
  },
  userTitle: {
    fontSize: 18.5,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardActions: {
    flexDirection: "column", 
    alignItems: "center",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#0d6efd",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 10, 
  },
  buttonTextWhite: {
    color: "#fff",
    fontWeight: "bold",
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
    width: "48%",
    alignItems: "center",
  },
  selectedRole: {
    backgroundColor: "#b3f0c6",
    borderColor: "#28a745",
  },
  usernamebold : {
    fontSize :17.5,
    fontWeight: "bold",
    textAlign : "center",
    marginBottom: 10,
  },
  userRole :{
    fontSize: 18.5,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign : "center",
  },
  roleBold : {
    fontSize :17.5,
    fontWeight: "bold",
    textAlign : "center",
  },
});
