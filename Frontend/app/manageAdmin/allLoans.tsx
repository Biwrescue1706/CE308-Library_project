import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, } from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.API_URL;

type Loan = {
  id: string;
  title: string;
  username: string;
  memberId: string;
  phone: string;
  loanDate: string;
  dueDate: string;
  borrowedQuantity: number;
  returned: boolean;
  returnedQuantity: number;
  returnDate: string;
}

export default function AllLoansScreen() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/loans/all`, { withCredentials: true })
      .then((res) => setLoans(res.data))
      .catch((err) => console.error("❌", err))
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item, index }: { item: Loan; index: number }) => {
    const remaining = item.borrowedQuantity - item.returnedQuantity;

    return (
      <View style={styles.card}>
        <Text style={styles.titlebold}>รายการยืมที่ {index + 1}</Text>
        <Text><Text style={styles.bold}>📚 ชื่อหนังสือ : </Text>{item.title}</Text>
        <Text><Text style={styles.bold}>👤 ผู้ยืม : </Text>{item.username}</Text>
        <Text><Text style={styles.bold}>👤 รหัสสมาชิก : </Text>{item.memberId}</Text>
        <Text><Text style={styles.bold}>📞 เบอร์โทร : </Text>{item.phone}</Text>
        <Text><Text style={styles.bold}>📦 ยืมทั้งหมด : </Text>{item.borrowedQuantity} เล่ม</Text>
        <Text><Text style={styles.bold}>📦 คืนแล้ว : </Text>{item.returnedQuantity} เล่ม</Text>
        <Text><Text style={styles.bold}>📦 ค้างคืน : </Text>{remaining} เล่ม</Text>
        <Text><Text style={styles.bold}>📅 วันยืม : </Text>{item.loanDate}</Text>
        <Text><Text style={styles.bold}>📅 ครบกำหนด : </Text>{item.dueDate}</Text>
        <Text>
          <Text style={styles.bold}>✅ คืนสถานะ : </Text>
          {item.returned ? "✅ คืนครบแล้ว" : "❌ ยังไม่ครบ"}
        </Text>
        <Text><Text style={styles.bold}>📅 วันที่คืน : </Text> {item.returnDate} </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 รายการยืมทั้งหมด</Text>
      {loading ? (
        <ActivityIndicator size="large" color="tomato" />
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    marginBottom: 10,
    textAlign: "center",
    backgroundColor: "#fff",
    width: 340,
    height: 50,
    borderRadius: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    width: 340,
    marginBottom: 9.5,
    padding: 20,
    borderRadius: 10,
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
