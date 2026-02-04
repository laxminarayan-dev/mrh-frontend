import { createSlice } from "@reduxjs/toolkit";
import Cookies from 'js-cookie'

// Helper function to read items from cookie
const getItemsFromCookie = () => {
    let cookies = Cookies.get('items')
    if (cookies && cookies.length > 0) {
        return cookies
    } else {
        return []
    }
};

// Helper function to extract unique categories from items
export const extractUniqueCategories = (items) => {
    const categories = items
        .map((item) => item.category)
        .filter((category) => category && category.trim() !== "");
    return ["All", ...new Set(categories)];
};

// Helper function to filter items
const filterItems = (items, category) => {
    let filtered = items;

    // Filter by category
    if (category && category !== "All") {
        filtered = filtered.filter(
            (item) => item.category?.toLowerCase() === category.toLowerCase()
        );
    }

    return filtered;
};

const staticData = [
    {
        name: "Plain Dosa",
        description: "Crispy south Indian plain dosa served with chutney and sambar.",
        shortDescription: "Classic crispy plain dosa",
        category: "dosa",
        subCategory: "plain",
        cuisine: "south-indian",
        originalPrice: 49,
        discountPrice: null,
        isSale: false,
        isSpecial: false,
        isAvailable: true,
        isNewArrival: false,
        isBestSeller: true,
        images:
            { url: "/images/plain-dosa.png", alt: "Plain Dosa" }
        ,
        thumbnail: "/images/dosa/plain-dosa-thumb.jpg",
        availableTimings: { breakfast: true, lunch: true, dinner: true },
        preparationTime: 10
    },
    {
        name: "Masala Dosa",
        description: "Crispy dosa filled with spiced potato masala.",
        shortDescription: "Potato masala stuffed dosa",
        category: "dosa",
        subCategory: "masala",
        cuisine: "south-indian",
        originalPrice: 59,
        isBestSeller: true,
        images:
            { url: "/images/masala-dosa.png", alt: "Masala Dosa" }
        ,
        thumbnail: "/images/dosa/masala-dosa-thumb.jpg",
        availableTimings: { breakfast: true, lunch: true, dinner: true },
        preparationTime: 12
    },
    {
        name: "Butter Dosa",
        description: "Plain dosa cooked with generous butter.",
        shortDescription: "Butter loaded dosa",
        category: "dosa",
        subCategory: "butter",
        cuisine: "south-indian",
        originalPrice: 69,
        images:
            { url: "/images/butter-dosa.png", alt: "Butter Dosa" }
        ,
        thumbnail: "/images/dosa/butter-dosa-thumb.jpg",
        preparationTime: 10,
        discountPrice: 49,
        isSale: true,

    },
    {
        name: "Paneer Dosa",
        description: "Dosa stuffed with spicy paneer filling.",
        shortDescription: "Paneer stuffed dosa",
        category: "dosa",
        subCategory: "paneer",
        cuisine: "south-indian",
        originalPrice: 99,
        isSpecial: true,
        images:
            { url: "/images/paneer-dosa.png", alt: "Paneer Dosa" }
        ,
        thumbnail: "/images/dosa/paneer-dosa-thumb.jpg",
        preparationTime: 15,
        isSale: true,
        discountPrice: 79,
    },
    {
        name: "Onion Uttapam",
        description: "Soft uttapam topped with fresh onions.",
        shortDescription: "Onion topped uttapam",
        category: "uttapam",
        cuisine: "south-indian",
        originalPrice: 79,
        images:
            { url: "/images/onion-uttapam.png", alt: "Onion Uttapam" }
        ,
        thumbnail: "/images/onion-uttapam.jpg",
        preparationTime: 12
    },
    {
        name: "Paneer Uttapam",
        description: "Uttapam topped with fresh paneer cubes.",
        shortDescription: "Paneer uttapam",
        category: "uttapam",
        cuisine: "south-indian",
        originalPrice: 110,
        isSpecial: true,
        images:
            { url: "/images/paneer-uttapam.png", alt: "Paneer Uttapam" }
        ,
        thumbnail: "/images/paneer-uttapam.jpg",
        preparationTime: 15
    },
    {
        name: "Veg Chowmein",
        description: "Stir fried noodles with fresh vegetables.",
        shortDescription: "Veg chowmein noodles",
        category: "chinese",
        cuisine: "chinese",
        originalPrice: 80,
        images:
            { url: "/images/chowmein.png", alt: "Veg Chowmein" }
        ,
        thumbnail: "/images/chowmein.jpg",
        preparationTime: 15
    },
    {
        name: "Pav Bhaji",
        description: "Spicy mashed vegetables served with buttered pav.",
        shortDescription: "Classic pav bhaji",
        category: "pav-bhaji",
        cuisine: "north-indian",
        originalPrice: 60,
        isBestSeller: true,
        images:
            { url: "/images/pav-bhaji.png", alt: "Pav Bhaji" }
        ,
        thumbnail: "/images/pav-bhaji.jpg",
        preparationTime: 15,
        isSpecial: true,
    },
    {
        name: "Gulab Jamun",
        description: "Soft milk-solid dumplings soaked in sugar syrup.",
        shortDescription: "Sweet gulab jamun",
        category: "sweets",
        subCategory: "sweets",
        cuisine: "north-indian",
        originalPrice: 25,
        images:
            { url: "/images/gulab-jamun.png", alt: "Gulab Jamun" }
        ,
        thumbnail: "/images/gulab-jamun.jpg",
        preparationTime: 5,
        isSpecial: true,
    },
    {
        name: "Maa ki Thali",
        description: "A wholesome plate with balanced flavors, perfect for lunch.",
        includes: ["Chawal", "Dal", "Sabji", "Roti", "Raita", "Mithai"],
        shortDescription: "Wholesome thali",
        category: "thali",
        subCategory: "thali",
        cuisine: "north-indian",
        originalPrice: 110,
        images:
            { url: "/images/maa-ki-thali.png", alt: "Maa ki Thali" }
        ,
        thumbnail: "/images/thali/maa-ki-thali-thumb.jpg",
        preparationTime: 5,
        isSpecial: true,
        isAvailable: true,
        isSale: true,
        discountPrice: 99,
    }
];

