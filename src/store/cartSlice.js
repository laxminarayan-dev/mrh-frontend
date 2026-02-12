import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const CART_STORAGE_KEY = "cartData";

const readCartStorage = () => {
    if (typeof window === "undefined") {
        return [];
    }
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        }
        const cookieData = Cookies.get(CART_STORAGE_KEY);
        if (cookieData) {
            const parsed = JSON.parse(cookieData);
            if (Array.isArray(parsed)) {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(parsed));
                Cookies.remove(CART_STORAGE_KEY);
                return parsed;
            }
        }
    } catch (error) {
        return [];
    }
    return [];
};

const writeCartStorage = (items) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        return;
    }
};

const clearCartStorage = () => {
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
        return;
    }
    Cookies.remove(CART_STORAGE_KEY);
};


export const fetchCartItems = createAsyncThunk(
    "cart/fetchCartItems",
    async (_, thunkAPI) => {
        try {
            const isLoggedIn = Cookies.get("token") ? true : false;
            if (!isLoggedIn) {
                return readCartStorage();
            } else {
                const token = Cookies.get("token");

                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_API}/api/user/cart`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    const err = await response.json();
                    return thunkAPI.rejectWithValue(err);
                }

                const data = await response.json();
                return data.cart || [];

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

            const state = thunkAPI.getState();
            const items = state.cart.items || [];
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

export const fetchOrders = createAsyncThunk(
    "cart/fetchOrders",
    async (_, thunkAPI) => {
        try {
            const token = Cookies.get("token");
            if (!token) {
                return thunkAPI.rejectWithValue({ message: "Missing auth token" });
            }
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API}/api/orders/user`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) {
                const err = await response.json();
                return thunkAPI.rejectWithValue(err);
            }
            const data = await response.json();
            return data.orders || [];
        } catch (error) {
            return thunkAPI.rejectWithValue({ message: error.message });
        }
    }
);

export const placeOrder = createAsyncThunk(
    "auth/placeOrder",
    async (orderDetail, thunkAPI) => {
        try {
            const token = Cookies.get("token");
            if (!token) {
                return thunkAPI.rejectWithValue({ message: "Missing auth token" });
            }
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API}/api/orders/place`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(orderDetail),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                return thunkAPI.rejectWithValue(err);
            }

            const data = await response.json();
            setTimeout(() => {
                thunkAPI.dispatch({ type: "cart/setOrderPlaced", payload: false });
            }, 1000);
            return data;
        } catch (error) {
            console.error("Error placing order:", error);
            return thunkAPI.rejectWithValue({ message: error.message });
        }
    }
);


const initialState = {
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
    synced: false,
    orders: [],
    loadingOrders: false,
    placingOrder: false,
    orderPlaced: false,
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
            writeCartStorage(state.items);
        },
        addBulkItems: (state, action) => {
            const newItems = action.payload;
            state.synced = false;
            newItems.forEach((newItem) => {
                const existingItem = state.items.find((item) => item._id === newItem._id);
                if (existingItem) {
                    existingItem.quantity += newItem.quantity;
                    existingItem.totalPrice += newItem.totalPrice;
                } else {
                    state.items.push(newItem);
                }
                state.totalQuantity += newItem.quantity;
                state.totalPrice += newItem.totalPrice;
            });
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
            writeCartStorage(state.items);
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
            writeCartStorage(state.items);
        },
        clearCart: (state) => {
            state.items = [];
            state.totalQuantity = 0;
            state.totalPrice = 0;
            state.synced = false;
            clearCartStorage();
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
        // Orders
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loadingOrders = true;
                state.error = null;
            }
            )
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.orders = action.payload;
                state.loadingOrders = false;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loadingOrders = false;
                state.error = action.payload?.message || "Failed to load orders";
            });
        builder
            .addCase(placeOrder.pending, (state) => {
                state.placingOrder = true;
                state.orderPlaced = false;
                state.error = null;
            })
            .addCase(placeOrder.fulfilled, (state, action) => {
                state.placingOrder = false;
                state.orderPlaced = true;
                state.orders.push(action.payload.order);
                state.items = [];
                state.totalQuantity = 0;
                state.totalPrice = 0;
                state.synced = false;
                clearCartStorage();
            })
            .addCase(placeOrder.rejected, (state, action) => {
                state.placingOrder = false;
                state.orderPlaced = false;
                state.error = action.payload?.message || "Failed to place order";
            });

    },
});

export const { addItem, addBulkItems, removeItem, deleteItem, clearCart } =
    cartSlice.actions;

export default cartSlice.reducer;
