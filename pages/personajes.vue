<template>
  <div class="page-characters relative min-h-screen overflow-hidden p-8">
    <div class="absolute inset-0 page-characters__overlay pointer-events-none"></div>
    <div class="absolute inset-0 page-characters__stars pointer-events-none"></div>
    <div class="absolute inset-0 page-characters__lightning pointer-events-none">
      <div class="lightning lightning-1"></div>
      <div class="lightning lightning-2"></div>
      <div class="lightning lightning-3"></div>
      <div class="lightning lightning-4"></div>
    </div>
    <div class="absolute inset-0 page-characters__energy pointer-events-none">
      <div class="energy-sphere sphere-1"></div>
      <div class="energy-sphere sphere-2"></div>
      <div class="energy-sphere sphere-3"></div>
      <div class="energy-sphere sphere-4"></div>
      <div class="energy-sphere sphere-5"></div>
      <div class="energy-sphere sphere-6"></div>
      <div class="energy-sphere sphere-7"></div>
    </div>

    <div class="page-characters__content relative z-10">
      <div class="flex justify-between items-center mb-6">
        <div class="flex flex-col items-center md:flex-row md:items-center gap-4 text-center md:text-left">
          <NuxtLink to="/" class="flex items-center hover:opacity-80 transition-opacity duration-200">
            <img 
              src="https://elmundodragonball.com/wp-content/uploads/2023/06/cropped-cropped-logo-goku.png" 
              alt="Dragon Ball Personajes" 
              class="h-16 md:h-20 object-contain cursor-pointer"
              @error="handleLogoError"
            />
          </NuxtLink>
          <h1 class="text-3xl font-bold dragon-ball-title">Personajes de Dragon Ball</h1>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink 
            to="/nuevo-personaje" 
            class="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
          >
            ➕ Nuevo Personaje
          </NuxtLink>
        </div>
      </div>

    <!-- Barra de búsqueda -->
    <div class="mb-6">
      <div class="relative">
        <input 
          v-model="busqueda"
          type="text" 
          placeholder="Buscar personajes por nombre, raza o planeta..."
          class="w-full p-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <img 
            src="https://dragonballzshop.com/wp-content/uploads/2023/07/5622756_0-1.png" 
            alt="Buscar" 
            class="w-6 h-6 object-contain opacity-70"
            @error="(e) => { e.target.style.display = 'none'; }"
          />
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="mb-6 flex flex-wrap gap-4">
      <select v-model="filtroRaza" class="border border-gray-300 rounded-lg px-3 py-2">
        <option value="">Todas las razas</option>
        <option value="Saiyajin">Saiyajin</option>
        <option value="Namekiano">Namekiano</option>
        <option value="Humano">Humano</option>
        <option value="Androide">Androide</option>
        <option value="Robot">Robot</option>
      </select>
      
      <select v-model="filtroPlaneta" class="border border-gray-300 rounded-lg px-3 py-2">
        <option value="">Todos los planetas</option>
        <option
          v-for="planetaNombre in planetasDisponibles"
          :key="planetaNombre"
          :value="planetaNombre"
        >
          {{ planetaNombre }}
        </option>
      </select>
      
      <select v-model="ordenPoder" class="border border-gray-300 rounded-lg px-3 py-2">
        <option value="">Ordenar por poder</option>
        <option value="asc">Menor a mayor</option>
        <option value="desc">Mayor a menor</option>
      </select>
    </div>

    <div v-if="loading" class="text-center text-gray-600 italic">Cargando personajes...</div>

    <div v-else-if="personajesFiltrados.length === 0" class="text-center text-gray-500 py-8">
      <p class="text-xl">No se encontraron personajes</p>
      <p class="text-sm">Intenta ajustar los filtros de búsqueda</p>
    </div>

    <!-- Grid de cartas tipo cromo con flip 3D -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div 
        v-for="personaje in personajesFiltrados" 
        :key="personaje.id" 
        :class="[
          'relative group rounded-2xl overflow-hidden shadow-xl bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl h-96',
          rarityBorderClass(personaje)
        ]"
      >
        <!-- Contenedor de flip 3D -->
        <div class="flip-card">
          <!-- Frente de la tarjeta -->
                     <div class="flip-card-front">
            
            <div v-if="rarity(personaje) === 'Legendario'" 
                 class="absolute inset-0 rounded-2xl pointer-events-none z-10 opacity-20"
                 :style="goldenFrameStyle"></div> 
            
            <!-- Borde holográfico / brillo -->
            <div class="pointer-events-none absolute inset-0 rounded-2xl opacity-20 group-hover:opacity-100 transition-opacity duration-300"
                 :style="holoStyle"></div>
            
            <!-- Efecto foil animado -->
            <div class="pointer-events-none absolute inset-0 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                 :style="foilStyle"></div>
            
            <!-- Sparkles para Legendario -->
            <div v-if="rarity(personaje) === 'Legendario'" 
                 class="absolute inset-0 pointer-events-none z-20">
              <div class="sparkle sparkle-1"></div>
              <div class="sparkle sparkle-2"></div>
              <div class="sparkle sparkle-3"></div>
              <div class="sparkle sparkle-4"></div>
            </div>

            <!-- Imagen del personaje -->
            <div class="relative h-56 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              <img 
                class="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                :src="getImageUrl(personaje)"
                :alt="personaje.nombre"
                :data-personaje-id="personaje.id"
                @error="onImageError"
              />
              <!-- Insignias -->
              <div class="absolute top-3 left-3 flex flex-col gap-2">
                <span class="px-2 py-1 text-xs font-bold rounded-full bg-black/60 text-white uppercase tracking-wider">
                  {{ personaje.raza || 'Desconocido' }}
                </span>
                <span v-if="personaje.transformaciones && personaje.transformaciones.length > 0" 
                      class="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black flex items-center gap-1">
                  ⚡ {{ personaje.transformaciones.length }}
                </span>
              </div>
              <div class="absolute top-3 right-3">
                <span :class="['px-2','py-1','text-xs','font-bold','rounded-full', rarityClass(personaje)]">
                  {{ rarity(personaje) }}
                </span>
              </div>
              <!-- Poder -->
              <div class="absolute bottom-3 right-3">
                <span class="px-3 py-1 text-sm font-bold rounded-full bg-blue-600 text-white">
                  {{ (personaje.nivel_poder || 0).toLocaleString() }}
                </span>
              </div>
            </div>

            <!-- Información básica -->
            <div class="p-4">
              <h3 class="text-xl font-extrabold text-gray-900 text-center mb-2">{{ personaje.nombre }}</h3>
              <div class="text-center">
                <span class="text-sm text-gray-600">{{ personaje.planeta?.nombre || 'Planeta desconocido' }}</span>
              </div>
            </div>
          </div>

          <!-- Reverso de la tarjeta (Bolas de Dragón + Descripción completa) -->
          <div class="flip-card-back">
            <div class="h-full w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
              <!-- Fondo de bolas de dragón -->
              <div class="absolute inset-0 opacity-30">
                <img 
                  src="https://th.bing.com/th/id/OIP.gQuv0ZUdTsQJpXvAwEk2YgHaG8?w=215&h=202&c=7&r=0&o=7&pid=1.7&rm=3" 
                  alt="Dragon Balls" 
                  class="w-full h-full object-cover dragon-balls-bg"
                />
              </div>
              
              <!-- Efecto de destello -->
              <div class="absolute inset-0 shine-effect"></div>
              <div class="absolute inset-0 shine-effect-2"></div>
              
              <!-- Contenido del reverso con scroll -->
              <div class="relative z-10 h-full flex flex-col text-white overflow-hidden">
                <!-- Header fijo -->
                <div class="text-center p-3 pb-2 flex-shrink-0">
                  <h3 class="text-lg font-bold text-yellow-400 mb-1">{{ personaje.nombre }}</h3>
                  <div class="flex justify-center gap-2 text-xs">
                    <span class="px-2 py-1 bg-blue-600 rounded">{{ personaje.raza }}</span>
                    <span class="px-2 py-1 bg-green-600 rounded">{{ personaje.planeta?.nombre }}</span>
                  </div>
                </div>

                <!-- Información detallada con scroll -->
                <div class="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-xs scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-gray-800">
                  <div class="bg-white/10 rounded-lg p-2 flex-shrink-0">
                    <div class="text-yellow-400 font-semibold mb-1">Poder de Combate</div>
                    <div class="text-lg font-bold text-blue-400">{{ (personaje.nivel_poder || 0).toLocaleString() }}</div>
                  </div>
                  
                  <div v-if="personaje.edad" class="bg-white/10 rounded-lg p-2 flex-shrink-0">
                    <div class="text-yellow-400 font-semibold mb-1">Edad</div>
                    <div class="text-white">{{ personaje.edad }} años</div>
                  </div>
                  
                  <div v-if="personaje.tecnica_especial" class="bg-white/10 rounded-lg p-2 flex-shrink-0">
                    <div class="text-yellow-400 font-semibold mb-1">⚡ Técnica Especial</div>
                    <div class="text-white font-semibold">{{ personaje.tecnica_especial }}</div>
                  </div>
                  
                  <div v-if="personaje.descripcion" class="bg-white/10 rounded-lg p-2 flex-shrink-0">
                    <div class="text-yellow-400 font-semibold mb-1">Descripción</div>
                    <div class="text-white text-xs leading-relaxed whitespace-normal break-words">{{ personaje.descripcion }}</div>
                  </div>
                  
                  <!-- Transformaciones del personaje -->
                  <div v-if="personaje.transformaciones && personaje.transformaciones.length > 0" class="bg-white/10 rounded-lg p-2 flex-shrink-0">
                    <div class="text-yellow-400 font-semibold mb-2">⚡ Transformaciones ({{ personaje.transformaciones.length }})</div>
                    <div class="space-y-1 max-h-40 overflow-y-auto">
                      <div 
                        v-for="trans in personaje.transformaciones.slice(0, 5)" 
                        :key="trans.id"
                        class="flex items-center gap-2 text-xs bg-black/20 rounded px-2 py-1"
                      >
                        <span class="text-yellow-300 font-bold">{{ trans.name }}</span>
                        <span class="text-blue-300 text-[10px]">KI: {{ trans.ki }}</span>
                      </div>
                      <div v-if="personaje.transformaciones.length > 5" class="text-yellow-300 text-[10px] italic">
                        +{{ personaje.transformaciones.length - 5 }} más...
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Botones de acción fijos -->
                <div class="flex justify-center gap-2 p-3 pt-2 flex-shrink-0 border-t border-white/10">
                  <button 
                    @click.stop="editarPersonaje(personaje)"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    @click.stop="eliminarPersonaje(personaje)"
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { onActivated, watch } from 'vue'

