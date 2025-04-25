import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  user: any;
  formatThaiDate: (date: string) => string;
}

const UserInfoBox: React.FC<Props> = ({ user, formatThaiDate }) => {
  return (
    <View style={styles.userInfoBox}>
      <Text style={styles.infoText}><Text style={styles.bold}>📧 อีเมล : </Text>{user.email}</Text>
      <Text style={styles.infoText}><Text style={styles.bold}>🆔 รหัสสมาชิก : </Text>{user.memberId}</Text>
      <Text style={styles.infoText}><Text style={styles.bold}>👤 ชื่อใช้งาน : </Text>{user.username}</Text>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>👤 ชื่อ ภาษาไทย : </Text>
        {user.titleTH} {user.firstNameTH} {user.lastNameTH}
      </Text>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>👤 ชื่อ ภาษาอังกฤษ : </Text>
        {user.titleEN} {user.firstNameEN} {user.lastNameEN}
      </Text>
      <Text style={styles.infoText}><Text style={styles.bold}>📞 เบอร์โทร : </Text>{user.phone}</Text>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>📅 วันสมัครสมาชิก : </Text>
        {formatThaiDate(user.registrationDate || user.createdAt)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  userInfoBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 13.5,
    marginBottom: 2,
  },
  bold: {
    fontWeight: "bold",
  },
});

export default UserInfoBox;
