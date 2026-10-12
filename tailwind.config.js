/**@type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.{html,js}"],
    theme:{
        extend:{
            fontFamily: {sans: ['Inter', 'sans-serif']},
            colors: {
                kopma: {
                    50: '#eef8ff', 100: '#d7efff', 500: '#0085ff',
                    600: "#0066cc", 700:'#0052a3', 800: '#004385', 900: '00376b',

                }
            }
        }
    },
    plugins:[],
}