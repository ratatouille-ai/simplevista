<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { sidebarNavigationItems } from "../custom-implementation/router";

const STORAGE_KEY = "navigationSidebarVisible";

// Inicializar desde localStorage o por defecto true
const isNavVisible = ref(true);

const navigationItems = sidebarNavigationItems || [];

const toggleNav = () => {
  isNavVisible.value = !isNavVisible.value;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const handleLogout = () => {
  localStorage.removeItem("adminUser");
  deleteCookie("adminUserKey");
  window.location.reload();
};

// Cargar estado desde localStorage al montar
onMounted(() => {
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (savedState !== null) {
    isNavVisible.value = savedState === "true";
  }
});

// Guardar en localStorage cuando cambie
watch(isNavVisible, (newValue) => {
  localStorage.setItem(STORAGE_KEY, String(newValue));
});
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar-collapsed': !isNavVisible }">
    <div class="sidebar-header">
      <h2 v-show="isNavVisible">NAVIGATION</h2>
      <button
        class="toggle-btn"
        @click="toggleNav"
        :title="isNavVisible ? 'Ocultar navegación' : 'Mostrar navegación'"
      >
        <template v-if="isNavVisible">◀</template>
        <template v-else>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
            />
            <line
              x1="10"
              y1="3"
              x2="10"
              y2="21"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </template>
      </button>
    </div>
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.route"
        class="nav-item"
        active-class="nav-item-active"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-text">{{ item.name }}</span>
      </router-link>

      <button @click="handleLogout" class="nav-item logout-btn">
        <span class="nav-icon">🚪</span>
        <span class="nav-text">Cerrar Sesión</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 300px;
  height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s ease;
}

.sidebar-collapsed {
  width: 60px;
}

.sidebar-collapsed .sidebar-nav {
  opacity: 0;
  pointer-events: none;
}

.sidebar-header {
  padding: 20px;
  margin-bottom: 10px;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
}

.sidebar-header h2 {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  letter-spacing: 0.5px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-collapsed .sidebar-header {
  justify-content: center;
  padding: 20px 10px;
}

.toggle-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  min-width: 40px;
  min-height: 40px;
}

.toggle-btn:hover {
  background-color: #f0f0f0;
  color: #00a76f;
}

.toggle-btn svg {
  display: block;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0 10px 20px;
  overflow-y: auto;
  flex: 1;
  transition: opacity 0.2s ease;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  transition: all 0.2s ease;
  font-size: 14px;
  flex-shrink: 0;
}

.nav-item:hover {
  background-color: #f0f0f0;
}

.nav-item-active {
  background-color: #d4f4e8;
  color: #00a76f;
  font-weight: 500;
}

.nav-icon {
  font-size: 20px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  flex: 1;
}

.logout-btn {
  margin-top: auto;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.logout-btn:hover {
  background-color: #fee;
  color: #c33;
}
</style>
