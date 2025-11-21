document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('fullname').value.trim();
      const email = document.getElementById('email').value.trim();
      const itsonId = document.getElementById('itsonId').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      if (password !== confirmPassword) { alert('Las contraseñas no coinciden'); return; }
      try {
        await API.register({ name, email, itsonId, password });
        alert('Registro exitoso. Ahora inicia sesión.');
        window.location.href = 'index.html';
      } catch (err) {
        alert('Registro falló: ' + err.message);
      }
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      try {
        const data = await API.login({ email, password });
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'home.html';
      } catch (err) {
        alert('Login falló: ' + err.message);
      }
    });
  }
});
