export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();

  if (authStore.isLoaded && !authStore.isAuthenticated) {
    return navigateTo("/login");
  }
});
