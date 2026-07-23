<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-white">👥 Пользователи</h1>
      <NuxtLink to="/admin">
        <UButton color="primary" variant="ghost">← Назад</UButton>
      </NuxtLink>
    </div>

    <UCard>
      <div v-if="pending" class="text-center py-8 text-gray-400">
        Загрузка...
      </div>

      <div v-else class="divide-y divide-gray-800">
        <div
          v-for="user in users"
          :key="user.id"
          class="py-3 flex items-center justify-between"
        >
          <div>
            <p class="font-medium text-black">
              {{ user.username }}
              <UBadge
                v-if="user.role === 'ADMIN'"
                color="success"
                size="xs"
                class="ml-2"
              >
                ADMIN
              </UBadge>
            </p>
            <p class="text-sm text-gray-400">
              Ник FIFA: {{ user.fifaNickname }}
            </p>
            <p class="text-xs text-gray-500">
              {{ new Date(user.createdAt).toLocaleDateString() }}
            </p>
          </div>

          <div class="text-right text-sm">
            <p class="text-gray-700 font-bold">{{ user.totalPoints }} очков</p>
            <p class="text-gray-400">{{ user.seasonsPlayed }} сезонов</p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { PublicUser } from "~~/types";

const { data: user } = await useFetch<PublicUser>("/api/auth/me");

if (!user.value || user.value.role !== "ADMIN") {
  navigateTo("/");
}

const { data: users, pending } = await useFetch("/api/admin/users");
</script>
