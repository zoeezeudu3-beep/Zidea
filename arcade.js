(function () {
  const firebaseVersion = '10.12.0';
  const gameInfo = {
    'idea-wars': {
      title: 'IDEA WARS',
      description: 'One problem. Different minds. Who has the best idea?',
      icon: '✦',
      art: 'idea',
      accent: 'violet'
    },
    'build-together': {
      title: 'BUILD TOGETHER',
      description: 'Your imagination. Your team. One creation.',
      icon: '⌂',
      art: 'build',
      accent: 'blue'
    },
    'pitch-battle': {
      title: 'PITCH BATTLE',
      description: 'You have 60 seconds to sell your idea. Make every second count.',
      icon: '◉',
      art: 'pitch',
      accent: 'pink'
    },
    '60-second-challenge': {
      title: '60-SECOND CHALLENGE',
      description: 'One minute. One challenge. Show the world what your mind can do.',
      icon: '◷',
      art: 'daily',
      accent: 'gold'
    }
  };
  const categories = {
    'idea-wars': ['Creativity', 'Originality', 'Practicality', 'Innovation'],
    'pitch-battle': ['Creativity', 'Confidence', 'Presentation', 'Business Potential', 'Problem-Solving']
  };
  const state = {
    initialized: false,
    config: null,
    auth: null,
    authPromise: null,
    apiBusy: false,
    user: null,
    profile: null,
    siteProfile: null,
    homePoll: null,
    authFlowInProgress: false,
    game: '',
    room: null,
    roomCode: '',
    roomPoll: null,
    clock: null,
    tick: 0,
    error: '',
    info: '',
    daily: null,
    dailyRefreshing: false,
    leaderboard: [],
    history: [],
    library: [],
    draft: '',
    buildDraft: '',
    editContributionId: '',
    chatDraft: '',
    creationTitle: '',
    creationDescription: '',
    categorySelection: {}
  };
  const legacyLogout = window.handleLogout;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const initials = username => String(username || 'Z').slice(0, 2).toUpperCase();
  const displayName = player => esc(player?.username ? `@${player.username}` : '@player');
  const icon = (name, size = 20) => {
    const paths = {
      spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
      box: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/>',
      trophy: '<path d="M8 21h8m-4-4v4M7 4h10v6a5 5 0 0 1-10 0V4ZM7 7H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
      arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
      star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>'
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
  };

  function getRoot() {
    return document.querySelector('#page-arcade .main-content');
  }

  function setMessage(message, type = 'error') {
    state.error = type === 'error' ? message : '';
    state.info = type === 'info' ? message : '';
    render();
  }

  async function loadFirebase() {
    if (state.auth) return state.auth;
    if (state.authPromise) return state.authPromise;
    state.authPromise = (async () => {
    if (!state.config) {
      if (window.location.protocol === 'file:') {
        throw new Error('ZIDEA sign-in needs the site and API running on a web server. Do not open index.html directly; use your deployed ZIDEA URL or start the project with Vercel development hosting.');
      }
      let response;
      try {
        response = await fetch('/api/config', { cache: 'no-store' });
      } catch {
        throw new Error('Could not reach ZIDEA sign-in configuration. Open the deployed site or run it with Vercel development hosting so /api/config is available.');
      }
      if (!response.ok) {
        throw new Error(`ZIDEA sign-in configuration is unavailable (HTTP ${response.status}). Serve the site with its API routes enabled.`);
      }
      try {
        state.config = await response.json();
      } catch {
        throw new Error('ZIDEA received an invalid sign-in configuration response. Check that /api/config is deployed correctly.');
      }
    }
    const firebaseConfig = state.config.firebase || {};
    const requiredConfig = {
      apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
      authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      appId: 'NEXT_PUBLIC_FIREBASE_APP_ID'
    };
    const missingConfig = Object.entries(requiredConfig)
      .filter(([key]) => !firebaseConfig[key])
      .map(([, variable]) => variable);
    if (missingConfig.length) {
      throw new Error(`Firebase Auth is not configured for this deployment. Add these environment variables to the hosting provider: ${missingConfig.join(', ')}.`);
    }
    if (!window.firebase?.apps?.length) {
      const loadScript = src => new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Firebase sign-in could not load. Check your connection and try again.'));
        document.head.appendChild(script);
      });
      await loadScript(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-app-compat.js`);
      await loadScript(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-auth-compat.js`);
      window.firebase.initializeApp(firebaseConfig);
    } else if (window.firebase.apps[0].options.projectId !== firebaseConfig.projectId) {
      throw new Error('The Firebase web configuration does not match the initialized Firebase project.');
    }
    state.auth = window.firebase.auth();
    state.auth.onAuthStateChanged(user => {
      const restoreSession = Boolean(user && !currentUser && !state.authFlowInProgress);
      state.user = user;
      state.profile = null;
      state.siteProfile = null;
      if (user) refreshProfile().then(profile => {
        if (profile && state.siteProfile) return profile;
        if (state.profileSetupInProgress) return profile;
        return setupProfile(user, profile?.username);
      }).then(profile => {
        state.profile = profile;
        if (profile && typeof currentUser !== 'undefined') {
          currentUser = {
            email: user.email || currentUser?.email || '',
            username: profile.username,
            avatar: user.photoURL || state.siteProfile?.avatar || profile.avatar || '',
            profile: state.siteProfile || {},
            uid: user.uid,
            firebaseAuth: true
          };
          window.setLoggedInUI?.();
          window.updateLandingAuthUI?.();
        }
        document.documentElement.classList.remove('auth-restoring');
        if (profile && restoreSession) {
          window.closeAuthModal?.(true);
          setTimeout(() => {
            try {
              window.startFirebase?.();
              window.listenIncoming?.();
              window.syncIdeasFromFirebase?.();
              window.syncAvatarFromFirebase?.();
            } catch (error) {
              console.warn('Restored ZIDEA session sync failed:', error);
            }
          }, 100);
          const route = window.location.hash.replace(/^#/, '');
          if (route && !['landing', 'login', 'signup'].includes(route)) {
            window.handleHashRoute?.();
          } else {
            window.showPage?.('dashboard', { skipHash: true });
          }
        }
        if (!profile && restoreSession) {
          window.showPage?.('landing', { skipHash: true });
          window.openAuthModal?.('login', true);
          showAuthError('Your account profile is incomplete. Sign in again to finish setting it up.');
        }
        render();
        if (profile) loadHomeData();
      }).catch(error => {
        document.documentElement.classList.remove('auth-restoring');
        state.error = authErrorMessage(error, 'profile');
        if (restoreSession) {
          window.showPage?.('landing', { skipHash: true });
          window.openAuthModal?.('login', true);
          showAuthError(state.error);
        }
        render();
      });
      else {
        document.documentElement.classList.remove('auth-restoring');
        if (currentUser?.firebaseAuth && typeof legacyLogout === 'function') legacyLogout(true);
        const route = window.location.hash.replace(/^#/, '');
        if (['dashboard', 'arcade', 'chat', 'zidai', 'ideas', 'library', 'profile', 'settings', 'help'].includes(route)) {
          window.showPage?.('landing', { skipHash: true });
          window.openAuthModal?.('login', true);
        } else if (['login', 'signup'].includes(route)) {
          window.showPage?.('landing', { skipHash: true });
          window.openAuthModal?.(route, true);
        } else window.showPage?.('landing', { skipHash: true });
        render();
      }
    });
    return state.auth;
    })();
    try {
      return await state.authPromise;
    } catch (error) {
      state.authPromise = null;
      throw error;
    }
  }

  async function api(action, values = {}) {
    const auth = await loadFirebase();
    const user = auth.currentUser;
    if (!user) throw new Error('Sign in with your ZIDEA account to continue.');
    const token = await user.getIdToken();
    const response = await fetch('/api/arcade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, ...values })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'The game service could not complete that action.');
    return data;
  }

  async function refreshProfile(user = state.user) {
    if (!user) return null;
    const token = await user.getIdToken();
    const response = await fetch('/api/arcade', { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Your player profile could not be loaded.');
    state.user = user;
    state.profile = data.player;
    state.siteProfile = data.siteProfile || null;
    return data.player || null;
  }

  function usernameFromUser(user) {
    const base = (user.displayName || user.email?.split('@')[0] || 'zidea_player')
      .toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 16);
    return base.length >= 3 ? base : `${base || 'zid'}_${Math.random().toString(36).slice(2, 6)}`;
  }

  async function setupProfile(user, preferredUsername, questionnaire = {}) {
    const suggested = preferredUsername || usernameFromUser(user);
    try {
      const result = await api('profile', { username: suggested, profile: questionnaire });
      state.profile = result.profile;
      state.siteProfile = result.siteProfile || questionnaire;
      return result.profile;
    } catch (error) {
      if (error.message.includes('already taken') && !preferredUsername) {
        const suffix = user.uid.slice(0, 4).toLowerCase();
        const result = await api('profile', { username: `${suggested.slice(0, 15)}_${suffix}`, profile: questionnaire });
        state.profile = result.profile;
        state.siteProfile = result.siteProfile || questionnaire;
        return result.profile;
      }
      if (error.message.includes('already taken') && state.profile?.uid === user.uid) return state.profile;
      throw error;
    }
  }

  function enterAuthenticatedUser(user, profile) {
    if (typeof window.enterApp === 'function') {
      window.enterApp({
        email: user.email || '',
        username: profile.username,
        avatar: user.photoURL || state.siteProfile?.avatar || profile.avatar || '',
        profile: state.siteProfile || {},
        uid: user.uid,
        firebaseAuth: true
      });
    }
    state.user = user;
    state.profile = profile;
    state.game = '';
    state.room = null;
    state.error = '';
    state.info = '';
    render();
  }

  function showAuthError(message, form = 'login') {
    const element = document.getElementById(`${form}-error`);
    if (element) {
      element.textContent = message;
      element.classList.add('show');
      return;
    }
    showToast(message);
  }

  function authErrorMessage(error, flow = 'login') {
    const messages = {
      'auth/invalid-email': 'Enter a valid email address.',
      'auth/user-not-found': 'No account exists for that email. Check it or create an account.',
      'auth/wrong-password': 'That password is incorrect.',
      'auth/invalid-credential': 'The email or password is incorrect.',
      'auth/email-already-in-use': 'An account already uses this email. Log in instead.',
      'auth/weak-password': 'Choose a password with at least 6 characters.',
      'auth/operation-not-allowed': 'This sign-in method is disabled in Firebase Authentication settings.',
      'auth/unauthorized-domain': 'This website domain is not authorized in Firebase Authentication settings.',
      'auth/network-request-failed': 'Network error. Check your connection and try again.',
      'auth/too-many-requests': 'Too many attempts. Wait a little and try again.',
      'auth/popup-blocked': 'The sign-in popup was blocked. Redirecting to Google sign-in.',
      'auth/popup-closed-by-user': 'Google sign-in was closed before it finished.',
      'auth/cancelled-popup-request': 'Another sign-in window is already open.',
      'auth/account-exists-with-different-credential': 'This email already has another sign-in method. Log in with that method first.'
    };
    const code = error?.code || '';
    if (/FIREBASE_SERVICE_ACCOUNT|FIREBASE_DATABASE_URL|ZIDEA_PLAY_DATABASE_URL/.test(error?.message || '')) {
      return 'Firebase accepted your sign-in, but ZIDEA’s secure profile service is not configured. The site administrator must configure the server-side Firebase credentials and database URLs before accounts can enter the app.';
    }
    if (code === 'auth/operation-not-allowed' && flow === 'google') return 'Google sign-in is not enabled for this Firebase project.';
    if (code === 'auth/operation-not-allowed' && flow === 'signup') return 'Email/password sign-in is not enabled in Firebase Authentication settings.';
    if (messages[code]) return messages[code];
    if (error instanceof TypeError || /failed to fetch|network|offline/i.test(error?.message || '')) {
      return 'Network error. Check your connection and try again.';
    }
    return error?.message || (flow === 'signup' ? 'Your account could not be created.' : 'Sign-in failed. Please try again.');
  }

  async function checkUsernameAvailability(username) {
    let response;
    try {
      response = await fetch('/api/auth/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_username', username })
      });
    } catch {
      throw new Error('Could not verify username availability. Check your connection and try again.');
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'That username could not be verified right now.');
    if (!result.available) throw new Error('That username is already taken. Choose another one.');
  }

  async function handleLogin(event) {
    event?.preventDefault();
    if (state.authFlowInProgress) return;
    const form = event?.currentTarget || event?.target;
    const button = form?.querySelector('button[type="submit"]');
    const email = document.getElementById('login-email')?.value.trim().toLowerCase();
    const password = document.getElementById('login-password')?.value;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAuthError('Enter a valid email address.');
    if (!password) return showAuthError('Enter your password.');
    document.getElementById('login-error')?.classList.remove('show');
    if (button) button.disabled = true;
    state.authFlowInProgress = true;
    try {
      const auth = await loadFirebase();
      let credential;
      try {
        credential = await auth.signInWithEmailAndPassword(email, password);
      } catch (error) {
        if (!['auth/user-not-found', 'auth/invalid-credential'].includes(error.code)) throw error;
        const response = await fetch('/api/auth/account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'migrate', email, password })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (response.status === 401 && error.code === 'auth/invalid-credential') throw error;
          throw new Error(result.message || 'This legacy account could not be securely migrated.');
        }
        credential = await auth.signInWithEmailAndPassword(email, password);
      }
      const existingProfile = await refreshProfile(credential.user);
      const profile = existingProfile && state.siteProfile
        ? existingProfile
        : await setupProfile(credential.user, existingProfile?.username);
      enterAuthenticatedUser(credential.user, profile);
      showToast('Signed in securely.');
    } catch (error) {
      showAuthError(authErrorMessage(error));
    } finally {
      state.authFlowInProgress = false;
      if (button) button.disabled = false;
    }
  }

  async function handleSignup(event) {
    event?.preventDefault();
    if (state.authFlowInProgress) return;
    const form = event?.currentTarget || event?.target;
    const button = form?.querySelector('button[type="submit"]');
    const email = document.getElementById('signup-email')?.value.trim().toLowerCase();
    const password = document.getElementById('signup-password')?.value;
    const username = document.getElementById('signup-username')?.value.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAuthError('Enter a valid email address.', 'signup');
    if (!password || password.length < 6) return showAuthError('Choose a password with at least 6 characters.', 'signup');
    if (!username) return showAuthError('Choose a username.', 'signup');
    if (!/^[a-z0-9_]{3,20}$/.test(username)) return showAuthError('Use 3-20 letters, numbers, or underscores for your username.', 'signup');
    document.getElementById('signup-error')?.classList.remove('show');
    if (button) button.disabled = true;
    state.profileSetupInProgress = true;
    state.authFlowInProgress = true;
    let accountCreated = false;
    try {
      const auth = await loadFirebase();
      const currentUserForEmail = auth.currentUser?.email?.trim().toLowerCase() === email ? auth.currentUser : null;
      if (!currentUserForEmail) await checkUsernameAvailability(username);
      const user = currentUserForEmail || (await auth.createUserWithEmailAndPassword(email, password)).user;
      accountCreated = true;
      if (user.displayName !== username) await user.updateProfile({ displayName: username });
      const questionnaire = typeof buildSignupQuestionnaire === 'function' ? buildSignupQuestionnaire() : {};
      const profile = await setupProfile(user, username, questionnaire);
      if (typeof buildSignupQuestionnaire === 'function' && typeof saveProfileForUsername === 'function') {
        saveProfileForUsername(username, {
          ...questionnaire,
          email,
          username,
          avatar: user.photoURL || ''
        });
      }
      enterAuthenticatedUser(user, profile);
      showToast('Welcome to ZIDEA.');
    } catch (error) {
      const message = accountCreated
        ? `Your Firebase account exists, but profile setup could not finish. ${authErrorMessage(error, 'profile')} Submit again to retry profile setup.`
        : authErrorMessage(error, 'signup');
      showAuthError(message, 'signup');
    } finally {
      state.profileSetupInProgress = false;
      state.authFlowInProgress = false;
      if (button) button.disabled = false;
    }
  }

  async function handleGoogleLogin() {
    if (state.authFlowInProgress) return;
    const signupMode = document.getElementById('page-signup')?.classList.contains('show');
    const visibleForm = signupMode ? 'signup' : 'login';
    const username = signupMode ? document.getElementById('signup-username')?.value.trim().toLowerCase() : '';
    if (signupMode && !/^[a-z0-9_]{3,20}$/.test(username || '')) {
      return showAuthError('Use 3-20 letters, numbers, or underscores for your username.', 'signup');
    }
    const buttons = Array.from(document.querySelectorAll('.google-btn'));
    buttons.forEach(button => { button.disabled = true; });
    document.getElementById(`${visibleForm}-error`)?.classList.remove('show');
    state.authFlowInProgress = true;
    state.profileSetupInProgress = true;
    try {
      const auth = await loadFirebase();
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      if (signupMode) await checkUsernameAvailability(username);
      let credential;
      try {
        credential = await auth.signInWithPopup(provider);
      } catch (error) {
        if (!['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment'].includes(error.code)) throw error;
        await auth.signInWithRedirect(provider);
        return;
      }
      const questionnaire = signupMode && typeof buildSignupQuestionnaire === 'function' ? buildSignupQuestionnaire() : {};
      const existingProfile = await refreshProfile(credential.user);
      const profile = existingProfile && state.siteProfile
        ? existingProfile
        : await setupProfile(credential.user, signupMode ? username || existingProfile?.username : existingProfile?.username, questionnaire);
      enterAuthenticatedUser(credential.user, profile);
    } catch (error) {
      showAuthError(authErrorMessage(error, 'google'), visibleForm);
    } finally {
      state.authFlowInProgress = false;
      state.profileSetupInProgress = false;
      buttons.forEach(button => { button.disabled = false; });
    }
  }

  async function handleForgotPassword() {
    try {
      const email = document.getElementById('login-email')?.value.trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAuthError('Enter a valid email address first so we can send reset instructions.');
      await (await loadFirebase()).sendPasswordResetEmail(email);
      showToast('If that email belongs to an account, password reset instructions are on their way.');
    } catch (error) {
      showAuthError(authErrorMessage(error, 'reset'));
    }
  }

  async function handleLogout(force) {
    if (!force && !window.confirm('Sign out of Zidea?')) return;
    try {
      if (state.auth?.currentUser && currentUser?.uid === state.auth.currentUser.uid) {
        try {
          await db.patch(`users/${currentUser.username}`, { online: false, lastSeen: Date.now() });
        } catch (error) {
          console.warn('Could not update offline presence before sign-out:', error);
        }
      }
      if (state.auth) await state.auth.signOut();
      if (currentUser?.firebaseAuth && typeof legacyLogout === 'function') {
        legacyLogout(true);
      } else {
        if (!state.auth) {
          if (typeof legacyLogout === 'function') legacyLogout(true);
          else {
            localStorage.removeItem('zidea_session');
            window.showPage?.('landing');
          }
        }
      }
    } catch (error) {
      showToast(error.message || 'Sign out failed.');
    }
  }

  function avatar(player, size = '') {
    const pic = player?.avatar ? `<img src="${esc(player.avatar)}" alt="" referrerpolicy="no-referrer">` : esc(initials(player?.username));
    return `<span class="play-avatar ${size}">${pic}</span>`;
  }

  function artScene(kind) {
    if (kind === 'build') return `<svg class="play-art-scene city" viewBox="0 0 680 310" aria-hidden="true"><defs><linearGradient id="citySky" x2="0" y2="1"><stop stop-color="#6975ff"/><stop offset="1" stop-color="#1b1854"/></linearGradient><linearGradient id="cityGlow" x2="0" y2="1"><stop stop-color="#68efff"/><stop offset="1" stop-color="#594eff"/></linearGradient></defs><path d="M0 245 95 164l79 58 99-117 84 89 105-146 72 79 72-61 74 75v159H0Z" fill="url(#citySky)"/><g fill="#4a50be" stroke="#bcc7ff" stroke-width="3"><path d="M62 243v-85l50-35 47 35v85m72 0V119l50-48 54 48v124m75 0V133l39-36 37 36v110m50 0V85l56-47 55 47v158m-547 0v-48l34-29 34 29v48"/></g><g fill="#84efff"><path d="M93 177h12v17H93zm30 0h12v17h-12zm113-17h13v17h-13zm34 0h13v17h-13zm128 0h11v17h-11zm105-45h14v18h-14zm34 0h14v18h-14z"/></g><path d="M0 252h680v58H0Z" fill="#171844"/><path d="M220 252h233l-23-40H243Z" fill="url(#cityGlow)"/></svg>`;
    if (kind === 'pitch') return `<svg class="play-art-scene mic" viewBox="0 0 680 310" aria-hidden="true"><defs><radialGradient id="stageGlow"><stop stop-color="#ff89c5" stop-opacity=".85"/><stop offset="1" stop-color="#7433c7" stop-opacity="0"/></radialGradient></defs><ellipse cx="355" cy="235" rx="310" ry="155" fill="url(#stageGlow)"/><path d="M0 260h680v50H0Z" fill="#24104e"/><g fill="#ffcc5e"><circle cx="95" cy="65" r="4"/><circle cx="558" cy="47" r="5"/><circle cx="487" cy="115" r="3"/><circle cx="175" cy="110" r="3"/></g><path d="M352 166v59m-23 0h47m-24-92v42" stroke="#ffd476" stroke-width="10" stroke-linecap="round"/><rect x="320" y="45" width="64" height="118" rx="32" fill="#dfd5ff" stroke="#fff" stroke-width="5"/><path d="M331 83h42m-42 17h42m-42 17h42" stroke="#8654cf" stroke-width="5" stroke-linecap="round"/><path d="M256 250q80-56 158 0v60H256Z" fill="#652bc8"/><circle cx="338" cy="211" r="28" fill="#e0a57b"/><path d="M307 211q4-43 35-34 25 4 27 35l-18-13-15 10-17-10Z" fill="#25173b"/></svg>`;
    if (kind === 'daily') return `<svg class="play-art-scene hourglass" viewBox="0 0 680 310" aria-hidden="true"><defs><radialGradient id="timeGlow"><stop stop-color="#ffd867" stop-opacity=".36"/><stop offset="1" stop-color="#f8a11c" stop-opacity="0"/></radialGradient></defs><circle cx="473" cy="151" r="170" fill="url(#timeGlow)"/><circle cx="476" cy="150" r="105" fill="none" stroke="#ffdb67" stroke-width="9"/><circle cx="476" cy="150" r="87" fill="none" stroke="#fff1b0" stroke-opacity=".35" stroke-width="2"/><path d="M475 93v62l40 23" fill="none" stroke="#ffda59" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="m185 55 119 0-31 86 31 105-119 0 32-105Z" fill="#ffce55" fill-opacity=".12" stroke="#ffde73" stroke-width="7"/><path d="M215 217h60l-30-45Z" fill="#ffbc3d"/><path d="M223 75h44l-22 49Z" fill="#fff0ad"/><circle cx="132" cy="93" r="4" fill="#fff2b0"/><circle cx="322" cy="72" r="3" fill="#ffbe58"/><circle cx="146" cy="224" r="3" fill="#ffe593"/></svg>`;
    return `<svg class="play-art-scene idea" viewBox="0 0 680 310" aria-hidden="true"><defs><radialGradient id="ideaGlow"><stop stop-color="#ffd86e" stop-opacity=".9"/><stop offset="1" stop-color="#f68d27" stop-opacity="0"/></radialGradient><linearGradient id="sword" x2="0" y2="1"><stop stop-color="#fff3c0"/><stop offset="1" stop-color="#f6ad3b"/></linearGradient></defs><circle cx="340" cy="139" r="142" fill="url(#ideaGlow)"/><path d="m114 32 77 94-27 21-70-100Zm452 0-77 94 27 21 70-100Z" fill="url(#sword)" stroke="#fff1cc" stroke-width="4"/><path d="m172 125 43 15-12 15-44-13Zm336 0-43 15 12 15 44-13Z" fill="#b68af4"/><path d="M315 93V53a25 25 0 1 1 50 0v40l16 19v13h-82v-13Z" fill="#ffe87d" stroke="#fff4c2" stroke-width="4"/><path d="M329 136h22v13h-22" fill="#f3a43b"/><path d="M332 154h16v6h-16" fill="#fff1b0"/><path d="M50 250q38-92 115-35l19 95H40Z" fill="#262159"/><circle cx="114" cy="176" r="35" fill="#b97558"/><path d="M78 175q0-49 42-49 33 0 40 37-30-12-52 2l-15 24Z" fill="#24182b"/><path d="M506 250q38-92 115-35l19 95H496Z" fill="#4a206f"/><circle cx="570" cy="176" r="35" fill="#d49b7c"/><path d="M535 171q3-43 45-43 34 4 34 46l-24-23-26 12-18-8Z" fill="#211628"/><path d="m87 225 33 13-21 25-32-14Zm504 0-33 13 21 25 32-14Z" fill="#ffd55c"/></svg>`;
  }

  function playerPills(players) {
    return `<div class="play-players">${Object.values(players || {}).map(player =>
      `<div class="play-player">${avatar(player)}<span>${displayName(player)}</span><b class="${player.connected === false ? 'offline' : player.ready ? 'ready' : ''}">${player.connected === false ? 'OFFLINE' : player.ready ? 'READY' : 'IN LOBBY'}</b></div>`
    ).join('')}</div>`;
  }

  function gameCard(id) {
    const game = gameInfo[id];
    return `<article class="play-card ${game.accent}" data-game="${id}" tabindex="0" role="button" aria-label="Open ${game.title}">
      <div class="play-card-art ${game.art}">${artScene(game.art)}<span class="play-card-icon">${game.icon}</span><span class="play-card-chip">ZIDEA ORIGINAL</span></div>
      <div class="play-card-copy"><div><p class="play-card-kicker">CREATIVE MULTIPLAYER</p><h2>${game.title}</h2><p>${game.description}</p></div><span class="play-card-arrow">${icon('arrow', 19)}</span></div>
    </article>`;
  }

  function profileSummary() {
    if (!state.profile) return '<div class="play-profile-prompt">Sign in with your secure ZIDEA account to save your stats and join a live room.</div>';
    return `<div class="play-stats"><div><strong>${state.profile.xp || 0}</strong><span>XP</span></div><div><strong>${state.profile.wins || 0}</strong><span>WINS</span></div><div><strong>${state.profile.matches || 0}</strong><span>MATCHES</span></div><div><strong>${state.profile.streak || 0}</strong><span>DAY STREAK</span></div></div>`;
  }

  function leaderboardMarkup() {
    if (!state.leaderboard.length) return '<p class="play-empty">No players on the board yet. Be the first to compete.</p>';
    return `<div class="play-leaderboard">${state.leaderboard.slice(0, 5).map((player, index) =>
      `<div class="play-leader-row"><span class="play-place">${['♛', '②', '③', '04', '05'][index]}</span>${avatar(player)}<strong>${displayName(player)}</strong><span class="play-xp">${player.xp} XP</span></div>`
    ).join('')}</div>`;
  }

  function historyMarkup() {
    if (!state.history.length) return '<p class="play-empty">Your recent matches will show up here.</p>';
    return `<div class="play-history">${state.history.slice(0, 4).map(match =>
      `<div class="play-history-row"><span class="play-history-icon">${gameInfo[match.game]?.icon || '✦'}</span><span><strong>${esc(gameInfo[match.game]?.title || match.game)}</strong><small>${esc(match.result || 'Completed')} · ${new Date(match.completedAt).toLocaleDateString()}</small></span><b>+${match.xp || 0} XP</b></div>`
    ).join('')}</div>`;
  }

  async function loadHomeData() {
    if (!state.user || !state.profile) return;
    try {
      const [leaderboard, history, invites] = await Promise.all([
        api('leaderboard'), api('history'), api('invites')
      ]);
      state.leaderboard = leaderboard.leaderboard || [];
      state.history = history.history || [];
      state.invites = invites.invites || [];
      render();
    } catch (error) {
      state.error = error.message;
      render();
    }
  }

  function startHomePolling() {
    if (state.homePoll) return;
    state.homePoll = setInterval(() => {
      if (state.user && state.profile && !state.game && document.querySelector('#page-arcade.page.active')) {
        loadHomeData();
      }
    }, 20000);
  }

  function inviteMarkup() {
    const invites = state.invites || [];
    if (!invites.length) return '';
    return `<section class="play-panel"><div class="play-panel-heading"><span><small>YOUR CHALLENGES</small><h2>Friend invitations</h2></span></div>${invites.map(invite =>
      `<div class="play-invite-row"><span>${avatar({ username: invite.from })}<strong>@${esc(invite.from)}</strong> invited you to ${esc(gameInfo[invite.game]?.title || invite.game)}</span><div><button class="play-btn small" data-action="accept-invite" data-code="${esc(invite.code)}">Join room</button><button class="play-btn secondary small" data-action="decline-invite" data-code="${esc(invite.code)}">Decline</button></div></div>`
    ).join('')}</section>`;
  }

  function homeMarkup() {
    const who = state.profile ? `@${esc(state.profile.username)}` : 'YOUR NEXT BIG IDEA STARTS HERE';
    return `<div class="play-shell">
      <section class="play-welcome"><div><span class="play-eyebrow"><i></i> THE CREATIVE ARENA</span><h1>ZIDEA <em>PLAY</em></h1><p>THINK. CREATE. COMPETE. CONNECT.</p><span class="play-welcome-user">${who}</span></div><div class="play-welcome-mark"><span>✦</span><i></i></div></section>
      ${state.error ? `<div class="play-alert">${esc(state.error)}</div>` : ''}
      ${state.info ? `<div class="play-notice">${esc(state.info)}</div>` : ''}
      ${profileSummary()}
      <div class="play-section-heading"><div><span>FOUR WORLDS. LIMITLESS IDEAS.</span><h2>Choose your arena</h2></div><span class="play-live-dot">PLAY YOUR WAY</span></div>
      <div class="play-grid">${Object.keys(gameInfo).map(gameCard).join('')}</div>
      ${inviteMarkup()}
      <section class="play-lower-grid"><div class="play-panel"><div class="play-panel-heading"><span><small>YOUR JOURNEY</small><h2>Recent matches</h2></span><span class="play-round-badge">HISTORY</span></div>${historyMarkup()}</div>
      <div class="play-panel"><div class="play-panel-heading"><span><small>THE COMMUNITY</small><h2>Play leaderboard</h2></span><span class="play-round-badge">TOP PLAYERS</span></div>${leaderboardMarkup()}</div></section>
    </div>`;
  }

  function backHeader(game) {
    return `<button class="play-back" data-action="back">${icon('arrow', 16)} <span>BACK TO ZIDEA PLAY</span></button>
      <div class="play-detail-title"><span class="play-title-art ${game.art}">${game.icon}</span><div><span class="play-eyebrow">${game.title === '60-SECOND CHALLENGE' ? 'A NEW CHALLENGE EVERY DAY' : 'YOUR NEXT ROUND STARTS HERE'}</span><h1>${game.title}</h1><p>${game.description}</p></div></div>`;
  }

  function roomControls(game) {
    return `<section class="play-panel play-entry"><div class="play-panel-heading"><span><small>JUMP INTO A MATCH</small><h2>${game === 'build-together' ? 'Create or join your team room' : 'Choose how you play'}</h2></span>${icon('users', 22)}</div>
      ${game === 'idea-wars' ? `<label class="play-label">Invite a friend by username (optional)<input class="play-input" id="friend-username" placeholder="@username"></label>
      <div class="play-action-row"><button class="play-btn" data-action="create-room" data-mode="friends">${icon('users', 17)} PLAY WITH FRIENDS</button><button class="play-btn secondary" data-action="random">${icon('spark', 17)} PLAY WITH RANDOM PLAYERS</button></div>` : ''}
      ${game === 'build-together' ? `<label class="play-label">Invite a teammate by username (optional)<input class="play-input" id="friend-username" placeholder="@username"></label>
      <div class="play-action-row"><button class="play-btn" data-action="create-room" data-mode="friends">${icon('box', 17)} CREATE ROOM</button><button class="play-btn secondary" data-action="create-room" data-mode="friends">${icon('users', 17)} PLAY WITH FRIENDS</button></div>` : ''}
      ${game === 'pitch-battle' ? `<label class="play-label">Challenge a friend by username (optional)<input class="play-input" id="friend-username" placeholder="@username"></label>
      <div class="play-action-row"><button class="play-btn" data-action="create-room" data-mode="solo">${icon('clock', 17)} SOLO PRACTICE</button><button class="play-btn secondary" data-action="create-room" data-mode="friends">${icon('users', 17)} CHALLENGE A FRIEND</button><button class="play-btn secondary" data-action="random">${icon('trophy', 17)} RANDOM COMPETITION</button></div>` : ''}
      ${game === 'build-together' ? '<label class="play-label">Room code<input class="play-input" id="join-code" maxlength="6" placeholder="Enter your team’s code"></label><button class="play-btn secondary" data-action="join-room">JOIN ROOM</button>' : ''}
    </section>`;
  }

  function stepsMarkup(game) {
    const steps = game === 'idea-wars'
      ? [['01', 'GET A PROBLEM'], ['02', 'SUBMIT YOUR IDEA', '2 MIN'], ['03', 'VOTE FOR THE BEST'], ['04', 'WIN & EARN XP']]
      : game === 'build-together'
        ? [['01', 'JOIN YOUR TEAM'], ['02', 'BUILD TOGETHER', '10 MIN'], ['03', 'NAME YOUR CREATION'], ['04', 'SAVE TO YOUR LIBRARY']]
        : [['01', 'GET A CHALLENGE'], ['02', 'PREPARE YOUR PITCH', '60 SEC'], ['03', 'TAKE THE STAGE'], ['04', 'CLAIM YOUR PLACE']];
    return `<div class="play-steps">${steps.map(([number, label, note], index) =>
      `<div class="play-step"><strong>${number}</strong><span>${label}${note ? `<small>${note}</small>` : ''}</span>${index < steps.length - 1 ? '<i>→</i>' : ''}</div>`
    ).join('')}</div>`;
  }

  function judgingMarkup(game) {
    const items = categories[game] || [];
    if (!items.length) return '';
    return `<div class="play-judges"><span>JUDGING CRITERIA</span><div>${items.map((item, index) =>
      `<span><b>${['✦', '◎', '▣', '✧', '◈'][index]}</b>${esc(item)}</span>`
    ).join('')}</div></div>`;
  }

  function pitchLeaderboardHint() {
    return `<section class="play-panel"><div class="play-panel-heading"><span><small>THE COMMUNITY</small><h2>Leaderboard</h2></span></div>${leaderboardMarkup()}</section>`;
  }

  function dailyMarkup() {
    const daily = state.daily;
    if (!daily) return '<section class="play-panel"><p class="play-empty">Loading today’s challenge…</p></section>';
    const elapsed = daily.startedAt ? Math.max(0, 60 - Math.floor((Date.now() - daily.startedAt) / 1000)) : 60;
    const running = Boolean(daily.startedAt && !daily.submission && elapsed > 0);
    const rows = daily.gallery || [];
    return `<section class="play-daily-hero"><div class="play-daily-content"><span class="play-eyebrow"><i></i> TODAY’S CREATIVE SPARK · ${esc(daily.day)}</span><h2>${esc(daily.challenge)}</h2><div class="play-daily-timer ${running ? 'running' : ''}" id="daily-timer">${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}</div>
      ${daily.submission ? `<div class="play-submitted"><span>YOUR ANSWER IS IN</span><p>${esc(daily.submission.text)}</p><small>+10 XP earned</small></div>` : running ? `<form data-form="daily-submit" class="play-submit-form"><textarea class="play-textarea" id="daily-answer" maxlength="1000" placeholder="Your idea begins here…"></textarea><button class="play-btn" type="submit">${icon('send', 16)} SUBMIT YOUR ANSWER</button></form>` : `<button class="play-btn" data-action="start-daily" ${daily.startedAt ? 'disabled' : ''}>${icon('clock', 18)} ${daily.startedAt ? 'TIME IS UP — COME BACK TOMORROW' : 'START MY 60-SECOND TIMER'}</button>`}</div><div class="play-daily-art">${artScene('daily')}</div></section>
      <section class="play-panel"><div class="play-panel-heading"><span><small>YOUR MOMENT TO SHINE</small><h2>Community gallery</h2></span><span class="play-round-badge">${rows.length} ENTRIES</span></div>
      ${rows.length ? `<div class="play-gallery">${rows.map((entry, index) => {
        const voted = daily.myVote === entry.uid;
        const locked = Boolean(daily.myVote || entry.uid === state.user?.uid || !daily.submission);
        return `<article class="play-entry-card"><div class="play-gallery-head">${avatar(entry)}<strong>@${esc(entry.username)}</strong><span>${index + 1} · ${entry.votes || 0} ♥</span></div><p>${esc(entry.text)}</p><button class="play-btn secondary small" data-action="vote-daily" data-uid="${esc(entry.uid)}" ${locked ? 'disabled' : ''}>${voted ? 'YOUR VOTE' : entry.uid === state.user?.uid ? 'YOUR ENTRY' : daily.myVote ? 'VOTED' : 'VOTE FOR THIS IDEA'}</button></article>`;
      }).join('')}</div>` : '<p class="play-empty">The community gallery will grow as players submit today.</p>'}
      </section>
      <section class="play-panel"><div class="play-panel-heading"><span><small>KEEP THE STREAK ALIVE</small><h2>Previous challenges</h2></span></div><div class="play-previous">${(daily.previousDays || []).map(day => `<div><span>${new Date(`${day.date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}</span><strong>${esc(day.challenge)}</strong></div>`).join('')}</div></section>
      <section class="play-panel"><div class="play-panel-heading"><span><small>THE COMMUNITY</small><h2>Daily leaderboard</h2></span><span class="play-round-badge">${esc(daily.day)}</span></div>${daily.leaderboard?.length ? `<div class="play-leaderboard">${daily.leaderboard.slice(0, 5).map((player, index) => `<div class="play-leader-row"><span class="play-place">${index + 1}</span>${avatar(player)}<strong>@${esc(player.username)}</strong><span class="play-xp">${player.votes} votes</span></div>`).join('')}</div>` : '<p class="play-empty">Daily rankings will appear when players share and vote on their ideas.</p>'}</section>`;
  }

  function roomMarkup(room) {
    if (!room) return '<section class="play-panel"><p class="play-empty">Create a room, join a friend, or find a live competition to get started.</p></section>';
    const game = gameInfo[room.game];
    const myPlayer = room.players?.[state.user?.uid];
    const countdown = Math.max(0, Math.ceil(((room.state === 'preparing' && room.game === 'pitch-battle' ? room.preparationDeadline : room.state === 'presenting' ? room.presentationDeadline : room.state === 'voting' ? room.voteDeadline : room.deadline) - Date.now()) / 1000));
    const timer = room.state !== 'waiting' && room.state !== 'completed' ? `<span class="play-countdown" id="room-countdown">${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}</span>` : '';
    let panel = '';
    if (room.state === 'waiting') {
      panel = `<div class="play-lobby"><div><span class="play-eyebrow"><i></i> WAITING ROOM</span><h3>Gather your minds</h3><p>Share this room code with the players you want to invite.</p><div class="play-room-code">${esc(room.code)}<button data-action="copy-code" title="Copy room code">COPY</button></div></div>${playerPills(room.players)}<button class="play-btn ${myPlayer?.ready ? 'ready-btn' : ''}" data-action="ready">${myPlayer?.ready ? 'YOU’RE READY — WAITING FOR YOUR TEAM' : 'I’M READY'}</button></div>`;
    } else if (room.game === 'build-together' && room.state === 'active') {
      const entries = Object.values(room.contributions || {}).sort((a, b) => a.createdAt - b.createdAt);
      const messages = Object.values(room.chat || {}).sort((a, b) => a.createdAt - b.createdAt);
      panel = `<div class="play-build-workspace"><div class="play-work-top"><span><small>TEAM CHALLENGE</small><h3>${esc(room.prompt)}</h3></span>${timer}</div>${playerPills(room.players)}
        <form data-form="contribute"><label class="play-label">${state.editContributionId ? 'Edit your contribution' : 'Add to your shared creation'}<textarea id="build-contribution" class="play-textarea" maxlength="1200" placeholder="Share a feature, a sketch in words, or a fresh idea…">${esc(state.buildDraft)}</textarea></label><div class="play-action-row"><button type="submit" class="play-btn">${icon('spark', 17)} ${state.editContributionId ? 'SAVE CHANGES' : 'ADD CONTRIBUTION'}</button>${state.editContributionId ? '<button type="button" class="play-btn secondary" data-action="cancel-edit">CANCEL</button>' : ''}</div></form>
        <div class="play-contributions"><h4>LIVE TEAM WORKSPACE <span>${entries.length} IDEAS</span></h4>${entries.length ? entries.map((entry, index) => {
          const id = Object.keys(room.contributions || {}).sort((a, b) => room.contributions[a].createdAt - room.contributions[b].createdAt)[index];
          return `<article>${avatar({ username: entry.username })}<div><strong>${displayName(entry)}</strong><p>${esc(entry.text)}</p>${entry.uid === state.user?.uid ? `<button class="play-edit-link" data-action="edit-contribution" data-id="${esc(id)}">EDIT IDEA</button>` : ''}</div></article>`;
        }).join('') : '<p class="play-empty">Your team’s ideas will appear here as you create.</p>'}</div>
        <div class="play-team-chat"><h4>TEAM CHAT</h4><div class="play-chat-messages">${messages.map(message => `<p><strong>${displayName(message)}</strong> ${esc(message.text)}</p>`).join('') || '<span>Say hello to your team.</span>'}</div><form data-form="chat"><input class="play-input" id="team-chat" maxlength="1200" placeholder="Message your teammates…" value="${esc(state.chatDraft)}"><button type="submit" class="play-icon-button" aria-label="Send message">${icon('send', 18)}</button></form></div>
      </div>`;
    } else if (room.state === 'active' || room.state === 'preparing') {
      const prep = room.game === 'pitch-battle';
      const draft = room.game === 'idea-wars' ? state.draft : state.draft;
      const ownSubmission = room.submissions?.[state.user?.uid];
      panel = `<div class="play-round"><div class="play-work-top"><span><small>${prep ? 'PREPARE YOUR PITCH' : 'THE CHALLENGE'}</small><h3>${esc(room.prompt)}</h3></span>${timer}</div>${playerPills(room.players)}
        ${ownSubmission ? `<div class="play-submitted"><span>YOUR ${prep ? 'PITCH' : 'IDEA'} IS LOCKED IN</span><p>${esc(ownSubmission.text)}</p></div>` : `<form data-form="competition-submit" class="play-submit-form"><label class="play-label">${prep ? 'Get your pitch ready before the stage is yours' : 'What is your idea?'}<textarea id="competition-answer" class="play-textarea" maxlength="2000" placeholder="The best ideas start with one sentence…">${esc(draft)}</textarea></label><button type="submit" class="play-btn">${icon('send', 16)} ${prep ? 'SUBMIT YOUR PITCH' : 'SUBMIT MY IDEA'}</button></form>`}
      </div>`;
    } else if (room.state === 'presenting') {
      const presenterUid = room.currentPresenterUid;
      const presenter = room.players?.[presenterUid];
      const submission = room.submissions?.[presenterUid];
      panel = `<div class="play-stage"><span class="play-eyebrow"><i></i> ON THE STAGE</span><span class="play-stage-name">${displayName(presenter)}</span>${timer}<p>${submission ? esc(submission.text) : 'This player did not submit a pitch.'}</p><small>PRESENTATION ${Math.min((room.presentationIndex || 0) + 1, Object.keys(room.players || {}).length)} OF ${Object.keys(room.players || {}).length}</small></div>`;
    } else if (room.state === 'voting') {
      const entries = Object.values(room.submissions || {});
      panel = `<div class="play-voting"><div class="play-work-top"><span><small>YOUR VOICE MATTERS</small><h3>Vote for the strongest idea</h3></span>${timer}</div>
      ${categories[room.game].map(category => {
        const key = `${state.user?.uid}_${category}`;
        const mine = room.votes?.[key];
        const chosen = state.categorySelection[category] || '';
        return `<div class="play-vote-category"><h4>${esc(category)} <span>${mine ? 'VOTE LOCKED' : 'CHOOSE ONE'}</span></h4><div>${entries.map(entry => {
          const own = entry.uid === state.user?.uid;
          return `<button class="play-vote-option ${chosen === entry.uid ? 'chosen' : ''}" data-action="select-vote" data-category="${esc(category)}" data-uid="${esc(entry.uid)}" ${own || mine ? 'disabled' : ''}><strong>${displayName(entry)}</strong><p>${esc(entry.text)}</p>${mine?.submissionUid === entry.uid ? '<b>YOUR PICK</b>' : ''}</button>`;
        }).join('')}</div>${chosen && !mine ? `<button class="play-btn small" data-action="cast-vote" data-category="${esc(category)}" data-uid="${esc(chosen)}">LOCK IN ${esc(category.toUpperCase())} VOTE</button>` : ''}</div>`;
      }).join('')}</div>`;
    } else if (room.state === 'completed' && room.game === 'build-together') {
      const title = state.creationTitle || room.creation?.title || '';
      const description = state.creationDescription || room.creation?.description || '';
      const contributions = Object.values(room.contributions || {});
      panel = `<div class="play-finished"><span class="play-eyebrow">YOUR TEAM MADE THIS</span><h3>${esc(room.creation?.title || 'The idea is yours to name')}</h3><p>${esc(room.creation?.description || 'Give your team creation a name and a description to save it to your ZIDEA Library.')}</p>
        ${contributions.map(entry => `<article><strong>${displayName(entry)}</strong><p>${esc(entry.text)}</p></article>`).join('')}
        ${room.creation?.savedBy?.[state.user?.uid] ? '<p class="play-notice">Saved to your ZIDEA Library.</p>' : `<form data-form="save-creation"><label class="play-label">Creation name<input class="play-input" id="creation-title" maxlength="80" placeholder="Name your creation" value="${esc(title)}"></label><label class="play-label">Creation description<textarea id="creation-description" class="play-textarea" maxlength="1000" placeholder="What did your team create?">${esc(description)}</textarea></label><button type="submit" class="play-btn">${icon('box', 16)} SAVE TO MY LIBRARY</button></form>`}</div>`;
    } else {
      const results = room.results || [];
      const winner = results[0];
      panel = `<div class="play-results"><span class="play-eyebrow"><i></i> ${room.mode === 'solo' ? 'PRACTICE COMPLETE' : 'FINAL RESULTS'}</span><h3>${room.mode === 'solo' ? 'Pitch practice complete' : winner ? `${displayName(winner)} takes the crown` : 'Round complete'}</h3><p>${room.mode === 'solo' ? 'Your practice round is complete. Keep refining your pitch.' : 'Judged by the players in the room. Final scores are shown below.'}</p>
        ${results.map(result => `<article class="play-result-row"><span class="play-result-place">${result.place === 1 ? '♛' : `#${result.place}`}</span>${avatar(result)}<div><strong>${displayName(result)}</strong><small>${result.place === 1 ? 'FIRST PLACE' : result.place === 2 ? 'SECOND PLACE' : result.place === 3 ? 'THIRD PLACE' : 'COMPETITOR'}</small>${result.categories ? `<div class="play-score-breakdown">${Object.entries(result.categories).map(([category, score]) => `<span>${esc(category)} <b>${score}</b></span>`).join('')}</div>` : ''}</div><b class="play-final-score">${result.score || 0} PTS</b></article>`).join('')}
        ${room.game === 'idea-wars' || room.game === 'pitch-battle' ? `<p class="play-reward-line">${room.mode === 'solo' ? '+10 XP practice reward' : `+${winner ? 75 : 25} XP participation · winner bonus XP awarded`}</p>` : ''}
      </div>`;
    }
    return `<section class="play-panel play-room-panel"><div class="play-room-heading"><div><span class="play-eyebrow">${esc(game.title)} · ${esc(room.mode.toUpperCase())}</span><h2>${room.state === 'waiting' ? 'The lobby' : room.state === 'completed' ? 'Match complete' : room.state === 'voting' ? 'Cast your votes' : room.state === 'presenting' ? 'The pitch stage' : room.game === 'build-together' ? 'The shared studio' : 'The arena is live'}</h2></div><div class="play-room-heading-actions">${timer && room.state === 'waiting' ? '' : room.state !== 'waiting' && room.state !== 'completed' ? timer : ''}<span class="play-room-code">${esc(room.code)}</span><button class="play-icon-button" data-action="copy-code" title="Copy room code">${icon('box', 17)}</button><button class="play-icon-button" data-action="close-room" title="Close room">×</button></div></div>${panel}</section>`;
  }

  function detailMarkup() {
    const game = gameInfo[state.game];
    if (!game) return homeMarkup();
    if (state.game === '60-second-challenge') {
      return `<div class="play-shell play-detail">${backHeader(game)}${state.error ? `<div class="play-alert">${esc(state.error)}</div>` : ''}${dailyMarkup()}</div>`;
    }
    return `<div class="play-shell play-detail">${backHeader(game)}${state.error ? `<div class="play-alert">${esc(state.error)}</div>` : ''}${state.info ? `<div class="play-notice">${esc(state.info)}</div>` : ''}
      ${!state.room ? `<section class="play-game-hero ${game.accent}"><div>${artScene(game.art)}</div><span class="play-eyebrow">THINK. CREATE. COMPETE. CONNECT.</span><h2>${esc(game.description)}</h2></section>${roomControls(state.game)}${state.game === 'idea-wars' ? stepsMarkup(state.game) : ''}${state.game === 'pitch-battle' ? judgingMarkup(state.game) : ''}${state.game === 'pitch-battle' ? pitchLeaderboardHint() : ''}${state.game === 'build-together' ? `<section class="play-panel"><div class="play-panel-heading"><span><small>YOUR IDEAS, ALL IN ONE PLACE</small><h2>My previous creations</h2></span><button class="play-btn secondary small" data-action="load-library">VIEW MY LIBRARY</button></div>${state.library.map(item => `<div class="play-history-row"><span class="play-history-icon">⌂</span><span><strong>${esc(item.title)}</strong><small>${esc(item.prompt)} · ${new Date(item.completedAt).toLocaleDateString()}</small></span></div>`).join('') || '<p class="play-empty">Create your first team build to see it here.</p>'}</section>` : ''}` : roomMarkup(state.room)}
    </div>`;
  }

  function render() {
    const root = getRoot();
    if (!root || !state.initialized) return;
    const active = root.contains(document.activeElement) ? document.activeElement : null;
    const activeId = active?.id;
    const selectionStart = active && 'selectionStart' in active ? active.selectionStart : null;
    const selectionEnd = active && 'selectionEnd' in active ? active.selectionEnd : null;
    const authenticated = Boolean(state.user && state.profile);
    const shell = state.game ? detailMarkup() : homeMarkup();
    root.innerHTML = `${shell}${!authenticated && state.game ? '<div class="play-auth-note">Sign in with your secure ZIDEA account to play across devices.</div>' : ''}`;
    if (activeId) {
      const restored = document.getElementById(activeId);
      if (restored) {
        restored.focus({ preventScroll: true });
        if (selectionStart !== null && typeof restored.setSelectionRange === 'function') {
          restored.setSelectionRange(selectionStart, selectionEnd);
        }
      }
    }
    if (state.game === '60-second-challenge') updateClock();
    if (state.room) updateClock();
  }

  async function openGame(game) {
    if (!gameInfo[game]) return;
    state.game = game;
    state.error = '';
    state.info = '';
    state.room = null;
    state.roomCode = '';
    state.draft = '';
    state.buildDraft = '';
    state.chatDraft = '';
    state.categorySelection = {};
    stopRoomPolling();
    render();
    if (!await requirePlayAuth()) return;
    if (game === '60-second-challenge') {
      try {
        state.daily = await api('daily');
        render();
        startClock();
      } catch (error) { setMessage(error.message); }
    }
    if (game === 'pitch-battle') {
      try {
        const [leaderboard, history] = await Promise.all([api('leaderboard'), api('history')]);
        state.leaderboard = leaderboard.leaderboard || [];
        state.history = history.history || [];
        render();
      } catch (error) { setMessage(error.message); }
    }
    if (game === 'build-together') {
      try { state.library = (await api('library')).creations || []; render(); }
      catch (error) { setMessage(error.message); }
    }
  }

  async function requirePlayAuth() {
    try {
      const auth = await loadFirebase();
      if (!auth.currentUser) {
        state.info = 'Secure sign-in is required before you can enter a live game.';
        render();
        window.showPage?.('login');
        showToast('Sign in to your ZIDEA account to play.');
        return false;
      }
      state.user = auth.currentUser;
      state.profile = await refreshProfile();
      if (!state.profile) {
        state.info = 'Choose a ZIDEA username to finish setting up your player profile.';
        window.showPage?.('signup');
        render();
        return false;
      }
      return true;
    } catch (error) {
      state.error = error.message;
      render();
      return false;
    }
  }

  async function createRoom(game, mode) {
    if (!await requirePlayAuth()) return;
    const friend = document.getElementById('friend-username')?.value.trim().replace(/^@/, '') || '';
    if (friend && mode === 'random') return setMessage('Choose either a friend or random matchmaking, not both.');
    if (state.game === 'build-together' && mode === 'friends' && !friend) {
      const confirmation = window.confirm('Create an open room? You can share its room code with friends.');
      if (!confirmation) return;
    }
    await runAction(async () => {
      const result = await api('create', { game, mode, friendUsername: friend });
      await openRoom(result.room.code);
      if (friend) state.info = `A challenge invitation for @${friend} is ready in their Arcade.`;
      render();
    });
  }

  async function joinRandom(game) {
    if (!await requirePlayAuth()) return;
    await runAction(async () => {
      const result = await api('random', { game });
      await openRoom(result.room.code);
    });
  }

  async function joinByCode() {
    const code = document.getElementById('join-code')?.value.trim().toUpperCase();
    if (!code) return setMessage('Enter the room code your friend shared.');
    await runAction(async () => {
      const result = await api('join', { code });
      await openRoom(result.room.code);
    });
  }

  async function openRoom(code) {
    state.roomCode = code;
    const result = await api('room', { code });
    state.room = result.room;
    state.game = result.room.game;
    render();
    startRoomPolling();
  }

  async function runAction(action) {
    try {
      state.error = '';
      await action();
    } catch (error) {
      state.error = error.message || 'That action could not be completed.';
      render();
    }
  }

  function startRoomPolling() {
    stopRoomPolling();
    state.roomPoll = setInterval(async () => {
      if (!state.roomCode || !state.user || !document.querySelector('#page-arcade.page.active')) return;
      try {
        const result = await api('room', { code: state.roomCode });
        state.room = result.room;
        if (state.room.state === 'completed' && state.game === 'build-together') {
          state.library = (await api('library')).creations || [];
        }
        render();
        if (state.room.state === 'completed' || state.room.state === 'expired') stopRoomPolling();
      } catch (error) {
        if (error.message.includes('expired') || error.message.includes('does not exist')) stopRoomPolling();
        state.error = error.message;
        render();
      }
    }, 2200);
  }

  function stopRoomPolling() {
    if (state.roomPoll) clearInterval(state.roomPoll);
    state.roomPoll = null;
  }

  function startClock() {
    if (state.clock) clearInterval(state.clock);
    state.clock = setInterval(updateClock, 250);
  }

  function updateClock() {
    const today = new Date().toISOString().slice(0, 10);
    if (state.game === '60-second-challenge' && state.daily?.day && state.daily.day !== today && !state.dailyRefreshing) {
      state.dailyRefreshing = true;
      api('daily').then(daily => {
        state.daily = daily;
        state.error = '';
        render();
      }).catch(error => {
        state.error = error.message || 'Today’s challenge could not be refreshed.';
        render();
      }).finally(() => {
        state.dailyRefreshing = false;
      });
    }
    const countdown = document.getElementById('room-countdown');
    if (countdown && state.room) {
      const room = state.room;
      const deadline = room.game === 'pitch-battle' && room.state === 'preparing'
        ? room.preparationDeadline
        : room.game === 'pitch-battle' && room.state === 'presenting'
          ? room.presentationDeadline
          : room.state === 'voting' ? room.voteDeadline : room.deadline;
      const seconds = Math.max(0, Math.ceil(((deadline || 0) - Date.now()) / 1000));
      countdown.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
      countdown.classList.toggle('urgent', seconds <= 10);
    }
    const daily = document.getElementById('daily-timer');
    if (daily && state.daily?.startedAt && !state.daily.submission) {
      const seconds = Math.max(0, 60 - Math.floor((Date.now() - state.daily.startedAt) / 1000));
      daily.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
      daily.classList.toggle('urgent', seconds <= 10);
      if (seconds === 0) {
        daily.closest('.play-daily-hero')?.querySelector('form[data-form="daily-submit"]')?.remove();
      }
    }
  }

  function saveDrafts() {
    const competition = document.getElementById('competition-answer');
    const build = document.getElementById('build-contribution');
    const chat = document.getElementById('team-chat');
    const title = document.getElementById('creation-title');
    const description = document.getElementById('creation-description');
    if (competition) state.draft = competition.value;
    if (build) state.buildDraft = build.value;
    if (chat) state.chatDraft = chat.value;
    if (title) state.creationTitle = title.value;
    if (description) state.creationDescription = description.value;
  }

  async function onClick(event) {
    const target = event.target.closest('[data-action], [data-game]');
    if (!target) return;
    saveDrafts();
    if (target.dataset.game) return openGame(target.dataset.game);
    const action = target.dataset.action;
    if (action === 'back') {
      state.game = ''; state.room = null; state.roomCode = ''; state.error = ''; state.info = '';
      stopRoomPolling(); render(); loadHomeData(); return;
    }
    if (action === 'create-room') return createRoom(state.game, target.dataset.mode);
    if (action === 'random') return joinRandom(state.game);
    if (action === 'join-room') return joinByCode();
    if (action === 'ready') {
      if (!await requirePlayAuth()) return;
      return runAction(async () => {
        const result = await api('ready', { code: state.roomCode, ready: !state.room?.players?.[state.user.uid]?.ready });
        state.room = result.room; render();
      });
    }
    if (action === 'close-room') {
      state.room = null; state.roomCode = ''; stopRoomPolling(); render(); return;
    }
    if (action === 'edit-contribution') {
      state.editContributionId = target.dataset.id;
      state.buildDraft = state.room?.contributions?.[state.editContributionId]?.text || '';
      render();
      document.getElementById('build-contribution')?.focus();
      return;
    }
    if (action === 'cancel-edit') {
      state.editContributionId = '';
      state.buildDraft = '';
      render();
      return;
    }
    if (action === 'copy-code') {
      try { await navigator.clipboard.writeText(state.room?.code || target.closest('.play-room-code')?.textContent?.trim() || ''); showToast('Room code copied.'); }
      catch { setMessage('Clipboard access is unavailable. Copy the room code shown in the lobby.'); }
      return;
    }
    if (action === 'select-vote') {
      if (target.disabled) return;
      state.categorySelection[target.dataset.category] = target.dataset.uid;
      render(); return;
    }
    if (action === 'cast-vote') {
      return runAction(async () => {
        const result = await api('vote', { code: state.roomCode, category: target.dataset.category, submissionUid: target.dataset.uid });
        state.room = result.room; state.categorySelection = {}; render();
      });
    }
    if (action === 'start-daily') {
      if (!await requirePlayAuth()) return;
      return runAction(async () => {
        const result = await api('start_daily');
        state.daily = { ...state.daily, startedAt: result.startedAt };
        render(); startClock();
      });
    }
    if (action === 'vote-daily') {
      return runAction(async () => {
        await api('vote_daily', { submissionUid: target.dataset.uid });
        state.daily = await api('daily'); render();
      });
    }
    if (action === 'load-library') {
      return runAction(async () => { state.library = (await api('library')).creations || []; render(); });
    }
    if (action === 'accept-invite') {
      return runAction(async () => {
        const result = await api('accept_invite', { code: target.dataset.code });
        state.invites = (state.invites || []).filter(invite => invite.code !== target.dataset.code);
        await openRoom(result.room.code);
      });
    }
    if (action === 'decline-invite') {
      return runAction(async () => {
        await api('decline_invite', { code: target.dataset.code });
        state.invites = (state.invites || []).filter(invite => invite.code !== target.dataset.code);
        render();
      });
    }
  }

  async function onSubmit(event) {
    const form = event.target.closest('form[data-form]');
    if (!form) return;
    event.preventDefault();
    saveDrafts();
    const kind = form.dataset.form;
    if (kind === 'daily-submit') {
      const text = document.getElementById('daily-answer')?.value.trim() || '';
      if (!text) return setMessage('Write your answer before submitting.');
      return runAction(async () => {
        await api('submit_daily', { text });
        state.daily = await api('daily');
        state.error = '';
        render();
        startClock();
      });
    }
    if (!await requirePlayAuth()) return;
    if (kind === 'competition-submit') {
      const text = document.getElementById('competition-answer')?.value.trim() || '';
      if (!text) return setMessage('Write your idea before submitting.');
      return runAction(async () => {
        const result = await api('submit', { code: state.roomCode, text });
        state.room = result.room; state.draft = ''; render();
      });
    }
    if (kind === 'contribute' || kind === 'chat') {
      const input = document.getElementById(kind === 'chat' ? 'team-chat' : 'build-contribution');
      const text = input?.value.trim() || '';
      if (!text) return setMessage('Enter a contribution before sending.');
      return runAction(async () => {
        const action = kind === 'contribute' && state.editContributionId ? 'edit_contribution' : kind;
        const result = await api(action, {
          code: state.roomCode,
          text,
          contributionId: state.editContributionId
        });
        state.room = result.room;
        if (kind === 'chat') state.chatDraft = '';
        else { state.buildDraft = ''; state.editContributionId = ''; }
        render();
      });
    }
    if (kind === 'save-creation') {
      const title = document.getElementById('creation-title')?.value.trim() || '';
      const description = document.getElementById('creation-description')?.value.trim() || '';
      return runAction(async () => {
        const result = await api('save_creation', { code: state.roomCode, title, description });
        state.room = result.room;
        state.creationTitle = ''; state.creationDescription = '';
        state.info = 'Your team creation is saved in your ZIDEA Library.';
        state.library = (await api('library')).creations || [];
        render();
      });
    }
  }

  function onInput(event) {
    if (event.target.id === 'competition-answer') state.draft = event.target.value;
    if (event.target.id === 'build-contribution') state.buildDraft = event.target.value;
    if (event.target.id === 'team-chat') state.chatDraft = event.target.value;
    if (event.target.id === 'creation-title') state.creationTitle = event.target.value;
    if (event.target.id === 'creation-description') state.creationDescription = event.target.value;
  }

  async function initialize() {
    const root = getRoot();
    if (!root || state.initialized) return;
    state.initialized = true;
    document.body.classList.add('arcade-play');
    root.addEventListener('click', onClick);
    root.addEventListener('submit', onSubmit);
    root.addEventListener('input', onInput);
    root.innerHTML = '<div class="play-shell"><div class="play-loading">Opening the ZIDEA PLAY arena…</div></div>';
    try {
      await loadFirebase();
      if (typeof currentUser !== 'undefined' && currentUser && !state.auth.currentUser) {
        state.info = 'Your existing session needs a secure sign-in before you can play.';
      }
    } catch (error) {
      state.error = error.message;
      document.documentElement.classList.remove('auth-restoring');
      window.showPage?.('landing', { skipHash: true });
      window.openAuthModal?.('login', true);
      showAuthError(authErrorMessage(error));
    }
    render();
    startHomePolling();
    if (state.user) loadHomeData();
  }

  async function renderProfileStats() {
    if (!state.auth?.currentUser) return;
    const stats = document.getElementById('profile-game-stats');
    if (!stats) return;
    try {
      const profile = await refreshProfile();
      if (!profile) return;
      stats.innerHTML = `<div class="arcade-row"><span>ZIDEA PLAY · XP</span><strong>${profile.xp || 0}</strong></div><div class="arcade-row"><span>Matches won</span><strong>${profile.wins || 0}</strong></div><div class="arcade-row"><span>Matches played</span><strong>${profile.matches || 0}</strong></div><div class="arcade-row"><span>Daily streak</span><strong>${profile.streak || 0} days</strong></div>`;
    } catch (error) {
      stats.textContent = error.message || 'Game stats are temporarily unavailable.';
    }
  }

  window.renderArcadeHome = function () {
    initialize().then(() => {
      if (state.game) return;
      render();
      loadHomeData();
    });
  };
  window.startArcadeGame = id => openGame(id);
  window.challengeArcadeGame = id => openGame(id);
  window.handleLogin = handleLogin;
  window.handleSignup = handleSignup;
  window.handleGoogleLogin = handleGoogleLogin;
  window.handleForgotPassword = handleForgotPassword;
  window.handleLogout = handleLogout;
  window.zideaPlayAuth = {
    initialize: loadFirebase,
    getProfileStats: async () => {
      if (!state.auth?.currentUser) return null;
      return refreshProfile();
    },
    getLibrary: async () => {
      if (!state.auth?.currentUser) return [];
      return (await api('library')).creations || [];
    },
    renderProfileStats
  };

  document.addEventListener('DOMContentLoaded', initialize);
})();
