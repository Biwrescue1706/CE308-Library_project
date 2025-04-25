import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, } from "react-native";

interface Props {
    title: string;
    author: string;
    quantity: number;
    availableCopies: number;
    onIncrease: () => void;
    onDecrease: () => void;
    onRemove: () => void;
}

const CartItemCard: React.FC<Props> = ({
    title,
    author,
    quantity,
    availableCopies,
    onIncrease,
    onDecrease,
    onRemove,
}) => {
    return (
        <View style={styles.itemBox}>
            <Text style={styles.title}>{title}</Text>
            <Text>ผู้แต่ง: {author}</Text>

            <View style={styles.quantityRow}>
                <TouchableOpacity onPress={onDecrease} style={styles.qtyButton}>
                    <Text style={styles.qtyText}>➖</Text>
                </TouchableOpacity>

                <Text style={styles.qtyDisplay}>{quantity}</Text>

                <TouchableOpacity
                    onPress={() => {
                        if (quantity < availableCopies) {
                            onIncrease();
                        } else {
                            Alert.alert("❌ เกินจำนวนที่มี", `มีหนังสือได้สูงสุด ${availableCopies} เล่ม`);
                        }
                    }}
                    style={styles.qtyButton}
                >
                    <Text style={styles.qtyText}>➕</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                <Text style={styles.buttonText}>ลบ</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    itemBox: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    title: {
        fontSize: 18,
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
        fontSize: 20,
        fontWeight: "bold",
        margin: 5,
    },
    qtyDisplay: {
        fontSize: 16,
        fontWeight: "bold",
        minWidth: 30,
        textAlign: "center",
    },
    removeButton: {
        marginTop: 10,
        backgroundColor: "#dc3545",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
});

export default CartItemCard;
