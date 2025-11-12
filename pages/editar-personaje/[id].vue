<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">✏️ Editar Personaje</h1>
      <NuxtLink 
        to="/personajes" 
        class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded transition-colors duration-200"
      >
        ← Volver
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="text-gray-600">Cargando datos del personaje...</div>
    </div>

    <form v-else @submit.prevent="actualizarPersonaje" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block font-semibold text-gray-700 mb-2">Nombre *</label>
          <input 
            v-model="personaje.nombre" 
            type="text"
            class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
            :class="{ 'border-red-500': errores.nombre }"
          />
          <p v-if="errores.nombre" class="text-red-500 text-sm mt-1">{{ errores.nombre }}</p>
        </div>

        <div>
          <label class="block font-semibold text-gray-700 mb-2">Raza *</label>
          <select 
            v-model="personaje.raza" 
            class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            :class="{ 'border-red-500': errores.raza }"
          >
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
          <input 
            v-model.number="personaje.nivel_poder" 
            type="number" 
            min="0"
            max="999999999"
            class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
            :class="{ 'border-red-500': errores.nivel_poder }"
          />
          <p v-if="errores.nivel_poder" class="text-red-500 text-sm mt-1">{{ errores.nivel_poder }}</p>
        </div>

        <div>
          <label class="block font-semibold text-gray-700 mb-2">Edad</label>
          <input 
            v-model.number="personaje.edad" 
            type="number" 
            min="0"
            max="1000"
            class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label class="block font-semibold text-gray-700 mb-2">Planeta *</label>
        <select 
          v-model="personaje.planeta_id" 
          class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          required
          :class="{ 'border-red-500': errores.planeta_id }"
        >
          <option value="" disabled>Selecciona un planeta</option>
          <option v-for="p in planetas" :key="p.id" :value="p.id">{{ p.nombre }}</option>
        </select>
        <p v-if="errores.planeta_id" class="text-red-500 text-sm mt-1">{{ errores.planeta_id }}</p>
      </div>

      <div>
        <label class="block font-semibold text-gray-700 mb-2">Técnica Especial</label>
        <input 
          v-model="personaje.tecnica_especial" 
          type="text"
          placeholder="Ej: Kamehameha, Final Flash..."
          class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label class="block font-semibold text-gray-700 mb-2">Descripción *</label>
        <textarea 
          v-model="personaje.descripcion" 
          rows="4"
          class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          required
          :class="{ 'border-red-500': errores.descripcion }"
        ></textarea>
        <p v-if="errores.descripcion" class="text-red-500 text-sm mt-1">{{ errores.descripcion }}</p>
      </div>

      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="guardando"
          class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <span v-if="guardando">⏳</span>
          <span v-else>💾</span>
          {{ guardando ? 'Guardando...' : 'Actualizar Personaje' }}
        </button>
        
        <button
          type="button"
          @click="cancelar"
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
        >
          Cancelar
        </button>
      </div>
    </form>

    <div v-if="mensaje" class="mt-4 p-4 rounded-lg" :class="mensaje.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
      {{ mensaje }}
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const personaje = ref({
  id: null,
  nombre: '',
  raza: '',
  nivel_poder: 0,
  edad: null,
  descripcion: '',
  tecnica_especial: '',
  planeta_id: ''
})

const planetas = ref([])
const loading = ref(true)
const guardando = ref(false)
const mensaje = ref('')
const errores = ref({})

// Cargar datos del personaje y planetas
onMounted(async () => {
  try {
    // Cargar planetas
    planetas.value = await $fetch('/api/planetas')
    
    // Cargar datos del personaje
    const personajes = await $fetch('/api/personajes')
    const personajeEncontrado = personajes.find(p => p.id == route.params.id)
    
    if (personajeEncontrado) {
      personaje.value = { ...personajeEncontrado }
    } else {
      mensaje.value = '❌ Personaje no encontrado'
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    mensaje.value = '❌ Error al cargar los datos'
  } finally {
    loading.value = false
  }
})

// Validar formulario
const validarFormulario = () => {
  errores.value = {}
  
  if (!personaje.value.nombre.trim()) {
    errores.value.nombre = 'El nombre es requerido'
  } else if (personaje.value.nombre.trim().length < 2) {
    errores.value.nombre = 'El nombre debe tener al menos 2 caracteres'
  }
  
  if (!personaje.value.raza) {
    errores.value.raza = 'La raza es requerida'
  }
  
  if (!personaje.value.nivel_poder || personaje.value.nivel_poder < 0) {
    errores.value.nivel_poder = 'El nivel de poder debe ser mayor a 0'
  }
  
  if (!personaje.value.descripcion.trim()) {
    errores.value.descripcion = 'La descripción es requerida'
  } else if (personaje.value.descripcion.trim().length < 10) {
    errores.value.descripcion = 'La descripción debe tener al menos 10 caracteres'
  }
  
  if (!personaje.value.planeta_id) {
    errores.value.planeta_id = 'El planeta es requerido'
  }
  
  return Object.keys(errores.value).length === 0
}

// Actualizar personaje
const actualizarPersonaje = async () => {
  if (!validarFormulario()) {
    mensaje.value = '❌ Por favor corrige los errores en el formulario'
    return
  }
  
  guardando.value = true
  mensaje.value = ''
  
  try {
    const datosActualizados = {
      nombre: personaje.value.nombre?.trim() || '',
      raza: personaje.value.raza || '',
      nivel_poder: parseInt(personaje.value.nivel_poder) || 0,
      edad: personaje.value.edad ? parseInt(personaje.value.edad) : null,
      descripcion: personaje.value.descripcion?.trim() || '',
      tecnica_especial: personaje.value.tecnica_especial?.trim() || '',
      planeta_id: parseInt(personaje.value.planeta_id) || 1
    }
    
    await $fetch(`/api/personajes/${personaje.value.id}`, {
      method: 'PUT',
      body: datosActualizados
    })
    
    mensaje.value = '✅ ¡Personaje actualizado correctamente!'
    
    // Redirigir después de 2 segundos
    setTimeout(() => {
      router.push('/personajes')
    }, 2000)
    
  } catch (error) {
    console.error('Error al actualizar personaje:', error)
    mensaje.value = `❌ Error al actualizar personaje: ${error.message}`
  } finally {
    guardando.value = false
  }
}

// Cancelar edición
const cancelar = () => {
  router.push('/personajes')
}
</script>


