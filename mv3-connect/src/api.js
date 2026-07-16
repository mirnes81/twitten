const BASE = import.meta.env.VITE_API_BASE || "/backend/api";

let token = localStorage.getItem("mv3_token") || null;

export function setToken(t) {
  token = t;
  if (t) localStorage.setItem("mv3_token", t);
  else localStorage.removeItem("mv3_token");
}
export function getToken() {
  return token;
}

async function request(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isForm && body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // réponse vide ou non-JSON
  }
  if (!res.ok) {
    const message = (data && data.error) || `Erreur réseau (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  // --- auth ---
  register: (payload) => request("/auth/register.php", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login.php", { method: "POST", body: payload }),
  logout: () => request("/auth/logout.php", { method: "POST" }),
  me: () => request("/auth/me.php"),

  // --- chantiers ---
  listChantiers: (scope) => request(`/chantiers/list.php${scope ? `?scope=${scope}` : ""}`),
  getChantier: (id) => request(`/chantiers/get.php?id=${id}`),
  createChantier: (payload) => request("/chantiers/create.php", { method: "POST", body: payload }),

  // --- soumissions ---
  listSoumissions: (chantierId) => request(`/soumissions/list.php?chantier_id=${chantierId}`),
  listMySoumissions: () => request("/soumissions/list.php"),
  createSoumission: (payload) => request("/soumissions/create.php", { method: "POST", body: payload }),
  adjuger: (soumissionId) => request("/soumissions/adjuger.php", { method: "POST", body: { soumissionId } }),

  // --- suivis ---
  getSuiviByChantier: (chantierId) => request(`/suivis/get.php?chantier_id=${chantierId}`),
  getSuivi: (id) => request(`/suivis/get.php?id=${id}`),
  toggleJalon: (suiviId, jalonKey) => request("/suivis/toggle_jalon.php", { method: "POST", body: { suiviId, jalonKey } }),
  finishSuivi: (suiviId) => request("/suivis/finish.php", { method: "POST", body: { suiviId } }),
  addSuiviPhoto: (suiviId, categorie, url, name) => request("/suivis/add_photo.php", { method: "POST", body: { suiviId, categorie, url, name } }),
  removeSuiviPhoto: (suiviId, url) => request("/suivis/remove_photo.php", { method: "POST", body: { suiviId, url } }),
  addSuiviDocument: (suiviId, jalonKey, url, name) => request("/suivis/add_document.php", { method: "POST", body: { suiviId, jalonKey, url, name } }),
  removeSuiviDocument: (docId) => request("/suivis/remove_document.php", { method: "POST", body: { docId } }),

  // --- factures ---
  listFactures: () => request("/factures/list.php"),
  payFacture: (id) => request("/factures/pay.php", { method: "POST", body: { id } }),

  // --- utilisateurs ---
  listPros: () => request("/users/pros.php"),

  // --- avis ---
  createReview: (payload) => request("/reviews/create.php", { method: "POST", body: payload }),

  // --- notifications ---
  listNotifications: () => request("/notifications/list.php"),

  // --- upload ---
  upload: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/upload.php", { method: "POST", body: form, isForm: true });
  },
};
