<script setup lang="ts">
const router = useRouter()

onMounted(() => {
  router.replace('/')
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
    <div class="rounded-2xl bg-slate-900/70 px-6 py-4 text-center shadow-lg shadow-indigo-500/20">
      Redirigiendo a la página principal...
    </div>
  </div>
</template>

