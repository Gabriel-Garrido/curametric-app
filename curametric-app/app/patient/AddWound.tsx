import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Header from "../../components/Header";
import Colors from "../../constant/Colors";
import BackBtn from "../../components/BackBtn";
import DateField from "../../components/DateField";
import PickerComponent from "../../components/PickerComponent";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { checkToken } from "../../utils/authUtils";
import { logout } from "../../redux/authSlice";
import ErrorComponent from "../../components/ErrorComponent";
import LoadingComponent from "../../components/LoadingComponent";

export default function AddWound() {
  const { id } = useLocalSearchParams(); // ID del paciente
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos del formulario
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date()); // Fecha actual por defecto
  const [origin, setOrigin] = useState(""); // Picker

  const [locationError, setLocationError] = useState<string | null>(null);
  const [originError, setOriginError] = useState<string | null>(null);

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

  // Función para guardar la herida en el backend
  const handleSaveWound = async () => {
    if (!id) {
      Alert.alert("Error", "No se encontró el ID del paciente.");
      return;
    }

    // Validación de campos obligatorios
    let valid = true;
    if (!location.trim()) {
      setLocationError("La localización de la herida es obligatoria.");
      valid = false;
    } else {
      setLocationError(null);
    }

    if (!origin) {
      setOriginError("El origen de la herida es obligatorio.");
      valid = false;
    } else {
      setOriginError(null);
    }

    if (!valid) {
      return;
    }

    setLoading(true);
    setError(null);

    const woundData = {
      patient: Number(id),
      wound_location: location,
      wound_origin: origin,
      wound_origin_date: date.toISOString().split("T")[0],
      created_by: user?.id,
      updated_by: user?.id,
    };

    try {
      await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/wounds/`, woundData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      Alert.alert("Éxito", "Herida agregada correctamente.");
      router.push(`/patient/${id}/WoundList`);
    } catch (error: any) {
      setLoading(false);
      console.error("Error al guardar la herida:", error);
      if (error.message === "Network Error") {
        setError("No se pudo conectar con el servidor.");
      } else if (error.response && error.response.status === 403) {
        setError("No tienes permiso para realizar esta acción. Por favor, verifica tu cuenta o contacta al administrador.");
      } else {
        setError("No se pudo guardar la herida. Por favor, intenta nuevamente.");
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSaveWound();
  };

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Header />
        <ScrollView style={styles.container}>
          <View style={styles.nameRow}>
            <BackBtn />
            <Text style={styles.title}>Agregar Nueva Herida</Text>
          </View>

          <Text style={styles.label}>Localización de la herida</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Ej: Tobillo derecho"
            placeholderTextColor={Colors.neutralGray}
          />
          {locationError && <Text style={styles.errorText}>{locationError}</Text>}

          <Text style={styles.label}>Fecha de origen</Text>
          <DateField dateValue={date} onDateChange={setDate} />

          <Text style={styles.label}>Origen de la herida</Text>
          <PickerComponent
            selectedValue={origin}
            setSelectedValue={setOrigin}
            options={[
              "Lesión por presión",
              "Herida quirúrgica",
              "Quemadura",
              "Herida traumática",
              "Úlcera venosa",
              "Úlcera arterial",
              "Pie diabético",
            ]}
            label="Origen de la herida"
          />
          {originError && <Text style={styles.errorText}>{originError}</Text>}

          {error && (
            <ErrorComponent errorMessage={error} onRetry={handleRetry} />
          )}

          {loading ? (
            <LoadingComponent message="Guardando herida..." />
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveWound}>
              <Text style={styles.saveButtonText}>Guardar Herida</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primaryBlue,
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primaryBlue,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.neutralWhite,
    marginBottom: 5,
  },
  saveButton: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutralWhite,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});