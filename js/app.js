/* ============================================================
   EHACare Platform — Navigation Engine v5 (Production)
   FIXES: window.App global · no blocking guard ·
          direct DOM nav · context-aware bottom nav
   ============================================================ */

(function () {

  var currentScreen = 'landing';
  var navHistory    = [];
  var activeModule  = null;

  /* ── Module tab configurations ── */
  var MODULE_NAV = {
    eha:   [['🏠','Home','eha-home'],['👥','Patients','eha-patient'],['📋','Encounters','eha-encounters'],['⚙️','Settings','settings']],
    lafiya:[['🏠','Home','laf-home'],['📋','Surveys','laf-survey-list'],['🗺','Map','laf-map'],['⚙️','Settings','settings']],
    warif: [['🏠','Home','war-home'],['📋','Cases','war-cases'],['↗️','Referrals','war-referrals'],['⚙️','Settings','settings']],
    msf:   [['🏠','Home','msf-home'],['⚡','Triage','msf-triage'],['⚖️','Nutrition','msf-nutrition'],['⚙️','Settings','settings']],
    mamai: [['🏠','Home','anc-home'],['👤','Patients','anc-patient-list'],['📋','Contacts','anc-journey'],['⚙️','Settings','settings']],
    supervisor:[['🏠','Team','sup-team'],['➕','Add','sup-add-member'],['📊','Activity','sup-team'],['⚙️','Settings','settings']],
  };

  /* Module → accent class */
  var MODULE_THEMES = {
    eha:'', lafiya:'module-lafiya', warif:'module-warif',
    msf:'module-msf', mamai:'module-mamai', supervisor:''
  };

  /* Which nav tab is "active" for a given screen */
  var NAV_GROUPS = {
    'eha-home':        'eha-home',
    'eha-guided':      'eha-home',
    'eha-encounter-type':'eha-home',
    'eha-patient':     'eha-patient',
    'eha-encounters':  'eha-encounters',
    'laf-home':        'laf-home',
    'laf-setup':       'laf-survey-list',
    'laf-population':  'laf-survey-list',
    'laf-fp':          'laf-survey-list',
    'laf-mortality':   'laf-survey-list',
    'laf-review':      'laf-survey-list',
    'laf-success':     'laf-survey-list',
    'laf-survey-list': 'laf-survey-list',
    'laf-map':         'laf-map',
    'war-home':        'war-home',
    'war-intake':      'war-cases',
    'war-alert':       'war-cases',
    'war-cases':       'war-cases',
    'war-detail':      'war-cases',
    'war-referrals':   'war-referrals',
    'war-referral':    'war-referrals',
    'msf-home':        'msf-home',
    'msf-mci':         'msf-home',
    'msf-no-mci':      'msf-home',
    'msf-result-black':'msf-triage',
    'msf-triage':      'msf-triage',
    'msf-triage-2':    'msf-triage',
    'msf-triage-3':    'msf-triage',
    'msf-result-red':  'msf-triage',
    'msf-result-yellow':'msf-triage',
    'msf-nutrition':   'msf-nutrition',
    'msf-nutrition-result':'msf-nutrition',
    'anc-home':        'anc-home',
    'anc-patient-list':'anc-patient-list',
    'anc-register':    'anc-patient-list',
    'anc-contact':     'anc-journey',
    'anc-contact-routine':'anc-journey',
    'anc-alert':       'anc-journey',
    'anc-journey':     'anc-journey',
    'anc-overdue':     'anc-journey',
    'sup-team':        'sup-team',
    'sup-member-detail':'sup-team',
    'sup-member-created':'sup-team',
    'sup-add-member':  'sup-add-member',
  };

  /* ── Core: navigate to a screen ── */
  function goTo(screenId, addHistory) {
    if (screenId === currentScreen) return;

    var next = document.getElementById(screenId);
    if (!next) { console.warn('Screen not found:', screenId); return; }

    var prev = document.getElementById(currentScreen);

    if (addHistory !== false) navHistory.push(currentScreen);

    /* Hide previous */
    if (prev) prev.classList.remove('active');

    /* Show next */
    next.classList.add('active');

    /* Scroll content to top */
    var content = next.querySelector('.screen-content');
    if (content) content.scrollTop = 0;

    currentScreen = screenId;
    renderNav();
  }

  function goBack() {
    if (navHistory.length === 0) return;
    goTo(navHistory.pop(), false);
  }

  function setModule(mod) {
    activeModule = mod;
    var body = document.body;
    Object.values(MODULE_THEMES).forEach(function(t){ if (t) body.classList.remove(t); });
    if (MODULE_THEMES[mod]) body.classList.add(MODULE_THEMES[mod]);
  }

  function launchModule(mod, firstScreen) {
    setModule(mod);
    navHistory = ['landing'];
    goTo(firstScreen, false);
  }

  function resumeLastModule() {
    var homes = {eha:'eha-home',lafiya:'laf-home',warif:'war-home',msf:'msf-home',mamai:'anc-home',supervisor:'sup-team'};
    goTo(homes[activeModule] || 'landing', false);
  }

  /* ── Render context-aware bottom nav ── */
  function renderNav() {
    var tabs = MODULE_NAV[activeModule] || null;
    var activeTab = NAV_GROUPS[currentScreen] || '';

    document.querySelectorAll('.bottom-nav').forEach(function(nav) {
      if (!tabs) { nav.innerHTML = ''; return; }

      nav.innerHTML = tabs.map(function(tab) {
        var icon = tab[0], label = tab[1], screen = tab[2];
        var isActive = (screen === activeTab);
        return '<button class="nav-item' + (isActive ? ' active' : '') + '" ' +
          'onclick="App.goTo(\'' + screen + '\')">' +
          (isActive ? '<span class="nav-dot"></span>' : '') +
          '<span class="nav-icon">' + icon + '</span>' +
          '<span class="nav-label">' + label + '</span>' +
          '</button>';
      }).join('');
    });
  }

  /* ── Init ── */
  function init() {
    /* Show landing, hide everything else */
    document.querySelectorAll('.screen').forEach(function(s) {
      s.classList.remove('active', 'leaving');
    });
    var landing = document.getElementById('landing');
    if (landing) landing.classList.add('active');

    /* Delegate back-button clicks */
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('.back-btn');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var target = btn.getAttribute('data-goto');
      if (target) goTo(target, false);
      else goBack();
    });

    renderNav();
  }

  /* ── Expose globally so inline onclick="App.goTo()" works ── */
  window.App = {
    goTo: goTo,
    goBack: goBack,
    setModule: setModule,
    launchModule: launchModule,
    resumeLastModule: resumeLastModule,
    renderNav: renderNav,
    renderBottomNav: renderNav, /* alias for backwards compat */
    init: init,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
