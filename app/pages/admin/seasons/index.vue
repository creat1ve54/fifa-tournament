<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-white">🏆 Сезоны</h1>
      <div class="flex gap-2">
        <NuxtLink to="/admin">
          <UButton color="primary" variant="ghost">← Назад</UButton>
        </NuxtLink>
        <UButton @click="showCreateModal = true" color="primary">
          + Создать сезон
        </UButton>
      </div>
    </div>

    <div v-if="pending" class="text-center py-8 text-gray-400">Загрузка...</div>

    <div
      v-else-if="seasons?.length === 0"
      class="text-center py-8 text-gray-400"
    >
      Нет сезонов. Создайте первый!
    </div>

    <div v-else class="grid gap-4">
      <UCard v-for="season in seasons" :key="season.id">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-900">{{ season.name }}</h3>
            <div class="flex gap-4 mt-2 text-sm text-gray-400">
              <span>
                🔄 {{ season.roundsCount }}
                {{ season.roundsCount === 1 ? "круг" : "круга" }}
              </span>
              <UBadge :color="statusColor(season.status)" size="xs">
                {{ statusText(season.status) }}
              </UBadge>
            </div>
          </div>

          <div class="flex gap-2">
            <NuxtLink :to="`/admin/seasons/${season.id}`">
              <UButton color="info" size="sm">Управление</UButton>
            </NuxtLink>
            <UButton
              @click="deleteSeason(season.id)"
              color="secondary"
              variant="ghost"
              size="sm"
            >
              Удалить
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Модальное окно создания сезона -->
    <UModal v-model:open="showCreateModal" title="Создать новый сезон">
      <template #body>
        <form @submit.prevent="createSeason" class="space-y-4">
          <UFormField label="Название сезона" required>
            <UInput v-model="newSeason.name" placeholder="FIFA Cup 2025/1" />
          </UFormField>

          <UFormField label="Количество кругов" required>
            <USelect
              v-model="newSeason.roundsCount"
              :items="roundsOptions"
              value-key="value"
            />
          </UFormField>

          <UFormField label="Генерация календаря" required>
            <USelect
              v-model="newSeason.calendarGenerationType"
              :items="calendarOptions"
              value-key="value"
            />
          </UFormField>

          <div class="flex gap-2 justify-end">
            <UButton
              @click="showCreateModal = false"
              color="error"
              variant="ghost"
            >
              Отмена
            </UButton>
            <UButton type="submit" color="primary" :loading="creating">
              Создать
            </UButton>
          </div>

          <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
        </form>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { PublicUser, Season } from "~~/types";

const { data: user } = await useFetch<PublicUser>("/api/auth/me");

if (!user.value || user.value.role !== "ADMIN") {
  navigateTo("/");
}

const {
  data: seasons,
  pending,
  refresh,
} = await useFetch<Season[]>("/api/admin/seasons");

const showCreateModal = ref(false);
const creating = ref(false);
const error = ref("");

const newSeason = reactive({
  name: "",
  roundsCount: 1,
  calendarGenerationType: "AUTO" as "AUTO" | "MANUAL",
});

// Правильные items для USelect (используется :items, а не :options)
const roundsOptions = [
  { label: "1 круг", value: 1 },
  { label: "2 круга", value: 2 },
];

const calendarOptions = [
  { label: "Автоматическая", value: "AUTO" },
  { label: "Ручная", value: "MANUAL" },
];

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

async function createSeason() {
  error.value = "";
  creating.value = true;

  try {
    await $fetch("/api/admin/seasons", {
      method: "POST",
      body: newSeason,
    });

    showCreateModal.value = false;
    newSeason.name = "";
    newSeason.roundsCount = 1;
    newSeason.calendarGenerationType = "AUTO";
    await refresh();
  } catch (err: any) {
    error.value = err.data?.message || "Ошибка создания";
  } finally {
    creating.value = false;
  }
}

async function deleteSeason(id: number) {
  if (!confirm("Удалить сезон? Все данные будут потеряны!")) return;

  try {
    await $fetch(`/api/admin/seasons/${id}`, { method: "DELETE" });
    await refresh();
  } catch (err: any) {
    alert(err.data?.message || "Ошибка удаления");
  }
}
</script>
