//// --------------------------------------
//// CareDetailsSection.tsx
//// --------------------------------------
// filepath: /c:/Users/gabri/Desktop/Programación/Proyectos/Proyecto CuraMetric/curametric-app/components/AddWoundCare/CareDetailsSection.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import PickerComponent from "../PickerComponent";
import DateField from "../DateField";
import Colors from "../../constant/Colors";

interface Props {
  debridement: boolean;
  setDebridement: (v: boolean) => void;
  primaryDressing: string;
  setPrimaryDressing: (v: string) => void;
  secondaryDressing: string;
  setSecondaryDressing: (v: string) => void;
  nextCareDate: Date;
  setNextCareDate: (d: Date) => void;
  careNotes: string;
  setCareNotes: (v: string) => void;

  // Campos nuevos:
  woundPain: string;
  setWoundPain: (v: string) => void;
  skinProtection: string;
  setSkinProtection: (v: string) => void;
  cleaningSolution: string;
  setCleaningSolution: (v: string) => void;
  woundPhoto: string;
  setWoundPhoto: (v: string) => void;
}

const dressingCategories = [
  "Apósitos Pasivos",
  "Apósitos Interactivos",
  "Apósitos Avanzados",
  "Apósitos Antimicrobianos",
  "Apósitos Hemostáticos",
  "Apósitos Específicos",
];

const dressingOptions = {
  "Apósitos Pasivos": [
    "Gasas estériles",
    "Compresas de algodón",
    "Tull graso",
    "Películas transparentes de poliuretano",
  ],
  "Apósitos Interactivos": [
    "Hidrocoloides finos",
    "Hidrocoloides gruesos",
    "Hidrocoloides con plata",
    "Hidrogeles en gel",
    "Hidrogeles en lámina",
    "Espumas con borde adhesivo",
    "Espumas sin borde adhesivo",
    "Espumas con plata",
    "Alginato de calcio",
    "Alginato de sodio",
    "Alginato con plata",
    "Hidrofibra con plata",
    "Celulosa oxidada regenerada",
  ],
  "Apósitos Avanzados": [
    "Colágeno",
    "Matrices de regeneración dérmica",
    "Factores de crecimiento",
  ],
  "Apósitos Antimicrobianos": [
    "Apósitos con plata",
    "Apósitos con yodo",
    "Cadexómero de yodo",
    "Soluciones impregnadas en gasa",
    "PHMB",
    "Miel de Manuka",
    "Apósitos con DACC",
  ],
  "Apósitos Hemostáticos": [
    "Gasa con caolín",
    "Apósitos con quitosano",
    "Esponjas hemostáticas",
  ],
  "Apósitos Específicos": [
    "Apósitos de carbón activado",
    "Apósitos con silicona",
    "Terapia de Presión Negativa (TPN)",
    "Apósito de regeneración epidérmica",
    "Apósitos para quemaduras con sulfadiazina argéntica",
    "Apósito biológico",
  ],
};

export default function CareDetailsSection({
  debridement,
  setDebridement,
  primaryDressing,
  setPrimaryDressing,
  secondaryDressing,
  setSecondaryDressing,
  nextCareDate,
  setNextCareDate,
  careNotes,
  setCareNotes,

  woundPain,
  setWoundPain,
  skinProtection,
  setSkinProtection,
  cleaningSolution,
  setCleaningSolution,
  woundPhoto,
  setWoundPhoto,
}: Props) {
  const [primaryCategory, setPrimaryCategory] = useState("");
  const [secondaryCategory, setSecondaryCategory] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Detalles de la Curación</Text>

      {/* Campos para apósitos primario y secundario */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Apósito primario</Text>
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <PickerComponent
              selectedValue={primaryCategory}
              setSelectedValue={setPrimaryCategory}
              options={dressingCategories}
              label="Categoría"
            />
          </View>
          {primaryCategory && (
            <View style={styles.halfWidth}>
              <PickerComponent
                selectedValue={primaryDressing}
                setSelectedValue={setPrimaryDressing}
                options={dressingOptions[primaryCategory]}
                label="Específico"
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Apósito secundario</Text>
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <PickerComponent
              selectedValue={secondaryCategory}
              setSelectedValue={setSecondaryCategory}
              options={dressingCategories}
              label="Categoría"
            />
          </View>
          {secondaryCategory && (
            <View style={styles.halfWidth}>
              <PickerComponent
                selectedValue={secondaryDressing}
                setSelectedValue={setSecondaryDressing}
                options={dressingOptions[secondaryCategory]}
                label="Específico"
              />
            </View>
          )}
        </View>
      </View>

      {/* Desbridamiento y fecha de próxima curación */}
      <View style={styles.inputGroup}>
        <View style={styles.row}>
          <View style={[styles.pickerContainer, styles.halfWidth]}>
            <Text style={styles.label}>Desbridamiento</Text>
            <PickerComponent
              selectedValue={debridement ? "Sí" : "No"}
              setSelectedValue={(val) => setDebridement(val === "Sí")}
              options={["Sí", "No"]}
              label="Indique si se realizó desbridamiento en esta curación"
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.pickerContainer, styles.fullWidth]}>
            <Text style={styles.label}>Fecha de próxima curación</Text>
            <DateField dateValue={nextCareDate} onDateChange={setNextCareDate} />
          </View>
        </View>
      </View>

      {/* Campos nuevos: Dolor, Protección de piel, Solución de limpieza, Foto */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Dolor</Text>
        <TextInput
          style={styles.input}
          value={woundPain}
          onChangeText={setWoundPain}
          placeholder="Describe el dolor"
          placeholderTextColor={Colors.neutralGray}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Protección de la piel</Text>
        <TextInput
          style={styles.input}
          value={skinProtection}
          onChangeText={setSkinProtection}
          placeholder="Productos para proteger la piel"
          placeholderTextColor={Colors.neutralGray}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Solución de limpieza</Text>
        <TextInput
          style={styles.input}
          value={cleaningSolution}
          onChangeText={setCleaningSolution}
          placeholder="Solución empleada"
          placeholderTextColor={Colors.neutralGray}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>URL/Nota de Foto</Text>
        <TextInput
          style={styles.input}
          value={woundPhoto}
          onChangeText={setWoundPhoto}
          placeholder="Ingresa URL o referencia de foto"
          placeholderTextColor={Colors.neutralGray}
        />
      </View>

      {/* Notas finales */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Notas</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={careNotes}
          onChangeText={setCareNotes}
          placeholder="Notas de la curación"
          placeholderTextColor={Colors.neutralGray}
          multiline
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: Colors.neutralDarkGray,
    marginBottom: 10,
  },
  input: {
    borderColor: Colors.borderGray,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  notesInput: {
    height: 120,
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerContainer: {
    flex: 1,
    marginRight: 10,
  },
  halfWidth: {
    flex: 0.48,
  },
  fullWidth: {
    flex: 1,
  },
});