import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { loginSuccess, logout } from '../redux/authSlice';
import { AppDispatch } from '../redux/store';

export const checkToken = async (dispatch: AppDispatch) => {
  const token = await AsyncStorage.getItem("token");
  const user = await AsyncStorage.getItem("user");

  if (!token) {
    dispatch(logout());
    return;
  }

  try {
    // Verificamos el token en el backend
    await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/token/verify/`, {
      token,
    });

    // Si es válido, restauramos la sesión
    dispatch(loginSuccess({ token, user: user ? JSON.parse(user) : null }));
  } catch (error) {
    // Si no es válido, cerramos sesión
    dispatch(logout());
  }
};