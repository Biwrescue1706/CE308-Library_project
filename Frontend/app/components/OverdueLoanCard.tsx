import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  loan: {
    username: string;
    fullNameTH: string;
    memberId: string;
    phone: string;
    bookTitle: string;
    loanDate: string;
    dueDate: string;
    borrowedQuantity: number;
    lateDays: number;
  };
  index: number;
}

const OverdueLoanCard: React.FC<Props> = ({ loan, index }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.titlebold}>รายการยืมที่ {index + 1}</Text>
      <Text><Text style={styles.bold}>👤 ผู้ยืม : </Text>{loan.username}</Text>
      <Text><Text style={styles.bold}>👤 ชื่อ : </Text>{loan.fullNameTH}</Text>
      <Text><Text style={styles.bold}>👤 รหัสสมาชิก : </Text>{loan.memberId}</Text>
      <Text><Text style={styles.bold}>📞 เบอร์โทรผู้ยืม : </Text>{loan.phone}</Text>
      <Text><Text style={styles.bold}>📕 หนังสือ : </Text>{loan.bookTitle}</Text>
      <Text><Text style={styles.bold}>📅 ยืม : </Text>{loan.loanDate}</Text>
      <Text><Text style={styles.bold}>📅 ครบกำหนด : </Text>{loan.dueDate}</Text>
      <Text><Text style={styles.bold}>📦 จำนวน : </Text>{loan.borrowedQuantity} <Text style={styles.bold}>เล่ม</Text></Text>
      <Text style={{ color: "red" }}>
        <Text style={styles.bold}>⏱️ เกินกำหนด : </Text>{loan.lateDays} <Text style={styles.bold}>วัน</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
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

export default OverdueLoanCard;
