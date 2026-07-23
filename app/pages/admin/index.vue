<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-white">👑 Админ-панель</h1>

    <div
      v-if="user?.role !== 'ADMIN'"
      class="bg-red-900/50 border border-red-700 p-4 rounded"
    >
      <p class="text-red-300">⛔ Доступ только для администраторов</p>
      <NuxtLink to="/" class="text-blue-400 hover:underline text-sm">
        ← Вернуться на главную
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink to="/admin/teams" class="group">
        <UCard class="hover:border-blue-500 transition-all">
          <div class="flex items-center gap-3">
            <UIcon
              name="i-heroicons-cog-6-tooth"
              class="w-8 h-8 text-blue-400"
            />
            <div>
              <h3 class="font-semibold text-black">Справочник команд</h3>
              <p class="text-sm text-gray-400">
                Добавить/редактировать команды
              </p>
            </div>
          </div>
        </UCard>
      </NuxtLink>

      <NuxtLink to="/admin/seasons" class="group">
        <UCard class="hover:border-green-500 transition-all">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-calendar" class="w-8 h-8 text-green-400" />
            <div>
              <h3 class="font-semibold text-black">Сезоны</h3>
              <p class="text-sm text-gray-400">Создать и управлять сезонами</p>
            </div>
          </div>
        </UCard>
      </NuxtLink>

      <NuxtLink to="/admin/users" class="group">
        <UCard class="hover:border-purple-500 transition-all">
          <div class="flex items-center gap-3">
            <UIcon
              name="i-heroicons-user-group"
              class="w-8 h-8 text-purple-400"
            />
            <div>
              <h3 class="font-semibold text-black">Пользователи</h3>
              <p class="text-sm text-gray-400">Список участников</p>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PublicUser } from "~~/types";
const { data: user } = await useFetch<PublicUser>("/api/auth/me");

if (!user.value) {
  navigateTo("/login");
}
</script>
