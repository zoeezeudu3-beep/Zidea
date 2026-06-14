const authState = {
  submitLocks: new Map(),
  activeModal: null,
  previousFocus: null
};
const callState = {};
const chessState = {};

function canSubmitAuth(key, wait=1400){
  const now=Date.now();
  const last=authState.submitLocks.get(key)||0;
  if(now-last<wait){
    showToast('Please wait a moment before trying again.');
    return false;
  }
  authState.submitLocks.set(key,now);
  return true;
}

function toggleMobileMore(force){}
function toggleMobileDrawer(){
  const drawer=document.getElementById('mob-drawer');
  const overlay=document.getElementById('mob-drawer-overlay');
  const hamburger=document.getElementById('mob-hamburger');
  if(!drawer)return;
  const open=drawer.classList.toggle('open');
  overlay.classList.toggle('show',open);
  hamburger.classList.toggle('open',open);
  document.body.style.overflow=open?'hidden':'';
}
function closeMobileDrawer(){
  const drawer=document.getElementById('mob-drawer');
  const overlay=document.getElementById('mob-drawer-overlay');
  const hamburger=document.getElementById('mob-hamburger');
  if(!drawer)return;
  drawer.classList.remove('open');
  overlay.classList.remove('show');
  if(hamburger)hamburger.classList.remove('open');
  document.body.style.overflow='';
}
function getUserInitials(name){
  const parts=String(name||'U').trim().split(/[\s._-]+/).filter(Boolean);
  if(parts.length===1)return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0]+parts[1][0]).toUpperCase();
}
function userColor(name){
  const colors=['#C9A84C','#A38738','#E6CE8B','#9F7D2D','#FFD87A','#D4B36F'];
  let hash=0;
  for(const ch of String(name||''))hash=(hash*31+ch.charCodeAt(0))>>>0;
  return colors[hash%colors.length];
}
function showToast(message){
  let wrap=document.getElementById('toast-wrap');
  if(!wrap){wrap=document.createElement('div');wrap.id='toast-wrap';wrap.className='toast-wrap';document.body.appendChild(wrap);}
  const toast=document.createElement('div');
  toast.className='toast';
  toast.textContent=message;
  wrap.appendChild(toast);
  setTimeout(()=>{toast.remove();},2600);
}
function showConfirmModal(title,body,onConfirm){
  let modal=document.getElementById('confirm-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='confirm-modal';
    modal.className='confirm-modal';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-labelledby','confirm-modal-title');
    modal.innerHTML=`<div class="confirm-box card"><h2 id="confirm-modal-title"></h2><p id="confirm-modal-body"></p><div class="confirm-actions"><button type="button" class="btn-ghost" data-confirm-cancel>Cancel</button><button type="button" class="btn-primary" data-confirm-ok>Sign Out</button></div></div>`;
    document.body.appendChild(modal);
  }
  modal.querySelector('#confirm-modal-title').textContent=title;
  modal.querySelector('#confirm-modal-body').textContent=body;
  modal.classList.add('show');
  const close=()=>modal.classList.remove('show');
  modal.querySelector('[data-confirm-cancel]').onclick=close;
  modal.querySelector('[data-confirm-ok]').onclick=()=>{close();onConfirm();};
  modal.querySelector('[data-confirm-cancel]').focus();
}
function trapActiveModalFocus(event){
  const modal=authState.activeModal;
  if(!modal||!modal.classList.contains('show'))return;
  if(event.key==='Escape'){closeAuthModal();return;}
  if(event.key!=='Tab')return;
  const focusables=[...modal.querySelectorAll('a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null);
  if(!focusables.length)return;
  const first=focusables[0],last=focusables[focusables.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
}
const INFO_CONTENT={
  privacy:{title:'Privacy Policy',body:'Zidea stores account details, profile settings, ideas, messages, and presence data needed to run the app. Do not share sensitive personal information in chats or idea submissions. A fuller policy will be published before production launch.'},
  terms:{title:'Terms of Service',body:'Use Zidea respectfully. You are responsible for the content you create, messages you send, and calls you join. Do not abuse, impersonate, spam, or upload content you do not have permission to share.'},
  contact:{title:'Contact',body:'Questions, account deletion requests, and support issues can be sent to hello@zidea.app. Include your @username and account email so the team can verify the request.'}
};
function openInfoModal(kind){
  const item=INFO_CONTENT[kind]||INFO_CONTENT.contact;
  const titleEl=document.getElementById('info-modal-title');
  const bodyEl=document.getElementById('info-modal-body');
  const modal=document.getElementById('info-modal');
  if(titleEl)titleEl.textContent=item.title;
  if(bodyEl)bodyEl.textContent=item.body;
  if(modal)modal.classList.add('show');
}
function closeInfoModal(){
  document.getElementById('info-modal')?.classList.remove('show');
}
function showWelcomeTour(){
  if(!currentUser)return;
  const key=`zidea_welcome_seen_${currentUser.username}`;
  if(load(key))return;
  document.getElementById('welcome-modal')?.classList.add('show');
}
function dismissWelcomeTour(){
  if(currentUser)save(`zidea_welcome_seen_${currentUser.username}`,true);
  document.getElementById('welcome-modal')?.classList.remove('show');
}
function applyTheme(){
  const theme=load(currentUser?`zidea_theme_${currentUser.username}`:'zidea_theme')||'dark';
  document.documentElement.style.filter=theme==='light'?'invert(1) hue-rotate(180deg)':'';
}
const PAGE_META={
  landing:{title:'Zidea — Generate Ideas. Find Collaborators.',desc:'Generate AI-powered startup and project ideas, match with the right collaborator, and connect with a community of builders on Zidea.'},
  login:{title:'Sign In — Zidea',desc:'Sign in to your Zidea account.'},
  signup:{title:'Sign Up — Zidea',desc:'Create your Zidea account and start exploring ideas.'},
  dashboard:{title:'Home — Zidea',desc:'Discover people and start chats, calls, and collaboration matches.'},
  ideas:{title:'Generate Ideas — Zidea',desc:'Generate startup and project ideas tailored to your goals.'},
  library:{title:'Library — Zidea',desc:'Browse your saved and starred ideas.'},
  explore:{title:'Explore — Zidea',desc:'Discover inspiring ideas from the community.'},
  chat:{title:'Messages — Zidea',desc:'Chat with builders, join groups, and collaborate in real time.'},
  arcade:{title:'Arcade — Zidea',desc:'Play chess, tic-tac-toe, rock paper scissors, and more with friends.'},
  profile:{title:'Profile — Zidea',desc:'View and manage your Zidea profile and stats.'},
  settings:{title:'Settings — Zidea',desc:'Adjust your account and app preferences.'},
  help:{title:'Help — Zidea',desc:'Get quick answers and guidance for using Zidea.'}
};
function setPageMeta(name){
  const meta=PAGE_META[name]||PAGE_META.landing;
  document.title=meta.title;
  const desc=document.getElementById('meta-description');
  if(desc)desc.setAttribute('content',meta.desc);
}
const PRIVATE_PAGES=new Set(['dashboard','arcade','chat','ideas','library','explore','profile','settings','help']);
let suppressHashChange=false;
function updateLandingAuthUI(){
  const box=document.getElementById('landing-auth-actions');
  if(!box)return;
  if(currentUser){
    box.innerHTML='<button class="btn-primary" style="padding:8px 16px" onclick="showPage(\'dashboard\')">Open Dashboard</button>';
  } else {
    box.innerHTML='<button class="btn-ghost" id="landing-login-btn" style="padding:8px 16px" onclick="showPage(\'login\')">Log In</button><button class="btn-primary" id="landing-signup-btn" style="padding:8px 16px" onclick="showPage(\'signup\')">Sign Up</button>';
  }
}
function syncSidebarActive(name){
  document.querySelectorAll('.sidebar .nav-item').forEach(btn=>{const click=btn.getAttribute('onclick')||'';const match=click.match(/showPage\('([^']+)'\)/);btn.classList.toggle('active',!!match&&match[1]===name);});
}
function renderSidebarNav(){
  const route=(window.location.hash||'#landing').replace('#','')|| (currentUser?'dashboard':'landing');
  const navHtml = `
    <div class="sidebar-label">Main</div>
    <button class="nav-item" onclick="showPage('dashboard')">🏠 Home</button>
    <button class="nav-item" onclick="showPage('ideas')">💡 Generate Ideas</button>
    <button class="nav-item" onclick="showPage('library')">📚 Library</button>
    <button class="nav-item" onclick="showPage('explore')">🔥 Explore</button>
    <div class="sidebar-label">Social</div>
    <button class="nav-item" onclick="showPage('chat')">💬 Messages</button>
    <button class="nav-item" onclick="showPage('arcade')">🎮 Arcade</button>
    <div class="sidebar-label">Account</div>
    <button class="nav-item" onclick="showPage('profile')">👤 Profile</button>
    <button class="nav-item" onclick="showPage('settings')">⚙️ Settings</button>
    <button class="nav-item" onclick="showPage('help')">❓ Help</button>
  `;
  document.querySelectorAll('.sidebar-nav').forEach(nav=>{nav.innerHTML=navHtml;});
  applySidebarA11y();
  syncSidebarActive(route);
  ['discover','ideas','explore','chat','arcade','profile'].forEach(k=>{const btn=document.getElementById('mob-'+k);if(btn)btn.classList.toggle('active',(k==='discover'&&route==='dashboard')||k===route);});
  const more=document.getElementById('mob-more');
  if(more)more.classList.toggle('active',['zidai','library','settings','help'].includes(route));
}
function applySidebarA11y(){
  document.querySelectorAll('.sidebar .nav-item,.mob-nav-btn').forEach(btn=>{
    const label=btn.textContent.replace(/[^\p{L}\p{N}\s&]/gu,'').trim().replace(/\s+/g,' ');
    if(label&&!btn.hasAttribute('aria-label'))btn.setAttribute('aria-label',label);
  });
}
function openAuthModal(kind,skipHash=false){
  const login=document.getElementById('page-login'),signup=document.getElementById('page-signup');
  login.classList.remove('show');signup.classList.remove('show');
  authState.previousFocus=document.activeElement;
  const modal=kind==='signup'?signup:login;
  if(kind==='signup')signup.classList.add('show');else login.classList.add('show');
  authState.activeModal=modal;
  setTimeout(()=>modal?.querySelector('input,button,a,textarea,select,[tabindex]:not([tabindex="-1"])')?.focus(),0);
  setPageMeta(kind==='signup'?'signup':'login');
  if(!skipHash){suppressHashChange=true;window.location.hash=kind;setTimeout(()=>{suppressHashChange=false;},0);}
}
function openMatcher(){
  showPage('ideas');
  setTimeout(()=>{document.getElementById('idea-matchmaker')?.scrollIntoView({behavior:'smooth',block:'start'});},260);
}
function closeAuthModal(skipHash=false){
  document.getElementById('page-login').classList.remove('show');
  document.getElementById('page-signup').classList.remove('show');
  authState.activeModal=null;
  if(authState.previousFocus&&typeof authState.previousFocus.focus==='function')authState.previousFocus.focus();
  authState.previousFocus=null;
  if(!skipHash&&(window.location.hash==='#login'||window.location.hash==='#signup')){suppressHashChange=true;window.location.hash=currentUser?'dashboard':'landing';setTimeout(()=>{suppressHashChange=false;},0);}
}
function showPage(name,opts={}){
  if(name==='signin')name='login';
  if(name==='login'||name==='signup'){openAuthModal(name,opts.skipHash);return;}
  closeAuthModal(true);
  if(PRIVATE_PAGES.has(name)&&!currentUser){name='landing';openAuthModal('login',true);showToast('Please sign in to continue.');}
  document.querySelectorAll('.page').forEach(p=>{p.classList.remove('active');p.style.display='none';p.style.opacity='0';});
  let el=document.getElementById('page-'+name);
  if(!el){name='landing';el=document.getElementById('page-'+name);}
  if(!el)return;
  el.classList.add('active');
  el.style.display='flex';
  el.style.opacity='1';
  document.body.classList.toggle('app-active',name!=='landing'&&name!=='login'&&name!=='signup');
  setPageMeta(name);
  updateLandingAuthUI();
  syncSidebarActive(name);
  document.querySelectorAll('.mob-nav-btn, .mob-bottom-btn').forEach(btn=>{
    const click=btn.getAttribute('onclick')||'';
    const match=click.match(/showPage\('([^']+)'\)/);
    const alt=click.includes('openMatcher')?'ideas':null;
    btn.classList.toggle('active',((!!match&&((match[1]==='dashboard'&&name==='dashboard')||match[1]===name))||(alt===name)));
  });
  closeMobileDrawer();
  if(!opts.skipHash){suppressHashChange=true;window.location.hash=name;setTimeout(()=>{suppressHashChange=false;},0);}
  if(name==='dashboard'){searchQuery='';const si=document.getElementById('search-input');if(si)si.value='';renderUsers();renderOnline();}
  if(name==='chat'){document.getElementById('chat-username').textContent='@'+(currentUser?.username||'');const ci=document.getElementById('convo-items');if(ci&&!Object.keys(chatCache).length)ci.innerHTML=skeletonConvos(5);loadAllConvos().then(()=>{renderConvos(activeChatUser);if(!activeChatUser&&!activeGroupId){const chatted=Object.keys(chatCache);if(chatted.length)openConvo(chatted[0]);}});loadMyGroups().then(()=>{if(activeConvoTab==='groups')renderGroupList();});}
  if(name!=='chat')document.getElementById('page-chat')?.classList.remove('chat-open');
  if(name==='arcade'){const u=document.getElementById('arcade-username');if(u)u.textContent='@'+(currentUser?.username||'');renderArcadeHome();listenGameInvites();}
  if(name==='ideas'){const u=document.getElementById('ideas-username');if(u)u.textContent='@'+(currentUser?.username||'');ensureMatchSeeds();prefillMatchUser();updateMatchStep();syncMatchIdeasFromFirebase().then(()=>updateMatchStep());}
  if(name==='library'){const u=document.getElementById('library-username');if(u)u.textContent='@'+(currentUser?.username||'');const list=document.getElementById('library-list');if(list)list.innerHTML=skeletonUserCards(2);Promise.all([syncMatchIdeasFromFirebase(),syncCreatedIdeasFromFirebase()]).then(renderLibrary).catch(renderLibrary);}
  if(name==='explore'){const u=document.getElementById('explore-username');if(u)u.textContent='@'+(currentUser?.username||'');const list=document.getElementById('explore-list');if(list)list.innerHTML=skeletonUserCards(2);renderExplore();}
  if(name==='profile'){const u=document.getElementById('profile-username-sidebar');if(u)u.textContent='@'+(currentUser?.username||'');const recent=document.getElementById('profile-recent-ideas');if(recent)recent.innerHTML=skeletonUserCards(2);renderProfile();}
  if(name==='settings'){const u=document.getElementById('settings-username');if(u)u.textContent='@'+(currentUser?.username||'');renderSettings();}
  if(name==='help'){const u=document.getElementById('help-username');if(u)u.textContent='@'+(currentUser?.username||'');}
}
function handleHashRoute(){
  if(suppressHashChange)return;
  const route=(window.location.hash||'#landing').replace('#','');
  if(route==='login'||route==='signup'){openAuthModal(route,true);if(!currentUser)showPage('landing',{skipHash:true});return;}
  if(route.startsWith('arcade-')){
    if(!currentUser){showPage('landing',{skipHash:true});openAuthModal('login',true);return;}
    const game=route.replace('arcade-','');
    showPage('arcade',{skipHash:true});
    if(['tictactoe','chess','rps','amongus'].includes(game))startGame(game);
    return;
  }
  showPage(route||'landing',{skipHash:true});
}
window.addEventListener('hashchange',handleHashRoute);
window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeAuthModal();closeMobileDrawer();}});
// Auth
function normalizeEmail(email){return String(email||'').trim().toLowerCase();}
function getAccounts(){
  const raw=load('zidea_accounts')||{};
  const accounts={};
  Object.entries(raw).forEach(([key,value])=>{
    if(!value||typeof value!=='object')return;
    const email=normalizeEmail(value.email||key);
    if(email)accounts[email]={...value,email};
  });
  save('zidea_accounts',accounts);
  return accounts;
}
async function findRemoteAccount(email){
  if(!onlineReady())return null;
  const data=await withTimeout(db.read('accounts'),1600).catch(()=>null);
  if(!data)return null;
  const found=Object.values(data).find(a=>normalizeEmail(a?.email)===email);
  if(!found)return null;
  return {email,username:found.username,password:found.password||'',wins:found.wins||0,losses:found.losses||0};
}
function saveAccount(email,account){
  const accounts=getAccounts();
  accounts[email]={...account,email};
  save('zidea_accounts',accounts);
}
function enterApp(user){
  currentUser=user;
  save('zidea_session',user);
  try{setLoggedInUI();}catch(error){console.warn('setLoggedInUI failed',error);}
  try{updateLandingAuthUI();}catch(error){console.warn('updateLandingAuthUI failed',error);}
  try{closeAuthModal(true);}catch(error){console.warn('closeAuthModal failed',error);}
  try{showPage('dashboard');}catch(error){console.warn('showPage dashboard failed',error);}
  setTimeout(()=>{try{startFirebase();listenIncoming();syncIdeasFromFirebase();syncAvatarFromFirebase();}catch(error){console.warn('background sync failed',error);}},100);
  setTimeout(showWelcomeTour,350);
  showToast('Signed in successfully.');
}
function syncAccountOnline(email,account){
  if(!onlineReady()||!account?.username)return;
  withTimeout(db.write(`accounts/${account.username}`,{
    email,
    username:account.username,
    password:account.password||'',
    wins:account.wins||0,
    losses:account.losses||0,
    createdAt:account.createdAt||Date.now(),
    updatedAt:Date.now()
  }),1800).catch(()=>{});
}
function syncAllAccountsOnline(){
  if(!onlineReady())return;
  const accounts=getAccounts();
  Object.entries(accounts).forEach(([email,account])=>syncAccountOnline(email,account));
}
async function handleLogin(e){
  e.preventDefault();
  if(!canSubmitAuth('login'))return;
  const btn=e.target.querySelector('button[type="submit"]');if(btn)btn.classList.add('btn-loading');
  const email=normalizeEmail(document.getElementById('login-email').value);
  const pw=document.getElementById('login-password').value;
  const err=document.getElementById('login-error');
  const accounts=getAccounts();
  let acc=accounts[email];
  if(!acc){acc=await findRemoteAccount(email);if(acc)saveAccount(email,acc);}
  if(!acc){err.textContent='No account found.';err.classList.add('show');if(btn){btn.classList.remove('btn-loading');btn.disabled=false;}return;}
  if(acc.password!==pw){err.textContent='Wrong password.';err.classList.add('show');if(btn){btn.classList.remove('btn-loading');btn.disabled=false;}return;}
  err.classList.remove('show');
  if(btn){btn.classList.remove('btn-loading');btn.disabled=false;}
  syncAccountOnline(email,acc);
  loginSuccess({email,username:acc.username});
}
function handleSignup(e){
  e.preventDefault();
  if(!canSubmitAuth('signup'))return;
  const btn=e.target.querySelector('button[type="submit"]');if(btn)btn.disabled=true;
  const username=document.getElementById('signup-username').value.trim().toLowerCase();
  const email=normalizeEmail(document.getElementById('signup-email').value);
  const pw=document.getElementById('signup-password').value;
  const err=document.getElementById('signup-error');
  try{
    const accounts=getAccounts();
    if(!/^[a-z0-9_]{3,20}$/.test(username)){err.textContent='Use 3-20 letters, numbers, or underscores for username.';err.classList.add('show');if(btn)btn.disabled=false;return;}
    if(Object.values(accounts).some(a=>a.username===username)){err.textContent='Username taken.';err.classList.add('show');if(btn)btn.disabled=false;return;}
    if(accounts[email]){err.textContent='Email already registered.';err.classList.add('show');if(btn)btn.disabled=false;return;}
    err.classList.remove('show');
    const account={email,username,password:pw,wins:0,losses:0,createdAt:Date.now()};
    saveAccount(email,account);
    err.classList.remove('show');
    enterApp({email,username});
    setTimeout(()=>syncAccountOnline(email,account),50);
  }catch(error){
    err.textContent='Could not create account: '+(error?.message||'Try again.');
    err.classList.add('show');
    console.error(error);
  }finally{
    if(btn)btn.disabled=false;
  }
}
function loginSuccess(user){
  enterApp(user);
}
function setLoggedInUI(){
  const n='@'+currentUser.username;
  ['dash-username','arcade-username','chat-username','zidai-username','ideas-username','library-username','explore-username','profile-username-sidebar','settings-username','help-username'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=n;});
  const initials=getUserInitials(currentUser.username);
  const chip=document.getElementById('mob-avatar-chip');
  if(chip)chip.textContent=initials;
  const chipName=document.getElementById('mob-chip-name');
  if(chipName)chipName.textContent=currentUser.username;
  const dAvatar=document.getElementById('mob-drawer-avatar');
  if(dAvatar)dAvatar.textContent=initials;
  const dUser=document.getElementById('mob-drawer-username');
  if(dUser)dUser.textContent=n;
  const dEmail=document.getElementById('mob-drawer-email');
  if(dEmail)dEmail.textContent=currentUser.email||'';
  applyTheme();
}
function handleLogout(force=false){
  if(!force){showConfirmModal('Sign out of Zidea?','You will return to the landing page and can sign in again anytime.',()=>handleLogout(true));return;}
  if(activeCallUser)endCall();
  if(incomingSSE){incomingSSE.close();incomingSSE=null;}
  if(fbSSE){fbSSE.close();fbSSE=null;}
  if(currentUser&&fbStarted)db.patch('users/'+currentUser.username,{online:false,lastSeen:Date.now()});
  fbStarted=false;currentUser=null;removeStored('zidea_session');showPage('landing');showToast('Signed out.');
  updateLandingAuthUI();
}
async function handleForgotPassword(){
  const resetBox=document.getElementById('forgot-password-fields');
  if(resetBox&&!resetBox.classList.contains('show')){
    resetBox.classList.add('show');
    const input=document.getElementById('forgot-email');
    if(input){
      input.value=document.getElementById('login-email')?.value||'';
      input.focus();
    }
    return;
  }
  const email=normalizeEmail(document.getElementById('forgot-email')?.value||document.getElementById('login-email')?.value||'');
  const err=document.getElementById('login-error');
  if(!email){if(err){err.textContent='Enter your email first so we know where to send reset instructions.';err.classList.add('show');}return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){if(err){err.textContent='Enter a valid email address.';err.classList.add('show');}return;}
  const request={email,requestedAt:Date.now(),status:'requested'};
  const requests=load('zidea_password_reset_requests')||[];
  save('zidea_password_reset_requests',[request,...requests].slice(0,25));
  await db.patch('passwordResets',{[Date.now()]:request}).catch(()=>{});
  if(err)err.classList.remove('show');
  showToast('Password reset instructions have been sent if this email is registered.');
  if(resetBox)resetBox.classList.remove('show');
}
async function loadGoogleConfig(){
  if(googleClientId) return googleClientId;
  try{
    const res = await fetch('/api/config');
    if(res.ok){
      const data = await res.json();
      googleClientId = data.googleClientId || '';
    }
  }catch(_){}
  googleClientId = googleClientId || '';
  return googleClientId;
}
async function initGoogleAuth(){
  const clientId = await loadGoogleConfig();
  if(!clientId){
    showToast('Google sign-in is not configured yet.');
    return false;
  }
  if(!window.google?.accounts?.id){
    showToast('Google sign-in is still loading. Try again in a moment.');
    return false;
  }
  if(!googleReady){
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      ux_mode: 'popup',
      auto_select: false,
      cancel_on_tap_outside: true
    });
    googleReady=true;
  }
  return true;
}
async function handleGoogleLogin(){
  const ready=await initGoogleAuth();
  if(!ready)return;
  try {
    google.accounts.id.prompt(notification => {
      console.log('Google prompt notification', notification);
      if(notification.isNotDisplayed?.() || notification.isSkippedMoment?.()){
        showToast('Google prompt was blocked or did not appear. Please allow popups and try again.');
        let fallback=document.getElementById('google-fallback-button');
        if(!fallback){
          fallback=document.createElement('div');
          fallback.id='google-fallback-button';
          fallback.style.position='fixed';
          fallback.style.left='-9999px';
          document.body.appendChild(fallback);
        }
        google.accounts.id.renderButton(fallback,{theme:'outline',size:'large'});
      }
    });
  } catch (error) {
    console.error('Google sign-in failed', error);
    showToast('Google sign-in failed. Please try again.');
  }
}
async function handleCredentialResponse(response){
  const idToken = response?.credential;
  if(!idToken){
    showToast('Google sign-in failed. Please try again.');
    return;
  }
  try{
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({idToken})
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok || !data.success) throw new Error(data.message || 'Authentication failed. Try again.');
    if(data.token) save('zidea_google_session_token', data.token);
    if(data.user?.avatar) save(`zidea_avatar_data_${data.user.username}`, data.user.avatar);
    saveAccount(normalizeEmail(data.user.email), {
      email: data.user.email,
      username: data.user.username,
      password: '',
      google_id: data.user.google_id || '',
      avatar: data.user.avatar || '',
      wins: data.user.wins || 0,
      losses: data.user.losses || 0
    });
    loginSuccess({email: data.user.email, username: data.user.username, avatar: data.user.avatar || ''});
  } catch (error) {
    const msg = String(error?.message || 'Google sign-in failed. Please try again.');
    console.error('Google auth failed', error, {response: error?.response});
    showToast(msg);
  }
}
let gStep='email',gEmail='';
function closeGoogleModal(){document.getElementById('google-modal').classList.remove('show');}
function handleGoogleSubmit(e){
  e.preventDefault();
  handleGoogleLogin();
}

