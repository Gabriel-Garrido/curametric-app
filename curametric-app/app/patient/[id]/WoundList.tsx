import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Header from "../../../components/Header";
import Colors from "../../../constant/Colors";
import BackBtn from "../../../components/BackBtn";
import axios from "axios";
import { useSelector } from "react-redux";
import Ionicons from '@expo/vector-icons/Ionicons';
import ErrorComponent from "../../../components/ErrorComponent";
import LoadingComponent from "../../../components/LoadingComponent";

export default function WoundList() {
  const { id } = useLocalSearchParams(); // ID del paciente
  const router = useRouter();
  const [wounds, setWounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    if (id) {
      fetchWounds(id);
    }
  }, [id]);

  const fetchWounds = async (patientId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/wounds/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { patient: patientId },
      });
      setWounds(response.data);
    } catch (error) {
      console.error("Error al obtener heridas:", error);
      setError("No se pudieron cargar las heridas.");
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View style={styles.container}>
        <View style={styles.nameRow}>
          <BackBtn />
          <Text style={styles.title}>Lista de Heridas</Text>
        </View>

        {/* Botón para agregar nueva herida */}
        {!loading && !error && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push({ pathname: `/patient/AddWound`, params: { id } })}
          >
            <Ionicons name="add-circle-outline" size={24} color={Colors.neutralWhite} />
            <Text style={styles.addButtonText}>Agregar Nueva Herida</Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <LoadingComponent message="Cargando heridas..." />
        ) : error ? (
          <ErrorComponent errorMessage={error} onRetry={() => fetchWounds(id)} />
        ) : wounds.length === 0 ? (
          <View style={styles.noWoundsContainer}>
            <Image source={require('../../../assets/images/no-patient.png')} style={styles.noWoundsImage} />
            <Text style={styles.noWoundsText}>No hay heridas registradas.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.selectTitle}>Selecciona una herida</Text>
            <FlatList
              data={wounds}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.woundItem}>
                  <View style={styles.woundInfo}>
                    <Text style={styles.woundText}>Localización: {item.wound_location}</Text>
                    <Text style={styles.woundDate}>
                      Fecha de origen: {new Date(item.wound_origin_date).toLocaleDateString("es-ES")}
                    </Text>
                    <Text style={styles.woundOrigin}>Origen: {item.wound_origin}</Text>
                  </View>

                  {/* Botón para agregar una nueva curación a esta herida */}
                  <TouchableOpacity
                    style={styles.newCareButton}
                    onPress={() => router.push({ pathname: `/patient/AddWoundCare`, params: { id, woundId: item.id } })}
                  >
                    <Ionicons name="medkit-outline" size={20} color={Colors.neutralWhite} />
                    <Text style={styles.newCareButtonText}>Nueva Curación</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </>
        )}
      </View>
    </View>
  );
}

// 🎨 Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primaryBlue,
    marginLeft: 10,
  },
  selectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primaryBlue,
    textAlign: "center",
    marginVertical: 20,
  },
  noWoundsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noWoundsImage: {
    width: "100%",
    height: 200,
    position: "absolute",
    top: 10,
    zIndex: -1,
  },
  noWoundsText: {
    fontSize: 18,
    color: Colors.neutralGray,
    textAlign: "center",
  },
  woundItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: Colors.secondaryLightBlue,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  woundInfo: {
    flex: 1,
  },
  woundText: {
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
  addButton: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutralWhite,
    marginLeft: 10,
  },
  newCareButton: {
    backgroundColor: Colors.primaryBlue,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  newCareButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.neutralWhite,
    marginLeft: 5,
  },
});