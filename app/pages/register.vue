<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md space-y-6">
      <h1 class="text-3xl font-bold text-white text-center">🎮 FIFA Турнир</h1>

      <UCard>
        <template #header>
          <h2 class="text-xl font-bold text-center text-gray-700">
            Регистрация
          </h2>
        </template>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="flex flex-col gap-4">
            <UFormGroup label="Логин" required>
              <UInput
                v-model="form.username"
                placeholder="Ваш логин"
                class="w-full"
              />
            </UFormGroup>

            <UFormGroup label="Ник в FIFA" required>
              <UInput
                v-model="form.fifaNickname"
                placeholder="Ваш ник в FIFA"
                class="w-full"
              />
            </UFormGroup>

            <UFormGroup label="Email" required>
              <UInput
                v-model="form.email"
                type="email"
                placeholder="example@mail.ru"
                class="w-full"
              />
            </UFormGroup>

            <UFormGroup label="Пароль" required>
              <UInput
                v-model="form.password"
                type="password"
                placeholder="Минимум 6 символов"
                class="w-full"
              />
            </UFormGroup>
          </div>

          <UButton type="submit" block :loading="loading">
            Зарегистрироваться
          </UButton>

          <p v-if="error" class="text-red-400 text-sm text-center">
            {{ error }}
          </p>

          <p class="text-gray-400 text-sm text-center">
            Уже есть аккаунт?
            <NuxtLink to="/login" class="text-blue-400 hover:underline"
              >Войти</NuxtLink
            >
          </p>
        </form>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { refreshUser } = useAuth();
const toast = useToast();

const form = reactive({
  username: "",
  fifaNickname: "",
  email: "",
  password: "",
});
const loading = ref(false);
const error = ref("");

toast.add({
  title: "✅ Письмо отправлено!",
  description: `Инструкция по подтверждению отправлена на ${form.email}. Проверьте почту (и папку "Спам").`,
  color: "success",
});

async function handleRegister() {
  loading.value = true;
  error.value = "";

  try {
    await $fetch("/api/auth/register", { method: "POST", body: form });
    toast.add({
      title: "✅ Письмо отправлено!",
      description: `Инструкция по подтверждению отправлена на ${form.email}. Проверьте почту (и папку "Спам").`,
      color: "success",
    });

    await refreshUser();
    navigateTo("/");
  } catch (err: any) {
    error.value = err.data?.message || "Ошибка регистрации";
    toast.add({
      title: " Ошибка регистрации",
      description: error.value,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>
