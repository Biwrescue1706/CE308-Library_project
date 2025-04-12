// import * as React from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
// import { useNavigation } from "@react-navigation/native";

// export default function AccountScreen() {
//   const navigation = useNavigation<BottomTabNavigationProp<any>>();

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>ชื่อ............................</Text>

//       <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Inforpersonal")}>
//         <Text style={styles.buttonText}>ข้อมูลส่วนตัว</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Contact")}>
//         <Text style={styles.buttonText}>ช่องทางติดต่อ</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={() => navigation.navigate("Logout")}>
//         <Text style={styles.buttonText}>ออกจากระบบ</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     backgroundColor: "#f8f9fa",
//     padding : 20,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   button: {
//     backgroundColor: "#007bff",
//     paddingVertical: 40,
//     paddingHorizontal: 40,
//     borderRadius: 10,
//     marginVertical: 20,
//     width: 300,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 25,
//     fontWeight: "bold",
//   },
//   logoutButton: {
//     backgroundColor: "#dc3545", // สีแดงสำหรับปุ่มออกจากระบบ
//   },
// });
