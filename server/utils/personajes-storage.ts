// Este archivo maneja el almacenamiento de personajes en memoria
// En una aplicación real, usarías una base de datos (PostgreSQL, MySQL, MongoDB, etc.)

// Array que actúa como nuestra "base de datos" en memoria
// Este es el lugar donde se guardan todos los personajes
const imageProxy = (url: string) => `/api/image-proxy?url=${encodeURIComponent(url)}`

let personajes: any[] = [
  {
    id: 1,
    nombre: "Goku",
    raza: "Saiyajin",
    nivel_poder: 1000000,
    descripcion: "El guerrero más fuerte de la Tierra",
    tecnica_especial: "Kamehameha",
    planeta_id: 1,
    edad: null,
    image: "https://dragonball-api.com/characters/goku_normal.webp"
  },
  {
    id: 2,
    nombre: "Vegeta",
    raza: "Saiyajin",
    nivel_poder: 950000,
    descripcion: "Príncipe de los Saiyajin",
    tecnica_especial: "Final Flash",
    planeta_id: 3,
    edad: null,
    image: "https://dragonball-api.com/characters/vegeta_normal.webp"
  },
  {
    id: 3,
    nombre: "Piccolo",
    raza: "Namekiano",
    nivel_poder: 800000,
    descripcion: "Guardián de la Tierra",
    tecnica_especial: "Makankosappo",
    planeta_id: 2,
    edad: null,
    image: "https://dragonball-api.com/characters/picolo_normal.webp"
  },
  {
    id: 4,
    nombre: "Frieza",
    raza: "Demonio",
    nivel_poder: 1200000,
    descripcion: "Emperador del Universo",
    tecnica_especial: "Death Ball",
    planeta_id: 4,
    edad: null,
    image: "https://dragonball-api.com/characters/Freezer.webp"
  },
  {
    id: 5,
    nombre: "Cell",
    raza: "Androide",
    nivel_poder: 1100000,
    descripcion: "Androide perfecto creado por el Dr. Gero",
    tecnica_especial: "Kamehameha Solar",
    planeta_id: 1,
    edad: null,
    image: "https://dragonball-api.com/characters/celula.webp"
  },
  {
    id: 6,
    nombre: "Buu",
    raza: "Demonio",
    nivel_poder: 1300000,
    descripcion: "Demonio ancestral de gran poder",
    tecnica_especial: "Absorción",
    planeta_id: 1,
    edad: null,
    image: "https://dragonball-api.com/characters/BuuGordo_Universo7.webp"
  },
  {
    id: 7,
    nombre: "Gohan",
    raza: "Saiyajin",
    nivel_poder: 900000,
    descripcion: "Hijo de Goku, gran potencial",
    tecnica_especial: "Masenko",
    planeta_id: 1,
    edad: null,
    image: "https://dragonball-api.com/characters/gohan.webp"
  },
  {
    id: 8,
    nombre: "Trunks",
    raza: "Saiyajin",
    nivel_poder: 850000,
    descripcion: "Hijo de Vegeta del futuro",
    tecnica_especial: "Burning Attack",
    planeta_id: 1,
    edad: null,
    image: "https://dragonball-api.com/characters/Trunks_Buu_Artwork.webp"
  },
  {
    id: 9,
    nombre: "Krillin",
    raza: "Humano",
    nivel_poder: 75000,
    descripcion: "Mejor amigo de Goku",
    tecnica_especial: "Kienzan",
    planeta_id: 1,
    edad: null,
    image: "https://dragonball-api.com/characters/Krilin_Universo7.webp"
  },
  {
    id: 10,
    nombre: "Bulma",
    raza: "Humano",
    nivel_poder: 5,
    descripcion: "Genio científica y esposa de Vegeta",
    tecnica_especial: "Inteligencia",
    planeta_id: 1,
    edad: null,
    image: "https://dragonball-api.com/characters/bulma.webp"
  },
  {
    id: 11,
    nombre: "Celula",
    raza: "Androide",
    nivel_poder: 1100000,
    descripcion: "Androide perfecto creado por el Dr. Gero",
    tecnica_especial: "Kamehameha Solar",
    planeta_id: 1,
    edad: null,
    image: "https://dragonball-api.com/characters/celula.webp"
  },
  {
    id: 12,
    nombre: "Capitán Ginyu",
    raza: "Demonio",
    nivel_poder: 120000,
    descripcion: "Capitán de la Fuerza Especial Ginyu",
    tecnica_especial: "Cambio de Cuerpo",
    planeta_id: 4,
    edad: null,
    image: "https://dragonball-api.com/characters/ginyu.webp"
  },
  {
    id: 13,
    nombre: "Tien Shinhan",
    raza: "Humano",
    nivel_poder: 180000,
    descripcion: "Guerrero de las Tres Ojos",
    tecnica_especial: "Triblast",
    planeta_id: 1,
    edad: null,
    image: "https://dragonball-api.com/characters/Tenshinhan_Universo7.webp"
  },
  {
    id: 14,
    nombre: "Yamcha",
    raza: "Humano",
    nivel_poder: 148000,
    descripcion: "Bandido del desierto convertido en guerrero",
    tecnica_especial: "Wolf Fang Fist",
    planeta_id: 1,
    edad: null,
    image: "https://dragonball-api.com/characters/Final_Yamcha.webp"
  },
  {
    id: 15,
    nombre: "Master Roshi",
    raza: "Humano",
    nivel_poder: 139000,
    descripcion: "Maestro de artes marciales legendario",
    tecnica_especial: "Kamehameha",
    planeta_id: 1,
    edad: null,
    image: "https://dragonball-api.com/characters/roshi.webp"
  },
  {
    id: 16,
    nombre: "Raditz",
    raza: "Saiyajin",
    nivel_poder: 150000,
    descripcion: "Hermano mayor de Goku",
    tecnica_especial: "Double Sunday",
    planeta_id: 3,
    edad: null,
    image: "https://dragonball-api.com/characters/Raditz_artwork_Dokkan.webp"
  },
  {
    id: 17,
    nombre: "Nappa",
    raza: "Saiyajin",
    nivel_poder: 400000,
    descripcion: "Guerrero Saiyajin de élite",
    tecnica_especial: "Bomber DX",
    planeta_id: 3,
    edad: null,
    image: "https://dragonball-api.com/characters/Bardock_Artwork.webp"
  },
  {
    id: 18,
    nombre: "Android 17",
    raza: "Androide",
    nivel_poder: 500000,
    descripcion: "Androide creado por el Dr. Gero",
    tecnica_especial: "Power Blitz",
    planeta_id: 1,
    edad: null,
    image: "https://dragonball-api.com/characters/17_Artwork.webp"
  },
  {
    id: 19,
    nombre: "Android 18",
    raza: "Androide",
    nivel_poder: 500000,
    descripcion: "Hermana de Android 17",
    tecnica_especial: "Power Blitz",
    planeta_id: 1,
    edad: null,
    image: "https://dragonball-api.com/characters/Androide_18_Artwork.webp"
  },
  {
    id: 20,
    nombre: "Broly",
    raza: "Saiyajin",
    nivel_poder: 1400000,
    descripcion: "Saiyajin legendario con poder destructivo",
    tecnica_especial: "Erase Cannon",
    planeta_id: 3,
    edad: null,
    image: "https://dragonball-api.com/transformaciones/Broly_DBS_Base.webp"
  },
  {
    id: 21,
    nombre: "Zeno",
    raza: "Unknown",
    nivel_poder: 999999999999999999999999999,
    descripcion: "Zeno es el ser supremo del multiverso. El Rey de Todo, también conocido como Zeno Sama, es el gobernante y dios absoluto de todos los universos y el máximo soberano de todo lo existente en Dragon Ball.",
    tecnica_especial: "Poder Absoluto",
    planeta_id: 9,
    edad: null,
    image: "https://dragonball-api.com/characters/Zeno_Artwork.webp"
  },
  {
    id: 22,
    nombre: "Kanassano",
    raza: "Kanassano",
    nivel_poder: 320000,
    descripcion: "Guerrero kanassano veterano dedicado a entrenar a su gente y preservar las visiones del futuro.",
    tecnica_especial: "Precognición",
    planeta_id: 10,
    edad: "200+",
    image: imageProxy("https://static.wikia.nocookie.net/dragonball/images/3/3e/Dokkan_Battle_Kanassan_Toolo.png")
  },
  {
    id: 23,
    nombre: "Toribot",
    raza: "Robot",
    nivel_poder: 150000,
    descripcion: "Representación robótica del propio Akira Toriyama, creador que observa y corrige las locuras del universo Dragon Ball.",
    tecnica_especial: "Humor Meta",
    planeta_id: 1,
    edad: "Desconocida",
    image: imageProxy("https://tse4.mm.bing.net/th/id/OIP.BuRYYmxG4NkL6f4BjWJHUgHaJG?rs=1&pid=ImgDetMain&o=7&rm=3")
  },
  {
    id: 24,
    nombre: "Drum",
    raza: "Namekiano",
    nivel_poder: 450000,
    descripcion: "Guerrero demoníaco creado por Piccolo Daimaō para servirle como guardia personal en la saga original de Dragon Ball.",
    tecnica_especial: "Onda Demoníaca",
    planeta_id: 10,
    edad: "Desconocida",
    image: imageProxy("https://static.wikia.nocookie.net/dragonball/images/2/2a/Drum_Artwork.png/revision/latest?cb=20160728000456&path-prefix=es")
  }
]

