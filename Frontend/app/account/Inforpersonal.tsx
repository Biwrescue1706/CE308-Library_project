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
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function Inforpersonal() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/user/me`)
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching user data:", error);
        setLoading(false);
      });
  }, []);

  const handleSave = () => {
    setSaving(true);
    axios
      .put(`${API_URL}/user/update`, user)
      .then(() => {
        Alert.alert("✅ บันทึกสำเร็จ", "ข้อมูลส่วนตัวของคุณได้รับการอัปเดตแล้ว");
      })
      .catch((error) => {
        console.error("❌ Error saving user data:", error);
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
      <Text style={styles.header}>📋 ข้อมูลส่วนตัว </Text>

      {/* ข้อมูลภาษาไทย */}
      <Text style={styles.label}>คำนำหน้า (ภาษาไทย):</Text>
      <TextInput
        style={styles.input}
        value={user?.titleTH}
        onChangeText={(text) => setUser({ ...user, titleTH: text })}
      />
      <Text style={styles.label}>ชื่อ (ภาษาไทย):</Text>
      <TextInput
        style={styles.input}
        value={user?.firstNameTH}
        onChangeText={(text) => setUser({ ...user, firstNameTH: text })}
      />
      <Text style={styles.label}>นามสกุล (ภาษาไทย):</Text>
      <TextInput
        style={styles.input}
        value={user?.lastNameTH}
        onChangeText={(text) => setUser({ ...user, lastNameTH: text })}
      />

      {/* ข้อมูลภาษาอังกฤษ */}
      <Text style={styles.label}>คำนำหน้า (ภาษาอังกฤษ):</Text>
      <TextInput
        style={styles.input}
        value={user?.titleEN}
        onChangeText={(text) => setUser({ ...user, titleEN: text })}
      />
      <Text style={styles.label}>ชื่อ (ภาษาอังกฤษ) : </Text>
      <TextInput
        style={styles.input}
        value={user?.firstNameEN}
        onChangeText={(text) => setUser({ ...user, firstNameEN: text })}
      />
      <Text style={styles.label}>นามสกุล (ภาษาอังกฤษ) : </Text>
      <TextInput
        style={styles.input}
        value={user?.lastNameEN}
        onChangeText={(text) => setUser({ ...user, lastNameEN: text })}
      />

      {/* เบอร์โทร วันเกิด */}
      <Text style={styles.label}>เบอร์โทร : </Text>
      <TextInput
        style={styles.input}
        value={user?.phone}
        onChangeText={(text) => setUser({ ...user, phone: text })}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>วันเกิด (YYYY-MM-DD) ใส่เป็นปี ค.ศ. : </Text>
      <TextInput
        style={styles.input}
        value={user?.birthDate?.substring(0, 10)}
        onChangeText={(text) => setUser({ ...user, birthDate: text })}
        placeholder="2000-01-01"
      />

      {/* ที่อยู่ */}
      <Text style={styles.label}>บ้านเลขที่ : </Text>
      <TextInput
        style={styles.input}
        value={user?.address?.village}
        onChangeText={(text) =>
          setUser({ ...user, address: { ...user.address, village: text } })
        }
      />

      <Text style={styles.label}>ถนน : </Text>
      <TextInput
        style={styles.input}
        value={user?.address?.street}
        onChangeText={(text) =>
          setUser({ ...user, address: { ...user.address, street: text } })
        }
      />

      <Text style={styles.label}>ซอย : </Text>
      <TextInput
        style={styles.input}
        value={user?.address?.alley}
        onChangeText={(text) =>
          setUser({ ...user, address: { ...user.address, alley: text } })
        }
      />

      <Text style={styles.label}>ตำบล/แขวง : </Text>
      <TextInput
        style={styles.input}
        value={user?.address?.subdistrict}
        onChangeText={(text) =>
          setUser({ ...user, address: { ...user.address, subdistrict: text } })
        }
      />

      <Text style={styles.label}>อำเภอ/เขต : </Text>
      <TextInput
        style={styles.input}
        value={user?.address?.district}
        onChangeText={(text) =>
          setUser({ ...user, address: { ...user.address, district: text } })
        }
      />

      <Text style={styles.label}>จังหวัด : </Text>
      <TextInput
        style={styles.input}
        value={user?.address?.province}
        onChangeText={(text) =>
          setUser({ ...user, address: { ...user.address, province: text } })
        }
      />

      <Text style={styles.label}>รหัสไปรษณีย์ : </Text>
      <TextInput
        style={styles.input}
        value={user?.address?.postalCode}
        onChangeText={(text) =>
          setUser({ ...user, address: { ...user.address, postalCode: text } })
        }
        keyboardType="numeric"
      />

      {/* ปุ่มบันทึก */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={saving}
      >
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
    backgroundColor: "#fff",       // ✅ กล่องขาวครอบฟอร์ม
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
