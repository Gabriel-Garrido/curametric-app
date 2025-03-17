import React, { useEffect, useState } from "react";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { checkToken } from "../../../utils/authUtils"; // Adjust the import path as needed
import { RootState } from "../../../redux/store"; // Adjust the import path as needed
import { ActivityIndicator, View, Text, Button } from "react-native";
import Colors from "../../../constant/Colors";

export default function TabLayout() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Obtiene el parámetro de la URL
  const token = useSelector((state: any) => state.auth.token);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const dispatch = useDispatch();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await checkToken(dispatch);
    } catch (err) {
      setError("Error al cargar los datos. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {}, [isAuthenticated]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primaryBlue} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red", marginBottom: 20 }}>{error}</Text>
        <Button title="Reintentar" onPress={loadData} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 70, // Aumenta la altura de la barra inferior
          paddingBottom: 10, // Espacio inferior
          paddingTop: 0, // Espacio superior
        },
        tabBarLabelStyle: {
          fontSize: 12, // Tamaño de fuente del label
        },
        tabBarIconStyle: {
          marginBottom: 0, // Ajuste para la posición del ícono
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Datos del paciente",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
        initialParams={{ id }} // Pasa el parámetro a la pantalla
      />
      <Tabs.Screen
        name="WoundList"
        options={{
          tabBarLabel: "Nueva curación",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="plus-circle" size={35} color={color} />
          ),
        }}
        initialParams={{ id }} // Pasa el parámetro a la pantalla
      />
      <Tabs.Screen
        name="History"
        options={{
          tabBarLabel: "Historial de curaciones",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="history" size={size} color={color} />
          ),
        }}
        initialParams={{ id }} // Pasa el parámetro a la pantalla
      />
    </Tabs>
  );
}