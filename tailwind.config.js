/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: "#EC4899",
                "brand-soft": "#FDF2F8",
                "brand-deep": "#DB2777",
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', '"Be Vietnam Pro"', 'sans-serif'],
                heading: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
