module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontSize: {
        xxs: '0.65rem',
      },
      keyframes: {
        'fade-in': {
          '0%': {
            opacity: 0,
          },
          '100%': {
            opacity: 1,
          },
        },
        'slide-left-out': {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(-100%)',
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-left-out': 'slide-left-out 350ms ease-in',
      },
    },
  },
  plugins: [],
};
