import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Dimensions } from "react-native";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;
const screenWidth = Dimensions.get("window").width;
const cardWidth = (screenWidth - 60) / 2;

export default function AllLoansScreen() {
  const [loans, setLoans] = useState<any[]>([]);
  const [topBooks, setTopBooks] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/loans/all`, { withCredentials: true })
      .then((res) => {
        setLoans(res.data);
        // 🔢 นับจำนวนการยืมแต่ละเล่ม
        const countMap: Record<string, number> = {};
        res.data.forEach((loan: any) => {
          countMap[loan.title] = (countMap[loan.title] || 0) + loan.quantity;
        });

        const sorted = Object.entries(countMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([title, count]) => ({ title, count }));

        setTopBooks(sorted);
      })
      .catch((err) => console.error("❌", err));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📊 หนังสือที่ถูกยืมบ่อยที่สุด</Text>
      {topBooks.map((book, index) => (
        <View key={index} style={styles.statBox}>
          <Text style={styles.bold}>{index + 1}. {book.title}</Text>
          <Text>จำนวนยืมทั้งหมด: {book.count} เล่ม</Text>
        </View>
      ))}

      <Text style={styles.header}>📚 รายการยืมทั้งหมด</Text>
      <FlatList
        data={loans}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.titlebold}>#{index + 1} - {item.title}</Text>
            <Text><Text style={styles.bold}>👤 ผู้ยืม:</Text> {item.username}</Text>
            <Text><Text style={styles.bold}>📅 ยืม:</Text> {new Date(item.loanDate).toLocaleDateString()}</Text>
            <Text><Text style={styles.bold}>📅 ครบกำหนด:</Text> {new Date(item.dueDate).toLocaleDateString()}</Text>
            <Text><Text style={styles.bold}>📦 จำนวน:</Text> {item.quantity} เล่ม</Text>
            <Text>
              <Text style={styles.bold}>✅ สถานะ:</Text>{" "}
              {item.returned ? "✅ คืนแล้ว" : "❌ ยังไม่ได้คืน"}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>ไม่มีรายการยืม</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C8E6B2",
    paddingTop: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    width: cardWidth,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  statBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    elevation: 2,
  },
  bold: {
    fontWeight: "bold",
  },
  titlebold: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
});
