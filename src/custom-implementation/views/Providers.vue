<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import RatatouilleApi from "../../api/index";

interface Provider {
  id: number;
  commercial_name: string;
  legal_name: string;
  tax_id: string;
  email: string;
  phone: string;
  website: string;
  category: string;
  is_active: boolean;
  notes: string;
  created_at: string;
}

interface FormData {
  id?: number;
  commercial_name: string;
  legal_name: string;
  tax_id: string;
  email: string;
  phone: string;
  website: string;
  category: string;
  notes: string;
  is_active: boolean;
}

export default defineComponent({
  name: "Providers",
  setup() {
    const searchQuery = ref("");
    const providers = ref<Provider[]>([]);
    const isLoading = ref(false);
    const showModal = ref(false);
    const isEditMode = ref(false);
    const formData = ref<FormData>({
      commercial_name: "",
      legal_name: "",
      tax_id: "",
      email: "",
      phone: "",
      website: "",
      category: "",
      notes: "",
      is_active: true,
    });

    const fetchProviders = async () => {
      isLoading.value = true;
      try {
        const query = `
          SELECT 
            id, 
            commercial_name, 
            legal_name, 
            tax_id, 
            email, 
            phone, 
            website, 
            category, 
            is_active, 
            notes, 
            created_at 
          FROM providers 
          ${
            searchQuery.value
              ? `WHERE commercial_name LIKE '%${searchQuery.value}%' OR legal_name LIKE '%${searchQuery.value}%' OR email LIKE '%${searchQuery.value}%' OR tax_id LIKE '%${searchQuery.value}%' OR category LIKE '%${searchQuery.value}%'`
              : ""
          }
          ORDER BY created_at DESC
        `;

        const response = await RatatouilleApi.doQuery(query);
        providers.value = response as Provider[];
      } catch (error) {
        console.error("Error fetching providers:", error);
        providers.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const openCreateModal = () => {
      isEditMode.value = false;
      formData.value = {
        commercial_name: "",
        legal_name: "",
        tax_id: "",
        email: "",
        phone: "",
        website: "",
        category: "",
        notes: "",
        is_active: true,
      };
      showModal.value = true;
    };

    const openEditModal = (provider: Provider) => {
      isEditMode.value = true;
      formData.value = {
        id: provider.id,
        commercial_name: provider.commercial_name,
        legal_name: provider.legal_name,
        tax_id: provider.tax_id,
        email: provider.email,
        phone: provider.phone || "",
        website: provider.website || "",
        category: provider.category || "",
        notes: provider.notes || "",
        is_active: provider.is_active,
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
            UPDATE providers 
            SET 
              commercial_name = '${formData.value.commercial_name}',
              legal_name = '${formData.value.legal_name}',
              tax_id = '${formData.value.tax_id}',
              email = '${formData.value.email}',
              phone = '${formData.value.phone}',
              website = '${formData.value.website}',
              category = '${formData.value.category}',
              notes = '${formData.value.notes}'
            WHERE id = ${formData.value.id}
          `;
          await RatatouilleApi.doQuery(query);
        } else {
          // INSERT
          const query = `
            INSERT INTO providers 
            (commercial_name, legal_name, tax_id, email, phone, website, category, notes, is_active)
            VALUES (
              '${formData.value.commercial_name}',
              '${formData.value.legal_name}',
              '${formData.value.tax_id}',
              '${formData.value.email}',
              '${formData.value.phone}',
              '${formData.value.website}',
              '${formData.value.category}',
              '${formData.value.notes}',
              ${formData.value.is_active ? "true" : "false"}
            )
          `;
          await RatatouilleApi.doQuery(query);
        }

        closeModal();
        await fetchProviders();
      } catch (error) {
        console.error("Error saving provider:", error);
      }
    };

    const handleToggleActive = async (provider: Provider) => {
      try {
        const newStatus = !provider.is_active;
        const query = `
          UPDATE providers 
          SET is_active = ${newStatus ? "true" : "false"}
          WHERE id = ${provider.id}
        `;

        await RatatouilleApi.doQuery(query);
        provider.is_active = newStatus;
      } catch (error) {
        console.error("Error toggling provider status:", error);
      }
    };

    onMounted(() => {
      fetchProviders();
    });

    return {
      searchQuery,
      providers,
      isLoading,
      showModal,
      isEditMode,
      formData,
      openCreateModal,
      openEditModal,
      closeModal,
      handleSubmit,
      handleToggleActive,
      fetchProviders,
    };
  },
});
</script>

<template>
  <div class="providers-page">
    <div class="page-header">
      <div class="page-icon">
        <img :src="'https://res.cloudinary.com/dt2jraprb/image/upload/w_150/v1760222828/ChatGPT_Image_12_oct_2025_00_46_39_uustfa.webp'" alt="Ratatouille" />
      </div>
      <h1 class="page-title">Providers</h1>
    </div>

    <div class="actions-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Search..."
        @blur="fetchProviders"
        @keyup.enter="fetchProviders"
      />
      <button class="btn-primary" @click="openCreateModal">
        + Create Provider
      </button>
    </div>

    <div class="data-card">
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading providers...</p>
      </div>

      <div v-else-if="providers.length === 0" class="empty-state">
        <p>📋 No results</p>
      </div>

      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Commercial Name</th>
              <th>Legal Name</th>
              <th>Tax ID</th>
              <th>Category</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="provider in providers" :key="provider.id">
              <td class="name-cell">{{ provider.commercial_name }}</td>
              <td>{{ provider.legal_name }}</td>
              <td>{{ provider.tax_id }}</td>
              <td>{{ provider.category }}</td>
              <td>{{ provider.email }}</td>
              <td>{{ provider.phone }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="{
                    active: provider.is_active,
                    inactive: !provider.is_active,
                  }"
                >
                  {{ provider.is_active ? "Active" : "Inactive" }}
                </span>
              </td>
              <td>{{ provider.created_at }}</td>
              <td class="actions-cell">
                <button
                  class="btn-action btn-edit"
                  @click="openEditModal(provider)"
                >
                  Edit
                </button>
                <button
                  class="btn-action"
                  :class="
                    provider.is_active ? 'btn-deactivate' : 'btn-activate'
                  "
                  @click="handleToggleActive(provider)"
                >
                  {{ provider.is_active ? "Deactivate" : "Activate" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para crear/editar Provider -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditMode ? "Edit Provider" : "Create Provider" }}</h2>
          <button class="modal-close" @click="closeModal">×</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label for="commercial_name">Commercial Name *</label>
              <input
                id="commercial_name"
                v-model="formData.commercial_name"
                type="text"
                required
                placeholder="Enter commercial name"
              />
            </div>

            <div class="form-group">
              <label for="legal_name">Legal Name *</label>
              <input
                id="legal_name"
                v-model="formData.legal_name"
                type="text"
                required
                placeholder="Enter legal name"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="tax_id">Tax ID *</label>
              <input
                id="tax_id"
                v-model="formData.tax_id"
                type="text"
                required
                placeholder="Enter tax ID"
              />
            </div>

            <div class="form-group">
              <label for="category">Category *</label>
              <input
                id="category"
                v-model="formData.category"
                type="text"
                required
                placeholder="Enter category"
              />
            </div>
          </div>

          <div class="form-row">
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
              <label for="phone">Phone</label>
              <input
                id="phone"
                v-model="formData.phone"
                type="text"
                placeholder="Enter phone"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="website">Website</label>
            <input
              id="website"
              v-model="formData.website"
              type="text"
              placeholder="Enter website"
            />
          </div>

          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea
              id="notes"
              v-model="formData.notes"
              rows="3"
              placeholder="Enter notes (optional)"
            ></textarea>
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
.providers-page {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
