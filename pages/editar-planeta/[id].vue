<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">🛠️ Editar planeta</h1>
      <div class="flex gap-2">
        <NuxtLink
          to="/planetas"
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded transition-colors duration-200"
        >
          ← Volver
        </NuxtLink>
      </div>
    </div>

    <div v-if="cargandoDatos" class="text-center text-gray-500 italic py-8">
      Cargando datos del planeta...
    </div>

    <div v-else-if="!planetaEncontrado" class="text-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-6">
      ❌ No se encontró el planeta solicitado. Revisa el ID o regresa al listado.
    </div>

    <form v-else @submit.prevent="actualizarPlaneta" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block font-semibold text-gray-700 mb-2">Nombre *</label>
          <input
            v-model.trim="form.nombre"
            type="text"
            required
            class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            :class="{ 'border-red-500': errores.nombre }"
          />
          <p v-if="errores.nombre" class="text-red-500 text-sm mt-1">{{ errores.nombre }}</p>
        </div>

        <div>
          <label class="block font-semibold text-gray-700 mb-2">Galaxia</label>
          <input
            v-model.trim="form.galaxia"
            type="text"
            placeholder="Universo 7, Vía Láctea..."
            class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block font-semibold text-gray-700 mb-2">Población estimada</label>
          <input
            v-model.number="form.poblacion"
            type="number"
            min="0"
            placeholder="Ej: 7500000"
            class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p v-if="errores.poblacion" class="text-red-500 text-sm mt-1">{{ errores.poblacion }}</p>
        </div>

        <div>
          <label class="block font-semibold text-gray-700 mb-2">Imagen (URL)</label>
          <input
            v-model.trim="form.imagen"
            type="url"
            placeholder="https://..."
            class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p class="text-xs text-gray-500 mt-1">Si lo dejas vacío, intentaremos asignar una imagen automáticamente.</p>
        </div>
      </div>

      <div>
        <label class="block font-semibold text-gray-700 mb-2">Descripción</label>
        <textarea
          v-model.trim="form.descripcion"
          rows="4"
          placeholder="Características, habitantes destacados, clima..."
          class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        ></textarea>
      </div>

      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="guardando"
          class="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <span v-if="guardando">⏳</span>
          <span v-else>💾</span>
          {{ guardando ? 'Actualizando...' : 'Actualizar planeta' }}
        </button>

        <button
          type="button"
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
          @click="restablecerCambios"
        >
          Restablecer
        </button>
      </div>
    </form>

    <div
      v-if="mensaje"
      class="mt-4 p-4 rounded-lg"
      :class="mensaje.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
    >
      {{ mensaje }}
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const idParam = computed(() => Number(route.params.id))

const cargandoDatos = ref(true)
const planetaEncontrado = ref(false)
const guardando = ref(false)
const mensaje = ref('')
const errores = ref<Record<string, string>>({})

const form = reactive({
  nombre: '',
  galaxia: '',
  poblacion: null as number | null,
  descripcion: '',
  imagen: '',
})

const respaldoInicial = ref<Record<string, any> | null>(null)

const normalizarPayload = () => {
  const payload: Record<string, any> = {
    nombre: form.nombre?.trim(),
    galaxia: form.galaxia?.trim() || null,
    poblacion: form.poblacion !== null ? Number(form.poblacion) : null,
    descripcion: form.descripcion?.trim() || null,
    imagen: form.imagen?.trim() || null,
  }

  if (!payload.galaxia) delete payload.galaxia
  if (payload.poblacion === null || Number.isNaN(payload.poblacion)) delete payload.poblacion
  if (!payload.descripcion) delete payload.descripcion
  if (!payload.imagen) delete payload.imagen

  return payload
}

const restablecerCambios = () => {
  if (!respaldoInicial.value) return
  form.nombre = respaldoInicial.value.nombre || ''
  form.galaxia = respaldoInicial.value.galaxia || ''
  form.poblacion = respaldoInicial.value.poblacion ?? null
  form.descripcion = respaldoInicial.value.descripcion || ''
  form.imagen = respaldoInicial.value.imagen || ''
  errores.value = {}
  mensaje.value = ''
}

const cargarPlaneta = async () => {
  cargandoDatos.value = true
  mensaje.value = ''
  errores.value = {}

  try {
    const data = await $fetch('/api/planetas', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'X-Request-ID': Date.now().toString(),
      },
    })

    if (!Array.isArray(data)) {
      throw new Error('Respuesta inesperada al obtener planetas')
    }

    const planeta = data.find((p: any) => Number(p.id) === idParam.value)

    if (!planeta) {
      planetaEncontrado.value = false
      mensaje.value = '❌ No se encontró el planeta solicitado.'
      return
    }

    planetaEncontrado.value = true
    form.nombre = planeta.nombre || ''
    form.galaxia = planeta.galaxia || planeta.universe || ''
    form.poblacion = planeta.poblacion ?? null
    form.descripcion = planeta.descripcion || ''
    form.imagen = planeta.imagen || planeta.image || ''

    respaldoInicial.value = {
      nombre: form.nombre,
      galaxia: form.galaxia,
      poblacion: form.poblacion,
      descripcion: form.descripcion,
      imagen: form.imagen,
    }
  } catch (error: any) {
    console.error('Error cargando planeta:', error)
    planetaEncontrado.value = false
    mensaje.value = '❌ No se pudieron obtener los datos del planeta. Verifica que Laravel esté disponible.'
  } finally {
    cargandoDatos.value = false
  }
}

onMounted(() => {
  if (!idParam.value || Number.isNaN(idParam.value)) {
    mensaje.value = '❌ ID inválido.'
    cargandoDatos.value = false
    planetaEncontrado.value = false
    return
  }

  cargarPlaneta()
})

const validarFormulario = () => {
  errores.value = {}

  if (!form.nombre) {
    errores.value.nombre = 'El nombre es obligatorio'
  }

  if (form.poblacion !== null && form.poblacion < 0) {
    errores.value.poblacion = 'La población no puede ser negativa'
  }

  return Object.keys(errores.value).length === 0
}

const actualizarPlaneta = async () => {
  if (!validarFormulario()) {
    mensaje.value = '❌ Revisa los campos marcados en rojo.'
    return
  }

  guardando.value = true
  mensaje.value = ''

  try {
    const payload = normalizarPayload()

    const res = await fetch(`/api/planetas/${idParam.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const contentType = res.headers.get('content-type') || ''
    const data = res.status === 204
      ? null
      : contentType.includes('application/json')
        ? await res.json().catch(() => null)
        : await res.text().catch(() => null)

    if (!res.ok) {
      let detalle = typeof data === 'string' ? data : data?.message || 'Error al actualizar el planeta'

      if (typeof data === 'object' && data?.errors) {
        const firstError = Object.values(data.errors)[0]
        detalle = Array.isArray(firstError) ? firstError[0] : String(firstError)
      }

      throw new Error(detalle)
    }

    mensaje.value = '✅ Planeta actualizado correctamente'
    respaldoInicial.value = { ...form }

    setTimeout(() => {
      navigateTo(`/planetas?refresh=${Date.now()}`)
    }, 1000)
  } catch (error: any) {
    const detalle = error?.message || 'No se pudo actualizar el planeta. Verifica el backend de Laravel.'
    mensaje.value = `❌ ${detalle}`
  } finally {
    guardando.value = false
  }
}
</script>

