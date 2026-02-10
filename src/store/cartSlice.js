import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";


export const fetchCartItems = createAsyncThunk(
    "cart/fetchCartItems",
    async (_, thunkAPI) => {
        try {
            const isLoggedIn = Cookies.get("token") ? true : false;
            if (!isLoggedIn) {
                const cookieData = Cookies.get("cartData");
                const parsed = cookieData ? JSON.parse(cookieData) : [];
                return Array.isArray(parsed) ? parsed : [];
            } else {
                const state = thunkAPI.getState();
                const user = state.auth.user;
                const cart = user?.cart || [];
                return cart;
            }
        } catch (error) {
            return error.message || "Failed to load reviews";
        }
    }
);

export const updateCartData = createAsyncThunk(
    "cart/updateCartData",
    async (_, thunkAPI) => {
        try {
            const token = Cookies.get("token");
            if (!token) {
                return thunkAPI.rejectWithValue({ message: "Missing auth token" });
            }

            console.log("Updating cart data with items:", thunkAPI.getState().cart.items);

            const state = thunkAPI.getState();
            const items = state.cart.items || [];
            console.log("Items being sent to backend:", items);
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API}/api/user/update/cart`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ items }),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                return thunkAPI.rejectWithValue(err);
            }

            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue({ message: error.message });
        }
    }
);



const initialState = {
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
    synced: false,

};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem: (state, action) => {
            const newItem = action.payload;
            const existingItem = state.items.find((item) => item._id === newItem._id);
            state.synced = false;

            if (existingItem) {
                existingItem.quantity++;
                existingItem.totalPrice += newItem.isSale ? newItem.discountPrice : newItem.originalPrice;
            } else {
                state.items.push({
                    ...newItem,
                    quantity: 1,
                    totalPrice: newItem.isSale ? newItem.discountPrice : newItem.originalPrice,
                });
            }
            state.totalQuantity++;
            state.totalPrice += newItem.isSale ? newItem.discountPrice : newItem.originalPrice;

            Cookies.set("cartData", JSON.stringify(state.items), { expires: 7 });
        },
        removeItem: (state, action) => {
            const id = action.payload;
            const existingItem = state.items.find((item) => item._id === id);
            state.synced = false;

            if (existingItem) {
                state.totalQuantity--;
                state.totalPrice -= existingItem.isSale ? existingItem.discountPrice : existingItem.originalPrice;

                if (existingItem.quantity === 1) {
                    state.items = state.items.filter((item) => item._id !== id);
                } else {
                    existingItem.quantity--;
                    existingItem.totalPrice -= existingItem.isSale ? existingItem.discountPrice : existingItem.originalPrice;
                }
            }
            Cookies.set("cartData", JSON.stringify(state.items), { expires: 7 });
        },
        deleteItem: (state, action) => {
            const id = action.payload;
            const existingItem = state.items.find((item) => item._id === id);
            state.synced = false;

            if (existingItem) {
                state.totalQuantity -= existingItem.quantity;
                state.totalPrice -= existingItem.isSale ? existingItem.discountPrice * existingItem.quantity : existingItem.originalPrice * existingItem.quantity;
                state.items = state.items.filter((item) => item._id !== id);
            }
            Cookies.set("cartData", JSON.stringify(state.items), { expires: 7 });
        },
        clearCart: (state) => {
            state.items = [];
            state.totalQuantity = 0;
            state.totalPrice = 0;
            state.synced = false;
            Cookies.remove("cartData");
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCartItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCartItems.fulfilled, (state, action) => {
                state.items = action.payload;
                state.totalQuantity = action.payload.reduce((total, item) => total + item.quantity, 0) || 0;
                state.totalPrice = action.payload.reduce((total, item) => total + item.totalPrice, 0) || 0;
                state.synced = true;
                state.loading = false;
            })
            .addCase(fetchCartItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to load cart items";
            });
        builder
            .addCase(updateCartData.pending, (state) => {
                state.syncing = true;
                state.error = null;
            })
            .addCase(updateCartData.fulfilled, (state, action) => {
                state.synced = true;
                state.syncing = false;
            })
            .addCase(updateCartData.rejected, (state, action) => {
                state.syncing = false;
                state.error = action.payload?.message || "Failed to sync cart data";
            })

    },
});

export const { addItem, removeItem, deleteItem, clearCart } =
    cartSlice.actions;

export default cartSlice.reducer;
