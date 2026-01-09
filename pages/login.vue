<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
    <div class="absolute inset-0 bg-[url('https://web.dragonball-api.com/images-compress/backgrounds/background_planets.webp')] opacity-10 mix-blend-screen pointer-events-none"></div>
    <div class="relative flex min-h-screen items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div class="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-500/20 bg-slate-900/80 shadow-2xl shadow-emerald-500/20 backdrop-blur-lg md:flex-row">
        <div class="hidden w-full flex-1 flex-col justify-between bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 p-6 sm:p-8 lg:p-10 text-emerald-100 md:flex">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">Bienvenido de vuelta guerrero Z</h2>
            <p class="mt-3 sm:mt-4 text-sm sm:text-base text-emerald-100/90">
              Inicia sesión para continuar registrando personajes, planetas y transformaciones épicas.
            </p>
          </div>
          <ul class="space-y-4 text-sm">
            <li class="flex items-start gap-3">
              <span class="mt-1 text-lg">🚀</span>
              <span>Recupera tus colecciones y continúa justo donde las dejaste.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 text-lg">🔐</span>
              <span>Seguridad reforzada con tokens de energía certificados por Capsule Corp.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 text-lg">📡</span>
              <span>Sincroniza tu progreso con cualquier dispositivo de la Patrulla Galáctica.</span>
            </li>
          </ul>
          <div class="rounded-2xl bg-white/10 p-5 text-sm text-emerald-100/90 shadow-lg shadow-emerald-900/30">
            <p>
              ¿Aún no tienes cuenta?
              <NuxtLink to="/register" class="font-semibold text-white underline-offset-4 hover:underline">
                Regístrate gratis
              </NuxtLink>
              y desbloquea contenido exclusivo.
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
              <h1 class="text-2xl sm:text-3xl font-bold text-white">Iniciar sesión</h1>
              <p class="mt-2 text-xs sm:text-sm text-slate-400">
                Ingresa tus credenciales para retomar tu entrenamiento.
              </p>
            </div>
            <LoginForm :redirect-to="'/area-personal'" />
            <p class="mt-6 text-center text-sm text-slate-400">
              ¿Aún no tienes cuenta?
              <NuxtLink to="/register" class="font-semibold text-emerald-400 hover:text-emerald-300">
                Crear una cuenta
              </NuxtLink>
            </p>
            <p class="mt-4 text-center text-xs text-slate-500">
              Protegemos tu información como si fuera una esfera del dragón.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '~/components/LoginForm.vue'
</script>
