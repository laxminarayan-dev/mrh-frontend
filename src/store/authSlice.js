import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

export const startInitialAuth = createAsyncThunk("auth/startAuth", async (_, thunkAPI) => {
    try {
        const token = Cookies.get("token");

        // If no token, just return not authenticated
        if (!token) {
            return { isAuthenticated: false, user: null, token: null };
        }

        // Token exists, verify it with backend
        const response = await fetch("http://localhost:5000/api/auth/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            // Token is invalid, clear it and return not authenticated
            Cookies.remove("token");
            return { isAuthenticated: false, user: null, token: null };
        }

        const data = await response.json();
        return {
            isAuthenticated: true,
            user: data.user,
            token: token,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue({
            message: error.message,
            status: error.response?.status || 500
        });
    }
});

export const authLogin = createAsyncThunk("auth/login", async (credentials, thunkAPI) => {
    try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return thunkAPI.rejectWithValue({
                message: errorData.message || "Login failed",
                status: response.status
            });
        }
        const data = await response.json();
        Cookies.set("token", data.token, { expires: 7 });
        return {
            isAuthenticated: true,
            user: data.user,
            token: data.token,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue({
            message: error.message,
            status: error.response?.status || 500
        });
    }
});

export const authSignup = createAsyncThunk("auth/signup", async (userInfo, thunkAPI) => {
    try {
        const response = await fetch("http://localhost:5000/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userInfo),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return thunkAPI.rejectWithValue({
                message: errorData.message || "Signup failed",
                status: response.status
            });
        }
        const data = await response.json();
        Cookies.set("token", data.token, { expires: 7 });
        return {
            isAuthenticated: true,
            user: data.user,
            token: data.token,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue({
            message: error.message,
            status: error.response?.status || 500
        });
    }
});


const initialState = {
    user: null,
    isLoggedIn: false,
    token: null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // initial auth check
        builder.addCase(startInitialAuth.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(startInitialAuth.fulfilled, (state, action) => {
            state.loading = false;
            state.isLoggedIn = action.payload.isAuthenticated;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
        });
        builder.addCase(startInitialAuth.rejected, (state, action) => {

            state.loading = false;
            state.isLoggedIn = false;
            state.user = null;
            state.token = null;
            state.error = action.payload;
        });

        // login
        builder.addCase(authLogin.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(authLogin.fulfilled, (state, action) => {
            state.loading = false;
            state.isLoggedIn = action.payload.isAuthenticated;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
        });
        builder.addCase(authLogin.rejected, (state, action) => {
            state.loading = false;
            state.isLoggedIn = false;
            state.user = null;
            state.token = null;
            state.error = action.payload;
        });

        // signup
        builder.addCase(authSignup.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(authSignup.fulfilled, (state, action) => {
            state.loading = false;
            state.isLoggedIn = action.payload.isAuthenticated;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
        });
        builder.addCase(authSignup.rejected, (state, action) => {
            state.loading = false;
            state.isLoggedIn = false;
            state.user = null;
            state.token = null;
            state.error = action.payload;
        });
    }
});

export const { } =
    authSlice.actions;

export default authSlice.reducer;
