/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Ánh xạ brand vào biến CSS để thay đổi theo theme
                brand: "var(--color-brand)",
                "brand-soft": "var(--color-brand-soft)",
                "brand-deep": "var(--color-brand-deep)",
                
                // Giữ lại các biến cụ thể nếu cần dùng trực tiếp
                nurse: "#10B981",
                "nurse-deep": "#059669",
                admin: "#3B82F6",
                "admin-deep": "#2563EB",
            },
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
                heading: ['Montserrat', 'sans-serif'],
                serif: ['Montserrat', 'serif'],
                mono: ['Montserrat', 'monospace'],
            },
            borderRadius: {
                'none': '0',
                'sm': '0.375rem',
                'DEFAULT': '0.5rem',
                'md': '0.75rem',
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
        },
    },
    plugins: [],
}
