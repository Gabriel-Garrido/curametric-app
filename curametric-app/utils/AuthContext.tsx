import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from '../redux/authSlice';
import { AppDispatch, RootState } from '../redux/store';
import { ActivityIndicator, View } from 'react-native';

interface AuthContextProps {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
  checkToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const [loading, setLoading] = useState(true);

  const checkToken = async () => {
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    if (token) {
      dispatch(loginSuccess({ token, user: user ? JSON.parse(user) : null }));
    } else {
      dispatch(logout());
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await checkToken();
      } catch (error) {
        console.error("Error verifying token:", error);
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [dispatch]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, checkToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};