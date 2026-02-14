import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const getShopData = createAsyncThunk(
    "shop/getShopData",
    async (shopCoordinates, { rejectWithValue }) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/api/shop/${shopCoordinates}`);
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
        shopsData: {},
        error: null,
    },
    reducers: {

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


export const { setSelectedShop, setShops } = shopSlice.actions;
export default shopSlice.reducer;