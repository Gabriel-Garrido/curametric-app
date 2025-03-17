import { View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet, RefreshControl, Image } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import Colors from '../../constant/Colors';
import PatientItem from '../../components/PatientItem';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../utils/AuthContext';
import LoadingComponent from '../../components/LoadingComponent';
import ErrorComponent from '../../components/ErrorComponent';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Patient {
    id: number;
    name: string;
    rut: string;
}

export default function PatientList() {
    const router = useRouter();
    const { isAuthenticated, user, token } = useAuth();
    const [patientList, setPatientList] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!isAuthenticated || !user || !token) {
            router.replace("/login/LoginScreen");
        } else {
            fetchPatients();
        }
    }, [isAuthenticated, user, token, router]);

    const fetchPatients = async () => {
        setLoading(true);
        setRefreshing(true);

        try {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/patients/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const patients: Patient[] = response.data;
            setPatientList(patients);
            setFilteredPatients(patients);
        } catch (error: any) {
            console.error("Error al obtener pacientes:", error);
            setError("Error al obtener pacientes.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (!text) {
            setFilteredPatients(patientList);
            return;
        }

        const queryText = text.toLowerCase();
        const filteredData = patientList.filter(
            (patient) =>
                patient.name.toLowerCase().includes(queryText) || patient.rut.includes(queryText)
        );
        setFilteredPatients(filteredData);
    };

    const onRefresh = useCallback(() => {
        fetchPatients();
    }, []);

    if (!isAuthenticated || !user || !token) {
        return <LoadingComponent />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: Colors.neutralWhite }}>
            <Header />

            {loading ? (
                <LoadingComponent message="Cargando pacientes..." />
            ) : error ? (
                <ErrorComponent errorMessage={error} onRetry={fetchPatients} />
            ) : (
                <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push('/patient/NewPatient')}
                    >
                        <Ionicons name="add-circle-outline" size={24} color={Colors.neutralWhite} />
                        <Text style={styles.addButtonText}>Agregar paciente</Text>
                    </TouchableOpacity>

                    {patientList.length > 0 ? (
                        <>
                            <View style={styles.searchContainer}>
                                <Ionicons name="search" size={20} color={Colors.neutralGray} style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Buscar por nombre o RUT"
                                    value={searchQuery}
                                    onChangeText={handleSearch}
                                />
                            </View>

                            <FlatList
                                data={filteredPatients}
                                renderItem={({ item }) => <PatientItem item={item} />}
                                keyExtractor={(item) => item.id.toString()}
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                                }
                                onEndReachedThreshold={0.2}
                                contentContainerStyle={styles.listContent}
                            />
                        </>
                    ) : (
                        <View style={styles.noPatientsContainer}>
                            <Image
                                source={require('../../assets/images/no-patient.png')}
                                style={styles.noPatientsImage}
                            />
                            <Text style={styles.noPatientsText}>Todavía no hay pacientes registrados</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 10,
        margin: 15,
        borderWidth: 1,
        borderColor: Colors.borderGray,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: Colors.primaryGreen,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
    },
    addButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    noResultsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: Colors.neutralGray,
    },
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    noPatientsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noPatientsImage: {
        width: "100%", 
        height: 230, 
        position: "absolute", 
        top: 0, 
        zIndex: -1

    },
    noPatientsText: {
        fontSize: 18,
        color: Colors.neutralGray,
        textAlign: 'center',
    },
    bannerImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
});