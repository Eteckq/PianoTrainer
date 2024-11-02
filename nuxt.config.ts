// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  ssr: false,
  nitro: {
    experimental: {
      websocket: true
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => ["BlurFilter", "Graphics"].includes(tag),
    },
  },
  css: ["~/assets/css/main.css"],
  modules: ["@pinia/nuxt"],
});
