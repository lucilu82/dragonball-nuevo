<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRuntimeConfig } from '#app'
import type { FetchError } from 'ofetch'
import { useAuth } from '~/composables/useAuth'

const config = useRuntimeConfig()
const form = reactive({ email: '' })
const status = ref<string | null>(null)
const loading = ref(false)
const errors = ref<Record<string, string[]>>({})
const { csrf } = useAuth()

const submit = async () => {
  loading.value = true
  status.value = null
  errors.value = {}

  try {
    // Obtener token CSRF
    await csrf()
    
    // Esperar un momento para que la cookie se establezca
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Obtener el token CSRF de las cookies
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
    
    const csrfToken = getCsrfToken()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    }
    
    // Agregar el token CSRF si está disponible
    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = csrfToken
      headers['X-CSRF-TOKEN'] = csrfToken
    }

    // Usar el proxy del servidor de Nuxt
    await $fetch('/api/forgot-password', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: { email: form.email.trim().toLowerCase() },
    })

    status.value =
      '✅ Si el correo está registrado, te hemos enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.'
    form.email = ''
  } catch (error) {
    const fetchError = error as FetchError<{
      message?: string
      errors?: Record<string, string[]>
    }>

    // Manejo específico de errores 404
    if (fetchError.statusCode === 404) {
      status.value = '⚠️ El servicio de recuperación de contraseña no está disponible. Por favor, contacta al administrador.'
      return
    }
    
    // Manejo específico de errores CSRF (419)
    if (fetchError.statusCode === 419) {
      status.value = '⚠️ Error de seguridad (CSRF). Por favor, recarga la página e intenta nuevamente.'
      return
    }
    
    if (fetchError.statusCode === 422 && fetchError.data?.errors) {
      errors.value = fetchError.data.errors
      status.value = fetchError.data.message ?? 'Revisa el correo e inténtalo de nuevo.'
      return
    }

    status.value = fetchError?.data?.message || '⚠️ Error inesperado. Intenta más tarde.'
  } finally {
    loading.value = false
  }
}
</script>


<template>
  <form class="space-y-5" @submit.prevent="submit">
    <!-- Mensaje de estado -->
    <div
      v-if="status"
      :class="[
        'rounded-md border p-3 text-sm',
        status.includes('✅')
          ? 'border-green-400/40 bg-green-500/10 text-green-200'
          : status.includes('⚠️')
          ? 'border-amber-400/40 bg-amber-500/10 text-amber-200'
          : 'border-red-400/40 bg-red-500/10 text-red-200'
      ]"
    >
      {{ status }}
    </div>

    <!-- Errores de validación -->
    <template v-if="errors.email">
      <div class="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
        <ul class="space-y-1">
          <li v-for="error in errors.email" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </template>

    <!-- Campo de email -->
    <label class="block text-sm font-medium text-slate-300">
      Correo electrónico
      <input
        v-model="form.email"
        @input="form.email = form.email.toLowerCase()"
        type="email"
        class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
        placeholder="goku@capsulecorp.com"
        required
        autocomplete="email"
      />
    </label>

    <!-- Botón de envío -->
    <button
      type="submit"
      :disabled="loading"
      class="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-white transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/70 disabled:cursor-not-allowed disabled:bg-amber-500/60"
    >
      <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <span>{{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}</span>
    </button>

    <!-- Enlace para volver al login -->
    <p class="mt-4 text-center text-sm text-slate-400">
      <NuxtLink to="/login" class="font-semibold text-amber-400 hover:text-amber-300 transition-colors duration-200">
        ← Volver al inicio de sesión
      </NuxtLink>
    </p>
  </form>
</template>
