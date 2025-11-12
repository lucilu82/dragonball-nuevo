export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: './', // 👈 añadimos esto por si Nuxt no detecta el directorio raíz
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  nitro: {
    experimental: {
      wasm: true
    }
  },
  runtimeConfig: {
    public: {
      apiBase: 'https://dragonball-api.com',
      // Fuente de datos para planetas: 'proxy' (recomendado), 'laravel', 'external'
      planetsSource: 'proxy',
      // Base del backend Laravel (solo si usas 'laravel' como fuente)
      laravelBase: 'http://127.0.0.1:8000',
      // Prefijo de rutas API en Laravel
      laravelApiPrefix: '/api'
    }
  }
})
