<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import RatatouilleApi from "../../api/index";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
}

interface FormData {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
}

export default defineComponent({
  name: "Users",
  setup() {
    const searchQuery = ref("");
    const users = ref<User[]>([]);
    const isLoading = ref(false);
    const showModal = ref(false);
    const isEditMode = ref(false);
    const formData = ref<FormData>({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      is_active: true,
    });

    const fetchUsers = async () => {
      isLoading.value = true;
      try {
        const query = `
          SELECT 
            id, 
            first_name, 
            last_name, 
            email, 
            phone_number, 
            is_active, 
            created_at 
          FROM users 
          ${
            searchQuery.value
              ? `WHERE first_name LIKE '%${searchQuery.value}%' OR last_name LIKE '%${searchQuery.value}%' OR email LIKE '%${searchQuery.value}%'`
              : ""
          }
          ORDER BY created_at DESC
        `;

        const response = await RatatouilleApi.doQuery(query);
        users.value = response as User[];
      } catch (error) {
        console.error("Error fetching users:", error);
        users.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const openCreateModal = () => {
      isEditMode.value = false;
      formData.value = {
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        is_active: true,
      };
      showModal.value = true;
    };

    const openEditModal = (user: User) => {
      isEditMode.value = true;
      formData.value = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number || "",
        is_active: user.is_active,
      };
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const handleSubmit = async () => {
      try {
        if (isEditMode.value) {
          // UPDATE
          const query = `
            UPDATE users 
            SET 
              first_name = '${formData.value.first_name}',
              last_name = '${formData.value.last_name}',
              email = '${formData.value.email}',
              phone_number = '${formData.value.phone_number}'
            WHERE id = ${formData.value.id}
          `;
          await RatatouilleApi.doQuery(query);
        } else {
          // INSERT
          const query = `
            INSERT INTO users 
            (first_name, last_name, email, phone_number, is_active)
            VALUES (
              '${formData.value.first_name}',
              '${formData.value.last_name}',
              '${formData.value.email}',
              '${formData.value.phone_number}',
              ${formData.value.is_active ? "true" : "false"}
            )
          `;
          await RatatouilleApi.doQuery(query);
        }

        closeModal();
        await fetchUsers();
      } catch (error) {
        console.error("Error saving user:", error);
      }
    };

    const handleToggleActive = async (user: User) => {
      try {
        const newStatus = !user.is_active;
        const query = `
          UPDATE users 
          SET is_active = ${newStatus ? "true" : "false"}
          WHERE id = ${user.id}
        `;

        await RatatouilleApi.doQuery(query);
        user.is_active = newStatus;
      } catch (error) {
        console.error("Error toggling user status:", error);
      }
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      searchQuery,
      users,
      isLoading,
      showModal,
      isEditMode,
      formData,
      openCreateModal,
      openEditModal,
      closeModal,
      handleSubmit,
      handleToggleActive,
      fetchUsers,
    };
  },
});
</script>

<template>
  <div class="users-page">
    <div class="page-header">
      <div class="page-icon">
        <img :src="'https://res.cloudinary.com/dt2jraprb/image/upload/w_150/v1760222828/ChatGPT_Image_12_oct_2025_00_46_39_uustfa.webp'" alt="Ratatouille" />
      </div>
      <h1 class="page-title">Users</h1>
    </div>

    <div class="actions-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Search..."
        @blur="fetchUsers"
        @keyup.enter="fetchUsers"
      />
      <button class="btn-primary" @click="openCreateModal">
        + Create User
      </button>
    </div>

    <div class="data-card">
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading users...</p>
      </div>

      <div v-else-if="users.length === 0" class="empty-state">
        <p>📋 No results</p>
      </div>

      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="name-cell">
                {{ user.first_name }} {{ user.last_name }}
              </td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone_number }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="{
                    active: user.is_active,
                    inactive: !user.is_active,
                  }"
                >
                  {{ user.is_active ? "Active" : "Inactive" }}
                </span>
              </td>
              <td>{{ user.created_at }}</td>
              <td class="actions-cell">
                <button
                  class="btn-action btn-edit"
                  @click="openEditModal(user)"
                >
                  Edit
                </button>
                <button
                  class="btn-action"
                  :class="user.is_active ? 'btn-deactivate' : 'btn-activate'"
                  @click="handleToggleActive(user)"
                >
                  {{ user.is_active ? "Deactivate" : "Activate" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para crear/editar User -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditMode ? "Edit User" : "Create User" }}</h2>
          <button class="modal-close" @click="closeModal">×</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label for="first_name">First Name *</label>
              <input
                id="first_name"
                v-model="formData.first_name"
                type="text"
                required
                placeholder="Enter first name"
              />
            </div>

            <div class="form-group">
              <label for="last_name">Last Name *</label>
              <input
                id="last_name"
                v-model="formData.last_name"
                type="text"
                required
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              placeholder="Enter email"
            />
          </div>

          <div class="form-group">
            <label for="phone_number">Phone Number</label>
            <input
              id="phone_number"
              v-model="formData.phone_number"
              type="text"
              placeholder="Enter phone number"
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="btn-save">
              {{ isEditMode ? "Update" : "Create" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users-page {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
