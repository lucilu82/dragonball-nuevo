export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      laravelBase: 'http://localhost:8000',
    },
  },

  app: {
    head: {
      meta: [
        { name: 'referrer', content: 'no-referrer-when-downgrade' }
      ]
    }
  },

  css: ['~/assets/css/main.css'], // <-- FALTABA

  modules: [
    '@nuxtjs/tailwindcss',        // <-- FALTABA
  ],

  nitro: {
    // NO configurar proxy aquí - las rutas de server/api/ deben funcionar directamente
    // Si necesitas hacer proxy a Laravel, hazlo solo para rutas específicas que no existen en Nuxt
  },

  devtools: { enabled: true },

  vite: {
    server: {
      cors: true,
      // Removemos el proxy de Vite ya que las rutas del servidor de Nuxt deben tener prioridad
      // El proxy solo se usará para rutas que no existen en server/api/
    },
  },
})
