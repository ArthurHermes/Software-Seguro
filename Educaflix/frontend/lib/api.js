export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export async function apiFetch(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.csrfToken ? { "X-CSRF-Token": options.csrfToken } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.erro || "Nao foi possivel concluir a operacao.");
  }

  return data;
}
