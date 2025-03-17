import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from "../constant/Colors";
import { Link } from 'expo-router';

interface ErrorComponentProps {
    errorMessage: string;
    onRetry: () => void;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({ errorMessage, onRetry }) => {
    return (
        <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="red" />
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                <Ionicons name="refresh-outline" size={24} color={Colors.neutralWhite} />
                <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
            <Link href="/" style={styles.homeButton}>
                <Ionicons name="home-outline" size={24} color={Colors.neutralWhite} />
                <Text style={styles.homeButtonText}>Ir al inicio</Text>
            </Link>
        </View>
    );
};

const styles = StyleSheet.create({
    errorContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    errorText: {
        fontSize: 16,
        color: "red",
        textAlign: "center",
        marginBottom: 10,
    },
    retryButton: {
        backgroundColor: Colors.primaryGreen,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.neutralWhite,
        marginLeft: 5,
    },
    homeButton: {
        backgroundColor: Colors.primaryBlue,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    homeButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.neutralWhite,
        marginLeft: 5,
    },
});

export default ErrorComponent;
