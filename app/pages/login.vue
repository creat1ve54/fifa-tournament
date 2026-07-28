<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md space-y-6">
      <h1 class="text-3xl font-bold text-white text-center">🎮 FIFA Турнир</h1>

      <UCard>
        <template #header>
          <h2 class="text-xl font-bold text-center text-gray-700">Вход</h2>
        </template>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="flex flex-col gap-2">
            <UFormGroup label="Логин" required>
              <UInput
                v-model="form.username"
                placeholder="Ваш логин"
                class="w-full"
              />
            </UFormGroup>

            <UFormGroup label="Пароль" required>
              <UInput
                v-model="form.password"
                type="password"
                placeholder="Ваш пароль"
                class="w-full"
              />
            </UFormGroup>
          </div>

          <UButton type="submit" block :loading="loading"> Войти </UButton>

          <p v-if="error" class="text-red-400 text-sm text-center">
            {{ error }}
          </p>

          <p class="text-center">
            <NuxtLink
              to="/forgot-password"
              class="text-blue-400 hover:underline text-sm"
            >
              Забыли пароль?
            </NuxtLink>
          </p>

          <p class="text-gray-400 text-sm text-center">
            Нет аккаунта?
            <NuxtLink to="/register" class="text-blue-400 hover:underline"
              >Зарегистрироваться</NuxtLink
            >
          </p>
        </form>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();

const form = reactive({ username: "", password: "" });
const loading = ref(false);
const error = ref("");

async function handleLogin() {
  loading.value = true;
  error.value = "";

  try {
    await $fetch("/api/auth/login", { method: "POST", body: form });
    await authStore.loadUser();
    await navigateTo("/");
  } catch (err: any) {
    error.value = err.data?.message || "Ошибка входа";
  } finally {
    loading.value = false;
  }
}
</script>
