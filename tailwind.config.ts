import type { Config } from 'tailwindcss';
const config: Config = { darkMode: 'class', content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { ink: '#17172b', violet: { 50:'#f5f3ff',100:'#ede9fe',500:'#7662f6',600:'#6650e8',700:'#5641d4' } }, boxShadow: { soft: '0 12px 40px rgba(31, 25, 75, .07)' }, animation: { 'fade-up':'fadeUp .45s ease-out both' }, keyframes: { fadeUp: { '0%': { opacity:'0', transform:'translateY(10px)' }, '100%': { opacity:'1', transform:'translateY(0)' } } } } }, plugins: [] };
export default config;
