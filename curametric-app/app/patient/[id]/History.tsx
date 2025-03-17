import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Header from "../../../components/Header";
import BackBtn from "../../../components/BackBtn";
import Colors from "../../../constant/Colors";
import axios from "axios";
import { useSelector } from "react-redux";
import ErrorComponent from "../../../components/ErrorComponent";
import LoadingComponent from "../../../components/LoadingComponent";

export default function History() {
  const { id } = useLocalSearchParams(); // ID del paciente
  const router = useRouter();
  const [patientData, setPatientData] = useState(null);
  const [wounds, setWounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    if (!id) {
      setError("No se encontró el ID del paciente.");
      setLoading(false);
      return;
    }
    fetchPatientData(id);
    fetchWounds(id);
  }, [id]);

  const fetchPatientData = async (patientId) => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/patients/${patientId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatientData(response.data);
    } catch (error) {
      console.error("Error al obtener paciente:", error);
      setError("Error al obtener los datos del paciente.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWounds = async (patientId) => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/wounds/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { patient: patientId },
      });
      setWounds(response.data);
    } catch (error) {
      console.error("Error al obtener heridas:", error);
      setError("Error al obtener el historial de heridas.");
    }
  };

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    fetchPatientData(id);
    fetchWounds(id);
  };

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View style={styles.container}>
        {loading ? (
          <LoadingComponent message='Cargando historial...'  />
        ) : error ? (
          <ErrorComponent errorMessage={error} onRetry={retryFetch} />
        ) : patientData ? (
          <View style={styles.patientContainer}>
            <View style={styles.nameRow}>
              <BackBtn />
              <Text style={styles.patientName}>{patientData.name}</Text>
            </View>

            <Text style={styles.sectionTitle}>Historial de Heridas</Text>

            <FlatList
              data={wounds}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.woundItem}>
                  <Text style={styles.woundLocation}>
                    Localización: {item.wound_location}
                  </Text>
                  <Text style={styles.woundDate}>
                    Fecha de origen:{" "}
                    {item.wound_origin_date
                      ? new Date(item.wound_origin_date).toLocaleDateString("es-ES")
                      : "Desconocida"}
                  </Text>
                  <Text style={styles.woundOrigin}>Origen: {item.wound_origin}</Text>

                  <TouchableOpacity
                    style={styles.evolutionButton}
                    onPress={() => router.push({ 
                      pathname: `/patient/WoundCareHistory`, 
                      params: { id, woundId: item.id } 
                    })}
                  >
                    <Text style={styles.evolutionButtonText}>Ver Evolución</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No hay heridas registradas.
                </Text>
              }
            />
          </View>
        ) : (
          <Text style={styles.errorText}>No se encontró información del paciente.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  patientContainer: {
    flex: 1,
    marginTop: 10,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
  },
  patientName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primaryBlue,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primaryBlue,
    marginTop: 20,
  },
  woundItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: Colors.secondaryLightBlue,
    borderRadius: 10,
  },
  woundLocation: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.neutralDarkGray,
  },
  woundDate: {
    fontSize: 14,
    color: Colors.neutralGray,
    marginTop: 5,
  },
  woundOrigin: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primaryBlue,
    marginTop: 5,
  },
  evolutionButton: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: Colors.primaryGreen,
    borderRadius: 8,
    alignItems: "center",
  },
  evolutionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.neutralWhite,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});