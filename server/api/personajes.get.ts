// Importar las funciones de almacenamiento
import { getAllPersonajes } from '../utils/personajes-storage'

export default defineEventHandler(async (event) => {
  // Paso 1: Configurar CORS headers
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-TOKEN, X-Requested-With')
  
  // Paso 2: Manejar preflight requests
  if (event.method === 'OPTIONS') {
    return new Response(null, { status: 200 })
  }

  // Paso 3: Obtener personajes locales como fallback (con todas las imágenes)
  const personajesLocales = getAllPersonajes()
  console.log(`✅ Cargados ${personajesLocales.length} personajes del almacenamiento local (como fallback)`)
  
  // Paso 4: Intentar obtener personajes desde Laravel (PRIORIDAD)
  const config = useRuntimeConfig()
  const laravelBase = (config.public?.laravelBase as string) || 'http://127.0.0.1:8000'
  const apiPrefix = (config.public?.laravelApiPrefix as string) || '/api'

  try {
    const targetUrl = `${laravelBase}${apiPrefix}/personajes`
    console.log('📡 Intentando obtener personajes desde Laravel:', targetUrl)
    console.log('🔧 Configuración:', { laravelBase, apiPrefix })
    
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 8000) // Timeout de 8 segundos
    
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Origin': 'http://localhost:3000'
      },
      signal: abortController.signal,
    })
    
    clearTimeout(timeoutId)

    console.log('📥 Respuesta de Laravel:', {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      url: targetUrl
    })

    if (res.ok) {
      const personajesLaravel = await res.json()
      const personajesLaravelArray = Array.isArray(personajesLaravel) ? personajesLaravel : []
      
      console.log(`📊 Datos recibidos de Laravel:`, {
        total: personajesLaravelArray.length,
        primeros: personajesLaravelArray.slice(0, 3).map((p: any) => ({ id: p.id, nombre: p.nombre, tieneImagen: !!(p.imagen || p.image) }))
      })
      
      if (personajesLaravelArray.length > 0) {
        console.log(`✅ Encontrados ${personajesLaravelArray.length} personajes en Laravel`)
        
        // Crear mapa de personajes locales para enriquecer con imágenes
        const personajesLocalesMap = new Map(personajesLocales.map(p => [p.id, p]))
        
        // Usar TODOS los personajes de Laravel como base (incluye todos los nuevos)
        // Enriquecer con imágenes de los locales si Laravel no tiene
        const personajesEnriquecidos = personajesLaravelArray.map((personajeLaravel: any) => {
          const personajeLocal = personajesLocalesMap.get(personajeLaravel.id)
          
          // Normalizar imagen: buscar en ambos campos
          const imagenLaravel = personajeLaravel.imagen || personajeLaravel.image || null
          const imagenLocal = personajeLocal?.image || personajeLocal?.imagen || null
          
          // Priorizar imagen de Laravel, sino usar la del local
          const imagenFinal = imagenLaravel || imagenLocal
          
          return {
            ...personajeLaravel,
            imagen: imagenFinal,
            image: imagenFinal // Asegurar que ambos campos estén presentes
          }
        })
        
        // Agregar personajes locales que no están en Laravel
        const idsLaravel = new Set(personajesLaravelArray.map((p: any) => p.id))
        const personajesLocalesSolo = personajesLocales.filter(p => !idsLaravel.has(p.id))
        
        if (personajesLocalesSolo.length > 0) {
          console.log(`📝 Agregando ${personajesLocalesSolo.length} personajes locales que no están en Laravel`)
          personajesEnriquecidos.push(...personajesLocalesSolo)
        }
        
        console.log(`✅ Total de personajes: ${personajesEnriquecidos.length} (${personajesLaravelArray.length} desde Laravel + ${personajesLocalesSolo.length} locales adicionales)`)
        console.log('📋 Primeros 5 personajes:', personajesEnriquecidos.slice(0, 5).map((p: any) => ({ id: p.id, nombre: p.nombre, tieneImagen: !!(p.imagen || p.image) })))
        
        return personajesEnriquecidos
      } else {
        console.log('⚠️ Laravel devolvió una lista vacía, usando solo personajes locales')
      }
    } else {
      const errorText = await res.text().catch(() => '')
      console.error(`❌ Laravel respondió con status ${res.status}:`, errorText.substring(0, 500))
      console.error('💡 Sugerencias:')
      console.error('   - Verifica que Laravel esté corriendo: php artisan serve')
      console.error('   - Verifica que la ruta /api/personajes exista en Laravel')
      console.error('   - Revisa los logs de Laravel: storage/logs/laravel.log')
    }
  } catch (error: any) {
    const errorMessage = error?.message || String(error)
    console.error('❌ Error obteniendo personajes desde Laravel:', {
      message: errorMessage,
      url: `${laravelBase}${apiPrefix}/personajes`,
      tipo: error?.name || 'Unknown',
      hint: errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')
        ? '⚠️ Laravel no está corriendo. Ejecuta: php artisan serve'
        : errorMessage.includes('aborted')
        ? '⚠️ Timeout: Laravel está tardando demasiado en responder'
        : 'Revisa la configuración de Laravel'
    })
  }

  // Fallback: devolver los personajes locales (con todas las imágenes originales)
  console.log(`⚠️ Usando ${personajesLocales.length} personajes desde almacenamiento local (fallback)`)
  return personajesLocales
})

