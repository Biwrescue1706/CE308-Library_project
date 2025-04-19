import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import Constants from "expo-constants";
import { BarChart } from "react-native-chart-kit";


const API_URL = Constants.expoConfig?.extra?.API_URL;
const screenWidth = Dimensions.get("window").width;

export default function ManageAdminScreen() {
    const router = useRouter();
    const [topBooks, setTopBooks] = useState<any[]>([]);

    useEffect(() => {
        axios.get(`${API_URL}/loans/all`, { withCredentials: true })
            .then((res) => {
                const countMap: Record<string, number> = {};
                res.data.forEach((loan: any) => {
                    countMap[loan.title] = (countMap[loan.title] || 0) + loan.quantity;
                });

                const sorted = Object.entries(countMap)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([title, count]) => ({ title, count }));

                setTopBooks(sorted);
            })
            .catch(err => console.error("❌ ไม่สามารถโหลด top books ได้", err));
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>🛠️ ระบบจัดการของแอดมิน</Text>

            {topBooks.length > 0 && (
                <>
                    <Text style={styles.chartTitle}>📊 หนังสือที่ถูกยืมบ่อยที่สุด</Text>
                    <BarChart
                        data={{
                            labels: topBooks.map((b) => b.title.length > 8 ? b.title.slice(0, 8) + "…" : b.title),
                            datasets: [{ data: topBooks.map((b) => b.count) }],
                        }}
                        width={screenWidth - 40}
                        height={250}
                        fromZero
                        yAxisLabel=""         // ✅ เพิ่ม
                        yAxisSuffix=" ครั้ง"  // ✅ เพิ่ม (หรือจะใส่ "" ก็ได้ถ้าไม่อยากแสดงหน่วย)
                        chartConfig={{
                            backgroundColor: "#C8E6B2",
                            backgroundGradientFrom: "#C8E6B2",
                            backgroundGradientTo: "#C8E6B2",
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: () => "#333",
                        }}
                        verticalLabelRotation={30}
                        style={{ marginBottom: 20 }}
                    />
                </>
            )}

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
        textAlign: "center",
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
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
