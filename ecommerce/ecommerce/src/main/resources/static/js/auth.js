document.addEventListener('DOMContentLoaded', () => {
    // --- Get all necessary DOM elements ---
    const loginFormContainer = document.getElementById('login-form');
    const signupFormContainer = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    const loginMessageDiv = document.getElementById('login-message');

    // --- Logic to switch between Login and Sign Up views ---
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'none';
        signupFormContainer.style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'block';
    });

    // --- Handles the Registration Form Submission ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the form from doing a default page reload

        // Get user input from the form
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        messageDiv.innerHTML = ''; // Clear any previous messages

        try {
            // Send the registration data to the backend API
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                // If registration is successful
                const data = await response.json();
                messageDiv.innerHTML = `<div class="alert alert-success">Registration successful for ${data.username}! Please log in.</div>`;
                registerForm.reset(); // Clear the form fields

                // Automatically switch to the login form after 3 seconds
                setTimeout(() => {
                    signupFormContainer.style.display = 'none';
                    loginFormContainer.style.display = 'block';
                    messageDiv.innerHTML = ''; // Clear the success message
                }, 3000);
            } else {
                // If the server returns an error (e.g., username exists)
                const errorText = await response.text();
                messageDiv.innerHTML = `<div class="alert alert-danger">${errorText}</div>`;
            }
        } catch (error) {
            console.error('Registration error:', error);
            messageDiv.innerHTML = `<div class="alert alert-danger">An unexpected error occurred. Please try again.</div>`;
        }
    });

    // --- Handles the Login Form Submission ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the form from reloading the page

        // Get user input
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        loginMessageDiv.innerHTML = ''; // Clear previous login messages

        try {
            // Send the login credentials to the backend API
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                // --- SUCCESS! ---
                // Redirect the user to the homepage.
                window.location.href = '/'; 
            } else {
                // --- FAILED! ---
                // Show the error message from the server (e.g., "Invalid username or password")
                const errorText = await response.text();
                loginMessageDiv.innerHTML = `<div class="alert alert-danger">${errorText}</div>`;
            }
        } catch (error) {
            console.error('Login error:', error);
            loginMessageDiv.innerHTML = `<div class="alert alert-danger">An unexpected error occurred. Please try again.</div>`;
        }
    });
});

