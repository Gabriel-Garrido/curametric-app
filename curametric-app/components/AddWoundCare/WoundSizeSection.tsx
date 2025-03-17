import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import Colors from "../../constant/Colors";

interface Props {
  width: string;
  setWidth: (v: string) => void;
  height: string;
  setHeight: (v: string) => void;
  depth: string;
  setDepth: (v: string) => void;
  errors: any;
}

export default function WoundSizeSection({
  width,
  setWidth,
  height,
  setHeight,
  depth,
  setDepth,
  errors,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Tamaño de la herida (cm)</Text>
      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ancho</Text>
          <TextInput
            style={[styles.input, errors.width && styles.errorInput]}
            keyboardType="numeric"
            placeholder="0"
            value={width}
            onChangeText={setWidth}
          />
          {errors.width && <Text style={styles.errorText}>{errors.width}</Text>}
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Alto</Text>
          <TextInput
            style={[styles.input, errors.height && styles.errorInput]}
            keyboardType="numeric"
            placeholder="0"
            value={height}
            onChangeText={setHeight}
          />
          {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Profundidad</Text>
          <TextInput
            style={[styles.input, errors.depth && styles.errorInput]}
            keyboardType="numeric"
            placeholder="0"
            value={depth}
            onChangeText={setDepth}
          />
          {errors.depth && <Text style={styles.errorText}>{errors.depth}</Text>}
        </View>
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