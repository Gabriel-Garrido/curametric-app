import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PickerComponent from "../PickerComponent";
import Colors from "../../constant/Colors";

interface Props {
  borders: string;
  setBorders: (v: string) => void;
  surroundingSkin: string;
  setSurroundingSkin: (v: string) => void;
  edema: string;
  setEdema: (v: string) => void;
  exudateAmount: string;
  setExudateAmount: (v: string) => void;
  exudateType: string;
  setExudateType: (v: string) => void;
  errors: any;
}

export default function SurroundingsSection({
  borders, setBorders,
  surroundingSkin, setSurroundingSkin,
  edema, setEdema,
  exudateAmount, setExudateAmount,
  exudateType, setExudateType,
  errors
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Condiciones Circundantes</Text>
      <Text style={styles.label}>Bordes</Text>
      <PickerComponent
        selectedValue={borders}
        setSelectedValue={setBorders}
        options={["Regulares", "Irregulares", "Engrosados", "Invertidos", "Socavados"]}
        label="Bordes"
      />
      {errors.borders && <Text style={styles.errorText}>{errors.borders}</Text>}

      <Text style={styles.label}>Piel Circundante</Text>
      <PickerComponent
        selectedValue={surroundingSkin}
        setSelectedValue={setSurroundingSkin}
        options={["Sana", "Eritematosa", "Descamativa", "Macerada"]}
        label="Piel Circundante"
      />
      {errors.surroundingSkin && <Text style={styles.errorText}>{errors.surroundingSkin}</Text>}

      <Text style={styles.label}>Edema</Text>
      <PickerComponent
        selectedValue={edema}
        setSelectedValue={setEdema}
        options={["+", "++", "+++"]}
        label="Edema"
      />
      {errors.edema && <Text style={styles.errorText}>{errors.edema}</Text>}

      <Text style={styles.label}>Exudado cantidad</Text>
      <PickerComponent
        selectedValue={exudateAmount}
        setSelectedValue={setExudateAmount}
        options={["Escaso", "Moderado", "Abundante"]}
        label="Cantidad"
      />
      {errors.exudateAmount && <Text style={styles.errorText}>{errors.exudateAmount}</Text>}

      <Text style={styles.label}>Exudado calidad</Text>
      <PickerComponent
        selectedValue={exudateType}
        setSelectedValue={setExudateType}
        options={["Seroso", "Purulento", "Hemorrágico"]}
        label="Calidad"
      />
      {errors.exudateType && <Text style={styles.errorText}>{errors.exudateType}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: Colors.neutralDarkGray,
    marginBottom: 5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});