import { apiFetch } from "./client";

export async function uploadAudio(file) {
  const formData = new FormData();
  formData.append("file", file);

  return await apiFetch("/api/stt/process", {
    method: "POST",
    body: formData,
  });
}