// ------ Storage Utils --------------------------------
const save=(key,val)=>localStorage.setItem(key,JSON.stringify(val));
const load=(key)=>{try{return JSON.parse(localStorage.getItem(key));}catch(e){return null;}};
const removeStored=(key)=>localStorage.removeItem(key);

// ------ Firebase Setup --------------------------------
let fbUsers={},remoteAccountUsers={},fbSSE=null,friendRequestSSE=null,friendOutgoingSSE=null,friendListSSE=null,friendRequestsIn={},friendRequestsOut={},friendsByUsername={},fbStarted=false;
const FB='https://zidea-default-rtdb.firebaseio.com';
const onlineReady=()=>typeof fetch!=='undefined';
const withTimeout=(promise,ms)=>Promise.race([promise, new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),ms))]);
const testFirebaseAccess=()=>fetch(`${FB}/.json`,{method:'HEAD'}).catch(()=>{});
const db={
  read:(path)=>fetch(`${FB}/${path}.json`).then(r=>r.json()).catch(()=>null),
  write:(path,data)=>fetch(`${FB}/${path}.json`,{method:'PUT',body:JSON.stringify(data)}).then(r=>r.json()),
  patch:(path,data)=>fetch(`${FB}/${path}.json`,{method:'PATCH',body:JSON.stringify(data)}).then(r=>r.json()),
  del:(path)=>fetch(`${FB}/${path}.json`,{method:'DELETE'}).then(r=>r.json())
};

// ------ Firebase Presence ---------------------------------------------------------------------------------------------------------------------------------------------------------------
function startFirebase(){
  if(!currentUser||fbStarted)return;fbStarted=true;
  db.write('users/'+currentUser.username,{username:currentUser.username,lastSeen:Date.now(),online:true});
  Promise.all([db.read('users'),db.read('accounts')]).then(([users,accounts])=>{
    fbUsers={};remoteAccountUsers={};
    if(users)Object.entries(users).forEach(([k,u])=>{if(u?.username&&u.username!==currentUser.username)fbUsers[k]=u;});
    if(accounts)Object.values(accounts).forEach(a=>{if(a?.username&&a.username!==currentUser.username)remoteAccountUsers[a.username.toLowerCase()]={username:a.username.toLowerCase(),wins:a.wins||0,losses:a.losses||0,lastSeen:a.lastSeen||0,online:false};});
    renderUsers();renderOnline();updateStats();
  });
  const sse=new EventSource(`${FB}/users.json`);fbSSE=sse;
  sse.addEventListener('put',e=>{try{const{data}=JSON.parse(e.data);if(!data)return;fbUsers={};Object.entries(data).forEach(([k,u])=>{if(u?.username!==currentUser?.username)fbUsers[k]=u;});renderUsers();renderOnline();updateStats();}catch(_){}});
  sse.addEventListener('patch',e=>{try{const{data}=JSON.parse(e.data);if(!data)return;Object.entries(data).forEach(([k,u])=>{if(u?.username!==currentUser?.username)fbUsers[k]={...(fbUsers[k]||{}),...u};});renderUsers();renderOnline();updateStats();}catch(_){}});
  sse.onerror=()=>{sse.close();fbSSE=null;setTimeout(startFirebase,5000);};
  window.addEventListener('beforeunload',()=>{if(currentUser)db.patch('users/'+currentUser.username,{online:false,lastSeen:Date.now()});});
  listenFriendUpdates();
}
function isOnline(u){if(!u)return false;return u.online===true&&Date.now()-(u.lastSeen||0)<180000;}
function touchPresence(){if(!currentUser||!fbStarted)return;db.patch('users/'+currentUser.username,{lastSeen:Date.now(),online:true});}
setInterval(touchPresence,15000);
setInterval(()=>{renderOnline();renderUsers();},10000);
setInterval(updateStats,12000);
function normalizeUserRecord(u){
  if(!u?.username)return null;
  return {...u,username:String(u.username).trim().replace(/^@+/,'').toLowerCase(),wins:u.wins||0,losses:u.losses||0,lastSeen:u.lastSeen||0};
}
function mergeUserRecords(...lists){
  const byName={};
  lists.flat().forEach(raw=>{
    const u=normalizeUserRecord(raw);if(!u||u.username===currentUser?.username)return;
    byName[u.username]={...(byName[u.username]||{}),...u};
  });
  return Object.values(byName);
}
function getLocalAccountUsers(){
  const accounts=load('zidea_accounts')||{};
  return Object.values(accounts).map(a=>({username:a.username,wins:a.wins||0,losses:a.losses||0,lastSeen:a.lastSeen||0,online:false}));
}
function getRelationshipUsers(){
  return [...Object.keys(friendsByUsername||{}),...Object.keys(friendRequestsIn||{}),...Object.keys(friendRequestsOut||{}),...Object.keys(chatCache||{})].map(username=>({username,online:false}));
}
function getAllUsers(){return mergeUserRecords(Object.values(remoteAccountUsers),getLocalAccountUsers(),Object.values(fbUsers),getRelationshipUsers());}
function filterUsers(){
  const rawQuery=document.getElementById('search-input')?.value||'';
  searchQuery=rawQuery.trim().replace(/^@+/,'').toLowerCase();
  const list=document.getElementById('user-list');
  if(searchQuery&&!Object.keys(fbUsers).length&&list)list.innerHTML=skeletonUserCards(3);
  renderUsers();
}
function renderUsers(){
  const list=document.getElementById('user-list');if(!list)return;
  if(!searchQuery){list.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:60px 20px;text-align:center"><div style="width:64px;height:64px;border-radius:20px;background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.2);display:flex;align-items:center;justify-content:center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E6CE8B" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div><div><p style="color:#e0e0e0;font-size:15px;font-weight:700;margin-bottom:6px">Find someone</p><p style="color:#E6CE8B;font-size:13px;line-height:1.6">Search by @username to find people</p></div></div>`;return;}
  const users=getAllUsers().filter(u=>u.username.toLowerCase().includes(searchQuery.toLowerCase()));
  if(!users.length){list.innerHTML=`<p style="color:#E6CE8B;font-size:14px;text-align:center;padding:40px 20px">No users found for "<strong style="color:#E6CE8B">${esc(searchQuery)}</strong>"</p>`;return;}
  list.innerHTML=users.map(u=>{
    const username=u.username.toLowerCase();
    const online=isOnline(u);
    const isFriend=!!friendsByUsername[username];
    const incoming=friendRequestsIn[username]?.status==='pending';
    const outgoing=friendRequestsOut[username]?.status==='pending';
    const friendLabel=isFriend?'<span style="color:#E6CE8B;font-size:11px;font-weight:700;">Friend</span>':incoming?'<span style="color:#E6CE8B;font-size:11px;font-weight:700;">Incoming request</span>':outgoing?'<span style="color:#A38738;font-size:11px;font-weight:700;">Request sent</span>':'';
    let actionHtml='';
    if(isFriend){
      actionHtml=`<button class="chat-btn" onclick="openChat('${u.username}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Chat</button><button class="call-btn${activeCallUser===u.username?' active':''}" id="call-${u.username}" onclick="toggleCall('${u.username}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${activeCallUser===u.username?'End':'Call'}</button><button class="btn-ghost" disabled style="font-size:12px;padding:8px 12px">Friends</button>`;
    } else if(incoming){
      actionHtml=`<button class="btn-primary" onclick="acceptFriendRequest('${u.username}')">Accept</button><button class="btn-ghost" onclick="declineFriendRequest('${u.username}')">Decline</button><button class="btn-ghost" disabled style="font-size:12px;padding:8px 12px">Chat locked</button>`;
    } else if(outgoing){
      actionHtml=`<button class="btn-ghost" onclick="cancelFriendRequest('${u.username}')">Cancel</button><button class="btn-ghost" disabled style="font-size:12px;padding:8px 12px">Chat locked</button>`;
    } else {
      actionHtml=`<button class="btn-primary" onclick="sendFriendRequest('${u.username}')">Add Friend</button><button class="btn-ghost" disabled style="font-size:12px;padding:8px 12px">Chat locked</button>`;
    }
    return `<div class="card user-card"><div style="display:flex;align-items:center;gap:12px"><div class="user-avatar${online?' is-online':''}">${u.username.slice(0,2).toUpperCase()}</div><div class="user-info"><strong>@${u.username}</strong><div class="user-stats"><span style="color:#C9A84C">W:${u.wins||0}</span><span style="color:#F87171">L:${u.losses||0}</span><span style="color:${online?'#E6CE8B':'#E6CE8B'}">${online?'● Online':'Offline'}</span>${friendLabel?`<span style="margin-left:8px">${friendLabel}</span>`:''}</div></div></div><div class="user-actions">${actionHtml}</div></div>`;
  }).join('');
}
function renderFriendBanner(){
  const el=document.getElementById('friend-request-banner');if(!el)return;
  const incoming=Object.values(friendRequestsIn).filter(r=>r.status==='pending');
  const outgoing=Object.values(friendRequestsOut).filter(r=>r.status==='pending');
  if(!incoming.length&&!outgoing.length){el.innerHTML='';return;}
  const incomingText=incoming.length?`<strong>${incoming.length}</strong> incoming friend request${incoming.length===1?'':'s'}`:'';
  const outgoingText=outgoing.length?`<strong>${outgoing.length}</strong> pending request${outgoing.length===1?'':'s'}`:'';
  el.innerHTML=`<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:14px 16px;border:1px solid rgba(201,168,76,.2);border-radius:14px;background:rgba(201,168,76,.07);color:#e0e0e0;font-size:13px"><div>${incomingText}${incoming.length&&outgoing.length?'<span style="margin:0 8px">·</span>':''}${outgoingText}</div><div style="display:flex;gap:8px;flex-wrap:wrap">${incoming.length?`<button class="btn-primary" style="font-size:12px;padding:7px 12px" onclick="acceptAllFriendRequests()">Accept all</button>`:''}${outgoing.length?`<button class="btn-ghost" style="font-size:12px;padding:7px 12px" onclick="cancelAllFriendRequests()">Cancel all</button>`:''}</div></div>`;
}
function syncFriendState(){
  if(!currentUser)return;
  Promise.all([
    db.read(`friendRequests/${currentUser.username}`),
    db.read(`friendRequestsSent/${currentUser.username}`),
    db.read(`friends/${currentUser.username}`)
  ]).then(([incoming,outgoing,friends])=>{
    friendRequestsIn=incoming||{};friendRequestsOut=outgoing||{};friendsByUsername=friends||{};renderFriendBanner();renderUsers();
  }).catch(()=>{});
}
function listenFriendUpdates(){
  if(!currentUser||friendRequestSSE)return;
  syncFriendState();
  friendRequestSSE=new EventSource(`${FB}/friendRequests/${currentUser.username}.json`);
  friendRequestSSE.addEventListener('put',e=>{try{friendRequestsIn=JSON.parse(e.data).data||{};renderFriendBanner();renderUsers();}catch(_){} });
  friendRequestSSE.addEventListener('patch',e=>{try{const data=JSON.parse(e.data).data||{};Object.entries(data).forEach(([k,v])=>{if(v===null){delete friendRequestsIn[k];}else{friendRequestsIn[k]=v;}});renderFriendBanner();renderUsers();}catch(_){} });
  friendRequestSSE.onerror=()=>{if(friendRequestSSE){friendRequestSSE.close();friendRequestSSE=null;setTimeout(listenFriendUpdates,5000);}};
  friendOutgoingSSE=new EventSource(`${FB}/friendRequestsSent/${currentUser.username}.json`);
  friendOutgoingSSE.addEventListener('put',e=>{try{friendRequestsOut=JSON.parse(e.data).data||{};renderFriendBanner();renderUsers();}catch(_){} });
  friendOutgoingSSE.addEventListener('patch',e=>{try{const data=JSON.parse(e.data).data||{};Object.entries(data).forEach(([k,v])=>{if(v===null){delete friendRequestsOut[k];}else{friendRequestsOut[k]=v;}});renderFriendBanner();renderUsers();}catch(_){} });
  friendOutgoingSSE.onerror=()=>{if(friendOutgoingSSE){friendOutgoingSSE.close();friendOutgoingSSE=null;setTimeout(listenFriendUpdates,5000);}};
  friendListSSE=new EventSource(`${FB}/friends/${currentUser.username}.json`);
  friendListSSE.addEventListener('put',e=>{try{friendsByUsername=JSON.parse(e.data).data||{};renderFriendBanner();renderUsers();}catch(_){} });
  friendListSSE.addEventListener('patch',e=>{try{const data=JSON.parse(e.data).data||{};Object.entries(data).forEach(([k,v])=>{if(v===null){delete friendsByUsername[k];}else{friendsByUsername[k]=v;}});renderFriendBanner();renderUsers();}catch(_){} });
  friendListSSE.onerror=()=>{if(friendListSSE){friendListSSE.close();friendListSSE=null;setTimeout(listenFriendUpdates,5000);}};
}
function sendFriendRequest(username){
  if(!currentUser){showPage('login');return;}
  const to=String(username||'').trim().replace(/^@/,'').toLowerCase();
  if(!to||to===currentUser.username){showToast('Enter a valid friend username.');return;}
  const user=getAllUsers().find(u=>u.username.toLowerCase()===to);
  if(!user){showToast('User not found.');return;}
  if(friendsByUsername[to]){showToast('You are already friends.');return;}
  if(friendRequestsOut[to]?.status==='pending'){showToast('Friend request already sent.');return;}
  const req={from:currentUser.username,to,status:'pending',ts:Date.now()};
  db.patch(`friendRequests/${to}`,{[currentUser.username]:req}).catch(()=>{});
  db.patch(`friendRequestsSent/${currentUser.username}`,{[to]:req}).catch(()=>{});
  friendRequestsOut[to]=req;
  renderFriendBanner();renderUsers();
  showToast(`Friend request sent to @${to}.`);
}
function acceptFriendRequest(username){
  if(!currentUser)return;
  const from=String(username||'').trim().replace(/^@/,'').toLowerCase();
  if(friendRequestsIn[from]?.status!=='pending'){showToast('No pending request found.');return;}
  const updated={...friendRequestsIn[from],status:'accepted',respondedAt:Date.now()};
  db.patch(`friendRequests/${currentUser.username}`,{[from]:updated}).catch(()=>{});
  db.patch(`friendRequestsSent/${from}`,{[currentUser.username]:updated}).catch(()=>{});
  db.patch(`friends/${currentUser.username}`,{[from]:true}).catch(()=>{});
  db.patch(`friends/${from}`,{[currentUser.username]:true}).catch(()=>{});
  friendsByUsername[from]=true;
  delete friendRequestsIn[from];
  friendRequestsOut[from]=updated;
  renderFriendBanner();renderUsers();
  showToast(`You are now friends with @${from}.`);
}
function declineFriendRequest(username){
  if(!currentUser)return;
  const from=String(username||'').trim().replace(/^@/,'').toLowerCase();
  if(friendRequestsIn[from]?.status!=='pending'){showToast('No request to decline.');return;}
  const declined={...friendRequestsIn[from],status:'declined',respondedAt:Date.now()};
  db.patch(`friendRequests/${currentUser.username}`,{[from]:declined}).catch(()=>{});
  db.patch(`friendRequestsSent/${from}`,{[currentUser.username]:declined}).catch(()=>{});
  delete friendRequestsIn[from];
  renderFriendBanner();renderUsers();
  showToast(`Declined friend request from @${from}.`);
}
function cancelFriendRequest(username){
  if(!currentUser)return;
  const to=String(username||'').trim().replace(/^@/,'').toLowerCase();
  if(!friendRequestsOut[to]){showToast('No outgoing request to cancel.');return;}
  db.patch(`friendRequests/${to}`,{[currentUser.username]:null}).catch(()=>{});
  db.patch(`friendRequestsSent/${currentUser.username}`,{[to]:null}).catch(()=>{});
  delete friendRequestsOut[to];
  renderFriendBanner();renderUsers();
  showToast(`Cancelled friend request to @${to}.`);
}
function acceptAllFriendRequests(){
  Object.keys(friendRequestsIn).filter(k=>friendRequestsIn[k]?.status==='pending').forEach(acceptFriendRequest);
}
function cancelAllFriendRequests(){
  Object.keys(friendRequestsOut).filter(k=>friendRequestsOut[k]?.status==='pending').forEach(cancelFriendRequest);
}
function renderOnline(){const el=document.getElementById('online-list');if(!el)return;const online=getAllUsers().filter(u=>isOnline(u));if(!online.length){el.innerHTML='<div class="online-empty">No one online yet</div>';return;}el.innerHTML=online.map(u=>`<div class="online-user-row"><div class="online-avatar">${u.username.slice(0,2).toUpperCase()}</div><div><div class="online-user-name">@${u.username}</div></div></div>`).join('');}
function updateLandingOnlineStat(count){
  const wrap=document.getElementById('stat-online-wrap'),line=document.getElementById('stat-community-line'),num=document.getElementById('stat-online');
  const showLive=Number(count)>=5;
  if(num)num.textContent=String(count);
  if(wrap)wrap.style.display=showLive?'block':'none';
  if(line)line.style.display=showLive?'none':'flex';
}
function updateStats(){db.read('users').then(data=>{const su=document.getElementById('stat-users');if(!data){if(su)su.textContent='-';updateLandingOnlineStat(0);return;}const users=Object.values(data).filter(Boolean);if(su)su.textContent=String(users.length);updateLandingOnlineStat(users.filter(u=>isOnline(u)).length);}).catch(()=>{const su=document.getElementById('stat-users');if(su)su.textContent='-';updateLandingOnlineStat(0);});}
// Skeletons
function skeletonConvos(n=5){return Array(n).fill(0).map(()=>`<div class="skeleton-convo"><div class="skeleton skeleton-circle" style="width:42px;height:42px;flex-shrink:0"></div><div style="flex:1;min-width:0"><div class="skeleton" style="height:13px;width:70%;margin-bottom:7px;border-radius:6px"></div><div class="skeleton" style="height:11px;width:50%;border-radius:6px"></div></div></div>`).join('');}
function skeletonUserCards(n=3){return Array(n).fill(0).map(()=>`<div class="skeleton-card"><div class="skeleton skeleton-circle" style="width:44px;height:44px;flex-shrink:0"></div><div style="flex:1"><div class="skeleton" style="height:13px;width:60%;margin-bottom:8px;border-radius:6px"></div><div class="skeleton" style="height:11px;width:40%;border-radius:6px"></div></div><div style="display:flex;gap:8px"><div class="skeleton" style="width:60px;height:32px;border-radius:10px"></div><div class="skeleton" style="width:60px;height:32px;border-radius:10px"></div></div></div>`).join('');}
function skeletonMessages(n=5){const w=['55%','70%','45%','65%','50%'];return Array(n).fill(0).map((_,i)=>`<div class="msg-group${i%3===0?' mine':''}" style="margin-bottom:8px"><div class="skeleton skeleton-circle" style="width:30px;height:30px;flex-shrink:0"></div><div class="msg-bubbles" style="max-width:${w[i%w.length]}"><div class="skeleton skeleton-bubble" style="width:100%;height:${32+(i%2)*12}px"></div></div></div>`).join('');}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// ------ Voice Calls (WebRTC) ------------------------------------------------------------------------------------------------------------------------------------------------------
let rtcPeer=null,localStream=null,activeCallUser=null,callMuted=false,callTimer=null,callSecs=0,incomingUser=null,sigSSE=null,callConnectTimeout=null;
const RTC_CONFIG={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]};
function callChan(a,b){return[a,b].sort().join('__');}
function sigPath(chan){return`webrtc/${chan}`;}
function renderAvatar(el,username,size='100%'){
  if(!el)return;
  const remote=fbUsers?.[username]?.avatar||null;
  const local=username===currentUser?.username?load(ideaStoreKey('avatar_data')):null;
  const avatar=remote||local;
  el.style.background=`linear-gradient(135deg,${userColor(username)},#A38738)`;
  el.innerHTML=avatar?`<img src="${avatar}" alt="@${esc(username)} avatar" style="width:${size};height:${size};object-fit:cover;border-radius:50%"/>`:getUserInitials(username);
}
function prepareCallUI(username,status){
  stopCallTimer();
  document.getElementById('call-name').textContent='@'+username;
  renderAvatar(document.getElementById('call-avatar'),username);
  document.getElementById('call-status').textContent=status||'Connecting...';
  document.getElementById('call-timer').textContent='00:00';
}
async function toggleCall(username){if(activeCallUser){endCall();return;}await startCall(username);}
async function startCall(username){
  if(!currentUser)return;activeCallUser=username;
  const overlay=document.getElementById('call-overlay');overlay.style.display='flex';
  prepareCallUI(username,'Connecting...');
  const chan=callChan(currentUser.username,username);
  await db.write('calls/'+username+'/incoming',{from:currentUser.username,channel:chan,ts:Date.now()});
  try{localStream=await navigator.mediaDevices.getUserMedia({audio:true});}catch(err){document.getElementById('call-status').textContent='Mic error: '+err.message;showToast('Microphone unavailable.');return;}
  rtcPeer=new RTCPeerConnection(RTC_CONFIG);localStream.getTracks().forEach(t=>rtcPeer.addTrack(t,localStream));
  rtcPeer.ontrack=e=>{let audio=document.getElementById('rtc-remote-audio');if(!audio){audio=document.createElement('audio');audio.id='rtc-remote-audio';audio.autoplay=true;document.body.appendChild(audio);}audio.srcObject=e.streams[0];document.getElementById('call-status').textContent='Connected';if(!callTimer)startCallTimer();if(callConnectTimeout){clearTimeout(callConnectTimeout);callConnectTimeout=null;}};
  rtcPeer.onconnectionstatechange=()=>{if(!rtcPeer)return;const st=rtcPeer.connectionState;const statusEl=document.getElementById('call-status');if(!statusEl)return;if(st==='connected')statusEl.textContent='Connected';if(st==='connecting')statusEl.textContent='Connecting...';if(st==='failed'||st==='disconnected'){statusEl.textContent='Connection failed';showToast('Call connection failed.');setTimeout(endCall,900);}};
  rtcPeer.onicecandidate=async e=>{if(e.candidate){const key=Date.now()+'_'+Math.random().toString(36).slice(2);await db.patch(sigPath(chan)+'/ice_'+currentUser.username,{[key]:JSON.stringify(e.candidate)});}};
  const offer=await rtcPeer.createOffer();await rtcPeer.setLocalDescription(offer);await db.write(sigPath(chan)+'/offer',{sdp:offer.sdp,type:offer.type,from:currentUser.username});
  callConnectTimeout=setTimeout(()=>{if(activeCallUser&&document.getElementById('call-status')?.textContent!=='Connected'){document.getElementById('call-status').textContent='No answer';showToast('No answer. Call ended.');endCall();}},30000);
  listenSignals(chan,false);renderUsers();
}
function listenSignals(chan,isCallee){
  if(sigSSE){sigSSE.close();sigSSE=null;}const me=currentUser.username;
  const sse=new EventSource(`${FB}/${sigPath(chan)}.json`);sigSSE=sse;
  sse.addEventListener('put',async e=>{try{const{data}=JSON.parse(e.data);if(!data||!rtcPeer)return;if(isCallee&&data.offer&&data.offer.from!==me&&!rtcPeer.remoteDescription){await rtcPeer.setRemoteDescription(new RTCSessionDescription({type:data.offer.type,sdp:data.offer.sdp}));const answer=await rtcPeer.createAnswer();await rtcPeer.setLocalDescription(answer);await db.write(sigPath(chan)+'/answer',{sdp:answer.sdp,type:answer.type,from:me});}if(!isCallee&&data.answer&&data.answer.from!==me&&!rtcPeer.remoteDescription){await rtcPeer.setRemoteDescription(new RTCSessionDescription({type:data.answer.type,sdp:data.answer.sdp}));}const otherUser=isCallee?data.offer?.from:data.answer?.from;const iceNode=data['ice_'+otherUser];if(iceNode&&rtcPeer.remoteDescription){for(const key of Object.keys(iceNode)){try{await rtcPeer.addIceCandidate(new RTCIceCandidate(JSON.parse(iceNode[key])));}catch(_){}}};}catch(_){}});
  sse.addEventListener('patch',async e=>{try{const{data}=JSON.parse(e.data);if(!data||!rtcPeer)return;const otherUser=isCallee?activeCallUser:activeCallUser;const iceNode=data['ice_'+otherUser];if(iceNode&&rtcPeer.remoteDescription){for(const key of Object.keys(iceNode)){try{await rtcPeer.addIceCandidate(new RTCIceCandidate(JSON.parse(iceNode[key])));}catch(_){}}}if(!isCallee&&data.answer&&data.answer.from!==currentUser.username&&!rtcPeer.remoteDescription){await rtcPeer.setRemoteDescription(new RTCSessionDescription({type:data.answer.type,sdp:data.answer.sdp}));}}catch(_){}});
}
async function endCall(){
  if(!activeCallUser)return;const u=activeCallUser;activeCallUser=null;callMuted=false;
  if(currentUser){db.del('calls/'+currentUser.username+'/incoming');db.del('calls/'+u+'/incoming');const chan=callChan(currentUser.username,u);db.del(sigPath(chan));}
  if(callConnectTimeout){clearTimeout(callConnectTimeout);callConnectTimeout=null;}
  if(sigSSE){sigSSE.close();sigSSE=null;}if(localStream){localStream.getTracks().forEach(t=>t.stop());localStream=null;}if(rtcPeer){rtcPeer.close();rtcPeer=null;}
  const audio=document.getElementById('rtc-remote-audio');if(audio)audio.remove();document.getElementById('call-overlay').style.display='none';stopCallTimer();renderUsers();
}
function toggleMute(){if(!localStream)return;callMuted=!callMuted;localStream.getAudioTracks().forEach(t=>t.enabled=!callMuted);document.getElementById('mute-btn').textContent=callMuted?'🔇':'🎤';}
function startCallTimer(){callSecs=0;callTimer=setInterval(()=>{callSecs++;const m=String(Math.floor(callSecs/60)).padStart(2,'0');const s=String(callSecs%60).padStart(2,'0');const el=document.getElementById('call-timer');if(el)el.textContent=m+':'+s;},1000);}
function stopCallTimer(){if(callTimer){clearInterval(callTimer);callTimer=null;}callSecs=0;}
function listenIncoming(){
  if(!currentUser||incomingSSE)return;
  const sse=new EventSource(`${FB}/calls/${currentUser.username}/incoming.json`);incomingSSE=sse;
  sse.addEventListener('put',e=>{try{const{data}=JSON.parse(e.data);if(!data||!data.from||data.from===currentUser?.username||activeCallUser)return;incomingUser=data.from;document.getElementById('incoming-name').textContent='@'+data.from;document.getElementById('incoming-avatar').textContent=getUserInitials(data.from);document.getElementById('incoming-toast').style.display='block';setTimeout(()=>{if(incomingUser===data.from)declineCall();},30000);}catch(_){}});
}
async function acceptCall(){
  if(!incomingUser)return;document.getElementById('incoming-toast').style.display='none';const caller=incomingUser;incomingUser=null;activeCallUser=caller;
  const overlay=document.getElementById('call-overlay');overlay.style.display='flex';prepareCallUI(caller,'Connecting...');
  try{localStream=await navigator.mediaDevices.getUserMedia({audio:true});}catch(err){document.getElementById('call-status').textContent='Mic error: '+err.message;return;}
  rtcPeer=new RTCPeerConnection(RTC_CONFIG);localStream.getTracks().forEach(t=>rtcPeer.addTrack(t,localStream));
  rtcPeer.ontrack=e=>{let audio=document.getElementById('rtc-remote-audio');if(!audio){audio=document.createElement('audio');audio.id='rtc-remote-audio';audio.autoplay=true;document.body.appendChild(audio);}audio.srcObject=e.streams[0];document.getElementById('call-status').textContent='Connected';if(!callTimer)startCallTimer();if(callConnectTimeout){clearTimeout(callConnectTimeout);callConnectTimeout=null;}};
  rtcPeer.onconnectionstatechange=()=>{if(!rtcPeer)return;const st=rtcPeer.connectionState;const statusEl=document.getElementById('call-status');if(!statusEl)return;if(st==='connected')statusEl.textContent='Connected';if(st==='connecting')statusEl.textContent='Connecting...';if(st==='failed'||st==='disconnected'){statusEl.textContent='Connection failed';setTimeout(endCall,900);}};
  rtcPeer.onicecandidate=async e=>{if(e.candidate){const key=Date.now()+'_'+Math.random().toString(36).slice(2);const chan=callChan(currentUser.username,caller);await db.patch(sigPath(chan)+'/ice_'+currentUser.username,{[key]:JSON.stringify(e.candidate)});}};
  callConnectTimeout=setTimeout(()=>{if(activeCallUser&&document.getElementById('call-status')?.textContent!=='Connected'){document.getElementById('call-status').textContent='Connection timeout';endCall();}},30000);
  const chan=callChan(currentUser.username,caller);listenSignals(chan,true);renderUsers();
}
function declineCall(){incomingUser=null;document.getElementById('incoming-toast').style.display='none';if(currentUser)db.del('calls/'+currentUser.username+'/incoming');}

