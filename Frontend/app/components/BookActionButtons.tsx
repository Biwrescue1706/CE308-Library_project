import React from "react";
import { View, Button, StyleSheet, Text } from "react-native";

interface Props {
  availableCopies: number;
  onAddToCart: () => void;
  onBorrow: () => void;
}

const BookActionButtons: React.FC<Props> = ({
  availableCopies,
  onAddToCart,
  onBorrow,
}) => {
  if (availableCopies <= 0) {
    return (
      <Text style={styles.outOfStock}>❌ หนังสือหมดแล้ว</Text>
    );
  }

  return (
    <View style={styles.buttonBox}>
      <Button title="🛒 เพิ่มเข้าตะกร้า" onPress={onAddToCart} />
      <View style={{ height: 10 }} />
      <Button title="📚 ยืมหนังสือ" onPress={onBorrow} />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outOfStock: {
    textAlign: "center",
    color: "red",
    fontSize: 16,
    marginTop: 15,
    fontWeight: "bold",
  },
});

export default BookActionButtons;
