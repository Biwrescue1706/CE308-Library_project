import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";

interface Props {
  item: any;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onChange: (val: number) => void;
  onReturn: () => void;
}

const LoanHistoryCard: React.FC<Props> = ({
  item,
  quantity,
  onDecrease,
  onIncrease,
  onChange,
  onReturn,
}) => {
  const remaining = item.borrowedQuantity - item.returnedQuantity;

  return (
    <View style={styles.historyContainer}>
      <Text style={styles.bookTitle}>📖 {item.title}</Text>
      <Text><Text style={styles.bold}>📦 ยืมทั้งหมด : </Text>{item.borrowedQuantity} เล่ม</Text>
      <Text><Text style={styles.bold}>📦 คืนแล้ว : </Text>{item.returnedQuantity} เล่ม</Text>
      <Text><Text style={styles.bold}>📦 ค้างคืน : </Text>{remaining} เล่ม</Text>
      <Text><Text style={styles.bold}>📅 วันที่ยืม : </Text>{item.loanDate}</Text>
      <Text><Text style={styles.bold}>⏳ ครบกำหนด : </Text>{item.dueDate}</Text>

      <Text>
        <Text style={styles.bold}>📅 วันที่คืน : </Text>
        {item.returned && item.returnDate
          ? item.returnDate
          : "⏳ ยังไม่ได้คืนหนังสือ"}
      </Text>

      <Text style={styles.bold}>
        สถานะการคืน :{" "}
        <Text style={{ color: item.returned ? "green" : "red" }}>
          {item.returned ? "✅ คืนหนังสือครบแล้ว" : "⏳ รอการคืนหนังสือ"}
        </Text>
      </Text>

      {!item.returned && (
        <>
          <View style={styles.quantityRow}>
            <TouchableOpacity style={styles.qtyButton} onPress={onDecrease}>
              <Text style={styles.qtyText}>➖</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.qtyInput}
              value={String(quantity)}
              onChangeText={(text) => onChange(Number(text) || 1)}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.qtyButton} onPress={onIncrease}>
              <Text style={styles.qtyText}>➕</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.returnButton} onPress={onReturn}>
            <Text style={styles.buttonText}>🔄 คืนหนังสือที่เลือก</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  historyContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
  },
  bookTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 5,
  },
  returnButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  bold: {
    fontWeight: "bold",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "center",
  },
  qtyButton: {
    backgroundColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  qtyText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  qtyInput: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    textAlign: "center",
    width: 60,
  },
});

export default LoanHistoryCard;
