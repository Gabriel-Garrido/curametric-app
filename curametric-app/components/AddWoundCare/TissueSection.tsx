import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import Colors from "../../constant/Colors";

interface Props {
  granulationTissue: string;
  setGranulationTissue: (v: string) => void;
  slough: string;
  setSlough: (v: string) => void;
  necroticTissue: string;
  setNecroticTissue: (v: string) => void;
  errors: any;
}

export default function TissueSection({
  granulationTissue,
  setGranulationTissue,
  slough,
  setSlough,
  necroticTissue,
  setNecroticTissue,
  errors,
}: Props) {
  const renderInput = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    errorKey: string
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, errors[errorKey] && styles.errorInput]}
        keyboardType="numeric"
        placeholder="0"
        value={value}
        onChangeText={(val) => {
          if (parseFloat(val) > 100) return;
          setValue(val);
        }}
      />
      {errors[errorKey] && <Text style={styles.errorText}>{errors[errorKey]}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Tejidos (% del área de la herida)</Text>
      <View style={styles.row}>
        {renderInput("Granulatorio", granulationTissue, setGranulationTissue, "granulationTissue")}
        {renderInput("Esfacelado", slough, setSlough, "slough")}
        {renderInput("Necrótico", necroticTissue, setNecroticTissue, "necroticTissue")}
      </View>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 14,
    color: Colors.neutralDarkGray,
    marginBottom: 5,
  },
  input: {
    borderColor: Colors.borderGray,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});