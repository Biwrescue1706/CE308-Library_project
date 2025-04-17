import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function ProfileScreen() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUser = () => {
        axios
            .get(`${API_URL}/users/me`, { withCredentials: true })
            .then((res) => {
                setUser(res.data.user);
                setLoading(false);
                setRefreshing(false);
            })
            .catch((err) => {
                console.error("❌ Error fetching profile:", err);
                setLoading(false);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const formatThaiDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = date.toLocaleString("th-TH", { month: "long" });
        const year = date.getFullYear() + 543;
        return `${day} ${month} ${year}`;
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="tomato" />
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => {
                    setRefreshing(true);
                    fetchUser();
                }} />
            }
        >
            <Text style={styles.header}>📄 โปรไฟล์ของฉัน</Text>

            <View style={styles.card}>
                <Text style={styles.label}>ชื่อผู้ใช้งาน : </Text>
                <Text style={styles.value}>{user?.username}</Text>

                <Text style={styles.label}>ชื่อเต็ม (TH) :</Text>
                <Text style={styles.value}>{user?.titleTH} {user?.firstNameTH} {user?.lastNameTH}</Text>

                <Text style={styles.label}>ชื่อเต็ม (EN) :</Text>
                <Text style={styles.value}>{user?.titleEN} {user?.firstNameEN} {user?.lastNameEN}</Text>

                <Text style={styles.label}>อีเมล :</Text>
                <Text style={styles.value}>{user?.email}</Text>

                <Text style={styles.label}>เบอร์โทร :</Text>
                <Text style={styles.value}>{user?.phone}</Text>

                <Text style={styles.label}>วันเกิด :</Text>
                <Text style={styles.value}>{formatThaiDate(user?.birthDate)}</Text>

                <Text style={styles.label}>รหัสสมาชิก :</Text>
                <Text style={styles.value}>{user?.memberId}</Text>

                <Text style={styles.label}>ที่อยู่ :</Text>
                <Text style={styles.value}>
                    บ้านเลขที่ : {user?.houseNumber} หมู่ที่ : {user?.villageNo} ซอย : {user?.alley} ถนน  : {user?.street} ตำบล/แขวง : {user?.subDistrict} อำเภอ/เขต : {user?.district} จังหวัด : {user?.province} รหัสไปรษณีย์ : {user?.postalCode}
                </Text>

                <Text style={styles.label}>วันสมัครสมัครสมาชิก :</Text>
                <Text style={styles.value}>{formatThaiDate(user?.registrationDate)}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#C8E6B2",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#C8E6B2",
    },
    header: {
        fontSize: 24,
        backgroundColor: "#fff",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        padding: 10,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
    },
    value: {
        fontSize: 16,
        marginTop: 2,
    },
});
