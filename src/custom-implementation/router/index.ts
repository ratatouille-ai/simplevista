import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import AdminUsers from "../views/AdminUsers.vue";
import Users from "../views/Users.vue";
import Clients from "../views/Clients.vue";
import Providers from "../views/Providers.vue";

export const sidebarNavigationItems = [
  { name: "Home", icon: "🏠", route: "/" },
  { name: "Admin Users", icon: "👨‍👩‍👧‍👦", route: "/admin-users" },
  { name: "Users", icon: "👥", route: "/users" },
  { name: "Clients", icon: "👤", route: "/clients" },
  { name: "Providers", icon: "🚚", route: "/providers" },
];

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/users",
    component: Users,
  },
  {
    path: "/clients",
    component: Clients,
  },
  {
    path: "/providers",
    component: Providers,
  },
  {
    path: "/admin-users",
    component: AdminUsers,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
