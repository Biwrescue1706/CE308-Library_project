import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;
const screenWidth = Dimensions.get("window").width;
const cardWidth = screenWidth - 40; // full width - padding

export default function ActiveLoansScreen() {
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/loans/active`, { withCredentials: true })
      .then((res) => setLoans(res.data))
      .catch((err) => console.error("❌", err));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⏳ รายการที่ยังไม่คืน</Text>

      <FlatList
        data={loans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.titlebold}>รายการการยืมที่ {index + 1}</Text>
            <Text><Text style={styles.bold}>📚 ชื่อหนังสือ :  {item.title}</Text></Text> 
            <Text><Text style={styles.bold}>👤 Username : </Text> {item.username}</Text>
            <Text><Text style={styles.bold}>👤 ชื่อผู้ยืม : </Text> {item.fullNameTH}</Text>
            <Text><Text style={styles.bold}>📅 วันยืม : </Text> {item.loanDate}</Text>
            <Text><Text style={styles.bold}>📅 ครบกำหนด : </Text> {item.dueDate}</Text>
            <Text><Text style={styles.bold}>📦 จำนวน : </Text> {item.borrowedQuantity} เล่ม</Text>
            <Text><Text style={styles.bold}>📞 โทร : </Text> {item.phone}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            ไม่มีรายการที่ยังไม่คืน
          </Text>
        }
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C8E6B2",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    alignItems : "center",
    backgroundColor: "#fff",
    margin: 10,
    marginRight : 10,
    height: 50,
    width: 340,
    borderRadius: 10,
  },
  card: {
    backgroundColor: "#fff",
    width: cardWidth,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  bold: {
    fontWeight: "bold",
  },
  titlebold: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
});
