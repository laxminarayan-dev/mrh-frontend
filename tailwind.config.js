/** @type {import('tailwindcss').Config} */
export default {
    theme: {
        extend: {
            screens: {
                xs: '376px',   // Small phones (iPhone SE)
                sm: '426px',   // Medium phones (previously xs)
            },
        },
    },
    plugins: [],
    content: ["./index.html", "./src/**/*.{js,jsx}"]
}
