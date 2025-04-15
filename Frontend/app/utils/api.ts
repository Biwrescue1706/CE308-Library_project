import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ✅ เพื่อให้ cookie ส่งไปพร้อมกับทุก request
});

// 🔐 Auth APIs
export const login = (username: string, password: string) =>
  api.post("/users/login", { username, password });

export const logout = () =>
  api.post("/users/logout");

export const register = (data: any) =>
  api.post("/users/register", data);

export const getCurrentUser = () =>
  api.get("/users/me");

// 👤 User APIs
export const updateUser = (username: string, data: any) =>
  api.put(`/users/update/${username}`, data);

export const deleteUser = (username: string) =>
  api.delete(`/users/delete/${username}`);

// 📚 Book APIs
export const getAllBooks = () =>
  api.get("/books/getAllBooks");

export const getBookById = (id: string) =>
  api.get(`/books/getBooks/${id}`);

export const createBook = (data: any) =>
  api.post("/books/create", data);

export const updateBook = (id: string, data: any) =>
  api.put(`/books/editBooks/${id}`, data);

export const deleteBook = (id: string) =>
  api.delete(`/books/deleteBooks/${id}`);

// ✅ export default instance (optional)
export default api;
