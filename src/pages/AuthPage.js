/* ============================================================
   Auth Page — Login / Signup with Email & Google
   ============================================================ */

let authMode = 'login'; // 'login' or 'signup'

function AuthPage() {
  return `
    <div class="page auth-page" id="auth-page">
      <div class="auth-container">
        <div class="auth-logo">🥗</div>
        <h1 class="auth-title">CalorieAI</h1>
        <p class="auth-subtitle">${authMode === 'login' ? 'Welcome back! Sign in to continue' : 'Create your account to get started'}</p>

        <div class="auth-form" id="auth-form">
          ${authMode === 'signup' ? `
            <div class="auth-field">
              <label>Name</label>
              <input type="text" id="auth-name" placeholder="Your name" autocomplete="name" />
            </div>
          ` : ''}
          <div class="auth-field">
            <label>Email</label>
            <input type="email" id="auth-email" placeholder="you@example.com" autocomplete="email" />
          </div>
          <div class="auth-field">
            <label>Password</label>
            <input type="password" id="auth-password" placeholder="${authMode === 'signup' ? 'Create a password (6+ chars)' : 'Enter your password'}" autocomplete="${authMode === 'signup' ? 'new-password' : 'current-password'}" />
          </div>

          <div class="auth-error" id="auth-error" style="display:none;"></div>

          <button class="btn btn-primary auth-btn" id="auth-submit-btn" onclick="handleAuthSubmit()">
            ${authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div class="auth-divider">
            <span>or</span>
          </div>

          <button class="btn auth-google-btn" onclick="handleGoogleSignIn()">
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div class="auth-switch">
          ${authMode === 'login'
      ? 'Don\'t have an account? <a href="#" onclick="switchAuthMode(\'signup\')">Sign Up</a>'
      : 'Already have an account? <a href="#" onclick="switchAuthMode(\'login\')">Sign In</a>'}
        </div>
      </div>
    </div>
  `;
}

function switchAuthMode(mode) {
  authMode = mode;
  const app = document.getElementById('app');
  if (app) app.innerHTML = AuthPage();
}

async function handleAuthSubmit() {
  const email = document.getElementById('auth-email')?.value?.trim();
  const password = document.getElementById('auth-password')?.value;
  const name = document.getElementById('auth-name')?.value?.trim();
  const errorEl = document.getElementById('auth-error');
  const btn = document.getElementById('auth-submit-btn');

  if (!email || !password) {
    showAuthError('Please fill in all fields.');
    return;
  }

  btn.textContent = 'Loading...';
  btn.disabled = true;

  try {
    if (authMode === 'signup') {
      if (password.length < 6) {
        showAuthError('Password must be at least 6 characters.');
        btn.textContent = 'Create Account';
        btn.disabled = false;
        return;
      }
      await Auth.signUpEmail(email, password, name);
    } else {
      await Auth.loginEmail(email, password);
    }
    // Auth state listener will handle navigation
  } catch (err) {
    let msg = err.message || 'Something went wrong. Try again.';
    if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
    else if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
    else if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
    else if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email.';
    else if (err.code === 'auth/weak-password') msg = 'Password is too weak (6+ characters).';
    else if (err.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' || err.message?.includes('API key')) msg = 'Invalid API key. Please check Firebase config.';
    showAuthError(msg);
    btn.textContent = authMode === 'login' ? 'Sign In' : 'Create Account';
    btn.disabled = false;
  }
}

async function handleGoogleSignIn() {
  try {
    await Auth.loginGoogle();
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      showAuthError('Google sign-in failed. Try again.');
    }
  }
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  }
}
