/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "fufu-bg": "#FFF9F4",
        "fufu-surface": "#FFFFFF",
        "fufu-ink": "#28170E",
        "fufu-ink-soft": "#4F3B2E",
        "fufu-muted": "#806E60",
        "fufu-line": "rgba(40, 23, 14, 0.12)",
        "fufu-primary": "#E95F18",
        "fufu-primary-deep": "#C94B0D",
        "fufu-primary-soft": "#FFF0E7",
        "fufu-butter": "#F7C35B",
        "fufu-butter-soft": "#FFF5D8",
        "fufu-sage-soft": "#EAF2E5",
        "fufu-success": "#2F7D5B",
        "fufu-danger": "#B42318",
        "fufu-white": "#FFFFFF",
      },
      fontFamily: {
        outfit: ["Outfit_400Regular"],
        "outfit-medium": ["Outfit_500Medium"],
        "outfit-semibold": ["Outfit_600SemiBold"],
        "outfit-bold": ["Outfit_700Bold"],
        "outfit-extrabold": ["Outfit_800ExtraBold"],
      },
    },
  },
  plugins: [],
};