/* Código antiguo - ahora usamos el almacenamiento
  return [
    {
      id: 1,
      nombre: "Goku",
      raza: "Saiyajin",
      nivel_poder: 1000000,
      descripcion: "El guerrero más fuerte de la Tierra",
      tecnica_especial: "Kamehameha",
      planeta: {
        id: 1,
        nombre: "Tierra"
      },
      planeta_id: 1,
      image: "https://dragonball-api.com/characters/goku_normal.webp"
    },
    {
      id: 2,
      nombre: "Vegeta",
      raza: "Saiyajin",
      nivel_poder: 950000,
      descripcion: "Príncipe de los Saiyajin",
      tecnica_especial: "Final Flash",
      planeta: {
        id: 3,
        nombre: "Vegeta"
      },
      planeta_id: 3,
      image: "https://dragonball-api.com/characters/vegeta_normal.webp"
    },
    {
      id: 3,
      nombre: "Piccolo",
      raza: "Namekiano",
      nivel_poder: 800000,
      descripcion: "Guardián de la Tierra",
      tecnica_especial: "Makankosappo",
      planeta: {
        id: 2,
        nombre: "Namek"
      },
      planeta_id: 2,
      image: "https://dragonball-api.com/characters/picolo_normal.webp"
    },
    {
      id: 4,
      nombre: "Frieza",
      raza: "Demonio",
      nivel_poder: 1200000,
      descripcion: "Emperador del Universo",
      tecnica_especial: "Death Ball",
      planeta: {
        id: 4,
        nombre: "Planeta Frieza"
      },
      planeta_id: 4,
      image: "https://dragonball-api.com/characters/Freezer.webp"
    },
    {
      id: 5,
      nombre: "Cell",
      raza: "Androide",
      nivel_poder: 1100000,
      descripcion: "Androide perfecto creado por el Dr. Gero",
      tecnica_especial: "Kamehameha Solar",
      planeta: {
        id: 1,
        nombre: "Tierra"
      },
      planeta_id: 1,
      image: "https://dragonball-api.com/characters/celula.webp"
    },
    {
      id: 6,
      nombre: "Buu",
      raza: "Demonio",
      nivel_poder: 1300000,
      descripcion: "Demonio ancestral de gran poder",
      tecnica_especial: "Absorción",
      planeta: {
        id: 1,
        nombre: "Tierra"
      },
      planeta_id: 1,
      image: "https://dragonball-api.com/characters/BuuGordo_Universo7.webp"
    },
    {
      id: 7,
      nombre: "Gohan",
      raza: "Saiyajin",
      nivel_poder: 900000,
      descripcion: "Hijo de Goku, gran potencial",
      tecnica_especial: "Masenko",
      planeta: {
        id: 1,
        nombre: "Tierra"
      },
      planeta_id: 1,
      image: "https://dragonball-api.com/characters/gohan.webp"
    },
    {
      id: 8,
      nombre: "Trunks",
      raza: "Saiyajin",
      nivel_poder: 850000,
      descripcion: "Hijo de Vegeta del futuro",
      tecnica_especial: "Burning Attack",
      planeta: {
        id: 1,
        nombre: "Tierra"
      },
      planeta_id: 1,
      image: "https://dragonball-api.com/characters/Trunks_Buu_Artwork.webp"
    },
    {
      id: 9,
      nombre: "Krillin",
      raza: "Humano",
      nivel_poder: 75000,
      descripcion: "Mejor amigo de Goku",
      tecnica_especial: "Kienzan",
      planeta: {
        id: 1,
        nombre: "Tierra"
      },
      planeta_id: 1,
      image: "https://dragonball-api.com/characters/Krilin_Universo7.webp"
    },
    {
      id: 10,
      nombre: "Bulma",
      raza: "Humano",
      nivel_poder: 5,
      descripcion: "Genio científica y esposa de Vegeta",
      tecnica_especial: "Inteligencia",
      planeta: {
        id: 1,
        nombre: "Tierra"
      },
      planeta_id: 1,
      image: "https://dragonball-api.com/characters/bulma.webp"
    },
    {
      id: 11,
      nombre: "Celula",
      raza: "Androide",
      nivel_poder: 1100000,
      descripcion: "Androide perfecto creado por el Dr. Gero",
      tecnica_especial: "Kamehameha Solar",
      planeta: {
        id: 1,
        nombre: "Tierra"
      },
      planeta_id: 1,
      image: "https://dragonball-api.com/characters/celula.webp"
    },
    {
      id: 12,
      nombre: "Capitán Ginyu",
      raza: "Demonio",
      nivel_poder: 120000,
      descripcion: "Capitán de la Fuerza Especial Ginyu",
      tecnica_especial: "Cambio de Cuerpo",
      planeta: {
        id: 4,
        nombre: "Planeta Frieza"
      },
      planeta_id: 4,
      image: "https://dragonball-api.com/characters/ginyu.webp"
    },
    {
      id: 13,
      nombre: "Tien Shinhan",
      raza: "Humano",
      nivel_poder: 180000,
      descripcion: "Guerrero de las Tres Ojos",
      tecnica_especial: "Triblast",
      planeta: {
        id: 1,
        nombre: "Tierra"
      },
      planeta_id: 1,
      image: "https://dragonball-api.com/characters/Tenshinhan_Universo7.webp"
    },
    {
      id: 14,
      nombre: "Yamcha",
      raza: "Humano",
      nivel_poder: 148000,
      descripcion: "Bandido del desierto convertido en guerrero",
      tecnica_especial: "Wolf Fang Fist",
      planeta: {
        id: 1,
        nombre: "Tierra"
      },
      planeta_id: 1,
      image: "https://dragonball-api.com/characters/Final_Yamcha.webp"
    },
    {
      id: 15,
      nombre: "Master Roshi",
      raza: "Humano",
      nivel_poder: 139000,
      descripcion: "Maestro de artes marciales legendario",
      tecnica_especial: "Kamehameha",
      planeta: {
        id: 1,
        nombre: "Tierra"
      },
      planeta_id: 1,
      image: "https://dragonball-api.com/characters/roshi.webp"
    },
    {
      id: 16,
      nombre: "Raditz",
      raza: "Saiyajin",
      nivel_poder: 150000,
      descripcion: "Hermano mayor de Goku",
      tecnica_especial: "Double Sunday",
      planeta: {
        id: 3,
        nombre: "Vegeta"
      },
      planeta_id: 3,
      image: "https://dragonball-api.com/characters/Raditz_artwork_Dokkan.webp"
    },
    {
      id: 17,
      nombre: "Nappa",
      raza: "Saiyajin",
      nivel_poder: 400000,
      descripcion: "Guerrero Saiyajin de élite",
      tecnica_especial: "Bomber DX",
      planeta: {
        id: 3,
        nombre: "Vegeta"
      },
      planeta_id: 3,
      image: "https://dragonball-api.com/characters/Bardock_Artwork.webp"
    },
    {
      id: 18,
      nombre: "Android 17",
      raza: "Androide",
      nivel_poder: 500000,
      descripcion: "Androide creado por el Dr. Gero",
      tecnica_especial: "Power Blitz",
      planeta: {
        id: 1,
        nombre: "Tierra"
      },
      planeta_id: 1,
      image: "https://dragonball-api.com/characters/17_Artwork.webp"
    },
    {
      id: 19,
      nombre: "Android 18",
      raza: "Androide",
      nivel_poder: 500000,
      descripcion: "Hermana de Android 17",
      tecnica_especial: "Power Blitz",
      planeta: {
        id: 1,
        nombre: "Tierra"
      },
      planeta_id: 1,
      image: "https://dragonball-api.com/characters/Androide_18_Artwork.webp"
    },
    {
      id: 20,
      nombre: "Broly",
      raza: "Saiyajin",
      nivel_poder: 1400000,
      descripcion: "Saiyajin legendario con poder destructivo",
      tecnica_especial: "Erase Cannon",
      planeta: {
        id: 3,
        nombre: "Vegeta"
      },
      planeta_id: 3,
      image: "https://dragonball-api.com/transformaciones/Broly_DBS_Base.webp"
    }
  ]

  // Código comentado para usar la API oficial cuando sea necesario
  /*
  try {
    // Intentar conectar con la API oficial de Dragon Ball
    const response = await $fetch('https://dragonball-api.com/api/characters', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })

    // Transformar los datos de la API para que coincidan con nuestro formato
    const items = (response as { items?: any[] })?.items ?? [];
    const transformedCharacters = items.map((char: any, index: number) => ({
      id: char.id ?? index + 1,
      nombre: char.name,
      raza: char.race,
      nivel_poder: char.power ?? Math.floor(Math.random() * 1000000) + 10000,
      edad: char.age || null,
      descripcion: char.description || `Guerrero ${char.race} con gran poder`,
      tecnica_especial: char.techniques?.[0] || null,
      planeta: {
        id: char.originPlanet?.id || 1,
        nombre: char.originPlanet?.name || 'Tierra'
      },
      planeta_id: char.originPlanet?.id || 1,
      image: char.image,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    return transformedCharacters
  } catch (error) {
    console.log('API Dragon Ball no disponible, usando datos de prueba')
    // ... datos de prueba ...
  }
  */