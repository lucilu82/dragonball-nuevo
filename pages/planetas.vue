<template>
  <div class="page-galaxy relative min-h-screen p-4 sm:p-6 lg:p-8 overflow-hidden">
    <div class="absolute inset-0 page-galaxy__overlay pointer-events-none"></div>
    <div class="absolute inset-0 page-galaxy__stars pointer-events-none"></div>
    <div class="absolute inset-0 page-galaxy__lightning pointer-events-none">
      <div class="lightning lightning-1"></div>
      <div class="lightning lightning-2"></div>
      <div class="lightning lightning-3"></div>
      <div class="lightning lightning-4"></div>
    </div>
    <div class="absolute inset-0 page-galaxy__energy pointer-events-none">
      <div class="energy-sphere sphere-1"></div>
      <div class="energy-sphere sphere-2"></div>
      <div class="energy-sphere sphere-3"></div>
      <div class="energy-sphere sphere-4"></div>
      <div class="energy-sphere sphere-5"></div>
      <div class="energy-sphere sphere-6"></div>
      <div class="energy-sphere sphere-7"></div>
    </div>

    <div class="page-galaxy__content relative z-10">
      <div class="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between mb-6">
        <NuxtLink to="/" class="planet-title text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 transition-transform duration-200 hover:scale-105 text-center sm:text-left">
          <span>🪐</span>
          <span class="whitespace-nowrap">Planetas del Universo Dragon Ball</span>
        </NuxtLink>
        <div class="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-end">
          <NuxtLink 
            to="/nuevo-planeta"
            class="bg-green-500 hover:bg-green-600 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
          >
            ➕ <span class="hidden sm:inline">Nuevo Planeta</span><span class="sm:hidden">Nuevo</span>
          </NuxtLink>
          <NuxtLink 
            to="/personajes" 
            class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
          >
            👥 <span class="hidden sm:inline">Ver Personajes</span><span class="sm:hidden">Personajes</span>
          </NuxtLink>
        </div>
      </div>

      <div v-if="loading" class="text-center text-gray-600 italic">Cargando planetas...</div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        <div
          v-for="planeta in planetas"
          :key="planeta.id"
          class="planet-card group"
        >
          <div class="planet-card__glow"></div>
          <div class="planet-card__inner">
          <!-- Header del planeta -->
          <div class="planet-card__header">
            <!-- Imagen del planeta o emoji por defecto -->
            <div class="planet-orbit">
              <div class="planet-orbit__ring planet-orbit__ring--outer"></div>
              <div class="planet-orbit__ring planet-orbit__ring--inner"></div>
              <img 
                v-if="getPlanetImage(planeta) && !hasImageError(planeta)"
                :src="getPlanetImage(planeta)" 
                :alt="planeta.nombre || 'Planeta desconocido'"
                class="planet-orbit__planet"
                @error="handleImageError"
              />
              <div v-else class="planet-orbit__fallback">
                🪐
              </div>
            </div>
            <div class="planet-card__title">
              <h2 class="planet-name">{{ planeta.nombre || 'Planeta desconocido' }}</h2>
              <div class="planet-galaxy">{{ planeta.galaxia || 'Galaxia desconocida' }}</div>
            </div>
          </div>

          <!-- Información del planeta -->
          <div class="planet-stats">
            <div class="planet-stats__item">
              <div class="planet-stats__label">👥 Población</div>
              <div class="planet-stats__value">
                {{ (planeta.poblacion ?? 0).toLocaleString() }}
              </div>
            </div>
            <div class="planet-stats__item">
              <div class="planet-stats__label">🛰️ ID Galáctico</div>
              <div class="planet-stats__value">#{{ planeta.id }}</div>
            </div>
          </div>

          <div class="planet-card__actions">
            <button
              type="button"
              class="planet-card__action planet-card__action--edit"
              @click.stop="editarPlaneta(planeta)"
            >
              ✏️ Editar
            </button>
            <button
              type="button"
              class="planet-card__action planet-card__action--delete"
              @click.stop="eliminarPlaneta(planeta)"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

