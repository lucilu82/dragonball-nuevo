<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
    <div class="absolute inset-0 bg-[url('https://web.dragonball-api.com/images-compress/backgrounds/background_planets.webp')] opacity-10 mix-blend-screen pointer-events-none"></div>

    <div class="relative flex min-h-screen items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div class="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-400/30 bg-slate-900/80 shadow-2xl shadow-amber-400/20 backdrop-blur-lg md:flex-row">

        <!-- Panel lateral -->
        <div class="hidden w-full flex-1 flex-col justify-between bg-gradient-to-br from-amber-600 via-orange-600 to-slate-900 p-6 sm:p-8 lg:p-10 text-amber-100 md:flex">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">¿Olvidaste tu contraseña?</h2>
            <p class="mt-3 sm:mt-4 text-sm sm:text-base text-amber-100/90">
              No te preocupes, incluso los guerreros Z a veces olvidan su clave de acceso.
            </p>
          </div>

          <ul class="space-y-4 text-sm">
            <li class="flex items-start gap-3">
              <span class="mt-1 text-lg">💌</span>
              <span>Recibirás un correo con un enlace para restablecer tu contraseña.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 text-lg">🔐</span>
              <span>Tu cuenta seguirá protegida gracias a los tokens de seguridad de Capsule Corp.</span>
            </li>
          </ul>

          <div class="rounded-2xl bg-white/10 p-5 text-sm text-amber-100/90 shadow-lg shadow-amber-900/30">
            <p>
              ¿Recordaste tu contraseña?
              <NuxtLink to="/login" class="font-semibold text-white underline-offset-4 hover:underline">
                Inicia sesión
              </NuxtLink>
            </p>
          </div>
        </div>

        <!-- Formulario -->
        <div class="w-full flex-1 bg-slate-950/40 p-6 sm:p-8 lg:p-10">
          <div class="mx-auto w-full max-w-md">
            <NuxtLink to="/" class="mb-6 sm:mb-8 inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-slate-200">
              <span aria-hidden="true">←</span>
              Volver al inicio
            </NuxtLink>

            <div class="mb-5 sm:mb-6 text-center">
              <h1 class="text-2xl sm:text-3xl font-bold text-white">Recuperar contraseña</h1>
              <p class="mt-2 text-xs sm:text-sm text-slate-400">
                Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </div>

            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
