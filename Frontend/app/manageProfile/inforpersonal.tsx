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
  Modal,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

const API_URL = Constants.expoConfig?.extra?.API_URL;

const titleTH = [
  "นาย", "นาง", "นางสาว", "ด.ช.", "ด.ญ.",
  "ดร.", "ผศ.", "รศ.", "ศ.", "ศาสตราจารย์เกียรติคุณ",
  "ผศ.ดร.", "รศ.ดร.", "ศ.ดร.", "ศาสตราจารย์เกียรติคุณ ดร.",
  "ว่าที่ ร.ต.", "ว่าที่ ร.ต.ดร.", "ว่าที่ ร.ต. หญิง", "ว่าที่ ร.ต.ดร.หญิง",
  "พล.ต.อ.", "พล.ต.ท.", "พล.ต.ต.",
  "พ.ต.อ.", "พ.ต.ท.", "พ.ต.ต.",
  "ร.ต.อ.", "ร.ต.ท.", "ร.ต.ต.",
  "ว่าที่ ร.ต.ต.",
  "ด.ต.", "ส.ต.อ.", "ส.ต.ท.", "ส.ต.ต.",
  "พล.ต.อ.หญิง", "พล.ต.ท.หญิง", "พล.ต.ต.หญิง",
  "พ.ต.อ.หญิง", "พ.ต.ท.หญิง", "พ.ต.ต.หญิง",
  "ร.ต.อ.หญิง", "ร.ต.ท.หญิง", "ร.ต.ต.หญิง",
  "ว่าที่ ร.ต.ต.หญิง",
  "ด.ต.หญิง", "ส.ต.อ.หญิง", "ส.ต.ท.หญิง", "ส.ต.ต.หญิง",
  "พล.ต.", "พ.อ.", "พ.ท.", "พ.ต.",
  "ร.อ.", "ร.ท.", "ร.ต.",
  "ส.อ.", "ส.ท.", "ส.ต.",
  "พลฯ",
  "พล.ต.หญิง", "พ.อ.หญิง", "พ.ท.หญิง", "พ.ต.หญิง",
  "ร.อ.หญิง", "ร.ท.หญิง", "ร.ต.หญิง",
  "ส.อ.หญิง", "ส.ท.หญิง", "ส.ต.หญิง",
  "พลฯหญิง"
];

const titleEN = [
  "Mr.", "Mrs.", "Miss", "Master", "Miss",
  "Dr.", "Asst. Prof.", "Assoc. Prof.", "Prof.", "Professor Emeritus",
  "Asst. Prof. Dr.", "Assoc. Prof. Dr.", "Prof. Dr.", "Professor Emeritus Dr.",
  "Acting Sub Lt.", "Acting Sub Lt. Dr.", "Acting Sub Lt. (Female)", "Acting Sub Lt. Dr. (Female)",
  "Pol. Gen.", "Pol. Lt. Gen.", "Pol. Maj. Gen.",
  "Pol. Col.", "Pol. Lt. Col.", "Pol. Maj.",
  "Pol. Capt.", "Pol. Lt.", "Pol. Sub Lt.",
  "Acting Pol. Sub Lt.",
  "Pol. Sen. Sgt. Maj.", "Pol. Sgt. Maj.", "Pol. Sgt. 1st Class", "Pol. Sgt. 2nd Class",
  "Pol. Gen. (Female)", "Pol. Lt. Gen. (Female)", "Pol. Maj. Gen. (Female)",
  "Pol. Col. (Female)", "Pol. Lt. Col. (Female)", "Pol. Maj. (Female)",
  "Pol. Capt. (Female)", "Pol. Lt. (Female)", "Pol. Sub Lt. (Female)",
  "Acting Pol. Sub Lt. (Female)",
  "Pol. Sen. Sgt. Maj. (Female)", "Pol. Sgt. Maj. (Female)", "Pol. Sgt. 1st Class (Female)", "Pol. Sgt. 2nd Class (Female)",
  "Maj. Gen.", "Col.", "Lt. Col.", "Maj.",
  "Capt.", "1st Lt.", "2nd Lt.",
  "Sgt. Maj.", "Sgt. 1st Class", "Sgt. 2nd Class",
  "Private",
  "Maj. Gen. (Female)", "Col. (Female)", "Lt. Col. (Female)", "Maj. (Female)",
  "Capt. (Female)", "1st Lt. (Female)", "2nd Lt. (Female)",
  "Sgt. Maj. (Female)", "Sgt. 1st Class (Female)", "Sgt. 2nd Class (Female)",
  "Private (Female)"
];