// ------ Video calls + in-call games --------------------------------------------------
let incomingCallVideo=false;
function toggleVideoCall(username){if(activeCallUser){endCall();return;}return startCall(username,true);}
function setupCallMedia(stream,isVideo){
  const stage=document.getElementById('video-call-stage'),localVideo=document.getElementById('local-video');
  if(stage)stage.classList.toggle('show',!!isVideo);
  if(localVideo)localVideo.srcObject=isVideo?stream:null;
}
function attachRemoteStream(stream){
  const hasVideo=stream.getVideoTracks&&stream.getVideoTracks().length;
  const stage=document.getElementById('video-call-stage'),remoteVideo=document.getElementById('remote-video');
  if(hasVideo&&stage&&remoteVideo){stage.classList.add('show');remoteVideo.srcObject=stream;}
  let audio=document.getElementById('rtc-remote-audio');
  if(!audio){audio=document.createElement('audio');audio.id='rtc-remote-audio';audio.autoplay=true;document.body.appendChild(audio);}
  audio.srcObject=stream;
}
async function startCall(username,isVideo=false){
  if(!currentUser)return;activeCallUser=username;
  const overlay=document.getElementById('call-overlay');overlay.style.display='flex';
  prepareCallUI(username,isVideo?'Requesting camera and microphone...':'Requesting microphone...');
  document.getElementById('call-game-dock')?.classList.remove('show');
  const chan=callChan(currentUser.username,username);
  await db.write('calls/'+username+'/incoming',{from:currentUser.username,channel:chan,video:!!isVideo,ts:Date.now()});
  try{localStream=await navigator.mediaDevices.getUserMedia({audio:true,video:!!isVideo});}catch(err){document.getElementById('call-status').textContent='Permission error: '+err.message;showToast(isVideo?'Camera or microphone unavailable.':'Microphone unavailable.');return;}
  setupCallMedia(localStream,isVideo);
  rtcPeer=new RTCPeerConnection(RTC_CONFIG);localStream.getTracks().forEach(t=>rtcPeer.addTrack(t,localStream));
  rtcPeer.ontrack=e=>{attachRemoteStream(e.streams[0]);document.getElementById('call-status').textContent='Connected';if(!callTimer)startCallTimer();if(callConnectTimeout){clearTimeout(callConnectTimeout);callConnectTimeout=null;}};
  rtcPeer.onconnectionstatechange=()=>{if(!rtcPeer)return;const st=rtcPeer.connectionState;const statusEl=document.getElementById('call-status');if(!statusEl)return;if(st==='connected')statusEl.textContent='Connected';if(st==='connecting')statusEl.textContent='Connecting...';if(st==='failed'||st==='disconnected'){statusEl.textContent='Connection failed';showToast('Call connection failed.');setTimeout(endCall,900);}};
  rtcPeer.onicecandidate=async e=>{if(e.candidate){const key=Date.now()+'_'+Math.random().toString(36).slice(2);await db.patch(sigPath(chan)+'/ice_'+currentUser.username,{[key]:JSON.stringify(e.candidate)});}};
  const offer=await rtcPeer.createOffer();await rtcPeer.setLocalDescription(offer);await db.write(sigPath(chan)+'/offer',{sdp:offer.sdp,type:offer.type,from:currentUser.username});
  callConnectTimeout=setTimeout(()=>{if(activeCallUser&&document.getElementById('call-status')?.textContent!=='Connected'){document.getElementById('call-status').textContent='No answer';showToast('No answer. Call ended.');endCall();}},30000);
  listenSignals(chan,false);renderUsers();
}
function listenIncoming(){
  if(!currentUser||incomingSSE)return;
  const sse=new EventSource(`${FB}/calls/${currentUser.username}/incoming.json`);incomingSSE=sse;
  sse.addEventListener('put',e=>{try{const{data}=JSON.parse(e.data);if(!data||!data.from||data.from===currentUser?.username||activeCallUser)return;incomingUser=data.from;incomingCallVideo=!!data.video;document.getElementById('incoming-name').textContent='@'+data.from;renderAvatar(document.getElementById('incoming-avatar'),data.from);const label=document.querySelector('#incoming-name')?.nextElementSibling;if(label)label.textContent=incomingCallVideo?'Incoming video call...':'Incoming call...';document.getElementById('incoming-toast').style.display='block';setTimeout(()=>{if(incomingUser===data.from)declineCall();},30000);}catch(_){}});}
