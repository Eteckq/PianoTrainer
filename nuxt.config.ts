// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  ssr: false,
  nitro: {
    experimental: {
      websocket: true
    }
  },
  // devServer: {
  //   https: {
  //     key: './server.key',
  //     cert: './server.crt'
  //   }
  // },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      title: 'Piano Trainer',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => ["BlurFilter", "Graphics"].includes(tag),
    },
  },
  css: ["~/assets/css/main.css"],
  modules: ["@pinia/nuxt"],
});