const route = useRoute()
const personajes = ref([])
const transformaciones = ref([])
const loading = ref(true)
const busqueda = ref('')
const filtroRaza = ref('')
const filtroPlaneta = ref('')
const ordenPoder = ref('')
const imageError = ref({})

// Estilos para efectos de cromo
const holoStyle = `background: conic-gradient(from 0deg, rgba(255,0,153,0.25), rgba(0,204,255,0.25), rgba(0,255,153,0.25), rgba(255,255,0,0.25), rgba(255,0,153,0.25)); filter: blur(12px);`;

const foilStyle = `background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%); animation: foil-shine 2s ease-in-out infinite;`;

const goldenFrameStyle = `background: linear-gradient(135deg, rgba(255,215,0,0.6) 0%, rgba(255,165,0,0.6) 50%, rgba(255,215,0,0.6) 100%); background-size: 200% 200%; animation: golden-glow 3s ease infinite;`;


// Función para obtener URL de imagen del personaje
const getImageUrl = (p) => {
  if (!p) return '/dbz/default.svg'

  const personajeId = p.id ?? null
  if (personajeId && imageError.value[personajeId]) {
    return '/dbz/default.svg'
  }

  // Buscar imagen en ambos campos: 'image' e 'imagen'
  const imagen = p?.image || p?.imagen || null
  
  // Si el personaje tiene imagen válida (externa o proxificada), usarla directamente
  if (imagen && (imagen.startsWith('http') || imagen.startsWith('/'))) {
    return imagen
  }
  
  // Fallback: usar imagen por defecto
  return '/dbz/default.svg'
}

