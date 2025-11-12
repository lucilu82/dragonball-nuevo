export default defineEventHandler(async (event) => {
  // Configurar CORS
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, X-XSRF-TOKEN')

  if (event.method === 'OPTIONS') {
    return new Response(null, { status: 200 })
  }

  const config = useRuntimeConfig()
  const laravelBase = (config.public?.laravelBase as string) || 'http://127.0.0.1:8000'
  const apiPrefix = (config.public?.laravelApiPrefix as string) || '/api'

  try {
    const body = await readBody(event)
    const incomingCookie = getHeader(event, 'cookie') || ''
    const xsrfToken = getHeader(event, 'x-xsrf-token') || getHeader(event, 'x-csrf-token') || ''

    const urls = [
      `${laravelBase}${apiPrefix}/planetas`,
      ...(apiPrefix ? [`${laravelBase}/planetas`] : [])
    ]

    let lastError: any = null

    for (const url of urls) {
      try {
        const abortController = new AbortController()
        const timeoutId = setTimeout(() => abortController.abort(), 10000)

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(incomingCookie ? { 'Cookie': incomingCookie } : {}),
            ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken, 'X-CSRF-TOKEN': xsrfToken } : {}),
          },
          body: JSON.stringify(body),
          signal: abortController.signal,
        })

        clearTimeout(timeoutId)

        const contentType = res.headers.get('content-type') || ''
        const isJson = contentType.includes('application/json')
        const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

        if (!res.ok) {
          const errorMessage = typeof payload === 'string'
            ? payload
            : payload?.message || `Error HTTP ${res.status}`

          if (res.status === 404) {
            lastError = createError({
              statusCode: res.status,
              statusMessage: errorMessage,
              data: payload
            })
            continue
          }

          throw createError({
            statusCode: res.status,
            statusMessage: errorMessage,
            data: payload
          })
        }

        return payload
      } catch (error: any) {
        lastError = error
        console.error('❌ Error enviando planeta a Laravel:', {
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
      statusMessage: 'No se pudo contactar con Laravel para crear el planeta'
    })
  } catch (error: any) {
    console.error('Error general en proxy planetas.post:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Error proxy creando planeta',
      data: {
        message: error?.message || String(error),
        stack: import.meta.dev ? error?.stack : undefined
      }
    })
  }
})

