import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { BarChart } from "react-native-chart-kit";

const API_URL = Constants.expoConfig?.extra?.API_URL;
const screenWidth = Dimensions.get("window").width;

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
          .slice(0, 10) // Limit to top 10 books
          .map(([title, count]) => ({ title, count }));

        const all = Object.entries(countMap)
          .map(([title, count]) => ({ title, count }))
          .sort((a, b) => a.count - b.count);

        setTopBooks(sorted);
        setAllBooks(all);
      })
      .catch();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container} horizontal={false}>
      <Text style={styles.header}>📚 หนังสือที่ถูกยืมบ่อยมากที่สุด</Text>

      {topBooks.length > 0 && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={{
                labels: topBooks.map((b) =>
                  b.title.length > 8 ? b.title.slice(0, 8) + "…" : b.title
                ),
                datasets: [{ data: topBooks.map((b) => b.count) }],
              }}
              width={screenWidth * 2}
              height={300}
              fromZero
              yAxisLabel=""
              yAxisSuffix=" เล่ม"
              chartConfig={chartStyles.config}
              verticalLabelRotation={30}
              style={chartStyles.graphStyle}
            />
          </ScrollView>
        </>
      )}

      <Text style={styles.header}>📚 หนังสือที่ถูกยืมบ่อยทั้งหมด</Text>
      <View style={styles.cardContainer}>
        {allBooks.map((book, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitles}>รายการที่ {index + 1}</Text>
            <Text style={styles.cardTitle}>📖 : {book.title}</Text>
            <Text style={styles.cardText}>
              <Text style={styles.bold}>จำนวนยืม : </Text> {book.count} เล่ม
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.bold}>ค้างคืน : </Text> {book.count} เล่ม
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.bold}>คืนแล้ว : </Text> {book.count} เล่ม
            </Text>
            <Text style={styles.cardText}>
              <Text style={styles.bold}>ค้างคืน : </Text> {book.count} เล่ม
            </Text>
          </View>
        ))}
      </View>
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
    paddingHorizontal: 0,
    borderRadius: 10,
    width: 320,
  },
  statBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
  },
  statItem: {
    fontSize: 16,
    marginBottom: 6,
  },
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
  }
});

const chartStyles = {
  config: {
    backgroundColor: "#fff",  // Set the default background color as white
    backgroundGradientFrom: "#fff",  // Set the starting gradient color to white
    backgroundGradientTo: "#fff",  // Set the ending gradient color to white
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Set chart data bars color to red
    labelColor: () => "#000000",  // Color of the labels (black)
  },
  graphStyle: {
    marginBottom: 10,
  },
};
