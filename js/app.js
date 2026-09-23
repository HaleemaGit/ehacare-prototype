/* ============================================================
   EHACare Platform — Navigation Engine v5 (Production)
   FIXES: window.App global · no blocking guard ·
          direct DOM nav · context-aware bottom nav
   ============================================================ */

(function () {

  var currentScreen = 'landing';
  var navHistory    = [];
  var activeModule  = null;

  /* ── Module tab configurations ──
     🏠 Home tab ALWAYS goes to landing (module selector).
     Tabs 2-4 provide module-specific navigation.
  */
  var MODULE_NAV = {
    eha:   [['🏠','Modules','landing'],['👥','Patients','eha-patient'],['📋','Encounters','eha-encounters'],['⚙️','Settings','settings']],
    lafiya:[['🏠','Modules','landing'],['📋','Surveys','laf-survey-list'],['🗺','Map','laf-map'],['⚙️','Settings','settings']],
    warif: [['🏠','Modules','landing'],['📋','Cases','war-cases'],['↗️','Referrals','war-referrals'],['⚙️','Settings','settings']],
    msf:   [['🏠','Modules','landing'],['⚡','Triage','msf-triage'],['⚖️','Nutrition','msf-nutrition'],['⚙️','Settings','settings']],
    mamai: [['🏠','Modules','landing'],['👤','Patients','anc-patient-list'],['📋','Contacts','anc-journey'],['⚙️','Settings','settings']],
    supervisor:[['🏠','Modules','landing'],['➕','Add Member','sup-add-member'],['👤','Team','sup-team'],['⚙️','Settings','settings']],
  };

  /* Module → accent class */
  var MODULE_THEMES = {
    eha:'', lafiya:'module-lafiya', warif:'module-warif',
    msf:'module-msf', mamai:'module-mamai', supervisor:''
  };

  /* Which nav tab is "active" for a given screen.
     'landing' = Home tab active; module screens = their own tab active. */
  var NAV_GROUPS = {
    /* Landing: Home tab active */
    'landing':         'landing',
    /* EHACare */
    'eha-home':           'eha-patient',   /* dashboard → Patients tab context */
    'eha-guided':         'eha-encounters',
    'eha-encounter-type': 'eha-encounters',
    'eha-patient':        'eha-patient',
    'eha-encounters':     'eha-encounters',
    /* Lafiya */
    'laf-home':        'laf-survey-list',
    'laf-setup':       'laf-survey-list',
    'laf-population':  'laf-survey-list',
    'laf-fp':          'laf-survey-list',
    'laf-mortality':   'laf-survey-list',
    'laf-review':      'laf-survey-list',
    'laf-success':     'laf-survey-list',
    'laf-survey-list': 'laf-survey-list',
    'laf-map':         'laf-map',
    /* WARIF */
    'war-home':        'war-cases',
    'war-intake':      'war-cases',
    'war-alert':       'war-cases',
    'war-cases':       'war-cases',
    'war-detail':      'war-cases',
    'war-referrals':   'war-referrals',
    'war-referral':    'war-referrals',
    /* MSF */
    'msf-home':           'msf-triage',
    'msf-mci':            'msf-triage',
    'msf-no-mci':         'msf-triage',
    'msf-result-black':   'msf-triage',
    'msf-triage':         'msf-triage',
    'msf-triage-2':       'msf-triage',
    'msf-triage-3':       'msf-triage',
    'msf-result-red':     'msf-triage',
    'msf-result-yellow':  'msf-triage',
    'msf-nutrition':      'msf-nutrition',
    'msf-nutrition-result':'msf-nutrition',
    /* MAMAI */
    'anc-home':        'anc-patient-list',
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

  /* ── Core: navigate to a screen ──
     Uses display:none / display:flex so hidden screens are
     COMPLETELY inert — zero click-through on any browser.
  */
  function goTo(screenId, addHistory) {
    if (screenId === currentScreen) return;

    var next = document.getElementById(screenId);
    if (!next) { console.warn('EHACare: screen not found:', screenId); return; }

    var prev = document.getElementById(currentScreen);

    if (addHistory !== false) navHistory.push(currentScreen);

    /* Hide previous: display:none removes it from all interaction */
    if (prev) {
      prev.classList.remove('active');
      /* display:none is set by CSS .screen (no .active = display:none) */
    }

    /* Show next: display:flex via .active class */
    next.classList.add('active');

    /* Scroll content to top */
    var content = next.querySelector('.screen-content');
    if (content) content.scrollTop = 0;

    currentScreen = screenId;

    /* Clear module when returning to module selector */
    if (screenId === 'landing') activeModule = null;

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

  /* ── Render context-aware bottom nav ──
     - Hidden entirely on landing screen (no module active)
     - 🏠 Home tab is ALWAYS the first tab and ALWAYS goes to landing
     - Remaining tabs are module-specific
  */
  function renderNav() {
    /* No nav on the module selector screen */
    var onLanding = (currentScreen === 'landing');
    var tabs      = (!onLanding && activeModule) ? MODULE_NAV[activeModule] : null;
    var activeTab = NAV_GROUPS[currentScreen] || '';

    document.querySelectorAll('.bottom-nav').forEach(function(nav) {
      if (!tabs) {
        nav.innerHTML = '';
        nav.style.display = 'none';
        return;
      }
      nav.style.display = '';

      nav.innerHTML = tabs.map(function(tab) {
        var icon   = tab[0];
        var label  = tab[1];
        var screen = tab[2];
        /* Home tab (landing) is active ONLY when on landing — never highlighted inside a module */
        var isActive = (screen !== 'landing') && (screen === activeTab);
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

    /* Global 🏠 safety interceptor — any tap on Home icon → landing.
       Belt + suspenders: even if renderNav() somehow rendered the wrong
       target, this interceptor overrides it. */
    document.addEventListener('click', function(e) {
      var navIcon = e.target.closest('.nav-icon');
      if (navIcon && navIcon.textContent === '🏠') {
        e.preventDefault();
        e.stopImmediatePropagation();
        goTo('landing', true);
        return;
      }
      var navItem = e.target.closest('.nav-item');
      if (navItem) {
        /* Check if this button's label is "Modules" or icon is 🏠 */
        var label = navItem.querySelector('.nav-label');
        if (label && (label.textContent === 'Modules' || label.textContent === 'Home')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          goTo('landing', true);
          return;
        }
      }
    }, true); /* capture phase — fires before onClick */

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
