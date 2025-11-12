export default defineEventHandler(async (event) => {
  // CORS para desarrollo
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

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

    const targetUrl = `${laravelBase}${apiPrefix}/personajes`
    
    console.log('📤 Enviando personaje a Laravel:', {
      url: targetUrl,
      body: body,
      laravelBase: laravelBase,
      apiPrefix: apiPrefix
    })
    
    // Intentar hacer el fetch con timeout
    let res: Response
    try {
      // Crear un AbortController para el timeout (compatible con versiones anteriores de Node)
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 10000) // Timeout de 10 segundos
      
      res = await fetch(targetUrl, {
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
      
      console.log('📥 Respuesta de Laravel:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries())
      })
    } catch (fetchError: any) {
      // Manejo específico de errores de conexión
      const errorMessage = fetchError?.message || String(fetchError)
      let detailedMessage = errorMessage
      
      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')) {
        detailedMessage = `No se pudo conectar con Laravel en ${targetUrl}. Verifica que Laravel esté corriendo en ${laravelBase}. Asegúrate de ejecutar: php artisan serve`
      } else if (errorMessage.includes('timeout')) {
        detailedMessage = `Timeout al conectar con Laravel en ${targetUrl}`
      } else if (errorMessage.includes('ENOTFOUND')) {
        detailedMessage = `No se pudo resolver el hostname de Laravel (${laravelBase})`
      }
      
      console.error('❌ Error de fetch en proxy:', {
        url: targetUrl,
        error: fetchError,
        message: detailedMessage,
        laravelBase: laravelBase
      })
      
      return sendError(event, createError({
        statusCode: 503,
        statusMessage: 'Error de conexión con Laravel',
        data: { 
          message: detailedMessage,
          url: targetUrl,
          laravelBase: laravelBase
        }
      }))
    }

    // Si la URL con prefijo devuelve 404, reintenta sin prefijo (rutas definidas en web/api sin prefix)
    if (res.status === 404 && apiPrefix) {
      const fallbackUrl = `${laravelBase}/personajes`
      try {
        const fallbackAbortController = new AbortController()
        const fallbackTimeoutId = setTimeout(() => fallbackAbortController.abort(), 10000)
        
        res = await fetch(fallbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(incomingCookie ? { 'Cookie': incomingCookie } : {}),
            ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken, 'X-CSRF-TOKEN': xsrfToken } : {}),
          },
          body: JSON.stringify(body),
          signal: fallbackAbortController.signal,
        })
        
        clearTimeout(fallbackTimeoutId)
      } catch (fallbackError: any) {
        const errorMessage = fallbackError?.message || String(fallbackError)
        console.error('Error en fallback fetch:', {
          url: fallbackUrl,
          error: fallbackError
        })
        return sendError(event, createError({
          statusCode: 503,
          statusMessage: 'Error de conexión con Laravel (fallback)',
          data: { 
            message: `No se pudo conectar con Laravel en ${fallbackUrl}: ${errorMessage}`,
            url: fallbackUrl
          }
        }))
      }
    }

    const contentType = res.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const payload = isJson ? await res.json() : await res.text()

    console.log('📦 Payload recibido de Laravel:', {
      isJson,
      payload: typeof payload === 'object' ? JSON.stringify(payload).substring(0, 200) : String(payload).substring(0, 200)
    })

    if (!res.ok) {
      console.error('❌ Laravel devolvió error:', {
        status: res.status,
        payload: payload
      })
      // Reempaquetar el error para el cliente
      const body = JSON.stringify({
        message: typeof payload === 'string' ? payload : (payload as any)?.message || 'Error en Laravel',
        errors: typeof payload === 'object' ? (payload as any).errors : undefined,
        status: res.status,
      })
      setResponseStatus(event, res.status)
      setHeader(event, 'content-type', 'application/json')
      return body
    }

    console.log('✅ Personaje creado exitosamente en Laravel')
    return payload
  } catch (error: any) {
    console.error('Error general en proxy personajes.post:', error)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Error proxy creando personaje',
      data: { 
        message: error?.message || String(error),
        stack: import.meta.dev ? error?.stack : undefined
      }
    }))
  }
})
