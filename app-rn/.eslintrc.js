module.exports = {
  root: true,
  extends: "@react-native",
  plugins: ["unused-imports"],
  rules: {
    "unused-imports/no-unused-imports": "error",
    "react-native/no-inline-styles": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
};