interface PlanetaItem {
  id: number | string
  nombre?: string | null
  galaxia?: string | null
  poblacion?: number | null
  descripcion?: string | null
  imagen?: string | null
  image?: string | null
  [key: string]: any
}

type ImageMap = Record<string, string>
type NumberMap = Record<string, number>
type BooleanMap = Record<string, boolean | undefined>

const planetas = ref<PlanetaItem[]>([])
const loading = ref(true)
const imageErrors = ref<BooleanMap>({})
const imageUrls = ref<ImageMap>({}) // Almacenar las URLs de imagen para cada planeta
const imageCandidateIndex = ref<NumberMap>({})

const normalizeName = (value = ''): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()

const slugifyName = (value = ''): string =>
  normalizeName(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const toArray = (value: string | string[] | null | undefined): string[] => {
  if (Array.isArray(value)) {
    return value
  }
  return value ? [value] : []
}

// Mapeo de imágenes de planetas desde la API de Dragon Ball
// Intentamos múltiples URLs posibles para cada planeta
// Agregamos más variantes para asegurar que todos los planetas tengan imagen
const planetImagesMap = {
  'tierra': [
    'https://dragonball-api.com/planetas/Tierra_Dragon_Ball_Z.webp',
    'https://dragonball-api.com/planets/earth.webp',
    'https://dragonball-api.com/planets/earth.png',
    'https://dragonball-api.com/images/planets/earth.webp',
    'https://web.dragonball-api.com/images/planets/earth.webp'
  ],
  'earth': [
    'https://dragonball-api.com/planets/earth.webp',
    'https://dragonball-api.com/planets/earth.png'
  ],
  'namek': [
    'https://dragonball-api.com/planetas/Namek_U7.webp',
    'https://dragonball-api.com/planets/namek.webp',
    'https://dragonball-api.com/planets/namek.png',
    'https://dragonball-api.com/images/planets/namek.webp',
    'https://web.dragonball-api.com/images/planets/namek.webp'
  ],
  'namekusei': [
    'https://dragonball-api.com/planetas/Namek_U7.webp',
    'https://dragonball-api.com/planets/namek.webp',
    'https://dragonball-api.com/planets/namekusei.webp',
    'https://dragonball-api.com/images/planets/namek.webp',
    'https://web.dragonball-api.com/images/planets/namek.webp'
  ],
  'vegeta': [
    'https://dragonball-api.com/planetas/Planeta_Vegeta_en_Dragon_Ball_Super_Broly.webp',
    'https://dragonball-api.com/planets/vegeta.webp',
    'https://dragonball-api.com/planets/vegeta.png',
    'https://dragonball-api.com/images/planets/vegeta.webp',
    'https://web.dragonball-api.com/images/planets/vegeta.webp'
  ],
  'sadala': [
    'https://vignette.wikia.nocookie.net/dragonball/images/7/72/Planeta_Sadala_del_Universo_7_flashback_anime_DBZ.png/revision/latest?cb=20200829223508&path-prefix=es',
    'https://dragonball-api.com/planets/sadala.webp',
    'https://dragonball-api.com/planets/sadala.png',
    'https://dragonball-api.com/images/planets/sadala.webp',
    'https://web.dragonball-api.com/images/planets/sadala.webp',
    'https://dragonball-api.com/planets/planet-sadala.webp',
    'https://dragonball-api.com/planets/sadala-planet.webp'
  ],
  'kaioshinkai': [
    'https://dragonball-api.com/planets/kaioshinkai.webp',
    'https://dragonball-api.com/planets/kaioshinkai.png',
    'https://dragonball-api.com/images/planets/kaioshinkai.webp',
    'https://web.dragonball-api.com/images/planets/kaioshinkai.webp',
    'https://dragonball-api.com/planets/kai.webp',
    'https://dragonball-api.com/planets/kaio.webp',
    'https://dragonball-api.com/planets/kaioshin.webp'
  ],
  'ares': [
    '/dbz/planets/ares.svg',
    'https://static.wikia.nocookie.net/dragonball/images/4/48/Arlnia_Destrucion.png/revision/latest/scale-to-width-down/457?cb=20131117050411&path-prefix=es',
    'https://dragonball-api.com/planets/ares.webp',
    'https://dragonball-api.com/planets/ares.png',
    'https://dragonball-api.com/images/planets/ares.webp',
    'https://web.dragonball-api.com/images/planets/ares.webp',
    'https://dragonball-api.com/planets/planet-ares.webp'
  ],
  'planeta ares': [
    '/dbz/planets/ares.svg',
    'https://static.wikia.nocookie.net/dragonball/images/4/48/Arlnia_Destrucion.png/revision/latest/scale-to-width-down/457?cb=20131117050411&path-prefix=es',
    'https://dragonball-api.com/planets/ares.webp',
    'https://dragonball-api.com/planets/ares.png',
    'https://dragonball-api.com/images/planets/ares.webp',
    'https://web.dragonball-api.com/images/planets/ares.webp',
    'https://dragonball-api.com/planets/planet-ares.webp'
  ],
  'templo móvil del rey de todo': [
    'https://dragonball-api.com/planetas/Trono_del_Rey_de_Todo.webp',
    'https://dragonball-api.com/planets/Trono_del_Rey_de_Todo.webp',
    'https://dragonball-api.com/planets/templo-rey-todo.webp'
  ],
  'templo movil del rey de todo': [
    'https://dragonball-api.com/planetas/Trono_del_Rey_de_Todo.webp',
    'https://dragonball-api.com/planets/Trono_del_Rey_de_Todo.webp',
    'https://dragonball-api.com/planets/templo-rey-todo.webp'
  ],
  'freezer no. 79': [
    'https://dragonball-api.com/planetas/PlanetaFreezer.webp',
    'https://dragonball-api.com/planets/freezer-79.webp',
    'https://dragonball-api.com/planets/freezer-no-79.webp'
  ],
  'freezer no 79': [
    'https://dragonball-api.com/planetas/PlanetaFreezer.webp',
    'https://dragonball-api.com/planets/freezer-79.webp',
    'https://dragonball-api.com/planets/freezer-no-79.webp'
  ],
  'monmar': [
    'https://static.wikia.nocookie.net/dragonball/images/8/82/Planeta_Monmaasu.png/revision/latest/thumbnail/width/360/height/360?cb=20150812184953&path-prefix=es',
    'https://dragonball-api.com/planetas/monmar.webp'
  ],
  'yardrat': [
    'https://static.wikia.nocookie.net/dragonball/images/0/0c/DBS51-7.png/revision/latest?cb=20220711152634',
    'https://dragonball-api.com/planetas/PlanetYardrat.webp',
    'https://dragonball-api.com/planets/yardrat.webp'
  ],
  'kaiō del norte': [
    'https://dragonball-api.com/planetas/Planeta_del_Kaio_del_Norte.webp',
    'https://dragonball-api.com/planets/kaio-del-norte.webp'
  ],
  'kaio del norte': [
    'https://dragonball-api.com/planetas/Planeta_del_Kaio_del_Norte.webp',
    'https://dragonball-api.com/planets/kaio-del-norte.webp'
  ],
  'makyo': [
    'https://dragonball-api.com/planetas/Makyo_Star.webp',
    'https://dragonball-api.com/planets/makyo.webp'
  ],
  'babari': [
    'https://dragonball-api.com/planetas/Planeta_Babari.webp',
    'https://dragonball-api.com/planets/babari.webp'
  ],
}

const planetImagesLookup = Object.entries(planetImagesMap).reduce<Record<string, string[]>>((acc, [key, urls]) => {
  acc[normalizeName(key)] = toArray(urls)
  return acc
}, {})

const buildImageCandidates = (planeta: PlanetaItem): string[] => {
  const candidates: string[] = []
  const initial = planeta?.imagen && planeta.imagen.startsWith('http') ? planeta.imagen : null
  if (initial) {
    candidates.push(initial)
  }

  const nombreKey = normalizeName(planeta?.nombre || '')
  const predefined = planetImagesLookup[nombreKey] || []
  candidates.push(...predefined)

  const slug = slugifyName(planeta?.nombre || '')
  if (slug) {
    candidates.push(
      `https://dragonball-api.com/planets/${slug}.webp`,
      `https://dragonball-api.com/planets/${slug}.png`,
      `https://dragonball-api.com/planets/${slug}.jpg`,
      `https://dragonball-api.com/planets/${slug}.jpeg`,
      `https://dragonball-api.com/planetas/${slug}.webp`,
      `https://dragonball-api.com/planetas/${slug}.png`,
      `https://dragonball-api.com/planetas/${slug}.jpg`,
      `https://dragonball-api.com/images/planets/${slug}.webp`,
      `https://dragonball-api.com/images/planets/${slug}.png`,
      `https://dragonball-api.com/images/planets/${slug}.jpg`,
      `https://web.dragonball-api.com/images/planets/${slug}.webp`,
      `https://web.dragonball-api.com/images/planets/${slug}.png`,
      `https://web.dragonball-api.com/images/planets/${slug}.jpg`
    )
  }

  return [...new Set(candidates.filter(Boolean))]
}

// Función para obtener la imagen del planeta
const getPlanetImage = (planeta: PlanetaItem | null | undefined): string | undefined => {
  if (!planeta) return undefined

  const planetaKey = String(
    planeta.id != null && planeta.id !== ''
      ? planeta.id
      : slugifyName(planeta.nombre ?? '')
  )

  if (imageUrls.value[planetaKey]) {
    return imageUrls.value[planetaKey]
  }
  
  const candidates = buildImageCandidates(planeta)

  if (candidates.length === 0) {
    return undefined
  }
  
  imageCandidateIndex.value[planetaKey] = 0
  const firstCandidate = candidates[0]!
  imageUrls.value[planetaKey] = firstCandidate
  return firstCandidate
}

// Función para manejar errores de imagen e intentar con URLs alternativas
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement | null
  if (!target) return

  const planetaNombre = target.alt
  const img = target
  
  if (!planetaNombre) return
  
  // Encontrar el planeta correspondiente
  const planeta = planetas.value.find((p) => p.nombre === planetaNombre)
  if (!planeta) return
  
  const planetaKey = String(
    planeta.id != null && planeta.id !== ''
      ? planeta.id
      : slugifyName(planetaNombre || '')
  )
  const candidates = buildImageCandidates(planeta)
  const currentIndex = imageCandidateIndex.value[planetaKey] ?? candidates.indexOf(img.src)
  const nextIndex = (currentIndex ?? -1) + 1

  if (nextIndex < candidates.length) {
    const nextUrl = candidates[nextIndex]!
    imageCandidateIndex.value[planetaKey] = nextIndex
    imageUrls.value[planetaKey] = nextUrl
    img.src = nextUrl
    return
  }

  // Si no hay más URLs alternativas, marcar como error y ocultar
  imageErrors.value[planetaNombre] = true
  img.style.display = 'none'
}

