import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../utils/AuthContext";
import Header from "../../components/Header";
import Colors from "../../constant/Colors";
import axios from "axios";
import LoadingComponent from "../../components/LoadingComponent";
import ErrorComponent from "../../components/ErrorComponent";
import { checkToken } from "../../utils/authUtils";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, user, token } = useAuth();
  const [woundCares, setWoundCares] = useState<WoundCare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(woundCares);
  

  interface WoundCare {
    [x: string]: any;
    id: number;
    patient_first_name: string;
    patient_last_name: string;
    wound: {
      wound_location: string;
    };
    created_at: string;
  }

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const dispatch = useDispatch();
  
    useEffect(() => {
      if (!isAuthenticated || !user || !token) {
        dispatch(logout());
        router.replace("/login/LoginScreen");
      }
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
    }, []);
  
  const fetchWoundCares = async () => {
    setLoading(true);
    setError(null);
    try {
      await checkToken(dispatch);
    } catch (error) {
      console.error("Error verifying token:", error);
      dispatch(logout());
    } finally {
      setLoading(false);
    }
    try {
      const response = await axios.get(`${BACKEND_URL}/api/woundcares/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedWoundCares = response.data.sort((a: WoundCare, b: WoundCare) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setWoundCares(sortedWoundCares.slice(0, 5));
    } catch (error) {
      console.error("Error al obtener las curaciones:", error);
      if (error.response) {
        setError("Error del servidor. Por favor, intenta nuevamente más tarde.");
      } else if (error.request) {
        setError("No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.");
      } else {
        setError("Ocurrió un error inesperado. Por favor, intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWoundCares();
    }
  }, [token]);

  if (loading) {
    return <LoadingComponent message="Cargando Home..." />;
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Header />
        <Image
          source={require("../../assets/images/background-login.png")}
          style={{ width: "100%", height: "100%", position: "absolute", top: 0, zIndex: -1, opacity: 0.3 }}
        />
        <View style={styles.container}>
          <Text style={styles.welcomeText}>Hola {user.first_name}</Text>
          <Text style={styles.subtitle}>Te damos la bienvenida a CuraMetric</Text>

          {loading ? (
            <LoadingComponent message="Cargando datos..." />
          ) : error ? (
            <ErrorComponent errorMessage={error} onRetry={fetchWoundCares} />
          ) : (
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
                <TouchableOpacity
                  style={[styles.button, { flex: 1, marginRight: 10 }]}
                  onPress={() => { router.push("/PatientList"); }}
                >
                  <Text style={styles.buttonText}>📋 Ver lista de pacientes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { flex: 1, marginLeft: 10 }]}
                  onPress={() => { router.push("/patient/NewPatient"); }}
                >
                  <Text style={styles.buttonText}>➕ Agregar nuevo paciente</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{woundCares.length}</Text>
                  <Text style={styles.statLabel}>Curaciones registradas</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Últimas curaciones</Text>
              {woundCares.length === 0 ? (
                <Text style={styles.emptyText}>No has registrado curaciones aún.</Text>
              ) : (
                <FlatList
                  data={woundCares}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.woundCareItem}
                      onPress={() => { router.push(`/patient/${item.id}/`) }}
                    >
                      <Text style={styles.woundCareText}>
                        {item.woundData.patientData.first_name} {item.woundData.patientData.last_name} - {item.woundData.wound_location}
                      </Text>
                      <Text style={styles.woundCareDate}>
                        {new Date(item.created_at).toLocaleDateString("es-ES")}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutralWhite,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    marginTop: 200,
    marginHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primaryBlue,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.neutralGray,
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.neutralWhite,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.secondaryLightBlue,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primaryBlue,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.neutralGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  woundCareItem: {
    backgroundColor: Colors.neutralWhite,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    marginBottom: 10,
  },
  woundCareText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  woundCareDate: {
    fontSize: 14,
    color: Colors.neutralGray,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
  },
});