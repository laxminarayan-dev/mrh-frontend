import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reviewData } from "./helper/reviews.js";

export const fetchReviews = createAsyncThunk(
    "reviews/fetchReviews",
    async () => {
        try {
            const response = reviewData;
            return response;
        } catch (error) {
            return error.message || "Failed to load reviews";
        }
    }
);

const initialState = {
    myReviews: [],
    otherReviews: [],
    loading: false,
    error: null,
};

const reviewsSlice = createSlice({
    name: "reviews",
    initialState,
    reducers: {
        addMyReview: (state, action) => {
            state.myReviews.unshift(action.payload);
        },
        removeMyReview: (state, action) => {
            state.myReviews = state.myReviews.filter((review) => review.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                const payload = action.payload;

                if (Array.isArray(payload)) {
                    state.myReviews = [];
                    state.otherReviews = payload;
                } else {
                    state.myReviews = payload?.myReviews || [];
                    state.otherReviews = payload?.otherReviews || [];
                }

                state.loading = false;
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to load reviews";
            });
    },
});

export const {
    addMyReview,
    removeMyReview,
} = reviewsSlice.actions;

export default reviewsSlice.reducer;