const hasImageError = (planeta: PlanetaItem): boolean => {
  const key = (planeta.nombre ?? '').toString()
  if (!key) {
    return false
  }
  return Boolean(imageErrors.value[key])
}

const cargarPlanetas = async () => {
  loading.value = true
  imageErrors.value = {} as BooleanMap
  imageUrls.value = {} as ImageMap
  imageCandidateIndex.value = {} as NumberMap

  const config = useRuntimeConfig()
  const source = config.public?.planetsSource || 'proxy'
  const laravelBase = config.public?.laravelBase || 'http://127.0.0.1:8000'

  try {
    const obtenerPlanetas = async () => {
      if (source === 'laravel') {
        return await fetch(`${laravelBase}/planetas`, { headers: { 'Accept': 'application/json' } }).then(r => r.json())
      }
      if (source === 'external') {
        return await $fetch('/api/planetas')
      }
      return await $fetch('/api/planetas')
    }

    const data = await obtenerPlanetas()
    const listaPlanetas = (Array.isArray(data) ? data : []) as PlanetaItem[]
    planetas.value = [...listaPlanetas].sort((a, b) => {
      const idA = Number(a?.id ?? 0)
      const idB = Number(b?.id ?? 0)
      if (Number.isNaN(idA) && Number.isNaN(idB)) return 0
      if (Number.isNaN(idA)) return 1
      if (Number.isNaN(idB)) return -1
      return idA - idB
    })
    console.log('Planetas cargados:', planetas.value.length)
    // Debug: mostrar qué planetas tienen imágenes
    planetas.value.forEach((p) => {
      console.log(`Planeta: ${p.nombre}, Imagen: ${p.imagen || 'NO TIENE'}`)
    })
  } catch (error) {
    console.warn('Fallo fuente configurada, usando fallback /api/planetas', error)
    try {
      const fallbackData = await $fetch('/api/planetas')
      const listaPlanetas = (Array.isArray(fallbackData) ? fallbackData : []) as PlanetaItem[]
      planetas.value = [...listaPlanetas].sort((a, b) => {
        const idA = Number(a?.id ?? 0)
        const idB = Number(b?.id ?? 0)
        if (Number.isNaN(idA) && Number.isNaN(idB)) return 0
        if (Number.isNaN(idA)) return 1
        if (Number.isNaN(idB)) return -1
        return idA - idB
      })
      planetas.value.forEach((p) => {
        console.log(`Planeta: ${p.nombre}, Imagen: ${p.imagen || 'NO TIENE'}`)
      })
    } catch (fallbackErr) {
      console.error('Error al cargar planetas (fallback):', fallbackErr)
    }
  }
  loading.value = false
}

