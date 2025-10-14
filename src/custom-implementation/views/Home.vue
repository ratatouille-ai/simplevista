<script lang="ts">
import { defineComponent } from "vue";
import CurrentAdminUserService from "../services/CurrentAdminUserService";

export default defineComponent({
  name: "Home",
  computed: {
    adminUser() {
      console.log("ADMIN USER", CurrentAdminUserService.getAdminUser());
      return CurrentAdminUserService.getAdminUser();
    },
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
}
</style>
