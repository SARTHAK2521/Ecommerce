document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const loginFormContainer = document.getElementById('login-form');
    const signupFormContainer = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');

    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    const messageDiv = document.getElementById('message');
    const loginMessageDiv = document.getElementById('login-message');

    // --- FORM SWITCHING LOGIC ---
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'none';
        signupFormContainer.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'block';
    });

    // --- REGISTRATION FORM SUBMISSION ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                messageDiv.innerHTML = `<div class="alert alert-success">Registration successful! You can now log in.</div>`;
                registerForm.reset();
            } else {
                const errorData = await response.json();
                messageDiv.innerHTML = `<div class="alert alert-danger">${errorData.message || 'Registration failed'}</div>`;
            }
        } catch (error) {
            console.error('Registration error:', error);
            messageDiv.innerHTML = `<div class="alert alert-danger">An error occurred. Please try again.</div>`;
        }
    });
    
    // --- LOGIN FORM SUBMISSION ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                const user = await response.json();
                // Check user role and redirect accordingly
                if (user.role === 'ROLE_ADMIN') {
                    window.location.href = '/admin.html';
                } else {
                    window.location.href = '/index.html';
                }
            } else {
                // If login fails, show an error message
                loginMessageDiv.innerHTML = `<div class="alert alert-danger">Invalid username or password.</div>`;
            }
        } catch (error) {
            console.error('Login error:', error);
            loginMessageDiv.innerHTML = `<div class="alert alert-danger">An error occurred. Please try again.</div>`;
        }
    });
});