import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
const isLoggedIn = localStorage.getItem("token") ? true : false;

export const fetchCartItems = createAsyncThunk(
    "cart/fetchCartItems",
    async () => {
        try {
            if (!isLoggedIn) {
                return Cookies.get("cartData") ? JSON.parse(Cookies.get("cartData")) : [];
            }
            else {
                // if user is logged in, fetch cart data from server and also store in cookies for persistence
                const response = cartData;
                return response;
            }
        } catch (error) {
            return error.message || "Failed to load reviews";
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
                state.totalQuantity = action.payload.reduce((total, item) => total + item.quantity, 0);
                state.totalPrice = action.payload.reduce((total, item) => total + item.totalPrice, 0);
                state.synced = true;
                state.loading = false;
            })
            .addCase(fetchCartItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to load cart items";
            });
    },
});

export const { addItem, removeItem, deleteItem, clearCart } =
    cartSlice.actions;

export default cartSlice.reducer;
