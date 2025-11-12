<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">🧙‍♂️ Añadir un nuevo personaje</h1>
      <NuxtLink to="/personajes"
        class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded transition-colors duration-200">
        ← Volver
      </NuxtLink>
    </div>

    <form @submit.prevent="crearPersonaje" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block font-semibold text-gray-700 mb-2">Nombre *</label>
          <input v-model="nombre" type="text"
            class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required :class="{ 'border-red-500': errores.nombre }" />
          <p v-if="errores.nombre" class="text-red-500 text-sm mt-1">{{ errores.nombre }}</p>
        </div>
        <div>
          <label class="block font-semibold">URL de la Imagen</label>
          <input v-model="imagen" class="border rounded w-full p-2" placeholder="https://..." />
        </div>

        <div>
          <label class="block font-semibold text-gray-700 mb-2">Raza *</label>
          <select v-model="raza"
            class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required :class="{ 'border-red-500': errores.raza }">
            <option value="">Selecciona una raza</option>
            <option value="Saiyajin">Saiyajin</option>
            <option value="Namekiano">Namekiano</option>
            <option value="Humano">Humano</option>
            <option value="Androide">Androide</option>
            <option value="Demonio">Demonio</option>
            <option value="Angel">Angel</option>
            <option value="Dios">Dios</option>
          </select>
          <p v-if="errores.raza" class="text-red-500 text-sm mt-1">{{ errores.raza }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block font-semibold text-gray-700 mb-2">Nivel de Poder *</label>
          <input v-model.number="nivel_poder" type="number" min="0" max="999999999"
            class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required :class="{ 'border-red-500': errores.nivel_poder }" />
          <p v-if="errores.nivel_poder" class="text-red-500 text-sm mt-1">{{ errores.nivel_poder }}</p>
        </div>

        <div>
          <label class="block font-semibold text-gray-700 mb-2">Edad</label>
          <input v-model.number="edad" type="number" min="0" max="1000"
            class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>

      <div>
        <label class="block font-semibold text-gray-700 mb-2">Planeta *</label>
        <select v-model="planeta_id"
          class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required :class="{ 'border-red-500': errores.planeta_id }">
          <option value="" disabled>Selecciona un planeta</option>
          <option v-for="p in planetas" :key="p.id" :value="p.id">{{ p.nombre }}</option>
        </select>
        <p v-if="errores.planeta_id" class="text-red-500 text-sm mt-1">{{ errores.planeta_id }}</p>
      </div>

      <div>
        <label class="block font-semibold text-gray-700 mb-2">Técnica Especial</label>
        <input v-model="tecnica_especial" type="text" placeholder="Ej: Kamehameha, Final Flash..."
          class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>
      <div>
        <label class="block font-semibold">Imagen (URL)</label>
        <input v-model="imagen" class="border rounded w-full p-2"
          placeholder="https://dragonball-api.com/images/goku.png" />
      </div>


      <div>
        <label class="block font-semibold text-gray-700 mb-2">Descripción *</label>
        <textarea v-model="descripcion" rows="4"
          class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required :class="{ 'border-red-500': errores.descripcion }"></textarea>
        <p v-if="errores.descripcion" class="text-red-500 text-sm mt-1">{{ errores.descripcion }}</p>
      </div>

      <div class="flex gap-4">
        <button type="submit" :disabled="guardando"
          class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2">
          <span v-if="guardando">⏳</span>
          <span v-else>💾</span>
          {{ guardando ? 'Guardando...' : 'Guardar Personaje' }}
        </button>

        <button type="button" @click="limpiarFormulario"
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">
          Limpiar
        </button>
      </div>
    </form>

    <div v-if="mensaje" class="mt-4 p-4 rounded-lg"
      :class="mensaje.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
      {{ mensaje }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 🧩 Campos del formulario
const nombre = ref('')
const raza = ref('')
const nivel_poder = ref(0)
const edad = ref(null)
const descripcion = ref('')
const tecnica_especial = ref('')
const planeta_id = ref('')
const imagen = ref('')

// 📦 Datos auxiliares
const planetas = ref([])
const mensaje = ref('')
const guardando = ref(false)
const errores = ref({})

// 🔹 Cargar los planetas (el proxy intentará obtenerlos desde Laravel primero)
onMounted(async () => {
  try {
    console.log('Cargando planetas desde /api/planetas...')
    const data = await $fetch('/api/planetas')
    planetas.value = Array.isArray(data) ? data : []
    console.log('Planetas cargados:', planetas.value.length, planetas.value)
    
    if (!Array.isArray(data)) {
      console.error('Respuesta inesperada al cargar planetas:', data)
      planetas.value = []
    }
    
    if (planetas.value.length === 0) {
      mensaje.value = '⚠️ No hay planetas disponibles. Verifica que Laravel esté corriendo y tenga planetas en la base de datos.'
    }
  } catch (err) {
    console.error('Error cargando planetas:', err)
    planetas.value = []
    mensaje.value = '⚠️ No se pudieron cargar los planetas. Verifica que Laravel esté corriendo en http://127.0.0.1:8000'
  }
})


// 🔹 Función para crear un personaje
const crearPersonaje = async () => {
  guardando.value = true
  mensaje.value = ''
  errores.value = {}

  // Validar y convertir planeta_id correctamente
  let planetaIdValue = null
  if (planeta_id.value && planeta_id.value !== '') {
    const parsed = parseInt(String(planeta_id.value), 10)
    if (!isNaN(parsed) && parsed > 0) {
      planetaIdValue = parsed
      // Verificar que el planeta existe en la lista cargada
      const planetaExiste = planetas.value.some(p => p.id === planetaIdValue)
      if (!planetaExiste) {
        errores.value.planeta_id = 'El planeta seleccionado no es válido'
        guardando.value = false
        mensaje.value = '❌ El planeta seleccionado no existe. Por favor, recarga la página.'
        return
      }
    }
  }

  // Validación básica antes de enviar
  if (!planetaIdValue) {
    errores.value.planeta_id = 'Debes seleccionar un planeta válido'
    guardando.value = false
    mensaje.value = '❌ Por favor, selecciona un planeta válido'
    return
  }

  const nuevo = {
    nombre: nombre.value,
    raza: raza.value,
    nivel_poder: nivel_poder.value,
    edad: edad.value || null,
    descripcion: descripcion.value,
    planeta_id: planetaIdValue,
    tecnica_especial: tecnica_especial.value,
    imagen: imagen.value,
  }

  // Debug: mostrar qué planeta_id se está enviando
  console.log('Enviando personaje:', { ...nuevo, planeta_id: planetaIdValue })
  console.log('Planetas disponibles:', planetas.value.map(p => ({ id: p.id, nombre: p.nombre })))

try {
  const res = await fetch('/api/personajes', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(nuevo)
  })

  // Leer la respuesta una sola vez
  const contentType = res.headers.get('content-type') || ''
    let responseData = null
    
    if (contentType.includes('application/json')) {
      responseData = await res.json()
    } else {
      responseData = await res.text()
    }
    
    if (!res.ok) {
      let detalle = ''
      try {
        if (typeof responseData === 'object' && responseData !== null) {
          const data = responseData
          // El proxy de Nuxt puede devolver errores con estructura { message, data: { message, ... } }
          // Laravel normalmente devuelve { message, errors }
          if (data?.data?.message) {
            // Error del proxy con información detallada
            detalle = data.data.message
            if (data.data.url) {
              detalle += ` (URL: ${data.data.url})`
            }
          } else if (data?.errors && typeof data.errors === 'object') {
            // Errores de validación de Laravel
            errores.value = Object.fromEntries(Object.entries(data.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]))
            detalle = data?.message || 'Errores de validación'
          } else {
            detalle = data?.message || JSON.stringify(data)
          }
        } else {
          detalle = String(responseData)
        }
      } catch (_) {
        // ignorar parsing errors
      }
      throw new Error(detalle || 'Error al guardar el personaje')
    }

    // Obtener el personaje creado de la respuesta (solo si res.ok es true)
    console.log('Personaje creado exitosamente:', responseData)

    mensaje.value = '✅ ¡Personaje creado correctamente!'
    nombre.value = ''
    raza.value = ''
    nivel_poder.value = 0
    edad.value = null
    descripcion.value = ''
    tecnica_especial.value = ''
    planeta_id.value = ''
    imagen.value = ''

    // Esperar un poco más para asegurar que el personaje esté guardado en la BD
    // Redirigir a la página principal con timestamp para forzar recarga
    setTimeout(() => {
      navigateTo(`/personajes?refresh=${Date.now()}`)
    }, 1500)

  } catch (error) {
    console.error('Error al crear personaje:', error)
    
    // Intentar extraer información del error de manera más detallada
    let errorMessage = 'Revisa los campos.'
    if (error?.message) {
      try {
        // Si el error tiene un JSON con detalles, intentar parsearlo
        const parsed = typeof error.message === 'string' && error.message.startsWith('{') 
          ? JSON.parse(error.message) 
          : error.message
        
        if (typeof parsed === 'object' && parsed?.data?.message) {
          errorMessage = parsed.data.message
        } else if (typeof parsed === 'string') {
          errorMessage = parsed
        } else {
          errorMessage = error.message
        }
      } catch {
        errorMessage = error.message
      }
    }
    
    mensaje.value = `❌ Hubo un error al crear el personaje. Detalle: ${errorMessage}`
  } finally {
    guardando.value = false
  }
}
</script>

