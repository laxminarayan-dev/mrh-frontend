import { createSelector } from "@reduxjs/toolkit";

/**
 * BASE SELECTOR
 * Always returns an array (never undefined)
 */
export const selectItems = (state) =>
    Array.isArray(state.items?.items) ? state.items.items : [];

/**
 * BEST SELLERS (ARRAY)
 */
export const selectBestSeller = createSelector(
    [selectItems],
    (items) => items.filter((item) => item.isBestSeller === true)
);

/**
 * SPECIAL ITEMS (ARRAY)
 */
export const selectSpecialItems = createSelector(
    [selectItems],
    (items) => items.filter((item) => item.isSpecial === true)
);

/**
 * SPECIAL CATEGORIES (UNIQUE ARRAY)
 */
export const selectSpecialCategories = createSelector(
    [selectSpecialItems],
    (specialItems) => {
        const categories = new Set();

        for (const item of specialItems) {
            if (item?.category) {
                categories.add(item.category);
            }
        }

        return Array.from(categories);
    }
);

/**
 * ITEMS BY CATEGORY (FACTORY SELECTOR)
 */
export const makeSelectItemsByCategory = (category) =>
    createSelector(
        [selectSpecialItems],
        (items) =>
            category
                ? items.filter((item) => item.category === category)
                : []
    );
