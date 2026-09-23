/* ============================================================
   EHACare Platform — Prototype Navigation Engine v4
   - Opacity-based transitions (no transform flicker in tablet)
   - Context-aware bottom nav
   - resumeLastModule() for offline recovery
   - Clean history management
   ============================================================ */

const App = (() => {
  let currentScreen = 'landing';
  let history       = [];
  let currentModule = null;
  let transitioning = false;

  const MODULE_NAV = {
    eha: [
      { icon: '🏠', label: 'Home',       screen: 'eha-home' },
      { icon: '👥', label: 'Patients',   screen: 'eha-patient' },
      { icon: '📋', label: 'Encounters', screen: 'eha-encounters' },
      { icon: '⚙️', label: 'Settings',   screen: 'settings' },
    ],
    lafiya: [
      { icon: '🏠', label: 'Home',    screen: 'laf-home' },
      { icon: '📋', label: 'Surveys', screen: 'laf-survey-list' },
      { icon: '🗺', label: 'Map',     screen: 'laf-map' },
      { icon: '⚙️', label: 'Settings',screen: 'settings' },
    ],
    warif: [
      { icon: '🏠', label: 'Home',     screen: 'war-home' },
      { icon: '📋', label: 'Cases',    screen: 'war-cases' },
      { icon: '↗️', label: 'Referrals',screen: 'war-referrals' },
      { icon: '⚙️', label: 'Settings', screen: 'settings' },
    ],
    msf: [
      { icon: '🏠', label: 'Home',      screen: 'msf-home' },
      { icon: '⚡', label: 'Triage',    screen: 'msf-triage' },
      { icon: '⚖️', label: 'Nutrition', screen: 'msf-nutrition' },
      { icon: '⚙️', label: 'Settings',  screen: 'settings' },
    ],
    mamai: [
      { icon: '🏠', label: 'Home',     screen: 'anc-home' },
      { icon: '👤', label: 'Patients', screen: 'anc-patient-list' },
      { icon: '📋', label: 'Contacts', screen: 'anc-journey' },
      { icon: '⚙️', label: 'Settings', screen: 'settings' },
    ],
    supervisor: [
      { icon: '🏠', label: 'Team',    screen: 'sup-team' },
      { icon: '➕', label: 'Add',     screen: 'sup-add-member' },
      { icon: '📊', label: 'Activity',screen: 'sup-team' },
      { icon: '⚙️', label: 'Settings',screen: 'settings' },
    ],
  };

  const MODULE_HOMES = {
    eha: 'eha-home', lafiya: 'laf-home', warif: 'war-home',
    msf: 'msf-home', mamai: 'anc-home', supervisor: 'sup-team',
  };

  const MODULE_THEMES = {
    eha: '', lafiya: 'module-lafiya', warif: 'module-warif',
    msf: 'module-msf', mamai: 'module-mamai', supervisor: '',
  };

  function goTo(screenId, addToHistory = true) {
    if (transitioning || screenId === currentScreen) return;
    const next = document.getElementById(screenId);
    if (!next) { console.warn('Screen not found:', screenId); return; }

    transitioning = true;
    const prev = document.getElementById(currentScreen);

    if (addToHistory) history.push(currentScreen);

    // Fade out current
    if (prev) {
      prev.classList.remove('active');
      prev.classList.add('leaving');
    }

    // Small delay so leaving fade starts, then show next
    requestAnimationFrame(() => {
      next.classList.add('active');
      renderBottomNav();
      setTimeout(() => {
        if (prev) prev.classList.remove('leaving');
        transitioning = false;
      }, 260);
    });

    currentScreen = screenId;
  }

  function goBack() {
    if (transitioning) return;
    if (history.length === 0) return;
    const prev = history.pop();
    goTo(prev, false);
  }

  function setModule(moduleId) {
    currentModule = moduleId;
    const body = document.body;
    Object.values(MODULE_THEMES).forEach(t => { if (t) body.classList.remove(t); });
    if (MODULE_THEMES[moduleId]) body.classList.add(MODULE_THEMES[moduleId]);
  }

  function launchModule(moduleId, firstScreen) {
    setModule(moduleId);
    history = ['landing'];
    goTo(firstScreen, false);
  }

  function resumeLastModule() {
    const home = MODULE_HOMES[currentModule] || 'landing';
    goTo(home, false);
  }

  // Active nav matching
  function isNavActive(item) {
    const s = currentScreen;
    if (s === item.screen) return true;
    const g = {
      'eha-home':       ['eha-home','eha-guided','eha-encounter-type'],
      'eha-patient':    ['eha-patient'],
      'eha-encounters': ['eha-encounters'],
      'laf-home':       ['laf-home'],
      'laf-survey-list':['laf-survey-list','laf-setup','laf-population','laf-fp','laf-mortality','laf-review','laf-success'],
      'laf-map':        ['laf-map'],
      'war-home':       ['war-home'],
      'war-cases':      ['war-cases','war-detail','war-intake','war-alert'],
      'war-referrals':  ['war-referrals','war-referral'],
      'msf-home':       ['msf-home','msf-mci','msf-no-mci','msf-result-black'],
      'msf-triage':     ['msf-triage','msf-triage-2','msf-triage-3','msf-result-red','msf-result-yellow'],
      'msf-nutrition':  ['msf-nutrition','msf-nutrition-result'],
      'anc-home':       ['anc-home'],
      'anc-patient-list':['anc-patient-list','anc-register'],
      'anc-journey':    ['anc-journey','anc-contact','anc-alert','anc-contact-routine','anc-overdue'],
      'sup-team':       ['sup-team','sup-member-detail','sup-member-created'],
      'sup-add-member': ['sup-add-member'],
    };
    return (g[item.screen] || []).includes(s);
  }

  function renderBottomNav() {
    const navConf = MODULE_NAV[currentModule] || null;
    document.querySelectorAll('.bottom-nav').forEach(nav => {
      if (!navConf) {
        nav.innerHTML = '';
        return;
      }
      nav.innerHTML = navConf.map(item => {
        const active = isNavActive(item);
        return `<button class="nav-item${active ? ' active' : ''}" onclick="App.goTo('${item.screen}')">
          ${active ? '<span class="nav-dot"></span>' : ''}
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </button>`;
      }).join('');
    });
  }

  function init() {
    const landing = document.getElementById('landing');
    if (landing) {
      landing.classList.add('active');
      // Ensure no other screen is active
      document.querySelectorAll('.screen').forEach(s => {
        if (s.id !== 'landing') s.classList.remove('active', 'leaving');
      });
    }

    // Global back-button handler
    document.addEventListener('click', e => {
      const backBtn = e.target.closest('.back-btn');
      if (backBtn) {
        e.preventDefault();
        const target = backBtn.dataset.goto;
        if (target) goTo(target, false);
        else goBack();
      }
    });

    renderBottomNav();
  }

  return { goTo, goBack, setModule, launchModule, resumeLastModule, init, renderBottomNav };
})();

document.addEventListener('DOMContentLoaded', App.init);