// Función para manejar errores de imagen
const onImageError = (event) => {
  const personajeId = Number(event.target.getAttribute('data-personaje-id'))
  const imageSrc = event.target.src
  
  console.error('❌ Error real al cargar imagen:', {
    personajeId,
    imageSrc,
    timestamp: new Date().toISOString()
  })
  
  // Solo marcar como error si realmente no se puede cargar la imagen
  if (!Number.isNaN(personajeId)) {
    imageError.value = {
      ...imageError.value,
      [personajeId]: true,
    }
    event.target.src = '/dbz/default.svg'
  }
}

// Función para manejar error del logo
const handleLogoError = (event) => {
  console.warn('Error al cargar logo, usando texto alternativo')
  event.target.style.display = 'none'
}


// Emoji por personaje (fallback)
const getEmoji = (p) => {
  const name = (p?.nombre || '').toLowerCase().replace(/\s+/g, '')
  const map = {
    // Personajes principales
    goku: '🐉',
    vegeta: '👑',
    piccolo: '🟢',
    gohan: '👦',
    trunks: '⚔️',
    bulma: '👩',
    krillin: '👨',
    
    // Villanos principales
    freezer: '❄️',
    frieza: '❄️',
    cell: '🧬',
    celula: '🧬', // Añadido: Cell en español
    buu: '🍬',
    majinbuu: '🍬',
    ginyu: '🦎', // Añadido: Capitán Ginyu (cambia de cuerpo)
    captainginyu: '🦎', // Variación: Capitán Ginyu
    capginyu: '🦎', // Variación: Cap Ginyu
    
    // Más personajes
    tien: '👁️',
    tienshinhan: '👁️', // Variación completa
    yamcha: '🐺',
    chaozu: '👻',
    masterroshi: '👴',
    roshi: '👴',
    korin: '🐱',
    yajirobe: '🗡️',
    raditz: '👹',
    nappa: '💪',
    bardock: '🛡️',
    gine: '👩‍🚀',
    turles: '🌳',
    broly: '💥',
    paragus: '👨‍💼',
    kingvegeta: '👑',
    tarble: '🤴',
    toribot: '🤖',
    drum: '🥁',
    
    // Namekianos
    nail: '💅',
    guru: '🧙‍♂️',
    dende: '👼',
    moori: '👴',
    
    // Androides
    android17: '🤖',
    android18: '🤖',
    android16: '🤖',
    android19: '🤖',
    android20: '🤖',
    drgero: '👨‍🔬',
    
    // Otros
    videl: '👧',
    goten: '👶',
    pan: '👶',
    uub: '👦',
    mrpopo: '👤',
    kingkai: '👑',
    kingyemma: '👑',
    
    // Más villanos
    dabura: '👹',
    babidi: '🧙‍♂️',
    zarbon: '🦎',
    dodoria: '👹',
    guldo: '👹',
    jeice: '👹',
    burter: '👹',
    recoome: '👹',
    
    // Dragon Ball GT
    baby: '👶',
    super17: '🤖',
    omega: '🐉',
    syn: '🐉',
    
    // Dragon Ball Super
    beerus: '🐱',
    whis: '👼',
    champa: '🐱',
    vados: '👼',
    hit: '⏰',
    jiren: '💪',
    toppo: '⚖️',
    dyspo: '⚡',
    kale: '💚',
    caulifla: '💚',
    kefla: '💚',
    ribrianne: '💖',
    frost: '❄️',
    cabba: '👦',
    magetta: '🤖',
    botamo: '🐻',
    bergamo: '🐺',
    basil: '🐺',
    lavender: '🐺',
    zamasu: '⚡',
    gowasu: '👴',
    zuno: '📚',
    grandpriest: '👼',
    zeno: '👑'
  }
  return map[name] || '👤'
}