// Mapa de planetas (para agregar información de planetas a los personajes)
const planetasMap: Record<number, { id: number; nombre: string }> = {
  1: { id: 1, nombre: "Tierra" },
  2: { id: 2, nombre: "Namek" },
  3: { id: 3, nombre: "Vegeta" },
  4: { id: 4, nombre: "Planeta Frieza" },
  9: { id: 9, nombre: "Templo móvil del Rey de Todo" },
  10: { id: 10, nombre: "Kanassa" }
}

// Función auxiliar para agregar información del planeta a un personaje
function agregarPlaneta(personaje: any) {
  const planeta = planetasMap[personaje.planeta_id]
  return {
    ...personaje,
    planeta: planeta || { id: personaje.planeta_id, nombre: "Planeta Desconocido" }
  }
}

// Función para obtener todos los personajes
export function getAllPersonajes() {
  // Devolver todos los personajes con información de planeta
  return personajes.map(agregarPlaneta)
}

// Función para obtener un personaje por ID
export function getPersonajeById(id: number) {
  const personaje = personajes.find(p => p.id === id)
  return personaje ? agregarPlaneta(personaje) : null
}

// Función para crear un nuevo personaje
export function createPersonaje(nuevoPersonaje: any) {
  // Generar un nuevo ID (el mayor ID + 1)
  const newId = personajes.length > 0 
    ? Math.max(...personajes.map(p => p.id)) + 1 
    : 1
  
  const personaje = {
    id: newId,
    ...nuevoPersonaje,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  personajes.push(personaje)
  return agregarPlaneta(personaje)
}

// Función para actualizar un personaje
export function updatePersonaje(id: number, datosActualizados: any) {
  const index = personajes.findIndex(p => p.id === id)
  
  if (index === -1) {
    return null // Personaje no encontrado
  }
  
  // Actualizar el personaje manteniendo el ID y fechas
  personajes[index] = {
    ...personajes[index],
    ...datosActualizados,
    id: id, // Asegurar que el ID no cambie
    updated_at: new Date().toISOString()
  }
  
  return agregarPlaneta(personajes[index])
}

// Función para eliminar un personaje
export function deletePersonaje(id: number) {
  const index = personajes.findIndex(p => p.id === id)
  
  if (index === -1) {
    return false // Personaje no encontrado
  }
  
  personajes.splice(index, 1)
  return true
}
