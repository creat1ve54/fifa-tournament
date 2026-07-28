<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-900 text-white"
  >
    <div class="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
      <h1 class="text-2xl font-bold mb-6 text-center">Новый пароль</h1>

      <div v-if="status === 'success'" class="text-center text-green-400">
        <p class="text-xl mb-4">✅ Пароль успешно изменен!</p>
        <NuxtLink to="/login" class="text-blue-400 underline"
          >Войти с новым паролем</NuxtLink
        >
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm mb-1">Новый пароль</label>
          <input
            v-model="newPassword"
            type="password"
            required
            class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm mb-1">Повторите пароль</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div v-if="error" class="text-red-400 text-sm">{{ error }}</div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
        >
          {{ isLoading ? "Сохранение..." : "Сохранить новый пароль" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const newPassword = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const error = ref("");
const status = ref("form"); // form, success

async function handleSubmit() {
  if (newPassword.value !== confirmPassword.value) {
    error.value = "Пароли не совпадают";
    return;
  }
  if (newPassword.value.length < 6) {
    error.value = "Пароль должен содержать минимум 6 символов";
    return;
  }

  isLoading.value = true;
  error.value = "";

  try {
    await $fetch("/api/auth/reset-password", {
      method: "POST",
      body: {
        token: route.query.token,
        newPassword: newPassword.value,
      },
    });
    status.value = "success";
  } catch (err) {
    error.value =
      err.data?.message ||
      "Ошибка при смене пароля. Возможно, ссылка устарела.";
  } finally {
    isLoading.value = false;
  }
}
</script>
