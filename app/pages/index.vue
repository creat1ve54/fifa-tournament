<template>
  <div class="p-6">
    <div class="max-w-7xl mx-auto space-y-12">
      <!-- Заголовок -->
      <div class="text-center space-y-2">
        <h1 class="text-5xl font-bold text-white">⚽ GAZLiga</h1>
        <p class="text-xl text-blue-300">Активные турниры</p>
      </div>

      <!-- Если активных сезонов нет или они еще грузятся -->
      <div
        v-if="!activeSeasons || activeSeasons.length === 0"
        class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-12 border border-gray-700 text-center"
      >
        <p class="text-2xl text-gray-400 mb-4">🏆</p>
        <p class="text-xl text-gray-300">Нет активных сезонов</p>
        <p class="text-sm text-gray-500 mt-2">
          Администратор ещё не запустил ни один сезон
        </p>
      </div>

      <!-- ЦИКЛ ПО ВСЕМ АКТИВНЫМ СЕЗОНАМ -->
      <!-- ✅ Добавили || [] на случай, если activeSeasons === null -->
      <div
        v-for="season in activeSeasons || []"
        :key="season.id"
        class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 space-y-6"
      >
        <!-- Заголовок сезона -->
        <div
          class="flex items-center justify-between border-b border-gray-700 pb-4"
        >
          <h2 class="text-3xl font-bold text-white">🏆 {{ season.name }}</h2>
          <UBadge :color="statusColor(season.status)" size="lg">
            {{ statusText(season.status) }}
          </UBadge>
        </div>

        <!-- Статистика сезона -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gray-900/50 rounded p-4 text-center">
            <p class="text-3xl font-bold text-green-400">
              {{ season.teams?.length || 0 }}
            </p>
            <p class="text-sm text-gray-400">Команд</p>
          </div>
          <div class="bg-gray-900/50 rounded p-4 text-center">
            <p class="text-3xl font-bold text-blue-400">
              {{ season.matches?.length || 0 }}
            </p>
            <p class="text-sm text-gray-400">Матчей</p>
          </div>
          <div class="bg-gray-900/50 rounded p-4 text-center">
            <p class="text-3xl font-bold text-yellow-400">
              {{ season.roundsCount }}
            </p>
            <p class="text-sm text-gray-400">Кругов</p>
          </div>
          <div class="bg-gray-900/50 rounded p-4 text-center">
            <p class="text-3xl font-bold text-purple-400">
              {{ getSortedTeams(season)[0]?.points || 0 }}
            </p>
            <p class="text-sm text-gray-400">Очков у лидера</p>
          </div>
        </div>

        <!-- Турнирная таблица конкретного сезона -->
        <div v-if="season.teams && season.teams.length > 0">
          <h3 class="text-xl font-bold text-white mb-4">
            📊 Турнирная таблица
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-700 text-left">
                  <th class="py-3 px-2 text-gray-400 font-semibold">#</th>
                  <th class="py-3 px-2 text-gray-400 font-semibold">Команда</th>
                  <th class="py-3 px-2 text-gray-400 font-semibold">
                    Участник
                  </th>
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
                  v-for="(team, index) in getSortedTeams(season)"
                  :key="team.id"
                  class="border-b border-gray-800 hover:bg-gray-700/30 transition-colors cursor-pointer"
                  @click="showTeamDetails(season, team)"
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
        </div>
      </div>
    </div>

    <!-- Модальное окно команды -->
    <UModal v-model:open="showTeamModal">
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-900">
              {{ selectedTeam?.teamReference.name }}
              <span class="text-sm font-normal text-gray-500 block mt-1">
                Сезон: {{ selectedSeasonForModal?.name }}
              </span>
            </h2>
          </template>

          <div v-if="selectedTeam" class="space-y-6">
            <!-- Основная инфо -->
            <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p class="text-sm text-gray-500">Участник</p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ selectedTeam.user?.fifaNickname || "Не назначен" }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Всего очков</p>
                <p class="text-lg font-bold text-yellow-600">
                  {{ selectedTeam.points }}
                </p>
              </div>
            </div>

            <!-- Статистика -->
            <div class="grid grid-cols-4 gap-2 text-center">
              <div class="bg-gray-100 rounded p-2">
                <p class="text-xl font-bold text-gray-800">
                  {{ selectedTeam.played }}
                </p>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Игр</p>
              </div>
              <div class="bg-green-50 rounded p-2">
                <p class="text-xl font-bold text-green-600">
                  {{ selectedTeam.won }}
                </p>
                <p class="text-xs text-gray-500 uppercase tracking-wide">
                  Побед
                </p>
              </div>
              <div class="bg-yellow-50 rounded p-2">
                <p class="text-xl font-bold text-yellow-600">
                  {{ selectedTeam.drawn }}
                </p>
                <p class="text-xs text-gray-500 uppercase tracking-wide">
                  Ничьих
                </p>
              </div>
              <div class="bg-red-50 rounded p-2">
                <p class="text-xl font-bold text-red-600">
                  {{ selectedTeam.lost }}
                </p>
                <p class="text-xs text-gray-500 uppercase tracking-wide">
                  Поражений
                </p>
              </div>
            </div>

            <!-- Список матчей -->
            <div>
              <h3
                class="font-semibold text-gray-900 mb-3 flex items-center gap-2"
              >
                📅 Календарь матчей
              </h3>

              <div
                v-if="teamMatches.length === 0"
                class="text-center text-gray-500 py-4"
              >
                Матчи еще не сгенерированы
              </div>

              <div v-else class="space-y-3 max-h-80 overflow-y-auto pr-1">
                <div
                  v-for="match in teamMatches"
                  :key="match.id"
                  class="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                >
                  <div class="flex flex-col gap-1 flex-1">
                    <!-- Номер тура -->
                    <span
                      class="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded w-max"
                    >
                      Тур {{ match.round }}
                    </span>

                    <!-- Соперники -->
                    <p class="text-sm font-medium text-gray-800">
                      <span
                        :class="
                          match.homeTeam.id === selectedTeam?.id
                            ? 'text-blue-600 font-bold'
                            : 'text-gray-600'
                        "
                      >
                        {{ match.homeTeam.teamReference.shortName }}
                      </span>
                      <span class="text-gray-400 mx-1">:</span>
                      <span
                        :class="
                          match.awayTeam.id === selectedTeam?.id
                            ? 'text-blue-600 font-bold'
                            : 'text-gray-600'
                        "
                      >
                        {{ match.awayTeam.teamReference.shortName }}
                      </span>
                    </p>
                  </div>

                  <!-- Счет или статус -->
                  <div class="text-right min-w-[80px]">
                    <div
                      v-if="match.isPlayed"
                      class="text-xl font-bold text-gray-900"
                    >
                      {{ match.homeScore }} : {{ match.awayScore }}
                    </div>
                    <div
                      v-else
                      class="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded"
                    >
                      Не сыгран
                    </div>
                  </div>
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
import type { PublicUser, Season } from "~~/types";

