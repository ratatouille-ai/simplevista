<script setup lang="ts">
import { ref } from "vue";
import RatatouilleApi from "../api";

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const phoneNumber = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const CREATE_ADMIN_QUERY = (
  uuid: string,
  key: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  phoneNumber: string
) => `
  INSERT INTO admin_users (uuid, key, first_name, last_name, email, password_encrypted, phone_number, role, is_active, created_at) 
  VALUES ('${uuid}', '${key}', '${firstName}', '${lastName}', '${email}', '${password}', '${phoneNumber}', 'admin', true, NOW())
`;

const setCookie = (name: string, value: string, days: number = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
};

const handleSubmit = async () => {
  if (!firstName.value || !lastName.value || !email.value || !password.value) {
    errorMessage.value = "Please complete all required fields";
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = "";

    const uuid = crypto.randomUUID();
    const key = Math.random().toString(36).substring(2, 15);

    // Crear el admin
    await RatatouilleApi.doQuery(
      CREATE_ADMIN_QUERY(
        uuid,
        key,
        firstName.value,
        lastName.value,
        email.value,
        password.value,
        phoneNumber.value || ""
      )
    );

    // Ahora hacer login automáticamente
    const userResponse = await RatatouilleApi.doQuery(
      `SELECT id, uuid, key, first_name, last_name, email, phone_number, role, is_active, created_at 
       FROM admin_users 
       WHERE email = '${email.value}' 
       LIMIT 1`
    );

    if (userResponse && userResponse.length > 0) {
      const user = userResponse[0];
      setCookie("adminUserKey", user.key.toString());
      localStorage.setItem("adminUser", JSON.stringify(user));

      // Recargar para que App.vue valide la sesión
      window.location.reload();
    } else {
      errorMessage.value = "Error creating admin user";
    }
  } catch (error) {
    console.error("Error creando admin:", error);
    errorMessage.value = "Error creating admin user. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="first-admin-container">
    <div class="first-admin-card">
      <div class="first-admin-header">
        <div class="logo page-icon">
          <img :src="'https://res.cloudinary.com/dt2jraprb/image/upload/w_150/v1760222828/ChatGPT_Image_12_oct_2025_00_46_39_uustfa.webp'" alt="Simplevista" />
        </div>
        <h1>Welcome to<br />Simplevista Admin</h1>
        <p>🚀 Create the first admin user to get started</p>
      </div>

      <form @submit.prevent="handleSubmit" class="first-admin-form">
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name *</label>
            <input
              id="firstName"
              v-model="firstName"
              type="text"
              placeholder="Enter your first name"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="lastName">Last Name *</label>
            <input
              id="lastName"
              v-model="lastName"
              type="text"
              placeholder="Enter your last name"
              required
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
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
          <label for="phoneNumber">Phone</label>
          <input
            id="phoneNumber"
            v-model="phoneNumber"
            type="tel"
            placeholder="Enter your phone (optional)"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password *</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
            :disabled="isLoading"
          />
        </div>

        <button type="submit" class="create-btn" :disabled="isLoading">
          {{ isLoading ? "Creating user..." : "Create Administrator" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.first-admin-container {
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

.first-admin-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 48px;
  width: 100%;
  max-width: 520px;
}

.first-admin-header {
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

.first-admin-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.first-admin-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.first-admin-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

.create-btn {
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

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 167, 111, 0.3);
}

.create-btn:active {
  transform: translateY(0);
}

.create-btn:disabled {
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

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
