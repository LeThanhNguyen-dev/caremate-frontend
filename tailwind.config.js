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
                sans: ['Be Vietnam Pro', 'sans-serif'],
                heading: ['Be Vietnam Pro', 'sans-serif'],
                serif: ['Be Vietnam Pro', 'serif'],
                mono: ['Be Vietnam Pro', 'monospace'],
            },
            borderRadius: {
                'none': '0',
                'sm': '0.125rem',
                'DEFAULT': '0.1875rem',
                'md': '0.25rem',
                'lg': '0.3125rem',
                'xl': '0.3125rem',
                '2xl': '0.375rem',
                '3xl': '0.5rem',
            },
        },
    },
    plugins: [],
}
