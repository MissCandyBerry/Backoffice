document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('authToken');
  if (! token) { window.location.href = 'index.html'; return; }

  let user = {};
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser && rawUser !== 'undefined' && rawUser !== 'null') {
      user = JSON.parse(rawUser);
    }
  } catch (err) {
    console.warn('No se pudo parsear localStorage. user, se usará objeto vacío', err);
    user = {};
  }

  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn && logoutBtn.addEventListener('click', () => { 
    localStorage.removeItem('authToken'); 
    localStorage.removeItem('user'); 
    window.location.href = 'index.html'; 
  });

  const projectsList = document.getElementById('projectsList');
  const projectFormContainer = document.getElementById('projectForm');
  const projectForm = projectFormContainer && projectFormContainer.querySelector('form');
  const addBtn = document.getElementById('addProjectBtn');
  const formTitle = document.getElementById('formTitle');
  const closeFormBtn = document.getElementById('closeFormBtn');
  const formOverlay = document.getElementById('formOverlay');
  let editingId = null;

  function isValidHttpUrl(str) {
    if (!str) return false;
    try {
      const u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (e) { return false; }
  }

  function escapeHtml(str) { 
    if (! str) return ''; 
    return String(str). replace(/[&<>"']/g, s => ({ 
      '&': '&amp;', 
      '<': '&lt;', 
      '>': '&gt;', 
      '"': '&quot;', 
      "'": '&#39;' 
    }[s])); 
  }

  // Abrir formulario
  addBtn && addBtn.addEventListener('click', () => {
    if (projectFormContainer) projectFormContainer.style.display = 'flex';
    if (projectForm) projectForm.reset();
    formTitle.textContent = 'Crear proyecto';
    editingId = null;
  });

  // Cerrar formulario
  const closeForm = () => {
    if (projectFormContainer) projectFormContainer. style.display = 'none';
    if (projectForm) projectForm.reset();
    editingId = null;
  };

  closeFormBtn && closeFormBtn.addEventListener('click', closeForm);
  formOverlay && formOverlay.addEventListener('click', closeForm);

  // Guardar proyecto
  projectForm && projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('proj-title').value. trim();
    const description = document.getElementById('proj-desc').value.trim();
    const technologies = document.getElementById('proj-tech').value
      .split(',')
      . map(s => s.trim())
      . filter(Boolean);
    const repository = document.getElementById('proj-repo').value.trim();
    
    // Procesar el campo de imágenes: convertir string separado por comas en array
    const imagesInput = document.getElementById('proj-images'). value.trim();
    const images = imagesInput
      .split(',')
      . map(s => s.trim())
      .filter(url => url && isValidHttpUrl(url)); // Solo URLs válidas
    
    const body = { 
      title, 
      description, 
      technologies, 
      repository,
      images // Array de URLs
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
    if (!projectsList) return;
    projectsList.innerHTML = '<p class="loading">Cargando... </p>';
    try {
      const projects = await API.getProjects();
      if (! Array.isArray(projects) || projects.length === 0) { 
        projectsList.innerHTML = '<p class="no-projects">No hay proyectos registrados.  ¡Crea el primero!</p>'; 
        const pc = document.getElementById('projectCount');
        if (pc) pc.textContent = '0';
        return; 
      }
      
      projectsList.innerHTML = '';
      projects.forEach(p => {
        const el = document.createElement('div');
        el.className = 'project-card';
        
        // Mostrar la primera imagen si existe y es URL válida
        const firstImage = (p.images && Array.isArray(p.images) && p.images.length > 0) 
          ? p. images[0] 
          : null;
        const mediaHtml = (firstImage && isValidHttpUrl(firstImage)) 
          ? `<div class="project-card-media"><img src="${escapeHtml(firstImage)}" alt="${escapeHtml(p.title || '')}"></div>` 
          : '';
        
        el.innerHTML = `
          ${mediaHtml}
          <div class="project-card-header">
            <h3>${escapeHtml(p.title)}</h3>
          </div>
          <div class="project-card-body">
            <p class="project-description">${escapeHtml(p.description)}</p>
            <p class="project-tech"><strong>Tecnologías:</strong> ${escapeHtml((p.technologies || []).join(', ') || 'N/A')}</p>
            ${p.repository ? `<p class="project-repo"><a href="${escapeHtml(p.repository)}" target="_blank" rel="noopener noreferrer">📎 Repositorio</a></p>` : ''}
            ${p. images && p.images.length > 1 ? `<p class="project-images-count">📸 ${p.images.length} imagen${p.images.length > 1 ? 's' : ''}</p>` : ''}
          </div>
          <div class="project-actions">
            <button class="btn btn-edit" data-id="${p._id}" aria-label="Editar proyecto">Editar</button>
            <button class="btn btn-delete" data-id="${p._id}" aria-label="Eliminar proyecto">Eliminar</button>
          </div>
        `;
        projectsList.appendChild(el);
      });

      const pc = document.getElementById('projectCount');
      if (pc) pc. textContent = String(projects.length);

      // Event: Eliminar
      projectsList.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          if (! confirm('¿Estás seguro de que quieres eliminar este proyecto?')) return;
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
      projectsList.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset. id;
          try {
            const project = await API. request(`/projects/${id}`, { 
              headers: { 'auth-token': token } 
            });
            editingId = id;
            if (projectFormContainer) projectFormContainer.style. display = 'flex';
            formTitle.textContent = 'Editar proyecto';
            document.getElementById('proj-title').value = project.title || '';
            document.getElementById('proj-desc').value = project.description || '';
            document.getElementById('proj-tech').value = (project.technologies || []).join(', ');
            document.getElementById('proj-repo').value = project.repository || '';
            // Cargar imágenes separadas por coma
            document.getElementById('proj-images').value = (project.images || []).join(', ');
            projectFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch (err) { 
            alert('No se pudo cargar el proyecto: ' + err.message); 
          }
        });
      });

    } catch (err) { 
      projectsList.innerHTML = '<p class="error-message">Error al cargar proyectos</p>'; 
      console. error(err); 
    }
  }

  loadProjects();
});
