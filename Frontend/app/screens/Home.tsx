// import { useRouter } from "expo-router";
// import React, { useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   Modal,
//   TextInput,
//   Button,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import axios from "axios";
// import { StackNavigationProp } from "@react-navigation/stack";
// import Constants from "expo-constants";
// import { useFocusEffect } from "@react-navigation/native";

// type HomeScreenProps = {
//   navigation: StackNavigationProp<any>;
// };

// // 🔹 URL ของ Backend API (เปลี่ยนเป็นของคุณ)
// const API_URL = Constants.expoConfig?.extra?.API_URL;

// export default function HomeScreen({ navigation }: HomeScreenProps) {
//   const router = useRouter();
//   const [books, setBooks] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [selectedBook, setSelectedBook] = useState<any>(null);

//   // 📌 ดึงข้อมูลหนังสือจาก API
//   useFocusEffect(
//     useCallback(() => {
//       const fetchBooks = async () => {
//         try {
//           console.log("📌 Fetching books...");
//           const response = await axios.get(`${API_URL}/books`);
//           setBooks(response.data);
//           setLoading(false);
//         } catch (error) {
//           console.error("❌ Error fetching books:", error);
//           setLoading(false);
//         }
//       };
//       fetchBooks();
//     }, [])
//   );

//   // 📌 ลบหนังสือ
//   const handleDelete = (id: string) => {
//     axios
//       .delete(`${API_URL}/books/${id}`)
//       .then(() => {
//         setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
//       })
//       .catch((error) => console.error("❌ Error deleting book:", error));
//   };

//   // 📌 แก้ไขหนังสือ (เปิด Modal)
//   const handleEdit = (book: any) => {
//     setSelectedBook(book);
//     setModalVisible(true);
//   };

//   // 📌 บันทึกการแก้ไขหนังสือ
//   const handleUpdate = () => {
//     if (selectedBook) {
//       const updatedBook = {
//         title: selectedBook.title, // ✅ แก้ไขจาก 'titel' เป็น 'title'
//         author: selectedBook.author,
//         description: selectedBook.description,
//         category: selectedBook.category,
//         totalCopies: selectedBook.totalCopies,
//         availableCopies: selectedBook.availableCopies,
//       };

//       axios
//         .put(`${API_URL}/books/${selectedBook.id}`, updatedBook)
//         .then(() => {
//           setBooks((prevBooks) =>
//             prevBooks.map((book) =>
//               book.id === selectedBook.id ? { ...selectedBook } : book
//             )
//           );
//           closeModal();
//         })
//         .catch((error) => console.error("❌ Error updating book:", error));
//     }
//   };

//   // 📌 ปิด Modal
//   const closeModal = () => {
//     setModalVisible(false);
//     setSelectedBook(null);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>📚 รายการหนังสือ</Text>

//       {loading ? (
//         <ActivityIndicator size="large" color="tomato" />
//       ) : (
//         <FlatList
//           data={books}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => (
//             <View style={styles.bookContainer}>
//               <Text style={styles.bookTitle}> 📖 {item.title}</Text>
//               <Text>✍️ ผู้แต่ง : {item.author}</Text>
//               <Text>📜 คำอธิบาย : {item.description}</Text>
//               <Text>💰 หมวดหมู่ : {item.category}</Text>
//               <Text>📚 จํานวนหนังสือ : {item.totalCopies}</Text>
//               <Text>📚 หนังสือคงเหลือ : {item.availableCopies}</Text>

//               <View style={styles.buttonGroup}>
//                 <TouchableOpacity
//                   style={styles.editButton}
//                   onPress={() => handleEdit(item)}
//                 >
//                   <Text style={styles.buttonText}>✏️ แก้ไข</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.deleteButton}
//                   onPress={() => handleDelete(item.id)}
//                 >
//                   <Text style={styles.buttonText}>🗑️ ลบ</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         />
//       )}

//       {/* 🟢 Modal สำหรับแก้ไขหนังสือ */}
//       <Modal visible={isModalVisible} animationType="slide" transparent>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>📝 แก้ไขหนังสือ</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="ชื่อหนังสือ"
//               value={selectedBook?.title}
//               onChangeText={(text) =>
//                 setSelectedBook({ ...selectedBook, title: text })
//               }
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="ผู้แต่ง"
//               value={selectedBook?.author}
//               onChangeText={(text) =>
//                 setSelectedBook({ ...selectedBook, author: text })
//               }
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="คำอธิบาย"
//               value={selectedBook?.description}
//               onChangeText={(text) =>
//                 setSelectedBook({ ...selectedBook, description: text })
//               }
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="หมวดหมู่"
//               value={selectedBook?.category}
//               onChangeText={(text) =>
//                 setSelectedBook({ ...selectedBook, description: text })
//               }
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="ราคา"
//               keyboardType="numeric"
//               value={selectedBook?.price?.toString()}
//               onChangeText={(text) =>
//                 setSelectedBook({ ...selectedBook, price: parseFloat(text) })
//               }
//             />
//             <Button title="💾 บันทึก" onPress={handleUpdate} />
//             <Button title="❌ ยกเลิก" onPress={closeModal} />
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// // 🎨 **Styles (CSS)**
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: 20,
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   bookContainer: {
//     backgroundColor: "#f8f9fa",
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   bookTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   buttonGroup: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   editButton: {
//     backgroundColor: "#0de136",
//     padding: 10,
//     borderRadius: 5,
//     flex: 1,
//     marginRight: 5,
//     alignItems: "center",
//   },
//   deleteButton: {
//     backgroundColor: "#ff4d4d",
//     padding: 10,
//     borderRadius: 5,
//     flex: 1,
//     marginLeft: 5,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },

//   /** ✅ เพิ่ม Style ที่หายไป **/
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 10,
//     width: "80%",
//     alignItems: "center",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   input: {
//     width: "100%",
//     padding: 10,
//     marginVertical: 5,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//   },
// });