const editarPlaneta = (planeta: PlanetaItem) => {
  if (!planeta?.id) return
  navigateTo(`/editar-planeta/${planeta.id}`)
}

const eliminarPlaneta = async (planeta: PlanetaItem) => {
  if (!planeta?.id) return

  const nombrePlaneta = planeta.nombre ?? `ID ${planeta.id}`
  const confirmado = confirm(`¿Seguro que quieres eliminar el planeta "${nombrePlaneta}"?`)
  if (!confirmado) return

  try {
    await $fetch(`/api/planetas/${planeta.id}`, {
      method: 'DELETE',
    })

    planetas.value = planetas.value.filter((p) => p.id !== planeta.id)
    alert(`✅ Planeta "${nombrePlaneta}" eliminado correctamente`)
  } catch (error) {
    console.error('Error al eliminar planeta:', error)
    alert('❌ No se pudo eliminar el planeta. Verifica que Laravel esté disponible.')
  }
}

onMounted(async () => {
  await cargarPlanetas()

  if (route.query.refresh) {
    navigateTo('/planetas', { replace: true })
  }
})

watch(() => route.query.refresh, async (refresh) => {
  if (refresh) {
    await cargarPlanetas()
    navigateTo('/planetas', { replace: true })
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bangers&family=Orbitron:wght@400;700;900&display=swap');

.page-galaxy {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #091020 0%, #111827 45%, #05070f 100%);
  overflow: hidden;
}

.page-galaxy::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url('/dbz/transformaciones-bg.jpg') center top / cover no-repeat fixed;
  opacity: 0.55;
  z-index: 0;
}

.page-galaxy__overlay,
.page-galaxy__stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.page-galaxy__overlay {
  background: rgba(0, 0, 0, 0.4);
}

.page-galaxy__stars {
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
  opacity: 0.8;
}

.page-galaxy__lightning,
.page-galaxy__energy {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.page-galaxy__lightning {
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

.page-galaxy__energy {
  pointer-events: none;
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

.page-galaxy__content {
  position: relative;
  z-index: 2;
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

.planet-title {
  font-family: 'Bangers', 'Orbitron', cursive;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #facc15;
  text-shadow:
    2px 2px 0px rgba(0, 0, 0, 0.45),
    4px 4px 0px rgba(234, 179, 8, 0.4),
    0 0 18px rgba(251, 191, 36, 0.55);
  transition: transform 0.3s ease, text-shadow 0.3s ease;
}

.planet-title:hover {
  transform: scale(1.02) rotate(-1.2deg);
  text-shadow:
    3px 3px 0px rgba(0, 0, 0, 0.5),
    5px 5px 0px rgba(250, 204, 21, 0.5),
    0 0 22px rgba(253, 224, 71, 0.7);
}

.planet-card {
  position: relative;
  border-radius: 1.75rem;
  padding: 1px;
  background: radial-gradient(circle at top, rgba(62, 180, 255, 0.65), rgba(147, 51, 234, 0.35), rgba(15, 23, 42, 0.8));
  overflow: hidden;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.35);
  transform: translateZ(0);
  height: 100%;
  display: flex;
}

.planet-card__glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(14, 165, 233, 0.25), rgba(192, 132, 252, 0.2), rgba(236, 72, 153, 0.2));
  opacity: 0;
  transition: opacity 0.45s ease;
  filter: blur(20px);
  pointer-events: none;
}

.planet-card__inner {
  position: relative;
  z-index: 1;
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9) 55%, rgba(17, 24, 39, 0.9));
  border-radius: 1.7rem;
  padding: 2.25rem 2rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  overflow: hidden;
  backdrop-filter: blur(6px);
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.planet-card::before,
.planet-card::after {
  content: "";
  position: absolute;
  inset: -30%;
  background: conic-gradient(from 90deg at 50% 50%, transparent 0%, rgba(14, 165, 233, 0.26) 25%, transparent 50%, rgba(236, 72, 153, 0.2) 75%, transparent 100%);
  opacity: 0;
  transform: rotate(0deg);
  transition: opacity 0.6s ease, transform 1.8s linear;
}

.planet-card::after {
  inset: -20%;
  background: radial-gradient(circle at 10% 10%, rgba(236, 72, 153, 0.18), transparent 60%),
              radial-gradient(circle at 90% 20%, rgba(14, 165, 233, 0.2), transparent 55%),
              radial-gradient(circle at 50% 90%, rgba(244, 114, 182, 0.18), transparent 60%);
  filter: blur(30px);
}

.planet-card:hover::before,
.planet-card:hover::after {
  opacity: 1;
  transform: rotate(18deg);
}

.planet-card:hover .planet-card__inner {
  transform: translateY(-12px) scale(1.015);
  box-shadow: 0 24px 55px rgba(14, 165, 233, 0.28);
}

.planet-card:hover .planet-card__glow {
  opacity: 1;
}

.planet-card__header {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
}

.planet-orbit {
  position: relative;
  width: 9rem;
  height: 9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 900px;
  aspect-ratio: 1 / 1;
}

.planet-orbit__ring {
  position: absolute;
  border: 2px solid rgba(148, 163, 184, 0.35);
  border-radius: 50%;
  opacity: 0.85;
  transition: transform 0.45s ease, border-color 0.45s ease;
}

.planet-orbit__ring--outer {
  width: 100%;
  height: 100%;
  animation: orbit-spin 18s linear infinite;
  transform: rotateX(58deg);
}

.planet-orbit__ring--inner {
  width: 70%;
  height: 70%;
  animation: orbit-spin 14s linear infinite reverse;
  transform: rotateX(66deg);
}

.planet-orbit__planet,
.planet-orbit__fallback {
  position: relative;
  width: 6.75rem;
  height: 6.75rem;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  border: 4px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 15px 35px rgba(14, 116, 144, 0.35);
  transition: transform 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease;
  background: linear-gradient(135deg, rgba(226, 232, 240, 0.12), rgba(148, 163, 184, 0.14));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.25rem;
}

.planet-card:hover .planet-orbit__planet,
.planet-card:hover .planet-orbit__fallback {
  transform: scale(1.05) translateZ(12px);
  border-color: rgba(252, 211, 77, 0.55);
  box-shadow: 0 18px 50px rgba(245, 158, 11, 0.45);
}

.planet-card:hover .planet-orbit__ring {
  border-color: rgba(252, 211, 77, 0.35);
}

.planet-card__title {
  text-align: center;
}

.planet-name {
  font-size: 1.85rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #f8fafc;
  text-shadow: 0 6px 18px rgba(15, 23, 42, 0.6);
}

.planet-galaxy {
  margin-top: 0.35rem;
  font-size: 0.95rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.8);
}

.planet-stats {
  display: grid;
  gap: 0.85rem;
  margin-bottom: 2rem;
}

.planet-stats__item {
  position: relative;
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  background: linear-gradient(120deg, rgba(30, 64, 175, 0.55), rgba(59, 130, 246, 0.35));
  border: 1px solid rgba(96, 165, 250, 0.35);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.planet-stats__item::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent, rgba(191, 219, 254, 0.35), transparent);
  opacity: 0;
  transform: translateX(-40%);
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.planet-card:hover .planet-stats__item::after {
  opacity: 1;
  transform: translateX(40%);
}

.planet-stats__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.planet-stats__value {
  margin-top: 0.4rem;
  font-size: 1.55rem;
  font-weight: 700;
  color: #e0f2fe;
  text-shadow: 0 3px 12px rgba(14, 165, 233, 0.45);
}

.planet-card__actions {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 1.25rem;
}

.planet-card__action {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.9rem;
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid transparent;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
}

.planet-card__action--edit {
  background: linear-gradient(120deg, rgba(59, 130, 246, 0.25), rgba(14, 165, 233, 0.25));
  color: #bfdbfe;
  border-color: rgba(37, 99, 235, 0.4);
}

.planet-card__action--delete {
  background: linear-gradient(120deg, rgba(248, 113, 113, 0.25), rgba(239, 68, 68, 0.2));
  color: #fecaca;
  border-color: rgba(220, 38, 38, 0.35);
}

.planet-card__action:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(15, 23, 42, 0.3);
}

