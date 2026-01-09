<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
    <div class="absolute inset-0 bg-[url('https://web.dragonball-api.com/images-compress/backgrounds/background_planets.webp')] opacity-10 mix-blend-screen pointer-events-none"></div>
    <div class="relative flex min-h-screen items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div class="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-slate-900/80 shadow-2xl shadow-indigo-500/20 backdrop-blur-lg md:flex-row">
        <div class="hidden w-full flex-1 flex-col justify-between bg-gradient-to-br from-indigo-600 via-purple-600 to-slate-900 p-6 sm:p-8 lg:p-10 text-indigo-100 md:flex">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">Únete a la comunidad Dragon Ball</h2>
            <p class="mt-3 sm:mt-4 text-sm sm:text-base text-indigo-100/90">
              Registra una cuenta para coleccionar personajes, crear nuevas fichas y disfrutar de contenido exclusivo.
            </p>
          </div>
          <ul class="space-y-4 text-sm">
            <li class="flex items-start gap-3">
              <span class="mt-1 text-lg">✨</span>
              <span>Accede a estadísticas personalizadas de tus guerreros favoritos.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 text-lg">🛡️</span>
              <span>Tus datos están protegidos con autenticación segura de la Patrulla Roja.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 text-lg">⚙️</span>
              <span>Gestiona tus planetas y transformaciones desde un panel intuitivo.</span>
            </li>
          </ul>
          <div class="rounded-2xl bg-white/10 p-5 text-sm text-indigo-100/90 shadow-lg shadow-indigo-900/30">
            <p>
              ¿Ya tienes una cuenta?
              <NuxtLink to="/login" class="font-semibold text-white underline-offset-4 hover:underline">
                Inicia sesión aquí
              </NuxtLink>
              y continúa tu entrenamiento.
            </p>
          </div>
        </div>
        <div class="w-full flex-1 bg-slate-950/40 p-6 sm:p-8 lg:p-10">
          <div class="mx-auto w-full max-w-md">
            <NuxtLink to="/" class="mb-6 sm:mb-8 inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-slate-200">
              <span aria-hidden="true">←</span>
              Volver al inicio
            </NuxtLink>
            <div class="mb-5 sm:mb-6 text-center">
              <h1 class="text-2xl sm:text-3xl font-bold text-white">Crear cuenta</h1>
              <p class="mt-2 text-xs sm:text-sm text-slate-400">
                Completa el formulario y libera tu poder interior.
              </p>
            </div>
            <RegisterForm :redirect-to="'/area-personal'" />
            <p class="mt-6 text-center text-sm text-slate-400">
              ¿Ya estás registrado?
              <NuxtLink to="/login" class="font-semibold text-indigo-400 hover:text-indigo-300">
                Inicia sesión
              </NuxtLink>
            </p>
            <p class="mt-4 text-center text-xs text-slate-500">
              Al registrarte aceptas las normas del Torneo de Artes Marciales y nuestras políticas de privacidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import RegisterForm from '~/components/RegisterForm.vue'
</script>
