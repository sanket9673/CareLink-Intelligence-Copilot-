import axios from 'axios';

// Create an Axios instance with a base URL to the API
export const api = axios.create({
  baseURL: 'http://localhost:8000', // Update this if the API runs on a different port
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
