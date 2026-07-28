<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <NuxtLink
          to="/admin/seasons"
          class="text-blue-400 hover:underline text-sm"
        >
          ← Назад к сезонам
        </NuxtLink>
        <h1 class="text-3xl font-bold mt-2 text-white">
          {{ season?.name }}
        </h1>
        <UBadge :color="statusColor(season?.status)" class="mt-2">
          {{ statusText(season?.status) }}
        </UBadge>
      </div>

      <div class="flex gap-2">
        <!-- Кнопка генерации только для AUTO -->
        <UButton
          v-if="
            season?.status === 'SETUP' &&
            season?.calendarGenerationType === 'AUTO'
          "
          @click="generateCalendar"
          color="secondary"
          :loading="generating"
        >
          🎲 Сгенерировать календарь
        </UButton>
        <UButton
          v-if="season?.status === 'SETUP' && season?.matches?.length"
          @click="activateSeason"
          color="primary"
          :loading="activating"
        >
          ▶️ Активировать
        </UButton>
        <UButton
          v-if="season?.status === 'ACTIVE'"
          @click="finishSeason"
          color="error"
          :loading="finishing"
        >
          🏁 Завершить сезон
        </UButton>
      </div>
    </div>

    <!-- Добавление команды (только в SETUP) -->
    <UCard v-if="season?.status === 'SETUP'">
      <template #header>
        <h2 class="font-semibold text-gray-900 dark:text-white">
          Добавить команду
        </h2>
      </template>

      <form @submit.prevent="addTeam" class="flex gap-2 items-end">
        <UFormField label="Команда" class="flex-1">
          <USelect
            v-model="selectedTeamId"
            :items="availableTeamsOptions"
            placeholder="Выберите команду"
            value-key="value"
            :disabled="!availableTeams?.length"
          />
        </UFormField>
        <UFormField label="Участник" class="flex-1">
          <USelect
            v-model="selectedUserId"
            :items="availableUsersOptions"
            placeholder="Назначить участника"
            value-key="value"
            :disabled="!availableUsers?.length"
          />
        </UFormField>
        <UButton
          type="submit"
          :loading="adding"
          :disabled="!availableTeams?.length"
        >
          Добавить
        </UButton>
      </form>

      <p v-if="!availableTeams?.length" class="text-yellow-400 text-sm mt-2">
        ⚠️ Все команды уже добавлены в сезон или в справочнике нет команд
      </p>
    </UCard>

    <!-- Ручное создание матча (только для MANUAL) -->
    <UCard
      v-if="
        season?.status === 'SETUP' &&
        season?.calendarGenerationType === 'MANUAL'
      "
    >
      <template #header>
        <h2 class="font-semibold text-gray-900 dark:text-white">
          ✍️ Создать матч вручную
        </h2>
      </template>

      <form
        @submit.prevent="createMatch"
        class="flex gap-2 items-end flex-wrap"
      >
        <UFormField label="Тур" class="w-32">
          <UInput
            v-model.number="newMatchRound"
            type="number"
            min="1"
            placeholder="1"
          />
        </UFormField>
        <UFormField label="Хозяева" class="flex-1 min-w-[200px]">
          <USelect
            v-model="newMatchHomeId"
            :items="seasonTeamsOptions"
            placeholder="Выберите команду"
            value-key="value"
          />
        </UFormField>
        <span class="text-2xl font-bold pb-2">vs</span>
        <UFormField label="Гости" class="flex-1 min-w-[200px]">
          <USelect
            v-model="newMatchAwayId"
            :items="seasonTeamsOptions"
            placeholder="Выберите команду"
            value-key="value"
          />
        </UFormField>
        <UButton
          type="submit"
          :loading="creatingMatch"
          :disabled="!newMatchHomeId || !newMatchAwayId || !newMatchRound"
        >
          Создать матч
        </UButton>
      </form>

      <p v-if="matchError" class="text-red-400 text-sm mt-2">
        {{ matchError }}
      </p>
    </UCard>

    <!-- Список команд -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-gray-900">
          Команды ({{ season?.teams?.length || 0 }})
        </h2>
      </template>

      <div v-if="!season?.teams?.length" class="text-center py-8 text-gray-400">
        Нет команд
      </div>

      <div v-else class="divide-y divide-gray-800">
        <div
          v-for="seasonTeam in season?.teams"
          :key="seasonTeam.id"
          class="py-3 flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-sm font-bold text-white"
            >
              {{ seasonTeam.teamReference.shortName }}
            </div>
            <div>
              <p class="font-medium text-gray-900">
                {{ seasonTeam.teamReference.name }}
              </p>
              <p v-if="seasonTeam.user" class="text-sm text-gray-400">
                👤 {{ seasonTeam.user.fifaNickname }}
              </p>
              <p v-else class="text-sm text-gray-500 italic">Не назначен</p>
            </div>
          </div>

          <div v-if="season?.status === 'SETUP'" class="flex gap-2">
            <UButton
              @click="openAssignModal(seasonTeam)"
              color="primary"
              variant="ghost"
              size="xs"
            >
              Назначить
            </UButton>
            <UButton
              @click="removeTeam(seasonTeam.id)"
              color="error"
              variant="ghost"
              size="xs"
            >
              Удалить
            </UButton>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Календарь матчей -->
    <UCard v-if="season?.matches?.length">
      <template #header>
        <h2 class="font-semibold text-gray-900 dark:text-white">
          Календарь матчей
        </h2>
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
              class="bg-gray-200/50 rounded p-3 flex gap-2 items-center justify-between"
            >
              <div class="flex items-center gap-2 flex-1">
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ match.homeTeam.teamReference.shortName }}
                </span>
                <span class="text-gray-500">vs</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ match.awayTeam.teamReference.shortName }}
                </span>
              </div>

              <div
                v-if="match.isPlayed"
                class="text-lg font-bold text-gray-700"
              >
                {{ match.homeScore }} : {{ match.awayScore }}
              </div>

              <div class="flex gap-2">
                <UButton
                  v-if="season?.status === 'ACTIVE'"
                  @click="openScoreModal(match)"
                  color="primary"
                  size="xs"
                >
                  {{ match.isPlayed ? "Изменить" : "Ввести счёт" }}
                </UButton>
                <UButton
                  v-if="
                    season?.status === 'SETUP' &&
                    season?.calendarGenerationType === 'MANUAL'
                  "
                  @click="deleteMatch(match.id)"
                  color="error"
                  variant="ghost"
                  size="xs"
                >
                  Удалить
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Модальное окно назначения -->
    <UModal v-model:open="showAssignModal">
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              Назначить участника
            </h2>
          </template>
          <form @submit.prevent="assignUser" class="space-y-4">
            <UFormField label="Участник">
              <USelect
                v-model="assignUserId"
                :items="availableUsersForAssign"
                placeholder="Выберите участника"
                value-key="value"
              />
            </UFormField>
            <div class="flex gap-2 justify-end">
              <UButton
                @click="showAssignModal = false"
                color="error"
                variant="ghost"
              >
                Отмена
              </UButton>
              <UButton type="submit" color="primary" :loading="assigning">
                Назначить
              </UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>

    <!-- Модальное окно ввода счёта -->
    <UModal v-model:open="showScoreModal">
      <template #content>
        <UCard>
          <template #header>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                Ввести счёт
              </h2>
              <p class="text-sm text-gray-400">
                {{ selectedMatch?.homeTeam.teamReference.name }} vs
                {{ selectedMatch?.awayTeam.teamReference.name }}
              </p>
            </div>
          </template>
          <form @submit.prevent="saveScore" class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <label class="text-sm text-gray-400 mr-1">
                  {{ selectedMatch?.homeTeam.teamReference.shortName }}
                </label>
                <UInput
                  v-model.number="homeScore"
                  type="number"
                  min="0"
                  class="mt-1"
                />
              </div>
              <span class="text-2xl font-bold">:</span>
              <div class="flex-1">
                <label class="text-sm text-gray-400 mr-1">
                  {{ selectedMatch?.awayTeam.teamReference.shortName }}
                </label>
                <UInput
                  v-model.number="awayScore"
                  type="number"
                  min="0"
                  class="mt-1"
                />
              </div>
            </div>
            <div class="flex gap-2 justify-end">
              <UButton
                @click="showScoreModal = false"
                color="error"
                variant="ghost"
              >
                Отмена
              </UButton>
              <UButton type="submit" color="primary" :loading="savingScore">
                Сохранить
              </UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Season, PublicUser } from "~~/types";

