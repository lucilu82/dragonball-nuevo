export default defineEventHandler(async (event) => {
  // Configurar CORS
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, X-XSRF-TOKEN')
  setHeader(event, 'Access-Control-Allow-Credentials', 'true')

  if (event.method === 'OPTIONS') {
    return new Response(null, { status: 200 })
  }

  const config = useRuntimeConfig()
  const laravelBase = (config.public?.laravelBase as string) || 'http://127.0.0.1:8000'

  try {
    const body = await readBody(event)
    let incomingCookie = getHeader(event, 'cookie') || ''
    const xsrfToken = getHeader(event, 'x-xsrf-token') || getHeader(event, 'x-csrf-token') || ''

    const targetUrl = `${laravelBase}/register`
    
    console.log('📤 Enviando solicitud de registro a Laravel:', {
      url: targetUrl,
      body: { ...body, password: '***', password_confirmation: '***' },
      laravelBase: laravelBase
    })
    
    // Crear un AbortController para el timeout
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 10000)
    
    // Obtener token CSRF primero
    let finalCsrfToken = xsrfToken
    try {
      const csrfResponse = await fetch(`${laravelBase}/sanctum/csrf-cookie`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(incomingCookie ? { 'Cookie': incomingCookie } : {}),
        },
      })
      
      // Extraer el token CSRF de las cookies si está disponible
      const setCookieHeader = csrfResponse.headers.get('set-cookie')
      if (setCookieHeader) {
        const xsrfMatch = setCookieHeader.match(/XSRF-TOKEN=([^;]+)/)
        if (xsrfMatch && xsrfMatch[1]) {
          finalCsrfToken = decodeURIComponent(xsrfMatch[1])
        }
        
        // También copiar las cookies de la respuesta CSRF
        const csrfCookies = setCookieHeader
        if (csrfCookies) {
          // Las cookies se manejarán automáticamente por el navegador
          // pero necesitamos incluirlas en la siguiente petición
          incomingCookie = incomingCookie ? `${incomingCookie}; ${csrfCookies}` : csrfCookies
        }
      }
    } catch (csrfError) {
      console.warn('⚠️ No se pudo obtener token CSRF, continuando sin él:', csrfError)
    }
    
    let res: Response
    try {
      res = await fetch(targetUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(incomingCookie ? { 'Cookie': incomingCookie } : {}),
          ...(finalCsrfToken ? { 'X-XSRF-TOKEN': finalCsrfToken, 'X-CSRF-TOKEN': finalCsrfToken } : {}),
        },
        body: JSON.stringify(body),
        signal: abortController.signal,
      })
      
      clearTimeout(timeoutId)
      
      console.log('📥 Respuesta de Laravel (registro):', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      const errorMessage = fetchError?.message || String(fetchError)
      let detailedMessage = errorMessage
      
      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')) {
        detailedMessage = `No se pudo conectar con Laravel en ${targetUrl}. Verifica que Laravel esté corriendo en ${laravelBase}.`
      } else if (errorMessage.includes('timeout')) {
        detailedMessage = `Timeout al conectar con Laravel en ${targetUrl}`
      } else if (errorMessage.includes('ENOTFOUND')) {
        detailedMessage = `No se pudo resolver el hostname de Laravel (${laravelBase})`
      }
      
      console.error('❌ Error de fetch en proxy register:', {
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

    const contentType = res.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

    console.log('📦 Payload recibido de Laravel (registro):', {
      isJson,
      status: res.status,
      hasPayload: !!payload
    })

    // Copiar cookies de la respuesta de Laravel
    const setCookieHeaders = res.headers.get('set-cookie')
    if (setCookieHeaders) {
      appendHeader(event, 'set-cookie', setCookieHeaders)
    }

    if (!res.ok) {
      console.error('❌ Laravel devolvió error (registro):', {
        status: res.status,
        payload: payload
      })
      
      // Reempaquetar el error para el cliente
      const errorBody = JSON.stringify({
        message: typeof payload === 'string' ? payload : (payload as any)?.message || 'Error al registrar usuario',
        errors: typeof payload === 'object' ? (payload as any).errors : undefined,
        status: res.status,
      })
      setResponseStatus(event, res.status)
      setHeader(event, 'content-type', 'application/json')
      return errorBody
    }

    console.log('✅ Registro exitoso')
    
    // Si Laravel no devuelve contenido, devolver un mensaje de éxito
    if (!payload) {
      return { message: '¡Registro exitoso! Bienvenido a tu área personal.' }
    }
    
    return payload
  } catch (error: any) {
    console.error('Error general en proxy register:', error)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Error proxy registrando usuario',
      data: { 
        message: error?.message || String(error),
        stack: import.meta.dev ? error?.stack : undefined
      }
    }))
  }
})

