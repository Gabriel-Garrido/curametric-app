import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../../redux/authSlice";
import Colors from "../../constant/Colors";
import { RootState } from "../../redux/store";
import { useRouter } from "expo-router";
import LoadingComponent from "../../components/LoadingComponent";
import ErrorComponent from "../../components/ErrorComponent";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    scopes: ["profile", "email"],
    responseType: "id_token",
  });

  useEffect(() => {
    if (isAuthenticated && user && token) {
      router.push("/(tabs)");
    }
  }, [isAuthenticated, user, token]);

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.params?.id_token;
      if (idToken) handleGoogleLogin(idToken);
      else console.error("No se recibió un ID Token");
    }
  }, [response]);

  const handleGoogleLogin = async (googleToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/google-login/`, {
        token: googleToken,
      });
      const userRes = await axios.get(`${BACKEND_URL}/api/users/me/`, {
        headers: { Authorization: `Bearer ${res.data.jwt}` },
      });
      dispatch(loginSuccess({ token: res.data.jwt, user: userRes.data }));
    } catch (error) {
      console.error("Error de autenticación:", error);
      setError("No se pudo autenticar con Google");
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/token/`, {
        username: email,
        password: password,
      });
      const userRes = await axios.get(`${BACKEND_URL}/api/users/me/`, {
        headers: { Authorization: `Bearer ${res.data.access}` },
      });
      dispatch(loginSuccess({ token: res.data.access, user: userRes.data }));
    } catch (error) {
      console.error("Error de autenticación:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setError("Credenciales inválidas. Por favor, verifica tu correo electrónico y contraseña.");
        } else {
          setError("Error del servidor. Por favor, intenta nuevamente más tarde.");
        }
      } else if (error.request) {
        setError("No se pudo conectar con el servidor. Por favor, intente nuevamente.");
      } else {
        setError("Ocurrió un error inesperado. Por favor, intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={Platform.OS === "web" ? styles.containerWeb : styles.container}>
      <Image
        source={require("../../assets/images/background-login.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      <Text style={styles.title}>Te damos la bienvenida a CuraMetric</Text>
      <View style={styles.formContainer}>
        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor={Colors.neutralGray}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor={Colors.neutralGray}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
        {loading ? (
          <LoadingComponent message="Iniciando sesión..." />
        ) : (
          <>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleManualLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createUserBtn}
              onPress={() => router.push("../login/CreateAccount")}
            >
              <Text style={styles.createUserBtnText}>Crear nuevo usuario</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => promptAsync()}
              disabled={!request || loading}
            >
              <Image
                source={require("../../assets/images/google-logo.png")}
                style={{ width: 30, height: 30 }}
              />
              <Text style={styles.googleButtonText}>Iniciar sesión con Google</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  containerWeb: { 
    flex: 1, 
    maxWidth: 500, 
    margin: "auto", 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  formContainer: {
    width: "100%",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 10,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors.primaryBlue,
    textAlign: "center",
    marginBottom: 30,
    marginHorizontal: 30,
  },
  input: {
    backgroundColor: Colors.neutralWhite,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: Colors.neutralDarkGray,
  },
  loginButton: {
    backgroundColor: Colors.primaryBlue,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    color: Colors.neutralWhite,
    fontSize: 18,
    fontWeight: "bold",
  },
  googleButton: {
    backgroundColor: "#4285F4",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "center",
  },
  googleButtonText: {
    color: Colors.neutralWhite,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  createUserBtn: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: Colors.neutralWhite,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  createUserBtnText: {
    color: Colors.primaryBlue,
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 20,
    textAlign: "center",
  },
});