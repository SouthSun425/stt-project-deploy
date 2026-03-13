import { apiFetch } from "./client";

export async function fetchUsers(keyword = "") {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : "";
  return await apiFetch(`/api/admin/users${query}`, {
    method: "GET",
  });
}

export async function fetchUsageList(keyword = "") {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : "";
  return await apiFetch(`/api/admin/usage${query}`, {
    method: "GET",
  });
}

export async function enableUser(email) {
  return await apiFetch("/api/admin/users/enable", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
}

export async function disableUser(email) {
  return await apiFetch("/api/admin/users/disable", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
}

export async function updateDailyLimit(email, dailyLimit) {
  return await apiFetch("/api/admin/users/daily-limit", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, dailyLimit }),
  });
}

export async function unlockUser(email) {
  return await apiFetch("/api/admin/users/unlock", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
}