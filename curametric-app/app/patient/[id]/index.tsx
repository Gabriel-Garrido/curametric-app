import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Header from "../../../components/Header";
import Colors from "../../../constant/Colors";
import BackBtn from "../../../components/BackBtn";
import { Temporal } from "@js-temporal/polyfill";
import axios from "axios";
import { useSelector } from "react-redux";
import ErrorComponent from "../../../components/ErrorComponent";
import LoadingComponent from "../../../components/LoadingComponent";

export default function PatientDetails() {
  const { id } = useLocalSearchParams(); // ID del paciente desde la URL
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    if (id) {
      fetchPatientData(id);
    }
  }, [id]);

  const fetchPatientData = async (patientId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/patients/${patientId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPatientData(response.data);
    } catch (error) {
      console.error("Error al obtener datos del paciente:", error);
      setError("Error al obtener datos del paciente. Por favor, intente nuevamente.");
    }
    setLoading(false);
  };

  const calculateAge = (dobString) => {
    if (!dobString) return "Edad no disponible";
    try {
      const dob = Temporal.PlainDate.from(dobString.split("T")[0]);
      const today = Temporal.Now.plainDateISO();
      const difference = today.since(dob, { largestUnit: "years" });
      return `${difference.years} años`;
    } catch (error) {
      console.error("Error al calcular la edad:", error);
      return "Fecha inválida";
    }
  };

  return (
    <View style={styles.screen}>
      <Header />

      {loading ? (
        <LoadingComponent message="Cargando datos del paciente..." />
      ) : error ? (
        <ErrorComponent errorMessage={error} onRetry={() => fetchPatientData(id)} />
      ) : patientData ? (
        <View>
          {/* Header con nombre y botón de regreso */}
          <View style={styles.nameRow}>
            <BackBtn />
            <Text style={styles.patientName}>
              {patientData.first_name} {patientData.last_name}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.container}>
            {/* Información General */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>📌 Información General</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📅 Edad:</Text>
                <Text style={styles.infoText}>
                  {calculateAge(patientData.birth_date)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🆔 RUT:</Text>
                <Text style={styles.infoText}>{patientData.rut}</Text>
              </View>
            </View>

            {/* Condiciones Crónicas */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>⚕️ Condiciones Crónicas</Text>
              <FlatList
                scrollEnabled={false}
                data={patientData.chronic_diseases}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <Text style={styles.listItem}>• {item}</Text>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    Sin condiciones registradas
                  </Text>
                }
              />
            </View>

            {/* Condiciones Predisponentes */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>
                🩺 Condiciones Predisponentes
              </Text>
              <FlatList
                scrollEnabled={false}
                data={patientData.predispositions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <Text style={styles.listItem}>• {item}</Text>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    Sin predisposiciones registradas
                  </Text>
                }
              />
            </View>
          </ScrollView>
        </View>
      ) : (
        <Text style={styles.errorText}>
          No se encontró información del paciente.
        </Text>
      )}
    </View>
  );
}

// **Estilos mejorados**
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.neutralWhite,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
    marginTop: 20,
    marginStart: 20,
  },
  patientName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primaryBlue,
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: Colors.secondaryLightBlue,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primaryBlue,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutralDarkGray,
  },
  infoText: {
    fontSize: 16,
    color: Colors.neutralGray,
  },
  listItem: {
    fontSize: 16,
    color: "#333",
    marginVertical: 2,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});