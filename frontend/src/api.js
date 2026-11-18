const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
export async function api(path, {token, ...options} = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {'Content-Type': 'application/json', ...(token ? {Authorization: `Bearer ${token}`} : {}), ...options?.headers},
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || JSON.stringify(data));
  return data;
}
