<script setup lang="ts">
import { ref, reactive, computed, onBeforeUnmount } from 'vue'
import { useRouter, useRoute, useRuntimeConfig } from '#app'
import type { FetchError } from 'ofetch'
import { useAuth } from '~/composables/useAuth'

const props = defineProps<{ redirectTo?: string }>()

const config = useRuntimeConfig()
const router = useRouter()
const route = useRoute()
const { fetchUser, csrf } = useAuth()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  remember: false,
})

const errors = ref<Record<string, string[]>>({})
const status = ref<string | null>(null)
const loading = ref(false)
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

const redirectTarget = computed(() => {
  if (typeof route.query.redirect === 'string' && route.query.redirect.length > 0) {
    return route.query.redirect
  }

  return props.redirectTo ?? '/area-personal'
})

let redirectTimer: ReturnType<typeof setTimeout> | null = null

onBeforeUnmount(() => {
  if (redirectTimer) clearTimeout(redirectTimer)
})

// Funciones para toggle de visibilidad de contraseña
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const togglePasswordConfirmationVisibility = () => {
  showPasswordConfirmation.value = !showPasswordConfirmation.value
}

// --- ENVÍO DEL FORMULARIO ---
const submit = async () => {
  loading.value = true
  errors.value = {}
  status.value = null

  try {
    // 1️⃣ Obtener token CSRF usando el endpoint del servidor de Nuxt
    await csrf()
    
    // Esperar un momento para que la cookie se establezca
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 2️⃣ Obtener el token CSRF de las cookies
    const getCsrfToken = (): string | null => {
      if (typeof document === 'undefined') return null
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'XSRF-TOKEN' && value) {
          return decodeURIComponent(value)
        }
      }
      return null
    }
    
    let csrfToken = getCsrfToken()
    
    // Si no hay token, intentar obtenerlo nuevamente
    if (!csrfToken) {
      console.warn('⚠️ No se encontró token CSRF, reintentando...')
      await csrf()
      await new Promise(resolve => setTimeout(resolve, 500))
      csrfToken = getCsrfToken()
    }
    
    // Log para depuración
    if (csrfToken) {
      console.log('✅ Token CSRF obtenido:', csrfToken.substring(0, 20) + '...')
    } else {
      console.error('❌ No se pudo obtener el token CSRF')
      console.log('📋 Cookies disponibles:', document.cookie)
      status.value = '⚠️ Error de seguridad. Por favor, recarga la página e intenta nuevamente.'
      return
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    }
    
    // Agregar el token CSRF en los headers
    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = csrfToken
      headers['X-CSRF-TOKEN'] = csrfToken
    }

    // 3️⃣ Hacemos la petición al backend usando el proxy del servidor de Nuxt
    const response = await $fetch<{ message?: string; redirect_to?: string }>(
      '/api/register',
      {
        method: 'POST',
        credentials: 'include',
        headers,
        body: {
          name: form.name,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
          remember: form.remember,
        },
      }
    )

    status.value = response?.message ?? '¡Registro exitoso! Bienvenido a tu área personal.'
    await fetchUser().catch(() => null)
    await router.push(redirectTarget.value)
  } catch (error) {
    const fetchError = error as FetchError<{
      message?: string
      errors?: Record<string, string[]>
    }>

    if (fetchError.statusCode === 422 && fetchError.data?.errors) {
      errors.value = fetchError.data.errors
      const emailErrors = fetchError.data.errors.email ?? []
      const emailAlreadyTaken = emailErrors.some((m) =>
        m.toLowerCase().includes('ya ha sido registrado')
      )

      if (emailAlreadyTaken) {
        status.value = 'Este correo ya está registrado. Redirigiéndote a iniciar sesión...'
        redirectTimer = setTimeout(() => {
          router.push({
            path: '/login',
            query: { email: form.email, status: 'email-registered' },
          })
        }, 1500)
        return
      }

      status.value = fetchError.data.message ?? 'Revisa los campos e inténtalo de nuevo.'
      return
    }

    // Manejo específico de errores CSRF (419)
    if (fetchError.statusCode === 419) {
      status.value = '⚠️ Error de seguridad (CSRF). Por favor, recarga la página e intenta nuevamente.'
      return
    }
    
    status.value = fetchError?.data?.message ?? 'Ha ocurrido un error inesperado.'
  } finally {
    loading.value = false
  }
}

</script>


<template>
  <form class="space-y-5" @submit.prevent="submit">
    <div v-if="status" class="rounded-md border border-indigo-400/40 bg-indigo-500/10 p-3 text-sm text-indigo-200">
      {{ status }}
    </div>

    <template v-if="errors.name">
      <div class="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
        <ul class="space-y-1">
          <li v-for="error in errors.name" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </template>

    <label class="block text-sm font-medium text-slate-300">
      Nombre
      <input v-model="form.name" type="text"
        class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
        placeholder="Son Goku" required>
    </label>

    <template v-if="errors.email">
      <div class="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
        <ul class="space-y-1">
          <li v-for="error in errors.email" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </template>

    <label class="block text-sm font-medium text-slate-300">
      Correo electrónico
      <input v-model="form.email" @input="form.email = form.email.toLowerCase()" type="email"
        class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
        placeholder="goku@capsulecorp.com" required>
    </label>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <template v-if="errors.password">
          <div class="mb-3 rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
            <ul class="space-y-1">
              <li v-for="error in errors.password" :key="error">
                {{ error }}
              </li>
            </ul>
          </div>
        </template>

        <label class="block text-sm font-medium text-slate-300">
          Contraseña
          <div class="relative mt-1">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 pr-10 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
              placeholder="Mínimo 8 caracteres"
              required
              minlength="8"
            />
            <button
              type="button"
              @click="togglePasswordVisibility"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition-colors duration-200"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <svg
                v-if="showPassword"
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
              <svg
                v-else
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
        </label>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-300">
          Confirmar contraseña
          <div class="relative mt-1">
            <input
              v-model="form.password_confirmation"
              :type="showPasswordConfirmation ? 'text' : 'password'"
              class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 pr-10 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
              placeholder="Repite tu contraseña"
              required
            />
            <button
              type="button"
              @click="togglePasswordConfirmationVisibility"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition-colors duration-200"
              :aria-label="showPasswordConfirmation ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <svg
                v-if="showPasswordConfirmation"
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
              <svg
                v-else
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
        </label>
      </div>
    </div>

    <label class="flex items-center gap-2 text-sm text-slate-300">
      <input v-model="form.remember" type="checkbox"
        class="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-400 focus:ring-indigo-400/60">
      Recordarme en este dispositivo
    </label>

    <button type="submit" :disabled="loading"
      class="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/70 disabled:cursor-not-allowed disabled:bg-indigo-500/60">
      <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <span>{{ loading ? 'Registrando...' : 'Crear cuenta' }}</span>
    </button>
  </form>
</template>
