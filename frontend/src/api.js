const BASE = "/api";

function getToken() {
  return localStorage.getItem("hl_token");
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// Auth
export const api = {
  auth: {
    register: (body) => request("/auth/register", { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(body) }),
    login: (body) => request("/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    me: () => request("/auth/me", { headers: authHeaders() }),
    update: (body) => request("/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(body) }),
  },
  listings: {
    list: (params = {}) => {
      const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null)));
      return request(`/listings?${qs}`, { headers: authHeaders() });
    },
    get: (id) => request(`/listings/${id}`, { headers: authHeaders() }),
    mine: () => request("/listings/mine", { headers: authHeaders() }),
    create: (body) => request("/listings", { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(body) }),
    update: (id, body) => request(`/listings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(body) }),
    delete: (id) => request(`/listings/${id}`, { method: "DELETE", headers: authHeaders() }),
    uploadPhotos: (id, formData) => request(`/listings/${id}/photos`, { method: "POST", headers: authHeaders(), body: formData }),
    deletePhoto: (id, photoId) => request(`/listings/${id}/photos/${photoId}`, { method: "DELETE", headers: authHeaders() }),
  },
  messages: {
    send: (body) => request("/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    inbox: () => request("/messages", { headers: authHeaders() }),
    markRead: (id) => request(`/messages/${id}/read`, { method: "PATCH", headers: authHeaders() }),
  },
};

export function photoUrl(filename) {
  if (!filename) return null;
  // If it's already a full URL (CDN photo), use it directly
  if (filename.startsWith("http")) return filename;
  return `/uploads/${filename}`;
}
