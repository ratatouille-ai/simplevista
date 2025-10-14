<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterView } from "vue-router";
import NavigationSidebar from "./components/NavigationSidebar.vue";
import RatatouilleChat from "./components/RatatouilleChat.vue";
import LoginForm from "./components/LoginForm.vue";
import FirstAdminForm from "./components/FirstAdminForm.vue";
import RatatouilleApi from "./api";

const isAuthenticated = ref(false);
const isCheckingAuth = ref(true);
const adminExists = ref(true); // Por defecto asumimos que existe

// SQL query para validar el usuario
const AUTH_VALIDATION_QUERY = (key: string) => `
  SELECT id, uuid, key, first_name, last_name, email, phone_number, role, is_active, created_at FROM admin_users WHERE key = '${key}' and is_active = true LIMIT 1
`;

// SQL query para verificar si existe al menos un admin
const CHECK_ADMIN_EXISTS_QUERY = `
  SELECT EXISTS(SELECT 1 FROM admin_users WHERE is_active = true AND role = 'admin') as admin_exists
`;

const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return cookie ? cookie.split("=")[1] : null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const validateAuth = async () => {
  try {
    const adminUserKey = getCookie("adminUserKey");

    if (!adminUserKey) {
      // Si no hay cookie, verificar si existe al menos un admin
      const adminExistsResponse = await RatatouilleApi.doQuery(
        CHECK_ADMIN_EXISTS_QUERY
      );

      if (adminExistsResponse && adminExistsResponse.length > 0) {
        adminExists.value = adminExistsResponse[0].admin_exists === true;
      } else {
        adminExists.value = false;
      }

      isAuthenticated.value = false;
      isCheckingAuth.value = false;
      localStorage.removeItem("adminUser");
      return;
    }

    // Validar con la query
    const response = await RatatouilleApi.doQuery(
      AUTH_VALIDATION_QUERY(adminUserKey)
    );

    if (response && response.length > 0) {
      isAuthenticated.value = true;
      const user = response[0];
      localStorage.setItem("adminUser", JSON.stringify(user));
    } else {
      // Query devolvió vacío, borrar cookie
      deleteCookie("adminUserKey");
      localStorage.removeItem("adminUser");
      isAuthenticated.value = false;

      // Verificar si existe al menos un admin
      const adminExistsResponse = await RatatouilleApi.doQuery(
        CHECK_ADMIN_EXISTS_QUERY
      );

      if (adminExistsResponse && adminExistsResponse.length > 0) {
        adminExists.value = !!adminExistsResponse[0].admin_exists;
      } else {
        adminExists.value = false;
      }
    }
  } catch (error) {
    console.error("Error validando autenticación:", error);
    // Si falla, borrar cookie y mostrar login
    deleteCookie("adminUserKey");
    isAuthenticated.value = false;
    adminExists.value = false;
  } finally {
    isCheckingAuth.value = false;
  }
};

onMounted(() => {
  validateAuth();
});
</script>

<template>
  <div id="app">
    <!-- Loading state mientras valida auth -->
    <div v-if="isCheckingAuth" class="auth-loading">
      <div class="loading-spinner"></div>
      <p>Verificando sesión...</p>
    </div>

    <!-- Formulario para crear el primer admin si no existe ninguno -->
    <FirstAdminForm v-else-if="!isAuthenticated && !adminExists" />

    <!-- Login si no está autenticado pero ya existe al menos un admin -->
    <LoginForm v-else-if="!isAuthenticated && adminExists" />

    <!-- Contenido de la app si está autenticado -->
    <template v-else>
      <NavigationSidebar />
      <main class="main-content">
        <RouterView />
      </main>
      <RatatouilleChat />
    </template>
  </div>
</template>

<style scoped>
#app {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

.main-content {
  flex: 1;
  height: 100vh;
  padding: 30px;
  overflow-y: auto;
}

.auth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  gap: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f0f0f0;
  border-top-color: #00a76f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.auth-loading p {
  color: #666;
  font-size: 16px;
  margin: 0;
}
</style>
