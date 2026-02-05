import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import itemsReducer from "./itemsSlice";
import reviewsReducer from "./reviewSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        items: itemsReducer,
        reviews: reviewsReducer,
    }
})
