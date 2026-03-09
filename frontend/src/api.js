// // frontend/src/api.js
// const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// function getToken() {
//   return localStorage.getItem("session_token");
// }

// async function call(path, options = {}) {
//   const token = getToken();
//   const res = await fetch(`${BASE}${path}`, {
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { "Authorization": `Bearer ${token}` } : {}),
//       ...options.headers,
//     },
//     ...options,
//   });
//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);
//   return data;
// }

// export const api = {
//   // Auth
//   getAuthUrl: ()                        => call("/auth/google/url"),
//   getMe:      ()                        => call("/auth/me"),
//   setup:      (device_code, pending_jwt) => call("/auth/setup", {
//     method: "POST",
//     body: JSON.stringify({ device_code, pending_jwt }),
//   }),
//   revoke:     () => call("/auth/revoke", { method: "POST" }),
//   logout:     () => call("/auth/logout", { method: "POST" }),
// };


// frontend/src/api.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("session_token");
}

function saveToken(token) {
  if (token) localStorage.setItem("session_token", token);
}

async function call(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);

  // Rolling refresh: if server issued a new token, save it automatically.
  // This keeps the session alive indefinitely without the user doing anything.
  if (data.new_token) {
    saveToken(data.new_token);
  }

  return data;
}

export const api = {
  getAuthUrl: ()                         => call("/auth/google/url"),
  getMe:      ()                         => call("/auth/me"),
  setup:      (device_code, pending_jwt) => call("/auth/setup", {
    method: "POST",
    body: JSON.stringify({ device_code, pending_jwt }),
  }),
  revoke:     () => call("/auth/revoke", { method: "POST" }),
  logout:     () => call("/auth/logout", { method: "POST" }),
};