const route = useRoute();
const seasonId = Number(route.params.id);

const { data: user } = await useFetch<PublicUser>("/api/auth/me");
if (!user.value || user.value.role !== "ADMIN") {
  navigateTo("/");
}

const { data: season, refresh } = await useFetch<Season>(
  `/api/admin/seasons/${seasonId}`,
);
const { data: availableTeams, refresh: refreshTeams } = await useFetch<any[]>(
  `/api/admin/seasons/${seasonId}/available-teams`,
);
const { data: availableUsers, refresh: refreshUsers } = await useFetch<any[]>(
  `/api/admin/seasons/${seasonId}/available-users`,
);

const selectedTeamId = ref<number | null>(null);
const selectedUserId = ref<number | null>(null);
const adding = ref(false);
const error = ref("");

const showAssignModal = ref(false);
const selectedSeasonTeam = ref<any>(null);
const assignUserId = ref<number | null>(null);
const assigning = ref(false);

const showScoreModal = ref(false);
const selectedMatch = ref<any>(null);
const homeScore = ref(0);
const awayScore = ref(0);
const savingScore = ref(false);

const generating = ref(false);
const activating = ref(false);
const finishing = ref(false);

// Для ручного создания матча
const newMatchRound = ref<number>(1);
const newMatchHomeId = ref<number | null>(null);
const newMatchAwayId = ref<number | null>(null);
const creatingMatch = ref(false);
const matchError = ref("");

