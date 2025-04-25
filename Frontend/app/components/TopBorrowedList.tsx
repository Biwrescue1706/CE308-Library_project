import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TopBorrowedList({ data }: { data: { title: string; count: number }[] }) {
  return (
    <View style={styles.cardContainer}>
      {data.map((book, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitles}>รายการที่ {index + 1}</Text>
          <Text style={styles.cardTitle}>📖 : {book.title}</Text>
          <Text style={styles.cardText}>
            <Text style={styles.bold}>จำนวนยืม : </Text> {book.count} เล่ม
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  cardText: {
    fontSize: 16,
    color: "#000",
  },
  bold: {
    fontWeight: "bold",
  },
  cardTitles: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000",
  },
});
