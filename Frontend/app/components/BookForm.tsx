import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function BookForm({ form, isEditMode, onChange, onSubmit, onCancel }: any) {
  const fields = ["title", "author", "category", "totalCopies", ...(isEditMode ? ["availableCopies"] : [])];

  const getLabel = (key: string) => {
    switch (key) {
      case "title": return "ชื่อหนังสือ";
      case "author": return "ผู้แต่ง";
      case "category": return "หมวดหมู่";
      case "totalCopies": return "จำนวนทั้งหมด";
      case "availableCopies": return "จำนวนที่สามารถยืมได้";
      default: return key;
    }
  };

  return (
    <View>
      {fields.map((key) => (
        <View key={key} style={styles.inputGroup}>
          <Text>{getLabel(key)}</Text>
          <TextInput
            style={styles.input}
            value={form[key]}
            onChangeText={(text) => onChange(key, text)}
            keyboardType={["totalCopies", "availableCopies"].includes(key) ? "numeric" : "default"}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.saveBtn} onPress={onSubmit}>
        <Text style={styles.btnText}>💾 บันทึก</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.btnText}>❌ ยกเลิก</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: "#DC143C",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelBtn: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
