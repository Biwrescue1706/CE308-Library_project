import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function BookCard({ book, index, onEdit, onDelete }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.index}>📌 ลำดับ : {index + 1}</Text>
      <Text><Text style={styles.label}>📖 ชื่อหนังสือ : </Text>{book.title}</Text>
      <Text><Text style={styles.label}>🖊 ผู้แต่ง : </Text>{book.author}</Text>
      <Text><Text style={styles.label}>📂 หมวดหมู่ : </Text>{book.category}</Text>
      <Text><Text style={styles.label}>✍️ ผู้สร้าง : </Text>{book.createdBy?.username || "-"}</Text>
      <Text><Text style={styles.label}>🛠 ผู้แก้ไข : </Text>{book.updatedBy?.username || "-"}</Text>

      <TouchableOpacity style={[styles.action, { backgroundColor: "#D2691E" }]} onPress={onEdit}>
        <Text style={styles.actionText}>✏️ แก้ไข</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.action, { backgroundColor: "#0000FF" }]} onPress={onDelete}>
        <Text style={styles.actionText}>🗑️ ลบ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  index: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
  },
  action: {
    marginTop: 5,
    paddingVertical: 6,
    borderRadius: 5,
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
