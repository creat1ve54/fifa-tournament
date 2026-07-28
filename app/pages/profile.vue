<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-white">Мой профиль</h1>

    <UCard>
      <div class="space-y-4">
        <div>
          <p class="text-sm text-gray-500">Логин</p>
          <p class="text-lg font-medium text-gray-900">
            {{ authStore.user?.username }}
          </p>
        </div>

        <div>
          <p class="text-sm text-gray-500">Ник в FIFA</p>
          <p class="text-lg font-medium text-gray-900">
            {{ authStore.user?.fifaNickname }}
          </p>
        </div>

        <!-- НОВАЯ СЕКЦИЯ: EMAIL -->
        <div class="pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-500 mb-2">Email</p>

          <!-- Режим просмотра -->
          <div v-if="!isEditingEmail" class="flex items-center justify-between">
            <div>
              <p class="text-lg font-medium text-gray-900">
                {{ authStore.user?.email || "Не указан" }}
              </p>
              <p v-if="authStore.user?.email" class="text-sm mt-1">
                <span
                  v-if="authStore.user.isEmailVerified"
                  class="text-green-600"
                >
                  ✅ Подтвержден
                </span>
                <span v-else class="text-yellow-600"> ⚠️ Не подтвержден </span>
              </p>
            </div>
            <UButton @click="startEditEmail" size="sm"> Изменить </UButton>
          </div>

          <!-- Режим редактирования -->
          <div v-else class="space-y-2">
            <UInput
              v-model="newEmail"
              type="email"
              placeholder="example@mail.ru"
              class="w-full"
            />
            <div class="flex gap-2">
              <UButton @click="saveEmail" :loading="savingEmail" size="sm">
                Сохранить
              </UButton>
              <UButton @click="cancelEditEmail" size="sm"> Отмена </UButton>
            </div>
            <p v-if="emailMessage" :class="emailMessageClass" class="text-sm">
              {{ emailMessage }}
            </p>
          </div>
        </div>
        <!-- КОНЕЦ СЕКЦИИ EMAIL -->

        <div v-if="currentTeam" class="pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-500">Текущая команда</p>
          <div class="flex items-center gap-3 mt-1">
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
        </div>
      </div>
    </UCard>

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
          class="bg-gray-200/50 rounded p-3 flex items-center justify-between cursor-pointer hover:bg-gray-200"
          @click="navigateTo(`/seasons/${result.season.id}`)"
        >
          <div>
            <p class="font-medium text-gray-900">{{ result.season.name }}</p>
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const authStore = useAuthStore();

const userId = authStore.user!.id;

const { data: currentTeam } = await useAsyncData(`current-team-${userId}`, () =>
  $fetch(`/api/users/${userId}/current-team`),
);

const { data: history } = await useAsyncData(`history-${userId}`, () =>
  $fetch(`/api/users/${userId}/history`),
);

// Логика для email
const isEditingEmail = ref(false);
const newEmail = ref("");
const savingEmail = ref(false);
const emailMessage = ref("");
const emailMessageClass = ref("");

function startEditEmail() {
  newEmail.value = authStore.user?.email || "";
  isEditingEmail.value = true;
  emailMessage.value = "";
}

function cancelEditEmail() {
  isEditingEmail.value = false;
  newEmail.value = "";
  emailMessage.value = "";
}

async function saveEmail() {
  if (!newEmail.value || !newEmail.value.includes("@")) {
    emailMessage.value = "Введите корректный email";
    emailMessageClass.value = "text-red-600";
    return;
  }

  savingEmail.value = true;
  emailMessage.value = "";

  try {
    await $fetch("/api/user/update-email", {
      method: "POST",
      body: { email: newEmail.value },
    });

    emailMessage.value = "✅ На новый email отправлено письмо с подтверждением";
    emailMessageClass.value = "text-green-600";
    isEditingEmail.value = false;

    // Обновляем данные пользователя в store
    await authStore.loadUser();
  } catch (err: any) {
    emailMessage.value = err.data?.message || "Ошибка при сохранении email";
    emailMessageClass.value = "text-red-600";
  } finally {
    savingEmail.value = false;
  }
}
</script>