export default function Inforpersonal() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTitleTHModal, setShowTitleTHModal] = useState(false);

  const router = useRouter();

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

  const handleSelectTitleTH = (selectedTitleTH: string) => {
    const index = titleTH.indexOf(selectedTitleTH);
    const matchedEN = titleEN[index] || "";
    updateUser("titleTH", selectedTitleTH);
    updateUser("titleEN", matchedEN);
    setShowTitleTHModal(false);
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
      .then(() => {
        Alert.alert("✅ บันทึกสำเร็จ", "ข้อมูลส่วนตัวของคุณได้รับการอัปเดตแล้ว");
        router.replace("/");
      })
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
        <TouchableOpacity
          style={styles.input}
          onPress={() =>
            setShowTitleTHModal(true)}>
          <Text>{user?.titleTH || "เลือกคำนำหน้า (ไทย)"}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>ชื่อ (ภาษาไทย) : </Text>
        <TextInput style={styles.input}
          value={user?.firstNameTH}
          onChangeText={(text) =>
            updateUser("firstNameTH", text)}
        />

        <Text style={styles.label}>นามสกุล (ภาษาไทย) : </Text>
        <TextInput style={styles.input}
          value={user?.lastNameTH}
          onChangeText={(text) =>
            updateUser("lastNameTH", text)}
        />
        <Text style={styles.label}>คำนำหน้า (ภาษาอังกฤษ) : </Text>
        <TouchableOpacity
          style={styles.input}
        >
          <Text>{user?.titleEN || "เลือกคำนำหน้า (อังกฤษ)"}</Text>
        </TouchableOpacity>


        <Text style={styles.label}>ชื่อ (ภาษาอังกฤษ) : </Text>
        <TextInput style={styles.input}
          value={user?.firstNameEN}
          onChangeText={(text) =>
            updateUser("firstNameEN", text)} />

        <Text style={styles.label}>นามสกุล (ภาษาอังกฤษ) : </Text>
        <TextInput style={styles.input}
          value={user?.lastNameEN}
          onChangeText={(text) =>
            updateUser("lastNameEN", text)} />

        <Text style={styles.label}>เบอร์โทร : </Text>
        <TextInput style={styles.input}
          value={user?.phone}
          onChangeText={(text) =>
            updateUser("phone", text)}
          keyboardType="phone-pad" />

        <Text style={styles.label}>วันเกิด : </Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() =>
            setShowDatePicker(true)}>
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
        <TextInput style={styles.input}
          value={user?.villageNo}
          onChangeText={(text) =>
            updateUser("villageNo", text)} />

        <Text style={styles.label}>ซอย : </Text>
        <TextInput style={styles.input}
          value={user?.alley}
          onChangeText={(text) =>
            updateUser("alley", text)} />

        <Text style={styles.label}>ถนน : </Text>
        <TextInput style={styles.input}
          value={user?.street}
          onChangeText={(text) =>
            updateUser("street", text)} />

        <Text style={styles.label}>ตำบล/แขวง : </Text>
        <TextInput style={styles.input}
          value={user?.subdistrict}
          onChangeText={(text) =>
            updateUser("subdistrict", text)} />

        <Text style={styles.label}>อำเภอ/เขต : </Text>
        <TextInput style={styles.input}
          value={user?.district}
          onChangeText={(text) =>
            updateUser("district", text)} />

        <Text style={styles.label}>จังหวัด : </Text>
        <TextInput style={styles.input}
          value={user?.province}
          onChangeText={(text) =>
            updateUser("province", text)} />

        <Text style={styles.label}>รหัสไปรษณีย์ : </Text>
        <TextInput style={styles.input}
          value={user?.postalCode}
          onChangeText={(text) =>
            updateUser("postalCode", text)} keyboardType="numeric" />

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
          <Text style={styles.buttonText}>
            {saving ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showTitleTHModal} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>เลือกคำนำหน้า (ภาษาไทย)</Text>
          {titleTH.map((title) => (
            <TouchableOpacity
              key={title}
              style={styles.modalItem}
              onPress={() =>
                handleSelectTitleTH(title)}>
              <Text>{title}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() =>
              setShowTitleTHModal(false)}>
            <Text style={styles.modalClose}>ปิด</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
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
    borderColor: "#000000",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  formBox: {
    backgroundColor: "#ffffff",
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
  modalContainer: {
    padding: 20,
    backgroundColor: "#ffffff",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#ffffff",
  },
  modalClose: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});
