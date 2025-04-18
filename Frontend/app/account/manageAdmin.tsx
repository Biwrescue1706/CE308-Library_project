import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function ManageAdminScreen() {
    const router = useRouter();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>🛠️ ระบบจัดการของแอดมิน</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/manageAdmin/manageusers")}
            >
                <Text style={styles.buttonText}>👥 จัดการสมาชิก</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/manageAdmin/addBooks")}
            >
                <Text style={styles.buttonText}>📚 จัดการหนังสือ</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/manageAdmin/allLoans")}
            >
                <Text style={styles.buttonText}>ดูรายการการยืมทั้งหมด</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/manageAdmin/activeLoans")}
            >
                <Text style={styles.buttonText}>ดูรายการที่ยังไม่คืน</Text>
            </TouchableOpacity>     

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/manageAdmin/overdueLoans")}
            >
                <Text style={styles.buttonText}>ดูรายการที่ค้างคืน (เกินกำหนด)</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: "center",
        padding: 20,
        backgroundColor: "#C8E6B2",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginVertical: 20,
        marginTop: 20,
        backgroundColor: "#fff",
        width: 320,
        height: 50,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
    },
    button: {
        backgroundColor: "#007bff",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginVertical: 10,
        width: "100%",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
});
