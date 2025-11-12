<template>
  <div class="page-transformations min-h-screen overflow-hidden p-8">
    <div class="page-transformations__overlay pointer-events-none"></div>
    <div class="page-transformations__stars pointer-events-none"></div>
    <div class="page-transformations__lightning pointer-events-none">
      <div class="lightning lightning-1"></div>
      <div class="lightning lightning-2"></div>
      <div class="lightning lightning-3"></div>
      <div class="lightning lightning-4"></div>
    </div>
    <div class="page-transformations__energy pointer-events-none">
      <div class="energy-sphere sphere-1"></div>
      <div class="energy-sphere sphere-2"></div>
      <div class="energy-sphere sphere-3"></div>
      <div class="energy-sphere sphere-4"></div>
      <div class="energy-sphere sphere-5"></div>
      <div class="energy-sphere sphere-6"></div>
      <div class="energy-sphere sphere-7"></div>
    </div>

    <div class="page-transformations__content max-w-7xl mx-auto relative z-10">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <NuxtLink to="/" class="text-4xl font-bold torch-title flex items-center gap-2 transition-transform duration-200 hover:scale-105">
          <span>⚡</span>
          <span> Transformaciones</span>
        </NuxtLink>
        <NuxtLink 
          to="/" 
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
        >
          ← Volver
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center text-gray-600 italic py-12">
        Cargando transformaciones...
      </div>

      <!-- Grid de transformaciones -->
      <div v-else-if="transformaciones.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="transformacion in transformaciones" 
          :key="transformacion.id"
          class="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl group"
        >
          <!-- Imagen de la transformación -->
          <div class="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            <img 
              :src="transformacion.image" 
              :alt="transformacion.name"
              class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
              @error="handleImageError"
            />
            <!-- Badge de KI -->
            <div class="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              KI: {{ transformacion.ki }}
            </div>
          </div>
          
          <!-- Información -->
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-2">{{ transformacion.name }}</h3>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span class="font-semibold">ID:</span>
              <span>{{ transformacion.id }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin transformaciones -->
      <div v-else class="text-center text-gray-500 py-12">
        <p class="text-xl">No se encontraron transformaciones</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const transformaciones = ref(['/dbz/sky3.jpg'])
const loading = ref(true)

onMounted(async () => {
  try {
    console.log('Cargando transformaciones...')
    const data = await $fetch('/api/transformaciones')
    transformaciones.value = Array.isArray(data) ? data : []
    console.log('Transformaciones cargadas:', transformaciones.value.length)
  } catch (error) {
    console.error('Error al cargar transformaciones:', error)
    transformaciones.value = []
  } finally {
    loading.value = false
  }
})

// Función para manejar errores de imagen
const handleImageError = (event) => {
  console.warn('Error al cargar imagen de transformación:', event.target.src)
  event.target.src = '/dbz/default.svg'
}
</script>

<style scoped>
.page-transformations {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1330 0%, #1a1644 50%, #070b1c 100%);
  overflow: hidden;
}

.page-transformations::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url('/dbz/transformaciones-bg.jpg') center top / cover no-repeat fixed;
  opacity: 0.85;
  mix-blend-mode: screen;
  z-index: 0;
}

