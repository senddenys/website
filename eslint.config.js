export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "browser",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setTimeout: "readonly",
        requestAnimationFrame: "readonly",
        gtag: "readonly",
        dataLayer: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error"
    }
  }
];
