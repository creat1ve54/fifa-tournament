<template>
  <div class="p-6">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Заголовок -->
      <div class="text-center space-y-2">
        <h1 class="text-5xl font-bold text-white">⚽ GAZLiga</h1>
        <p v-if="currentSeason" class="text-xl text-blue-300">
          {{ currentSeason.name }}
        </p>
      </div>

      <!-- Текущий сезон -->
      <div
        v-if="currentSeason"
        class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
      >
        <h2 class="text-2xl font-bold text-white mb-4">🏆 Текущий сезон</h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-gray-900/50 rounded p-4 text-center">
            <p class="text-3xl font-bold text-green-400">
              {{ currentSeason.teams?.length || 0 }}
            </p>
            <p class="text-sm text-gray-400">Команд</p>
          </div>
          <div class="bg-gray-900/50 rounded p-4 text-center">
            <p class="text-3xl font-bold text-blue-400">
              {{ currentSeason.matches?.length || 0 }}
            </p>
            <p class="text-sm text-gray-400">Матчей</p>
          </div>
          <div class="bg-gray-900/50 rounded p-4 text-center">
            <p class="text-3xl font-bold text-yellow-400">
              {{ currentSeason.roundsCount }}
            </p>
            <p class="text-sm text-gray-400">Кругов</p>
          </div>
          <div class="bg-gray-900/50 rounded p-4 text-center">
            <p class="text-3xl font-bold text-purple-400">{{ statusText }}</p>
            <p class="text-sm text-gray-400">Статус</p>
          </div>
        </div>
      </div>

      <!-- Турнирная таблица -->
      <div
        v-if="currentSeason?.teams?.length"
        class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
      >
        <h2 class="text-2xl font-bold text-white mb-4">📊 Турнирная таблица</h2>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-700 text-left">
                <th class="py-3 px-2 text-gray-400 font-semibold">#</th>
                <th class="py-3 px-2 text-gray-400 font-semibold">Команда</th>
                <th class="py-3 px-2 text-gray-400 font-semibold">Участник</th>
                <th class="py-3 px-2 text-gray-400 font-semibold text-center">
                  И
                </th>
                <th class="py-3 px-2 text-gray-400 font-semibold text-center">
                  В
                </th>
                <th class="py-3 px-2 text-gray-400 font-semibold text-center">
                  Н
                </th>
                <th class="py-3 px-2 text-gray-400 font-semibold text-center">
                  П
                </th>
                <th class="py-3 px-2 text-gray-400 font-semibold text-center">
                  ГЗ
                </th>
                <th class="py-3 px-2 text-gray-400 font-semibold text-center">
                  ГП
                </th>
                <th class="py-3 px-2 text-gray-400 font-semibold text-center">
                  РГ
                </th>
                <th class="py-3 px-2 text-gray-400 font-semibold text-center">
                  О
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(team, index) in sortedTeams"
                :key="team.id"
                class="border-b border-gray-800 hover:bg-gray-700/30 transition-colors cursor-pointer"
                @click="showTeamDetails(team)"
              >
                <td class="py-3 px-2">
                  <span
                    class="font-bold"
                    :class="{
                      'text-yellow-400': index === 0,
                      'text-gray-300': index === 1,
                      'text-orange-400': index === 2,
                      'text-gray-400': index > 2,
                    }"
                  >
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="py-3 px-2">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-xs font-bold text-white"
                    >
                      {{ team.teamReference.shortName }}
                    </div>
                    <span class="font-medium text-white">
                      {{ team.teamReference.name }}
                    </span>
                  </div>
                </td>
                <td class="py-3 px-2 text-gray-300">
                  {{ team.user?.fifaNickname || "—" }}
                </td>
                <td class="py-3 px-2 text-center text-gray-300">
                  {{ team.played }}
                </td>
                <td class="py-3 px-2 text-center text-green-400">
                  {{ team.won }}
                </td>
                <td class="py-3 px-2 text-center text-gray-300">
                  {{ team.drawn }}
                </td>
                <td class="py-3 px-2 text-center text-red-400">
                  {{ team.lost }}
                </td>
                <td class="py-3 px-2 text-center text-gray-300">
                  {{ team.goalsFor }}
                </td>
                <td class="py-3 px-2 text-center text-gray-300">
                  {{ team.goalsAgainst }}
                </td>
                <td class="py-3 px-2 text-center text-gray-300">
                  {{ team.goalsFor - team.goalsAgainst }}
                </td>
                <td class="py-3 px-2 text-center font-bold text-yellow-400">
                  {{ team.points }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 text-sm text-gray-400">
          <p>И - Игры, В - Победы, Н - Ничьи, П - Поражения</p>
          <p>
            ГЗ - Голы забитые, ГП - Голы пропущенные, РГ - Разница голов, О -
            Очки
          </p>
        </div>
      </div>

      <!-- Нет текущего сезона -->
      <div
        v-else
        class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-12 border border-gray-700 text-center"
      >
        <p class="text-2xl text-gray-400 mb-4">🏆</p>
        <p class="text-xl text-gray-300">Нет активного сезона</p>
        <p class="text-sm text-gray-500 mt-2">
          Администратор ещё не создал сезон
        </p>
      </div>
    </div>

    <!-- Модальное окно команды -->
    <UModal v-model:open="showTeamModal">
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-700">
              {{ selectedTeam?.teamReference.name }}
            </h2>
          </template>

          <div v-if="selectedTeam" class="space-y-4">
            <!-- Информация о команде -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-400">Участник</p>
                <p class="text-lg font-medium text-gray-700">
                  {{ selectedTeam.user?.fifaNickname || "—" }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-400">Очки</p>
                <p class="text-lg font-bold text-yellow-400">
                  {{ selectedTeam.points }}
                </p>
              </div>
            </div>

            <!-- Статистика -->
            <div class="grid grid-cols-4 gap-2">
              <div class="bg-gray-200/50 rounded p-2 text-center">
                <p class="text-2xl font-bold text-gray-700">
                  {{ selectedTeam.played }}
                </p>
                <p class="text-xs text-gray-600">Игр</p>
              </div>
              <div class="bg-gray-200/50 rounded p-2 text-center">
                <p class="text-2xl font-bold text-green-400">
                  {{ selectedTeam.won }}
                </p>
                <p class="text-xs text-gray-600">Побед</p>
              </div>
              <div class="bg-gray-200/50 rounded p-2 text-center">
                <p class="text-2xl font-bold text-yellow-300">
                  {{ selectedTeam.drawn }}
                </p>
                <p class="text-xs text-gray-600">Ничьих</p>
              </div>
              <div class="bg-gray-200/50 rounded p-2 text-center">
                <p class="text-2xl font-bold text-red-400">
                  {{ selectedTeam.lost }}
                </p>
                <p class="text-xs text-gray-600">Поражений</p>
              </div>
            </div>

            <!-- Голы -->
            <div class="grid grid-cols-3 gap-2">
              <div>
                <p class="text-sm text-gray-400">Забито</p>
                <p class="text-xl font-bold text-green-400">
                  {{ selectedTeam.goalsFor }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-400">Пропущено</p>
                <p class="text-xl font-bold text-red-400">
                  {{ selectedTeam.goalsAgainst }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-400">Разница</p>
                <p class="text-xl font-bold text-gray-700">
                  {{ selectedTeam.goalsFor - selectedTeam.goalsAgainst }}
                </p>
              </div>
            </div>

            <!-- Матчи команды -->
            <div>
              <h3 class="font-semibold text-white mb-2">Матчи</h3>
              <div class="space-y-2">
                <div
                  v-for="match in teamMatches"
                  :key="match.id"
                  class="bg-gray-200/50 rounded p-2 flex items-center justify-between"
                >
                  <div class="flex-1">
                    <p class="text-sm text-gray-700">
                      <span
                        :class="{
                          'font-bold': match.homeTeam.id === selectedTeam.id,
                        }"
                      >
                        {{ match.homeTeam.teamReference.shortName }}
                      </span>
                      <span class="text-gray-500 mx-2">vs</span>
                      <span
                        :class="{
                          'font-bold': match.awayTeam.id === selectedTeam.id,
                        }"
                      >
                        {{ match.awayTeam.teamReference.shortName }}
                      </span>
                    </p>
                  </div>
                  <div
                    v-if="match.isPlayed"
                    class="text-sm font-bold text-yellow-400"
                  >
                    {{ match.homeScore }} : {{ match.awayScore }}
                  </div>
                  <div v-else class="text-xs text-gray-500">Не сыгран</div>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
<script setup lang="ts">
import type { PublicUser } from "~~/types";

// Проверяем авторизацию (но не блокируем просмотр)
const { data: user } = await useFetch<PublicUser>("/api/auth/me");

// Получаем текущий сезон
const { data: currentSeason } = await useFetch("/api/seasons/current");

// Сортируем команды по очкам
const sortedTeams = computed(() => {
  if (!currentSeason.value?.teams) return [];

  return [...currentSeason.value.teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
});

const statusText = computed(() => {
  const status = currentSeason.value?.status;
  const texts: Record<string, string> = {
    SETUP: "Настройка",
    ACTIVE: "Активен",
    FINISHED: "Завершён",
  };
  return texts[status || ""] || status;
});

// Модальное окно команды
const showTeamModal = ref(false);
const selectedTeam = ref<any>(null);

// Матчи выбранной команды
const teamMatches = computed(() => {
  if (!selectedTeam.value || !currentSeason.value?.matches) return [];
  return currentSeason.value.matches.filter(
    (m: any) =>
      m.homeTeam.id === selectedTeam.value.id ||
      m.awayTeam.id === selectedTeam.value.id,
  );
});

function showTeamDetails(team: any) {
  selectedTeam.value = team;
  showTeamModal.value = true;
}
</script>
