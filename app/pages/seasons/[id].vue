<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <NuxtLink to="/seasons" class="text-blue-400 hover:underline text-sm">
        ← Назад к сезонам
      </NuxtLink>
    </div>

    <div v-if="!season" class="text-center py-8 text-gray-400">Загрузка...</div>

    <template v-else>
      <h1 class="text-3xl font-bold text-white">{{ season.name }}</h1>

      <UBadge :color="statusColor(season.status)" size="lg">
        {{ statusText(season.status) }}
      </UBadge>

      <!-- Турнирная таблица -->
      <UCard v-if="season.teams?.length">
        <template #header>
          <h2 class="font-semibold text-gray-700">📊 Турнирная таблица</h2>
        </template>

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
                  О
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(team, index) in sortedTeams"
                :key="team.id"
                class="border-b border-gray-800 hover:bg-gray-200/30 transition-colors cursor-pointer"
                @click="showTeamDetails(team)"
              >
                <td class="py-3 px-2">
                  <span class="font-bold text-gray-300">{{ index + 1 }}</span>
                </td>
                <td class="py-3 px-2">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-xs font-bold"
                    >
                      {{ team.teamReference.shortName }}
                    </div>
                    <span class="font-medium text-gray-700">{{
                      team.teamReference.name
                    }}</span>
                  </div>
                </td>
                <td class="py-3 px-2 text-gray-400">
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
                <td class="py-3 px-2 text-center font-bold text-yellow-400">
                  {{ team.points }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <!-- Матчи -->
      <UCard v-if="season.matches?.length">
        <template #header>
          <h2 class="font-semibold text-gray-700">🏟 Матчи</h2>
        </template>

        <div class="space-y-6">
          <div v-for="round in rounds" :key="round.number">
            <h3 class="text-lg font-bold mb-2 text-blue-400">
              Тур {{ round.number }}
            </h3>
            <div class="space-y-2">
              <div
                v-for="match in round.matches"
                :key="match.id"
                class="bg-gray-200/50 rounded p-3 flex items-center justify-between"
              >
                <div class="flex items-center gap-2 flex-1">
                  <span class="font-medium text-gray-700">{{
                    match.homeTeam.teamReference.shortName
                  }}</span>
                  <span class="text-gray-500">vs</span>
                  <span class="font-medium text-gray-700">{{
                    match.awayTeam.teamReference.shortName
                  }}</span>
                </div>
                <div
                  v-if="match.isPlayed"
                  class="text-lg font-bold text-yellow-400"
                >
                  {{ match.homeScore }} : {{ match.awayScore }}
                </div>
                <div v-else class="text-sm text-gray-500">Не сыгран</div>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </template>

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
const route = useRoute();
const seasonId = Number(route.params.id);

const { data: season } = await useFetch(`/api/seasons/${seasonId}`);

const showTeamModal = ref(false);
const selectedTeam = ref<any>(null);

const sortedTeams = computed(() => {
  if (!season.value?.teams) return [];
  return [...season.value.teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
});

const rounds = computed(() => {
  if (!season.value?.matches) return [];
  const byRound: Record<number, any[]> = {};
  for (const match of season.value.matches) {
    if (!byRound[match.round]) byRound[match.round] = [];
    byRound[match.round].push(match);
  }
  return Object.entries(byRound)
    .map(([round, matches]) => ({ number: Number(round), matches }))
    .sort((a, b) => a.number - b.number);
});

const teamMatches = computed(() => {
  if (!selectedTeam.value || !season.value?.matches) return [];
  return season.value.matches.filter(
    (m: any) =>
      m.homeTeam.id === selectedTeam.value.id ||
      m.awayTeam.id === selectedTeam.value.id,
  );
});

function showTeamDetails(team: any) {
  selectedTeam.value = team;
  showTeamModal.value = true;
}

function statusColor(status: string): "neutral" | "success" | "info" {
  return (
    {
      SETUP: "neutral",
      ACTIVE: "success",
      FINISHED: "info",
    }[status] || "neutral"
  );
}

function statusText(status: string): string {
  return (
    {
      SETUP: "Настройка",
      ACTIVE: "Активен",
      FINISHED: "Завершён",
    }[status] || status
  );
}
</script>
