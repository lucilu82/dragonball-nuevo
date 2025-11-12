export default defineEventHandler(async (event) => {
  // Configurar CORS headers
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-TOKEN, X-Requested-With')
  
  // Manejar preflight requests
  if (event.method === 'OPTIONS') {
    return new Response(null, { status: 200 })
  }

  try {
    // Obtener transformaciones desde la API oficial de Dragon Ball
    const apiUrl = 'https://dragonball-api.com/api/transformations'
    console.log('Obteniendo transformaciones desde:', apiUrl)
    
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 10000) // Timeout de 10 segundos
    
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: abortController.signal,
    })
    
    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}`)
    }

    const data = await res.json()
    console.log(`✅ Devolviendo ${Array.isArray(data) ? data.length : 0} transformaciones`)
    
    // Filtrar transformaciones eliminadas (deletedAt !== null)
    const transformacionesActivas = Array.isArray(data) 
      ? data.filter(t => !t.deletedAt) 
      : []
    
    return transformacionesActivas
  } catch (error: any) {
    console.error('Error obteniendo transformaciones:', error?.message || String(error))
    
    // Devolver array vacío en caso de error
    return []
  }
})

