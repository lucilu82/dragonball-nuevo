export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  if (to.path === '/login') return

  const { user, fetchUser } = useAuth()

  if (!user.value) {
    try {
      await fetchUser()
    } catch {}
  }

  if (!user.value) {
    return navigateTo({
      path: '/login',
      query: to.fullPath ? { redirect: to.fullPath } : undefined,
    })
  }
})

