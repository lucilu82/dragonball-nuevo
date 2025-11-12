// Importar las funciones de almacenamiento
import { deletePersonaje, getPersonajeById } from '../../utils/personajes-storage'

export default defineEventHandler(async (event) => {
  // Paso 1: Configurar CORS headers
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-TOKEN, X-Requested-With')
  
  // Paso 2: Manejar preflight requests
  if (event.method === 'OPTIONS') {
    return new Response(null, { status: 200 })
  }

  try {
    // Paso 3: Obtener el ID del personaje desde la URL
    const idParam = getRouterParam(event, 'id')
    const id = parseInt(idParam || '0')
    
    // Validar que el ID sea un número válido
    if (isNaN(id) || id <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de personaje inválido'
      })
    }
    
    // Paso 4: Intentar eliminar primero en Laravel (fuente de verdad)
    const config = useRuntimeConfig()
    const laravelBase = (config.public?.laravelBase as string) || 'http://127.0.0.1:8000'
    const apiPrefix = (config.public?.laravelApiPrefix as string) || '/api'
    const incomingCookie = getHeader(event, 'cookie') || ''
    const xsrfToken = getHeader(event, 'x-xsrf-token') || getHeader(event, 'x-csrf-token') || ''

    const urlsLaravel = [
      `${laravelBase}${apiPrefix}/personajes/${id}`,
      ...(apiPrefix ? [`${laravelBase}/personajes/${id}`] : [])
    ]

    let laravelStatus: number | null = null
    let laravelPayload: any = null

    for (const url of urlsLaravel) {
      try {
        const abortController = new AbortController()
        const timeoutId = setTimeout(() => abortController.abort(), 10000)

        console.log('🗑️ Intentando eliminar personaje en Laravel:', url)

        const res = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(incomingCookie ? { 'Cookie': incomingCookie } : {}),
            ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken, 'X-CSRF-TOKEN': xsrfToken } : {}),
          },
          signal: abortController.signal,
        })

        clearTimeout(timeoutId)

        laravelStatus = res.status
        const contentType = res.headers.get('content-type') || ''
        const isJson = contentType.includes('application/json')
        // 204 No Content no tiene body
        laravelPayload = res.status === 204
          ? null
          : isJson
            ? await res.json().catch(() => null)
            : await res.text().catch(() => null)

        console.log('📥 Respuesta de Laravel al eliminar:', {
          url,
          status: res.status,
          ok: res.ok,
          payload: laravelPayload && typeof laravelPayload === 'object'
            ? JSON.stringify(laravelPayload).substring(0, 200)
            : laravelPayload
        })

        if (res.ok) {
          // Eliminación exitosa en Laravel; devolvemos respuesta estándar
          return {
            message: `Personaje ${id} eliminado correctamente en Laravel`,
            deleted: true,
            id
          }
        }

        // Si Laravel respondió distinto de 404, devolvemos el error tal cual
        if (res.status !== 404) {
          throw createError({
            statusCode: res.status,
            statusMessage: typeof laravelPayload === 'string'
              ? laravelPayload
              : laravelPayload?.message || 'Error al eliminar el personaje en Laravel',
            data: laravelPayload
          })
        }

        // Si fue 404, probamos con la siguiente URL (fallback sin prefijo)
        console.warn(`⚠️ Laravel devolvió 404 para ${url}, intentando siguiente opción (si existe)`)
      } catch (error: any) {
        console.error('❌ Error al comunicarse con Laravel para eliminar personaje:', {
          url,
          message: error?.message || String(error),
        })
        // Si hay otro URL para intentar, continuamos; si no, seguiremos al fallback local
      }
    }

    // Paso 5: Fallback al almacenamiento local en memoria
    const personajeExistente = getPersonajeById(id)
    if (!personajeExistente) {
      // Si Laravel ya respondió 404, respetamos ese estado; de lo contrario, usamos un 404 genérico
      throw createError({
        statusCode: laravelStatus || 404,
        statusMessage: 'Personaje no encontrado'
      })
    }

    const eliminado = deletePersonaje(id)

    if (!eliminado) {
      throw createError({
        statusCode: 500,
        statusMessage: 'No se pudo eliminar el personaje en almacenamiento local'
      })
    }

    console.log('✅ Personaje eliminado en almacenamiento local:', personajeExistente.nombre)

    // Paso 6: Devolver confirmación de eliminación
    return {
      message: `Personaje "${personajeExistente.nombre}" eliminado correctamente (fallback local)`,
      deleted: true,
      id: id,
      fallback: true
    }
    
  } catch (error: any) {
    // Paso 7: Manejar errores
    console.error('❌ Error al eliminar personaje:', error)
    
    // Si es un error que ya tiene statusCode, lo devolvemos tal cual
    if (error.statusCode) {
      throw error
    }
    
    // Si no, creamos un error genérico
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al eliminar el personaje: ' + error.message
    })
  }
})
