const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

window.API = {
  async request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, options);
    let data = {};
    try { data = await res.json(); } catch(e) { /* ignore parse errors */ }
    if (!res.ok) throw new Error(data.message || 'API error');
    return data;
  },

  register(user) {
    return this.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
  },

  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
  },

  getProjects() {
    const token = localStorage.getItem('authToken');
    return this.request('/projects', {
      headers: { 'auth-token': token }
    });
  },

  createProject(project) {
    const token = localStorage.getItem('authToken');
    return this.request('/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'auth-token': token },
      body: JSON.stringify(project)
    });
  },

  updateProject(id, updates) {
    const token = localStorage.getItem('authToken');
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'auth-token': token },
      body: JSON.stringify(updates)
    });
  },

  deleteProject(id) {
    const token = localStorage.getItem('authToken');
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
      headers: { 'auth-token': token }
    });
  }
};
