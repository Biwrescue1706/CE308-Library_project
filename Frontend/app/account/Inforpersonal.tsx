import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import DateTimePicker from "@react-native-community/datetimepicker";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function Inforpersonal() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/users/me`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching user data:", err);
        setLoading(false);
      });
  }, []);

  const updateUser = (field: string, value: string) => {
    if (!user) return;
    setUser({ ...user, [field]: value });
  };

  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    const thaiMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const day = date.getDate().toString().padStart(2, "0");
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  const handleSave = () => {
    if (!user?.username) return Alert.alert("ไม่พบชื่อผู้ใช้");

    setSaving(true);
    axios
      .put(`${API_URL}/users/update/${user.username}`, user, { withCredentials: true })
      .then(() => Alert.alert("✅ บันทึกสำเร็จ", "ข้อมูลส่วนตัวของคุณได้รับการอัปเดตแล้ว"))
      .catch((err) => {
        console.error("❌ Error saving user data:", err);
        Alert.alert("❌ เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formBox}>
        <Text style={styles.header}>📋 ข้อมูลส่วนตัว</Text>

        <Text style={styles.label}>คำนำหน้า (ภาษาไทย) : </Text>
        <TextInput style={styles.input} value={user?.titleTH} onChangeText={(text) => updateUser("titleTH", text)} />

        <Text style={styles.label}>ชื่อ (ภาษาไทย) : </Text>
        <TextInput style={styles.input} value={user?.firstNameTH} onChangeText={(text) => updateUser("firstNameTH", text)} />

        <Text style={styles.label}>นามสกุล (ภาษาไทย) : </Text>
        <TextInput style={styles.input} value={user?.lastNameTH} onChangeText={(text) => updateUser("lastNameTH", text)} />

        <Text style={styles.label}>คำนำหน้า (ภาษาอังกฤษ) : </Text>
        <TextInput style={styles.input} value={user?.titleEN} onChangeText={(text) => updateUser("titleEN", text)} />

        <Text style={styles.label}>ชื่อ (ภาษาอังกฤษ) : </Text>
        <TextInput style={styles.input} value={user?.firstNameEN} onChangeText={(text) => updateUser("firstNameEN", text)} />

        <Text style={styles.label}>นามสกุล (ภาษาอังกฤษ) : </Text>
        <TextInput style={styles.input} value={user?.lastNameEN} onChangeText={(text) => updateUser("lastNameEN", text)} />

        <Text style={styles.label}>เบอร์โทร : </Text>
        <TextInput style={styles.input} value={user?.phone} onChangeText={(text) => updateUser("phone", text)} keyboardType="phone-pad" />

        <Text style={styles.label}>วันเกิด : </Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text>{formatThaiDate(user?.birthDate)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={new Date(user?.birthDate)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                updateUser("birthDate", selectedDate.toISOString());
              }
            }}
          />
        )}

        <Text style={styles.label}>บ้านเลขที่ : </Text>
        <TextInput style={styles.input} value={user?.houseNumber} onChangeText={(text) => updateUser("houseNumber", text)} />

        <Text style={styles.label}>หมู่ที่ : </Text>
        <TextInput style={styles.input} value={user?.villageNo} onChangeText={(text) => updateUser("villageNo", text)} />

        <Text style={styles.label}>ซอย : </Text>
        <TextInput style={styles.input} value={user?.alley} onChangeText={(text) => updateUser("alley", text)} />

        <Text style={styles.label}>ถนน : </Text>
        <TextInput style={styles.input} value={user?.street} onChangeText={(text) => updateUser("street", text)} />

        <Text style={styles.label}>ตำบล/แขวง : </Text>
        <TextInput style={styles.input} value={user?.subdistrict} onChangeText={(text) => updateUser("subdistrict", text)} />

        <Text style={styles.label}>อำเภอ/เขต : </Text>
        <TextInput style={styles.input} value={user?.district} onChangeText={(text) => updateUser("district", text)} />

        <Text style={styles.label}>จังหวัด : </Text>
        <TextInput style={styles.input} value={user?.province} onChangeText={(text) => updateUser("province", text)} />

        <Text style={styles.label}>รหัสไปรษณีย์ : </Text>
        <TextInput style={styles.input} value={user?.postalCode} onChangeText={(text) => updateUser("postalCode", text)} keyboardType="numeric" />

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
          <Text style={styles.buttonText}>
            {saving ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#C8E6B2",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 5,
  },
  formBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  button: {
    backgroundColor: "#28a745",
    paddingVertical: 15,
    marginTop: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
