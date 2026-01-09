<template>
  <div class="page-home min-h-screen overflow-hidden">
    <!-- Capas globales -->
    <div class="page-home__overlay pointer-events-none"></div>
    <div class="page-home__stars pointer-events-none"></div>
    <div class="page-home__lightning pointer-events-none">
      <div class="lightning lightning-1"></div>
      <div class="lightning lightning-2"></div>
      <div class="lightning lightning-3"></div>
      <div class="lightning lightning-4"></div>
    </div>
    <div class="page-home__energy pointer-events-none">
      <div class="energy-sphere sphere-1"></div>
      <div class="energy-sphere sphere-2"></div>
      <div class="energy-sphere sphere-3"></div>
      <div class="energy-sphere sphere-4"></div>
      <div class="energy-sphere sphere-5"></div>
      <div class="energy-sphere sphere-6"></div>
      <div class="energy-sphere sphere-7"></div>
    </div>

    <!-- Header con navegación -->
    <nav class="bg-white shadow-sm border-b border-gray-200 relative z-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center hover:opacity-80 transition-opacity">
              <img 
                src="https://web.dragonball-api.com/images-compress/logo_dragonballapi.webp" 
                alt="Dragon Ball Universe" 
                class="h-8 sm:h-10 md:h-12 object-contain"
                @error="handleLogoError"
              />
            </NuxtLink>
          </div>
          <!-- Menú móvil hamburguesa -->
          <button 
            @click="menuOpen = !menuOpen"
            class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Menú"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <!-- Menú desktop -->
          <div class="hidden md:flex items-center space-x-2 lg:space-x-4 relative z-50">
            <NuxtLink 
              to="/personajes" 
              class="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200 relative z-50 dragon-ball-nav"
            >
              👥 <span class="hidden lg:inline">Personajes</span><span class="lg:hidden">Personajes</span>
            </NuxtLink>
            <NuxtLink 
              to="/planetas" 
              class="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200 relative z-50 dragon-ball-nav"
            >
              🪐 <span class="hidden lg:inline">Planetas</span><span class="lg:hidden">Planetas</span>
            </NuxtLink>
            <NuxtLink 
              to="/transformaciones" 
              class="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200 relative z-50 dragon-ball-nav hidden lg:block"
            >
              ⚡ Transformaciones
            </NuxtLink>
            <NuxtLink 
              to="/nuevo-personaje" 
              class="bg-green-500 hover:bg-green-600 text-white px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors duration-200 relative z-50 dragon-ball-button"
            >
              ➕ <span class="hidden sm:inline">Nuevo</span>
            </NuxtLink>
          </div>
        </div>
        <!-- Menú móvil desplegable -->
        <div 
          v-show="menuOpen"
          class="md:hidden border-t border-gray-200 py-4 space-y-2"
        >
          <NuxtLink 
            to="/personajes" 
            @click="menuOpen = false"
            class="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200 dragon-ball-nav"
          >
            👥 Personajes
          </NuxtLink>
          <NuxtLink 
            to="/planetas" 
            @click="menuOpen = false"
            class="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200 dragon-ball-nav"
          >
            🪐 Planetas
          </NuxtLink>
          <NuxtLink 
            to="/transformaciones" 
            @click="menuOpen = false"
            class="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors duration-200 dragon-ball-nav"
          >
            ⚡ Transformaciones
          </NuxtLink>
          <NuxtLink 
            to="/nuevo-personaje" 
            @click="menuOpen = false"
            class="block px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 dragon-ball-button text-center"
          >
            ➕ Nuevo Personaje
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero Section con dragón de fondo y rayos -->
    <div class="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] z-10">
      <!-- Fondo oscuro con estrellas -->
      <div class="absolute inset-0 bg-black/40 pointer-events-none"></div>
      
      <!-- Estrellas de fondo -->
      <div class="absolute inset-0 stars pointer-events-none"></div>
      
      <!-- Dragón de Shenron como fondo -->
      <div class="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <img 
          src="https://radardeldragon.com/wp-content/uploads/2023/12/esferas-del-dragon-de-dragon-ball-z-super-gt-y-heroes.jpg"
          alt="Shenron y Esferas del Dragón"
          class="w-full h-full max-w-6xl object-contain dragon-bg"
          @error="handleDragonError"
        />
      </div>
      
      <!-- Efectos de rayos -->
      <div class="absolute inset-0 lightning-container">
        <div class="lightning lightning-1"></div>
        <div class="lightning lightning-2"></div>
        <div class="lightning lightning-3"></div>
        <div class="lightning lightning-4"></div>
      </div>
      
      <!-- Esferas de energía flotantes -->
      <div class="absolute inset-0 energy-spheres">
        <div class="energy-sphere sphere-1"></div>
        <div class="energy-sphere sphere-2"></div>
        <div class="energy-sphere sphere-3"></div>
        <div class="energy-sphere sphere-4"></div>
        <div class="energy-sphere sphere-5"></div>
        <div class="energy-sphere sphere-6"></div>
        <div class="energy-sphere sphere-7"></div>
      </div>
      
      <!-- Overlay para mejorar legibilidad -->
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/50 pointer-events-none"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <!-- Texto principal -->
          <div class="text-center lg:text-left text-white">
            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 drop-shadow-2xl dragon-ball-title">
              Bienvenido al universo
              <span class="block text-yellow-300 animate-pulse">
                Dragon Ball
              </span>
            </h1>
            <p class="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-yellow-100 drop-shadow-lg px-2 sm:px-0">
              Explora los personajes y planetas del universo más épico de todos los tiempos
            </p>
            <!-- Imagen principal destacada - Goku -->
            <div class="flex justify-center lg:justify-start mt-6 sm:mt-8">
              <div class="relative transform hover:scale-105 transition-transform duration-300">
                <div class="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-3xl opacity-70 animate-pulse"></div>
                <img 
                  v-if="personajePrincipal"
                  :src="getImageUrl(personajePrincipal)"
                  :alt="personajePrincipal?.nombre || 'Goku'"
                  class="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 object-contain drop-shadow-2xl z-10"
                />
                <!-- Efecto de energía alrededor -->
                <div class="absolute inset-0 border-4 border-yellow-400 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>
          </div>
          <!-- Galería lateral de personajes -->
          <div class="hidden lg:grid grid-cols-2 gap-4">
            <div v-for="(personaje, index) in personajesDestacados.slice(1, 5)" 
                 :key="`side-${personaje.id}`"
                 class="group relative bg-white/10 backdrop-blur-sm rounded-xl p-4 transform hover:scale-110 transition-all duration-300 hover:bg-white/20"
                 :style="{
                   animation: `fadeInUp ${0.5 + index * 0.1}s ease-out`
                 }">
              <img 
                :src="getImageUrl(personaje)"
                :alt="personaje.nombre"
                class="w-full h-32 object-contain drop-shadow-lg"
              />
              <div class="absolute bottom-2 left-2 right-2 text-center">
                <span class="text-xs font-bold text-white drop-shadow-lg">{{ personaje.nombre }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de registro -->
    <section id="registro" class="relative z-10 bg-slate-950/80 py-12 sm:py-16 lg:py-20">
      <div class="absolute inset-0 bg-[url('https://web.dragonball-api.com/images-compress/backgrounds/background_planets.webp')] opacity-10 mix-blend-screen pointer-events-none"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-950/90 to-slate-900/80 pointer-events-none"></div>

      <div class="relative mx-auto flex max-w-6xl flex-col gap-8 lg:gap-10 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center">
        <div class="flex-1 space-y-4 sm:space-y-6 text-slate-200">
          <p class="text-xs sm:text-sm uppercase tracking-[0.3em] text-indigo-300">Únete a la comunidad</p>
          <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg">
            Desbloquea contenido exclusivo creando tu cuenta
          </h2>
          <p class="text-base sm:text-lg text-slate-300">
            Gestiona tus personajes favoritos, crea nuevas fichas y mantente al día con las últimas transformaciones del universo Dragon Ball.
          </p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
              <h3 class="text-base sm:text-lg font-semibold text-indigo-200">Colecciona</h3>
              <p class="text-xs sm:text-sm text-slate-300">
                Guarda tus personajes y planetas preferidos para consultarlos al instante.
              </p>
            </div>
            <div class="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <h3 class="text-base sm:text-lg font-semibold text-yellow-200">Crea contenido</h3>
              <p class="text-xs sm:text-sm text-slate-300">
                Añade nuevos guerreros y describe sus poderes para compartirlos con otros fans.
              </p>
            </div>
          </div>
        </div>

        <div class="flex-1">
          <div class="rounded-2xl sm:rounded-3xl border border-slate-700/60 bg-slate-900/80 p-6 sm:p-8 shadow-2xl shadow-indigo-500/20 backdrop-blur">
            <h3 class="mb-3 text-center text-xl sm:text-2xl font-semibold text-white">Gestiona tu cuenta</h3>
            <p class="mb-6 text-center text-sm sm:text-base text-slate-300">
              Crea una cuenta para empezar a coleccionar personajes o inicia sesión para continuar tu aventura.
            </p>
            <div class="grid gap-3">
              <NuxtLink
                to="/register"
                class="flex items-center justify-center gap-2 rounded-full bg-indigo-500 px-4 py-2.5 sm:py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/70"
              >
                Crear cuenta
              </NuxtLink>
              <NuxtLink
                to="/login"
                class="flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 sm:py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/70"
              >
                Iniciar sesión
              </NuxtLink>
            </div>
            <p class="mt-6 text-center text-xs text-slate-400">
              Al continuar aceptas nuestros términos y políticas de la Patrulla Roja de datos.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contenido principal -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <!-- Título para personajes destacados -->
      <div class="text-center mb-6 sm:mb-8">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold section-title mb-3 sm:mb-4 dragon-ball-title">
          Personajes Destacados
        </h2>
        <p class="text-sm sm:text-base section-subtitle">
          Los guerreros más poderosos del universo
        </p>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        <p class="mt-4 text-white text-lg">Cargando personajes...</p>
      </div>

      <!-- Mensaje si no hay personajes -->
      <div v-else-if="!loading && personajesDestacados.length === 0" class="text-center py-12">
        <p class="text-white text-lg mb-4">No se encontraron personajes destacados</p>
        <NuxtLink 
          to="/nuevo-personaje" 
          class="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          ➕ Crear Primer Personaje
        </NuxtLink>
      </div>

      <!-- Galería de personajes destacados -->
      <div v-else-if="personajesDestacados.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <NuxtLink
          v-for="personaje in personajesDestacados"
          :key="personaje.id"
          :to="`/personajes#${personaje.id}`"
          class="group relative bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl"
        >
          <!-- Imagen del personaje -->
          <div class="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            <img 
              :src="getImageUrl(personaje)"
              :alt="personaje.nombre"
              class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
            <!-- Badge de poder -->
            <div class="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {{ (personaje.nivel_poder || 0).toLocaleString() }}
            </div>
            <!-- Badge de rareza -->
            <div class="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                 :class="{
                   'bg-gradient-to-r from-yellow-400 to-pink-500': (personaje.nivel_poder || 0) >= 900000,
                   'bg-purple-600': (personaje.nivel_poder || 0) >= 500000 && (personaje.nivel_poder || 0) < 900000,
                   'bg-blue-600': (personaje.nivel_poder || 0) < 500000
                 }">
              {{ (personaje.nivel_poder || 0) >= 900000 ? 'Legendario' : (personaje.nivel_poder || 0) >= 500000 ? 'Épico' : 'Raro' }}
            </div>
          </div>
          <!-- Información -->
          <div class="p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ personaje.nombre }}</h3>
            <p class="text-gray-600 mb-2">
              <span class="font-semibold">Raza:</span> {{ personaje.raza || 'Desconocida' }}
            </p>
            <p class="text-gray-600">
              <span class="font-semibold">Técnica:</span> {{ personaje.tecnica_especial || 'N/A' }}
            </p>
          </div>
        </NuxtLink>
      </div>
      
      <!-- Contenido centrado con estadísticas -->
      <div class="text-center">

        <!-- Estadísticas mejoradas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div class="relative bg-gradient-to-br from-blue-500 to-blue-600 p-4 sm:p-6 rounded-xl shadow-xl overflow-hidden group transform hover:scale-105 transition-all duration-300">
            <div class="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
            <div class="relative z-10 text-white">
              <div class="text-3xl sm:text-4xl mb-2 sm:mb-3">👥</div>
              <div class="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{{ stats.personajes }}</div>
              <div class="text-sm sm:text-base text-blue-100 font-semibold">Personajes</div>
            </div>
            <div v-if="personajesDestacados.length > 0" class="absolute bottom-0 right-0 opacity-20 hidden sm:block">
              <img :src="getImageUrl(personajesDestacados[0])" alt="" class="w-16 sm:w-24 h-16 sm:h-24 object-contain" />
            </div>
          </div>
          <div class="relative bg-gradient-to-br from-green-500 to-green-600 p-4 sm:p-6 rounded-xl shadow-xl overflow-hidden group transform hover:scale-105 transition-all duration-300">
            <div class="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
            <div class="relative z-10 text-white">
              <div class="text-3xl sm:text-4xl mb-2 sm:mb-3">🪐</div>
              <div class="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{{ stats.planetas }}</div>
              <div class="text-sm sm:text-base text-green-100 font-semibold">Planetas</div>
            </div>
            <div class="absolute bottom-0 right-0 opacity-20 hidden sm:block">
              <div class="text-4xl sm:text-6xl">🌍</div>
            </div>
          </div>
          <div class="relative bg-gradient-to-br from-purple-500 to-purple-600 p-4 sm:p-6 rounded-xl shadow-xl overflow-hidden group transform hover:scale-105 transition-all duration-300 sm:col-span-2 md:col-span-1">
            <div class="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
            <div class="relative z-10 text-white">
              <div class="text-3xl sm:text-4xl mb-2 sm:mb-3">⚡</div>
              <div class="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{{ stats.poderTotal }}</div>
              <div class="text-sm sm:text-base text-purple-100 font-semibold">Poder Total</div>
            </div>
            <div class="absolute bottom-0 right-0 opacity-20 hidden sm:block">
              <div class="text-4xl sm:text-6xl animate-spin" style="animation-duration: 3s;">💥</div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <NuxtLink 
            to="/personajes" 
            class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 dragon-ball-button text-center"
          >
            👥 Ver Personajes
          </NuxtLink>
          <NuxtLink 
            to="/planetas" 
            class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 dragon-ball-button text-center"
          >
            🪐 Explorar Planetas
          </NuxtLink>
          <NuxtLink 
            to="/nuevo-personaje" 
            class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 dragon-ball-button text-center"
          >
            ➕ Crear Personaje
          </NuxtLink>
        </div>

        <!-- Sección de Razas Populares -->
        <div v-if="personajesDestacados.length > 0" class="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <div class="text-center mb-6 sm:mb-8">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold section-title mb-3 sm:mb-4 dragon-ball-title">Razas Populares</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div v-for="raza in razasPopulares" 
                 :key="raza.nombre"
                 class="relative bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 group">
              <div class="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img 
                  :src="getImageUrl(raza.representante)"
                  :alt="raza.nombre"
                  class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div class="absolute bottom-4 left-4 right-4">
                  <h3 class="text-xl font-bold text-white drop-shadow-lg">{{ raza.nombre }}</h3>
                  <p class="text-white/90 text-sm">{{ raza.cantidad }} personajes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Características mejoradas -->
        <div class="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div class="relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl shadow-lg border-2 border-blue-200 text-center transform hover:scale-105 transition-all duration-300">
            <div class="text-4xl sm:text-5xl mb-3 sm:mb-4">🔍</div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Búsqueda Avanzada</h3>
            <p class="text-sm sm:text-base text-gray-600">Encuentra personajes por nombre, raza, planeta o técnica especial</p>
          </div>
          <div class="relative bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 rounded-2xl shadow-lg border-2 border-purple-200 text-center transform hover:scale-105 transition-all duration-300">
            <div class="text-4xl sm:text-5xl mb-3 sm:mb-4">⚡</div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Gestión Completa</h3>
            <p class="text-sm sm:text-base text-gray-600">Crea, edita y elimina personajes con validaciones avanzadas</p>
          </div>
          <div class="relative bg-gradient-to-br from-pink-50 to-pink-100 p-6 sm:p-8 rounded-2xl shadow-lg border-2 border-pink-200 text-center transform hover:scale-105 transition-all duration-300">
            <div class="text-4xl sm:text-5xl mb-3 sm:mb-4">🎨</div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Diseño Moderno</h3>
            <p class="text-sm sm:text-base text-gray-600">Interfaz intuitiva y responsive con Tailwind CSS</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const menuOpen = ref(false)
const loading = ref(true)
const stats = ref({
  personajes: 0,
  planetas: 0,
  poderTotal: 0
})

// Personajes destacados para mostrar en la página
const personajesDestacados = ref([])
// Personaje principal (Goku) para mostrar en hero
const personajePrincipal = ref(null)
// Razas populares con sus representantes
const razasPopulares = ref([])

onMounted(async () => {
  loading.value = true
  try {
    console.log('🔄 Iniciando carga de datos...')
    
    // Cargar estadísticas y personajes destacados con manejo de errores individual
    let personajes = []
    let planetas = []
    
    try {
      console.log('📡 Cargando personajes...')
      const personajesData = await $fetch('/api/personajes')
      personajes = Array.isArray(personajesData) ? personajesData : []
      console.log(`✅ Personajes cargados: ${personajes.length}`)
    } catch (error) {
      console.error('❌ Error cargando personajes:', error)
      personajes = []
    }
    
    try {
      console.log('📡 Cargando planetas...')
      const planetasData = await $fetch('/api/planetas')
      planetas = Array.isArray(planetasData) ? planetasData : []
      console.log(`✅ Planetas cargados: ${planetas.length}`)
    } catch (error) {
      console.error('❌ Error cargando planetas:', error)
      planetas = []
    }
    
    // Actualizar estadísticas
    stats.value.personajes = personajes.length
    stats.value.planetas = planetas.length
    stats.value.poderTotal = personajes.reduce((total, p) => total + (p.nivel_poder || 0), 0).toLocaleString()
    
    console.log('📊 Estadísticas:', stats.value)
    
    // Procesar personajes solo si hay datos
    if (personajes.length > 0) {
      // Seleccionar personajes destacados: Goku primero, luego los más poderosos (sin duplicados)
      const goku = personajes.find(p => p.nombre && p.nombre.toLowerCase().includes('goku'))
      
      // Filtrar personajes: excluir Goku y duplicados de Celula/Cell
      let celulaAgregado = false
      const otrosPersonajes = personajes
        .filter(p => {
          // Excluir Goku (ya lo agregaremos primero)
          if (p.id === goku?.id) return false
          
          // Manejar duplicados de Celula/Cell (mantener solo uno)
          const nombre = (p.nombre || '').toLowerCase()
          if ((nombre.includes('celula') || nombre.includes('cell'))) {
            if (celulaAgregado) {
              return false // Ya hay un Celula, excluir este
            }
            celulaAgregado = true
          }
          return true
        })
        .sort((a, b) => (b.nivel_poder || 0) - (a.nivel_poder || 0))
      
      // Construir lista: Goku primero, luego los más poderosos (máximo 6, sin duplicados)
      personajesDestacados.value = []
      
      // Agregar Goku primero si existe y establecerlo como personaje principal
      if (goku) {
        personajesDestacados.value.push(goku)
        personajePrincipal.value = goku
        console.log('⭐ Personaje principal establecido:', goku.nombre)
      }
      
      // Agregar otros personajes (excluyendo duplicados por ID)
      const idsAgregados = new Set(goku ? [goku.id] : [])
      for (const personaje of otrosPersonajes) {
        if (personajesDestacados.value.length >= 6) break
        if (!idsAgregados.has(personaje.id)) {
          personajesDestacados.value.push(personaje)
          idsAgregados.add(personaje.id)
        }
      }
      
      // Si no hay Goku, usar el primer personaje destacado como principal
      if (!personajePrincipal.value && personajesDestacados.value.length > 0) {
        personajePrincipal.value = personajesDestacados.value[0]
        console.log('⭐ Personaje principal establecido (fallback):', personajePrincipal.value.nombre)
      }
      
      console.log(`✅ Personajes destacados: ${personajesDestacados.value.length}`)
      
      // Calcular razas populares
      const razasMap = {}
      personajes.forEach(p => {
        const raza = p.raza || 'Desconocida'
        if (!razasMap[raza]) {
          razasMap[raza] = {
            nombre: raza,
            cantidad: 0,
            personajes: [],
            maxPower: 0
          }
        }
        razasMap[raza].cantidad++
        razasMap[raza].personajes.push(p)
        if ((p.nivel_poder || 0) > razasMap[raza].maxPower) {
          razasMap[raza].maxPower = p.nivel_poder || 0
          razasMap[raza].representante = p
        }
      })
      
      // Convertir a array, ordenar por cantidad y tomar las 4 más populares
      razasPopulares.value = Object.values(razasMap)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 4)
        .map(raza => ({
          nombre: raza.nombre,
          cantidad: raza.cantidad,
          representante: raza.representante
        }))
      
      console.log(`✅ Razas populares: ${razasPopulares.value.length}`)
    } else {
      console.warn('⚠️ No se encontraron personajes para mostrar')
      // Mantener arrays vacíos pero no fallar
      personajesDestacados.value = []
      razasPopulares.value = []
    }
  } catch (error) {
    console.error('❌ Error general al cargar datos:', error)
    // Usar valores por defecto si hay error
    stats.value = {
      personajes: 0,
      planetas: 0,
      poderTotal: '0'
    }
    personajesDestacados.value = []
    razasPopulares.value = []
  } finally {
    loading.value = false
    console.log('✅ Carga de datos completada')
  }
})

