// 📁 app/manageAdmin/topBorrowed.tsx

import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import TopBorrowedChart from "../components/TopBorrowedChart";
import TopBorrowedList from "../components/TopBorrowedList";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function TopBorrowedBooksScreen() {
  const [topBooks, setTopBooks] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/loans/all`, { withCredentials: true })
      .then((res) => {
        const countMap: Record<string, number> = {};
        res.data.forEach((loan: any) => {
          countMap[loan.title] = (countMap[loan.title] || 0) + loan.borrowedQuantity;
        });

        const sorted = Object.entries(countMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([title, count]) => ({ title, count }));

        const all = Object.entries(countMap)
          .map(([title, count]) => ({ title, count }))
          .sort((a, b) => b.count - a.count);

        setTopBooks(sorted);
        setAllBooks(all);
      })
      .catch(() => {});
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📚 หนังสือที่ถูกยืมบ่อยมากที่สุด</Text>
      <TopBorrowedChart data={topBooks} />
      <Text style={styles.header}>📚 หนังสือที่ถูกยืมบ่อยทั้งหมด</Text>
      <TopBorrowedList data={allBooks} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#00FA9A",
  },
  header: {
    fontSize: 21.5,
    fontWeight: "bold",
    marginVertical: 5,
    textAlign: "center",
    backgroundColor: "#fff",
    paddingVertical: 5,
    borderRadius: 10,
    width: 320,
  },
});
