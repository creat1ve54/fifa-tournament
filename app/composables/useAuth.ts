import type { PublicUser } from "~~/types";

export function useAuth() {
  const { data: user, status } = useAsyncData<PublicUser | null>(
    "auth-user",
    async () => {
      try {
        const headers = import.meta.server
          ? useRequestHeaders(["cookie"])
          : undefined;

        return await $fetch<PublicUser>("/api/auth/me", { headers });
      } catch (error) {
        return null;
      }
    },
    {
      transform: (data) => data ?? null,
    },
  );

  const isLoaded = computed(() => status.value !== "pending");

  async function logout() {
    await $fetch("/api/auth/logout", { method: "POST" });
    user.value = null;

    await clearNuxtData("auth-user");
    navigateTo("/");
  }

  async function refreshUser() {
    await refreshNuxtData("auth-user");
  }

  return { user, isLoaded, logout, refreshUser };
}
