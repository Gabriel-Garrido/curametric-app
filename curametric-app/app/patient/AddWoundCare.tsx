import React, { useEffect, useState } from "react";
import {
  View,
  Text,
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
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { checkToken } from "../../utils/authUtils";
import { logout } from "../../redux/authSlice";
import ErrorComponent from "../../components/ErrorComponent";
import LoadingComponent from "../../components/LoadingComponent";
import DateField from "../../components/DateField";
import IaSection from "../../components/IaSection";

import WoundSizeSection from "../../components/AddWoundCare/WoundSizeSection";
import SurroundingsSection from "../../components/AddWoundCare/SurroundingsSection";
import TissueSection from "../../components/AddWoundCare/TissueSection";
import CareDetailsSection from "../../components/AddWoundCare/CareDetailsSection";

const TOTAL_SECTIONS = 4;

export default function AddWoundCare() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id, woundId } = useLocalSearchParams();
  const token = useSelector((state: any) => state.auth.token);
  const user = useSelector((state: any) => state.auth.user);
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

  // Secciones del formulario
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de los campos
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [depth, setDepth] = useState("");
  const [granulationTissue, setGranulationTissue] = useState("");
  const [slough, setSlough] = useState("");
  const [necroticTissue, setNecroticTissue] = useState("");
  const [borders, setBorders] = useState("");
  const [surroundingSkin, setSurroundingSkin] = useState("");
  const [edema, setEdema] = useState("");
  const [exudateAmount, setExudateAmount] = useState("");
  const [exudateType, setExudateType] = useState("");
  const [debridement, setDebridement] = useState(false);
  const [primaryDressing, setPrimaryDressing] = useState("");
  const [secondaryDressing, setSecondaryDressing] = useState("");
  const [nextCareDate, setNextCareDate] = useState(new Date());
  const [careNotes, setCareNotes] = useState("");
  const [pain, setPain] = useState("");
  const [skinProtection, setSkinProtection] = useState("");
  const [cleaningSolution, setCleaningSolution] = useState("");
  const [woundPhoto, setWoundPhoto] = useState("");

  // Errores
  const [errors, setErrors] = useState({
    width: null,
    height: null,
    depth: null,
    granulationTissue: null,
    slough: null,
    necroticTissue: null,
    borders: null,
    surroundingSkin: null,
    edema: null,
    exudateAmount: null,
    exudateType: null,
  });

    useEffect(() => {
      const verifyToken = async () => {
        if (!isAuthenticated || !user || !token) {
          dispatch(logout());
          router.replace("/login/LoginScreen");
        }
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

  // Validaciones
  const isNumeric = (value: string) => /^\d+(\.\d+)?$/.test(value);
  const validateField = (value: string, fieldName: string, numeric = false) => {
    if (numeric && !isNumeric(value)) {
      setErrors((prev) => ({ ...prev, [fieldName]: "Debe ser numérico." }));
      return false;
    } else if (!value) {
      setErrors((prev) => ({ ...prev, [fieldName]: "Campo obligatorio." }));
      return false;
    }
    setErrors((prev) => ({ ...prev, [fieldName]: null }));
    return true;
  };

  /**
   * Valida solo los campos de la sección actual.
   * Retorna true si se validan todos correctamente; false si hay algún error.
   */
  const validateCurrentSection = () => {
    let valid = true;
    switch (currentSection) {
      case 0: // Sección WoundSizeSection
        if (!validateField(width, "width", true)) valid = false;
        if (!validateField(height, "height", true)) valid = false;
        if (!validateField(depth, "depth", true)) valid = false;
        break;
      case 1: // Sección TissueSection
        if (!validateField(granulationTissue, "granulationTissue", true)) valid = false;
        if (!validateField(slough, "slough", true)) valid = false;
        if (!validateField(necroticTissue, "necroticTissue", true)) valid = false;
        // Checar que no exceda 100%
        const totalTissue =
          parseFloat(granulationTissue || "0") +
          parseFloat(slough || "0") +
          parseFloat(necroticTissue || "0");
        if (totalTissue > 100) {
          Alert.alert("Error", "La suma de tejidos no puede exceder 100%.");
          valid = false;
        }
        break;
      case 2: // Sección SurroundingsSection
        if (!validateField(borders, "borders")) valid = false;
        if (!validateField(surroundingSkin, "surroundingSkin")) valid = false;
        if (!validateField(edema, "edema")) valid = false;
        if (!validateField(exudateAmount, "exudateAmount")) valid = false;
        if (!validateField(exudateType, "exudateType")) valid = false;
        break;
      case 3: // Sección final (CareDetailsSection)
        // Aquí podrías añadir validaciones específicas si fuese necesario.
        // Ejemplo: Validar apósitos, fecha, etc.
        // (En este caso, no están definidas como requeridas, así que las omitimos.)
        break;
      default:
        break;
    }
    return valid;
  };

  const handleNextSection = () => {
    if (!validateCurrentSection()) return;
    if (currentSection < TOTAL_SECTIONS - 1) {
      setCurrentSection((s) => s + 1);
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection((s) => s - 1);
    }
  };

  const handleSaveWoundCare = async () => {
    // Validar la última sección antes de guardar
    if (!validateCurrentSection()) return;

    if (!id || !woundId) {
      Alert.alert("Error", "No se encontró el ID del paciente o la herida.");
      return;
    }

    setLoading(true);
    setError(null);

    const woundCareData = {
      patient: id,
      wound: woundId,
      width: parseFloat(width),
      height: parseFloat(height),
      depth: parseFloat(depth),
      borders,
      surrounding_skin: surroundingSkin,
      exudate_amount: exudateAmount,
      exudate_type: exudateType,
      edema,
      granulation_tissue: parseFloat(granulationTissue),
      slough: parseFloat(slough),
      necrotic_tissue: parseFloat(necroticTissue),
      debridement,
      primary_dressing: primaryDressing,
      secondary_dressing: secondaryDressing,
      next_care_date: nextCareDate.toISOString().split("T")[0],
      care_notes: careNotes,
      wound_pain: pain,
      skin_protection: skinProtection,
      wound_cleaning_solution: cleaningSolution,
      wound_photo: woundPhoto,
      created_by: user?.id,
      updated_by: user?.id,
    };

    try {
      await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/woundcares/`, woundCareData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoading(false);
      Alert.alert("Éxito", "Curación agregada.");
      router.push(`/patient/${id}/History`);
    } catch {
      setLoading(false);
      setError("No se pudo guardar la curación. Intenta nuevamente.");
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSaveWoundCare();
  };

  // Cálculo simple para la barra de progreso
  const progressPercent = ((currentSection + 1) / TOTAL_SECTIONS) * 100;

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Header />
        <ScrollView style={styles.container}>
          <View style={styles.nameRow}>
            <BackBtn />
            <Text style={styles.title}>Nueva Curación</Text>
          </View>

          {/* Barra de progreso */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            <Text style={styles.progressText}>
              {`Sección ${currentSection + 1} de ${TOTAL_SECTIONS}`}
            </Text>
          </View>

          {/* Secciones del formulario */}
          {currentSection === 0 && (
            <WoundSizeSection
              width={width}
              setWidth={setWidth}
              height={height}
              setHeight={setHeight}
              depth={depth}
              setDepth={setDepth}
              errors={errors}
            />
          )}

          {currentSection === 1 && (
            <TissueSection
              granulationTissue={granulationTissue}
              setGranulationTissue={setGranulationTissue}
              slough={slough}
              setSlough={setSlough}
              necroticTissue={necroticTissue}
              setNecroticTissue={setNecroticTissue}
              errors={errors}
            />
          )}

          {currentSection === 2 && (
            <SurroundingsSection
              borders={borders}
              setBorders={setBorders}
              surroundingSkin={surroundingSkin}
              setSurroundingSkin={setSurroundingSkin}
              edema={edema}
              setEdema={setEdema}
              exudateAmount={exudateAmount}
              setExudateAmount={setExudateAmount}
              exudateType={exudateType}
              setExudateType={setExudateType}
              errors={errors}
            />
          )}

          {currentSection === 3 && (
            <CareDetailsSection
              debridement={debridement}
              setDebridement={setDebridement}
              primaryDressing={primaryDressing}
              setPrimaryDressing={setPrimaryDressing}
              secondaryDressing={secondaryDressing}
              setSecondaryDressing={setSecondaryDressing}
              nextCareDate={nextCareDate}
              setNextCareDate={setNextCareDate}
              careNotes={careNotes}
              setCareNotes={setCareNotes}

              // Pasamos los nuevos estados
              woundPain={pain}
              setWoundPain={setPain}
              skinProtection={skinProtection}
              setSkinProtection={setSkinProtection}
              cleaningSolution={cleaningSolution}
              setCleaningSolution={setCleaningSolution}
              woundPhoto={woundPhoto}
              setWoundPhoto={setWoundPhoto}
            />
          )}

          {error && <ErrorComponent errorMessage={error} onRetry={handleRetry} />}

          {/* Mostrar IaSection solo si estamos en la última sección */}
          {currentSection === 3 && (
            <IaSection
              woundCareData={{
                width,
                height,
                depth,
                borders,
                surroundingSkin,
                exudateAmount,
                exudateType,
                edema,
                granulationTissue,
                slough,
                necroticTissue,
                debridement,
                primaryDressing,
                secondaryDressing,
                nextCareDate,
                careNotes,
              }}
            />
          )}

          {/* Botones de navegación y guardar */}
          {loading ? (
            <LoadingComponent message="Guardando curación..." />
          ) : (
            <View style={styles.navigationContainer}>
              {currentSection > 0 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.previousButton]}
                  onPress={handlePreviousSection}
                >
                  <Text style={styles.previousButtonText}>← Anterior</Text>
                </TouchableOpacity>
              )}
              {currentSection < 3 ? (
                <TouchableOpacity
                  style={[styles.navButton, styles.nextButton]}
                  onPress={handleNextSection}
                >
                  <Text style={styles.nextButtonText}>Siguiente →</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.navButton, styles.saveButton]}
                  onPress={handleSaveWoundCare}
                >
                  <Text style={styles.saveButtonText}>Guardar Curación</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
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
  progressBarContainer: {
    marginVertical: 10,
    backgroundColor: Colors.borderGray,
    height: 20,
    borderRadius: 10,
    position: "relative",
    justifyContent: "center",
  },
  progressBarFill: {
    backgroundColor: Colors.primaryBlue,
    height: "100%",
    borderRadius: 10,
    position: "absolute",
    left: 0,
    top: 0,
  },
  progressText: {
    alignSelf: "center",
    fontSize: 12,
    color: Colors.neutralWhite,
    fontWeight: "600",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 12,
  },
  nextButton: {
    backgroundColor: Colors.primaryBlue,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutralWhite,
  },
  previousButton: {
    backgroundColor: Colors.neutralGray,
  },
  previousButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutralWhite,
  },
  saveButton: {
    backgroundColor: Colors.primaryGreen,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutralWhite,
  },
});