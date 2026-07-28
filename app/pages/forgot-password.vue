<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md space-y-6">
      <h1 class="text-3xl font-bold text-white text-center">🎮 FIFA Турнир</h1>

      <!-- Сообщение об успехе -->
      <UCard v-if="isSuccess">
        <template #header>
          <h2 class="text-xl font-bold text-center text-green-500">
            ✅ Письмо отправлено!
          </h2>
        </template>
        <div class="text-center space-y-4 py-4">
          <p class="text-gray-300">
            Если аккаунт с этим email существует, мы отправили инструкцию по
            восстановлению пароля.
          </p>
          <p class="text-sm text-gray-400">
            Проверьте папку "Входящие" или "Спам".
          </p>
          <UButton to="/login" block> Вернуться ко входу </UButton>
        </div>
      </UCard>

      <!-- Форма запроса сброса пароля -->
      <UCard v-else>
        <template #header>
          <h2 class="text-xl font-bold text-center text-gray-700">
            Восстановление пароля
          </h2>
        </template>

        <form @submit.prevent="handleForgot" class="space-y-4">
          <UFormGroup label="Email, привязанный к аккаунту" required>
            <UInput
              v-model="email"
              type="email"
              placeholder="example@mail.ru"
              class="w-full"
            />
          </UFormGroup>

          <UButton type="submit" block :loading="loading" class="mt-4">
            Отправить инструкцию
          </UButton>

          <p v-if="error" class="text-red-400 text-sm text-center">
            {{ error }}
          </p>

          <p class="text-center">
            <NuxtLink to="/login" class="text-blue-400 hover:underline text-sm">
              ← Вернуться ко входу
            </NuxtLink>
          </p>
        </form>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref("");
const loading = ref(false);
const error = ref("");
const isSuccess = ref(false);

const toast = useToast();

async function handleForgot() {
  loading.value = true;
  error.value = "";

  try {
    await $fetch("/api/auth/forgot-password", {
      method: "POST",
      body: { email: email.value },
    });
    toast.add({
      title: " Письмо отправлено",
      description: `Если аккаунт с email ${email.value} существует, мы отправили инструкцию по восстановлению пароля.`,
      color: "success",
    });

    // Всегда показываем успех (защита от перебора email)
    isSuccess.value = true;
  } catch (err: any) {
    error.value = err.data?.message || "Ошибка при отправке";

    toast.add({
      title: "❌ Ошибка",
      description: error.value,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>
