document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('authToken');
  if (!token) { window.location.href = 'index.html'; return; }

  // Leer `user` desde localStorage de forma segura. Algunos navegadores/errores pueden
  // dejar la cadena "undefined" o "null" en storage, lo que provoca JSON.parse tofail.
  let user = {};
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser && rawUser !== 'undefined' && rawUser !== 'null') {
      user = JSON.parse(rawUser);
    }
  } catch (err) {
    console.warn('No se pudo parsear localStorage.user, se usará objeto vacío', err);
    user = {};
  }

  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn && logoutBtn.addEventListener('click', () => { localStorage.removeItem('authToken'); localStorage.removeItem('user'); window.location.href = 'index.html'; });

  const projectsList = document.getElementById('projectsList');
  const projectFormContainer = document.getElementById('projectForm');
  const projectForm = projectFormContainer && projectFormContainer.querySelector('form');
  const addBtn = document.getElementById('addProjectBtn');
  const formTitle = document.getElementById('formTitle');
  let editingId = null;

  addBtn && addBtn.addEventListener('click', () => { if (projectFormContainer) projectFormContainer.style.display = 'block'; if (projectForm) projectForm.reset(); formTitle.textContent = 'Crear proyecto'; editingId = null; });

  projectForm && projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('proj-title').value.trim();
    const description = document.getElementById('proj-desc').value.trim();
    const technologies = document.getElementById('proj-tech').value.split(',').map(s => s.trim()).filter(Boolean);
    const repository = document.getElementById('proj-repo').value.trim();
    // const body = { title, description, technologies, repository, userId: user?.id || user?._id || '' };
    try {
      if (editingId) { await API.updateProject(editingId, body); alert('Proyecto actualizado'); }
      else { await API.createProject(body); alert('Proyecto creado'); }
      if (projectFormContainer) projectFormContainer.style.display = 'none';
      loadProjects();
    } catch (err) { alert('Error: ' + err.message); }
  });

  const cancelBtn = document.getElementById('cancelProjectBtn');
  cancelBtn && cancelBtn.addEventListener('click', () => { if (projectFormContainer) projectFormContainer.style.display = 'none'; });

  async function loadProjects() {
    projectsList.innerHTML = 'Cargando...';
    try {
      const projects = await API.getProjects();
      if (!Array.isArray(projects)) { projectsList.innerHTML = 'No hay proyectos'; return; }
      projectsList.innerHTML = '';
      projects.forEach(p => {
        const el = document.createElement('div');
        el.className = 'project-card';
        el.innerHTML = `<h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description)}</p><p><strong>Tecnologías:</strong> ${p.technologies?.join(', ') || ''}</p>
        <p>${p.repository ? `<a href="${escapeHtml(p.repository)}" target="_blank">Repositorio</a>` : ''}</p>
        <div class="project-actions">
          <button class="btn-edit" data-id="${p._id}">Editar</button>
          <button class="btn-delete" data-id="${p._id}">Eliminar</button>
        </div>`;
        projectsList.appendChild(el);
      });

      projectsList.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Eliminar proyecto?')) return;
          try { await API.deleteProject(btn.dataset.id); loadProjects(); } catch (err) { alert('Eliminar falló: ' + err.message); }
        });
      });

      projectsList.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          try {
            const project = await API.request(`/projects/${id}`, { headers: { 'auth-token': token } });
            editingId = id;
            if (projectFormContainer) projectFormContainer.style.display = 'block';
            formTitle.textContent = 'Editar proyecto';
            document.getElementById('proj-title').value = project.title || '';
            document.getElementById('proj-desc').value = project.description || '';
            document.getElementById('proj-tech').value = (project.technologies || []).join(', ');
            document.getElementById('proj-repo').value = project.repository || '';
          } catch (err) { alert('No se pudo cargar proyecto: ' + err.message); }
        });
      });

    } catch (err) { projectsList.innerHTML = 'Error al cargar'; console.error(err); }
  }

  function escapeHtml(str) { if (!str) return ''; return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s])); }

  loadProjects();
});
