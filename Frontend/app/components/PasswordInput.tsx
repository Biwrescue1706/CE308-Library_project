import React from "react";
import {
    TextInput, Text, View, TouchableOpacity, StyleSheet,
} from "react-native";

interface Props {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    showPassword: boolean;
    toggleShowPassword: () => void;
}

const PasswordInput: React.FC<Props> = ({
    value,
    onChangeText,
    placeholder,
    showPassword,
    toggleShowPassword,
}) => {
    return (
        <View style={styles.inputWrapper}>
            <TextInput
                style={styles.input}
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={toggleShowPassword} style={styles.icon}>
                <Text style={styles.iconText}>
                    {showPassword ? "🙈" : "👁️"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    inputWrapper: {
        position: "relative",
        marginBottom: 20,
    },
    input: {
        borderWidth: 2,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        paddingRight: 45, // ให้เหลือที่ว่างสำหรับไอคอนด้านขวา
        backgroundColor: "#fff",
        fontSize: 16,
    },
    icon: {
        position: "absolute",
        right: 10,
        top: "50%",
        transform: [{ translateY: -22 }],
        padding: 5,
    },
    iconText: {
        fontSize: 20,
    },
});

export default PasswordInput;
