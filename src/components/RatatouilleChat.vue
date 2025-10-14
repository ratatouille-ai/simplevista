<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from "vue";
import { marked } from "marked";
import RatatouilleApi from "../api";

// Configurar marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

const renderMarkdown = (text: string): string => {
  return marked.parse(text.replace(/\\n/g, "\n")) as string;
};

const chatMessages = ref<any[]>([]);

const newMessage = ref("");
const isLoading = ref(false);
const isLoadingMessages = ref(true);
const chatMessagesContainer = ref<HTMLDivElement | null>(null);
const isChatVisible = ref(true);

const STORAGE_KEY = "chatSidebarVisible";

// SQL query para obtener los mensajes del chat
const CHAT_MESSAGES_QUERY = `SELECT id, type, content as text, created_at FROM conversation_events ORDER BY created_at ASC`;

const toggleChat = () => {
  isChatVisible.value = !isChatVisible.value;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesContainer.value) {
      chatMessagesContainer.value.scrollTop =
        chatMessagesContainer.value.scrollHeight;
    }
  });
};

const loadChatMessages = async () => {
  try {
    isLoadingMessages.value = true;
    const response = await RatatouilleApi.doQuery(CHAT_MESSAGES_QUERY);

    if (response && Array.isArray(response)) {
      chatMessages.value = response;
    }

    nextTick(() => {
      scrollToBottom();
    });
  } catch (error) {
    console.error("Error al cargar mensajes del chat:", error);
    // Opcional: Mostrar mensaje de error al usuario
  } finally {
    isLoadingMessages.value = false;
  }
};

onMounted(() => {
  // Cargar estado desde localStorage
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (savedState !== null) {
    isChatVisible.value = savedState === "true";
  }

  loadChatMessages();
});

// Guardar en localStorage cuando cambie
watch(isChatVisible, (newValue) => {
  localStorage.setItem(STORAGE_KEY, String(newValue));
});

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || isLoading.value) return;

  const messageText = newMessage.value.trim();
  newMessage.value = "";
  isLoading.value = true;

  try {
    chatMessages.value.push({
      id: chatMessages.value.length + 1,
      type: "admin_user",
      text: messageText,
      timestamp: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    scrollToBottom();

    const response = await RatatouilleApi.submitNewRatatouilleChatMessage(
      messageText
    );
    chatMessages.value.push(response);
    scrollToBottom();
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSendMessage();
  }
};
</script>

<template>
  <aside
    class="chat-sidebar"
    :class="{ 'chat-sidebar-collapsed': !isChatVisible }"
  >
    <div class="chat-header">
      <div class="chat-title" v-show="isChatVisible">
        <h2>Ratatouille</h2>
      </div>
      <button
        class="toggle-btn"
        @click="toggleChat"
        :title="isChatVisible ? 'Ocultar chat' : 'Mostrar chat'"
      >
        <template v-if="isChatVisible">▶</template>
        <template v-else>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </template>
      </button>
    </div>
    <div ref="chatMessagesContainer" class="chat-messages">
      <div v-if="isLoadingMessages" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Cargando conversación...</p>
      </div>
      <div v-else>
        <div
          v-for="message in chatMessages"
          :key="message.id"
          :class="[
            'message',
            message.type === 'admin_user' ? 'message-user' : 'message-ai',
          ]"
        >
          <div class="message-bubble">
            <div
              v-if="message.type === 'ai'"
              class="message-text markdown-content"
              v-html="renderMarkdown(message.text)"
            ></div>
            <p v-else class="message-text">{{ message.text }}</p>
            <span class="message-time">{{ message.timestamp }}</span>
          </div>
        </div>

        <!-- Typing indicator mientras la IA responde -->
        <div v-if="isLoading" class="message message-ai">
          <div class="message-bubble typing-indicator">
            <div class="typing-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-input-container">
      <input
        v-model="newMessage"
        type="text"
        class="chat-input"
        placeholder="Escribe un mensaje..."
        :disabled="isLoading"
        @keypress="handleKeyPress"
      />
      <button
        class="chat-send-btn"
        :disabled="!newMessage.trim() || isLoading"
        @click="handleSendMessage"
      >
        <span>📤</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.chat-sidebar {
  width: 380px;
  height: 100vh;
  background-color: #ffffff;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s ease;
}

.chat-sidebar-collapsed {
  width: 60px;
}

.chat-sidebar-collapsed .chat-messages,
.chat-sidebar-collapsed .chat-input-container {
  opacity: 0;
  pointer-events: none;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 76px;
}

.chat-sidebar-collapsed .chat-header {
  justify-content: center;
  padding: 20px 10px;
  border-bottom: none;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  overflow: hidden;
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

.chat-title h2 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 0;
  transition: opacity 0.2s ease;
}

.message {
  display: flex;
  width: 100%;
}

.message-ai {
  justify-content: flex-start;
}

.message-user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.message-ai .message-bubble {
  background-color: transparent;
  border-bottom-left-radius: 4px;
  padding: 0;
}

.message-user .message-bubble {
  background: linear-gradient(135deg, #00d4aa 0%, #00a76f 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.markdown-content {
  color: #333;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-content :deep(h1) {
  font-size: 1.5em;
}

.markdown-content :deep(h2) {
  font-size: 1.3em;
}

.markdown-content :deep(h3) {
  font-size: 1.1em;
}

.markdown-content :deep(p) {
  margin: 0 0 8px 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.markdown-content :deep(li) {
  margin: 4px 0;
}

.markdown-content :deep(code) {
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #00a76f;
  padding-left: 12px;
  margin: 8px 0;
  color: #666;
}

.markdown-content :deep(a) {
  color: #00a76f;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(strong) {
  font-weight: 600;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  align-self: flex-end;
  margin-top: 4px;
}

.message-ai .message-time {
  color: #999;
}

.chat-input-container {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  background-color: #f9f9f9;
}

.chat-input:focus {
  border-color: #00a76f;
}

.chat-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.chat-send-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #00d4aa 0%, #00a76f 100%);
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.chat-send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.chat-send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #00a76f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.typing-indicator {
  background-color: #f0f0f0 !important;
  padding: 12px 16px !important;
  border-radius: 12px !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dots .dot {
  width: 8px;
  height: 8px;
  background-color: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dots .dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>
