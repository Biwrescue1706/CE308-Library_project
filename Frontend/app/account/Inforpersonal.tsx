import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Inforpersonal() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>📋 ข้อมูลส่วนตัว</Text>
      <Text style={styles.text}>• ชื่อ: ภูวณัฐ พาหะละ</Text>
      <Text style={styles.text}>• รหัสสมาชิก: 66110045</Text>
      <Text style={styles.text}>• วันเกิด: 1 มกราคม 2545</Text>
      <Text style={styles.text}>• เพศ: ชาย</Text>
      <Text style={styles.text}>• ที่อยู่: 123/45 ต.ในเมือง อ.เมือง จ.ฉะเชิงเทรา</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});
