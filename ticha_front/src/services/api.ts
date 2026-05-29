// ticha_front/src/services/api.ts
import axios from 'axios';
import { supabase } from './supabase';

// Point this to your running FastAPI backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject the live Supabase JWT token 
// into the Authorization header before the request leaves for FastAPI
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch authentication errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request detected. Forcing token synchronization...');
      // Optional: Handle global logout or token refresh forcing here if needed
    }
    return Promise.reject(error);
  }
);