import { useRuntimeConfig, useState } from '#imports'
import type { FetchError } from 'ofetch'

type AuthUser = {
  id: number
  name: string
  email: string
  email_verified_at?: string | null
  [key: string]: unknown
}

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest' | 'error'

export const useAuth = () => {
  const config = useRuntimeConfig()
  const base = config.public.laravelBase || 'http://localhost:8000'

  const user = useState<AuthUser | null>('auth:user', () => null)
  const status = useState<AuthStatus>('auth:status', () => 'idle')

  const csrf = async () => {
    try {
      // Usar el endpoint del servidor de Nuxt que hace proxy a Laravel
      await $fetch('/api/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      })
    } catch (error) {
      console.error('Error obteniendo CSRF token:', error)
      throw error
    }
  }

  // Función para obtener el token CSRF de las cookies
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

  const fetchUser = async () => {
    try {
      status.value = 'loading'

      const data = await $fetch<AuthUser | null>(`${base}/api/user`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (data) {
        user.value = data
        status.value = 'authenticated'
      } else {
        user.value = null
        status.value = 'guest'
      }

      return user.value
    } catch (error) {
      const fetchError = error as FetchError

      if (fetchError.statusCode === 401) {
        user.value = null
        status.value = 'guest'
        return null
      }

      status.value = 'error'
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    // Obtener token CSRF primero
    await csrf()
    
    // Esperar un momento para que la cookie se establezca
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Obtener el token de la cookie
    const csrfToken = getCsrfToken()
    
    if (!csrfToken) {
      console.warn('⚠️ No se pudo obtener el token CSRF de las cookies')
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    }
    
    // Agregar el token CSRF si está disponible
    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = csrfToken
      headers['X-CSRF-TOKEN'] = csrfToken
    }

    try {
      await $fetch(`${base}/login`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: { email, password },
      })

      return fetchUser()
    } catch (error: any) {
      // Si hay error de CSRF, intentar obtener un nuevo token y reintentar
      if (error?.data?.message?.toLowerCase().includes('csrf') || 
          error?.message?.toLowerCase().includes('csrf')) {
        console.log('🔄 Reintentando con nuevo token CSRF...')
        await csrf()
        await new Promise(resolve => setTimeout(resolve, 200))
        const newCsrfToken = getCsrfToken()
        
        if (newCsrfToken) {
          headers['X-XSRF-TOKEN'] = newCsrfToken
          headers['X-CSRF-TOKEN'] = newCsrfToken
        }
        
        // Reintentar el login
        await $fetch(`${base}/login`, {
          method: 'POST',
          credentials: 'include',
          headers,
          body: { email, password },
        })
        
        return fetchUser()
      }
      throw error
    }
  }

  const logout = async () => {
    await csrf()

    await $fetch(`${base}/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    user.value = null
    status.value = 'guest'
  }

  return {
    user,
    status,
    fetchUser,
    login,
    logout,
    csrf,
    getCsrfToken,
  }
}
