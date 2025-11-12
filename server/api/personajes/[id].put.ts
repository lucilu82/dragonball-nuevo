// Importar las funciones de almacenamiento
import { getPersonajeById, updatePersonaje } from '../../utils/personajes-storage'

interface PersonajePayload {
  nombre: string
  raza: string
  nivel_poder: number
  edad: number | null
  descripcion: string
  tecnica_especial: string
  planeta_id: number
  imagen: string | null
  image?: string | null
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-TOKEN, X-XSRF-TOKEN, X-Requested-With')

  if (event.method === 'OPTIONS') {
    return new Response(null, { status: 200 })
  }

  const idParam = getRouterParam(event, 'id')
  const id = parseInt(idParam || '0', 10)

  if (Number.isNaN(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de personaje inválido'
    })
  }

  const personajeExistente = getPersonajeById(id)

  if (!personajeExistente) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Personaje no encontrado'
    })
  }

  const body = await readBody<any>(event)

  const nombre = typeof body?.nombre === 'string' ? body.nombre.trim() : ''
  const raza = typeof body?.raza === 'string' ? body.raza.trim() : ''
  const descripcion = typeof body?.descripcion === 'string' ? body.descripcion.trim() : ''
  const tecnicaEspecial = typeof body?.tecnica_especial === 'string' ? body.tecnica_especial.trim() : ''
  const imagenNueva = typeof body?.imagen === 'string'
    ? body.imagen.trim()
    : typeof body?.image === 'string'
      ? body.image.trim()
      : ''

  const nivelPoder = Number.parseInt(String(body?.nivel_poder ?? personajeExistente.nivel_poder), 10)
  const edadNormalizada = body?.edad === null || body?.edad === undefined || body?.edad === ''
    ? null
    : Number.parseInt(String(body.edad), 10)
  const planetaIdNormalizado = body?.planeta_id ?? personajeExistente.planeta_id
  const planetaId = Number.parseInt(String(planetaIdNormalizado), 10)

  if (!nombre || !raza || Number.isNaN(nivelPoder)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Faltan campos requeridos: nombre, raza y nivel_poder son obligatorios'
    })
  }

  if (nivelPoder < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nivel de poder debe ser un número positivo'
    })
  }

  if (Number.isNaN(planetaId) || planetaId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El planeta seleccionado no es válido'
    })
  }

  const payloadNormalizado: PersonajePayload = {
    nombre,
    raza,
    nivel_poder: nivelPoder,
    edad: Number.isNaN(edadNormalizada as number) ? null : edadNormalizada,
    descripcion,
    tecnica_especial: tecnicaEspecial,
    planeta_id: planetaId,
    imagen: imagenNueva || personajeExistente.imagen || personajeExistente.image || null,
  }

  if (payloadNormalizado.imagen) {
    payloadNormalizado.image = payloadNormalizado.imagen
  }

  const config = useRuntimeConfig()
  const laravelBase = (config.public?.laravelBase as string) || 'http://127.0.0.1:8000'
  const apiPrefix = (config.public?.laravelApiPrefix as string) || '/api'
  const incomingCookie = getHeader(event, 'cookie') || ''
  const xsrfToken = getHeader(event, 'x-xsrf-token') || getHeader(event, 'x-csrf-token') || ''

  const urlsLaravel = [
    `${laravelBase}${apiPrefix}/personajes/${id}`,
    ...(apiPrefix ? [`${laravelBase}/personajes/${id}`] : [])
  ]

  let lastError: any = null
  let obtuvo404 = false

  for (const url of urlsLaravel) {
    try {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 10000)

      console.log('✏️ Actualizando personaje en Laravel:', { url, id, payload: payloadNormalizado })

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(incomingCookie ? { Cookie: incomingCookie } : {}),
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken, 'X-CSRF-TOKEN': xsrfToken } : {}),
        },
        body: JSON.stringify(payloadNormalizado),
        signal: abortController.signal,
      })

      clearTimeout(timeoutId)

      const contentType = res.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')
      const payload = res.status === 204
        ? null
        : isJson
          ? await res.json().catch(() => null)
          : await res.text().catch(() => null)

      if (!res.ok) {
        const statusMessage = typeof payload === 'string'
          ? payload
          : payload?.message || `Error HTTP ${res.status}`

        if (res.status === 404) {
          obtuvo404 = true
          lastError = {
            statusCode: res.status,
            statusMessage,
            data: payload
          }
          continue
        }

        throw createError({
          statusCode: res.status,
          statusMessage,
          data: payload
        })
      }

      // Mantener el almacenamiento local sincronizado para el fallback
      updatePersonaje(id, {
        ...payloadNormalizado,
        image: payloadNormalizado.imagen,
      })

      console.log('✅ Personaje actualizado correctamente en Laravel:', { id, url })
      return payload ?? { updated: true, id }
    } catch (error: any) {
      lastError = error
      console.error('❌ Error actualizando personaje en Laravel:', {
        url,
        message: error?.message || String(error),
      })
    }
  }

  if (lastError && lastError.statusCode && lastError.statusCode !== 503 && lastError.statusCode !== 404) {
    throw lastError
  }

  // Fallback al almacenamiento local en memoria
  if (obtuvo404) {
    console.warn('⚠️ Laravel devolvió 404, actualizando solo en almacenamiento local')
  } else {
    console.warn('⚠️ No se pudo contactar con Laravel, usando fallback local para actualizar personaje')
  }

  const personajeActualizado = updatePersonaje(id, {
    ...payloadNormalizado,
    image: payloadNormalizado.imagen,
  })

  if (!personajeActualizado) {
    throw createError({
      statusCode: 500,
      statusMessage: 'No se pudo actualizar el personaje en almacenamiento local'
    })
  }

  return {
    ...personajeActualizado,
    fallback: true,
    mensaje: 'Personaje actualizado en almacenamiento local (Laravel no disponible)'
  }
})
