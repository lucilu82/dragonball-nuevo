<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">🧪 Prueba de Imágenes</h1>
    
    <div class="grid grid-cols-3 gap-4">
      <div v-for="personaje in personajes" :key="personaje.id" class="border p-4 rounded">
        <h3 class="font-bold">{{ personaje.nombre }}</h3>
        <p class="text-sm text-gray-600">{{ personaje.image }}</p>
        <img 
          :src="personaje.image" 
          :alt="personaje.nombre"
          class="w-full h-32 object-contain border"
          @load="onImageLoad(personaje.nombre)"
          @error="onImageError(personaje.nombre)"
        />
        <p class="text-xs mt-2" :class="imageStatus[personaje.nombre]?.success ? 'text-green-600' : 'text-red-600'">
          {{ imageStatus[personaje.nombre]?.message || 'Cargando...' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const personajes = ref([])
const imageStatus = ref({})

onMounted(async () => {
  try {
    personajes.value = await $fetch('/api/personajes')
    console.log('✅ Personajes cargados para prueba:', personajes.value.length)
  } catch (error) {
    console.error('❌ Error al cargar personajes:', error)
  }
})

const onImageLoad = (nombre) => {
  imageStatus.value[nombre] = {
    success: true,
    message: '✅ Imagen cargada correctamente'
  }
  console.log(`✅ Imagen cargada: ${nombre}`)
}

const onImageError = (nombre) => {
  imageStatus.value[nombre] = {
    success: false,
    message: '❌ Error al cargar imagen'
  }
  console.error(`❌ Error al cargar imagen: ${nombre}`)
}
</script>
