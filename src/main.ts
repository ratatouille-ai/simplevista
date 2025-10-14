import { createApp } from "vue";
import "./style.css";
import "./custom-implementation/custom-styles.css";
import App from "./App.vue";
import router from "./custom-implementation/router";

createApp(App).use(router).mount("#app");