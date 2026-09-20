import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("agrinex_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export function setToken(token) {
  if (token) localStorage.setItem("agrinex_token", token);
  else localStorage.removeItem("agrinex_token");
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = reader.result;
      const b64 = String(s).split(",")[1];
      resolve({ base64: b64, mime: file.type || "image/jpeg" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
