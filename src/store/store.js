import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import itemsReducer from "./itemsSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        items: itemsReducer,
    }
})
