<template>
  <header class="bg-gray-900 border-b border-gray-800 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <NuxtLink to="/" class="text-xl font-bold text-white hover:text-blue-400">
        ⚽ GAZLiga
      </NuxtLink>

      <nav class="flex items-center gap-4">
        <NuxtLink to="/seasons" class="text-gray-300 hover:text-blue-400">
          📅 Сезоны
        </NuxtLink>
        <NuxtLink to="/ranking" class="text-gray-300 hover:text-blue-400">
          🏆 Рейтинг
        </NuxtLink>

        <template v-if="!authStore.isLoaded">
          <span class="text-gray-500 text-sm animate-pulse">Загрузка...</span>
        </template>

        <template v-else-if="authStore.isAuthenticated">
          <span class="text-gray-400 text-sm">
            👤 {{ authStore.user!.fifaNickname }}
          </span>
          <NuxtLink
            v-if="authStore.user!.role === 'ADMIN'"
            to="/admin"
            class="text-gray-300 hover:text-blue-400"
          >
            ⚙️ Админка
          </NuxtLink>
          <NuxtLink to="/profile" class="text-gray-300 hover:text-blue-400">
            👤 Профиль
          </NuxtLink>
          <UButton
            @click="authStore.logout()"
            color="error"
            variant="ghost"
            size="xs"
          >
            Выйти
          </UButton>
        </template>

        <template v-else>
          <NuxtLink to="/login">
            <UButton color="primary" variant="ghost" size="sm">Войти</UButton>
          </NuxtLink>
          <NuxtLink to="/register">
            <UButton color="primary" size="sm">Регистрация</UButton>
          </NuxtLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
</script>
