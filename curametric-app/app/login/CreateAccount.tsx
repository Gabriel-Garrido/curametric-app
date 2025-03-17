import React, { useState } from "react";
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
import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/authSlice";
import Colors from "../../constant/Colors";
import Header from "../../components/Header";
import BackBtn from "../../components/BackBtn";
import LoadingComponent from "../../components/LoadingComponent";
import ErrorComponent from "../../components/ErrorComponent";

export default function CreateAccount() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    firstName: null,
    lastName: null,
    email: null,
    password: null,
    confirmPassword: null,
  });
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const handleCreateUser = async () => {
    let valid = true;
    const newFieldErrors = {
      firstName: null,
      lastName: null,
      email: null,
      password: null,
      confirmPassword: null,
    };

    if (!firstName.trim()) {
      newFieldErrors.firstName = "El nombre es obligatorio.";
      valid = false;
    }
    if (!lastName.trim()) {
      newFieldErrors.lastName = "El apellido es obligatorio.";
      valid = false;
    }
    if (!email.trim()) {
      newFieldErrors.email = "El correo electrónico es obligatorio.";
      valid = false;
    }
    if (!password.trim()) {
      newFieldErrors.password = "La contraseña es obligatoria.";
      valid = false;
    }
    if (password !== confirmPassword) {
      newFieldErrors.confirmPassword = "Las contraseñas no coinciden.";
      valid = false;
    }

    setFieldErrors(newFieldErrors);

    if (!valid) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(`${BACKEND_URL}/api/create_user/`, {
        username: email,
        email: email,
        password: password,
        first_name: firstName,
        last_name: lastName,
      });

      // Iniciar sesión automáticamente después de crear el usuario
      const loginResponse = await axios.post(`${BACKEND_URL}/api/token/`, {
        username: email,
        password: password,
      });

      const { access, refresh } = loginResponse.data;

      // Guardar los tokens en el almacenamiento local
      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);

      // Obtener los datos del usuario
      const userResponse = await axios.get(`${BACKEND_URL}/api/users/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      // Actualizar el estado de autenticación en Redux
      dispatch(loginSuccess({ token: access, user: userResponse.data }));

      setLoading(false);
      Alert.alert("Éxito", "Usuario creado y sesión iniciada correctamente.");
      router.push("/"); // Redirigir a la pantalla principal
    } catch (error: any) {
      setLoading(false);
      if (error.response) {
        console.error("Error al crear el usuario:", error.response.data);
        setError(error.response.data.message || "No se pudo crear el usuario.");
      } else if (error.request) {
        console.error("Error al crear el usuario:", error.request);
        setError("No se pudo conectar con el servidor.");
      } else {
        console.error("Error al crear el usuario:", error.message);
        setError(error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Header />
        <ScrollView style={styles.container}>
          <View style={styles.nameRow}>
            <BackBtn />
            <Text style={styles.title}>Crear Nuevo Usuario</Text>
          </View>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={[styles.input, fieldErrors.firstName && styles.errorInput]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Ingresa tu nombre"
            placeholderTextColor={Colors.neutralGray}
          />
          {fieldErrors.firstName && <Text style={styles.errorText}>{fieldErrors.firstName}</Text>}

          <Text style={styles.label}>Apellido</Text>
          <TextInput
            style={[styles.input, fieldErrors.lastName && styles.errorInput]}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Ingresa tu apellido"
            placeholderTextColor={Colors.neutralGray}
          />
          {fieldErrors.lastName && <Text style={styles.errorText}>{fieldErrors.lastName}</Text>}

          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={[styles.input, fieldErrors.email && styles.errorInput]}
            value={email}
            onChangeText={setEmail}
            placeholder="Ingresa el correo electrónico"
            placeholderTextColor={Colors.neutralGray}
            keyboardType="email-address"
          />
          {fieldErrors.email && <Text style={styles.errorText}>{fieldErrors.email}</Text>}

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={[styles.input, fieldErrors.password && styles.errorInput]}
            value={password}
            onChangeText={setPassword}
            placeholder="Ingresa la contraseña"
            placeholderTextColor={Colors.neutralGray}
            secureTextEntry
          />
          {fieldErrors.password && <Text style={styles.errorText}>{fieldErrors.password}</Text>}

          <Text style={styles.label}>Confirmar Contraseña</Text>
          <TextInput
            style={[styles.input, fieldErrors.confirmPassword && styles.errorInput]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirma la contraseña"
            placeholderTextColor={Colors.neutralGray}
            secureTextEntry
          />
          {fieldErrors.confirmPassword && <Text style={styles.errorText}>{fieldErrors.confirmPassword}</Text>}

          {error && <ErrorComponent errorMessage={error} onRetry={handleCreateUser} />}

          {loading ? (
            <LoadingComponent message="Creando usuario..." />
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleCreateUser}>
              <Text style={styles.saveButtonText}>Crear Usuario</Text>
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
    paddingBottom: 30,
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
});