import axios from 'axios';
import { mockCommunications } from './mockData';

if (process.env.NODE_ENV === 'development') {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  
  axios.interceptors.request.use(
    async (config) => {
      // Only intercept requests to our API
      if (config.url.includes('/api/communications')) {
        // Return mock data
        return {
          ...config,
          data: mockCommunications
        };
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      // If the request was to our API endpoint
      if (response.config.url.includes('/api/communications')) {
        return {
          data: mockCommunications,
          status: 200,
          statusText: 'OK'
        };
      }
      return response;
    },
    (error) => {
      // If this is our API endpoint, return mock data instead of error
      if (error.config.url.includes('/api/communications')) {
        return {
          data: mockCommunications,
          status: 200,
          statusText: 'OK'
        };
      }
      return Promise.reject(error);
    }
  );
} 