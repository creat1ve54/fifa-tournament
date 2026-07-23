<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-white">📚 Справочник команд</h1>
      <NuxtLink to="/admin">
        <UButton color="primary" variant="ghost">← Назад</UButton>
      </NuxtLink>
    </div>

    <!-- Форма добавления -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-black">Добавить команду</h2>
      </template>

      <form @submit.prevent="addTeam" class="flex gap-2">
        <UInput
          v-model="newTeam.name"
          placeholder="Название (Ливерпуль)"
          class="flex-1"
        />
        <UInput
          v-model="newTeam.shortName"
          placeholder="Код (LIV)"
          class="w-24 uppercase"
          maxlength="5"
        />
        <UButton type="submit" :loading="adding">Добавить</UButton>
      </form>

      <p v-if="error" class="text-red-400 text-sm mt-2">{{ error }}</p>
    </UCard>

    <!-- Список команд -->
    <UCard>
      <template #header>
        <h2 class="font-semibold text-black">
          Все команды ({{ teams?.length || 0 }})
        </h2>
      </template>

      <div v-if="pending" class="text-center py-8 text-gray-400">
        Загрузка...
      </div>

      <div
        v-else-if="teams?.length === 0"
        class="text-center py-8 text-gray-400"
      >
        Нет команд. Добавьте первую!
      </div>

      <div v-else class="divide-y divide-gray-800">
        <div
          v-for="team in teams"
          :key="team.id"
          class="py-3 flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-sm font-bold"
            >
              {{ team.shortName }}
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ team.name }}</p>
              <p class="text-xs text-gray-400">{{ team.shortName }}</p>
            </div>
          </div>

          <UButton
            @click="deleteTeam(team.id)"
            color="error"
            variant="ghost"
            size="xs"
            :loading="deletingId === team.id"
          >
            Удалить
          </UButton>
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

const { data: teams, pending, refresh } = await useFetch("/api/admin/teams");

const newTeam = reactive({ name: "", shortName: "" });
const adding = ref(false);
const deletingId = ref<number | null>(null);
const error = ref("");

async function addTeam() {
  error.value = "";
  adding.value = true;
  try {
    await $fetch("/api/admin/teams", {
      method: "POST",
      body: newTeam,
    });
    newTeam.name = "";
    newTeam.shortName = "";
    await refresh();
  } catch (err: any) {
    error.value = err.data?.message || "Ошибка";
  } finally {
    adding.value = false;
  }
}

async function deleteTeam(id: number) {
  if (!confirm("Удалить команду?")) return;
  deletingId.value = id;
  try {
    await $fetch(`/api/admin/teams/${id}`, { method: "DELETE" });
    await refresh();
  } finally {
    deletingId.value = null;
  }
}
</script>
