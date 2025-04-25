import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import ContactItem from "../components/ContactItem";

export default function ContactScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.contactContainer}>
        <Text style={styles.header}>📞 ช่องทางติดต่อ</Text>

        <ContactItem label="📧 อีเมล:" value="bewrockgame1@gmail.com" url="mailto:bewrockgame1@gmail.com" />
        <ContactItem value="66110045@dpu.ac.th" url="mailto:66110045@dpu.ac.th" />

        <ContactItem label="📱 เบอร์โทร:" value="061-174-7731" url="tel:0611747731" />

        <ContactItem label="📘 Facebook:" value="facebook.com/biwrescue1706" url="https://facebook.com/biwrescue1706" />

        <ContactItem label="💬 LINE:" value="เพิ่มเพื่อนใน LINE" url="https://line.me/ti/p/Fx7FhxeGKe" />
        <ContactItem value="ID: phuwanatza7" isPlainText />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#00FA9A",
  },
  contactContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
});
