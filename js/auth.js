document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('fullname').value. trim();
      const email = document.getElementById('email').value.trim();
      const itsonId = document.getElementById('itsonId'). value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      if (password !== confirmPassword) { 
        alert('Las contraseñas no coinciden'); 
        return; 
      }
      try {
        await API.register({ name, email, itsonId, password });
        alert('Registro exitoso.  Ahora inicia sesión.');
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
        console.log('✅ Login exitoso, datos recibidos:', data); // Debug
        
        // ⭐ IMPORTANTE: El API devuelve 'userPublicData', NO 'user'
        const userData = data.userPublicData || data.user;
        console.log('👤 Usuario recibido:', userData); // Debug - CORREGIDO: usar userData en lugar de user
        
        // ⭐ GUARDAR correctamente el token Y el usuario
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('💾 Guardado en localStorage - token:', data.token); // Debug
        console.log('💾 Guardado en localStorage - user:', JSON.stringify(userData)); // Debug - CORREGIDO: usar userData
        
        // Verificar que se guardó correctamente
        const savedUser = JSON.parse(localStorage.getItem('user'));
        console.log('✔️ Usuario guardado en localStorage:', savedUser); // Debug
        console.log('📌 Usuario ID para proyectos:', savedUser._id); // Debug
        
        window.location.href = 'home.html';
      } catch (err) {
        alert('Login falló: ' + err.message);
        console.error('❌ Error de login:', err);
      }
    });
  }
});