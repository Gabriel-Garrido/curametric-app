import { Stack, Slot } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { Platform, View, StyleSheet, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { AuthProvider } from '../utils/AuthContext';

export default function RootLayout() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        {Platform.OS === "web" ? (
          <View style={styles.webContainer}>
            <Slot />
          </View>
        ) : (
          <Slot />
        )}
      </AuthProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    maxWidth: 900,
    marginHorizontal: "auto",
    width: "100%",
    height: "100%",
  },
});