.page-transformations__overlay,
.page-transformations__stars,
.page-transformations__lightning,
.page-transformations__energy {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.page-transformations__overlay {
  background: rgba(0, 0, 0, 0.45);
}

.page-transformations__stars {
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 60px 70px, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(1px 1px at 50px 50px, #fff, transparent),
    radial-gradient(1px 1px at 80px 30px, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(2px 2px at 90px 70px, #eee, transparent),
    radial-gradient(1px 1px at 130px 40px, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(2px 2px at 160px 60px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 8s ease-in-out infinite;
  opacity: 0.75;
}

.page-transformations__lightning {
  overflow: hidden;
}

.lightning {
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom,
    transparent 0%,
    rgba(255, 255, 255, 0.85) 10%,
    rgba(173, 216, 255, 0.9) 50%,
    rgba(255, 255, 255, 0.85) 90%,
    transparent 100%);
  opacity: 0;
  box-shadow:
    0 0 10px rgba(255, 255, 255, 0.8),
    0 0 20px rgba(180, 210, 255, 0.6),
    0 0 30px rgba(150, 200, 255, 0.4);
  animation: lightning 4s infinite;
}

.lightning-1 { left: 12%; animation-delay: 0s; }
.lightning-2 { left: 32%; animation-delay: 1s; }
.lightning-3 { left: 62%; animation-delay: 2s; }
.lightning-4 { left: 82%; animation-delay: 0.5s; }

.page-transformations__energy {
  overflow: visible;
}

.energy-sphere {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, 
    rgba(255, 255, 255, 0.9), 
    rgba(255, 215, 0, 0.8),
    rgba(255, 140, 0, 0.6));
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.8),
    0 0 40px rgba(255, 215, 0, 0.6),
    inset -10px -10px 20px rgba(0, 0, 0, 0.3);
  opacity: 0.7;
  animation: float-sphere 6s ease-in-out infinite;
}

.sphere-1 { left: 8%; top: 20%; animation-delay: 0s; }
.sphere-2 { left: 22%; top: 58%; animation-delay: 1s; animation-duration: 7s; }
.sphere-3 { left: 48%; top: 12%; animation-delay: 2s; animation-duration: 8s; }
.sphere-4 { left: 68%; top: 48%; animation-delay: 1.5s; animation-duration: 6.5s; }
.sphere-5 { left: 85%; top: 28%; animation-delay: 0.5s; animation-duration: 7.5s; }
.sphere-6 { left: 18%; top: 82%; animation-delay: 2.5s; animation-duration: 8.5s; }
.sphere-7 { left: 42%; top: 70%; animation-delay: 1.2s; animation-duration: 9s; }

.page-transformations__content {
  position: relative;
  z-index: 10;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@keyframes lightning {
  0%, 100% {
    opacity: 0;
    transform: translateY(-100%) translateX(0);
  }
  5%, 10% {
    opacity: 1;
    transform: translateY(0) translateX(0);
  }
  15% {
    opacity: 0;
    transform: translateY(100%) translateX(10px);
  }
}

@keyframes float-sphere {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-12px) scale(1.03);
  }
}

.torch-title {
  position: relative;
  font-family: 'Bangers', 'Orbitron', cursive;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #f8fafc;
  text-shadow:
    2px 2px 0px rgba(14, 116, 144, 0.55),
    4px 4px 0px rgba(56, 189, 248, 0.45),
    0 0 18px rgba(56, 189, 248, 0.6);
  padding: 0.3rem 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.torch-title::before,
.torch-title::after {
  content: "";
  position: absolute;
  inset: -12%;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.35), transparent 65%);
  filter: blur(12px);
  opacity: 0.65;
  pointer-events: none;
  z-index: -1;
}

.torch-title::after {
  inset: -28% -15%;
  background: conic-gradient(
    from 90deg,
    rgba(59, 130, 246, 0),
    rgba(59, 130, 246, 0.5),
    rgba(236, 72, 153, 0.0) 65%
  );
  filter: blur(18px);
  opacity: 0.45;
  animation: title-electric 3.6s ease-in-out infinite;
}

.torch-title span {
  position: relative;
  display: inline-block;
  animation: title-flicker 2.8s ease-in-out infinite;
}

.torch-title span:nth-child(1) {
  animation-delay: 0.2s;
}

.torch-title span:nth-child(2) {
  animation-delay: 0.5s;
}

@keyframes title-flicker {
  0%, 100% {
    text-shadow:
      2px 2px 0px rgba(14, 116, 144, 0.5),
      0 0 14px rgba(56, 189, 248, 0.45);
    transform: translateY(0);
  }
  45% {
    text-shadow:
      3px 3px 0px rgba(37, 99, 235, 0.55),
      0 0 22px rgba(59, 130, 246, 0.75);
    transform: translateY(-2px);
  }
  65% {
    text-shadow:
      1px 1px 0px rgba(14, 116, 144, 0.4),
      0 0 10px rgba(56, 189, 248, 0.35);
    transform: translateY(1px);
  }
}

@keyframes title-electric {
  0% {
    transform: rotate(0deg);
    opacity: 0.35;
  }
  50% {
    transform: rotate(8deg);
    opacity: 0.7;
  }
  100% {
    transform: rotate(0deg);
    opacity: 0.35;
  }
}
</style>

