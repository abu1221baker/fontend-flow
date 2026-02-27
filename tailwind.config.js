/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#0A0C14',
          card: '#161B2E',
          active: '#1F243B',
        },
        brand: {
          coke: '#F40009',
          purple: '#8B5CF6',
        },
        accent: {
          green: '#10B981',
          blue: '#3B82F6',
        }
      },
      boxShadow: {
        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        'lifted': '0 25px 30px -10px rgba(0, 0, 0, 0.5), 0 15px 15px -10px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
