import { clearAuth, getAccessToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(path, options = {}) {
  const token = getAccessToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (response.status === 401) {
    clearAuth();
    window.location.href = "/login";
    throw new Error("인증이 만료되었습니다. 다시 로그인하세요.");
  }

  if (!response.ok) {
    throw new Error((data && (data.detail || data.message)) || "요청 처리 중 오류가 발생했습니다.");
  }

  return data;
}