module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontSize: {
        xxs: "0.65rem",
      },
      keyframes: {
        ripple: { to: { transform: "scale(4)", opacity: "0" } },
        "sidebar-in": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "sidebar-out": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
        "pop-in": {
          "0%": { opacity: 0, transform: "scale(95%)" },
          "100%": { opacity: 1, transform: "scale(100%)" },
        },
        "pop-out": {
          "0%": { opacity: 1, transform: "scale(100%)" },
          "100%": { opacity: 0, transform: "scale(95%)" },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "fade-out": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "d-down-open": {
          from: { transform: "scale(95%)", opacity: "10%" },
          to: { transform: "scale(1)", opacity: 1 },
        },
        "d-down-close": {
          from: { transform: "scale(1)", opacity: 1 },
          to: { transform: "scale(95%)", opacity: "10%" },
        },
      },
      animation: {
        ripple: "ripple 600ms linear",
        "sidebar-in": "sidebar-in 350ms ease-out",
        "sidebar-out": "sidebar-out 350ms ease-in",
        "pop-in": "pop-in 200ms ease-in",
        "pop-out": "pop-out 200ms ease-in",
        "fade-in": "fade-in 200ms ease-in",
        "fade-out": "fade-out 200ms ease-in",
        "d-down-open": "d-down-open 200ms ease-out",
        "d-down-close": "d-down-close 200ms ease-out",
      },
    },
  },
  plugins: [],
};
