<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-white">🏆 Общий рейтинг</h1>

    <UCard>
      <div v-if="pending" class="text-center py-8 text-gray-400">
        Загрузка...
      </div>

      <div v-else-if="!ranking?.length" class="text-center py-8 text-gray-400">
        Нет участников
      </div>

      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-gray-700 text-left">
            <th class="py-3 px-2 text-gray-700 font-semibold">#</th>
            <th class="py-3 px-2 text-gray-700 font-semibold">Игрок</th>
            <th class="py-3 px-2 text-gray-700 font-semibold text-center">
              Сезонов
            </th>
            <th class="py-3 px-2 text-gray-700 font-semibold text-center">
              Очки
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="player in ranking"
            :key="player.id"
            class="border-b border-gray-800 hover:bg-gray-700/30 transition-colors cursor-pointer"
            @click="navigateTo(`/users/${player.id}`)"
          >
            <td class="py-3 px-2">
              <span
                class="font-bold"
                :class="{
                  'text-yellow-400 text-lg': player.place === 1,
                  'text-gray-300': player.place === 2,
                  'text-orange-400': player.place === 3,
                  'text-gray-400': player.place > 3,
                }"
              >
                {{ player.place === 1 ? "🥇" : "" }}
                {{ player.place === 2 ? "🥈" : "" }}
                {{ player.place === 3 ? "🥉" : "" }}
                {{ player.place > 3 ? player.place : "" }}
              </span>
            </td>
            <td class="py-3 px-2">
              <div>
                <p class="font-medium text-gray-900">
                  {{ player.fifaNickname }}
                </p>
                <p class="text-sm text-gray-500">{{ player.username }}</p>
              </div>
            </td>
            <td class="py-3 px-2 text-center text-gray-700">
              {{ player.seasonsPlayed }}
            </td>
            <td class="py-3 px-2 text-center font-bold text-gray-400">
              {{ player.totalPoints }}
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>
  </div>
</template>

<script setup lang="ts">
interface RankingPlayer {
  id: number;
  username: string;
  fifaNickname: string;
  totalPoints: number;
  seasonsPlayed: number;
  place: number;
}

const { data: ranking, pending } = await useFetch<RankingPlayer[]>(
  "/api/users/ranking",
);
</script>