// Rareza por nivel de poder
const rarity = (p) => {
  const power = p?.nivel_poder || 0
  if (power >= 900000) return 'Legendario'
  if (power >= 500000) return 'Épico'
  if (power >= 100000) return 'Raro'
  return 'Común'
}

const rarityClass = (p) => {
  const r = rarity(p)
  if (r === 'Legendario') return 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white shadow-lg'
  if (r === 'Épico') return 'bg-purple-600 text-white'
  if (r === 'Raro') return 'bg-blue-600 text-white'
  return 'bg-gray-700 text-white'
}

const rarityBorderClass = (p) => {
  const r = rarity(p)
  if (r === 'Legendario') return 'border-4 border-yellow-400 shadow-yellow-400/50'
  if (r === 'Épico') return 'border-2 border-purple-500 shadow-purple-500/30'
  if (r === 'Raro') return 'border-2 border-blue-500 shadow-blue-500/30'
  return 'border-[3px] border-slate-200/90 shadow-[0_0_20px_rgba(226,232,240,0.7)] bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200'
}

// Computed para filtrar y ordenar personajes
const personajesFiltrados = computed(() => {
  let resultado = [...personajes.value]
  
  // Filtro por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(personaje => 
      personaje.nombre.toLowerCase().includes(termino) ||
      personaje.raza.toLowerCase().includes(termino) ||
      personaje.planeta?.nombre.toLowerCase().includes(termino) ||
      personaje.tecnica_especial?.toLowerCase().includes(termino)
    )
  }
  
  // Filtro por raza
  if (filtroRaza.value) {
    resultado = resultado.filter(personaje => personaje.raza === filtroRaza.value)
  }
  
  // Filtro por planeta
  if (filtroPlaneta.value) {
    resultado = resultado.filter(personaje => personaje.planeta?.nombre === filtroPlaneta.value)
  }
  
  // Ordenar por poder
  if (ordenPoder.value) {
    resultado.sort((a, b) => {
      const poderA = a.nivel_poder || 0
      const poderB = b.nivel_poder || 0
      return ordenPoder.value === 'asc' ? poderA - poderB : poderB - poderA
    })
  }
  
  return resultado
})