async function acceptCall(){
  if(!incomingUser)return;document.getElementById('incoming-toast').style.display='none';const caller=incomingUser,isVideo=!!incomingCallVideo;incomingUser=null;incomingCallVideo=false;activeCallUser=caller;
  const overlay=document.getElementById('call-overlay');overlay.style.display='flex';prepareCallUI(caller,isVideo?'Requesting camera and microphone...':'Requesting microphone...');
  try{localStream=await navigator.mediaDevices.getUserMedia({audio:true,video:isVideo});}catch(err){document.getElementById('call-status').textContent='Permission error: '+err.message;return;}
  setupCallMedia(localStream,isVideo);
  rtcPeer=new RTCPeerConnection(RTC_CONFIG);localStream.getTracks().forEach(t=>rtcPeer.addTrack(t,localStream));
  rtcPeer.ontrack=e=>{attachRemoteStream(e.streams[0]);document.getElementById('call-status').textContent='Connected';if(!callTimer)startCallTimer();if(callConnectTimeout){clearTimeout(callConnectTimeout);callConnectTimeout=null;}};
  rtcPeer.onconnectionstatechange=()=>{if(!rtcPeer)return;const st=rtcPeer.connectionState;const statusEl=document.getElementById('call-status');if(!statusEl)return;if(st==='connected')statusEl.textContent='Connected';if(st==='connecting')statusEl.textContent='Connecting...';if(st==='failed'||st==='disconnected'){statusEl.textContent='Connection failed';setTimeout(endCall,900);}};
  rtcPeer.onicecandidate=async e=>{if(e.candidate){const key=Date.now()+'_'+Math.random().toString(36).slice(2);const chan=callChan(currentUser.username,caller);await db.patch(sigPath(chan)+'/ice_'+currentUser.username,{[key]:JSON.stringify(e.candidate)});}};
  callConnectTimeout=setTimeout(()=>{if(activeCallUser&&document.getElementById('call-status')?.textContent!=='Connected'){document.getElementById('call-status').textContent='Connection timeout';endCall();}},30000);
  const chan=callChan(currentUser.username,caller);listenSignals(chan,true);renderUsers();
}
function toggleVideo(){const track=localStream?.getVideoTracks?.()[0];if(!track){showToast('Start a video call to use camera.');return;}track.enabled=!track.enabled;document.getElementById('video-btn').textContent=track.enabled?'📹':'🚫';}
function toggleMute(){if(!localStream)return;callMuted=!callMuted;localStream.getAudioTracks().forEach(t=>t.enabled=!callMuted);document.getElementById('mute-btn').textContent=callMuted?'🔇':'🎤';}
async function endCall(){
  if(!activeCallUser)return;const u=activeCallUser;activeCallUser=null;callMuted=false;
  if(currentUser){db.del('calls/'+currentUser.username+'/incoming');db.del('calls/'+u+'/incoming');const chan=callChan(currentUser.username,u);db.del(sigPath(chan));}
  if(callConnectTimeout){clearTimeout(callConnectTimeout);callConnectTimeout=null;}
  if(sigSSE){sigSSE.close();sigSSE=null;}if(localStream){localStream.getTracks().forEach(t=>t.stop());localStream=null;}if(rtcPeer){rtcPeer.close();rtcPeer=null;}
  const audio=document.getElementById('rtc-remote-audio');if(audio)audio.remove();const lv=document.getElementById('local-video'),rv=document.getElementById('remote-video');if(lv)lv.srcObject=null;if(rv)rv.srcObject=null;document.getElementById('video-call-stage')?.classList.remove('show');document.getElementById('call-game-dock')?.classList.remove('show');document.getElementById('call-overlay').style.display='none';stopCallTimer();renderUsers();
}
function toggleCallGameDock(){
  const dock=document.getElementById('call-game-dock');if(!dock)return;
  if(!dock.innerHTML)dock.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px"><div style="color:#fff;font-weight:800">Play during call</div><button class="idea-action-btn" onclick="toggleCallGameDock()">Close</button></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><button class="btn-primary" onclick="renderCallMiniGame('ttt')">⭕ Tic-Tac-Toe</button><button class="btn-primary" onclick="renderCallMiniGame('rps')">✊ RPS</button></div><div id="call-mini-game"></div>`;
  dock.classList.toggle('show');if(dock.classList.contains('show')&&!document.getElementById('call-mini-game').innerHTML)renderCallMiniGame('ttt');
}
function renderCallMiniGame(type){const root=document.getElementById('call-mini-game');if(!root)return;if(type==='rps'){root.innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn-ghost" onclick="this.parentElement.nextElementSibling.textContent='You picked rock'">✊ Rock</button><button class="btn-ghost" onclick="this.parentElement.nextElementSibling.textContent='You picked paper'">✋ Paper</button><button class="btn-ghost" onclick="this.parentElement.nextElementSibling.textContent='You picked scissors'">✌️ Scissors</button></div><div style="color:#E6CE8B;margin-top:10px">Pick a move.</div>`;return;}root.innerHTML=`<div class="ttt-grid">${Array.from({length:9},(_,i)=>`<button onclick="this.textContent=this.textContent?'':'X';this.disabled=true" style="aspect-ratio:1;border-radius:12px;border:1px solid var(--border);background:rgba(255,255,255,.06);color:#fff;font-size:26px;font-weight:900"></button>`).join('')}</div>`;}

// ------ Chat ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
let activeChatUser=null,chatSSE=null;
const chatCache={};
function openChat(username){
  if(!currentUser)return;
  const target=String(username||'').trim().replace(/^@/,'').toLowerCase();
  if(!target){showToast('Invalid chat target.');return;}
  if(target===currentUser.username){showToast('Cannot chat with yourself.');return;}
  if(!friendsByUsername[target]){showToast('Add them as a friend before chatting.');return;}
  showPage('chat');renderConvos(target);openConvo(target);
}
async function loadAllConvos(){
  if(!currentUser)return;
  const myName=currentUser.username;
  Object.keys(localStorage).filter(k=>k.startsWith('chat_')&&k.includes(myName)).forEach(k=>{
    const parts=k.replace(/^chat_/,'').split('__');if(!parts.includes(myName))return;
    const otherUser=parts.find(p=>p!==myName);if(!otherUser)return;
    const msgs=load(k)||[];if(msgs.length&&!chatCache[otherUser])chatCache[otherUser]=msgs;
  });
  const data=await db.read('chats');if(!data)return;
  for(const[key,val]of Object.entries(data)){const parts=key.split('__');if(!parts.includes(myName))continue;const otherUser=parts.find(p=>p!==myName);if(!otherUser)continue;const msgs=val?.messages?Object.values(val.messages).sort((a,b)=>a.ts-b.ts):[];chatCache[otherUser]=msgs;}
}
function renderConvos(active){
  const el=document.getElementById('convo-items');if(!el)return;
  const users=getAllUsers();
  const convoNames=new Set([...Object.keys(friendsByUsername||{}),...Object.keys(chatCache||{})]);
  const allUsers=[...users,...[...convoNames].map(username=>({username,wins:0,losses:0,lastSeen:0}))].reduce((acc,u)=>{const name=String(u.username||'').toLowerCase();if(name&&name!==currentUser?.username&&!acc.some(x=>x.username===name))acc.push({...u,username:name});return acc;},[]);
  if(!allUsers.length){el.innerHTML=emptyStateHTML('??','No messages yet','Find someone by @username and start a conversation.','Find People',"showPage('dashboard')");return;}
  allUsers.sort((a,b)=>{const ma=chatCache[a.username]||[],mb=chatCache[b.username]||[];return(mb[mb.length-1]?.ts||0)-(ma[ma.length-1]?.ts||0);});
  el.innerHTML=allUsers.map(u=>{
    const msgs=chatCache[u.username]||[];const last=msgs[msgs.length-1];const online=isOnline(u);
    const unread=msgs.filter(m=>m.from!==currentUser?.username&&!m.read).length;
    const preview=last?(last.type&&last.type!=='text'?'📎 '+(last.name||last.type.replace('_ref','')):(last.from===currentUser?.username?'You: ':'')+esc(last.text||'')):'Say hello!';
    return`<div class="convo-item${active===u.username?' active':''}" onclick="openConvo('${u.username}')"><div class="convo-avatar">${getUserInitials(u.username)}${online?'<div class="online-dot"></div>':''}</div><div class="convo-meta"><div class="convo-name">@${u.username}</div><div class="convo-preview">${preview}</div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">${last?`<span class="convo-time">${relativeTime(last.ts)}</span>`:''} ${unread>0?`<span class="unread-badge">${unread}</span>`:''}</div></div>`;
  }).join('');
}
function relativeTime(ts){
  const diff=Date.now()-(Number(ts)||0),m=Math.floor(diff/60000),h=Math.floor(diff/3600000),d=Math.floor(diff/86400000);
  if(!ts)return'';if(m<1)return'now';if(m<60)return`${m}m ago`;if(h<24)return`${h}h ago`;if(d===1)return'Yesterday';return`${d}d ago`;
}
function openConvo(username){
  activeChatUser=username;if(chatSSE){chatSSE.close();chatSSE=null;}
  document.getElementById('page-chat')?.classList.add('chat-open');
  const user=getAllUsers().find(u=>u.username===username);const online=user&&isOnline(user);
  document.getElementById('chat-window').innerHTML=`
    <div class="chat-header">
      <button class="icon-btn chat-back" onclick="closeMobileChat()" title="Back">?</button>
      <div class="convo-avatar" style="width:40px;height:40px;font-size:13px;flex-shrink:0">${getUserInitials(username)}${online?'<div class="online-dot"></div>':''}</div>
      <div class="chat-header-info"><div class="chat-header-name">@${username}</div><div class="chat-header-status${online?'':' offline'}">${online?'Online now':'Offline'}</div></div>
      <div class="chat-header-actions"><button class="icon-btn" onclick="openChallengeModal('chess','${username}')" title="Challenge friend">?</button><button class="icon-btn" onclick="toggleCall('${username}')" title="Voice call">📞</button><button class="icon-btn" onclick="toggleVideoCall('${username}')" title="Video call">📹</button></div>
    </div>
    <div class="chat-messages" id="chat-msgs"></div>
    <div class="chat-input-bar" style="position:relative">
      <input type="file" id="chat-file-input" style="display:none" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip" onchange="handleFileAttach(event)"/>
      <button class="attach-btn" onclick="document.getElementById('chat-file-input').click()" title="Attach"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>
      <button class="voice-btn" id="voice-btn" onclick="toggleVoiceRecord()" title="Voice message"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>
      <span class="voice-timer" id="voice-timer" style="display:none">0:00</span>
      <div class="chat-input-wrap"><textarea class="chat-input" id="chat-input" placeholder="Message @${username}..." rows="1" onkeydown="chatKey(event)" oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'"></textarea></div>
      <button class="send-btn" onclick="sendMsg()" title="Send"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
    </div>`;
  // Load from localStorage backup immediately
  const localKey='chat_'+[currentUser.username,username].sort().join('__');
  const localMsgs=load(localKey)||[];
  chatCache[username]=chatCache[username]||[];
  if(localMsgs.length&&!chatCache[username].length){chatCache[username]=localMsgs;markRead(username);renderMsgs();}
  else if(chatCache[username].length){renderMsgs();}
  else{const msgsEl=document.getElementById('chat-msgs');if(msgsEl)msgsEl.innerHTML=skeletonMessages(5);}
  const key=[currentUser.username,username].sort().join('__');
  const sse=new EventSource(`${FB}/chats/${key}/messages.json`);chatSSE=sse;let seeded=false;
  function mergeMessages(d){
    if(!d||typeof d!=='object')return;let entries=Object.values(d);if(entries.length&&entries[0]&&typeof entries[0]==='object'&&!entries[0].from)entries=Object.values(entries[0]);
    let changed=false;entries.forEach(m=>{if(!m||!m.ts||!m.from)return;const existing=chatCache[username].find(x=>x.ts===m.ts&&x.from===m.from);if(!existing){chatCache[username].push(m);changed=true;}else if(existing._pending&&!m._pending){Object.assign(existing,m);changed=true;}});
    if(changed){chatCache[username].sort((a,b)=>a.ts-b.ts);markRead(username);save('chat_'+key,chatCache[username].slice(-200));renderMsgs();renderConvos(username);}
  }
  sse.addEventListener('put',e=>{try{const{data:d}=JSON.parse(e.data);if(!seeded){seeded=true;chatCache[username]=d?Object.values(d).filter(m=>m&&m.ts&&m.from):chatCache[username]||[];chatCache[username].sort((a,b)=>a.ts-b.ts);markRead(username);save('chat_'+key,chatCache[username].slice(-200));renderMsgs();renderConvos(username);}else{mergeMessages(d);}}catch(_){renderMsgs();}});
  sse.addEventListener('patch',e=>{try{mergeMessages(JSON.parse(e.data).data);}catch(_){}});
  sse.onerror=()=>{if(!seeded){seeded=true;chatCache[username]=chatCache[username]||[];renderMsgs();renderConvos(username);}sse.close();chatSSE=null;};
  setTimeout(()=>{if(activeChatUser===username&&!seeded){chatCache[username]=chatCache[username]||[];renderMsgs();}},2200);
  setTimeout(()=>{const i=document.getElementById('chat-input');if(i)i.focus();},50);
}
function markRead(username){if(!chatCache[username])return;chatCache[username].forEach(m=>{if(m.from!==currentUser?.username)m.read=true;});}
function renderMsgs(){
  const el=document.getElementById('chat-msgs');if(!el||!activeChatUser)return;
  const msgs=chatCache[activeChatUser]||[];const myInit=currentUser?.username.slice(0,2).toUpperCase()||'ME';
  if(!msgs.length){el.innerHTML=`<div class="chat-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><p>No messages yet. Say hi when you are ready.</p><button class="btn-primary" style="font-size:12px" onclick="showPage('ideas')">Generate your first idea</button></div>`;return;}
  let html='',i=0,lastDate='';
  while(i<msgs.length){
    const m=msgs[i];const msgDate=new Date(m.ts).toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'});
    if(msgDate!==lastDate){const isToday=msgDate===new Date().toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'});html+=`<div class="msg-date-divider">${isToday?'Today':msgDate}</div>`;lastDate=msgDate;}
    const mine=m.from===currentUser?.username;const init=mine?myInit:activeChatUser.slice(0,2).toUpperCase();
    let bubbles=renderBubble(m);let j=i+1;
    while(j<msgs.length&&msgs[j].from===m.from&&!msgs[j].type&&!m.type){bubbles+=renderBubble(msgs[j]);j++;}
    html+=`<div class="msg-group${mine?' mine':''}"><div class="msg-avatar">${init}</div><div class="msg-bubbles">${bubbles}<span class="msg-time">${m.time}</span></div></div>`;i=j;
  }
  el.innerHTML=html;el.scrollTop=el.scrollHeight;
  el.querySelectorAll('img[data-ref]').forEach(img=>{const ref=img.dataset.ref,ts=img.dataset.ts;if(!ref)return;if(mediaRefCache[ts]){img.src=mediaRefCache[ts];return;}loadMediaRef(ts,ref).then(url=>{if(url){img.src=url;img.onclick=()=>window.open(url,'_blank');}});});
}
function renderBubble(m){
  if(m.type==='image')return`<div class="bubble" style="padding:6px"><img class="bubble-img" src="${m.url}" alt="${esc(m.name||'image')}" onclick="window.open('${m.url}','_blank')" loading="lazy"/></div>`;
  if(m.type==='video')return`<div class="bubble" style="padding:6px"><video class="bubble-video" src="${m.url}" controls preload="metadata"></video></div>`;
  if(m.type==='audio')return`<div class="bubble"><div class="voice-msg-wrap"><div class="voice-msg-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg> Voice</div><audio class="bubble-audio" src="${m.url}" controls></audio></div></div>`;
  if(m.type==='audio_ref')return`<div class="bubble"><div class="voice-msg-wrap"><div class="voice-msg-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg> Voice</div><audio class="bubble-audio" id="audio_${m.ts}" controls onplay="loadAudioRef(this,'${m.ref}','${m.ts}')"></audio></div></div>`;
  if(m.type==='image_ref')return`<div class="bubble" style="padding:6px"><img class="bubble-img" src="" data-ref="${m.ref}" data-ts="${m.ts}" alt="${esc(m.name||'image')}" style="min-width:80px;min-height:60px;background:rgba(255,255,255,.05);border-radius:10px" loading="lazy"/></div>`;
  if(m.type==='file'||m.type==='file_ref'){const ext=(m.name||'').split('.').pop().toUpperCase().slice(0,4)||'FILE';const href=m.type==='file'?m.url||'#':'#';const onclick=m.type==='file_ref'?`onclick="loadMediaRef('${m.ts}','${m.ref}').then(u=>{if(u){const a=document.createElement('a');a.href=u;a.download='${esc(m.name||'file')}';a.click();}});return false"`:'';return`<div class="bubble" style="padding:6px 10px"><a class="bubble-file" href="${href}" ${onclick} target="_blank" download="${esc(m.name||'file')}"><div class="bubble-file-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div><div style="font-size:13px;font-weight:600;color:#f1f5f9">${esc(m.name||'file')}</div><div style="font-size:11px;color:#64748b;margin-top:2px">${ext}</div></div></a></div>`;}
  return`<div class="bubble">${esc(m.text||'')}${m._failed?`<span style="font-size:10px;color:#ef4444;margin-left:6px;cursor:pointer" onclick="retryMsg(${m.ts})">⚠ Retry</span>`:''}</div>`;
}
const audioRefCache={};
async function loadAudioRef(audioEl,ref,ts){if(audioRefCache[ts]){audioEl.src=audioRefCache[ts];return;}audioEl.src='';const data=await db.read('chatmedia/'+ref);if(!data)return;let full='';for(let i=0;i<data.total;i++)full+=data[`chunk_${i}`]||'';audioRefCache[ts]=full;audioEl.src=full;audioEl.play().catch(()=>{});}
const mediaRefCache={};
async function loadMediaRef(ts,ref){if(mediaRefCache[ts])return mediaRefCache[ts];const data=await db.read('chatmedia/'+ref);if(!data)return null;let full='';for(let i=0;i<data.total;i++)full+=data[`chunk_${i}`]||'';mediaRefCache[ts]=full;return full;}
function sendMsg(){
  const input=document.getElementById('chat-input');if(!input||!activeChatUser||!currentUser)return;const text=input.value.trim();if(!text)return;
  const ts=Date.now();const time=new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});const msg={from:currentUser.username,text,time,ts,read:true};
  input.value='';input.style.height='auto';
  if(!chatCache[activeChatUser])chatCache[activeChatUser]=[];chatCache[activeChatUser].push(msg);renderMsgs();renderConvos(activeChatUser);
  const key=[currentUser.username,activeChatUser].sort().join('__');
  save('chat_'+key,chatCache[activeChatUser].slice(-200));
  db.patch('chats/'+key+'/messages',{[ts]:{from:msg.from,text:msg.text,time:msg.time,ts:msg.ts,read:msg.read}}).then(()=>{msg._pending=false;renderMsgs();}).catch(()=>{msg._pending=false;msg._failed=true;renderMsgs();});
}
function chatKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}}
async function retryMsg(ts){const cache=activeChatUser?chatCache[activeChatUser]:(activeGroupId?groupCache[activeGroupId]:null);if(!cache)return;const msg=cache.find(m=>m.ts===ts);if(!msg)return;msg._failed=false;msg._pending=true;if(activeChatUser)renderMsgs();else renderGroupMsgs(activeGroupId);try{const payload={from:msg.from,text:msg.text,time:msg.time,ts:msg.ts,read:msg.read};if(activeChatUser){const key=[currentUser.username,activeChatUser].sort().join('__');await db.patch('chats/'+key+'/messages',{[ts]:payload});}else{await db.patch(`groupchats/${activeGroupId}/messages`,{[ts]:payload});}msg._pending=false;}catch(err){msg._pending=false;msg._failed=true;}if(activeChatUser)renderMsgs();else renderGroupMsgs(activeGroupId);}
async function sendMediaMsg(type,dataUrl,name,mimeType){
  if(!activeChatUser||!currentUser)return;const ts=Date.now();const time=new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  const msg={from:currentUser.username,type,url:dataUrl,name:name||type,mime:mimeType||'',time,ts,read:true};
  if(!chatCache[activeChatUser])chatCache[activeChatUser]=[];chatCache[activeChatUser].push(msg);renderMsgs();renderConvos(activeChatUser);
  const key=[currentUser.username,activeChatUser].sort().join('__');const{_pending,_failed,...payload}=msg;await db.patch('chats/'+key+'/messages',{[ts]:payload});
}
function fileToBase64(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});}
async function handleFileAttach(event){
  const file=event.target.files[0];event.target.value='';if(!file)return;
  if(file.size>200*1024*1024){alert('Max 200MB');return;}
  const bar=document.createElement('div');bar.className='upload-progress';bar.id='upload-progress';bar.innerHTML=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> ${file.name.slice(0,24)}...<div class="upload-bar"><div class="upload-bar-fill" id="upload-fill" style="width:5%"></div></div>`;
  const inputBar=document.querySelector('.chat-input-bar');if(inputBar)inputBar.appendChild(bar);
  const setProgress=pct=>{const f=document.getElementById('upload-fill');if(f)f.style.width=pct+'%';};
  try{
    const dataUrl=await fileToBase64(file);setProgress(20);
    const isImage=file.type.startsWith('image/'),isVideo=file.type.startsWith('video/'),isAudio=file.type.startsWith('audio/');
    const type=isImage?'image':isVideo?'video':isAudio?'audio':'file';
    const CHUNK_B64=8000000;
    if(dataUrl.length<=CHUNK_B64){setProgress(70);await sendMediaMsg(type,dataUrl,file.name,file.type);setProgress(100);}
    else{
      const ts=Date.now();const key=[currentUser.username,activeChatUser].sort().join('__');const totalChunks=Math.ceil(dataUrl.length/CHUNK_B64);const BATCH=4;
      for(let b=0;b<totalChunks;b+=BATCH){const batch=[];for(let i=b;i<Math.min(b+BATCH,totalChunks);i++){const chunk=dataUrl.slice(i*CHUNK_B64,(i+1)*CHUNK_B64);batch.push(db.patch(`chatmedia/${key}/${ts}`,{[`chunk_${i}`]:chunk}));}await Promise.all(batch);setProgress(20+Math.round(((b+BATCH)/totalChunks)*70));}
      await db.patch(`chatmedia/${key}/${ts}`,{total:totalChunks,mime:file.type,name:file.name,type});setProgress(95);
      const time=new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});const msg={from:currentUser.username,type:type+'_ref',ref:`${key}/${ts}`,name:file.name,time,ts};
      if(!chatCache[activeChatUser])chatCache[activeChatUser]=[];chatCache[activeChatUser].push(msg);renderMsgs();await db.patch('chats/'+key+'/messages',{[ts]:msg});setProgress(100);
    }
  }catch(err){alert('Upload failed: '+err.message);}finally{setTimeout(()=>{const p=document.getElementById('upload-progress');if(p)p.remove();},600);}
}
let mediaRecorder=null,audioChunks=[],voiceTimerInterval=null,voiceSecs=0;
async function toggleVoiceRecord(){
  const btn=document.getElementById('voice-btn');const timer=document.getElementById('voice-timer');
  if(mediaRecorder&&mediaRecorder.state==='recording'){mediaRecorder.stop();return;}
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});audioChunks=[];
    const mimeType=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':'audio/ogg';
    mediaRecorder=new MediaRecorder(stream,{mimeType});
    mediaRecorder.ondataavailable=e=>{if(e.data.size>0)audioChunks.push(e.data);};
    mediaRecorder.onstop=async()=>{
      stream.getTracks().forEach(t=>t.stop());btn.classList.remove('recording');timer.style.display='none';clearInterval(voiceTimerInterval);
      const blob=new Blob(audioChunks,{type:mimeType});const reader=new FileReader();
      reader.onload=async()=>{const dataUrl=reader.result;const CHUNK=700000;const ts=Date.now();const time=new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});const key=[currentUser.username,activeChatUser].sort().join('__');
        if(dataUrl.length<=CHUNK){await sendMediaMsg('audio',dataUrl,`voice_${ts}.webm`,mimeType);}
        else{const totalChunks=Math.ceil(dataUrl.length/CHUNK);const chunkWrites={};for(let i=0;i<totalChunks;i++)chunkWrites[`chunk_${i}`]=dataUrl.slice(i*CHUNK,(i+1)*CHUNK);await db.patch(`chatmedia/${key}/${ts}`,{...chunkWrites,total:totalChunks,mime:mimeType});const msg={from:currentUser.username,type:'audio_ref',ref:`${key}/${ts}`,name:`voice_${ts}.webm`,time,ts};if(!chatCache[activeChatUser])chatCache[activeChatUser]=[];chatCache[activeChatUser].push(msg);renderMsgs();await db.patch('chats/'+key+'/messages',{[ts]:msg});}
      };reader.readAsDataURL(blob);
    };
    mediaRecorder.start(100);btn.classList.add('recording');timer.style.display='inline';voiceSecs=0;
    voiceTimerInterval=setInterval(()=>{voiceSecs++;const m=Math.floor(voiceSecs/60),s=voiceSecs%60;timer.textContent=m+':'+String(s).padStart(2,'0');if(voiceSecs>=300)mediaRecorder.stop();},1000);
  }catch(err){alert('Microphone access denied.');}
}
// Convo tabs
let activeConvoTab='dms';
function switchConvoTab(tab){activeConvoTab=tab;document.getElementById('tab-dms').classList.toggle('active',tab==='dms');document.getElementById('tab-groups').classList.toggle('active',tab==='groups');if(tab==='dms')renderConvos(activeChatUser);else renderGroupList();}
function filterConvos(q){const items=document.querySelectorAll('.convo-item');items.forEach(el=>{const name=el.querySelector('.convo-name')?.textContent?.toLowerCase()||'';el.style.display=(!q||name.includes(q.toLowerCase()))?'':' none';});}

// ------ Groups ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
let activeGroupId=null,groupSSE=null;
const groupCache={};let myGroups={};
let gcallPeers={},gcallStream=null,gcallTimer=null,gcallSecs=0,gcallMuted=false,gcallGroupId=null,gcallSigSSE=null,gcallConnected=false;
function openCreateGroup(){
  const list=document.getElementById('group-member-list');document.getElementById('group-name-input').value='';document.getElementById('group-modal-overlay').classList.add('show');
  list.innerHTML='<div style="padding:16px;text-align:center;color:#E6CE8B;font-size:13px">Loading users...</div>';
  db.read('users').then(data=>{const users=data?Object.values(data).filter(u=>u&&u.username&&u.username!==currentUser?.username):getAllUsers();if(!users.length){list.innerHTML='<div style="padding:16px;text-align:center;color:#E6CE8B;font-size:13px">No other users found.</div>';return;}list.innerHTML=users.map(u=>`<div class="group-member-row" id="gmr-${u.username}" onclick="toggleGroupMember('${u.username}')"><div class="gm-avatar">${u.username.slice(0,2).toUpperCase()}</div><span class="gm-name">@${u.username}</span><div class="gm-check" id="gmc-${u.username}"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" style="display:none"><polyline points="20 6 9 17 4 12"/></svg></div></div>`).join('');});
}
function toggleGroupMember(username){const row=document.getElementById('gmr-'+username);if(!row)return;row.classList.toggle('selected');const check=row.querySelector('.gm-check svg');if(check)check.style.display=row.classList.contains('selected')?'block':'none';}
function filterGroupMembers(q){document.querySelectorAll('.group-member-row').forEach(row=>{row.style.display=row.textContent.toLowerCase().includes(String(q||'').toLowerCase())?'flex':'none';});}
function closeCreateGroup(){document.getElementById('group-modal-overlay').classList.remove('show');}
async function confirmCreateGroup(){
  const name=document.getElementById('group-name-input').value.trim();if(!name){alert('Enter a group name.');return;}
  const selected=[...document.querySelectorAll('.group-member-row.selected')].map(el=>el.id.replace('gmr-',''));if(!selected.length){alert('Select at least one member.');return;}
  const members=[currentUser.username,...selected];const groupId='g_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
  const group={id:groupId,name,members,createdBy:currentUser.username,ts:Date.now()};
  await db.write(`groups/${groupId}`,group);myGroups[groupId]=group;closeCreateGroup();switchConvoTab('groups');openGroupConvo(groupId);
}
async function loadMyGroups(){if(!currentUser)return;const data=await db.read('groups');if(!data)return;myGroups={};Object.values(data).forEach(g=>{if(g&&g.members&&g.members.includes(currentUser.username))myGroups[g.id]=g;});}
function renderGroupList(){
  const el=document.getElementById('convo-items');if(!el)return;const groups=Object.values(myGroups);
  if(!groups.length){el.innerHTML=`<div style="padding:24px 16px;text-align:center;color:#374151;font-size:13px">No groups yet.<br><span style="color:#C9A84C;cursor:pointer" onclick="openCreateGroup()">+ Create one</span></div>`;return;}
  groups.sort((a,b)=>{const ma=groupCache[a.id]||[],mb=groupCache[b.id]||[];return(mb[mb.length-1]?.ts||b.ts)-(ma[ma.length-1]?.ts||a.ts);});
  el.innerHTML=groups.map(g=>{const msgs=groupCache[g.id]||[];const last=msgs[msgs.length-1];const unread=msgs.filter(m=>m.from!==currentUser.username&&!m.read).length;const preview=last?(last.type?'📎 '+(last.name||'file'):(last.from===currentUser.username?'You: ':last.from+': ')+esc(last.text||'')):'No messages yet';return`<div class="convo-item${activeGroupId===g.id?' active':''}" onclick="openGroupConvo('${g.id}')"><div class="convo-avatar" style="background:linear-gradient(135deg,#C9A84C,#A38738)">${g.name.slice(0,2).toUpperCase()}</div><div class="convo-meta"><div class="convo-name">${esc(g.name)}</div><div class="convo-preview">${preview}</div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">${last?`<span class="convo-time">${last.time}</span>`:''} ${unread>0?`<span class="unread-badge">${unread}</span>`:''}</div></div>`;}).join('');
}
function openGroupConvo(groupId){
  activeGroupId=groupId;activeChatUser=null;if(chatSSE){chatSSE.close();chatSSE=null;}if(groupSSE){groupSSE.close();groupSSE=null;}
  const group=myGroups[groupId];if(!group)return;
  const memberStr=group.members.filter(m=>m!==currentUser.username).join(', @');
  document.getElementById('chat-window').innerHTML=`
    <div class="chat-header">
      <div class="convo-avatar" style="width:40px;height:40px;font-size:13px;flex-shrink:0;background:linear-gradient(135deg,#C9A84C,#A38738)">${group.name.slice(0,2).toUpperCase()}</div>
      <div class="chat-header-info"><div class="chat-header-name">${esc(group.name)}</div><div class="chat-header-status" style="-webkit-text-fill-color:unset;background:none;color:#64748b;font-size:11px">@${memberStr}</div></div>
      <div class="chat-header-actions"><button class="icon-btn" onclick="startGroupCall('${groupId}')" title="Group call" style="background:rgba(34,211,160,.1);border-color:rgba(34,211,160,.3);color:#E6CE8B"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></button></div>
    </div>
    <div class="chat-messages" id="chat-msgs"></div>
    <div class="chat-input-bar" style="position:relative">
      <div class="chat-input-wrap"><textarea class="chat-input" id="chat-input" placeholder="Message ${esc(group.name)}..." rows="1" onkeydown="groupChatKey(event)" oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'"></textarea></div>
      <button class="send-btn" onclick="sendGroupMsg()" title="Send"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
    </div>`;
  groupCache[groupId]=groupCache[groupId]||[];
  const gMsgsEl=document.getElementById('chat-msgs');if(gMsgsEl){if(!groupCache[groupId].length)gMsgsEl.innerHTML=skeletonMessages(4);else renderGroupMsgs(groupId);}
  const sse=new EventSource(`${FB}/groupchats/${groupId}/messages.json`);groupSSE=sse;let seeded=false;
  sse.addEventListener('put',e=>{try{const{data:d}=JSON.parse(e.data);if(!seeded){seeded=true;if(d){groupCache[groupId]=Object.values(d).filter(m=>m&&m.ts&&m.from);groupCache[groupId].sort((a,b)=>a.ts-b.ts);groupCache[groupId].forEach(m=>{if(m.from!==currentUser.username)m.read=true;});renderGroupMsgs(groupId);if(activeConvoTab==='groups')renderGroupList();}}}catch(_){}});
  sse.addEventListener('patch',e=>{try{const{data:d}=JSON.parse(e.data);if(!d)return;Object.values(d).forEach(m=>{if(!m||!m.ts||!m.from)return;if(!groupCache[groupId].find(x=>x.ts===m.ts&&x.from===m.from)){m.read=(m.from===currentUser.username);groupCache[groupId].push(m);}});groupCache[groupId].sort((a,b)=>a.ts-b.ts);renderGroupMsgs(groupId);if(activeConvoTab==='groups')renderGroupList();}catch(_){}});
  sse.onerror=()=>{sse.close();groupSSE=null;};
  setTimeout(()=>{const i=document.getElementById('chat-input');if(i)i.focus();},50);
}
function renderGroupMsgs(groupId){
  const el=document.getElementById('chat-msgs');if(!el)return;const msgs=groupCache[groupId]||[];const myInit=currentUser.username.slice(0,2).toUpperCase();
  if(!msgs.length){el.innerHTML=`<div class="chat-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><p>No messages yet. Start the group conversation.</p><button class="btn-primary" style="font-size:12px" onclick="showPage('ideas')">Generate your first idea</button></div>`;return;}
  let html='',i=0,lastDate='';
  while(i<msgs.length){const m=msgs[i];const msgDate=new Date(m.ts).toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'});if(msgDate!==lastDate){const isToday=msgDate===new Date().toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'});html+=`<div class="msg-date-divider">${isToday?'Today':msgDate}</div>`;lastDate=msgDate;}const mine=m.from===currentUser.username;const init=mine?myInit:m.from.slice(0,2).toUpperCase();let bubbles=renderBubble(m);if(!mine)bubbles=`<div style="font-size:10px;color:#C9A84C;font-weight:700;margin-bottom:2px;padding-left:2px">@${esc(m.from)}</div>`+bubbles;let j=i+1;while(j<msgs.length&&msgs[j].from===m.from&&!msgs[j].type&&!m.type){bubbles+=renderBubble(msgs[j]);j++;}html+=`<div class="msg-group${mine?' mine':''}"><div class="msg-avatar">${init}</div><div class="msg-bubbles">${bubbles}<span class="msg-time">${m.time}</span></div></div>`;i=j;}
  el.innerHTML=html;el.scrollTop=el.scrollHeight;
}
function sendGroupMsg(){
  const input=document.getElementById('chat-input');if(!input||!activeGroupId||!currentUser)return;const text=input.value.trim();if(!text)return;
  input.value='';input.style.height='auto';const ts=Date.now();const time=new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  const msg={from:currentUser.username,text,time,ts,read:true};if(!groupCache[activeGroupId])groupCache[activeGroupId]=[];groupCache[activeGroupId].push(msg);renderGroupMsgs(activeGroupId);
  db.patch(`groupchats/${activeGroupId}/messages`,{[ts]:{from:msg.from,text:msg.text,time:msg.time,ts:msg.ts,read:msg.read}}).then(()=>{msg._pending=false;renderGroupMsgs(activeGroupId);}).catch(()=>{msg._pending=false;msg._failed=true;renderGroupMsgs(activeGroupId);});
}
function groupChatKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendGroupMsg();}}
// Group calls
async function startGroupCall(groupId){
  const group=myGroups[groupId];if(!group)return;gcallGroupId=groupId;gcallPeers={};gcallMuted=false;
  try{gcallStream=await navigator.mediaDevices.getUserMedia({audio:true});}catch(err){alert('Mic error: '+err.message);return;}
  await db.write(`groupcalls/${groupId}/members/${currentUser.username}`,{joined:true,ts:Date.now()});
  document.getElementById('gcall-group-name').textContent='📞 '+group.name;document.getElementById('gcall-timer-display').textContent='00:00';
  const grid=document.getElementById('gcall-grid');if(grid)grid.innerHTML=group.members.map(u=>`<div class="gcall-tile" id="gcall-tile-${u}"><div class="gcall-avatar">${u.slice(0,2).toUpperCase()}</div><div class="gcall-name">@${esc(u)}${u===currentUser.username?' (you)':''}</div><div class="gcall-speaking"></div></div>`).join('');
  document.getElementById('gcall-overlay').classList.add('show');gcallSecs=0;gcallConnected=false;
  listenGroupCallSignals(groupId);const existing=await db.read(`groupcalls/${groupId}/members`);if(existing){const others=Object.keys(existing).filter(u=>u!==currentUser.username);for(const u of others)await gcallConnectTo(groupId,u,true);}
}
function gcallStartTimer(){
  if(gcallTimer)return;
  gcallTimer=setInterval(()=>{gcallSecs++;const m=String(Math.floor(gcallSecs/60)).padStart(2,'0');const s=String(gcallSecs%60).padStart(2,'0');const el=document.getElementById('gcall-timer-display');if(el)el.textContent=m+':'+s;},1000);
}
async function gcallConnectTo(groupId,remoteUser,isInitiator){
  if(gcallPeers[remoteUser])return;const pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});gcallPeers[remoteUser]=pc;
  if(gcallStream)gcallStream.getTracks().forEach(t=>pc.addTrack(t,gcallStream));
  pc.ontrack=e=>{let audio=document.getElementById('gcall-audio-'+remoteUser);if(!audio){audio=document.createElement('audio');audio.id='gcall-audio-'+remoteUser;audio.autoplay=true;document.body.appendChild(audio);}audio.srcObject=e.streams[0];if(!gcallConnected){gcallConnected=true;gcallStartTimer();}};
  pc.onicecandidate=async e=>{if(e.candidate){const key=Date.now()+'_'+Math.random().toString(36).slice(2);await db.patch(`groupcalls/${groupId}/signals/${currentUser.username}/${remoteUser}/ice`,{[key]:JSON.stringify(e.candidate)});}};
  if(isInitiator){const offer=await pc.createOffer();await pc.setLocalDescription(offer);await db.write(`groupcalls/${groupId}/signals/${currentUser.username}/${remoteUser}/offer`,{sdp:offer.sdp,type:offer.type});}
}
function listenGroupCallSignals(groupId){
  if(gcallSigSSE){gcallSigSSE.close();gcallSigSSE=null;}const sse=new EventSource(`${FB}/groupcalls/${groupId}.json`);gcallSigSSE=sse;
  sse.addEventListener('put',e=>{try{handleGcallData(groupId,JSON.parse(e.data).data);}catch(_){}});
  sse.addEventListener('patch',e=>{try{handleGcallData(groupId,JSON.parse(e.data).data);}catch(_){}});
  sse.onerror=()=>{sse.close();gcallSigSSE=null;};
}
async function handleGcallData(groupId,data){
  if(!data)return;const me=currentUser.username;
  if(data.members){for(const u of Object.keys(data.members)){if(u!==me&&!gcallPeers[u])await gcallConnectTo(groupId,u,false);}}
  if(data.signals){for(const[fromUser,toMap]of Object.entries(data.signals)){if(fromUser===me)continue;const sig=toMap[me];if(!sig)continue;const pc=gcallPeers[fromUser];if(sig.offer&&(!pc||!pc.remoteDescription)){let peer=pc;if(!peer){await gcallConnectTo(groupId,fromUser,false);peer=gcallPeers[fromUser];}if(!peer||peer.remoteDescription)continue;await peer.setRemoteDescription(new RTCSessionDescription({type:sig.offer.type,sdp:sig.offer.sdp}));const answer=await peer.createAnswer();await peer.setLocalDescription(answer);await db.write(`groupcalls/${groupId}/signals/${me}/${fromUser}/answer`,{sdp:answer.sdp,type:answer.type});}if(sig.answer&&pc&&!pc.remoteDescription){await pc.setRemoteDescription(new RTCSessionDescription({type:sig.answer.type,sdp:sig.answer.sdp}));}if(sig.ice&&pc&&pc.remoteDescription){for(const key of Object.keys(sig.ice)){try{await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(sig.ice[key])));}catch(_){}}}}}
}
function gcallToggleMute(){gcallMuted=!gcallMuted;if(gcallStream)gcallStream.getAudioTracks().forEach(t=>t.enabled=!gcallMuted);document.getElementById('gcall-mute-btn').textContent=gcallMuted?'🔇':'🎤';}
async function endGroupCall(){if(gcallGroupId&&currentUser)await db.del(`groupcalls/${gcallGroupId}/members/${currentUser.username}`);if(gcallSigSSE){gcallSigSSE.close();gcallSigSSE=null;}Object.values(gcallPeers).forEach(pc=>pc.close());gcallPeers={};if(gcallStream){gcallStream.getTracks().forEach(t=>t.stop());gcallStream=null;}document.querySelectorAll('[id^="gcall-audio-"]').forEach(a=>a.remove());if(gcallTimer){clearInterval(gcallTimer);gcallTimer=null;}gcallConnected=false;gcallSecs=0;gcallGroupId=null;document.getElementById('gcall-overlay').classList.remove('show');}

