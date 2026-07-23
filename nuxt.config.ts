export default defineNuxtConfig({
  compatibilityDate: "2026-06-30",
  devtools: { enabled: false },
  fonts: {
    provider: "local",
  },
  modules: ["@nuxt/ui", "@pinia/nuxt", "nuxt-auth-utils"],
  css: ["~/assets/css/main.css"],
  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
  },
  app: {
    head: {
      title: "GAZLiga",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "msapplication-TileColor", content: "#da532c" },
        { name: "theme-color", content: "#ffffff" },
      ],
      htmlAttrs: {
        lang: "ru",
      },
    },
  },
});
