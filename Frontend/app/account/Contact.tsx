import React from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity } from "react-native";

export default function Contact() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>📞 ช่องทางติดต่อ</Text>

      <Text style={styles.label}>อีเมล:</Text>
      <Text style={styles.link} onPress={() => Linking.openURL("mailto:bewrockgame1@gmail.com")}>
      bewrockgame1@gmail.com
      </Text>
      <Text style={styles.link} onPress={() => Linking.openURL("mailto:66110045@dpu.ac.th")}>
      66110045@dpu.ac.th
      </Text>

      <Text style={styles.label}>เบอร์โทร:</Text>
      <Text style={styles.link} onPress={() => Linking.openURL("tel:0611747731")}>
        061-174-7731
      </Text>

      <Text style={styles.label}>Facebook:</Text>
      <Text style={styles.link} onPress={() => Linking.openURL("https://facebook.com/biwrescue1706")}>
        facebook
      </Text>

      <Text style={styles.label}>LINE ID:</Text>
      <Text style={styles.link} onPress={() => Linking.openURL("https://line.me/ti/p/Fx7FhxeGKe")}>
        Line
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
  },
  link: {
    fontSize: 18,
    color: "blue",
    textDecorationLine: "underline",
  },
  text: {
    fontSize: 18,
  },
});
