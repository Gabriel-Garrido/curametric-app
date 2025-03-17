import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "../../components/Header";
import BackBtn from "../../components/BackBtn";
import Colors from "../../constant/Colors";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { checkToken } from "../../utils/authUtils";
import { logout } from "../../redux/authSlice";
import LoadingComponent from "../../components/LoadingComponent";
import ErrorComponent from "../../components/ErrorComponent";

interface WoundCare {
  id: number;
  created_at?: string;
  width?: number;
  height?: number;
  depth?: number;
  granulation_tissue?: number;
  slough?: number;
  necrotic_tissue?: number;
}

export default function WoundCareHistory() {
  const { id, woundId } = useLocalSearchParams();
  const [woundCareHistory, setWoundCareHistory] = useState<WoundCare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string>("");
  const [woundLocation, setWoundLocation] = useState<string>("");
  const router = useRouter();

  const token = useSelector((state: any) => state.auth.token);
  const user = useSelector((state: any) => state.auth.user);

  const dispatch = useDispatch();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await checkToken(dispatch);
      } catch (error) {
        console.error("Error verifying token:", error);
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [dispatch, router]);

  useEffect(() => {
    if (!token || !user) {
      router.push("/login/LoginScreen");
    }
  }, [token, user, router]);

  useEffect(() => {
    if (!id || !woundId) {
      setError("No se encontraron los datos de la herida.");
      setLoading(false);
      return;
    }
    fetchPatientData(id as string);
    fetchWoundData(woundId as string);
    fetchWoundCareHistory(id as string, woundId as string);
  }, [id, woundId]);

  const fetchPatientData = async (patientId: string) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/patients/${patientId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPatientName(response.data.first_name + " " + response.data.last_name);
    } catch (err) {
      setError("No se pudo obtener los datos del paciente.");
    }
  };

  const fetchWoundData = async (aWoundId: string) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/wounds/${woundId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setWoundLocation(response.data.wound_location);
    } catch (err) {
      setError("No se pudo obtener los datos de la herida.");
    }
  };

  const fetchWoundCareHistory = async (patientId: string, aWoundId: string) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/woundcares/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            patient: patientId,
            wound: aWoundId,
          },
        }
      );
      setWoundCareHistory(response.data || []);
    } catch (err) {
      setError("No se pudo obtener el historial de curaciones.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundLight }}>
      <Header />
      <View style={styles.container}>
        <View style={styles.nameRow}>
          <BackBtn />
          <Text style={styles.title}>Evolución de la Herida</Text>
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patientName}</Text>
          <Text style={styles.woundLocation}>{woundLocation}</Text>
        </View>
        {loading ? (
          <LoadingComponent message="Cargando historial de curaciones..." />
        ) : error ? (
          <ErrorComponent errorMessage={error} onRetry={() => fetchWoundCareHistory(id as string, woundId as string)} />
        ) : woundCareHistory.length > 0 ? (
          <ScrollView nestedScrollEnabled={true}>
            <Text style={styles.sectionTitle}>Historial de Curaciones</Text>
            <FlatList
              scrollEnabled={false}
              data={woundCareHistory}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.woundCareItem}>
                  <Text style={styles.woundCareDate}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Fecha desconocida"}
                  </Text>
                  <Text style={styles.sectionTitle}>Tamaño:</Text>
                  <Text style={styles.detailText}>
                    Ancho: {item.width} cm | Alto: {item.height} cm |
                    Profundidad: {item.depth} cm
                  </Text>
                  <Text style={styles.sectionTitle}>Tejidos:</Text>
                  <Text style={styles.detailText}>
                    Granulación: {item.granulation_tissue}% | Esfacelado:{" "}
                    {item.slough}% | Necrótico: {item.necrotic_tissue}%
                  </Text>
                </View>
              )}
            />
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No hay curaciones registradas.</Text>
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primaryBlue,
    marginLeft: 10,
  },
  patientInfo: {
    marginTop: 20,
    alignItems: "center",
  },
  patientName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primaryBlue,
  },
  woundLocation: {
    fontSize: 18,
    color: Colors.neutralDarkGray,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.neutralDarkGray,
    marginTop: 10,
  },
  woundCareItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: Colors.secondaryLightBlue,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  woundCareDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primaryBlue,
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: Colors.neutralGray,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.neutralGray,
    textAlign: "center",
    marginTop: 20,
  },
});