<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
    <div class="absolute inset-0 opacity-10 mix-blend-screen pointer-events-none"
      style="background-image: url('https://web.dragonball-api.com/images-compress/backgrounds/background_planets.webp'); background-size: cover;">
    </div>

    <div class="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-12 lg:flex-row lg:items-start">
      <section class="flex-1 rounded-3xl border border-emerald-400/10 bg-slate-900/80 p-8 shadow-2xl shadow-emerald-500/20 backdrop-blur">
        <header class="mb-8 flex flex-wrap items-center gap-4">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-3xl">
            🐉
          </div>
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-emerald-300/80">Área privada</p>
            <h1 class="text-3xl font-semibold text-white">Panel del guerrero Z</h1>
          </div>
          <div class="ml-auto">
            <button @click="refreshProfile" :disabled="loading"
              class="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/10 disabled:opacity-60">
              <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-transparent" />
              Actualizar datos
            </button>
          </div>
        </header>

        <div v-if="errorMessage" class="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {{ errorMessage }}
        </div>

        <div v-if="loading" class="grid gap-6 md:grid-cols-2">
          <div v-for="s in 4" :key="s" class="h-36 animate-pulse rounded-2xl bg-slate-800/60"></div>
        </div>

        <div v-else-if="user" class="space-y-6">
          <div class="rounded-2xl border border-white/5 bg-white/5 p-6">
            <p class="text-sm text-white/60">Bienvenido</p>
            <h2 class="text-2xl font-semibold text-white">{{ user.name }}</h2>
            <p class="mt-2 text-sm text-white/70">{{ user.email }}</p>
          </div>

          <div class="grid gap-6 md:grid-cols-3">
            <div class="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">
              <p class="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Estado</p>
              <p class="mt-2 text-2xl font-bold text-emerald-100">Autenticado</p>
              <p class="mt-1 text-xs text-emerald-100/70">Sesión protegida con Sanctum</p>
            </div>
            <div class="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-5">
              <p class="text-sm uppercase tracking-[0.2em] text-cyan-100/80">Planetas</p>
              <p class="mt-2 text-2xl font-bold text-cyan-100">Gestiona tus mundos</p>
              <NuxtLink to="/planetas" class="mt-2 inline-flex items-center text-sm text-cyan-200 underline-offset-4 hover:underline">
                Ir a planetas →
              </NuxtLink>
            </div>
            <div class="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5">
              <p class="text-sm uppercase tracking-[0.2em] text-amber-100/80">Personajes</p>
              <p class="mt-2 text-2xl font-bold text-amber-100">Crea fichas épicas</p>
              <NuxtLink to="/personajes" class="mt-2 inline-flex items-center text-sm text-amber-200 underline-offset-4 hover:underline">
                Gestionar personajes →
              </NuxtLink>
            </div>
          </div>

          <div class="rounded-2xl border border-white/5 bg-white/5 p-6">
            <h3 class="text-xl font-semibold text-white">Acciones rápidas</h3>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <NuxtLink to="/nuevo-personaje"
                class="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-emerald-400/60 hover:bg-emerald-400/10">
                Registrar personaje <span>⚡</span>
              </NuxtLink>
              <NuxtLink to="/nuevo-planeta"
                class="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/60 hover:bg-cyan-400/10">
                Registrar planeta <span>🪐</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <aside class="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/10 p-8 text-white shadow-xl backdrop-blur">
        <div class="space-y-6">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-white/60">Sesión</p>
            <h3 class="text-2xl font-semibold">Panel de control</h3>
          </div>
          <ul class="space-y-4 text-sm text-white/80">
            <li class="flex items-center gap-3">
              <span class="text-lg">🛡️</span>
              Protección con Laravel Sanctum y cookies seguras.
            </li>
            <li class="flex items-center gap-3">
              <span class="text-lg">🔄</span>
              Refresca tu sesión en cualquier momento.
            </li>
            <li class="flex items-center gap-3">
              <span class="text-lg">🚪</span>
              Cierra sesión para cambiar de guerrero Z.
            </li>
          </ul>
          <button @click="handleLogout" :disabled="loggingOut"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/80 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-60">
            <span v-if="loggingOut" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Cerrar sesión
          </button>
          <NuxtLink to="/" class="block text-center text-sm text-white/70 underline-offset-4 hover:underline">
            Volver al inicio
          </NuxtLink>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const { user, status, fetchUser, logout } = useAuth()
const errorMessage = ref<string | null>(null)
const loggingOut = ref(false)

const loading = computed(() => status.value === 'loading' && !user.value)

const refreshProfile = async () => {
  errorMessage.value = null
  try {
    await fetchUser({ force: true })
    if (!user.value) {
      throw new Error('No se pudo recuperar la sesión activa.')
    }
  } catch (error) {
    console.error('No se pudo refrescar la sesión', error)
    errorMessage.value = 'No pudimos refrescar tu perfil. Inténtalo de nuevo.'
  }
}

const ensureSession = async () => {
  if (import.meta.server || user.value) {
    return
  }

  try {
    await fetchUser({ force: true })

    if (!user.value) {
      await router.push({
        path: '/login',
        query: { redirect: '/area-personal' },
      })
    }
  } catch (error) {
    console.error('Error asegurando sesión', error)
    await router.push({
      path: '/login',
      query: { redirect: '/area-personal' },
    })
  }
}

const handleLogout = async () => {
  loggingOut.value = true
  errorMessage.value = null

  try {
    await logout()
    await router.push('/login')
  } catch (error) {
    console.error('No se pudo cerrar sesión', error)
    errorMessage.value = 'No pudimos cerrar tu sesión. Inténtalo nuevamente.'
  } finally {
    loggingOut.value = false
  }
}

onMounted(ensureSession)
</script>






