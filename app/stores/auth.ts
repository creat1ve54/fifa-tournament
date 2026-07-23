import { defineStore } from "pinia";
import type { PublicUser } from "~~/types";

export const useAuthStore = defineStore("auth", () => {
  const user = useState<PublicUser | null>("auth-user", () => null);
  const isLoaded = useState<boolean>("auth-loaded", () => false);

  const isAuthenticated = computed(() => !!user.value);

  async function loadUser() {
    try {
      const headers = import.meta.server
        ? useRequestHeaders(["cookie"])
        : undefined;

      const data = await $fetch<PublicUser>("/api/auth/me", { headers });
      user.value = data;
    } catch {
      user.value = null;
    } finally {
      isLoaded.value = true;
    }
  }

  async function logout() {
    await $fetch("/api/auth/logout", { method: "POST" });
    user.value = null;
    await navigateTo("/");
  }

  return { user, isLoaded, isAuthenticated, loadUser, logout };
});