const planetasDisponibles = computed(() => {
  const nombresPlanetas = new Set()
  for (const personaje of personajes.value) {
    const planetaNombre = personaje?.planeta?.nombre
    if (typeof planetaNombre === 'string' && planetaNombre.trim() !== '') {
      nombresPlanetas.add(planetaNombre.trim())
    }
  }
  return Array.from(nombresPlanetas).sort((a, b) => a.localeCompare(b))
})

// Función para asociar transformaciones con personajes
const asociarTransformaciones = (personajesLista, transformacionesLista) => {
  return personajesLista.map(personaje => {
    const nombrePersonaje = (personaje.nombre || '').toLowerCase()
    const transformacionesPersonaje = transformacionesLista.filter(trans => {
      const nombreTrans = (trans.name || '').toLowerCase()
      // Buscar transformaciones que contengan el nombre del personaje
      return nombreTrans.includes(nombrePersonaje) || 
             nombreTrans.includes(nombrePersonaje.split(' ')[0]) ||
             // Casos especiales
             (nombrePersonaje.includes('goku') && nombreTrans.includes('goku')) ||
             (nombrePersonaje.includes('vegeta') && nombreTrans.includes('vegeta')) ||
             (nombrePersonaje.includes('piccolo') && nombreTrans.includes('piccolo')) ||
             (nombrePersonaje.includes('gohan') && nombreTrans.includes('gohan')) ||
             (nombrePersonaje.includes('trunks') && nombreTrans.includes('trunks')) ||
             (nombrePersonaje.includes('freezer') && nombreTrans.includes('freezer')) ||
             (nombrePersonaje.includes('frieza') && nombreTrans.includes('freezer')) ||
             (nombrePersonaje.includes('cell') && nombreTrans.includes('cell')) ||
             (nombrePersonaje.includes('celula') && nombreTrans.includes('cell')) ||
             (nombrePersonaje.includes('buu') && nombreTrans.includes('buu')) ||
             (nombrePersonaje.includes('broly') && nombreTrans.includes('broly')) ||
             (nombrePersonaje.includes('gogeta') && nombreTrans.includes('gogeta')) ||
             (nombrePersonaje.includes('vegetto') && nombreTrans.includes('vegetto')) ||
             (nombrePersonaje.includes('gotenks') && nombreTrans.includes('gotenks')) ||
             (nombrePersonaje.includes('janemba') && nombreTrans.includes('janemba'))
    })
    return {
      ...personaje,
      transformaciones: transformacionesPersonaje
    }
  })
}