.planet-card__action:active {
  transform: translateY(0);
}

/* (styles for inhabitants removed) */

@keyframes orbit-spin {
  from {
    transform: rotateX(60deg) rotateZ(0deg);
  }
  to {
    transform: rotateX(60deg) rotateZ(360deg);
  }
}

@media (max-width: 1024px) {
  .planet-card__inner {
    padding: 1.75rem 1.5rem;
  }

  .planet-orbit {
    width: 7.5rem;
    height: 7.5rem;
  }

  .planet-orbit__planet,
  .planet-orbit__fallback {
    width: 5.5rem;
    height: 5.5rem;
  }

  .planet-name {
    font-size: 1.6rem;
  }
}

@media (max-width: 640px) {
  .page-galaxy {
    padding: 1rem;
  }
  
  .planet-card__inner {
    padding: 1.25rem 1rem;
  }

  .planet-orbit {
    width: 6rem;
    height: 6rem;
  }

  .planet-orbit__planet,
  .planet-orbit__fallback {
    width: 4.5rem;
    height: 4.5rem;
    font-size: 2.5rem;
  }

  .planet-name {
    font-size: 1.35rem;
  }
  
  .planet-stats__value {
    font-size: 1.25rem;
  }
  
  .planet-card__action {
    font-size: 0.85rem;
    padding: 0.6rem 0.8rem;
  }
}
</style>
