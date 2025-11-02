import axios from "axios";
const api = axios.create({
    baseURL:"http://localhost:8000",
    withCredentials:true,
    headers:{
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
  (config) => {
    console.log(` Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(" Response Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;