// Función para cargar personajes y transformaciones
const cargarPersonajes = async () => {
  loading.value = true
  try {
    // Cargar personajes y transformaciones en paralelo
    // Agregar timestamp en headers para evitar caché
    const [personajesData, transformacionesData] = await Promise.all([
      $fetch('/api/personajes', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'X-Request-Time': Date.now().toString()
        }
      }),
      $fetch('/api/transformaciones', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
    ])
    
    transformaciones.value = Array.isArray(transformacionesData) ? transformacionesData : []
    
    // Asociar transformaciones con personajes
    personajes.value = asociarTransformaciones(
      Array.isArray(personajesData) ? personajesData : [],
      transformaciones.value
    )
    
    console.log('✅ Personajes cargados:', personajes.value.length)
    console.log('✅ Transformaciones cargadas:', transformaciones.value.length)
    
    // Debug: mostrar los últimos 3 personajes para verificar que se cargan los nuevos
    if (personajes.value.length > 0) {
      const ultimosPersonajes = personajes.value.slice(-3).map(p => ({ id: p.id, nombre: p.nombre }))
      console.log('📋 Últimos 3 personajes:', ultimosPersonajes)
    }
  } catch (error) {
    console.error('❌ Error al cargar personajes:', error)
  } finally {
    loading.value = false
  }
}

// Variable para rastrear si es la primera carga
const primeraCarga = ref(true)

// Cargar personajes al montar el componente
onMounted(() => {
  console.log('onMounted: Cargando personajes iniciales...', route.query)
  
  // Si hay parámetro refresh, es porque venimos de crear/editar un personaje
  if (route.query.refresh) {
    console.log('Parámetro refresh detectado en onMounted, recargando...')
    cargarPersonajes().then(() => {
      primeraCarga.value = false
      // Limpiar el parámetro de la URL
      setTimeout(() => {
        navigateTo('/personajes', { replace: true, keepScroll: true })
      }, 100)
    })
  } else {
    cargarPersonajes().then(() => {
      primeraCarga.value = false
    })
  }
})

// Recargar personajes cuando se vuelve a la página (útil después de crear/editar/eliminar)
onActivated(() => {
  if (!primeraCarga.value) {
    console.log('Componente activado, recargando personajes...')
    cargarPersonajes()
  }
})

// Recargar cuando cambia la query string (útil para detectar navegación desde crear/editar)
watch(() => route.query.refresh, (newRefresh) => {
  if (newRefresh && !primeraCarga.value) {
    console.log('Parámetro refresh detectado, recargando personajes...')
    cargarPersonajes()
    // Limpiar el parámetro de la URL sin recargar la página
    navigateTo('/personajes', { replace: true, keepScroll: true })
  }
})

// También recargar cuando la ruta cambia a /personajes (útil después de navegar desde otra página)
watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/personajes' && oldPath && oldPath !== '/personajes' && !primeraCarga.value) {
    console.log('Navegación a /personajes detectada, recargando personajes...')
    cargarPersonajes()
  }
}, { immediate: false })

// Función para editar personaje
const editarPersonaje = (personaje) => {
  navigateTo(`/editar-personaje/${personaje.id}`)
}

