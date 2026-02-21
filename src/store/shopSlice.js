import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const getShopData = createAsyncThunk(
    "shop/getShopData",
    async (shopCoordinates, { rejectWithValue }) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/api/shop`);
            if (!response.ok) {
                throw new Error("Failed to fetch shop data");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    });


const shopSlice = createSlice({
    name: "shop",
    initialState: {
        loading: false,
        shopsData: [],
        deliveryShop: null,
        error: null,
        inRange: null,
    },
    reducers: {
        setInRange: (state, action) => {
            state.inRange = action.payload;
        },
        setDeliveryShop: (state, action) => {
            state.deliveryShop = action.payload;
        },
        updateShopsData: (state, action) => {
            state.shopsData = state.shopsData.map((shop) =>
                shop._id === action.payload._id ? action.payload : shop
            );
        },
    },
    extraReducers: (builder) => {
        builder.
            addCase(getShopData.pending, (state) => {
                state.shopsData = {};
                state.error = null;
                state.loading = true;
            })
            .addCase(getShopData.fulfilled, (state, action) => {
                state.loading = false;
                state.shopsData = action.payload.shop;
            })
            .addCase(getShopData.rejected, (state, action) => {
                state.loading = false;
                state.shopsData = {};
                state.error = action.payload;
            });
    }

});


export const { setSelectedShop, setShops, setInRange, setDeliveryShop, updateShopsData } = shopSlice.actions;
export default shopSlice.reducer;