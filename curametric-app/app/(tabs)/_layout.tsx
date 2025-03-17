import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import { useAuth } from "../../utils/AuthContext";
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from "../../constant/Colors";
import { StyleSheet, Text, View } from "react-native";
import { checkToken } from "../../utils/authUtils";
import { logout } from "../../redux/authSlice";
import { useDispatch } from "react-redux";

export default function TabLayout() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { isAuthenticated, user, token } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await checkToken(dispatch);
      } catch (error) {
        console.error("Error verifying token:", error);
        dispatch(logout());
      } finally {
      }
    };
    verifyToken();
  }, []);


  if (!isMounted) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingComponent message="Cargando app"/>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.secondary,
      tabBarStyle: { backgroundColor: Colors.white },
      tabBarLabelStyle: { fontSize: 12 },
      tabBarIconStyle: { width: 24, height: 24 },
      }}>
      <Tabs.Screen
      name="index"
      options={{
        title: "HomeScreen",
        tabBarIcon: ({ color, size }) => ( <Ionicons name="home" size={24} color={color} /> ),
      }}
      />
      <Tabs.Screen
      name="PatientList"
      options={{
        title: "PatientList",
        tabBarIcon: ({ color, size }) => ( <Ionicons name="people" size={24} color={color} /> ),
      }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});