// Función para eliminar personaje
const eliminarPersonaje = async (personaje) => {
  if (confirm(`¿Estás seguro de que quieres eliminar a ${personaje.nombre}?`)) {
    try {
      await $fetch(`/api/personajes/${personaje.id}`, {
        method: 'DELETE'
      })
      
      personajes.value = personajes.value.filter(p => p.id !== personaje.id)
      alert(`✅ ${personaje.nombre} ha sido eliminado correctamente`)
    } catch (error) {
      console.error('Error al eliminar personaje:', error)
      alert('❌ Error al eliminar el personaje')
    }
  }
}
</script>

<style scoped>
/* Importar fuentes de Google Fonts estilo Dragon Ball */
@import url('https://fonts.googleapis.com/css2?family=Bangers&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');

.page-characters {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(155deg, #061229 0%, #0c172f 45%, #040912 100%);
  overflow: hidden;
}

.page-characters::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.08), transparent 40%),
              radial-gradient(circle at 80% 30%, rgba(59, 130, 246, 0.08), transparent 45%),
              radial-gradient(circle at 40% 80%, rgba(245, 158, 11, 0.12), transparent 50%);
  opacity: 0.6;
  z-index: 0;
}

.page-characters__overlay,
.page-characters__stars,
.page-characters__lightning,
.page-characters__energy {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.page-characters__overlay {
  background: rgba(4, 6, 12, 0.55);
}

.page-characters__stars {
  background-image:
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 60px 70px, rgba(255, 255, 255, 0.85), transparent),
    radial-gradient(1px 1px at 50px 50px, rgba(255, 255, 255, 0.7), transparent),
    radial-gradient(1px 1px at 80px 30px, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(2px 2px at 90px 70px, rgba(255, 255, 255, 0.78), transparent),
    radial-gradient(1px 1px at 130px 40px, rgba(255, 255, 255, 0.85), transparent),
    radial-gradient(2px 2px at 160px 60px, #fff, transparent);
  background-repeat: repeat;
  background-size: 220px 120px;
  animation: twinkle 8s ease-in-out infinite;
  opacity: 0.8;
}

.page-characters__lightning {
  overflow: hidden;
}

.lightning {
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom,
    transparent 0%,
    rgba(255, 255, 255, 0.85) 12%,
    rgba(173, 216, 255, 0.9) 50%,
    rgba(255, 255, 255, 0.85) 88%,
    transparent 100%);
  opacity: 0;
  box-shadow:
    0 0 10px rgba(255, 255, 255, 0.8),
    0 0 20px rgba(173, 216, 255, 0.65),
    0 0 32px rgba(59, 130, 246, 0.5);
  animation: lightning 4s infinite;
}

.lightning-1 { left: 10%; animation-delay: 0s; }
.lightning-2 { left: 28%; animation-delay: 1.2s; }
.lightning-3 { left: 55%; animation-delay: 2.1s; }
.lightning-4 { left: 78%; animation-delay: 0.7s; }

.page-characters__energy {
  overflow: visible;
}

.energy-sphere {
  position: absolute;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.9), rgba(255, 215, 0, 0.82), rgba(255, 140, 0, 0.55));
  box-shadow:
    0 0 20px rgba(255, 215, 0, 0.8),
    0 0 38px rgba(251, 191, 36, 0.55),
    inset -10px -10px 18px rgba(0, 0, 0, 0.35);
  opacity: 0.7;
  animation: float-sphere 6s ease-in-out infinite;
}

.sphere-1 { left: 6%; top: 18%; animation-delay: 0s; }
.sphere-2 { left: 24%; top: 54%; animation-delay: 1s; animation-duration: 7s; }
.sphere-3 { left: 46%; top: 14%; animation-delay: 2s; animation-duration: 8s; }
.sphere-4 { left: 66%; top: 46%; animation-delay: 1.5s; animation-duration: 6.5s; }
.sphere-5 { left: 84%; top: 26%; animation-delay: 0.6s; animation-duration: 7.4s; }
.sphere-6 { left: 18%; top: 82%; animation-delay: 2.4s; animation-duration: 8.6s; }
.sphere-7 { left: 42%; top: 72%; animation-delay: 1.1s; animation-duration: 9s; }