// Формат items: { label, value }
const availableTeamsOptions = computed(() => {
  if (!availableTeams.value?.length) {
    return [{ label: "Нет доступных команд", value: null, disabled: true }];
  }
  return availableTeams.value.map((t: any) => ({
    label: `${t.name} (${t.shortName})`,
    value: t.id,
  }));
});

const availableUsersOptions = computed(() => {
  if (!availableUsers.value?.length) {
    return [{ label: "Нет доступных участников", value: null, disabled: true }];
  }
  return availableUsers.value.map((u: any) => ({
    label: `${u.fifaNickname} (${u.username})`,
    value: u.id,
  }));
});

const availableUsersForAssign = computed(() => {
  const base = [{ label: "Не назначен", value: null }];
  if (!availableUsers.value?.length) {
    return [
      ...base,
      { label: "Нет доступных участников", value: null, disabled: true },
    ];
  }
  return [
    ...base,
    ...availableUsers.value.map((u: any) => ({
      label: `${u.fifaNickname} (${u.username})`,
      value: u.id,
    })),
  ];
});

// Опции команд в сезоне (для выбора в матче)
const seasonTeamsOptions = computed(() => {
  if (!season.value?.teams?.length) {
    return [{ label: "Нет команд в сезоне", value: null, disabled: true }];
  }
  return season.value.teams.map((st: any) => ({
    label: `${st.teamReference.name} (${st.teamReference.shortName})`,
    value: st.id,
  }));
});

const rounds = computed(() => {
  if (!season.value?.matches || !Array.isArray(season.value.matches)) return [];

  const byRound: Record<number, any[]> = {};

  season.value.matches?.forEach((match) => {
    if (!byRound[match.round]) byRound[match.round] = [];
    byRound[match.round]!.push(match);
  });

  return Object.entries(byRound)
    .map(([round, matches]) => ({ number: Number(round), matches }))
    .sort((a, b) => a.number - b.number);
});

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
  switch (status) {
    case "SETUP":
      return "Настройка";
    case "ACTIVE":
      return "Активен";
    case "FINISHED":
      return "Завершён";
    default:
      return status || "";
  }
}

async function addTeam() {
  if (!selectedTeamId.value) {
    error.value = "Выберите команду";
    return;
  }
  error.value = "";
  adding.value = true;
  try {
    await $fetch(`/api/admin/seasons/${seasonId}/teams`, {
      method: "POST",
      body: {
        teamReferenceId: selectedTeamId.value,
        userId: selectedUserId.value,
      },
    });
    selectedTeamId.value = null;
    selectedUserId.value = null;
    await refresh();
    await refreshUsers();
    await refreshTeams();
  } catch (err: any) {
    error.value = err.data?.message || "Ошибка";
  } finally {
    adding.value = false;
  }
}

