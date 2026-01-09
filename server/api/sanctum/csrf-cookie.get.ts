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
    const incomingCookie = getHeader(event, 'cookie') || ''

    const targetUrl = `${laravelBase}/sanctum/csrf-cookie`
    
    console.log('📤 Obteniendo cookie CSRF de Laravel:', {
      url: targetUrl,
      laravelBase: laravelBase
    })
    
    // Crear un AbortController para el timeout
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 10000)
    
    let res: Response
    try {
      res = await fetch(targetUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(incomingCookie ? { 'Cookie': incomingCookie } : {}),
        },
        signal: abortController.signal,
      })
      
      clearTimeout(timeoutId)
      
      console.log('📥 Respuesta de Laravel (CSRF cookie):', {
        status: res.status,
        ok: res.ok,
        cookies: res.headers.get('set-cookie')
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      const errorMessage = fetchError?.message || String(fetchError)
      console.error('❌ Error de fetch en proxy csrf-cookie:', {
        url: targetUrl,
        error: fetchError,
        message: errorMessage,
        laravelBase: laravelBase
      })
      
      return sendError(event, createError({
        statusCode: 503,
        statusMessage: 'Error de conexión con Laravel',
        data: { 
          message: `No se pudo conectar con Laravel en ${targetUrl}. Verifica que Laravel esté corriendo en ${laravelBase}.`,
          url: targetUrl,
          laravelBase: laravelBase
        }
      }))
    }

    // Copiar todas las cookies de la respuesta de Laravel
    // Intentar leer las cookies usando diferentes métodos según disponibilidad
    let setCookieHeaders: string[] = []
    
    try {
      // getSetCookie() está disponible en Node.js 18+ / fetch API más reciente
      if (typeof (res.headers as any).getSetCookie === 'function') {
        setCookieHeaders = (res.headers as any).getSetCookie()
      } else {
        // Fallback: leer todas las instancias del header set-cookie
        const allSetCookies = res.headers.get('set-cookie')
        if (allSetCookies) {
          // Si hay múltiples cookies, pueden estar separadas por coma
          // Pero tener cuidado porque las fechas en cookies pueden contener comas
          // Intentar dividir inteligentemente
          setCookieHeaders = [allSetCookies]
        }
      }
    } catch (e) {
      console.warn('⚠️ Error leyendo cookies:', e)
      // Último recurso: leer como string simple
      const setCookieHeader = res.headers.get('set-cookie')
      if (setCookieHeader) {
        setCookieHeaders = [setCookieHeader]
      }
    }
    
    // Reenviar las cookies al cliente
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        // Reenviar la cookie tal cual (sin modificar)
        appendHeader(event, 'set-cookie', cookie)
      })
      console.log('✅ Cookies CSRF reenviadas al cliente:', setCookieHeaders.length)
      setCookieHeaders.forEach((cookie, idx) => {
        console.log(`  Cookie ${idx + 1}:`, cookie.substring(0, 100))
      })
    } else {
      console.warn('⚠️ No se recibieron cookies de Laravel en la respuesta')
    }

    // Devolver respuesta vacía (el endpoint csrf-cookie solo establece cookies)
    return new Response(null, { 
      status: res.status || 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      }
    })
  } catch (error: any) {
    console.error('Error general en proxy csrf-cookie:', error)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Error proxy obteniendo cookie CSRF',
      data: { 
        message: error?.message || String(error),
        stack: import.meta.dev ? error?.stack : undefined
      }
    }))
  }
})

