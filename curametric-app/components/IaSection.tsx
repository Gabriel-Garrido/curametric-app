import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Alert } from "react-native";
import axios from "axios";
import Colors from "../constant/Colors";
import { useSelector, useDispatch } from "react-redux";
import { checkToken } from "../utils/authUtils";
import { logout } from "../redux/authSlice";

interface IaSectionProps {
  woundCareData: any;
}

const IaSection: React.FC<IaSectionProps> = ({ woundCareData }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;


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
        Alert.alert("Error", "Sesión expirada. Por favor, inicia sesión nuevamente.");
      }
    };
    verifyToken();
  }, [dispatch]);

  const handleConsultIa = async () => {
    if (!token || !user) {
      Alert.alert("Error", "No se ha iniciado sesión.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const prompt = `
      Analiza los siguientes datos de una herida y proporciona recomendaciones en una respuesta en **formato JSON** sin textos, solo json. 
      **Debe devolver únicamente un JSON** con los siguientes elementos:
      - **woundDescription**: descripción breve (máximo 4 líneas), redactado como registro de enfermera, incorporando los datos entregados de forma ordenada y completa.
      - **apósitoPrimario**: tipo de apósito recomendado. en esta forma 'nombre del aposito' seguido de 'fundamentos de la elección del aposito'. ejemplo: ""Apósito de plata, ya que tiene propiedades antimicrobianas y la herida presenta signos de infección"".
      - **apósitoSecundario**: tipo de apósito secundario recomendado.en esta forma 'nombre del aposito' seguido de 'fundamentos de la elección del aposito'. Ejemplo ""Apósito de espuma, ya la herida tiene exudado moderado (++) y este apósito absorbe el exudado y mantiene un ambiente húmedo"".
      - **frecuenciaDeCuraciones**: frecuencia recomendada de curaciones. en esta forma 'curación cada X días' seguido de 'fundamentos de la elección de la frecuencia'. Ejemplo ""Curación cada 3 días, ya que el apósito primario recomendado tiene una duración de 3 días"".
      **no debe contener nada fuera de un JSON** y no debe comenzar con ${'```json'}. La respuesta debe comenzar con '{' y terminar con '}'.
      
      **Datos de la herida:**
      ${JSON.stringify(woundCareData, null, 2)}
      `;

      const result = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
        { role: "system", content: "Eres un asistente experto en curaciones de heridas actualizado a 2025 y trabajando segun las mejores practicas en curaciones ." },
        { role: "user", content: prompt },
        ],
      },
      {
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
      }
      );

      const responseText = result.data.choices[0].message.content.trim();
      console.log("Respuesta de la IA:", responseText); // Imprimir la respuesta completa para depuración

      // Intentamos parsear la respuesta a JSON
      try {
        const jsonResponse = JSON.parse(responseText);
        setResponse(jsonResponse);
      } catch (jsonError) {
        console.error("Error al parsear JSON:", jsonError);
        setError("Error en el formato de la respuesta de IA.");
      }

    } catch (err) {
      console.error("Error al consultar ChatGPT:", err);
      setError("No se pudo obtener una respuesta. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setModalVisible(true);
    handleConsultIa();
  };

  const closeModal = () => {
    setModalVisible(false);
    setResponse(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.consultButton} onPress={openModal}>
        <Text style={styles.consultButtonText}>Consultar IA</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Consulta IA</Text>
            {loading && <ActivityIndicator size="large" color={Colors.primaryBlue} />}

            {response && (
              <View style={styles.responseContainer}>
                <Text style={styles.responseText}><Text style={styles.bold}>Descripción:</Text> {response.woundDescription}</Text>
                <Text style={styles.responseText}><Text style={styles.bold}>Apósito Primario:</Text> {response.apósitoPrimario}</Text>
                <Text style={styles.responseText}><Text style={styles.bold}>Apósito Secundario:</Text> {response.apósitoSecundario}</Text>
                <Text style={styles.responseText}><Text style={styles.bold}>Frecuencia de Curaciones:</Text> {response.frecuenciaDeCuraciones}</Text>
              </View>
            )}

            {error && (
              <>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleConsultIa}>
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: Colors.neutralWhite,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primaryBlue,
    marginBottom: 10,
  },
  consultButton: {
    backgroundColor: Colors.primaryBlue,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  consultButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutralWhite,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: Colors.neutralWhite,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  responseContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.secondaryLightBlue,
    width: "100%",
  },
  responseText: {
    fontSize: 16,
    color: Colors.neutralDarkGray,
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: "green",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutralWhite,
  },
  closeButton: {
    backgroundColor: Colors.primaryBlue,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutralWhite,
  },
});

export default IaSection;