function openAssignModal(st: any) {
  selectedSeasonTeam.value = st;
  assignUserId.value = st.userId;
  showAssignModal.value = true;
}

async function assignUser() {
  if (!selectedSeasonTeam.value) return;
  assigning.value = true;
  try {
    await $fetch(`/api/admin/season-teams/${selectedSeasonTeam.value.id}`, {
      method: "PATCH",
      body: { userId: assignUserId.value },
    });
    showAssignModal.value = false;
    await refresh();
    await refreshUsers();
  } catch (err: any) {
    alert(err.data?.message || "Ошибка");
  } finally {
    assigning.value = false;
  }
}

async function removeTeam(id: number) {
  if (!confirm("Удалить команду?")) return;
  try {
    await $fetch(`/api/admin/season-teams/${id}`, { method: "DELETE" });
    await refresh();
    await refreshUsers();
    await refreshTeams();
  } catch (err: any) {
    alert(err.data?.message || "Ошибка");
  }
}

async function generateCalendar() {
  if (!confirm("Сгенерировать календарь?")) return;
  generating.value = true;
  try {
    await $fetch(`/api/admin/seasons/${seasonId}/generate-calendar`, {
      method: "POST",
    });
    await refresh();
  } catch (err: any) {
    alert(err.data?.message || "Ошибка");
  } finally {
    generating.value = false;
  }
}

async function activateSeason() {
  if (!confirm("Активировать сезон?")) return;
  activating.value = true;
  try {
    await $fetch(`/api/admin/seasons/${seasonId}/activate`, { method: "POST" });
    await refresh();
  } catch (err: any) {
    alert(err.data?.message || "Ошибка");
  } finally {
    activating.value = false;
  }
}

async function finishSeason() {
  if (!confirm("Завершить сезон и рассчитать рейтинг?")) return;
  finishing.value = true;
  try {
    await $fetch(`/api/admin/seasons/${seasonId}/finish`, { method: "POST" });
    await refresh();
  } catch (err: any) {
    alert(err.data?.message || "Ошибка");
  } finally {
    finishing.value = false;
  }
}

// Создание матча вручную
async function createMatch() {
  if (!newMatchHomeId.value || !newMatchAwayId.value || !newMatchRound.value) {
    matchError.value = "Заполните все поля";
    return;
  }
  if (newMatchHomeId.value === newMatchAwayId.value) {
    matchError.value = "Команды должны быть разными";
    return;
  }

  matchError.value = "";
  creatingMatch.value = true;

  try {
    await $fetch(`/api/admin/seasons/${seasonId}/matches`, {
      method: "POST",
      body: {
        round: newMatchRound.value,
        homeTeamId: newMatchHomeId.value,
        awayTeamId: newMatchAwayId.value,
      },
    });

    newMatchHomeId.value = null;
    newMatchAwayId.value = null;
    await refresh();
  } catch (err: any) {
    matchError.value = err.data?.message || "Ошибка создания матча";
  } finally {
    creatingMatch.value = false;
  }
}

// Удаление матча
async function deleteMatch(matchId: number) {
  if (!confirm("Удалить матч?")) return;
  try {
    await $fetch(`/api/admin/matches/${matchId}`, { method: "DELETE" });
    await refresh();
  } catch (err: any) {
    alert(err.data?.message || "Ошибка удаления");
  }
}

function openScoreModal(match: any) {
  selectedMatch.value = match;
  homeScore.value = match.homeScore || 0;
  awayScore.value = match.awayScore || 0;
  showScoreModal.value = true;
}

async function saveScore() {
  if (!selectedMatch.value) return;
  savingScore.value = true;
  try {
    await $fetch(`/api/admin/matches/${selectedMatch.value.id}`, {
      method: "PATCH",
      body: { homeScore: homeScore.value, awayScore: awayScore.value },
    });
    showScoreModal.value = false;
    await refresh();
  } catch (err: any) {
    alert(err.data?.message || "Ошибка");
  } finally {
    savingScore.value = false;
  }
}
</script>
