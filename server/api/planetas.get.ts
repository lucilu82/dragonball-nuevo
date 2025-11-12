const normalizeName = (value: string = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()

const slugifyName = (value: string = '') =>
  normalizeName(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const excludedPlanets = new Set([
  normalizeName('toribot'),
  normalizeName('kaioshinkai'),
  normalizeName('namekusei'),
  normalizeName('kanassa')
])

export default defineEventHandler(async (event) => {
  // Configurar CORS headers
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-TOKEN, X-Requested-With')
  
  // Manejar preflight requests
  if (event.method === 'OPTIONS') {
    return new Response(null, { status: 200 })
  }

  const config = useRuntimeConfig()
  const laravelBase = (config.public?.laravelBase as string) || 'http://127.0.0.1:8000'
  const apiPrefix = (config.public?.laravelApiPrefix as string) || '/api'

  // Primero intentar obtener planetas desde Laravel (necesario para validación)
  try {
    const laravelUrl = `${laravelBase}${apiPrefix}/planetas`
    console.log('Intentando obtener planetas desde Laravel:', laravelUrl)
    
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 5000) // Timeout de 5 segundos
    
    const response = await fetch(laravelUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: abortController.signal,
    })
    
    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      const planetasLaravel = Array.isArray(data) ? data : []
      
      // Intentar obtener imágenes desde la API de Dragon Ball para cada planeta
      try {
        const apiResponse = await $fetch('https://dragonball-api.com/api/planets?limit=100', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        })
        
        console.log('📡 Respuesta de la API de Dragon Ball:', {
          hasItems: typeof apiResponse === 'object' && apiResponse !== null && 'items' in apiResponse,
          responseType: typeof apiResponse
        })
        
        const items = (typeof apiResponse === 'object' && apiResponse !== null && 'items' in apiResponse)
          ? (apiResponse as { items: any[] }).items
          : Array.isArray(apiResponse) ? apiResponse : []
        
        console.log(`✅ Obtenidos ${items.length} planetas de la API de Dragon Ball`)
        
        // Crear un mapa de imágenes por nombre del planeta
        const imagesMap = new Map()
        items.forEach((planet: any) => {
          if (planet.name) {
            const nameLower = normalizeName(planet.name)
            // Intentar múltiples campos de imagen de la API oficial
            const imagen = planet.image || 
                          planet.img || 
                          planet.imageUrl || 
                          planet.images?.webp || 
                          planet.images?.png ||
                          planet.images?.[0] ||
                          (planet.id ? `https://dragonball-api.com/planets/${planet.id}.webp` : null) ||
                          (planet.name ? `https://dragonball-api.com/planets/${slugifyName(planet.name)}.webp` : null)
            
            if (imagen) {
              imagesMap.set(nameLower, imagen)
              console.log(`🖼️ Imagen encontrada para ${planet.name}: ${imagen}`)
            } else {
              // Si no hay imagen directa, construir URL estándar de la API
              const constructedUrl = `https://dragonball-api.com/planets/${slugifyName(planet.name)}.webp`
              imagesMap.set(nameLower, constructedUrl)
              console.log(`🔧 URL construida para ${planet.name}: ${constructedUrl}`)
            }
          }
        })
        
        console.log(`📊 Total de imágenes mapeadas: ${imagesMap.size}`)
        
        // Mapeo adicional de nombres en español a inglés y variantes
        const nameTranslations: Record<string, string[]> = {
          [normalizeName('tierra')]: ['earth', 'terra', 'planet earth'],
          [normalizeName('namek')]: ['namek', 'namekusei'],
          [normalizeName('namekusei')]: ['namek', 'namekusei', 'namek planet'],
          [normalizeName('vegeta')]: ['vegeta', 'planet vegeta', 'vegeta planet'],
          [normalizeName('sadala')]: ['sadala', 'planet sadala', 'sadala planet'],
          [normalizeName('kaioshinkai')]: ['kaioshinkai', 'kai planet', 'kaio', 'kaio planet', 'kaioshin'],
          [normalizeName('ares')]: ['ares', 'ares planet']
        }
        
        // Mapeo directo de URLs de imágenes de la API oficial de Dragon Ball (como fallback)
        const directImageMap: Record<string, string> = {
          [normalizeName('tierra')]: 'https://dragonball-api.com/planets/earth.webp',
          [normalizeName('earth')]: 'https://dragonball-api.com/planets/earth.webp',
          [normalizeName('namek')]: 'https://dragonball-api.com/planets/namek.webp',
          [normalizeName('namekusei')]: 'https://dragonball-api.com/planets/namek.webp',
          [normalizeName('vegeta')]: 'https://dragonball-api.com/planets/vegeta.webp',
          [normalizeName('sadala')]: 'https://vignette.wikia.nocookie.net/dragonball/images/7/72/Planeta_Sadala_del_Universo_7_flashback_anime_DBZ.png/revision/latest?cb=20200829223508&path-prefix=es',
          [normalizeName('kaioshinkai')]: 'https://dragonball-api.com/planets/kaioshinkai.webp',
          [normalizeName('ares')]: 'https://dragonball-api.com/planets/ares.webp',
          [normalizeName('templo móvil del rey de todo')]: 'https://dragonball-api.com/planets/templo-rey-todo.webp',
          [normalizeName('templo movil del rey de todo')]: 'https://dragonball-api.com/planets/templo-rey-todo.webp'
        }
        
        // Agregar imágenes a los planetas de Laravel, priorizando la API oficial
        const planetasConImagenes = planetasLaravel.map((planeta: any) => {
          const nombreLower = normalizeName(planeta.nombre || '')
          let imagen = null
          
          // PRIORIDAD 1: Buscar imagen directamente por nombre en el mapa de la API oficial
          imagen = imagesMap.get(nombreLower) || null
          
          // PRIORIDAD 2: Si no se encuentra, intentar con traducciones de nombres
          if (!imagen && nameTranslations[nombreLower]) {
            for (const translatedName of nameTranslations[nombreLower]) {
              imagen = imagesMap.get(normalizeName(translatedName)) || null
              if (imagen) {
                console.log(`✅ Imagen encontrada para ${planeta.nombre} usando traducción: ${translatedName}`)
                break
              }
            }
          }
          
          // PRIORIDAD 3: Si aún no hay imagen, usar el mapeo directo de la API oficial
          if (!imagen) {
            imagen = directImageMap[nombreLower] || null
            if (imagen) {
              console.log(`✅ Imagen asignada desde mapeo directo para ${planeta.nombre}`)
            }
          }
          
          // PRIORIDAD 4: Si aún no hay imagen, construir URL estándar de la API oficial
          if (!imagen) {
            const imageName = slugifyName(planeta.nombre || '')
            imagen = `https://dragonball-api.com/planets/${imageName}.webp`
            console.log(`🔧 URL construida de la API oficial para ${planeta.nombre}: ${imagen}`)
          }
          
          // PRIORIDAD 5: Si el planeta ya tenía imagen en Laravel, mantenerla solo si no encontramos una de la API
          if (!imagen && planeta.imagen) {
            imagen = planeta.imagen
            console.log(`⚠️ Usando imagen existente de Laravel para ${planeta.nombre}`)
          }
          
          return {
            ...planeta,
            imagen: imagen // Siempre usar la imagen de la API oficial cuando esté disponible
          }
        })
        const existentes = new Set(planetasConImagenes.map((p: any) => normalizeName(p.nombre || '')))
        const planetasExtra = items
          .filter((planet: any) => {
            const normalized = normalizeName(planet.name || '')
            return normalized && !existentes.has(normalized)
          })
          .map((planet: any, index: number) => {
            const nombreLower = normalizeName(planet.name || '')
            const imagen = imagesMap.get(nombreLower) || `https://dragonball-api.com/planets/${slugifyName(planet.name || '')}.webp`
            return {
              id: planet.id || `external-${index}`,
              nombre: planet.name,
              galaxia: planet.galaxy || 'Desconocida',
              poblacion: planet.population || Math.floor(Math.random() * 100000000) + 10000,
              descripcion: planet.description || `Planeta ${planet.name}`,
              imagen,
              personajes: [],
            }
          })
        const totalPlanetas = [...planetasConImagenes, ...planetasExtra]
          .filter((planeta: any) => !excludedPlanets.has(normalizeName(planeta.nombre || '')))
        console.log(`✅ Total de planetas combinados: ${totalPlanetas.length}`)
        return totalPlanetas
        
        console.log(`✅ Total de planetas con imágenes de la API oficial: ${planetasConImagenes.length}`)
        return planetasConImagenes
      } catch (apiError) {
        console.warn('⚠️ No se pudieron obtener imágenes desde la API de Dragon Ball, usando URLs directas de la API oficial')
        console.warn('Error:', apiError)
        // Mapeo directo de URLs de imágenes de la API oficial de Dragon Ball
        const directImageMap: Record<string, string> = {
          [normalizeName('tierra')]: 'https://dragonball-api.com/planets/earth.webp',
          [normalizeName('earth')]: 'https://dragonball-api.com/planets/earth.webp',
          [normalizeName('namek')]: 'https://dragonball-api.com/planets/namek.webp',
          [normalizeName('namekusei')]: 'https://dragonball-api.com/planets/namek.webp',
          [normalizeName('vegeta')]: 'https://dragonball-api.com/planets/vegeta.webp',
          [normalizeName('sadala')]: 'https://vignette.wikia.nocookie.net/dragonball/images/7/72/Planeta_Sadala_del_Universo_7_flashback_anime_DBZ.png/revision/latest?cb=20200829223508&path-prefix=es',
          [normalizeName('kaioshinkai')]: 'https://dragonball-api.com/planets/kaioshinkai.webp',
          [normalizeName('ares')]: 'https://dragonball-api.com/planets/ares.webp',
          [normalizeName('templo móvil del rey de todo')]: 'https://dragonball-api.com/planets/templo-rey-todo.webp',
          [normalizeName('templo movil del rey de todo')]: 'https://dragonball-api.com/planets/templo-rey-todo.webp'
        }
        
        return planetasLaravel
        .map((planeta: any) => {
          const nombreLower = normalizeName(planeta.nombre || '')
          // Usar mapeo directo o construir URL de la API oficial
          const imagen = directImageMap[nombreLower] || `https://dragonball-api.com/planets/${slugifyName(planeta.nombre || '')}.webp`
          console.log(`🖼️ Asignando imagen de la API oficial para ${planeta.nombre}: ${imagen}`)
          return {
            ...planeta,
            imagen: imagen
          }
        })
        .filter((planeta: any) => !excludedPlanets.has(normalizeName(planeta.nombre || '')))
      }
    } else {
      throw new Error(`Error HTTP ${response.status}`)
    }
  } catch (laravelError: any) {
    console.warn('No se pudieron obtener planetas desde Laravel:', laravelError?.message || String(laravelError))
    
    // Fallback: intentar con la API externa
    try {
      console.log('Intentando obtener planetas desde API externa...')
      const response = await $fetch('https://dragonball-api.com/api/planets?limit=100', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      })

      // Transformar los datos de la API para que coincidan con nuestro formato
      const items = (typeof response === 'object' && response !== null && 'items' in response)
        ? (response as { items: any[] }).items
        : Array.isArray(response) ? response : [];
      
      console.log(`✅ Obtenidos ${items.length} planetas directamente de la API oficial de Dragon Ball`)
      
      const transformedPlanets = items.map((planet: any, index: number) => {
        // Intentar obtener imagen de múltiples campos de la API oficial
        let imagen = planet.image || 
                    planet.img || 
                    planet.imageUrl || 
                    planet.images?.webp || 
                    planet.images?.png ||
                    planet.images?.[0] ||
                    null
        
        // Si no hay imagen directa, construir URL estándar de la API oficial
        if (!imagen && planet.name) {
          const imageName = slugifyName(planet.name)
          imagen = `https://dragonball-api.com/planets/${imageName}.webp`
          console.log(`🔧 URL construida de la API oficial para ${planet.name}: ${imagen}`)
        } else if (imagen) {
          console.log(`🖼️ Imagen encontrada en la API oficial para ${planet.name}: ${imagen}`)
        }
        
        return {
          id: planet.id || index + 1,
          nombre: planet.name,
          galaxia: planet.galaxy || 'Vía Láctea',
          poblacion: planet.population || Math.floor(Math.random() * 1000000000) + 1000000,
          descripcion: planet.description || `Planeta ${planet.name} en la galaxia`,
          imagen: imagen, // Imagen de la API oficial de Dragon Ball
          personajes: [] // Se llenará después si es necesario
        }
      })
      
      console.warn('⚠️ Usando planetas de API externa. Los IDs pueden no coincidir con Laravel.')
        return transformedPlanets.filter((planeta: any) => !excludedPlanets.has(normalizeName(planeta.nombre || '')))
    } catch (externalError) {
      console.error('Error obteniendo planetas de API externa:', externalError)
      
      // Último fallback: datos de prueba (solo para desarrollo) - con imágenes
      console.log('Usando datos de prueba como último recurso')
      const fallbackPlanets = [
        {
          id: 1,
          nombre: "Tierra",
          galaxia: "Vía Láctea",
          poblacion: 8000000000,
          imagen: "https://dragonball-api.com/planets/earth.webp",
          personajes: []
        },
        {
          id: 2,
          nombre: "Namek",
          galaxia: "Vía Láctea",
          poblacion: 100,
          imagen: "https://dragonball-api.com/planets/namek.webp",
          personajes: []
        },
        {
          id: 3,
          nombre: "Vegeta",
          galaxia: "Vía Láctea",
          poblacion: 1000000,
          imagen: "https://dragonball-api.com/planets/vegeta.webp",
          personajes: []
        },
        {
          id: 4,
          nombre: "Sadala",
          galaxia: "Universo 6",
          poblacion: 5000000,
          imagen: "https://vignette.wikia.nocookie.net/dragonball/images/7/72/Planeta_Sadala_del_Universo_7_flashback_anime_DBZ.png/revision/latest?cb=20200829223508&path-prefix=es",
          personajes: []
        },
        {
          id: 7,
          nombre: "Ares",
          galaxia: "Universo 7",
          poblacion: 100000,
          imagen: "https://dragonball-api.com/planets/ares.webp",
          personajes: []
        },
        {
          id: 9,
          nombre: "Templo móvil del Rey de Todo",
          galaxia: "Lugar de Supervivencia",
          poblacion: 2,
          imagen: "https://dragonball-api.com/planetas/Trono_del_Rey_de_Todo.webp",
          personajes: []
        }
      ]
      
      return fallbackPlanets
    }
  }
})
