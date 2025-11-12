// Importar las funciones de almacenamiento
import { getPersonajeById, updatePersonaje } from '../../utils/personajes-storage'

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
    // En Nuxt, los parámetros dinámicos como [id] se obtienen con getRouterParam
    const idParam = getRouterParam(event, 'id')
    const id = parseInt(idParam || '0')
    
    // Validar que el ID sea un número válido
    if (isNaN(id) || id <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de personaje inválido'
      })
    }
    
    // Paso 4: Verificar que el personaje existe antes de intentar actualizarlo
    const personajeExistente = getPersonajeById(id)
    if (!personajeExistente) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Personaje no encontrado'
      })
    }
    
    // Paso 5: Obtener los datos actualizados del body
    const body = await readBody(event)
    
    // Paso 6: Validar que los datos requeridos estén presentes
    if (!body.nombre || !body.raza || body.nivel_poder === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Faltan campos requeridos: nombre, raza y nivel_poder son obligatorios'
      })
    }
    
    // Paso 7: Validar el nivel de poder
    const nivelPoder = parseInt(body.nivel_poder)
    if (isNaN(nivelPoder) || nivelPoder < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El nivel de poder debe ser un número positivo'
      })
    }
    
    // Paso 8: Preparar los datos actualizados
    // Solo actualizamos los campos que vienen en el body
    const datosActualizados = {
      nombre: body.nombre.trim(),
      raza: body.raza.trim(),
      nivel_poder: nivelPoder,
      edad: body.edad ? parseInt(body.edad) : null,
      descripcion: body.descripcion?.trim() || '',
      tecnica_especial: body.tecnica_especial?.trim() || '',
      planeta_id: parseInt(body.planeta_id) || personajeExistente.planeta_id,
      image: body.image?.trim() || personajeExistente.image || ''
    }
    
    // Paso 9: Actualizar el personaje
    const personajeActualizado = updatePersonaje(id, datosActualizados)
    
    if (!personajeActualizado) {
      throw createError({
        statusCode: 500,
        statusMessage: 'No se pudo actualizar el personaje'
      })
    }
    
    console.log('✅ Personaje actualizado:', personajeActualizado.nombre)
    
    // Paso 10: Devolver el personaje actualizado
    return personajeActualizado
    
  } catch (error: any) {
    // Paso 11: Manejar errores
    console.error('❌ Error al actualizar personaje:', error)
    
    // Si es un error que ya tiene statusCode, lo devolvemos tal cual
    if (error.statusCode) {
      throw error
    }
    
    // Si no, creamos un error genérico
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al actualizar el personaje: ' + error.message
    })
  }
})
