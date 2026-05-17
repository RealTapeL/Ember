/// <reference types="vite/client" />
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DocumentItem {
  id: number;
  original_name: string;
  status: string;
  file_type: string;
  file_size: number;
  category: string;
  created_at: string;
  error_message?: string;
}

export interface TutorialData {
  id: number;
  document_id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  steps: Array<{
    id: number;
    order: number;
    title: string;
    description: string;
  }>;
}

export interface StepDetail {
  id: number;
  tutorial_id: number;
  order: number;
  title: string;
  description: string;
  content: string;
}

export interface DocumentContent {
  id: number;
  original_name: string;
  file_type: string;
  content: string;
}

export const uploadDocument = async (file: File, onProgress?: (progress: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
  
  return response.data;
};

export const getDocuments = async (): Promise<DocumentItem[]> => {
  const response = await api.get('/api/documents/');
  return response.data;
};

export const getDocument = async (id: number): Promise<DocumentItem> => {
  const response = await api.get(`/api/documents/${id}`);
  return response.data;
};

export const updateDocumentCategory = async (id: number, category: string) => {
  const response = await api.put(`/api/documents/${id}?category=${encodeURIComponent(category)}`);
  return response.data;
};

export const getDocumentContent = async (id: number): Promise<DocumentContent> => {
  const response = await api.get(`/api/documents/${id}/content`);
  return response.data;
};

export const getDocumentFileUrl = (id: number) => {
  return `${API_BASE_URL}/api/documents/${id}/file`;
};

export const getTutorialByDocument = async (documentId: number): Promise<TutorialData> => {
  const response = await api.get(`/api/tutorials/document/${documentId}`);
  return response.data;
};

export const getStepDetail = async (stepId: number): Promise<StepDetail> => {
  const response = await api.get(`/api/tutorials/steps/${stepId}`);
  return response.data;
};

export const deleteDocument = async (id: number) => {
  const response = await api.delete(`/api/documents/${id}`);
  return response.data;
};

export interface ChatResponse {
  answer: string;
  reasoning: string;
}

export const chatWithDocument = async (documentId: number, question: string, history?: any[], signal?: AbortSignal): Promise<ChatResponse> => {
  const response = await api.post(`/api/tutorials/chat/${documentId}?question=${encodeURIComponent(question)}`, {
    history: history || [],
  }, { signal });
  return response.data;
};

export const exportTutorialUrl = (tutorialId: number) => {
  return `${API_BASE_URL}/api/tutorials/${tutorialId}/export`;
};

export default api;
