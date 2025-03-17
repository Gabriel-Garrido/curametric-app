import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import axios from "axios";
import Header from "../../components/Header";
import Colors from "../../constant/Colors";
import DateField from "../../components/DateField";
import BackBtn from "../../components/BackBtn";
import LoadingComponent from "../../components/LoadingComponent";
import ErrorComponent from "../../components/ErrorComponent";

function showAlert(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

const formatRut = (rut: string) => {
  const cleanRut = rut
    .replace(/\./g, "")
    .replace(/-/g, "")
    .replace(/[^0-9Kk]/g, "");
  if (cleanRut.length <= 1) return cleanRut;
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formattedBody}-${dv}`;
};

const validateRut = (rut: string) => {
  const cleanRut = rut.replace(/\./g, "").replace("-", "").toUpperCase();
  if (cleanRut.length < 2) return false;
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier < 7 ? multiplier + 1 : 2;
  }
  let calculatedDv = (11 - (sum % 11)).toString();
  calculatedDv =
    calculatedDv === "11" ? "0" : calculatedDv === "10" ? "K" : calculatedDv;
  return dv === calculatedDv;
};

const relevantConditionsList = [
  "Diabetes Mellitus",
  "Insuficiencia Venosa Crónica",
  "Insuficiencia Arterial Periférica",
  "Hipertensión Arterial",
  "Obesidad",
  "Insuficiencia Renal Crónica",
  "Cirrosis Hepática",
  "Artritis Reumatoide",
  "Cáncer en tratamiento activo",
  "Trastornos Autoinmunes",
  "Enfermedad Pulmonar Crónica",
  "Cardiopatías Graves",
];

const predispositionsList = [
  "Tabaquismo",
  "Alcoholismo Crónico",
  "Drogadicción",
  "Inmovilidad",
  "Desnutrición",
  "Uso prolongado de Corticosteroides",
  "Uso de Inmunosupresores",
  "Radioterapia/Quimioterapia reciente",
];

export default function NewPatient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rut, setRut] = useState("");
  const [rutError, setRutError] = useState("");
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [selectedRelevantConditions, setSelectedRelevantConditions] = useState<
    string[]
  >([]);
  const [selectedPredispositions, setSelectedPredispositions] = useState<
    string[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const token = useSelector((state: any) => state.auth.token);
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    if (!token || !user) {
      router.push("/login/LoginScreen");
    }
  }, [token]);

  const handleFirstNameChange = (text: string) => {
    const words = text.split(" ");
    const capitalizedWords = words.map((w) =>
      w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""
    );
    setFirstName(capitalizedWords.join(" "));
  };

  const handleLastNameChange = (text: string) => {
    const words = text.split(" ");
    const capitalizedWords = words.map((w) =>
      w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""
    );
    setLastName(capitalizedWords.join(" "));
  };

  const handleRutChange = (text: string) => {
    const formattedRut = formatRut(text);
    setRut(formattedRut);
    if (!validateRut(formattedRut)) {
      setRutError("RUT inválido.");
    } else {
      setRutError("");
    }
  };

  const handleRelevantConditionToggle = (
    condition: string,
    isChecked: boolean
  ) => {
    if (isChecked) {
      setSelectedRelevantConditions((prev) => [...prev, condition]);
    } else {
      setSelectedRelevantConditions((prev) =>
        prev.filter((item) => item !== condition)
      );
    }
  };

  const handlePredispositionToggle = (
    condition: string,
    isChecked: boolean
  ) => {
    if (isChecked) {
      setSelectedPredispositions((prev) => [...prev, condition]);
    } else {
      setSelectedPredispositions((prev) =>
        prev.filter((item) => item !== condition)
      );
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    if (!token || !user) {
      showAlert("Error", "No se ha iniciado sesión.");
      router.push("/login/LoginScreen");
      return;
    }

    if (!firstName.trim()) {
      setError("El nombre no puede estar vacío.");
      setLoading(false);
      return;
    }
    if (!lastName.trim()) {
      setError("El apellido no puede estar vacío.");
      setLoading(false);
      return;
    }
    if (!validateRut(rut)) {
      setError("Debe ingresar un RUT válido.");
      setLoading(false);
      return;
    }
    if (!dob || isNaN(dob.getTime())) {
      setError("Debe ingresar una fecha de nacimiento válida.");
      setLoading(false);
      return;
    }

    const patientData = {
      first_name: firstName,
      last_name: lastName,
      rut,
      birth_date: dob.toISOString().split("T")[0],
      chronic_diseases: selectedRelevantConditions,
      predispositions: selectedPredispositions,
      created_by: user?.id,
      updated_by: user?.id,
    };

    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/patients/`,
        patientData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);
      showAlert("Éxito", "Paciente guardado correctamente.");
      router.push("/(tabs)/PatientList");
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView style={styles.container}>
        <View style={styles.headerRow}>
          <BackBtn />
          <Text style={styles.title}>Nuevo paciente</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>Nombre del paciente</Text>
          <TextInput
            style={[styles.input, error && styles.errorInput]}
            placeholder="Ingresa el nombre completo"
            value={firstName}
            onChangeText={handleFirstNameChange}
            placeholderTextColor={Colors.neutralGray}
          />
          <Text style={styles.label}>Apellido del paciente</Text>
          <TextInput
            style={[styles.input, error && styles.errorInput]}
            placeholder="Ingresa el apellido"
            value={lastName}
            onChangeText={handleLastNameChange}
            placeholderTextColor={Colors.neutralGray}
          />
          <Text style={styles.label}>Rut del paciente</Text>
          <TextInput
            style={[styles.input, rutError && { borderColor: "red" }]}
            placeholder="12.345.678-9"
            value={rut}
            onChangeText={handleRutChange}
            placeholderTextColor={Colors.neutralGray}
          />
          {rutError ? <Text style={styles.errorText}>{rutError}</Text> : null}
          <Text style={styles.label}>Fecha de nacimiento del paciente</Text>
          <DateField dateValue={dob} onDateChange={setDob} />
          {dob === undefined && <Text style={styles.errorText}>Debe ingresar una fecha de nacimiento válida.</Text>}
          <Text style={styles.label}>Condiciones crónicas</Text>
          {relevantConditionsList.map((condition) => (
            <TouchableOpacity
              key={condition}
              style={[
                styles.checkboxContainer,
                selectedRelevantConditions.includes(condition) && styles.selectedCheckboxContainer,
              ]}
              onPress={() =>
                handleRelevantConditionToggle(
                  condition,
                  !selectedRelevantConditions.includes(condition)
                )
              }
            >
              <Text
                style={[
                  styles.checkboxLabel,
                  selectedRelevantConditions.includes(condition) && styles.selectedCheckboxLabel,
                ]}
              >
                {condition}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={[styles.label, { marginTop: 10 }]}>
            Condiciones predisponentes
          </Text>
          {predispositionsList.map((condition) => (
            <TouchableOpacity
              key={condition}
              style={[
                styles.checkboxContainer,
                selectedPredispositions.includes(condition) && styles.selectedCheckboxContainer,
              ]}
              onPress={() =>
                handlePredispositionToggle(
                  condition,
                  !selectedPredispositions.includes(condition)
                )
              }
            >
              <Text
                style={[
                  styles.checkboxLabel,
                  selectedPredispositions.includes(condition) && styles.selectedCheckboxLabel,
                ]}
              >
                {condition}
              </Text>
            </TouchableOpacity>
          ))}
          {error && <ErrorComponent errorMessage={error} onRetry={handleSave} />}
          {loading ? (
            <LoadingComponent message="Guardando paciente..." />
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutralWhite,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 0,
    color: Colors.primaryBlue,
    marginBottom: 5,
  },
  form: {
    marginTop: 10,
    paddingBottom: 50,
    marginBottom: 20,
    padding: 5,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.neutralDarkGray,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.neutralWhite,
    marginBottom: 15,
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    padding: 10,
    borderRadius: 20,
    backgroundColor: Colors.neutralWhite,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  selectedCheckboxContainer: {
    backgroundColor: Colors.primaryBlue,
  },
  checkboxLabel: {
    fontSize: 16,
    color: Colors.neutralDarkGray,
  },
  selectedCheckboxLabel: {
    color: Colors.neutralWhite,
  },
  saveButton: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutralWhite,
  },
});