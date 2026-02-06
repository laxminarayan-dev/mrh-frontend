import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

/* ============================
   INITIAL AUTH CHECK
============================ */
export const startInitialAuth = createAsyncThunk(
    "auth/startAuth",
    async (_, thunkAPI) => {
        try {
            const token = Cookies.get("token");

            if (!token) {
                return { isAuthenticated: false, user: null, token: null };
            }

            const response = await fetch(
                "http://localhost:5000/api/auth/verify",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                }
            );

            if (!response.ok) {
                Cookies.remove("token");
                return { isAuthenticated: false, user: null, token: null };
            }

            const data = await response.json();

            return {
                isAuthenticated: true,
                user: data.user,
                token,
            };
        } catch (error) {
            return thunkAPI.rejectWithValue({
                message: error.message,
            });
        }
    }
);

/* ============================
   LOGIN (NO OTP)
============================ */
export const authLogin = createAsyncThunk(
    "auth/login",
    async (credentials, thunkAPI) => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(credentials),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                return thunkAPI.rejectWithValue(err);
            }

            const data = await response.json();
            Cookies.set("token", data.token, { expires: 7 });

            return {
                isAuthenticated: true,
                user: data.user,
                token: data.token,
            };
        } catch (error) {
            return thunkAPI.rejectWithValue({ message: error.message });
        }
    }
);

/* ============================
   SIGNUP – SEND OTP
============================ */
export const sendSignupOtp = createAsyncThunk(
    "auth/sendSignupOtp",
    async (email, thunkAPI) => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/send-otp",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                return thunkAPI.rejectWithValue(err);
            }

            return { otpSent: true };
        } catch (error) {
            return thunkAPI.rejectWithValue({ message: error.message });
        }
    }
);

/* ============================
   SIGNUP – VERIFY OTP & CREATE USER
============================ */
export const verifySignupOtp = createAsyncThunk(
    "auth/verifySignupOtp",
    async ({ email, otp, password }, thunkAPI) => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/verify-otp",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp, password }),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                return thunkAPI.rejectWithValue(err);
            }

            const data = await response.json();
            Cookies.set("token", data.token, { expires: 7 });

            return {
                isAuthenticated: true,
                user: data.user,
                token: data.token,
            };
        } catch (error) {
            return thunkAPI.rejectWithValue({ message: error.message });
        }
    }
);

/* ============================
   SLICE
============================ */

const initialState = {
    user: null,
    isLoggedIn: false,
    token: null,
    loading: false,
    error: null,
    otpSent: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        resetOtpState: (state) => {
            state.otpSent = false;
        },
        logout: (state) => {
            Cookies.remove("token");
            state.user = null;
            state.token = null;
            state.isLoggedIn = false;
        },
    },
    extraReducers: (builder) => {
        /* ===== Initial Auth ===== */
        builder
            .addCase(startInitialAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(startInitialAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = action.payload.isAuthenticated;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(startInitialAuth.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /* ===== Login ===== */
        builder
            .addCase(authLogin.pending, (state) => {
                state.loading = true;
            })
            .addCase(authLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(authLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /* ===== Send OTP ===== */
        builder
            .addCase(sendSignupOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendSignupOtp.fulfilled, (state) => {
                state.loading = false;
                state.otpSent = true;
            })
            .addCase(sendSignupOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /* ===== Verify OTP ===== */
        builder
            .addCase(verifySignupOtp.pending, (state) => {
                state.loading = true;
            })
            .addCase(verifySignupOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(verifySignupOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetOtpState, logout } = authSlice.actions;
export default authSlice.reducer;
