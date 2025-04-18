import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  ScrollView,
} from "react-native";

export default function ContactScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.contactcontainer}>
        <Text style={styles.header}>📞 ช่องทางติดต่อ</Text>

        <Text style={styles.label}>📧 อีเมล:</Text>
        <Text
          style={styles.link}
          onPress={() => Linking.openURL("mailto:bewrockgame1@gmail.com")}
        >
          bewrockgame1@gmail.com
        </Text>
        <Text
          style={styles.link}
          onPress={() => Linking.openURL("mailto:66110045@dpu.ac.th")}
        >
          66110045@dpu.ac.th
        </Text>

        <Text style={styles.label}>📱 เบอร์โทร:</Text>
        <Text
          style={styles.link}
          onPress={() => Linking.openURL("tel:0611747731")}
        >
          061-174-7731
        </Text>

        <Text style={styles.label}>📘 Facebook:</Text>
        <Text
          style={styles.link}
          onPress={() => Linking.openURL("https://facebook.com/biwrescue1706")}
        >
          facebook.com/biwrescue1706
        </Text>

        <Text style={styles.label}>💬 LINE:</Text>
        <Text
          style={styles.link}
          onPress={() => Linking.openURL("https://line.me/ti/p/Fx7FhxeGKe")}
        >
          เพิ่มเพื่อนใน LINE
        </Text>
        <Text style={styles.plainText}>ID: phuwanatza7</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#C8E6B2",
  },
  contactcontainer: {
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
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  link: {
    fontSize: 18,
    color: "blue",
    textDecorationLine: "underline",
    marginTop: 10,
  },
  plainText: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 40,
  },
});