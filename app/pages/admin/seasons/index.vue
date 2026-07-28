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
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-900">{{ season.name }}</h3>
            <div class="flex gap-4 mt-2 text-sm text-gray-500">
              <span
                >🔄 {{ season.roundsCount }}
                {{ season.roundsCount === 1 ? "круг" : "круга" }}</span
              >

              <!-- ДОБАВЛЕНО: Выпадающий список для смены статуса -->
              <div class="flex items-center gap-2">
                <span>Статус:</span>
                <USelect
                  :model-value="season.status"
                  :items="statusOptions"
                  value-key="value"
                  label-key="label"
                  size="xs"
                  class="w-32"
                  @update:model-value="
                    (newStatus) => changeStatus(season.id, newStatus)
                  "
                />
              </div>
              <!-- КОНЕЦ ДОБАВЛЕННОГО -->
            </div>
          </div>

          <div class="flex gap-2">
            <NuxtLink :to="`/admin/seasons/${season.id}`">
              <UButton color="info" size="sm">Управление</UButton>
            </NuxtLink>
            <UButton
              @click="deleteSeason(season.id)"
              color="error"
              variant="ghost"
              size="sm"
            >
              Удалить
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Модальное окно создания сезона (без изменений) -->
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
              >Отмена</UButton
            >
            <UButton type="submit" color="primary" :loading="creating"
              >Создать</UButton
            >
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

const roundsOptions = [
  { label: "1 круг", value: 1 },
  { label: "2 круга", value: 2 },
];

const calendarOptions = [
  { label: "Автоматическая", value: "AUTO" },
  { label: "Ручная", value: "MANUAL" },
];

// Опции для смены статуса
const statusOptions = [
  { label: "⚙️ Настройка", value: "SETUP" },
  { label: "🟢 Активен", value: "ACTIVE" },
  { label: "🏁 Завершён", value: "FINISHED" },
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

// НОВАЯ ФУНКЦИЯ: Смена статуса сезона
async function changeStatus(seasonId: number, newStatus: string) {
  try {
    await $fetch(`/api/admin/seasons/${seasonId}/status`, {
      method: "PATCH",
      body: { status: newStatus },
    });
    // Обновляем список сезонов после успешного изменения
    await refresh();
  } catch (err: any) {
    alert(err.data?.message || "Ошибка изменения статуса");
    // В случае ошибки обновляем список, чтобы вернуть старый статус в UI
    await refresh();
  }
}

async function createSeason() {
  error.value = "";
  creating.value = true;
  try {
    await $fetch("/api/admin/seasons", { method: "POST", body: newSeason });
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
  if (
    !confirm(
      "Удалить сезон? Все данные (матчи, результаты) будут потеряны безвозвратно!",
    )
  )
    return;
  try {
    await $fetch(`/api/admin/seasons/${id}`, { method: "DELETE" });
    await refresh();
  } catch (err: any) {
    alert(err.data?.message || "Ошибка удаления");
  }
}
</script>
