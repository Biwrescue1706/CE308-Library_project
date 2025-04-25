import React from "react";
import { Text, StyleSheet, Linking } from "react-native";

interface Props {
  label?: string;
  value: string;
  url?: string;
  isPlainText?: boolean;
}

const ContactItem: React.FC<Props> = ({ label, value, url, isPlainText }) => {
  return (
    <>
      {label && <Text style={styles.label}>{label}</Text>}
      {isPlainText ? (
        <Text style={styles.plainText}>{value}</Text>
      ) : (
        <Text style={styles.link} onPress={() => url && Linking.openURL(url)}>
          {value}
        </Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 10,
  },
});

export default ContactItem;
