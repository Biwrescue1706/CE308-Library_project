import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

const PageNavigator: React.FC<Props> = ({ currentPage, totalPages, onPrevious, onNext }) => {
  return (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        onPress={onPrevious}
        disabled={currentPage === 1}
        style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
      >
        <Text style={styles.pageText}>⬅️ ก่อนหน้า</Text>
      </TouchableOpacity>

      <Text style={styles.pageNumber}>หน้า {currentPage} / {totalPages}</Text>

      <TouchableOpacity
        onPress={onNext}
        disabled={currentPage === totalPages}
        style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
      >
        <Text style={styles.pageText}>ถัดไป ➡️</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  pageButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#007bff",
    borderRadius: 8,
  },
  pageButtonDisabled: {
    backgroundColor: "#ccc",
  },
  pageText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pageNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PageNavigator;
