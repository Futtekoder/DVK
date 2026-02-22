import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: "var(--bg)",
                card: "var(--card)",
                secondary: "var(--secondary)",
                "wine-burgundy": "var(--wine-burgundy)",
                "wine-deep": "var(--wine-deep)",
                "accent-gold": "var(--accent-gold)",
                "accent-amber": "var(--accent-amber)",
                "text-primary": "var(--text-primary)",
                "text-secondary": "var(--text-secondary)",
                "text-muted": "var(--text-muted)",
            },
            fontFamily: {
                playfair: ["var(--font-playfair)", "serif"],
                inter: ["var(--font-inter)", "sans-serif"],
            },
            boxShadow: {
                soft: "var(--shadow-soft)",
                gold: "var(--glow-gold)",
            },
            transitionProperty: {
                'normal': 'all',
                'slow': 'all',
            },
            transitionTimingFunction: {
                'normal': 'ease-in-out',
                'slow': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            },
            transitionDuration: {
                'normal': '200ms',
                'slow': '400ms',
            }
        },
    },
    plugins: [],
};
export default config;
