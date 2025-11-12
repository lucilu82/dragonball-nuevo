export default defineEventHandler(async (event) => {
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, X-XSRF-TOKEN')

  if (event.method === 'OPTIONS') {
    return new Response(null, { status: 200 })
  }

  const idParam = getRouterParam(event, 'id')
  const id = parseInt(idParam || '0', 10)

  if (Number.isNaN(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de planeta inválido'
    })
  }

  const config = useRuntimeConfig()
  const laravelBase = (config.public?.laravelBase as string) || 'http://127.0.0.1:8000'
  const apiPrefix = (config.public?.laravelApiPrefix as string) || '/api'

  const incomingCookie = getHeader(event, 'cookie') || ''
  const xsrfToken = getHeader(event, 'x-xsrf-token') || getHeader(event, 'x-csrf-token') || ''

  const urls = [
    `${laravelBase}${apiPrefix}/planetas/${id}`,
    ...(apiPrefix ? [`${laravelBase}/planetas/${id}`] : [])
  ]

  let lastError: any = null

  for (const url of urls) {
    try {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 10000)

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(incomingCookie ? { Cookie: incomingCookie } : {}),
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken, 'X-CSRF-TOKEN': xsrfToken } : {}),
        },
        signal: abortController.signal,
      })

      clearTimeout(timeoutId)

      if (res.ok) {
        return {
          deleted: true,
          id
        }
      }

      const contentType = res.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')
      const payload = res.status === 204
        ? null
        : isJson
          ? await res.json().catch(() => null)
          : await res.text().catch(() => null)

      const statusMessage = typeof payload === 'string'
        ? payload
        : payload?.message || `Error HTTP ${res.status}`

      if (res.status === 404) {
        lastError = createError({
          statusCode: res.status,
          statusMessage,
          data: payload
        })
        continue
      }

      throw createError({
        statusCode: res.status,
        statusMessage,
        data: payload
      })
    } catch (error: any) {
      lastError = error
      console.error('❌ Error eliminando planeta en Laravel:', {
        url,
        message: error?.message || String(error),
      })
    }
  }

  if (lastError) {
    throw lastError
  }

  throw createError({
    statusCode: 503,
    statusMessage: 'No se pudo contactar con Laravel para eliminar el planeta'
  })
})