// Initialize items from cookie or use empty array
const initialItems = () => {
    if (getItemsFromCookie().length > 0) {
        return getItemsFromCookie()
    } else {
        return staticData
    }
}

const initialState = {
    items: initialItems(),
    categories: initialItems().length > 0 ? extractUniqueCategories(initialItems()) : ["All"],
    selectedCategory: "All",
    filteredItems: initialItems(),
    loading: initialItems().length === 0,
    error: null,
};

const itemsSlice = createSlice({
    name: "items",
    initialState,
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload;
            state.filteredItems = action.payload;
            state.categories = extractUniqueCategories(action.payload);
            state.loading = false;
            state.error = null;
            // Save to cookie
            try {
                document.cookie = `items=${encodeURIComponent(JSON.stringify(action.payload))}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
            } catch (error) {
                console.error("Error saving items to cookie:", error);
            }
        },
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
            state.filteredItems = filterItems(
                state.items,
                action.payload
            );
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        addItem: (state, action) => {
            state.items.push(action.payload);
            state.categories = extractUniqueCategories(state.items);
            state.filteredItems = filterItems(
                state.items,
                state.selectedCategory
            );
        },
        updateItem: (state, action) => {
            const index = state.items.findIndex(
                (item) => item.id === action.payload.id
            );
            if (index !== -1) {
                state.items[index] = { ...state.items[index], ...action.payload };
                state.categories = extractUniqueCategories(state.items);
                state.filteredItems = filterItems(
                    state.items,
                    state.selectedCategory
                );
            }
        },
        deleteItem: (state, action) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
            state.categories = extractUniqueCategories(state.items);
            state.filteredItems = filterItems(
                state.items,
                state.selectedCategory
            );
        },
        clearFilters: (state) => {
            state.selectedCategory = "All";
            state.filteredItems = state.items;
        },
    },
});

export const {
    setItems,
    setSelectedCategory,
    setLoading,
    setError,
    addItem,
    updateItem,
    deleteItem,
    clearFilters,
} = itemsSlice.actions;

// Export static data for development/testing
export { staticData };

export default itemsSlice.reducer;