// ------ Ideas / Library / Explore / Profile / Settings ------------------------------------------------------------------------
let libTab='saved',exploreCategory='all',activeIdeaModal=null;
const CAT_LABEL={
  business:'Business',app:'App',startup:'Startup',ai:'AI',content:'Content',
  finance:'Finance',health:'Health',school:'Education',creative:'Creative',social:'Social',weird:'Weird'
};
const IDEA_BANK={
  business:['B2B workflow optimizer for small teams','Local service referral marketplace','Subscription audit assistant for families'],
  app:['Habit streak app with friend accountability','Offline study planner for students','Smart PDF highlights to flashcards'],
  startup:['No-code onboarding assistant for SaaS','Micro-SaaS for influencer media kits','Neighborhood logistics aggregator'],
  ai:['AI interview coach with roleplay','Prompt marketplace for niche workflows','AI recipe builder from fridge photos'],
  content:['Short-form content repurposer','Creator planning board with trend alerts','Podcast clips auto-caption studio'],
  finance:['Freelancer cashflow predictor','Micro-investing challenge app','Invoice reminder bot for solo founders'],
  health:['Home workout progression app','Meal prep planner by budget','Sleep journaling assistant'],
  school:['Peer-to-peer tutor matching','AI homework explainer notes','Class revision planner'],
  creative:['Brand naming workshop app','Moodboard + style prompt engine','Design feedback exchange'],
  social:['Volunteer finder by location','Community challenge app','Mentor-mentee matching board'],
  weird:['Mystery box date-night planner','Pet mood translator game','Reverse to-do anti-procrastination app']
};
const EXPLORE_MOCK=[
  {id:'ex1',title:'AI Pitch Deck Coach',category:'startup',author:'nova',likes:42,saves:18,description:'Upload your deck, get instant storytelling + market-fit feedback with scorecards.'},
  {id:'ex2',title:'FitQuest PvP',category:'health',author:'pixel',likes:36,saves:14,description:'Fitness streak battles where friends can challenge each other weekly.'},
  {id:'ex3',title:'ClipForge',category:'content',author:'jamie',likes:51,saves:21,description:'Turn one long video into platform-ready short clips with hooks and captions.'},
  {id:'ex4',title:'Budget Buddy for Students',category:'finance',author:'amira',likes:29,saves:11,description:'Track spending and get weekly saving missions for student life.'},
  {id:'ex5',title:'Dungeon Study',category:'app',author:'milo',likes:25,saves:9,description:'Gamified study planner where tasks become quests and bosses.'},
  {id:'ex6',title:'Roast My Startup',category:'weird',author:'bytecat',likes:47,saves:20,description:'A playful simulator where AI investors roast your startup idea before users do.'},
  {id:'ex7',title:'Clinic Queue Radar',category:'health',author:'sana',likes:33,saves:16,description:'Community-based wait-time intel to help users pick faster clinics.'},
  {id:'ex8',title:'AI Product Names Lab',category:'ai',author:'zeph',likes:40,saves:17,description:'Generate product names, slogans, and domains scored by memorability.'}
];
function ideaStoreKey(suffix){return currentUser?`zidea_${suffix}_${currentUser.username}`:`zidea_${suffix}`;}
function getSavedIdeas(){return load(ideaStoreKey('saved_ideas'))||[];}
function getStarredIdeas(){return load(ideaStoreKey('starred_ideas'))||[];}
function getIdeaHistory(){return load(ideaStoreKey('idea_history'))||[];}
function getCreatedIdeaStore(){return load(ideaStoreKey('created_ideas'))||[];}
function setSavedIdeas(v){save(ideaStoreKey('saved_ideas'),v);}
function setStarredIdeas(v){save(ideaStoreKey('starred_ideas'),v);}
function setIdeaHistory(v){save(ideaStoreKey('idea_history'),v);}
function setCreatedIdeaStore(v){save(ideaStoreKey('created_ideas'),v);}
const MATCH_STORE_KEY='zidea_idea_matchmaker_submissions';
let matchStep=0;
const matchFields=[['match-name','match-email','match-title','match-description'],['match-problem'],['match-industry'],['match-stage'],['match-skills'],['match-collaborator'],['match-commitment'],['match-audience']];
const MATCH_SEEDS=[
  {id:'seed-001',isSeed:true,createdAt:'2026-04-20T09:00:00.000Z',username:'maya_c',name:'Maya Chen',email:'maya@example.com',title:'SkillSwap Campus',description:'A peer learning platform where students trade short tutoring sessions and project help.',problem:'Students need affordable academic support and practical project collaborators.',industry:'Education',stage:'Have a plan',skills:'product design, community building, education research',collaborator:'Technical',commitment:'5-10hrs',audience:'university students, tutors, student clubs'},
  {id:'seed-002',isSeed:true,createdAt:'2026-04-21T10:30:00.000Z',username:'noah_p',name:'Noah Patel',email:'noah@example.com',title:'Clinic Queue Lite',description:'Simple appointment and queue tracking for small neighborhood clinics.',problem:'Patients wait too long because small clinics manage visits manually.',industry:'Health',stage:'Already started',skills:'backend, technical prototyping, operations',collaborator:'Business',commitment:'10+ hrs',audience:'small clinics, nurses, local patients'},
  {id:'seed-003',isSeed:true,createdAt:'2026-04-22T11:15:00.000Z',username:'aisha_b',name:'Aisha Bello',email:'aisha@example.com',title:'MicroBudget Coach',description:'A mobile-first budgeting helper for freelancers with irregular income.',problem:'Freelancers struggle to forecast cash flow between uneven payments.',industry:'Finance',stage:'Just an idea',skills:'finance, copywriting, user interviews',collaborator:'Technical',commitment:'5-10hrs',audience:'freelancers, creators, independent consultants'},
  {id:'seed-004',isSeed:true,createdAt:'2026-04-23T12:45:00.000Z',username:'lena_t',name:'Lena Torres',email:'lena@example.com',title:'Neighborhood Help Board',description:'A trusted local board for errands, volunteering, and shared neighborhood resources.',problem:'Neighbors want to help each other but lack a safe lightweight coordination tool.',industry:'Social',stage:'Have a plan',skills:'community partnerships, business development, moderation',collaborator:'Technical',commitment:'< 5hrs',audience:'neighbors, local volunteers, community groups'},
  {id:'seed-005',isSeed:true,createdAt:'2026-04-24T14:20:00.000Z',username:'sam_w',name:'Sam Wilson',email:'sam@example.com',title:'AI Pitch Polisher',description:'A guided workspace that turns rough startup notes into sharper pitch materials.',problem:'Early founders struggle to explain their idea clearly to investors and partners.',industry:'Tech',stage:'Already started',skills:'technical, AI workflows, frontend',collaborator:'Creative',commitment:'10+ hrs',audience:'startup founders, accelerators, solo builders'},
  {id:'seed-006',isSeed:true,createdAt:'2026-04-25T15:00:00.000Z',username:'priya_n',name:'Priya Nair',email:'priya@example.com',title:'CareCircle Meals',description:'Meal planning and delivery coordination for families caring for recovering relatives.',problem:'Family caregivers need practical support coordinating meals and check-ins.',industry:'Health',stage:'Have a plan',skills:'health operations, partnerships, service design',collaborator:'Technical',commitment:'5-10hrs',audience:'family caregivers, patients, local meal providers'},
  {id:'seed-007',isSeed:true,createdAt:'2026-04-26T16:10:00.000Z',username:'omar_h',name:'Omar Hassan',email:'omar@example.com',title:'Creator Invoice Shield',description:'Contracts, invoices, and reminder automations for small creative studios.',problem:'Creators lose money and time chasing late payments.',industry:'Finance',stage:'Already started',skills:'business, sales, finance workflows',collaborator:'Technical',commitment:'10+ hrs',audience:'creative studios, freelancers, agencies'},
  {id:'seed-008',isSeed:true,createdAt:'2026-04-27T17:25:00.000Z',username:'emma_b',name:'Emma Brooks',email:'emma@example.com',title:'StoryLab Kids',description:'Interactive storytelling prompts that help children practice reading and creativity.',problem:'Parents and teachers need engaging tools that make reading practice feel playful.',industry:'Education',stage:'Just an idea',skills:'creative writing, curriculum, illustration',collaborator:'Technical',commitment:'< 5hrs',audience:'children, parents, primary school teachers'},
  {id:'seed-009',isSeed:true,createdAt:'2026-04-28T18:40:00.000Z',username:'jon_k',name:'Jon Kim',email:'jon@example.com',title:'Local Event Signal',description:'A discovery app that surfaces small community events before they disappear online.',problem:'Local events are scattered across chats, flyers, and social feeds.',industry:'Social',stage:'Have a plan',skills:'technical, data scraping, product analytics',collaborator:'Business',commitment:'5-10hrs',audience:'local organizers, residents, community venues'},
  {id:'seed-010',isSeed:true,createdAt:'2026-04-29T19:55:00.000Z',username:'grace_m',name:'Grace Miller',email:'grace@example.com',title:'Eco Supply Finder',description:'A searchable directory for small businesses to find sustainable packaging suppliers.',problem:'Small businesses want better packaging options but do not know which suppliers to trust.',industry:'Other',stage:'Just an idea',skills:'research, partnerships, business strategy',collaborator:'Any',commitment:'< 5hrs',audience:'small businesses, ecommerce sellers, sustainable suppliers'}
];
function ensureMatchSeeds(){if(!load(MATCH_STORE_KEY))save(MATCH_STORE_KEY,[]);}
function getRealUsernames(){return new Set(getAllUsers().map(u=>u.username).concat(currentUser?.username||[]).filter(Boolean));}
function isRealMatchIdea(idea){return idea&&idea.username&&getRealUsernames().has(idea.username);}
function getMatchIdeas(){ensureMatchSeeds();return(load(MATCH_STORE_KEY)||[]).filter(isRealMatchIdea);}
function setMatchIdeas(v){save(MATCH_STORE_KEY,v.filter(i=>i&&i.username));}
function saveCreatedIdea(idea){
  const created=[idea,...getCreatedIdeaStore().filter(i=>i.id!==idea.id)].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
  setCreatedIdeaStore(created);
  db.write(`createdIdeas/${idea.username}/${idea.id}`,idea).catch(()=>{});
}
async function syncCreatedIdeasFromFirebase(){
  if(!currentUser)return;
  const data=await db.read(`createdIdeas/${currentUser.username}`);
  if(!data)return;
  const cloud=Object.values(data).filter(Boolean);
  const local=getCreatedIdeaStore();
  const byId={};[...cloud,...local].forEach(i=>{if(i&&i.id)byId[i.id]=i;});
  setCreatedIdeaStore(Object.values(byId).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')));
}
async function syncMatchIdeasFromFirebase(){
  const data=await db.read('matchIdeas');if(!data)return;
  const cloud=Object.values(data).filter(Boolean);
  const local=load(MATCH_STORE_KEY)||[];
  const byId={};[...cloud,...local].forEach(i=>{if(i&&i.id)byId[i.id]=i;});
  setMatchIdeas(Object.values(byId).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')));
}
function updateMatchStep(){
  for(let i=0;i<matchFields.length;i++){const el=document.getElementById('match-step-'+i);if(el)el.classList.toggle('active',i===matchStep);}
  const back=document.getElementById('match-back-btn'),next=document.getElementById('match-next-btn'),bar=document.getElementById('match-progress-bar');
  if(back)back.style.display=matchStep?'inline-flex':'none';
  if(next)next.textContent=matchStep===matchFields.length-1?'Find Matches':'Next';
  if(bar)bar.style.width=`${Math.round((matchStep/(matchFields.length-1))*100)}%`;
  setMatchError('');
}
function closeMobileChat(){document.getElementById('page-chat')?.classList.remove('chat-open');}
function prefillMatchUser(){
  if(!currentUser)return;
  const name=document.getElementById('match-name'),email=document.getElementById('match-email');
  if(name&&!name.value)name.value=currentUser.username;
  if(email&&!email.value)email.value=currentUser.email||`${currentUser.username}@zidea.local`;
}
function matchPrevStep(){if(matchStep>0){matchStep--;updateMatchStep();}}
function setMatchError(message,fieldId){
  const err=document.getElementById('match-error');
  matchFields.flat().forEach(id=>document.getElementById(id)?.classList.remove('invalid'));
  if(err){err.textContent=message||'';err.classList.toggle('show',!!message);}
  if(fieldId){const field=document.getElementById(fieldId);field?.classList.add('invalid');field?.focus();}
}
function validateMatchStep(){
  const labels={
    'match-name':'your name','match-email':'your email','match-title':'an idea title','match-description':'a short description',
    'match-problem':'the problem your idea solves','match-skills':'the skills you bring','match-audience':'the target audience'
  };
  const missing=matchFields[matchStep].find(id=>!String(document.getElementById(id)?.value||'').trim());
  if(missing){setMatchError(`Add ${labels[missing]||'this answer'} before continuing.`,missing);return false;}
  const email=document.getElementById('match-email');
  if(matchStep===0&&email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){setMatchError('Use a valid email address so collaborators can reach you.', 'match-email');return false;}
  setMatchError('');
  return true;
}
function matchNextStep(){
  if(!validateMatchStep())return;
  if(matchStep<matchFields.length-1){matchStep++;updateMatchStep();return;}
  submitMatchIdea();
}
function collectMatchIdea(){
  const val=id=>String(document.getElementById(id)?.value||'').trim();
  return {id:`match_${Date.now()}`,createdAt:new Date().toISOString(),username:currentUser?.username||'',name:val('match-name')||currentUser?.username||'',email:val('match-email')||currentUser?.email||'',title:val('match-title'),description:val('match-description'),problem:val('match-problem'),industry:val('match-industry'),stage:val('match-stage'),skills:val('match-skills'),collaborator:val('match-collaborator'),commitment:val('match-commitment'),audience:val('match-audience')};
}
function submitMatchIdea(){
  if(!currentUser){showToast('Sign in to submit and match with real Zidea users.');return;}
  const idea=collectMatchIdea();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(idea.email)){showToast('Enter a valid email.');matchStep=0;updateMatchStep();return;}
  const ideas=getMatchIdeas();
  saveCreatedIdea(idea);
  setMatchIdeas([idea,...ideas.filter(i=>i.username!==idea.username)]);
  db.write(`matchIdeas/${idea.username}`,idea).catch(()=>{});
  const seedCandidates=MATCH_SEEDS.filter(s=>s.username!==idea.username);
  const allCandidates=[...ideas.filter(i=>i.username!==idea.username),...seedCandidates];
  renderMatchResults(idea,scoreMatchIdeas(idea,allCandidates).slice(0,3));
  showToast('Idea submitted. Matches ready.');
}
function resetMatchmaker(){
  matchFields.flat().forEach(id=>{const el=document.getElementById(id);if(el&&el.tagName!=='SELECT')el.value='';});
  matchStep=0;updateMatchStep();
  const out=document.getElementById('match-output');if(out)out.innerHTML='';
}
function scoreMatchIdeas(current,ideas){
  return ideas.filter(i=>i.id!==current.id&&i.username&&i.username!==current.username).map(candidate=>{
    let score=0;const tags=new Set();
    if(eq(current.industry,candidate.industry)){score+=42;tags.add(current.industry);}
    keywordOverlap(current.audience,candidate.audience).slice(0,3).forEach(t=>{score+=8;tags.add(t);});
    collaboratorSkillOverlap(current,candidate).slice(0,3).forEach(t=>{score+=12;tags.add(t);});
    if(eq(current.commitment,candidate.commitment)){score+=10;tags.add(current.commitment);}
    return {...candidate,matchScore:Math.min(100,Math.round(score)),matchTags:[...tags].slice(0,6)};
  }).filter(i=>i.matchScore>0).sort((a,b)=>b.matchScore-a.matchScore);
}
function tokenizer(v){return String(v||'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').split(/\s+/).map(w=>w.replace(/-+/g,'')).filter(w=>w.length>2&&!['and','the','for','with','from','that','this','are','you'].includes(w));}
function keywordOverlap(a,b){const bs=new Set(tokenizer(b));return [...new Set(tokenizer(a))].filter(w=>bs.has(w));}
function need(v){v=String(v||'').toLowerCase();if(v.includes('technical'))return'technical';if(v.includes('business'))return'business';if(v.includes('creative'))return'creative';return'any';}
function collaboratorSkillOverlap(a,b){const hits=new Set(),as=new Set(tokenizer(a.skills)),bs=new Set(tokenizer(b.skills)),an=need(a.collaborator),bn=need(b.collaborator);if(an==='any'||bs.has(an))hits.add(an==='any'?'flexible collaborator':an);if(bn==='any'||as.has(bn))hits.add(bn==='any'?'flexible collaborator':bn);as.forEach(s=>{if(bs.has(s))hits.add(s);});return[...hits];}
function eq(a,b){return String(a||'').toLowerCase()===String(b||'').toLowerCase();}
function renderMatchResults(idea,matches){
  const out=document.getElementById('match-output');if(!out)return;
  if(!matches.length){out.innerHTML='<div class="match-result-card" style="color:#E6CE8B">No close matches found yet. Your idea is saved, and future users can match with you.</div>';return;}
  out.innerHTML=`<div style="font-size:14px;font-weight:800;color:#fff;margin-top:4px">Top matches for ${esc(idea.title)}</div>`+matches.map(m=>{const isSeed=!!m.isSeed;const displayName=isSeed?(m.name||('@'+m.username)):('@'+m.username);const pending=friendRequestsOut[m.username]?.status==='pending'||friendRequestsIn[m.username]?.status==='pending';const connectBtn=isSeed?`<button class="idea-action-btn" style="opacity:.55;cursor:default" disabled>Community member</button>`:friendsByUsername[m.username]?`<button class="idea-action-btn" onclick="openChat('${esc(m.username)}')">Connect in Chat</button>`:pending?`<button class="idea-action-btn" style="opacity:.65;cursor:not-allowed" disabled>Friend request pending</button>`:`<button class="idea-action-btn" onclick="sendFriendRequest('${esc(m.username)}')">Add friend to chat</button>`;return`<div class="match-result-card"><div class="match-result-top"><div><div style="font-size:15px;font-weight:800;color:#fff">${esc(displayName)}</div><div style="font-size:13px;color:#d1d5db;font-weight:700;margin-top:3px">${esc(m.title)}</div></div><span class="match-score">${m.matchScore}% compatibility</span></div><div style="font-size:12px;color:#E6CE8B;line-height:1.6">${esc(m.description)}</div><div class="idea-card-tags">${(m.matchTags||[]).map(t=>`<span class="idea-tag">${esc(t)}</span>`).join('')}</div>${connectBtn}</div>`;}).join('');
}
function renderMatchAdmin(){
  const ideas=getMatchIdeas(),out=document.getElementById('match-output');if(!out)return;
  out.innerHTML=`<div style="font-size:14px;font-weight:800;color:#fff">Real user submissions (${ideas.length})</div><div style="overflow:auto;border:1px solid var(--border);border-radius:14px"><table style="width:100%;min-width:700px;border-collapse:collapse;font-size:12px"><thead><tr style="color:#fff;background:rgba(201,168,76,.16)"><th style="text-align:left;padding:10px">User</th><th style="text-align:left;padding:10px">Idea</th><th style="text-align:left;padding:10px">Industry</th><th style="text-align:left;padding:10px">Looking for</th><th style="text-align:left;padding:10px">Time</th><th style="text-align:left;padding:10px">Action</th></tr></thead><tbody>${ideas.map(i=>`<tr style="border-top:1px solid var(--border);color:#E6CE8B"><td style="padding:10px;color:#fff;font-weight:700">@${esc(i.username)}</td><td style="padding:10px">${esc(i.title)}</td><td style="padding:10px">${esc(i.industry)}</td><td style="padding:10px">${esc(i.collaborator)}</td><td style="padding:10px">${esc(i.commitment)}</td><td style="padding:10px">${i.username!==currentUser?.username?`<button class="idea-action-btn" onclick="openChat('${esc(i.username)}')">Chat</button>`:'You'}</td></tr>`).join('')}</tbody></table></div>`;
}
function ideaUid(idea){return idea.id||`${idea.title}__${idea.author||'you'}`.toLowerCase().replace(/\s+/g,'_');}
function pushIdeaUnique(list,idea){const id=ideaUid(idea);if(list.some(x=>ideaUid(x)===id))return list;return[idea,...list];}
function createIdeaCardHTML(idea,ctx='ideas'){
  const id=ideaUid(idea),saved=getSavedIdeas().some(x=>ideaUid(x)===id),starred=getStarredIdeas().some(x=>ideaUid(x)===id);
  const canCall=!!idea.author&&idea.author!==currentUser?.username;
  return `<div class="idea-card"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px"><div><div style="font-size:15px;font-weight:700;color:#fff">${esc(idea.title)}</div><div style="font-size:12px;color:#E6CE8B;margin-top:4px">${esc(idea.description||'')}</div>${idea.score?`<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap"><span class="idea-tag">Impact ${idea.score.impact}</span><span class="idea-tag">Feasibility ${idea.score.feasibility}</span><span class="idea-tag">Profit ${idea.score.profit}</span></div>`:''}</div><button class="idea-tag">${esc(CAT_LABEL[idea.category]||idea.category||'Idea')}</button></div><div class="idea-card-hover-actions"><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;justify-content:center"><button class="idea-action-btn${saved?' active':''}" onclick="toggleSaveIdea('${id}','${ctx}')">💾 ${saved?'Saved':'Save'}</button><button class="idea-action-btn${starred?' active':''}" onclick="toggleStarIdea('${id}','${ctx}')">⭐ ${starred?'Starred':'Star'}</button><button class="idea-action-btn" onclick="openIdeaDetails('${id}','${ctx}')">👁 Details</button><button class="idea-action-btn" onclick="shareIdea('${id}','${ctx}')">📤 Share</button>${canCall?`<button class="call-btn" style="padding:6px 12px;font-size:11px" onclick="callIdeaAuthor('${esc(idea.author)}')">📞 Call @${esc(idea.author)}</button>`:''}</div></div></div>`;
}
function getCurrentGeneratedIdeas(){return load(ideaStoreKey('generated_now'))||[];}
function setCurrentGeneratedIdeas(v){save(ideaStoreKey('generated_now'),v);}
function generateIdeas(){
  const cat=document.getElementById('idea-category')?.value||'business';
  const difficulty=document.getElementById('idea-difficulty')?.value||'beginner';
  const budget=document.getElementById('idea-budget')?.value||'any';
  const buildTime=document.getElementById('idea-time')?.value||'any';
  const audience=(document.getElementById('idea-audience')?.value||'').trim();
  const prompt=(document.getElementById('idea-prompt')?.value||'').trim();
  const btn=document.getElementById('gen-btn');
  if(btn)btn.classList.add('btn-loading');
  const seeds=IDEA_BANK[cat]||IDEA_BANK.business;
  const pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
  const variants=[
    `for ${audience||'busy people'} with ${difficulty} complexity`,
    `optimized for ${buildTime} build time and ${budget} budget`,
    prompt?`inspired by: ${prompt}`:`with a strong social-sharing loop`
  ];
  const ideas=Array.from({length:3},(_,i)=>({
    id:`g_${Date.now()}_${i}`,
    title:pick(seeds),
    category:cat,
    author:currentUser?.username||'you',
    description:`${pick(variants)}. Monetization: ${pick(['subscription','freemium upsells','commission model','one-time templates'])}.`,
    score:{impact:6+Math.floor(Math.random()*5),feasibility:6+Math.floor(Math.random()*5),profit:6+Math.floor(Math.random()*5)}
  }));
  setCurrentGeneratedIdeas(ideas);
  const history=ideas.reduce((acc,idea)=>pushIdeaUnique(acc,{...idea,ts:Date.now()}),getIdeaHistory()).slice(0,80);
  setIdeaHistory(history);
  const out=document.getElementById('ideas-output');
  if(out)out.innerHTML=ideas.map(i=>createIdeaCardHTML(i,'ideas')).join('');
  const regen=document.getElementById('regen-btn');if(regen)regen.style.display='inline-flex';
  if(btn)btn.classList.remove('btn-loading');
  syncIdeasToFirebase();
}
function randomIdea(){
  const cats=Object.keys(IDEA_BANK);
  const pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
  const cat=pick(cats),diff=pick(['beginner','intermediate','advanced']),budget=pick(['low','medium','high','any']),t=pick(['weekend','month','quarter','year','any']);
  const audience=pick(['students','creators','freelancers','small businesses','gamers']);
  document.getElementById('idea-category').value=cat;
  document.getElementById('idea-difficulty').value=diff;
  document.getElementById('idea-budget').value=budget;
  document.getElementById('idea-time').value=t;
  document.getElementById('idea-audience').value=audience;
  ['idea-category','idea-difficulty','idea-budget','idea-time','idea-audience'].forEach(id=>{const el=document.getElementById(id);if(!el)return;el.classList.remove('rand-animate');void el.offsetWidth;el.classList.add('rand-animate');});
  generateIdeas();
}
function getIdeaFromContext(id,ctx){
  const map=(arr)=>arr.find(x=>ideaUid(x)===id);
  if(ctx==='explore')return map(EXPLORE_MOCK);
  return map(getCurrentGeneratedIdeas())||map(getIdeaHistory())||map(getSavedIdeas())||map(getStarredIdeas())||map(EXPLORE_MOCK);
}
function toggleSaveIdea(id,ctx){
  const idea=getIdeaFromContext(id,ctx);if(!idea)return;
  let saved=getSavedIdeas();const exists=saved.some(x=>ideaUid(x)===id);
  saved=exists?saved.filter(x=>ideaUid(x)!==id):pushIdeaUnique(saved,{...idea,savedAt:Date.now()});
  setSavedIdeas(saved);renderLibrary();if(ctx==='explore')renderExplore();else{const out=document.getElementById('ideas-output');if(out&&getCurrentGeneratedIdeas().length)out.innerHTML=getCurrentGeneratedIdeas().map(i=>createIdeaCardHTML(i,'ideas')).join('');}
  showToast(exists?'Idea removed from saved.':'Idea saved.');
  syncIdeasToFirebase();
}
function toggleStarIdea(id,ctx){
  const idea=getIdeaFromContext(id,ctx);if(!idea)return;
  let starred=getStarredIdeas();const exists=starred.some(x=>ideaUid(x)===id);
  starred=exists?starred.filter(x=>ideaUid(x)!==id):pushIdeaUnique(starred,{...idea,starredAt:Date.now()});
  setStarredIdeas(starred);renderLibrary();if(ctx==='explore')renderExplore();else{const out=document.getElementById('ideas-output');if(out&&getCurrentGeneratedIdeas().length)out.innerHTML=getCurrentGeneratedIdeas().map(i=>createIdeaCardHTML(i,'ideas')).join('');}
  showToast(exists?'Idea unstarred.':'Idea starred.');
  syncIdeasToFirebase();
}
function openIdeaDetails(id,ctx){
  const idea=getIdeaFromContext(id,ctx);if(!idea)return;
  activeIdeaModal={id,ctx};
  document.getElementById('idea-modal-title').textContent=idea.title;
  document.getElementById('idea-modal-body').innerHTML=`<div class="idea-tag" style="width:max-content">${esc(CAT_LABEL[idea.category]||idea.category||'Idea')}</div><p style="color:#E6CE8B;font-size:14px;line-height:1.7">${esc(idea.description||'No description')}</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div class="card" style="padding:12px"><div style="font-size:12px;color:#E6CE8B">Author</div><div style="font-size:14px;color:#fff;font-weight:700;margin-top:4px">@${esc(idea.author||'you')}</div></div><div class="card" style="padding:12px"><div style="font-size:12px;color:#E6CE8B">Category</div><div style="font-size:14px;color:#fff;font-weight:700;margin-top:4px">${esc(CAT_LABEL[idea.category]||idea.category||'Idea')}</div></div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn-primary" style="font-size:12px" onclick="toggleSaveIdea('${ideaUid(idea)}','${ctx}')">Save</button><button class="btn-ghost" style="font-size:12px" onclick="toggleStarIdea('${ideaUid(idea)}','${ctx}')">Star</button><button class="btn-ghost" style="font-size:12px" onclick="shareIdea('${ideaUid(idea)}','${ctx}')">Share</button></div>`;
  document.getElementById('idea-modal-overlay').classList.add('show');
}
function closeIdeaModal(){document.getElementById('idea-modal-overlay').classList.remove('show');activeIdeaModal=null;}
function shareIdea(id,ctx){
  const idea=getIdeaFromContext(id,ctx);if(!idea)return;
  const text=`${idea.title} — ${idea.description}`;
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(()=>showToast('Idea copied to clipboard.')).catch(()=>showToast('Copy failed.'));}
  else showToast(text);
}
function getCreatedIdeas(){
  const byId={};
  [...getCreatedIdeaStore(),...getMatchIdeas().filter(i=>i.username===currentUser?.username)].forEach(i=>{if(i&&i.id)byId[i.id]=i;});
  return Object.values(byId).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
}
function createdIdeaCardHTML(idea){
  return `<div class="idea-card"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><div style="font-size:15px;font-weight:800;color:#fff">${esc(idea.title)}</div><div style="font-size:12px;color:#E6CE8B;margin-top:4px">${esc(new Date(idea.createdAt).toLocaleString())}</div></div><span class="idea-tag">${esc(idea.industry||'Idea')}</span></div><p class="idea-card-body">${esc(idea.description||'')}</p><div class="idea-card-tags"><span class="idea-tag">${esc(idea.stage||'Stage')}</span><span class="idea-tag">Looking for ${esc(idea.collaborator||'Any')}</span><span class="idea-tag">${esc(idea.commitment||'Time')}</span></div><div class="idea-card-body"><strong style="color:#d1d5db">Problem:</strong> ${esc(idea.problem||'')}</div><div class="idea-card-body"><strong style="color:#d1d5db">Audience:</strong> ${esc(idea.audience||'')}</div></div>`;
}
function switchLibTab(tab){libTab=tab;['created','saved','starred'].forEach(t=>{const b=document.getElementById('lib-tab-'+t);if(b)b.classList.toggle('active',t===tab);});renderLibrary();}
function emptyStateHTML(icon,title,copy,cta,action){
  return `<div class="card empty-state"><div class="empty-state-icon">${icon}</div><div><div class="empty-state-title">${esc(title)}</div><div class="empty-state-copy">${esc(copy)}</div></div>${cta?`<button class="btn-primary" style="font-size:12px" onclick="${action}">${esc(cta)}</button>`:''}</div>`;
}
function renderLibrary(){
  const list=document.getElementById('library-list');if(!list)return;
  const q=(document.getElementById('lib-search')?.value||'').toLowerCase().trim();
  const source=libTab==='saved'?getSavedIdeas():libTab==='starred'?getStarredIdeas():getCreatedIdeas();
  const filtered=source.filter(i=>!q||i.title.toLowerCase().includes(q)||String(i.description||'').toLowerCase().includes(q));
  const tags=[...new Set(source.map(i=>i.category||i.industry).filter(Boolean))];
  const tagWrap=document.getElementById('lib-tag-filter');
  if(tagWrap)tagWrap.innerHTML=tags.map(t=>`<button class="idea-tag" onclick="document.getElementById('lib-search').value='${t}';renderLibrary()">${esc(CAT_LABEL[t]||t)}</button>`).join('');
  if(!filtered.length){list.innerHTML=emptyStateHTML('??','No ideas yet','Generate your first idea and it will appear in your library.','Generate your first idea',"showPage('ideas')");return;}
  list.innerHTML=filtered.map(i=>libTab==='created'?createdIdeaCardHTML(i):createIdeaCardHTML(i,'library')).join('');
}
function filterExplore(cat){
  exploreCategory=cat;
  document.querySelectorAll('.explore-cat-btn').forEach(btn=>{
    const isActive=(btn.getAttribute('onclick')||'').includes(`'${cat}'`);
    btn.classList.toggle('active',isActive);
  });
  renderExplore();
}
function renderExplore(){
  const el=document.getElementById('explore-list');if(!el)return;
  const ideas=EXPLORE_MOCK.filter(i=>exploreCategory==='all'||i.category===exploreCategory);
  if(!ideas.length){el.innerHTML=emptyStateHTML('??','No trending ideas here','Try another category or generate a new idea to get the momentum started.','Generate an idea',"showPage('ideas')");return;}
  el.innerHTML=ideas.map(i=>createIdeaCardHTML(i,'explore')).join('');
}
function callIdeaAuthor(username){
  if(!currentUser){showPage('login');return;}
  if(username===currentUser.username){showToast('You cannot call yourself.');return;}
  toggleCall(username);
}
function renderProfile(){
  if(!currentUser)return;
  const avatar=load(ideaStoreKey('avatar_data'));
  const avatarEl=document.getElementById('profile-avatar');
  if(avatarEl){
    const initials=getUserInitials(currentUser.username);
    avatarEl.style.background=`linear-gradient(135deg,${userColor(currentUser.username)},#A38738)`;
    avatarEl.innerHTML=avatar?`<img src="${avatar}" alt="avatar" style="width:100%;height:100%;object-fit:cover"/>`:initials;
  }
  document.getElementById('remove-avatar-btn').style.display=avatar?'inline-block':'none';
  document.getElementById('profile-name').textContent='@'+currentUser.username;
  document.getElementById('profile-email').textContent=currentUser.email||'';
  document.getElementById('profile-ideas-count').textContent=getIdeaHistory().length;
  document.getElementById('profile-saved-count').textContent=getSavedIdeas().length;
  document.getElementById('profile-starred-count').textContent=getStarredIdeas().length;
  const gameStats=document.getElementById('profile-game-stats');
  if(gameStats){
    const stats=getGameStats(),rows=Object.entries(stats);
    gameStats.innerHTML=rows.length?rows.map(([type,s])=>`<div class="arcade-row"><span>${gameIcon(type)} ${gameLabel(type)}</span><span style="color:#E6CE8B;font-weight:800">${s.wins||0}W ${s.losses||0}L ${s.draws||0}D</span></div>`).join(''):'<div style="color:#E6CE8B;font-size:13px">No game stats yet.</div>';
  }
  const recent=document.getElementById('profile-recent-ideas');
  const top=getIdeaHistory().slice(0,5);
  recent.innerHTML=top.length?top.map(i=>`<div class="card" style="padding:10px 12px"><div style="font-size:13px;color:#fff;font-weight:600">${esc(i.title)}</div><div style="font-size:11px;color:#E6CE8B;margin-top:3px">${esc(CAT_LABEL[i.category]||i.category||'Idea')}</div></div>`).join(''):'<div style="color:#E6CE8B;font-size:13px">No ideas yet.</div>';
}
function renderSettings(){
  if(!currentUser)return;
  const theme=load(ideaStoreKey('theme'))||'dark';
  const btn=document.getElementById('theme-toggle'),knob=document.getElementById('theme-knob');
  if(btn&&knob){btn.style.background=theme==='light'?'#E6CE8B':'var(--brand)';knob.style.left=theme==='light'?'23px':'3px';}
  const info=document.getElementById('settings-account-info');
  if(info)info.textContent=`@${currentUser.username} · ${currentUser.email||'local account'}`;
}
function toggleTheme(){
  const cur=load(ideaStoreKey('theme'))||'dark',next=cur==='dark'?'light':'dark';
  save(ideaStoreKey('theme'),next);
  save('zidea_theme',next);
  document.documentElement.style.filter=next==='light'?'invert(1) hue-rotate(180deg)':'';
  showToast(`Theme changed to ${next}.`);
  renderSettings();
}
function clearIdeaHistory(){if(confirm('Are you sure? This cannot be undone.')){setIdeaHistory([]);renderLibrary();renderProfile();syncIdeasToFirebase();showToast('Idea history cleared.');}}
function clearSavedIdeas(){if(confirm('Are you sure? This cannot be undone.')){setSavedIdeas([]);setStarredIdeas([]);renderLibrary();renderProfile();syncIdeasToFirebase();showToast('Saved and starred ideas cleared.');}}
function handleAvatarUpload(event){
  const file=event.target.files?.[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{save(ideaStoreKey('avatar_data'),reader.result);renderProfile();syncAvatarToFirebase();};
  reader.readAsDataURL(file);
}
function removeAvatar(){removeStored(ideaStoreKey('avatar_data'));renderProfile();syncAvatarToFirebase(true);}
function syncIdeasToFirebase(){
  if(!currentUser)return;
  db.patch(`ideas/${currentUser.username}`,{saved:getSavedIdeas(),starred:getStarredIdeas(),history:getIdeaHistory().slice(0,80),updatedAt:Date.now()}).catch(()=>{});
}
async function syncIdeasFromFirebase(){
  if(!currentUser)return;
  const data=await db.read(`ideas/${currentUser.username}`);if(!data)return;
  if(Array.isArray(data.saved))setSavedIdeas(data.saved);
  if(Array.isArray(data.starred))setStarredIdeas(data.starred);
  if(Array.isArray(data.history))setIdeaHistory(data.history);
  renderLibrary();renderProfile();renderExplore();
}
function syncAvatarToFirebase(remove=false){
  if(!currentUser)return;
  const avatar=remove?null:load(ideaStoreKey('avatar_data'))||null;
  db.patch(`profiles/${currentUser.username}`,{avatar,updatedAt:Date.now()}).catch(()=>{});
}
async function syncAvatarFromFirebase(){
  if(!currentUser)return;
  const data=await db.read(`profiles/${currentUser.username}`);if(!data)return;
  if(data.avatar)save(ideaStoreKey('avatar_data'),data.avatar);
  renderProfile();
}
function seedExploreUsers(){
  const accounts=load('zidea_accounts')||{};
  EXPLORE_MOCK.forEach(i=>{if(!accounts[(i.author||'user')+'@zidea.local'])accounts[(i.author||'user')+'@zidea.local']={username:i.author,password:'demo123',wins:0,losses:0};});
  save('zidea_accounts',accounts);
}
// Boot
function initializeApp(){
  testFirebaseAccess();
  seedExploreUsers();
  window.addEventListener('online',syncAllAccountsOnline);
  setTimeout(syncAllAccountsOnline,1200);
  const incomingToast = document.getElementById('incoming-toast');
  if(incomingToast)incomingToast.style.display='none';
  updateStats();
  if(load('zidea_session')){currentUser=load('zidea_session');setLoggedInUI();startFirebase();setTimeout(()=>{listenIncoming();syncIdeasFromFirebase();syncAvatarFromFirebase();},800);}
  else{applyTheme();}
  renderSidebarNav();
  updateLandingAuthUI();
  const landing = document.getElementById('page-landing');
  if(landing){landing.style.display='';landing.style.opacity='';}
  const pathSeg=window.location.pathname.split('/').filter(Boolean).pop();
  const normalizedPath=pathSeg?pathSeg.replace(/\.html?$/i,'').trim().toLowerCase():'';
  const knownRoutes=new Set(['landing','login','signup','dashboard','ideas','library','explore','chat','arcade','profile','settings','help']);
  if(!window.location.hash&&knownRoutes.has(normalizedPath)){window.location.hash=normalizedPath;}
  if(window.location.hash)handleHashRoute();else showPage(currentUser?'dashboard':'landing');
  if(!document.querySelector('.page.active')){showPage('landing');}
}
document.addEventListener('DOMContentLoaded', initializeApp);
window.addEventListener('load', ()=>{
  const landing = document.getElementById('page-landing');
  if (landing && !document.querySelector('.page.active')) {
    landing.classList.add('active');
    landing.style.display = 'flex';
    landing.style.opacity = '1';
  }
});

// ------ Arcade ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const ARCADE_GAMES=[
  {id:'chess',icon:'♟️',name:'Chess',desc:'Classic strategy game. Outsmart your opponent.'},
  {id:'tictactoe',icon:'⭕❌',name:'Tic-Tac-Toe',desc:'First to 3 in a row wins.'},
  {id:'rps',icon:'✊',name:'Rock Paper Scissors',desc:'Best of 3. No luck allowed.'},
  {id:'amongus',icon:'👽',name:'Among Us Mode',desc:"Find the impostor before it's too late."}
];
let pendingChallengeGame='chess',gameInviteSSE=null,currentRoom=null,currentResultGame='tictactoe';
function gameLabel(type){return ARCADE_GAMES.find(g=>g.id===type)?.name||type;}
function gameIcon(type){return ARCADE_GAMES.find(g=>g.id===type)?.icon||'??';}
function renderArcadeHome(){
  const grid=document.getElementById('arcade-game-grid');
  if(grid)grid.innerHTML=ARCADE_GAMES.map(g=>`<div class="card arcade-card"><div class="arcade-icon">${g.icon}</div><div><div class="arcade-card-title">${g.name}</div><div class="arcade-card-copy">${g.desc}</div></div><div class="arcade-actions"><button class="btn-primary" style="font-size:12px" onclick="startArcadeGame('${g.id}')">Play vs AI</button><button class="btn-ghost" style="font-size:12px" onclick="challengeArcadeGame('${g.id}')">Challenge Friend</button></div></div>`).join('');
  renderInvites();renderRecentResults();renderLeaderboard();
}
function startArcadeGame(type){
  if(type==='chess')openChessSetup('bot');
  else startGame(type);
}
function challengeArcadeGame(type){
  if(type==='chess')openChessSetup('challenge');
  else openChallengeModal(type);
}
function roomCode(){return Math.random().toString(36).slice(2,8).toUpperCase();}
async function createGameRoom(type){
  if(!currentUser)return showPage('login');
  const code=roomCode();currentRoom={code,type,host:currentUser.username};
  await db.write(`gameRooms/${code}`,{code,type,host:currentUser.username,players:[currentUser.username],state:'waiting',updatedAt:Date.now()});
  document.getElementById('game-lobby').style.display='flex';
  document.getElementById('lobby-title').textContent=`${gameLabel(type)} room`;
  document.getElementById('lobby-status').textContent='Waiting for opponent... Share this room code.';
  document.getElementById('lobby-code').textContent=code;
  listenGameRoom(code);
}
async function joinGameRoom(){
  const code=String(document.getElementById('join-room-code')?.value||'').trim().toUpperCase();
  if(!code||!currentUser)return;
  const room=await db.read(`gameRooms/${code}`);
  if(!room){showToast('Room not found.');return;}
  if(room.type==='chess'&&room.options){
    applyChessOptions(room.options);
    if(currentUser.username!==room.host){
      chessPlayerColor = room.options.color==='white' ? 'black' : 'white';
      updateChessSettingsUI();
    }
  }
  if(room.type==='chess')gameMode='multiplayer';
  const players=[...new Set([...(room.players||[]),currentUser.username])].slice(0,2);
  await db.patch(`gameRooms/${code}`,{players,state:players.length>1?'active':'waiting',updatedAt:Date.now()});
  currentRoom={code,type:room.type,host:room.host};
  listenGameRoom(code);startGame(room.type);
}
function listenGameRoom(code){
  const sse=new EventSource(`${FB}/gameRooms/${code}.json`);
  sse.addEventListener('put',e=>{try{updateLobbyFromRoom(JSON.parse(e.data).data);}catch(_){}});
  sse.addEventListener('patch',e=>{try{db.read(`gameRooms/${code}`).then(updateLobbyFromRoom);}catch(_){}});
  setTimeout(()=>sse.close(),60*60*1000);
}
function updateLobbyFromRoom(room){
  if(!room)return;
  const status=document.getElementById('lobby-status');
  if(status)status.textContent=(room.players||[]).length>1?`Opponent joined: @${room.players.find(p=>p!==currentUser?.username)}`:'Waiting for opponent...';
}
function exitLobby(){document.getElementById('game-lobby').style.display='none';currentRoom=null;}
function openChallengeModal(type,username=''){
  if(type==='chess'){openChessSetup('challenge',username);return;}
  pendingChallengeGame=type;
  document.getElementById('challenge-title').textContent=`Challenge Friend: ${gameLabel(type)}`;
  document.getElementById('challenge-search').value=username?`@${username}`:'';
  document.getElementById('challenge-status').textContent='';
  document.getElementById('challenge-modal').classList.add('show');
}
function closeChallengeModal(){document.getElementById('challenge-modal').classList.remove('show');}
async function sendGameChallenge(){
  if(!currentUser)return showPage('login');
  const isChessFriend=pendingChallengeGame==='chess'&&pendingChessLaunch==='challenge';
  const input=isChessFriend?document.getElementById('chess-setup-search'):document.getElementById('challenge-search');
  const statusEl=isChessFriend?document.getElementById('chess-setup-status'):document.getElementById('challenge-status');
  const to=String(input?.value||'').trim().replace(/^@/,'').toLowerCase();
  if(!to||to===currentUser.username){if(statusEl)statusEl.textContent='Enter a valid friend username.';return;}
  const code=roomCode();
  const roomData={code,type:pendingChallengeGame,host:currentUser.username,players:[currentUser.username],state:'waiting',updatedAt:Date.now()};
  if(isChessFriend)roomData.options={...currentChessOptions};
  await db.write(`gameRooms/${code}`,roomData);
  const invitePayload={code,type:pendingChallengeGame,from:currentUser.username,to,ts:Date.now(),status:'pending'};
  if(isChessFriend)invitePayload.options={...currentChessOptions};
  await db.patch(`gameInvites/${to}`,{[code]:invitePayload});
  if(statusEl)statusEl.textContent=`Waiting for @${to} to accept... Room ${code}`;
  currentRoom={code,type:pendingChallengeGame,host:currentUser.username};listenGameRoom(code);renderArcadeHome();
}
function listenGameInvites(){
  if(!currentUser||gameInviteSSE)return;
  gameInviteSSE=new EventSource(`${FB}/gameInvites/${currentUser.username}.json`);
  gameInviteSSE.addEventListener('put',e=>{try{renderInvites(JSON.parse(e.data).data);}catch(_){}});
  gameInviteSSE.addEventListener('patch',()=>renderInvites());
}
async function renderInvites(data){
  const el=document.getElementById('arcade-invites');if(!el)return;
  const invites=data||await db.read(`gameInvites/${currentUser?.username}`)||{};
  const list=Object.values(invites).filter(i=>i&&i.status==='pending');
  if(!list.length){el.innerHTML='<div class="arcade-row" style="color:#E6CE8B;font-size:13px">No active games � challenge a friend!</div>';return;}
  el.innerHTML=list.map(i=>`<div class="arcade-row"><div><div style="color:#fff;font-weight:800">${gameIcon(i.type)} Pending ${gameLabel(i.type)} challenge</div><div style="color:#E6CE8B;font-size:12px;margin-top:3px">From @${esc(i.from)} � room ${esc(i.code)}</div></div><div style="display:flex;gap:8px"><button class="btn-primary" style="font-size:12px" onclick="acceptGameInvite('${i.code}','${i.type}')">Accept</button><button class="btn-ghost" style="font-size:12px" onclick="declineGameInvite('${i.code}')">Decline</button></div></div>`).join('');
}
async function acceptGameInvite(code,type){document.getElementById('join-room-code').value=code;await joinGameRoom();await db.patch(`gameInvites/${currentUser.username}/${code}`,{status:'accepted'});startGame(type);}
async function declineGameInvite(code){await db.patch(`gameInvites/${currentUser.username}/${code}`,{status:'declined'});renderInvites();}
function getGameStats(){return load(ideaStoreKey('game_stats'))||{};}
function setGameStats(v){save(ideaStoreKey('game_stats'),v);}
function recordGameResult(type,result,opponent='AI'){
  const stats=getGameStats();const s=stats[type]||{wins:0,losses:0,draws:0};
  if(result==='win')s.wins++;else if(result==='loss')s.losses++;else s.draws++;
  stats[type]=s;setGameStats(stats);
  const recent=load(ideaStoreKey('game_results'))||[];
  save(ideaStoreKey('game_results'),[{type,result,opponent,ts:Date.now()},...recent].slice(0,20));
  db.patch(`gameStats/${currentUser?.username||'guest'}`,stats).catch(()=>{});
}
function renderRecentResults(){
  const el=document.getElementById('arcade-results');if(!el)return;
  const recent=(load(ideaStoreKey('game_results'))||[]).slice(0,3);
  if(!recent.length){el.innerHTML='<div class="arcade-row" style="color:#E6CE8B;font-size:13px">No recent results yet.</div>';return;}
  el.innerHTML=recent.map(r=>`<div class="arcade-row"><span>${gameIcon(r.type)} You ${r.result==='win'?'beat':r.result==='loss'?'lost to':'drew with'} @${esc(r.opponent)} at ${gameLabel(r.type)} � ${relativeTime(r.ts)}</span></div>`).join('');
}
function renderLeaderboard(){
  const el=document.getElementById('arcade-leaderboard');if(!el)return;
  const stats=getGameStats(),rows=Object.entries(stats).map(([type,s])=>({type,...s,score:(s.wins||0)*3+(s.draws||0)})).sort((a,b)=>b.score-a.score).slice(0,5);
  if(!rows.length){el.innerHTML='<div class="arcade-row" style="color:#E6CE8B;font-size:13px">Play a game to enter the leaderboard.</div>';return;}
  el.innerHTML=rows.map((r,i)=>`<div class="arcade-row"><span>${i+1}. ${gameIcon(r.type)} @${esc(currentUser?.username||'you')} � ${gameLabel(r.type)}</span><span style="color:#E6CE8B;font-weight:800">${r.wins||0}W ${r.losses||0}L ${r.draws||0}D</span></div>`).join('');
}
function showGameResult(type,title,summary,result){
  currentResultGame=type;recordGameResult(type,result);
  document.getElementById('game-result-title').textContent=title;
  document.getElementById('game-result-summary').textContent=summary;
  document.getElementById('game-result-modal').classList.add('show');
}
function closeGameResult(){document.getElementById('game-result-modal').classList.remove('show');}
function rematchGame(){closeGameResult();startGame(currentResultGame);}
function newGameFromResult(){closeGameResult();exitGame();}
function backToArcadeFromResult(){closeGameResult();exitGame();showPage('arcade');}
let gameMode='bot',chessLevel=1;
let chessTheme='wood',chessPieceStyle='bold',chessPlayerColor='white',chessTimeMinutes=5,chessIncrement=0,chessClockWhite=0,chessClockBlack=0,chessTimerInterval=null,pendingChessLaunch='bot';
let currentChessOptions={theme:'wood',pieceStyle:'bold',color:'white',minutes:5,increment:0};
const BOARD_THEMES={
  wood:{light:'#f0d4a8',dark:'#a36f32',selected:'#b37c3d',highlight:'#e8c68c',kingCheck:'#f87171'},
  metal:{light:'#d7d7db',dark:'#8e9096',selected:'#b2b4bb',highlight:'#f0f1f5',kingCheck:'#f87171'},
  glass:{light:'rgba(255,255,255,0.72)',dark:'rgba(20,33,51,0.92)',selected:'rgba(201,168,76,0.35)',highlight:'rgba(255,255,255,0.18)',kingCheck:'#f87171'},
  stone:{light:'#c8c4b7',dark:'#6d6a55',selected:'#9c894d',highlight:'#d6cfa8',kingCheck:'#f87171'}
};
function openChessSetup(mode,username=''){
  pendingChessLaunch=mode;
  pendingChallengeGame='chess';
  document.getElementById('chess-setup-title').textContent=mode==='challenge'?'Challenge a friend':'Chess setup';
  document.getElementById('chess-setup-desc').textContent=mode==='challenge'?'Set your board style, clock, and color before sending the invite.':'Set your board style, clock, and color before playing the bot.';
  document.getElementById('chess-challenge-row').style.display=mode==='challenge'?'grid':'none';
  const action=document.getElementById('chess-setup-action');
  if(action)action.textContent=mode==='challenge'?'Send challenge':'Start game';
  document.getElementById('chess-setup-search').value=username?`@${username}`:'';
  updateChessSettingsUI();
  document.getElementById('chess-setup-modal').classList.add('show');
}
function closeChessSetup(){document.getElementById('chess-setup-modal').classList.remove('show');}
function setChessTheme(theme){chessTheme=theme;updateChessSettingsUI();}
function setChessPieceStyle(style){chessPieceStyle=style;updateChessSettingsUI();}
function setChessPlayerColor(color){chessPlayerColor=color;updateChessSettingsUI();}
function setChessTimeMinutes(minutes){chessTimeMinutes=minutes;updateChessSettingsUI();}
function setChessIncrement(value){chessIncrement=value;updateChessSettingsUI();}
function applyChessOptions(options){
  if(!options)return;
  chessTheme=options.theme||chessTheme;
  chessPieceStyle=options.pieceStyle||chessPieceStyle;
  chessPlayerColor=options.color||chessPlayerColor;
  chessTimeMinutes=typeof options.minutes==='number'?options.minutes:chessTimeMinutes;
  chessIncrement=typeof options.increment==='number'?options.increment:chessIncrement;
  currentChessOptions={theme:chessTheme,pieceStyle:chessPieceStyle,color:chessPlayerColor,minutes:chessTimeMinutes,increment:chessIncrement};
  updateChessSettingsUI();
}
function updateChessSettingsUI(){
  currentChessOptions={theme:chessTheme,pieceStyle:chessPieceStyle,color:chessPlayerColor,minutes:chessTimeMinutes,increment:chessIncrement};
  ['wood','metal','glass','stone'].forEach(theme=>document.getElementById(`theme-${theme}-btn`)?.classList.toggle('active',theme===chessTheme));
  ['bold','classic'].forEach(style=>document.getElementById(`piece-${style}-btn`)?.classList.toggle('active',style===chessPieceStyle));
  ['white','black'].forEach(color=>document.getElementById(`color-${color}-btn`)?.classList.toggle('active',color===chessPlayerColor));
  [5,10,0].forEach(value=>document.getElementById(`time-${value}-btn`)?.classList.toggle('active',value===chessTimeMinutes));
  [0,1,2,5].forEach(value=>document.getElementById(`inc-${value}-btn`)?.classList.toggle('active',value===chessIncrement));
  const status=document.getElementById('chess-setup-status');
  if(status)status.textContent='';
}
function confirmChessSetup(){
  if(pendingChessLaunch==='challenge'){sendGameChallenge();return;}
  gameMode='bot';
  if(chessPlayerColor==='black')chessTurn='b';
  document.getElementById('chess-setup-modal').classList.remove('show');
  startGame('chess');
}
function setMode(m){gameMode=m;document.getElementById('mode-bot').classList.toggle('active',m==='bot');document.getElementById('mode-multi').classList.toggle('active',m==='multiplayer');}
function setChessLevel(lvl){chessLevel=lvl;document.querySelectorAll('.chess-lvl-btn').forEach(b=>b.classList.toggle('active',+b.dataset.lvl===lvl));resetChess();updateChessLevelLabel();}
function startGame(type){
  document.getElementById('game-picker').style.display='none';
  ['game-ttt','game-chess','game-rps'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
  if(type==='tictactoe'){document.getElementById('game-ttt').style.display='flex';resetTTT();}
  if(type==='chess'){document.getElementById('game-chess').style.display='flex';resetChess();}
  if(type==='rps'){document.getElementById('game-rps').style.display='flex';resetRPS();}
  suppressHashChange=true;window.location.hash='arcade-'+type;setTimeout(()=>{suppressHashChange=false;},0);
}
function exitGame(){
  resetTTT();resetRPS();resetChess();
  if(auRaf){cancelAnimationFrame(auRaf);auRaf=null;}
  const vp=document.getElementById('au-vote-panel');if(vp)vp.style.display='none';
  const ep=document.getElementById('au-end-panel');if(ep)ep.style.display='none';
  ['game-ttt','game-chess','game-rps'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
  document.getElementById('game-picker').style.display='flex';
  suppressHashChange=true;window.location.hash='arcade';setTimeout(()=>{suppressHashChange=false;},0);
}
// TTT
let tttBoard=Array(9).fill(null),tttX=true,tttOver=false;
const WINS=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function tttWinner(b){for(const[a,c,d]of WINS){if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];}return b.every(Boolean)?'draw':null;}
function tttBotMove(b){for(const m of['O','X']){for(const[a,c,d]of WINS){const l=[b[a],b[c],b[d]];if(l.filter(x=>x===m).length===2&&l.includes(null))return[a,c,d][l.indexOf(null)];}}const e=b.map((v,i)=>v===null?i:-1).filter(i=>i!==-1);return e[Math.floor(Math.random()*e.length)];}
function renderTTT(){document.getElementById('ttt-grid').innerHTML=tttBoard.map((c,i)=>`<button class="ttt-cell${c==='X'?' x':c==='O'?' o':''}" onclick="tttClick(${i})"${(c||tttOver)?'disabled':''}>${c||''}</button>`).join('');}
function tttClick(i){if(tttBoard[i]||tttOver)return;tttBoard[i]=tttX?'X':'O';tttX=!tttX;renderTTT();const w=tttWinner(tttBoard);if(w){tttEnd(w);return;}if(gameMode==='bot'&&!tttX){document.getElementById('ttt-status').textContent='Bot thinking...';setTimeout(()=>{const idx=tttBotMove(tttBoard);if(idx!==undefined){tttBoard[idx]='O';tttX=true;renderTTT();const w2=tttWinner(tttBoard);if(w2)tttEnd(w2);else document.getElementById('ttt-status').textContent='Your turn (X)';}},400);}else{document.getElementById('ttt-status').textContent=tttX?'Your turn (X)':"Player 2's turn (O)";}}
function tttEnd(r){tttOver=true;renderTTT();document.getElementById('ttt-status').style.display='none';document.getElementById('ttt-result').style.display='flex';const text=r==='draw'?"It's a draw!":r==='X'?'You win!':'Player 2 wins!';document.getElementById('ttt-result-text').textContent=text;showGameResult('tictactoe',text,`Final board: ${tttBoard.map(x=>x||'-').join(' ')}`,r==='draw'?'draw':r==='X'?'win':'loss');}
function resetTTT(){tttBoard=Array(9).fill(null);tttX=true;tttOver=false;document.getElementById('ttt-status').style.display='block';document.getElementById('ttt-status').textContent='Your turn (X)';document.getElementById('ttt-result-text').textContent='';document.getElementById('ttt-result').style.display='none';renderTTT();}
// RPS
let rpsYou=0,rpsBot=0,rpsRound=0,rpsLocked=false;
const RPS_EMOJI={rock:'✊',paper:'✋',scissors:'✌️'};const RPS_BEATS={rock:'scissors',paper:'rock',scissors:'paper'};
function rpsPlay(choice){
  if(rpsRound>=5||rpsLocked)return;
  rpsLocked=true;
  document.getElementById('rps-result').textContent='Bot thinking...';
  setTimeout(()=>{
    const bot=['rock','paper','scissors'][Math.floor(Math.random()*3)];
    let res;
    if(choice===bot)res='Draw!';
    else if(RPS_BEATS[choice]===bot){res='You win!';rpsYou++;}
    else{res='Bot wins!';rpsBot++;}
    rpsRound++;
    document.getElementById('rps-result').textContent=`${RPS_EMOJI[choice]} vs ${RPS_EMOJI[bot]} · ${res}`;
    document.getElementById('rps-score').textContent=`You: ${rpsYou} · Bot: ${rpsBot}${rpsRound>=5?' (Game over!)':''}`;
    rpsLocked=false;
    if(rpsRound>=5||rpsYou===3||rpsBot===3){
      const outcome=rpsYou===rpsBot?'draw':rpsYou>rpsBot?'win':'loss';
      showGameResult('rps',outcome==='win'?'You won the series':outcome==='loss'?'You lost the series':'Series draw',`Final score: You ${rpsYou}, Bot ${rpsBot}.`,outcome);
    }
  },1000);
}
function resetRPS(){rpsYou=0;rpsBot=0;rpsRound=0;rpsLocked=false;document.getElementById('rps-result').textContent='Pick your move.';document.getElementById('rps-score').textContent='You: 0 — Bot: 0';}
// ------ Chess (full rules + minimax) ------------------------------------------------------------------------------------------------------------------------------
let chessBoard=[],chessSelected=null,chessTurn='w',chessOver=false,chessHighlights=[];
let castleRights={w:{K:true,Q:true},b:{K:true,Q:true}},enPassantTarget=null,positionHistory=[],pendingPromotion=null;
let boardHistory=[],chessScoreWhite=0,chessScoreBlack=0,chessBotTimeoutId=null,chessCaptureMessage='',chessCaptureTimer=null;
const CHESS_UNICODE={K:['♔','♚'],Q:['♕','♛'],R:['♖','♜'],B:['♗','♝'],N:['♘','♞'],P:['♙','♟']};
const PIECE_VAL={K:20000,Q:900,R:500,B:330,N:320,P:100};
const PST={P:[[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],N:[[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],B:[[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],R:[[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]],Q:[[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],K:[[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]]};
function chessInit(){const order=['R','N','B','Q','K','B','N','R'];chessBoard=Array(8).fill(null).map(()=>Array(8).fill(null));for(let c=0;c<8;c++){chessBoard[0][c]={t:order[c],col:'b'};chessBoard[1][c]={t:'P',col:'b'};chessBoard[6][c]={t:'P',col:'w'};chessBoard[7][c]={t:order[c],col:'w'};}castleRights={w:{K:true,Q:true},b:{K:true,Q:true}};enPassantTarget=null;positionHistory=[];pendingPromotion=null;boardHistory=[cloneChessState()];chessScoreWhite=0;chessScoreBlack=0;}
function cloneChessState(){return {board:chessBoard.map(row=>row.map(cell=>cell?{...cell}:null)),castleRights:{w:{...castleRights.w},b:{...castleRights.b}},enPassantTarget:enPassantTarget? [enPassantTarget[0],enPassantTarget[1]]:null,chessTurn,chessScoreWhite,chessScoreBlack,positionHistory:[...positionHistory],pendingPromotion};}
function saveChessHistorySnapshot(){boardHistory.push(cloneChessState());if(boardHistory.length>60)boardHistory.shift();}
function takebackChessMove(){if(boardHistory.length<=1)return;boardHistory.pop();const prev=boardHistory[boardHistory.length-1];if(!prev)return;chessBoard=prev.board.map(row=>row.map(cell=>cell?{...cell}:null));castleRights={w:{...prev.castleRights.w},b:{...prev.castleRights.b}};enPassantTarget=prev.enPassantTarget? [prev.enPassantTarget[0],prev.enPassantTarget[1]]:null;chessTurn=prev.chessTurn;chessScoreWhite=prev.chessScoreWhite;chessScoreBlack=prev.chessScoreBlack;positionHistory=[...prev.positionHistory];pendingPromotion=prev.pendingPromotion;chessOver=false;if(chessTimerInterval){clearInterval(chessTimerInterval);chessTimerInterval=null;}if(chessTimeMinutes>0)startChessTimer();renderChess();const statusEl=document.getElementById('chess-status');if(statusEl)statusEl.textContent='Move taken back.';if(gameMode==='bot'&&chessTurn!== (chessPlayerColor==='white'?'w':'b')){const statusEl2=document.getElementById('chess-status');if(statusEl2)statusEl2.textContent='Bot thinking...';clearTimeout(chessBotTimeoutId);chessBotTimeoutId=setTimeout(()=>{chessBotMove();},1500);}}
function chessFEN(b,turn,cr,ep){let s='';for(let r=0;r<8;r++){let e=0;for(let c=0;c<8;c++){const p=b[r][c];if(!p){e++;}else{if(e){s+=e;e=0;}s+=p.col==='w'?p.t:p.t.toLowerCase();}}if(e)s+=e;if(r<7)s+='/';}s+=' '+turn+' '+(cr.w.K?'K':'')+(cr.w.Q?'Q':'')+(cr.b.K?'k':'')+(cr.b.Q?'q':'');s+=' '+(ep?String.fromCharCode(97+ep[1])+(8-ep[0]):'–');return s;}
function chessRawMoves(b,r,c,cr,ep){const p=b[r][c];if(!p)return[];const{t,col}=p,moves=[];const inB=(r,c)=>r>=0&&r<8&&c>=0&&c<8;const empty=(r,c)=>!b[r][c];const enemy=(r,c)=>b[r][c]&&b[r][c].col!==col;const slide=(dr,dc)=>{let nr=r+dr,nc=c+dc;while(inB(nr,nc)){if(empty(nr,nc)){moves.push([nr,nc,'']);}else{if(enemy(nr,nc))moves.push([nr,nc,'cap']);break;}nr+=dr;nc+=dc;}};if(t==='P'){const d=col==='w'?-1:1,s=col==='w'?6:1;if(inB(r+d,c)&&empty(r+d,c)){moves.push([r+d,c,r+d===0||r+d===7?'promo':'']);if(r===s&&empty(r+d*2,c))moves.push([r+d*2,c,'double']);}for(const dc of[-1,1]){if(inB(r+d,c+dc)){if(enemy(r+d,c+dc))moves.push([r+d,c+dc,r+d===0||r+d===7?'promo':'cap']);if(ep&&ep[0]===r+d&&ep[1]===c+dc)moves.push([r+d,c+dc,'ep']);}}}if(t==='N'){for(const[dr,dc]of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]){const nr=r+dr,nc=c+dc;if(inB(nr,nc)&&(empty(nr,nc)||enemy(nr,nc)))moves.push([nr,nc,'']);}}if(t==='K'){for(const[dr,dc]of[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){const nr=r+dr,nc=c+dc;if(inB(nr,nc)&&(empty(nr,nc)||enemy(nr,nc)))moves.push([nr,nc,'']);}const row=col==='w'?7:0;if(r===row&&c===4){if(cr[col].K&&empty(row,5)&&empty(row,6)&&b[row][7]?.t==='R'&&b[row][7]?.col===col)moves.push([row,6,'castle-K']);if(cr[col].Q&&empty(row,3)&&empty(row,2)&&empty(row,1)&&b[row][0]?.t==='R'&&b[row][0]?.col===col)moves.push([row,2,'castle-Q']);}}if(t==='R'||t==='Q'){slide(-1,0);slide(1,0);slide(0,-1);slide(0,1);}if(t==='B'||t==='Q'){slide(-1,-1);slide(-1,1);slide(1,-1);slide(1,1);}return moves;}
function chessApply(b,fr,fc,tr,tc,flag,cr,ep,promo){const next=b.map(row=>[...row]);const p=next[fr][fc];const ncr={w:{...cr.w},b:{...cr.b}};let nep=null;if(flag==='ep')next[fr][tc]=null;next[tr][tc]=p;next[fr][fc]=null;if(flag==='promo'||flag==='promo-cap')next[tr][tc]={t:promo||'Q',col:p.col};if(flag==='double')nep=[fr+(tr-fr)/2,fc];if(flag==='castle-K'){next[tr][5]={t:'R',col:p.col};next[tr][7]=null;}if(flag==='castle-Q'){next[tr][3]={t:'R',col:p.col};next[tr][0]=null;}if(p.t==='K'){ncr[p.col].K=false;ncr[p.col].Q=false;}if(p.t==='R'){if(fc===7)ncr[p.col].K=false;if(fc===0)ncr[p.col].Q=false;}if(tr===7&&tc===7)ncr['w'].K=false;if(tr===7&&tc===0)ncr['w'].Q=false;if(tr===0&&tc===7)ncr['b'].K=false;if(tr===0&&tc===0)ncr['b'].Q=false;return{board:next,cr:ncr,ep:nep};}
function chessIsAttacked(b,r,c,byCol,cr,ep){for(let pr=0;pr<8;pr++)for(let pc=0;pc<8;pc++){const p=b[pr][pc];if(!p||p.col!==byCol)continue;if(chessRawMoves(b,pr,pc,cr||{w:{K:false,Q:false},b:{K:false,Q:false}},ep||null).some(([mr,mc])=>mr===r&&mc===c))return true;}return false;}
function chessKingPos(b,col){for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(b[r][c]?.t==='K'&&b[r][c].col===col)return[r,c];return null;}
function chessInCheck(b,col,cr,ep){const kp=chessKingPos(b,col);if(!kp)return false;return chessIsAttacked(b,kp[0],kp[1],col==='w'?'b':'w',cr,ep);}
function chessMoves(b,r,c,cr,ep){const p=b[r][c];if(!p)return[];const raw=chessRawMoves(b,r,c,cr,ep);const opp=p.col==='w'?'b':'w';return raw.filter(([tr,tc,flag])=>{if(flag==='castle-K'){if(chessInCheck(b,p.col,cr,ep))return false;if(chessIsAttacked(b,tr,5,opp,cr,ep))return false;if(chessIsAttacked(b,tr,6,opp,cr,ep))return false;}if(flag==='castle-Q'){if(chessInCheck(b,p.col,cr,ep))return false;if(chessIsAttacked(b,tr,3,opp,cr,ep))return false;if(chessIsAttacked(b,tr,2,opp,cr,ep))return false;}const res=chessApply(b,r,c,tr,tc,flag,cr,ep,'Q');return!chessInCheck(res.board,p.col,res.cr,res.ep);});}
function chessHasLegal(b,col,cr,ep){for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(b[r][c]?.col===col&&chessMoves(b,r,c,cr,ep).length>0)return true;return false;}
function chessCheckResult(b,col,cr,ep){if(chessHasLegal(b,col,cr,ep))return null;return chessInCheck(b,col,cr,ep)?'checkmate':'stalemate';}
function chessEval(b){let score=0;for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(!p)continue;const sign=p.col==='w'?1:-1;const pstRow=p.col==='w'?r:7-r;const pst=PST[p.t]?.[pstRow]?.[c]||0;const materialBonus=p.t==='K'?0:1;score+=sign*(PIECE_VAL[p.t]+pst+materialBonus);}return score;}
function minimax(b,depth,alpha,beta,maximizing,cr,ep){const col=maximizing?'w':'b';const result=chessCheckResult(b,col,cr,ep);if(result==='checkmate')return maximizing?-100000:100000;if(result==='stalemate')return 0;if(depth===0)return chessEval(b);const moves=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(b[r][c]?.col===col)for(const[tr,tc,flag]of chessMoves(b,r,c,cr,ep))moves.push([r,c,tr,tc,flag]);moves.sort((a,b2)=>{const va=b[a[2]]?.[a[3]]?PIECE_VAL[b[a[2]][a[3]].t]||0:0;const vb=b[b2[2]]?.[b2[3]]?PIECE_VAL[b[b2[2]][b2[3]].t]||0:0;return vb-va;});if(maximizing){let best=-Infinity;for(const[fr,fc,tr,tc,flag]of moves){const res=chessApply(b,fr,fc,tr,tc,flag,cr,ep,'Q');const val=minimax(res.board,depth-1,alpha,beta,false,res.cr,res.ep);best=Math.max(best,val);alpha=Math.max(alpha,val);if(beta<=alpha)break;}return best;}else{let best=Infinity;for(const[fr,fc,tr,tc,flag]of moves){const res=chessApply(b,fr,fc,tr,tc,flag,cr,ep,'Q');const val=minimax(res.board,depth-1,alpha,beta,true,res.cr,res.ep);best=Math.min(best,val);beta=Math.min(beta,val);if(beta<=alpha)break;}return best;}}
const CHESS_LEVELS={
  1:{depth:1,random:0.75,elo:200},
  2:{depth:2,random:0.45,elo:800},
  3:{depth:3,random:0.2,elo:1400},
  4:{depth:4,random:0.08,elo:2200},
  5:{depth:5,random:0.0,elo:3000}
};
function updateChessLevelLabel(){
  const label=document.getElementById('chess-level-label');
  const cfg=CHESS_LEVELS[chessLevel]||CHESS_LEVELS[1];
  if(label)label.textContent=`Bot strength: ${cfg.elo} Elo`;
}
function chessBotMove(){
  const cfg=CHESS_LEVELS[chessLevel]||CHESS_LEVELS[1];
  const botColor=chessPlayerColor==='white'?'b':'w';
  const all=[];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(chessBoard[r][c]?.col===botColor)for(const[tr,tc,flag]of chessMoves(chessBoard,r,c,castleRights,enPassantTarget))all.push([r,c,tr,tc,flag]);
  if(!all.length)return;
  let chosen;
  if(Math.random()<cfg.random){
    chosen=all[Math.floor(Math.random()*all.length)];
  }else{
    let best=Infinity,bestMoves=[];
    for(const[fr,fc,tr,tc,flag]of all){
      const res=chessApply(chessBoard,fr,fc,tr,tc,flag,castleRights,enPassantTarget,'Q');
      const val=minimax(res.board,cfg.depth-1,-Infinity,Infinity,true,res.cr,res.ep);
      if(val<best){best=val;bestMoves=[[fr,fc,tr,tc,flag]];}else if(val===best){bestMoves.push([fr,fc,tr,tc,flag]);}
    }
    chosen=bestMoves[Math.floor(Math.random()*bestMoves.length)];
  }
  const[fr,fc,tr,tc,flag]=chosen;
  const capturedPiece=flag==='ep'?chessBoard[fr][tc]:chessBoard[tr][tc];
  const res=chessApply(chessBoard,fr,fc,tr,tc,flag,castleRights,enPassantTarget,'Q');
  chessBoard=res.board;castleRights=res.cr;enPassantTarget=res.ep;
  if(capturedPiece){
    const value=PIECE_VAL[capturedPiece.t]||0;
    if(botColor==='w')chessScoreWhite+=value;else chessScoreBlack+=value;
    chessCaptureMessage=`+${value}`;
    if(chessCaptureTimer){clearTimeout(chessCaptureTimer);}chessCaptureTimer=setTimeout(()=>{chessCaptureMessage='';renderChessStatus();},1500);
  }
  chessTurn=chessPlayerColor==='white'?'w':'b';
  if(chessIncrement>0){
    if(botColor==='w')chessClockWhite+=chessIncrement;else chessClockBlack+=chessIncrement;
    updateChessClockDisplay();
  }
  const fen=chessFEN(chessBoard,chessTurn,castleRights,enPassantTarget);positionHistory.push(fen);
  saveChessHistorySnapshot();
  renderChess();
  if(chessCheckThreefold()){chessEndGame("Draw — threefold repetition!",'draw');return;}
  const result=chessCheckResult(chessBoard,chessTurn,castleRights,enPassantTarget);
  if(result==='checkmate'){const winner = chessTurn==='w' ? 'Black' : 'White';const crown = chessTurn==='w' ? '♚' : '♔';chessEndGame(`${winner} wins by checkmate! ${crown}`, (chessTurn=== (chessPlayerColor==='white'?'w':'b') ? 'loss' : 'win'));return;}
  if(result==='stalemate'){chessEndGame("Stalemate — it's a draw!",'draw');return;}
  renderChessStatus();
}
function chessCheckThreefold(){const last=positionHistory[positionHistory.length-1];return positionHistory.filter(p=>p===last).length>=3;}
function chessAfterMove(opp){
  const fen=chessFEN(chessBoard,opp,castleRights,enPassantTarget);positionHistory.push(fen);
  if(chessCheckThreefold()){renderChess();chessEndGame("Draw — threefold repetition!",'draw');return true;}
  const result=chessCheckResult(chessBoard,opp,castleRights,enPassantTarget);
  if(result==='checkmate'){renderChess();
    const winner=opp==='w'?'Black':'White';
    const crown=opp==='w'?'♚':'♔';
    chessEndGame(`${winner} wins by checkmate! ${crown}`,(opp==='w'?'loss':'win'));
    return true;
  }
  if(result==='stalemate'){renderChess();chessEndGame("Stalemate — it's a draw!",'draw');return true;}
  return false;
}
function chessSquareClick(r,c){
  if(chessOver||pendingPromotion)return;
  if(chessSelected){const[sr,sc]=chessSelected;const move=chessHighlights.find(([hr,hc])=>hr===r&&hc===c);if(move){const[,,flag]=move;if(flag==='promo'||flag==='promo-cap'){pendingPromotion={fr:sr,fc:sc,tr:r,tc:c,flag};chessSelected=null;chessHighlights=[];renderChess();showPromoDialog(chessBoard[sr][sc].col);return;}chessExecuteMove(sr,sc,r,c,flag,'Q');return;}chessSelected=null;chessHighlights=[];}
  const p=chessBoard[r][c];const myColor=gameMode==='bot'?(chessPlayerColor==='white'?'w':'b'):chessTurn;
  if(p&&p.col===myColor&&chessTurn===myColor){const lm=chessMoves(chessBoard,r,c,castleRights,enPassantTarget);if(lm.length>0){chessSelected=[r,c];chessHighlights=lm;}}renderChess();
}
function chessExecuteMove(fr,fc,tr,tc,flag,promo){
  const capturedPiece=flag==='ep'?chessBoard[fr][tc]:chessBoard[tr][tc];
  const res=chessApply(chessBoard,fr,fc,tr,tc,flag,castleRights,enPassantTarget,promo);chessBoard=res.board;castleRights=res.cr;enPassantTarget=res.ep;
  if(capturedPiece){
    const value=PIECE_VAL[capturedPiece.t]||0;
    if(chessTurn==='w')chessScoreWhite+=value;else chessScoreBlack+=value;
    chessCaptureMessage=`+${value}`;
    if(chessCaptureTimer){clearTimeout(chessCaptureTimer);}chessCaptureTimer=setTimeout(()=>{chessCaptureMessage='';renderChessStatus();},1500);
  }
  if(chessIncrement>0){
    if(chessTurn==='w')chessClockWhite+=chessIncrement;else chessClockBlack+=chessIncrement;
    updateChessClockDisplay();
  }
  const opp=chessTurn==='w'?'b':'w';chessSelected=null;chessHighlights=[];pendingPromotion=null;
  if(chessAfterMove(opp))return;
  chessTurn=opp;
  saveChessHistorySnapshot();
  renderChess();
  if(gameMode==='bot'){
    const statusEl=document.getElementById('chess-status');if(statusEl)statusEl.textContent='Bot thinking...';clearTimeout(chessBotTimeoutId);chessBotTimeoutId=setTimeout(()=>{chessBotMove();},1500);
  }else{
    const statusEl=document.getElementById('chess-status');if(statusEl)statusEl.textContent=(chessInCheck(chessBoard,opp,castleRights,enPassantTarget)?'⚠ Check! ':'')+(opp==='w'?"White's turn":"Black's turn");
  }
}

function renderChessStatus(){
  const statusEl=document.getElementById('chess-status');
  if(statusEl){
    if(chessOver){statusEl.textContent='Game over';}
    else if(gameMode==='bot'){
      if(chessTurn=== (chessPlayerColor==='white'?'w':'b')) statusEl.textContent=`Your turn (${chessPlayerColor==='white'?'White':'Black'})`;
      else statusEl.textContent='Bot thinking...';
    } else {
      statusEl.textContent=(chessInCheck(chessBoard,chessTurn,castleRights,enPassantTarget)?'⚠ Check! ':'')+(chessTurn==='w'?"White's turn":"Black's turn");
    }
  }
  const captureEl=document.getElementById('chess-capture');
  if(captureEl){
    captureEl.textContent=chessCaptureMessage||'';
    captureEl.style.opacity=chessCaptureMessage?'1':'0';
  }
}

function showPromoDialog(col){const pieces=['Q','R','B','N'];const existing=document.getElementById('promo-dialog');if(existing)existing.remove();const d=document.createElement('div');d.id='promo-dialog';d.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:300;display:flex;align-items:center;justify-content:center';d.innerHTML=`<div style="background:#111111;border:1px solid rgba(201,168,76,.4);border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:12px;align-items:center"><p style="color:#fff;font-size:14px;font-weight:700">Choose promotion piece</p><div style="display:flex;gap:10px">${pieces.map(t=>`<button onclick="chessPromote('${t}')" style="width:52px;height:52px;border-radius:12px;background:rgba(201,168,76,.2);border:1px solid rgba(201,168,76,.4);font-size:28px;cursor:pointer;display:flex;align-items:center;justify-content:center">${CHESS_UNICODE[t][col==='w'?0:1]}</button>`).join('')}</div></div>`;document.body.appendChild(d);}
function chessPromote(piece){const d=document.getElementById('promo-dialog');if(d)d.remove();if(!pendingPromotion)return;const{fr,fc,tr,tc,flag}=pendingPromotion;pendingPromotion=null;chessExecuteMove(fr,fc,tr,tc,flag,piece);}
function getChessMaterialTotals(){
  const counts={w:{P:0,N:0,B:0,R:0,Q:0},b:{P:0,N:0,B:0,R:0,Q:0}};
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=chessBoard[r][c];if(!p||p.t==='K')continue;counts[p.col][p.t]++;}
  const sum=col=>counts[col].P*1+counts[col].N*3+counts[col].B*3+counts[col].R*5+counts[col].Q*9;
  return {counts,white:sum('w'),black:sum('b')};
}
function renderChessMaterial(){
  const el=document.getElementById('chess-material');if(!el)return;
  const {white,black}=getChessMaterialTotals();
  const diff=white-black;
  if(gameMode==='bot'){
    if(diff===0){el.textContent='Material: Even';return;}
    const playerAdv=chessPlayerColor==='white'?'You':'AI';
    const aiAdv=chessPlayerColor==='white'?'AI':'You';
    if(diff>0){el.textContent=`Material: ${playerAdv} +${diff}`;}else{el.textContent=`Material: ${aiAdv} +${-diff}`;}
    return;
  }
  if(diff===0){el.textContent='Material: Even';return;}
  el.textContent=`Material: ${diff>0?'White': 'Black'} +${Math.abs(diff)}`;
}
function renderChess(){
  const el=document.getElementById('chess-board');if(!el)return;
  const theme=BOARD_THEMES[chessTheme]||BOARD_THEMES.wood;
  const wChk=chessInCheck(chessBoard,'w',castleRights,enPassantTarget);const bChk=chessInCheck(chessBoard,'b',castleRights,enPassantTarget);
  let html='';
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const p=chessBoard[r][c];
      const light=(r+c)%2===0;
      const isSel=chessSelected&&chessSelected[0]===r&&chessSelected[1]===c;
      const isHi=chessHighlights.find(([hr,hc])=>hr===r&&hc===c);
      const isCap=isHi&&!!p;
      const isKingChk=p?.t==='K'&&((p.col==='w'&&wChk)||(p.col==='b'&&bChk));
      const bg=isSel?theme.selected:isKingChk?theme.kingCheck:isHi?(isCap?'rgba(239,68,68,0.5)':theme.highlight):light?theme.light:theme.dark;
      const pieceStyleClass=chessPieceStyle==='classic'?'classic':'bold';
      const piece=p?`<span class="chess-piece ${pieceStyleClass}" style="color:${p.col==='w'?'#fff':'#111'};background:${p.col==='w'?'rgba(255,255,255,0.16)':'rgba(0,0,0,0.18)'};border-radius:50%">${CHESS_UNICODE[p.t][p.col==='w'?0:1]}</span>`:'';
      const dot=isHi&&!p?'<span style="width:10px;height:10px;border-radius:50%;background:rgba(201,168,76,0.7);display:block;position:absolute"></span>':'';
      html+=`<button onclick="chessSquareClick(${r},${c})" style="aspect-ratio:1;background:${bg};border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;transition:background .1s">${piece}${dot}</button>`;
    }
  }
  el.innerHTML=html;
  renderChessMaterial();
  renderChessStatus();
}
function chessEndGame(msg,result){
  chessOver=true;
  if(chessTimerInterval){clearInterval(chessTimerInterval);chessTimerInterval=null;}
  if(chessBotTimeoutId){clearTimeout(chessBotTimeoutId);chessBotTimeoutId=null;}
  if(chessCaptureTimer){clearTimeout(chessCaptureTimer);chessCaptureTimer=null;}
  const d=document.getElementById('promo-dialog');if(d)d.remove();
  const s=document.getElementById('chess-status');if(s)s.style.display='none';
  const res=document.getElementById('chess-result');if(res)res.style.display='flex';
  const txt=document.getElementById('chess-result-text');if(txt)txt.textContent=msg;
  showGameResult('chess', result==='win'?'You win!':result==='loss'?'You lose!':'Draw!', msg, result);
}

function resetChess(){
  chessInit();chessSelected=null;chessTurn='w';chessOver=false;chessHighlights=[];pendingPromotion=null;positionHistory=[];
  const d=document.getElementById('promo-dialog');if(d)d.remove();
  const s=document.getElementById('chess-status');if(s){s.style.display='block';s.textContent='Your turn (White)';}
  const res=document.getElementById('chess-result');if(res)res.style.display='none';
  const txt=document.getElementById('chess-result-text');if(txt)txt.textContent='';
  // clocks
  chessClockWhite = chessTimeMinutes>0 ? chessTimeMinutes*60 : 0;
  chessClockBlack = chessTimeMinutes>0 ? chessTimeMinutes*60 : 0;
  if(chessTimerInterval){clearInterval(chessTimerInterval);chessTimerInterval=null;}
  updateChessClockDisplay();
  if(chessTimeMinutes>0)startChessTimer();
  // if player chose black against bot, let bot move first
  if(gameMode==='bot' && chessPlayerColor==='black'){
    chessTurn='b';
    const statusEl=document.getElementById('chess-status');if(statusEl)statusEl.textContent='Bot thinking...';
    renderChess();
    setTimeout(()=>{chessBotMove();},1500);
    return;
  }
  updateChessLevelLabel();
  renderChess();
}

function updateChessClockDisplay(){
  const whiteLabel=document.getElementById('chess-clock-white');
  const blackLabel=document.getElementById('chess-clock-black');
  if(!whiteLabel||!blackLabel)return;
  if(chessTimeMinutes===0){whiteLabel.textContent='White: No clock';blackLabel.textContent='Black: No clock';return;}
  const fmt=(s)=>`${String(Math.floor(Math.max(0,s)/60)).padStart(2,'0')}:${String(Math.max(0,s)%60).padStart(2,'0')}`;
  whiteLabel.textContent=`White: ${fmt(chessClockWhite)}`;
  blackLabel.textContent=`Black: ${fmt(chessClockBlack)}`;
}

function startChessTimer(){
  if(chessTimerInterval){clearInterval(chessTimerInterval);chessTimerInterval=null;}
  if(chessTimeMinutes===0)return;
  chessTimerInterval=setInterval(()=>{
    if(chessOver)return;
    if(chessTurn==='w')chessClockWhite--;else chessClockBlack--;
    updateChessClockDisplay();
    if(chessClockWhite<0||chessClockBlack<0){
      clearInterval(chessTimerInterval);chessTimerInterval=null;chessOver=true;
      const loser=chessClockWhite<0?'White':'Black';
      const loserSide=chessClockWhite<0?'w':'b';
      const result = (gameMode==='bot') ? (loserSide === (chessPlayerColor==='white'?'w':'b') ? 'loss' : 'win') : (loserSide==='w'?'loss':'win');
      chessEndGame(`${loser} flag fall!`, result);
    }
  },1000);
}

document.addEventListener('DOMContentLoaded', function() {
  applySidebarA11y();
  document.addEventListener('keydown',trapActiveModalFocus);
  document.querySelectorAll('.auth-modal').forEach(modal=>{
    modal.addEventListener('click',event=>{if(event.target===modal)closeAuthModal();});
  });
  document.getElementById('login-form')?.addEventListener('submit',handleLogin);
  document.getElementById('signup-form')?.addEventListener('submit',handleSignup);
  document.getElementById('forgot-password-form')?.addEventListener('submit',event=>{event.preventDefault();handleForgotPassword();});
  document.getElementById('search-input')?.addEventListener('input',filterUsers);
  document.addEventListener('click',event=>{
    const pageButton=event.target.closest('[data-page]');
    if(pageButton){event.preventDefault();showPage(pageButton.dataset.page);return;}
    const action=event.target.closest('[data-action]');
    if(!action)return;
    event.preventDefault();
    const name=action.dataset.action;
    const value=action.dataset.value;
    const actions={closeAuthModal,handleForgotPassword,handleGoogleLogin,handleLogout,openMatcher,renderArcadeHome,exitLobby,joinGameRoom,resetTTT,resetChess,takebackChessMove,auMeeting,openCreateGroup,renderMatchAdmin,matchPrevStep,matchNextStep,resetMatchmaker,renderLibrary,clearIdeaHistory,clearSavedIdeas,toggleMobileDrawer,closeMobileDrawer};
    if(name==='openInfoModal')openInfoModal(value);
    else if(name==='setChessLevel')setChessLevel(Number(value));
    else if(name==='rpsPlay')rpsPlay(value);
    else if(name==='switchConvoTab')switchConvoTab(value);
    else if(name==='switchLibTab')switchLibTab(value);
    else if(name==='filterExplore')filterExplore(value);
    else if(actions[name])actions[name]();
  });
  // Boot: show correct page based on hash or default to landing
  try {
    handleHashRoute();
  } catch(e) {
    // Fallback: just show landing
    var landing = document.getElementById('page-landing');
    if (landing) {
      document.querySelectorAll('.page').forEach(function(p) {
        p.classList.remove('active');
        p.style.display = 'none';
      });
      landing.classList.add('active');
      landing.style.display = 'flex';
      landing.style.opacity = '1';
    }
  }
});
