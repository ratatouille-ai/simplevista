<script setup lang="ts">
import { ref } from "vue";
import RatatouilleApi from "../api";

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const AUTH_LOGIN_QUERY = (email: string, password: string) => `
  SELECT id, uuid, key, first_name, last_name, email, phone_number, role, is_active, created_at FROM admin_users WHERE email = '${email}' AND password_encrypted = '${password}' and is_active = true LIMIT 1
`;

const setCookie = (name: string, value: string, days: number = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
};

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = "Please complete all fields";
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = "";

    const response = await RatatouilleApi.doQuery(
      AUTH_LOGIN_QUERY(email.value, password.value)
    );

    if (response && response.length > 0) {
      // Login exitoso
      const user = response[0];
      setCookie("adminUserKey", user.key.toString());
      localStorage.setItem("adminUser", JSON.stringify(user));

      // Recargar para que App.vue valide la sesión
      window.location.reload();
    } else {
      errorMessage.value = "Invalid email or password";
    }
  } catch (error) {
    console.error("Error en login:", error);
    errorMessage.value = "Error logging in. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo page-icon">
          <img :src="'https://res.cloudinary.com/dt2jraprb/image/upload/w_150/v1760222828/ChatGPT_Image_12_oct_2025_00_46_39_uustfa.webp'" alt="Simplevista" />
        </div>
        <h1>Simplevista</h1>
        <p>Sign in to continue</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
            :disabled="isLoading"
          />
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? "Signing in..." : "Sign In" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  position: absolute;
  top: 0;
  left: 0;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 48px;
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  font-weight: 700;
  margin: 0 auto 16px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.login-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  outline: none;
}

.form-group input:focus {
  border-color: #00a76f;
}

.form-group input::placeholder {
  color: #999;
}

.login-btn {
  padding: 14px;
  background: linear-gradient(135deg, #00d4aa 0%, #00a76f 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 167, 111, 0.3);
}

.login-btn:active {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 12px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
  text-align: center;
}
</style>
