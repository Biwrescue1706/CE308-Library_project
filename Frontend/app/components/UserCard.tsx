import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  index: number;
  username: string;
  role: string;
  onEdit: () => void;
  onDelete: () => void;
}

const UserCard: React.FC<Props> = ({ index, username, role, onEdit, onDelete }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.index}>#{index + 1}</Text>
      <Text style={styles.username}>👤 Username : </Text><Text style={styles.usernamebold}>{username}</Text>
      <Text style={styles.role}>🛡️ Role : </Text> <Text style={styles.rolebold}> {role}</Text>

      <View style={styles.buttonColumn}>
        <TouchableOpacity style={[styles.button, styles.editButton]} onPress={onEdit}>
          <Text style={styles.buttonText}>✏️ แก้ไข</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={onDelete}>
          <Text style={styles.buttonText}>🗑️ ลบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "48%", // พอดี 2 คอลัมน์
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
  },
  index: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",

    textAlign: "center",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  role: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  buttonColumn: {
    flexDirection: "column", // เปลี่ยนจาก row เป็น column
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: "#007bff",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  usernamebold :{
    fontSize: 16.5,
    fontWeight: "bold",
    marginBottom: 10,
  },
  rolebold :{
    fontSize: 16.5,
    fontWeight: "bold",
    marginBottom: 10,
  }
});

export default UserCard;
