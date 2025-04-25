import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
} from "react-native";

interface Props {
  title: string;
  author: string;
  category: string;
  availableCopies: number;
  quantity: number;
  setQuantity: (qty: number) => void;
  onAddToCart: () => void;
  onBorrow: () => void;
}

const BookInfoCard: React.FC<Props> = ({
  title,
  author,
  category,
  availableCopies,
  quantity,
  setQuantity,
  onAddToCart,
  onBorrow,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>📖 {title}</Text>
      <Text style={styles.detail}><Text style={styles.bold}>ผู้แต่ง :</Text> {author}</Text>
      <Text style={styles.detail}><Text style={styles.bold}>📚 หมวดหมู่ :</Text> {category}</Text>
      <Text style={styles.detail}><Text style={styles.bold}>จำนวนที่เหลือ :</Text> {availableCopies}</Text>

      <View style={styles.quantityRow}>
        <TouchableOpacity
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
          style={styles.quantityButton}
        >
          <Text style={styles.quantityText}>-</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={quantity.toString()}
          onChangeText={(text) => {
            const num = Number(text);
            if (!isNaN(num)) {
              if (num > availableCopies) {
                setQuantity(availableCopies);
              } else if (num < 1) {
                setQuantity(1);
              } else {
                setQuantity(num);
              }
            }
          }}
          keyboardType="numeric"
        />

        <TouchableOpacity
          onPress={() => {
            if (quantity < availableCopies) {
              setQuantity(quantity + 1);
            }
          }}
          style={styles.quantityButton}
        >
          <Text style={styles.quantityText}>+</Text>
        </TouchableOpacity>
      </View>

      {availableCopies > 0 ? (
        <View style={styles.buttonBox}>
          <Button title="🛒 เพิ่มเข้าตะกร้า" onPress={onAddToCart} />
          <View style={{ height: 10 }} />
          <Button title="📚 ยืมหนังสือ" onPress={onBorrow} />
        </View>
      ) : (
        <Text style={styles.outOfStock}>❌ หนังสือหมดแล้ว</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  bold: {
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginHorizontal: 10,
    minWidth: 60,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  quantityButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
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

export default BookInfoCard;
