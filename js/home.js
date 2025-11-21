document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('authToken');
  if (!token) { window.location.href = 'index.html'; return; }

<<<<<<< HEAD
=======
  // Leer `user` desde localStorage de forma segura. Algunos navegadores/errores pueden
  // dejar la cadena "undefined" o "null" en storage, lo que provoca JSON.parse tofail.
>>>>>>> 190b795d3046820cc23c0e011bad1801a38c586d
  let user = {};
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser && rawUser !== 'undefined' && rawUser !== 'null') {
      user = JSON.parse(rawUser);
    }
  } catch (err) {
<<<<<<< HEAD
    console.warn('No se pudo parsear localStorage.user', err);
=======
    console.warn('No se pudo parsear localStorage.user, se usará objeto vacío', err);
>>>>>>> 190b795d3046820cc23c0e011bad1801a38c586d
    user = {};
  }

  const logoutBtn = document.getElementById('logoutBtn');
<<<<<<< HEAD
  logoutBtn && logoutBtn.addEventListener('click', () => { 
    localStorage.removeItem('authToken'); 
    localStorage.removeItem('user'); 
    window.location.href = 'index.html'; 
  });
=======
  logoutBtn && logoutBtn.addEventListener('click', () => { localStorage.removeItem('authToken'); localStorage.removeItem('user'); window.location.href = 'index.html'; });
>>>>>>> 190b795d3046820cc23c0e011bad1801a38c586d

  const projectsList = document.getElementById('projectsList');
  const projectFormContainer = document.getElementById('projectForm');
  const projectForm = projectFormContainer && projectFormContainer.querySelector('form');
  const addBtn = document.getElementById('addProjectBtn');
  const formTitle = document.getElementById('formTitle');
<<<<<<< HEAD
  const closeFormBtn = document.getElementById('closeFormBtn');
  const formOverlay = document.getElementById('formOverlay');
  let editingId = null;

  // Abrir formulario
  addBtn && addBtn.addEventListener('click', () => { 
    if (projectFormContainer) projectFormContainer.style.display = 'flex'; 
    if (projectForm) projectForm.reset(); 
    formTitle.textContent = 'Crear proyecto'; 
    editingId = null; 
  });

  // Cerrar formulario
  const closeForm = () => {
    if (projectFormContainer) projectFormContainer.style.display = 'none';
    if (projectForm) projectForm.reset();
    editingId = null;
  };

  closeFormBtn && closeFormBtn.addEventListener('click', closeForm);
  formOverlay && formOverlay.addEventListener('click', closeForm);

  // Guardar proyecto
  projectForm && projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('proj-title').value.trim();
    const description = document.getElementById('proj-desc').value.trim();
    const technologies = document.getElementById('proj-tech').value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const repository = document.getElementById('proj-repo').value.trim();
    
    const body = { 
      title, 
      description, 
      technologies, 
      repository
    };
    
    try {
      if (editingId) { 
        await API.updateProject(editingId, body); 
        alert('Proyecto actualizado'); 
      } else { 
        await API.createProject(body); 
        alert('Proyecto creado'); 
      }
      closeForm();
      loadProjects();
    } catch (err) { 
      alert('Error: ' + err.message); 
      console.error(err);
    }
  });

  const cancelBtn = document.getElementById('cancelProjectBtn');
  cancelBtn && cancelBtn.addEventListener('click', closeForm);

  // Cargar proyectos
  async function loadProjects() {
    projectsList.innerHTML = '<p class="loading">Cargando...</p>';
    try {
      const projects = await API.getProjects();
      if (!Array.isArray(projects) || projects.length === 0) { 
        projectsList.innerHTML = '<p class="no-projects"> No hay proyectos registrados. ¡Crea el primero!</p>'; 
        document.getElementById('projectCount').textContent = '0';
        return; 
      }
      
=======
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
>>>>>>> 190b795d3046820cc23c0e011bad1801a38c586d
      projectsList.innerHTML = '';
      projects.forEach(p => {
        const el = document.createElement('div');
        el.className = 'project-card';
<<<<<<< HEAD
        el.innerHTML = `
          <div class="project-card-header">
            <h3>${escapeHtml(p.title)}</h3>
          </div>
          <div class="project-card-body">
            <p class="project-description">${escapeHtml(p.description)}</p>
            <p class="project-tech"><strong>Tecnologías:</strong> ${escapeHtml(p.technologies?.join(', ') || 'N/A')}</p>
            ${p.repository ? `<p class="project-repo"><a href="${escapeHtml(p.repository)}" target="_blank" rel="noopener noreferrer">📎 Repositorio</a></p>` : ''}
          </div>
          <div class="project-actions">
            <button class="btn btn-edit" data-id="${p._id}" aria-label="Editar proyecto"> Editar</button>
            <button class="btn btn-delete" data-id="${p._id}" aria-label="Eliminar proyecto"> Eliminar</button>
          </div>
        `;
        projectsList.appendChild(el);
      });

      document.getElementById('projectCount').textContent = projects.length;

      // Event: Eliminar
      projectsList.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          if (!confirm('¿Estas seguro de que quieres eliminar este proyecto?')) return;
          try { 
            await API.deleteProject(id); 
            alert('Proyecto eliminado');
            loadProjects(); 
          } catch (err) { 
            alert('Error al eliminar: ' + err.message); 
          }
        });
      });

      // Event: Editar
=======
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

>>>>>>> 190b795d3046820cc23c0e011bad1801a38c586d
      projectsList.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          try {
<<<<<<< HEAD
            const project = await API.request(`/projects/${id}`, { 
              headers: { 'auth-token': token } 
            });
            editingId = id;
            if (projectFormContainer) projectFormContainer.style.display = 'flex';
=======
            const project = await API.request(`/projects/${id}`, { headers: { 'auth-token': token } });
            editingId = id;
            if (projectFormContainer) projectFormContainer.style.display = 'block';
>>>>>>> 190b795d3046820cc23c0e011bad1801a38c586d
            formTitle.textContent = 'Editar proyecto';
            document.getElementById('proj-title').value = project.title || '';
            document.getElementById('proj-desc').value = project.description || '';
            document.getElementById('proj-tech').value = (project.technologies || []).join(', ');
            document.getElementById('proj-repo').value = project.repository || '';
<<<<<<< HEAD
            projectFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch (err) { 
            alert('No se pudo cargar el proyecto: ' + err.message); 
          }
        });
      });

    } catch (err) { 
      projectsList.innerHTML = '<p class="error-message">Error al cargar proyectos</p>'; 
      console.error(err); 
    }
  }

  function escapeHtml(str) { 
    if (!str) return ''; 
    return String(str)
      .replace(/[&<>"']/g, s => ({ 
        '&': '&amp;', 
        '<': '&lt;', 
        '>': '&gt;', 
        '"': '&quot;', 
        "'": '&#39;' 
      }[s])); 
  }
=======
          } catch (err) { alert('No se pudo cargar proyecto: ' + err.message); }
        });
      });

    } catch (err) { projectsList.innerHTML = 'Error al cargar'; console.error(err); }
  }

  function escapeHtml(str) { if (!str) return ''; return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s])); }
>>>>>>> 190b795d3046820cc23c0e011bad1801a38c586d

  loadProjects();
});