// Función para obtener URL de imagen
const getImageUrl = (personaje) => {
  if (personaje?.image && personaje.image.startsWith('http')) {
    return personaje.image
  }
  return '/dbz/default.svg'
}

// Función para manejar error al cargar imagen del dragón
const handleDragonError = (event) => {
  console.warn('Error al cargar imagen del dragón, usando fallback')
  event.target.style.display = 'none'
}

// Función para manejar error al cargar logo
const handleLogoError = (event) => {
  console.warn('Error al cargar logo, usando texto alternativo')
  // Si falla la imagen, mostrar texto
  event.target.style.display = 'none'
  const parent = event.target.parentElement
  if (parent && !parent.querySelector('.logo-fallback')) {
    const fallback = document.createElement('span')
    fallback.className = 'logo-fallback text-xl font-bold text-gray-800 dragon-ball-logo'
    fallback.textContent = '🐉 Dragon Ball Universe'
    parent.appendChild(fallback)
  }
}
</script>

<style scoped>
/* Importar fuentes de Google Fonts estilo Dragon Ball */
@import url('https://fonts.googleapis.com/css2?family=Bangers&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');

/* Fondo general */
.page-home {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a142d 0%, #111c42 50%, #05070f 100%);
  overflow: hidden;
}

.page-home__overlay,
.page-home__stars,
.page-home__lightning,
.page-home__energy {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.page-home__overlay {
  background: rgba(0, 0, 0, 0.45);
}

.page-home__stars {
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

.page-home__lightning {
  overflow: hidden;
}

.page-home__energy {
  overflow: visible;
}

.page-home > *:not(.page-home__overlay):not(.page-home__stars):not(.page-home__lightning):not(.page-home__energy) {
  position: relative;
  z-index: 10;
}

/* Fuentes estilo Dragon Ball */
.dragon-ball-title {
  font-family: 'Bangers', 'Orbitron', cursive;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-shadow: 
    2px 2px 0px rgba(0, 0, 0, 0.3),
    4px 4px 0px rgba(255, 215, 0, 0.5),
    0 0 10px rgba(255, 215, 0, 0.3);
}

.section-title {
  color: #fef9c3;
  text-shadow:
    0 0 8px rgba(255, 255, 255, 0.5),
    0 0 14px rgba(109, 193, 255, 0.6),
    0 0 22px rgba(109, 193, 255, 0.35);
}

.section-subtitle {
  color: #e0f2ff;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-shadow:
    0 0 8px rgba(109, 193, 255, 0.45),
    0 0 14px rgba(56, 189, 248, 0.35);
}

.dragon-ball-button {
  font-family: 'Rajdhani', 'Orbitron', sans-serif;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.dragon-ball-nav {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.dragon-ball-logo {
  font-family: 'Bangers', cursive;
  letter-spacing: 0.1em;
  text-shadow: 
    1px 1px 0px rgba(0, 0, 0, 0.2),
    2px 2px 0px rgba(255, 215, 0, 0.4);
}
/* Animaciones para imágenes flotantes */
@keyframes float-up {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes float-down {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(20px) rotate(-5deg);
  }
}

/* Animación de entrada */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Estrellas de fondo animadas */
.stars {
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 60px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 50px 50px, #fff, transparent),
    radial-gradient(1px 1px at 80px 30px, rgba(255,255,255,0.6), transparent),
    radial-gradient(2px 2px at 90px 70px, #eee, transparent),
    radial-gradient(1px 1px at 130px 40px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 160px 60px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 8s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* Efecto del dragón */
.dragon-bg {
  filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.3));
  animation: dragonGlow 4s ease-in-out infinite;
}

@keyframes dragonGlow {
  0%, 100% {
    filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.3)) brightness(1);
  }
  50% {
    filter: drop-shadow(0 0 50px rgba(255, 215, 0, 0.6)) brightness(1.1);
  }
}

/* Efectos de rayos */
.lightning-container {
  pointer-events: none;
  overflow: hidden;
}

.lightning {
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(255, 255, 255, 0.8) 10%, 
    rgba(200, 220, 255, 0.9) 50%, 
    rgba(255, 255, 255, 0.8) 90%, 
    transparent 100%);
  opacity: 0;
  box-shadow: 
    0 0 10px rgba(255, 255, 255, 0.8),
    0 0 20px rgba(200, 220, 255, 0.6),
    0 0 30px rgba(150, 200, 255, 0.4);
}

.lightning-1 {
  left: 10%;
  animation: lightning 3s infinite;
  animation-delay: 0s;
}

.lightning-2 {
  left: 30%;
  animation: lightning 4s infinite;
  animation-delay: 1s;
}

.lightning-3 {
  left: 60%;
  animation: lightning 3.5s infinite;
  animation-delay: 2s;
}

.lightning-4 {
  left: 80%;
  animation: lightning 4.5s infinite;
  animation-delay: 0.5s;
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

/* Esferas de energía flotantes (Dragon Balls) */
.energy-spheres {
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

.sphere-1 {
  left: 5%;
  top: 20%;
  animation-delay: 0s;
}

.sphere-2 {
  left: 20%;
  top: 60%;
  animation-delay: 1s;
  animation-duration: 7s;
}

.sphere-3 {
  left: 50%;
  top: 10%;
  animation-delay: 2s;
  animation-duration: 8s;
}

.sphere-4 {
  left: 70%;
  top: 50%;
  animation-delay: 1.5s;
  animation-duration: 6.5s;
}

.sphere-5 {
  left: 85%;
  top: 30%;
  animation-delay: 0.5s;
  animation-duration: 7.5s;
}

.sphere-6 {
  left: 15%;
  top: 80%;
  animation-delay: 2.5s;
  animation-duration: 8.5s;
}

.sphere-7 {
  left: 40%;
  top: 70%;
  animation-delay: 1.2s;
  animation-duration: 9s;
}

@keyframes float-sphere {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.7;
  }
  25% {
    transform: translate(20px, -30px) scale(1.1);
    opacity: 0.9;
  }
  50% {
    transform: translate(-10px, -50px) scale(0.9);
    opacity: 0.8;
  }
  75% {
    transform: translate(15px, -20px) scale(1.05);
    opacity: 0.85;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

