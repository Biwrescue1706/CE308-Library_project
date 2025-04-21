// 📁 app/(auth)/forgotPassword.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!input.trim()) {
            Alert.alert("กรุณากรอกชื่อผู้ใช้หรืออีเมล");
            return;
        }

        try {
            setLoading(true);
            const res = await axios
                .post(`${API_URL}/users/forgot-password`, 
                    {usernameOrEmail: input,},
                    { withCredentials: true }
                );

            const { userId } = res.data;

            router.push({ pathname: "/(auth)/resetPassword", params: { userId } });
            console.error("พบบัญชีผู้ใช้หรืออีเมล");
            Alert.alert("พบบัญชีผู้ใช้หรืออีเมลถูกต้อง ","ไปยังหน้ารีเซ็ตรหัสผ่าน" );
        } catch (err: any) {
            console.error("ไม่พบบัญชีผู้ใช้หรืออีเมล");
            Alert.alert("ไม่พบผู้ใช้งาน", err.response?.data?.message || "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.header}>🔐 ลืมรหัสผ่าน</Text>

                <Text style={styles.label}> ใส่อีเมล หรือ Username</Text>
                <TextInput
                    style={styles.input}
                    placeholder="ระบุ email หรือ Username"
                    value={input}
                    onChangeText={setInput}
                    autoCapitalize="none"
                />

                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                    <Text style={styles.buttonText}>
                        {loading ? "กำลังตรวจสอบ..." : "ถัดไป"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#C8E6B2",
        justifyContent: "center",
        padding: 20,
    },
    box: {
        backgroundColor: "#fff",
        padding: 25,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    label: {
        marginBottom: 10,
        fontSize: 16,
    },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});
