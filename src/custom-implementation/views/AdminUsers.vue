<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { AdminUser } from "../services/CurrentAdminUserService";
import RatatouilleApi from "../../api/index";

interface FormData {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
}

export default defineComponent({
  name: "AdminUsers",
  setup() {
    const searchQuery = ref("");
    const adminUsers = ref<AdminUser[]>([]);
    const isLoading = ref(false);
    const showModal = ref(false);
    const isEditMode = ref(false);
    const formData = ref<FormData>({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      role: "",
      is_active: true,
    });

    // Función para obtener los admin users desde la base de datos
    const fetchAdminUsers = async () => {
      isLoading.value = true;
      try {
        // TODO: Reemplaza esta query con la query SQL correcta para obtener los admin users
        const query = `
          SELECT 
            id, 
            uuid, 
            key, 
            first_name, 
            last_name, 
            email, 
            phone_number, 
            role, 
            is_active, 
            created_at 
          FROM admin_users 
          ${
            searchQuery.value
              ? `WHERE first_name LIKE '%${searchQuery.value}%' OR last_name LIKE '%${searchQuery.value}%' OR email LIKE '%${searchQuery.value}%'`
              : ""
          }
          ORDER BY created_at DESC
        `;

        const response = await RatatouilleApi.doQuery(query);
        adminUsers.value = response as AdminUser[];
      } catch (error) {
        console.error("Error fetching admin users:", error);
        // En caso de error, mostrar datos de ejemplo
        adminUsers.value = [];
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
        role: "Member",
        is_active: true,
      };
      showModal.value = true;
    };

    const openEditModal = (adminUser: AdminUser) => {
      isEditMode.value = true;
      formData.value = {
        id: adminUser.id,
        first_name: adminUser.first_name,
        last_name: adminUser.last_name,
        email: adminUser.email,
        phone_number: adminUser.phone_number || "",
        role: adminUser.role,
        is_active: adminUser.is_active,
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
            UPDATE admin_users 
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
            INSERT INTO admin_users 
            (first_name, last_name, email, phone_number, role, is_active, password_encrypted)
            VALUES (
              '${formData.value.first_name}',
              '${formData.value.last_name}',
              '${formData.value.email}',
              '${formData.value.phone_number}',
              '${formData.value.role}',
              ${formData.value.is_active ? "true" : "false"},
              '1234qwer'
            )
          `;
          await RatatouilleApi.doQuery(query);
        }

        closeModal();
        await fetchAdminUsers(); // Recargar la lista
      } catch (error) {
        console.error("Error saving admin user:", error);
      }
    };

    const handleToggleActive = async (adminUser: AdminUser) => {
      try {
        const newStatus = !adminUser.is_active;
        const query = `
          UPDATE admin_users 
          SET is_active = ${newStatus ? "true" : "false"}
          WHERE id = ${adminUser.id}
        `;

        await RatatouilleApi.doQuery(query);

        // Actualizar el estado local
        adminUser.is_active = newStatus;
      } catch (error) {
        console.error("Error toggling admin user status:", error);
      }
    };

    onMounted(() => {
      fetchAdminUsers();
    });

    return {
      searchQuery,
      adminUsers,
      isLoading,
      showModal,
      isEditMode,
      formData,
      openCreateModal,
      openEditModal,
      closeModal,
      handleSubmit,
      handleToggleActive,
      fetchAdminUsers,
    };
  },
});
</script>

<template>
  <div class="admin-users-page">
    <div class="page-header">
      <div class="page-icon">
        <img :src="'https://res.cloudinary.com/dt2jraprb/image/upload/w_150/v1760222828/ChatGPT_Image_12_oct_2025_00_46_39_uustfa.webp'" alt="Ratatouille" />
      </div>
      <h1 class="page-title">Admin Users</h1>
    </div>

    <div class="actions-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Search..."
        @blur="fetchAdminUsers"
        @keyup.enter="fetchAdminUsers"
      />
      <button class="btn-primary" @click="openCreateModal">
        + Create Admin User
      </button>
    </div>

    <div class="data-card">
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando usuarios admin...</p>
      </div>

      <div v-else-if="adminUsers.length === 0" class="empty-state">
        <p>📋 Sin resultados</p>
      </div>

      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="adminUser in adminUsers" :key="adminUser.id">
              <td class="name-cell">
                {{ adminUser.first_name }} {{ adminUser.last_name }}
              </td>
              <td>{{ adminUser.email }}</td>
              <td>{{ adminUser.phone_number }}</td>
              <td>{{ adminUser.role }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="{
                    active: adminUser.is_active,
                    inactive: !adminUser.is_active,
                  }"
                >
                  {{ adminUser.is_active ? "Active" : "Inactive" }}
                </span>
              </td>
              <td>{{ adminUser.created_at }}</td>
              <td class="actions-cell">
                <button
                  class="btn-action btn-edit"
                  @click="openEditModal(adminUser)"
                >
                  Edit
                </button>
                <button
                  class="btn-action"
                  :class="
                    adminUser.is_active ? 'btn-deactivate' : 'btn-activate'
                  "
                  @click="handleToggleActive(adminUser)"
                >
                  {{ adminUser.is_active ? "Deactivate" : "Activate" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para crear/editar Admin User -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditMode ? "Edit Admin User" : "Create Admin User" }}</h2>
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
.admin-users-page {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
