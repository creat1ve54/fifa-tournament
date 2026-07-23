<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <NuxtLink to="/ranking" class="text-blue-400 hover:underline text-sm">
        ← Назад к рейтингу
      </NuxtLink>
    </div>

    <div v-if="!player" class="text-center py-8 text-gray-400">Загрузка...</div>

    <template v-else>
      <!-- Шапка профиля -->
      <UCard>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500">Логин</p>
            <p class="text-lg font-medium text-gray-900">
              {{ player.username }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Ник в FIFA</p>
            <p class="text-lg font-medium text-gray-900">
              {{ player.fifaNickname }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p class="text-sm text-gray-500">Всего очков</p>
              <p class="text-2xl font-bold text-yellow-500">
                {{ player.totalPoints || 0 }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Сезонов сыграно</p>
              <p class="text-2xl font-bold text-blue-500">
                {{ player.seasonsPlayed || 0 }}
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Текущая команда -->
      <UCard v-if="currentTeam">
        <template #header>
          <h2 class="font-semibold text-gray-700">🎮 Текущая команда</h2>
        </template>

        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 bg-gray-700 rounded flex items-center justify-center font-bold text-white"
          >
            {{ currentTeam.teamReference.shortName }}
          </div>
          <div>
            <p class="text-lg font-medium text-gray-900">
              {{ currentTeam.teamReference.name }}
            </p>
            <NuxtLink
              :to="`/seasons/${currentTeam.season.id}`"
              class="text-sm text-blue-400 hover:underline"
            >
              Сезон: {{ currentTeam.season.name }} →
            </NuxtLink>
          </div>
        </div>
      </UCard>

      <!-- История сезонов -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-gray-700">📜 История сезонов</h2>
        </template>

        <div v-if="!history?.length" class="text-center py-8 text-gray-400">
          Нет завершённых сезонов
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="result in history"
            :key="result.id"
            class="bg-gray-200/50 rounded p-3 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors"
            @click="navigateTo(`/seasons/${result.season.id}`)"
          >
            <div>
              <p class="font-medium text-gray-900">
                {{ result.season.name }}
              </p>
              <p class="text-sm text-gray-500">
                {{ result.wins }}W - {{ result.draws }}D - {{ result.losses }}L
              </p>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-yellow-500">
                {{ result.points }} очков
              </p>
              <p class="text-sm text-gray-500">Место: {{ result.place }}</p>
            </div>
          </div>
        </div>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const userId = Number(route.params.id);

const { data: player } = await useFetch(`/api/users/${userId}`);

const { data: currentTeam } = await useFetch(
  `/api/users/${userId}/current-team`,
);

const { data: history } = await useFetch(`/api/users/${userId}/history`);
</script>
