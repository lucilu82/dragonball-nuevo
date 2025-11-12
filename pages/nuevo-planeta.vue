<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">🌌 Registrar nuevo planeta</h1>
      <div class="flex gap-2">
        <NuxtLink
          to="/planetas"
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded transition-colors duration-200"
        >
          ← Volver
        </NuxtLink>
      </div>
    </div>

    <form @submit.prevent="crearPlaneta" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block font-semibold text-gray-700 mb-2">Nombre *</label>
          <input
            v-model.trim="nombre"
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
            v-model.trim="galaxia"
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
            v-model.number="poblacion"
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
            v-model.trim="imagen"
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
          v-model.trim="descripcion"
          rows="4"
          placeholder="Características, habitantes destacados, clima..."
          class="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        ></textarea>
      </div>

      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="guardando"
          class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <span v-if="guardando">⏳</span>
          <span v-else>💾</span>
          {{ guardando ? 'Guardando...' : 'Guardar planeta' }}
        </button>

        <button
          type="button"
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
          @click="limpiarFormulario"
        >
          Limpiar
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
const nombre = ref('')
const galaxia = ref('')
const poblacion = ref<number | null>(null)
const descripcion = ref('')
const imagen = ref('')
const mensaje = ref('')
const guardando = ref(false)
const errores = ref<Record<string, string>>({})

const limpiarFormulario = () => {
  nombre.value = ''
  galaxia.value = ''
  poblacion.value = null
  descripcion.value = ''
  imagen.value = ''
  errores.value = {}
}

const crearPlaneta = async () => {
  guardando.value = true
  mensaje.value = ''
  errores.value = {}

  if (!nombre.value) {
    errores.value.nombre = 'El nombre es obligatorio'
  }

  if (poblacion.value !== null && poblacion.value < 0) {
    errores.value.poblacion = 'La población no puede ser negativa'
  }

  if (Object.keys(errores.value).length > 0) {
    mensaje.value = '❌ Revisa los campos marcados en rojo.'
    guardando.value = false
    return
  }

  const payload: Record<string, any> = {
    nombre: nombre.value.trim(),
    galaxia: galaxia.value?.trim() || null,
    poblacion: poblacion.value !== null ? Number(poblacion.value) : null,
    descripcion: descripcion.value?.trim() || null,
    imagen: imagen.value?.trim() || null,
  }

  if (!payload.galaxia) {
    delete payload.galaxia
  }
  if (payload.poblacion === null || Number.isNaN(payload.poblacion)) {
    delete payload.poblacion
  }
  if (!payload.descripcion) {
    delete payload.descripcion
  }
  if (!payload.imagen) {
    delete payload.imagen
  }

  try {
    const res = await fetch('/api/planetas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const contentType = res.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null)

    if (!res.ok) {
      let detalle = typeof data === 'string' ? data : data?.message || 'Error en la creación del planeta'

      if (typeof data === 'object' && data?.errors) {
        const firstError = Object.values(data.errors)[0]
        detalle = Array.isArray(firstError) ? firstError[0] : String(firstError)
      }

      throw new Error(detalle)
    }

    mensaje.value = '✅ Planeta guardado correctamente'
    limpiarFormulario()

    setTimeout(() => {
      navigateTo(`/planetas?refresh=${Date.now()}`)
    }, 1200)
  } catch (error: any) {
    const detalle = error?.message || 'No se pudo guardar el planeta. Verifica el backend de Laravel.'
    mensaje.value = `❌ ${detalle}`
  } finally {
    guardando.value = false
  }
}
</script>
{
  "cells": [],
  "metadata": {
    "language_info": {
      "name": "python"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 2
}