<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-white">🏆 Все сезоны</h1>

    <div v-if="pending" class="text-center py-8 text-gray-400">Загрузка...</div>

    <div v-else-if="!seasons?.length" class="text-center py-8 text-gray-400">
      Нет сезонов
    </div>

    <div v-else class="grid gap-4">
      <UCard
        v-for="season in seasons"
        :key="season.id"
        class="bg-gray-800/30 cursor-pointer"
        @click="navigateTo(`/seasons/${season.id}`)"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-xl font-bold text-white">{{ season.name }}</h3>
            <div class="flex gap-4 mt-2 text-sm text-gray-400">
              <span>👥 {{ season._count?.teams || 0 }} команд</span>
              <span>⚽ {{ season._count?.matches || 0 }} матчей</span>
              <span
                >🔄 {{ season.roundsCount }}
                {{ season.roundsCount === 1 ? "круг" : "круга" }}</span
              >
            </div>
          </div>

          <UBadge :color="statusColor(season.status)" size="lg">
            {{ statusText(season.status) }}
          </UBadge>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Season {
  id: number;
  name: string;
  roundsCount: number;
  status: string;
  _count?: {
    teams: number;
    matches: number;
  };
}

const { data: seasons, pending } = await useFetch<Season[]>("/api/seasons/all");

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
