// // // frontend/src/api.js
// // const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// // async function call(path, options = {}) {
// //   const res = await fetch(`${BASE}${path}`, {
// //     credentials: "include",
// //     headers: { "Content-Type": "application/json", ...options.headers },
// //     ...options,
// //   });
// //   const data = await res.json().catch(() => ({}));
// //   if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);
// //   return data;
// // }

// // export const api = {
// //   getMe:       ()            => call("/auth/me"),
// //   getAuthUrl:  ()            => call("/auth/google/url"),
// //   setup:       (device_code) => call("/auth/setup", {
// //     method: "POST",
// //     body: JSON.stringify({ device_code }),
// //   }),
// //   revoke:      ()            => call("/auth/revoke", { method: "POST" }),
// //   logout:      ()            => call("/auth/logout", { method: "POST" }),
// // };

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
  return data;
}

export const api = {
  // Auth
  getAuthUrl: ()                        => call("/auth/google/url"),
  getMe:      ()                        => call("/auth/me"),
  setup:      (device_code, pending_jwt) => call("/auth/setup", {
    method: "POST",
    body: JSON.stringify({ device_code, pending_jwt }),
  }),
  revoke:     () => call("/auth/revoke", { method: "POST" }),
  logout:     () => call("/auth/logout", { method: "POST" }),
};