const { data: user } = await useFetch<PublicUser>("/api/auth/me");

// ✅ Явно указываем тип Season[] и даем значение по умолчанию [], чтобы избежать null
const { data: activeSeasons } = await useFetch<Season[]>(
  "/api/seasons/active",
  {
    default: () => [],
  },
);

// ✅ Функция теперь явно проверяет season на null/undefined
function getSortedTeams(season: Season | null | undefined) {
  if (!season || !season.teams) return [];

  return [...season.teams].sort((a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
}

function statusColor(status?: string): "neutral" | "success" | "info" {
  switch (status) {
    case "SETUP":
      return "neutral";
    case "ACTIVE":
      return "success";
    case "FINISHED":
      return "info";
    default:
      return "neutral";
  }
}

function statusText(status?: string): string {
  const texts: Record<string, string> = {
    SETUP: "Настройка",
    ACTIVE: "Активен",
    FINISHED: "Завершён",
  };
  return texts[status || ""] || status || "Неизвестно";
}

const showTeamModal = ref(false);
const selectedTeam = ref<any>(null);
const selectedSeasonForModal = ref<Season | null>(null);

const teamMatches = computed(() => {
  if (!selectedTeam.value || !selectedSeasonForModal.value?.matches) return [];
  return selectedSeasonForModal.value.matches.filter(
    (m: any) =>
      m.homeTeam.id === selectedTeam.value.id ||
      m.awayTeam.id === selectedTeam.value.id,
  );
});

function showTeamDetails(season: Season, team: any) {
  selectedSeasonForModal.value = season;
  selectedTeam.value = team;
  showTeamModal.value = true;
}
</script>
