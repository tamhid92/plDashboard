/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'pl-purple': '#38003c',
                'pl-green': '#00ff85',
                'pl-neon-green': '#00ff85',
                'pl-text-green': '#059669', // Emerald 600 for readable text
                'pl-neon-pink': '#ff0050',
                'pl-neon-cyan': '#00ffff',
                'pl-blue': '#00b7dd', // Approximation of PL auxiliary 
                'pl-gray': '#f4f4f4',
                // Analytics specific palette
                'chart-1': '#3b82f6',
                'chart-2': '#ef4444',
                'chart-3': '#10b981',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'], // Assuming Inter or similar is available or fallback
            }
        },
    },
    plugins: [],
}
