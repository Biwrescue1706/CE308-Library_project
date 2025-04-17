import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Constants from "expo-constants";
import { ActivityIndicator, View } from "react-native";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function TabLayout() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [role, setRole] = useState<string>("user");

    useEffect(() => {
        axios
            .get(`${API_URL}/users/me`, { withCredentials: true })
            .then((res) => {
                setRole(res.data.user.role);
                setIsAuthenticated(true);
            })
            .catch(() => {
                setIsAuthenticated(false); // ยังไม่ได้ login
            });
    }, []);

    if (isAuthenticated === null) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0de136" />
            </View>
        );
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#0de136",
                headerStyle: {
                    backgroundColor: "#c9fffb",
                },
                headerShadowVisible: false,
                headerTintColor: "#464646",
                tabBarStyle: {
                    backgroundColor: "#c9fffb",
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                    ),
                }}
            />

            {isAuthenticated || role === "admin" && (
                <Tabs.Screen
                    name="addBooks"
                    options={{
                        title: "Add Books",
                        tabBarIcon: ({ focused, color }) => (
                            <Ionicons name={focused ? "book" : "book-outline"} size={24} color={color} />
                        ),
                    }}
                />
            )}

            <Tabs.Screen
                name="history"
                options={{
                    title: "History",
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? "time" : "time-outline"} size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="account"
                options={{
                    title: "Account",
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
