import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    fetchItems,
    extractUniqueCategories,
    filterItems,
    staticData,
} from "./helper/items";

export const loadItems = createAsyncThunk(
    "items/loadItems",
    async (_, { rejectWithValue }) => {
        try {
            const items = await fetch(`${import.meta.env.VITE_BACKEND_API}/api/items`).then((res) => res.json());
            return items;
        } catch {
            return rejectWithValue("Failed to load items");
        }
    }
);

const initialState = {
    items: [],
    categories: ["All"],
    selectedCategory: "All",
    filteredItems: [],
    loading: false,
    error: null,
};

const itemsSlice = createSlice({
    name: "items",
    initialState,
    reducers: {
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
            state.filteredItems = filterItems(state.items, action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadItems.fulfilled, (state, action) => {
                state.items = action.payload;
                state.categories = [...extractUniqueCategories(action.payload)];
                state.filteredItems = action.payload;
                state.loading = false;
            })
            .addCase(loadItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setSelectedCategory } = itemsSlice.actions;
export { staticData };
export default itemsSlice.reducer;
