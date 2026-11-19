const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_STORAGE_VERSION = "2";

export async function signup(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.detail || "회원가입 실패");
  }

  return data;
}

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.message || "로그인 실패");
  }

  return data;
}

export function saveAuth(data) {
  sessionStorage.setItem("accessToken", data.accessToken);
  sessionStorage.setItem("user", JSON.stringify(data.user));
  sessionStorage.setItem("authStorageVersion", AUTH_STORAGE_VERSION);
}

export function clearAuth() {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("authStorageVersion");
}

export function getAccessToken() {
  return sessionStorage.getItem("accessToken");
}

export function getUser() {
  if (sessionStorage.getItem("authStorageVersion") !== AUTH_STORAGE_VERSION) {
    clearAuth();
    return null;
  }
  const savedUser = sessionStorage.getItem("user");
  return savedUser ? JSON.parse(savedUser) : null;
}
