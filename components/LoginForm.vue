<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter, useRoute } from '#app'

const props = defineProps<{ redirectTo?: string }>()

const auth = useAuth()
const router = useRouter()
const route = useRoute()

const email = ref<string>('')
const password = ref<string>('')
const showPassword = ref(false)
const remember = ref(false)

const loading = ref(false)
const errorMessage = ref<string>('')

const redirectTarget = computed(() => {
  if (typeof route.query.redirect === 'string' && route.query.redirect.length > 0) {
    return route.query.redirect
  }
  return props.redirectTo ?? '/area-personal'
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const submitLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    await auth.csrf()
    await auth.login(email.value.trim(), password.value.trim())
    await auth.fetchUser()
    
    // Redirigir después del login exitoso
    await router.push(redirectTarget.value)
  } catch (err: unknown) {
    const e = err as { 
      data?: { 
        message?: string
        errors?: Record<string, string[]>
      }
      message?: string
      statusCode?: number
      status?: number
    }
    
    // Determinar el mensaje de error según el tipo
    let mensajeError = 'Credenciales inválidas'
    
    // Si hay un mensaje específico del servidor
    if (e?.data?.message) {
      mensajeError = e.data.message
    } else if (e?.message) {
      mensajeError = e.message
    }
    
    // Si hay errores de validación (422)
    if (e?.data?.errors) {
      const errores = e.data.errors
      if (errores.email) {
        mensajeError = errores.email[0] || mensajeError
      } else if (errores.password) {
        mensajeError = errores.password[0] || mensajeError
      }
    }
    
    // Mensajes específicos según el código de estado
    const statusCode = e?.statusCode || e?.status
    const mensajeLower = mensajeError.toLowerCase()
    
    // Manejo específico de errores CSRF
    if (mensajeLower.includes('csrf') || mensajeLower.includes('token mismatch')) {
      mensajeError = '⚠️ Error de seguridad. Por favor, recarga la página e intenta nuevamente.'
    } else if (statusCode === 401 || statusCode === 422) {
      // Verificar si el mensaje contiene palabras clave relacionadas con contraseña
      if (mensajeLower.includes('password') || mensajeLower.includes('contraseña') || mensajeLower.includes('credenciales')) {
        mensajeError = '❌ La contraseña es incorrecta. Por favor, verifica e intenta nuevamente.'
      } else if (mensajeLower.includes('email') || mensajeLower.includes('correo') || mensajeLower.includes('usuario')) {
        mensajeError = '❌ El correo electrónico no está registrado o es incorrecto.'
      } else {
        mensajeError = '❌ ' + mensajeError
      }
    } else {
      mensajeError = '❌ ' + mensajeError
    }
    
    errorMessage.value = mensajeError
    
    // Limpiar el campo de contraseña después de un error
    password.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submitLogin">
    <!-- Mensaje de error -->
    <div 
      v-if="errorMessage" 
      class="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200 flex items-start gap-2 animate-shake"
    >
      <svg 
        class="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span class="flex-1">{{ errorMessage }}</span>
    </div>

    <!-- Campo de email -->
    <label class="block text-sm font-medium text-slate-300">
      Correo electrónico
      <input
        v-model="email"
        type="email"
        class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
        placeholder="goku@capsulecorp.com"
        required
        autocomplete="email"
      />
    </label>

    <!-- Campo de contraseña con icono de ojo -->
    <label class="block text-sm font-medium text-slate-300">
      Contraseña
      <div class="relative mt-1">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          :class="[
            'w-full rounded-lg border px-3 py-2 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors duration-200',
            errorMessage 
              ? 'border-red-500 bg-red-900/20 focus:border-red-400 focus:ring-red-400/60' 
              : 'border-slate-700 bg-slate-900/60 focus:border-emerald-400 focus:ring-emerald-400/60'
          ]"
          placeholder="Ingresa tu contraseña"
          required
          autocomplete="current-password"
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

    <!-- Checkbox de recordar -->
    <label class="flex items-center gap-2 text-sm text-slate-300">
      <input
        v-model="remember"
        type="checkbox"
        class="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-400 focus:ring-emerald-400/60"
      />
      Recordarme en este dispositivo
    </label>

    <!-- Botón de envío -->
    <button
      type="submit"
      :disabled="loading"
      class="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/70 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
    >
      <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <span>{{ loading ? 'Ingresando...' : 'Iniciar sesión' }}</span>
    </button>

    <!-- Enlace para recuperar contraseña -->
    <div class="text-center">
      <NuxtLink
        to="/forgot-password"
        class="text-sm text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
      >
        ¿Olvidaste tu contraseña?
      </NuxtLink>
    </div>
  </form>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}
</style>
