// 📁 utils/api.ts
import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// 🔐 Auth APIs
export const login = (username: string, password: string) =>
  api.post<{ user: any }>("/users/login", { username, password });

export const logout = () => api.post("/users/logout");

export const register = (data: any) => api.post("/users/register", data);

export const getCurrentUser = () => api.get<{ user: any }>("/users/me");

// 👤 User APIs
export const updateUser = (username: string, data: any) =>
  api.put(`/users/update/${username}`, data);

export const deleteUser = (username: string) =>
  api.delete(`/users/delete/${username}`);

// 📚 Book APIs
export const getAllBooks = (): Promise<{ data: any[] }> =>
  api.get("/books/getAllBooks");

export const getBookById = (id: string) =>
  api.get(`/books/getBooks/${id}`);

export const createBook = (data: any) =>
  api.post("/books/create", data);

export const updateBook = (id: string, data: any): Promise<{ data: any }> =>
  api.put(`/books/editBooks/${id}`, data);

export const deleteBook = (id: string): Promise<{ data: any }> =>
  api.delete(`/books/deleteBooks/${id}`);

// 📦 Borrowing
export const borrowBook = (id: string): Promise<{ data: any }> =>
  api.put(`/loans/borrow/${id}`);

// 🧾 Me
export const getMe = (): Promise<{ data: { user: { role: string } } }> =>
  api.get("/users/me");

export default api;
