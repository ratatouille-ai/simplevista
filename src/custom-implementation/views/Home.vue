<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import CurrentAdminUserService from "../services/CurrentAdminUserService";
import RatatouilleApi from "../../api/index";

interface ClientsCountResult {
  total: string;
}

export default defineComponent({
  name: "Home",
  setup() {
    const isLoading = ref<boolean>(true);
    const activeClientsCount = ref<number>(0);

    const fetchActiveClientsCount = async () => {
      try {
        isLoading.value = true;
        const result = await RatatouilleApi.doQuery(
          "SELECT COUNT(*) as total FROM clients WHERE is_active = true"
        ) as ClientsCountResult[];
        
        activeClientsCount.value = result.length > 0 ? parseInt(result[0].total) : 0;
      } catch (error) {
        console.error("Error fetching active clients count:", error);
        activeClientsCount.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      fetchActiveClientsCount();
    });

    const adminUser = CurrentAdminUserService.getAdminUser();

    return {
      adminUser,
      isLoading,
      activeClientsCount,
    };
  },
});
</script>

<template>
  <div class="home">
    <div class="page-header">
      <div class="page-icon">
        <img :src="'https://res.cloudinary.com/dt2jraprb/image/upload/w_150/v1760222828/ChatGPT_Image_12_oct_2025_00_46_39_uustfa.webp'" alt="Ratatouille" />
      </div>
      <h1 class="page-title">Hello {{ adminUser.first_name }}</h1>
    </div>

    <div class="content-grid">
      <div class="card card-welcome">
        <h2>Welcome to Ratatouille</h2>
        <p>
          🚀 Ready to build your web platform?
          <a
            href="https://ratatouille-ai.github.io/app-generator?edit=simplevista"
            class="link"
            target="_blank"
          >
            Start now!
          </a>
        </p>
      </div>

      <div class="card card-stats">
        <div class="stats-icon">📊</div>
        <div class="stats-content">
          <div class="stats-number">
            <div v-if="isLoading" class="loading-spinner-small"></div>
            <span v-else>{{ activeClientsCount }}</span>
          </div>
          <div class="stats-label">Active Clients</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 1400px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.card-links,
.card-getting-started {
  grid-column: span 1;
}

.card-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 120px;
  transition: all 0.3s ease;
}

.card-stats:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stats-icon {
  font-size: 48px;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #00a76f 0%, #00d4aa 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stats-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats-number {
  font-size: 42px;
  font-weight: 700;
  color: #333;
  line-height: 1;
  display: flex;
  align-items: center;
  min-height: 50px;
}

.stats-label {
  font-size: 16px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.loading-spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid #f0f0f0;
  border-top: 3px solid #00a76f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.links-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.steps-list {
  margin: 0;
  padding-left: 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.8;
}

.steps-list li {
  margin-bottom: 8px;
}

.steps-list li:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .card-stats {
    flex-direction: column;
    text-align: center;
    min-height: auto;
    padding: 32px 24px;
  }
  
  .stats-icon {
    width: 64px;
    height: 64px;
    font-size: 36px;
  }
  
  .stats-number {
    font-size: 36px;
    justify-content: center;
  }
}
</style>