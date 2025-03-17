import {
    View,
    Text,
    Alert,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
    Platform,
  } from "react-native";
  import React, { useState, useEffect } from "react";
  import Colors from "../constant/Colors";
  import Ionicons from "@expo/vector-icons/Ionicons";
  import LogOutBtn from "./LogOutBtn";
  import { useRouter } from "expo-router";
  import { useSelector } from "react-redux";
  import axios from "axios";
  
  export default function Header() {
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState(false);
    const [imageError, setImageError] = useState(false);
  
    const toggleMenu = () => setMenuVisible(!menuVisible);
  
    const user = useSelector((state: any) => state.auth.user);

  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/")} style={styles.titleContainer}>
            <Ionicons name="medkit" size={24} color="white" />
            <Text style={styles.title}>CuraMetric</Text>
          </TouchableOpacity>
  
          <TouchableOpacity onPress={toggleMenu}>
            {user?.profile_image && !imageError ? (
              <Image
                source={{ uri: user.profile_image }}
                style={styles.profileImage}
                onError={() => setImageError(true)}
              />
            ) : (
              <Ionicons name="person-circle" size={50} color={Colors.neutralDarkGray} />
            )}
          </TouchableOpacity>
        </View>
  
        <Modal
          visible={menuVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={toggleMenu}
        >
          <Pressable style={styles.overlay} onPress={toggleMenu}>
            <View style={styles.menu}>
              <View style={styles.profileContainer}>
                {user?.profile_image ? (
                  <Image source={{ uri: user.profile_image }} style={styles.profileImage} />
                ) : (
                  <Ionicons name="person-circle" size={50} color={Colors.neutralDarkGray} />
                )}
                <Text style={styles.userName} numberOfLines={1} adjustsFontSizeToFit>
                  {user?.first_name || "Usuario"}
                </Text>
              </View>
  
              <LogOutBtn toggleMenu={toggleMenu} />
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      paddingBottom: 10,
      paddingHorizontal: 15,
      backgroundColor: Colors.primaryBlue,
      paddingTop: Platform.OS === "web" ? 10 : 45,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
      marginLeft: 8,
    },
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: Colors.neutralDarkGray,
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    menu: {
      width: 300,
      backgroundColor: "white",
      borderRadius: 12,
      paddingVertical: 15,
      paddingHorizontal: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    profileContainer: {
      alignItems: "center",
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: Colors.neutralDarkGray,
      paddingBottom: 15,
    },
    userName: {
      fontSize: 22,
      fontWeight: "bold",
      marginTop: 10,
      color: "black",
    },
  });
  