// 📁 components/LoanCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  loan: {
    title: string;
    username: string;
    memberId: string;
    phone: string;
    loanDate: string;
    dueDate: string;
    borrowedQuantity: number;
    returnedQuantity: number;
    returned: boolean;
    returnDate?: string;
  };
  index?: number;
};

export default function LoanCard({ loan, index }: Props) {
  const remaining = loan.borrowedQuantity - loan.returnedQuantity;

  const getReturnStatus = () => {
    if (!loan.returned) return "⏳ รอการคืนหนังสือ";

    if (!loan.returnDate) return "✅ คืนหนังสือครบแล้ว";

    const due = new Date(loan.dueDate);
    const ret = new Date(loan.returnDate);

    return ret <= due
      ? "✅ คืนหนังสือครบแล้ว"
      : "✅ คืนหนังสือครบแล้วแต่เกินวันครบกำหนด";
  };

  return (
    <View style={styles.card}>
      {index !== undefined && (
        <Text style={styles.titlebold}>รายการยืมที่ {index + 1}</Text>
      )}
      <Text><Text style={styles.bold}>📚 ชื่อหนังสือ : </Text>{loan.title}</Text>
      <Text><Text style={styles.bold}>👤 ผู้ยืม : </Text>{loan.username}</Text>
      <Text><Text style={styles.bold}>👤 รหัสสมาชิก : </Text>{loan.memberId}</Text>
      <Text><Text style={styles.bold}>📞 เบอร์โทร : </Text>{loan.phone}</Text>
      <Text><Text style={styles.bold}>📦 ยืมทั้งหมด : </Text>{loan.borrowedQuantity} เล่ม</Text>
      <Text><Text style={styles.bold}>📦 คืนแล้ว : </Text>{loan.returnedQuantity} เล่ม</Text>
      <Text><Text style={styles.bold}>📦 ค้างคืน : </Text>{remaining} เล่ม</Text>
      <Text><Text style={styles.bold}>📅 วันยืม : </Text>{loan.loanDate}</Text>
      <Text><Text style={styles.bold}>📅 ครบกำหนด : </Text>{loan.dueDate}</Text>
      <Text>
        <Text style={styles.bold}>✅ คืนสถานะ : </Text>
        {getReturnStatus()}
      </Text>
      <Text><Text style={styles.bold}>📅 วันที่คืน : </Text> {loan.returnDate || "-"} </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginBottom: 10,
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
