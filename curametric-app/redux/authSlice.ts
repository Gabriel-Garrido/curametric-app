import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    user: { username: string; email: string } | null;
}

const initialState: AuthState = {
    token: null,
    isAuthenticated: false,
    user: null,
};

interface LoginPayload {
    token: string;
    user: { username: string; email: string };
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<LoginPayload>) => {
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            AsyncStorage.setItem("token", action.payload.token);
            AsyncStorage.setItem("user", JSON.stringify(action.payload.user));
        },
        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.user = null;
            AsyncStorage.removeItem("token");
            AsyncStorage.removeItem("user");
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
