import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import UserCard from "../components/UserCard";
import PageNavigator from "../components/PageNavigator";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      const sorted = res.data.sort((a: any, b: any) =>
        a.username.localeCompare(b.username)
      );
      setUsers(sorted);
    } catch (err) {
      Alert.alert("โหลดข้อมูลล้มเหลว");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setNewRole(user.role);
    setNewPassword("");
    setShowPassword(false);
    setModalVisible(true);
  };

  const handleDelete = async (username: string) => {
    try {
      await axios.delete(`${API_URL}/users/delete/${username}`, {
        withCredentials: true,
      });
      setUsers((prev) => prev.filter((u) => u.username !== username));
    } catch (err) {
      Alert.alert("ลบผู้ใช้ล้มเหลว");
    }
  };

  const handleSave = async () => {
    try {
      if (newRole !== "user" && newRole !== "admin") {
        Alert.alert("Role ต้องเป็น user หรือ admin");
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
      Alert.alert("อัปเดตสำเร็จ");
    } catch (err) {
      Alert.alert("เกิดข้อผิดพลาด", "อัปเดตไม่สำเร็จ");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👥 จัดการสมาชิก</Text>

      {loading ? (
        <ActivityIndicator size="large" color="tomato" />
      ) : (
        <>
          <FlatList
            data={paginatedUsers}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 10 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchUsers} />
            }
            contentContainerStyle={styles.cardList}
            renderItem={({ item, index }) => (
              <UserCard
                index={(currentPage - 1) * itemsPerPage + index}
                username={item.username}
                role={item.role}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDelete(item.username)}
              />
            )}
          />

          <PageNavigator
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            onNext={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          />

        </>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>แก้ไขผู้ใช้: {editingUser?.username}</Text>

            <Text style={styles.label}>บทบาท (Role)</Text>
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
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  cardList: {
    paddingBottom: 20,
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
    textAlign: "center",
    marginBottom: 15,
  },
  label: {
    marginTop: 10,
    fontSize: 14,
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
    marginTop: 5,
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
    marginTop: 10,
  },
  roleOption: {
    padding: 10,
    borderWidth: 1,
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
