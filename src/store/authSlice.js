import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const scheduleErrorClear = (thunkAPI) => {
    setTimeout(() => {
        thunkAPI.dispatch(clearError());
    }, 3000);
};

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
                `${import.meta.env.VITE_BACKEND_API}/api/auth/verify-token`,
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
            scheduleErrorClear(thunkAPI);
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
                `${import.meta.env.VITE_BACKEND_API}/api/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(credentials),
                }
            );
            if (!response.ok) {
                const err = await response.json();
                scheduleErrorClear(thunkAPI);
                return thunkAPI.rejectWithValue(err);
            }
            const data = await response.json();

            return {
                isAuthenticated: true,
                user: data.user,
                token: data.token,
            };
        } catch (error) {
            scheduleErrorClear(thunkAPI);
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
                `${import.meta.env.VITE_BACKEND_API}/api/auth/send-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                scheduleErrorClear(thunkAPI);
                return thunkAPI.rejectWithValue(err);
            }

            return { otpSent: true };
        } catch (error) {
            scheduleErrorClear(thunkAPI);
            return thunkAPI.rejectWithValue({ message: error.message });
        }
    }
);

/* ============================
   SIGNUP – VERIFY OTP & CREATE USER
============================ */
export const verifySignupOtp = createAsyncThunk(
    "auth/verifySignupOtp",
    async ({ userDetail, otp }, thunkAPI) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API}/api/auth/verify-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userDetail, otp }),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                scheduleErrorClear(thunkAPI);
                return thunkAPI.rejectWithValue(err);
            }

            const data = await response.json();
            const cookieOptions = thunkAPI.getState().auth.rememberMe
                ? { expires: 7 }
                : undefined;
            Cookies.set("token", data.token, cookieOptions);

            return {
                isAuthenticated: true,
                user: data.user,
                token: data.token,
            };
        } catch (error) {
            scheduleErrorClear(thunkAPI);
            return thunkAPI.rejectWithValue({ message: error.message });
        }
    }
);

/* ============================
   Forget OTP sent
============================ */

export const sendForgetOtp = createAsyncThunk(
    "auth/sendforgetOtp",
    async (email, thunkAPI) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API}/api/auth/forgot-password/send-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                console.log("Error sending forget OTP:", err);
                scheduleErrorClear(thunkAPI);
                return thunkAPI.rejectWithValue(err);
            }

            return { forgetOtpSent: true };
        } catch (error) {
            scheduleErrorClear(thunkAPI);
            return thunkAPI.rejectWithValue({ message: error.message });
        }
    }
);


export const verifyForgetOtp = createAsyncThunk(
    "auth/verifyForgetOtp",
    async ({ email, otp }, thunkAPI) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API}/api/auth/forgot-password/verify-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp }),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                console.log("Error verifying forget OTP:", err);
                scheduleErrorClear(thunkAPI);
                return thunkAPI.rejectWithValue(err);
            }

            return { forgetOtpVerified: true };
        } catch (error) {
            scheduleErrorClear(thunkAPI);
            return thunkAPI.rejectWithValue({ message: error.message });
        }
    }
);

export const resetForgetPassword = createAsyncThunk(
    "auth/resetForgetPassword",
    async ({ email, newPassword }, thunkAPI) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API}/api/auth/forgot-password/reset`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, newPassword }),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                scheduleErrorClear(thunkAPI);
                return thunkAPI.rejectWithValue(err);
            }

            return { forgetPasswordSuccess: true };
        } catch (error) {
            scheduleErrorClear(thunkAPI);
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
    forgetOtpSent: false,
    forgetOtpVerified: false,
    forgetPasswordSuccess: false,
    rememberMe: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetOtpState: (state) => {
            state.otpSent = false;
            state.forgetOtpSent = false;
            state.forgetOtpVerified = false;
            state.forgetPasswordSuccess = false;
        },
        setRememberMe: (state, action) => {
            state.rememberMe = action.payload;
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
                const cookieOptions = state.rememberMe ? { expires: 7 } : undefined;
                Cookies.set("token", action.payload.token, cookieOptions);
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
                const cookieOptions = state.rememberMe ? { expires: 7 } : undefined;
                Cookies.set("token", action.payload.token, cookieOptions);
            })
            .addCase(verifySignupOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /* ===== Forget OTP & Reset Password ===== */
        builder
            .addCase(sendForgetOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendForgetOtp.fulfilled, (state) => {
                state.loading = false;
                state.forgetOtpSent = true;
            })
            .addCase(sendForgetOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(verifyForgetOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyForgetOtp.fulfilled, (state) => {
                state.loading = false;
                state.forgetOtpVerified = true;
            })
            .addCase(verifyForgetOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
        builder
            .addCase(resetForgetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetForgetPassword.fulfilled, (state) => {
                state.loading = false;
                state.forgetPasswordSuccess = true;
            })
            .addCase(resetForgetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

    },
});

export const { clearError, resetOtpState, setRememberMe, logout } = authSlice.actions;
export default authSlice.reducer;