.page-characters__content {
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
  6%, 12% {
    opacity: 1;
    transform: translateY(0) translateX(0);
  }
  18% {
    opacity: 0;
    transform: translateY(100%) translateX(12px);
  }
}

@keyframes float-sphere {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-12px) scale(1.04);
  }
}

/* Fuentes estilo Dragon Ball */
.dragon-ball-title {
  font-family: 'Bangers', 'Orbitron', cursive;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #fdf4ff;
  text-align: center;
  text-shadow: 
    2px 2px 0px rgba(30, 41, 59, 0.55),
    4px 4px 0px rgba(251, 191, 36, 0.4),
    0 0 16px rgba(248, 250, 252, 0.35);
}

@media (min-width: 768px) {
  .dragon-ball-title {
    text-align: left;
  }
}

/* Efecto flip 3D */
.flip-card {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  cursor: pointer;
}

.group:hover .flip-card {
  transform: rotateY(180deg);
}

.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 1rem;
  overflow: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}

/* Scrollbar personalizado para el reverso de las tarjetas */
.flip-card-back .overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(250, 204, 21, 0.6) rgba(31, 41, 55, 0.8);
}

.flip-card-back .overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.flip-card-back .overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.8);
  border-radius: 10px;
}

.flip-card-back .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(250, 204, 21, 0.6);
  border-radius: 10px;
}

.flip-card-back .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(250, 204, 21, 0.8);
}

/* Estilos para efectos de cromo */
@keyframes foil-shine {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
}

@keyframes golden-glow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes sparkle {
  0%, 100% { 
    opacity: 0; 
    transform: scale(0) rotate(0deg); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1) rotate(180deg); 
  }
}

/* Sparkles individuales */
.sparkle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, #ffd700, #ffed4e);
  border-radius: 50%;
  animation: sparkle 2s ease-in-out infinite;
}

.sparkle-1 {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.sparkle-2 {
  top: 30%;
  right: 20%;
  animation-delay: 0.5s;
}

.sparkle-3 {
  bottom: 25%;
  left: 25%;
  animation-delay: 1s;
}

.sparkle-4 {
  bottom: 35%;
  right: 15%;
  animation-delay: 1.5s;
}

/* Animación para el marco dorado */
@keyframes golden-glow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Efecto de brillo adicional para Legendario */
.group:hover .sparkle {
  animation-duration: 1s;
}

/* Efecto de destello para el fondo de las esferas del dragón */
.dragon-balls-bg {
  filter: brightness(1.1);
  transition: filter 0.3s ease;
}

.flip-card-back:hover .dragon-balls-bg {
  filter: brightness(1.3);
}

.shine-effect {
  background: linear-gradient(
    120deg,
    transparent 0%,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 40%,
    rgba(255, 215, 0, 0.4) 50%,
    rgba(255, 255, 255, 0.1) 60%,
    transparent 70%,
    transparent 100%
  );
  animation: shine-sweep 3s ease-in-out infinite;
  pointer-events: none;
}

.shine-effect-2 {
  background: linear-gradient(
    60deg,
    transparent 0%,
    transparent 40%,
    rgba(255, 255, 255, 0.08) 45%,
    rgba(255, 215, 0, 0.3) 50%,
    rgba(255, 255, 255, 0.08) 55%,
    transparent 60%,
    transparent 100%
  );
  animation: shine-sweep-reverse 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes shine-sweep {
  0% {
    transform: translateX(-100%) translateY(-100%) skewX(-20deg);
  }
  50%, 100% {
    transform: translateX(200%) translateY(200%) skewX(-20deg);
  }
}

@keyframes shine-sweep-reverse {
  0% {
    transform: translateX(200%) translateY(-100%) skewX(20deg);
  }
  50%, 100% {
    transform: translateX(-100%) translateY(200%) skewX(20deg);
  }
}
</style>