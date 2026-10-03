export const API_BASE_URL = "http://localhost:5000";

export function getStoredToken() {
  return localStorage.getItem("authToken");
}

export function storeAuthSession(token, user) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("isAuthenticated");
}

export async function authFetch(path, options = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_BASE_URL}${path}`, { ...options, headers });
}