import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
});

export const getAssistants = () => api.get('/assistants/');
export const createAssistant = (data) => api.post('/assistants/', data);
export const getAssistant = (id) => api.get(`/assistants/${id}`);
export const updateAssistant = (id, data) => api.put(`/assistants/${id}`, data);
export const deleteAssistant = (id) => api.delete(`/assistants/${id}`);

export const getDocuments = (assistantId) => api.get(`/assistants/${assistantId}/documents/`);
export const uploadDocument = (assistantId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/assistants/${assistantId}/documents/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteDocument = (assistantId, documentId) => api.delete(`/assistants/${assistantId}/documents/${documentId}`);

export const getConversations = (assistantId) => api.get(`/conversations/?assistant_id=${assistantId}`);
export const createConversation = (data) => api.post('/conversations/', data);
export const getConversation = (id) => api.get(`/conversations/${id}`);
export const deleteConversation = (id) => api.delete(`/conversations/${id}`);
export const sendMessage = (conversationId, content) => api.post(`/conversations/${conversationId}/messages`, { content });

export const generateInstructions = (assistantId) => api.post(`/assistants/${assistantId}/generate-instructions`);
export const updateConversation = (id, data) => api.patch(`/conversations/${id}`, data);

export const mixChat = (data) => api.post('/mix/chat', data);

export default api;
