import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

// Import translations
import en from "../locales/en.json";
import es from "../locales/es.json";

// Get device language
const deviceLanguage = Localization.getLocales()[0]?.languageCode || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: deviceLanguage, // Use device language
  fallbackLng: "en", // Fallback to English if translation not found
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  compatibilityJSON: "v4", // For i18next latest
});

export default i18n;
