import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchReviews = createAsyncThunk(
    "reviews/fetchReviews",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API}/api/orders/reviews`
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                return rejectWithValue(err.message || "Failed to load reviews");
            }

            const data = await response.json();
            const normalizedReviews = (data?.reviews || []).map((item) => ({
                id: item.orderId,
                name: item.userName || "Anonymous User",
                rating: Number(item.rating) || 0,
                review: item.comment || "",
                createdAt: item.updatedAt || item.createdAt,
                likedBy: [],
            }));

            return normalizedReviews;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to load reviews");
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
