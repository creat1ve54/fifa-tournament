<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-900 text-white"
  >
    <div
      class="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center"
    >
      <h1 class="text-2xl font-bold mb-4">Подтверждение email</h1>

      <div v-if="status === 'loading'" class="text-blue-400">
        Проверяем токен...
      </div>

      <div v-else-if="status === 'success'" class="text-green-400">
        <p class="text-xl mb-4">✅ Email успешно подтвержден!</p>
        <NuxtLink to="/login" class="text-blue-400 underline"
          >Войти в аккаунт</NuxtLink
        >
      </div>

      <div v-else-if="status === 'error'" class="text-red-400">
        <p class="mb-4">❌ {{ errorMessage }}</p>
        <NuxtLink to="/" class="text-blue-400 underline">На главную</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const status = ref("loading"); // loading, success, error
const errorMessage = ref("");

onMounted(async () => {
  const token = route.query.token;

  if (!token) {
    status.value = "error";
    errorMessage.value = "Токен подтверждения не найден в ссылке.";
    return;
  }

  try {
    const response = await $fetch("/api/auth/verify-email", {
      method: "POST",
      body: { token },
    });

    if (response.success) {
      status.value = "success";
    } else {
      throw new Error(response.message || "Ошибка подтверждения");
    }
  } catch (error) {
    status.value = "error";
    errorMessage.value = error.data?.message || "Ссылка устарела или неверна.";
  }
});
</script>
