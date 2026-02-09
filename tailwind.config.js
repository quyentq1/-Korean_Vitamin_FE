/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary Teal (from Figma) - replaces turquoise
                primary: {
                    50: '#E6F9F6',
                    100: '#CCF3ED',
                    200: '#99E7DB',
                    300: '#66DBC9',
                    400: '#3DCBB1', // Main teal from Figma
                    500: '#2BA896',
                    600: '#228777',
                    700: '#1A6559',
                    800: '#11443A',
                    900: '#09221C',
                },
                // Dark Navy for headers/footer
                navy: {
                    50: '#F0F1F3',
                    100: '#E1E3E7',
                    200: '#C3C7CF',
                    300: '#A5ABB7',
                    400: '#878F9F',
                    500: '#2D3E50', // Dark navy from Figma
                    600: '#243244',
                    700: '#1B2533',
                    800: '#121922',
                    900: '#090C11',
                },
                // Light backgrounds
                gray: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                },
                accent: {
                    pink: '#f48fb1',
                    purple: '#ce93d8',
                    orange: '#ffb74d',
                    green: '#81c784',
                    blue: '#64b5f6',
                    yellow: '#ffd54f',
                },
                // Semantic colors
                success: {
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    500: '#10B981',
                    700: '#047857',
                },
                warning: {
                    50: '#FFFBEB',
                    100: '#FEF3C7',
                    500: '#F59E0B',
                    600: '#D97706',
                    700: '#B45309',
                },
                error: {
                    50: '#FEF2F2',
                    100: '#FEE2E2',
                    500: '#EF4444',
                    700: '#B91C1C',
                },
                info: {
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                },
                // Badge colors from Figma
                badge: {
                    beginner: {
                        bg: '#FEF3C7',
                        text: '#D97706',
                    },
                    intermediate: {
                        bg: '#DBEAFE',
                        text: '#2563EB',
                    },
                    advanced: {
                        bg: '#FCE7F3',
                        text: '#DB2777',
                    },
                },
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                heading: ['Poppins', 'Inter', 'sans-serif'], // Optional for headings
            },
            fontSize: {
                'xs': '0.75rem',     // 12px
                'sm': '0.875rem',    // 14px
                'base': '1rem',      // 16px
                'lg': '1.125rem',    // 18px
                'xl': '1.25rem',     // 20px
                '2xl': '1.5rem',     // 24px
                '3xl': '1.875rem',   // 30px
                '4xl': '2.25rem',    // 36px
                '5xl': '3rem',       // 48px
            },
            spacing: {
                '18': '4.5rem',      // 72px
                '88': '22rem',       // 352px
                '100': '25rem',      // 400px
                '112': '28rem',      // 448px
                '128': '32rem',      // 512px
            },
            borderRadius: {
                'sm': '0.375rem',    // 6px
                'DEFAULT': '0.5rem', // 8px
                'md': '0.5rem',      // 8px
                'lg': '0.75rem',     // 12px
                'xl': '1rem',        // 16px
                '2xl': '1.25rem',    // 20px
                '3xl': '1.5rem',     // 24px
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                // Custom teal shadows for buttons
                'teal': '0 4px 12px rgba(61, 203, 177, 0.3)',
                'teal-lg': '0 8px 16px rgba(61, 203, 177, 0.4)',
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'slide-up': 'slideUp 0.4s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
                'scale-up': 'scaleUp 0.3s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                scaleUp: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
        },
    },
    plugins: [],
}
