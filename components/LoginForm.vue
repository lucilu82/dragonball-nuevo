<script setup lang="ts">
import type { NitroFetchError } from 'nitropack'

const props = defineProps<{
  redirectTo?: string
}>()

const config = useRuntimeConfig()
const router = useRouter()
const route = useRoute()
const xsrfCookie = useCookie<string | null>('XSRF-TOKEN')

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const errors = ref<Record<string, string[]>>({})
const status = ref<string | null>(null)
const loading = ref(false)

const redirectTarget = computed(() => props.redirectTo ?? '/')

const ensureCsrfToken = async () => {
  if (xsrfCookie.value) {
    return
  }

  await $fetch(`${config.public.laravelBase}/sanctum/csrf-cookie`, {
    credentials: 'include',
  })
}

const submit = async () => {
  loading.value = true
  errors.value = {}
  status.value = null

  try {
    await ensureCsrfToken()

    const csrfHeader = xsrfCookie.value ? decodeURIComponent(xsrfCookie.value) : ''

    const response = await $fetch<{
      message?: string
      redirect_to?: string
    }>(`${config.public.laravelBase}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-XSRF-TOKEN': csrfHeader,
      },
      body: {
        email: form.email,
        password: form.password,
        remember: form.remember,
      },
    })

    status.value = response?.message ?? '¡Bienvenido de nuevo!'

    if (route.path !== redirectTarget.value) {
      await router.push(response?.redirect_to ?? redirectTarget.value)
    }
  } catch (error) {
    const fetchError = error as NitroFetchError<{
      message?: string
      errors?: Record<string, string[]>
    }>

    if (fetchError.statusCode === 422 && fetchError.data?.errors) {
      errors.value = fetchError.data.errors
      status.value = fetchError.data.message ?? 'Corrige los campos marcados.'
      return
    }

    status.value = fetchError?.data?.message ?? 'No pudimos iniciar sesión. Inténtalo nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submit">
    <div v-if="status" class="rounded-md border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
      {{ status }}
    </div>

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
      <input
        v-model="form.email"
        type="email"
        class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
        placeholder="goku@capsulecorp.com"
        required
        autocomplete="email"
      >
    </label>

    <template v-if="errors.password">
      <div class="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
        <ul class="space-y-1">
          <li v-for="error in errors.password" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </template>

    <label class="block text-sm font-medium text-slate-300">
      Contraseña
      <input
        v-model="form.password"
        type="password"
        class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
        required
        autocomplete="current-password"
      >
    </label>

    <label class="flex items-center gap-2 text-sm text-slate-300">
      <input
        v-model="form.remember"
        type="checkbox"
        class="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-400 focus:ring-emerald-400/60"
      >
      Recordarme en este dispositivo
    </label>

    <button
      type="submit"
      :disabled="loading"
      class="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/70 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
    >
      <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <span>{{ loading ? 'Ingresando...' : 'Iniciar sesión' }}</span>
    </button>
  </form>
</template>

