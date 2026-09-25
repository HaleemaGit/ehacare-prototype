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
    lafiya:[['🏠','Modules','landing'],['📋','Surveys','laf-survey-list'],['📊','Analytics','laf-analytics'],['⚙️','Settings','settings']],
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
    'laf-home':               'laf-survey-list',
    'laf-setup':              'laf-survey-list',
    'laf-population':         'laf-survey-list',
    'laf-fp':                 'laf-survey-list',
    'laf-mortality':          'laf-survey-list',
    'laf-review':             'laf-survey-list',
    'laf-success':            'laf-survey-list',
    'laf-survey-list':        'laf-survey-list',
    'laf-map':                'laf-analytics',   /* map now under Analytics tab */
    /* Analytics screens — all map to Analytics tab */
    'laf-analytics':          'laf-analytics',
    'laf-analytics-all':      'laf-analytics',
    'laf-analytics-survey':   'laf-analytics',
    'laf-analytics-ward':     'laf-analytics',
    'laf-analytics-lga':      'laf-analytics',
    'laf-analytics-state':    'laf-analytics',
    'laf-analytics-geo':      'laf-analytics',
    'laf-analytics-ns':       'laf-analytics',
    'laf-analytics-collector':'laf-analytics',
    'laf-filter':             'laf-analytics',
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
    'anc-home':            'anc-patient-list',
    'anc-patient-list':    'anc-patient-list',
    'anc-register':        'anc-patient-list',
    'anc-contact':         'anc-journey',
    'anc-contact-routine': 'anc-journey',
    'anc-contact-healthy': 'anc-journey',   /* healthy flow */
    'anc-healthy-summary': 'anc-journey',   /* healthy summary */
    'anc-schedule':        'anc-journey',   /* schedule next */
    'anc-alert':           'anc-journey',
    'anc-journey':         'anc-journey',
    'anc-overdue':         'anc-journey',
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
    window.scrollTo(0, 0);

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

    initControls();
    renderNav();
  }

  /* ── Interactive controls: radio options, filter chips, selects ── */
  function initControls() {
    document.addEventListener('click', function(e) {
      var radio = e.target.closest('.radio-option');
      if (radio && radio.parentElement) {
        Array.prototype.forEach.call(radio.parentElement.children, function(r) { r.classList.remove('selected'); });
        radio.classList.add('selected');
        return;
      }
      var chip = e.target.closest('.f-chip');
      if (!chip) return;
      var row = chip.closest('[data-chips]');
      if (!row) return;
      var chips = row.querySelectorAll('.f-chip');
      if (row.getAttribute('data-chips') === 'single') {
        chips.forEach(function(c) { c.classList.remove('on'); });
        chip.classList.add('on');
      } else if (chip === chips[0] && /^(All|Any)/.test(chip.textContent)) {
        chips.forEach(function(c) { c.classList.toggle('on', c === chip); });
      } else {
        chip.classList.toggle('on');
        if (/^(All|Any)/.test(chips[0].textContent)) {
          var any = row.querySelectorAll('.f-chip.on:not(:first-child)').length;
          chips[0].classList.toggle('on', !any);
        }
      }
      var cb = row.getAttribute('data-onchange');
      if (cb && App[cb]) App[cb]();
      if (row.closest('#laf-filter')) updateFilterResult();
    });
    document.addEventListener('change', function(e) {
      if (e.target.closest('#laf-filter')) updateFilterResult();
    });
    document.addEventListener('input', function(e) {
      if (e.target.matches('input[data-normal]')) checkVitals();
    });
  }

  /* Collect active filters as "Group: value" labels (defaults excluded) */
  function activeFilters() {
    var out = [];
    document.querySelectorAll('#laf-filter [data-group]').forEach(function(g) {
      var name = g.getAttribute('data-group');
      if (g.tagName === 'SELECT') {
        if (g.selectedIndex > 0) out.push(g.value);
        return;
      }
      if (name === 'Metrics') return;
      var on = Array.prototype.map.call(g.querySelectorAll('.f-chip.on'), function(c) { return c.textContent; })
        .filter(function(t) { return !/^(All|Any)/.test(t); });
      if (name === 'Period') { if (on[0] !== 'This year') out.push(on[0]); return; }
      if (on.length) out.push(on.join(' + '));
    });
    return out;
  }

  function updateFilterResult() {
    var n = activeFilters().length;
    var surveys = Math.max(12, Math.round(247 / Math.pow(1.9, n)));
    var wards = Math.max(1, Math.round(18 / Math.pow(1.7, n)));
    var el = document.getElementById('filter-result');
    if (el) el.innerHTML = 'Matching: <b>' + surveys + ' surveys</b> across <b>' + wards + ' ward' + (wards > 1 ? 's' : '') + '</b>';
  }

  function applyFilters() {
    var f = activeFilters();
    var text = f.length ? f.join(' · ') : 'All zones · All collectors · Jan 1 – Sep 22, 2026';
    document.querySelectorAll('.filter-summary').forEach(function(s) {
      s.classList.toggle('active', f.length > 0);
      s.querySelector('.fs-text').textContent = text;
      s.querySelector('.fs-edit').textContent = f.length ? f.length + ' active · Edit' : 'Edit';
    });
    toast(f.length ? f.length + ' filter' + (f.length > 1 ? 's' : '') + ' applied' : 'Showing all survey data');
    goBack();
  }

  function resetFilters() {
    document.querySelectorAll('#laf-filter [data-chips]').forEach(function(row) {
      var chips = row.querySelectorAll('.f-chip');
      var name = row.getAttribute('data-group');
      chips.forEach(function(c, i) {
        c.classList.toggle('on', name === 'Metrics' ? true : name === 'Period' ? c.textContent === 'This year' : i === 0);
      });
    });
    document.querySelectorAll('#laf-filter select').forEach(function(s) { s.selectedIndex = 0; });
    updateFilterResult();
  }

  /* State list: live search + zone chips */
  function filterStates() {
    var q = (document.getElementById('state-search') || {}).value || '';
    q = q.trim().toLowerCase();
    var zoneChip = document.querySelector('#state-zone-chips .f-chip.on');
    var zone = zoneChip ? zoneChip.getAttribute('data-zone') : 'ALL';
    var shown = 0;
    document.querySelectorAll('#state-list .state-row').forEach(function(r) {
      var ok = (zone === 'ALL' || r.getAttribute('data-zone') === zone) &&
               (!q || r.getAttribute('data-name').indexOf(q) !== -1);
      r.hidden = !ok;
      if (ok) shown++;
    });
    document.getElementById('state-empty').hidden = shown > 0;
    document.getElementById('state-count').textContent = shown + ' state' + (shown === 1 ? '' : 's');
  }

  function showStates(zone) {
    document.querySelectorAll('#state-zone-chips .f-chip').forEach(function(c) {
      c.classList.toggle('on', c.getAttribute('data-zone') === zone);
    });
    var s = document.getElementById('state-search');
    if (s) s.value = '';
    filterStates();
    goTo('laf-analytics-state');
  }

  /* Healthy ANC form: any out-of-range vital blocks the routine pathway */
  function checkVitals() {
    var problems = [];
    document.querySelectorAll('#anc-contact-healthy input[data-normal]').forEach(function(inp) {
      var range = inp.getAttribute('data-normal').split('-').map(Number);
      var v = parseFloat(inp.value);
      var hint = inp.nextElementSibling;
      var ok = !isNaN(v) && v >= range[0] && v <= range[1];
      inp.classList.toggle('input-ok', ok);
      inp.classList.toggle('input-bad', !ok);
      if (hint && hint.classList.contains('form-hint')) {
        if (!hint.dataset.okText) hint.dataset.okText = hint.textContent;
        hint.className = 'form-hint ' + (ok ? 'success' : 'danger');
        hint.textContent = ok ? hint.dataset.okText : '⚠ Outside normal range (' + range[0] + '–' + range[1] + ')';
      }
      if (!ok) problems.push(inp.getAttribute('data-label') + ' ' + (isNaN(v) ? 'missing' : v));
    });
    var warn = document.getElementById('vitals-warn');
    document.getElementById('vitals-ok').hidden = problems.length > 0;
    warn.hidden = problems.length === 0;
    document.getElementById('healthy-continue').hidden = problems.length > 0;
    if (problems.length) document.getElementById('vitals-warn-text').textContent =
      problems.join(', ') + '. This visit can no longer follow the routine pathway.';
  }

  function toast(msg) {
    var t = document.getElementById('app-toast');
    if (!t) { t = document.createElement('div'); t.id = 'app-toast'; t.className = 'app-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(function() { t.classList.remove('show'); }, 1800);
  }

  /* ── Expose globally so inline onclick="App.goTo()" works ── */
  window.App = {
    goTo: goTo,
    goBack: goBack,
    setModule: setModule,
    launchModule: launchModule,
    resumeLastModule: resumeLastModule,
    renderNav: renderNav,
    applyFilters: applyFilters,
    resetFilters: resetFilters,
    filterStates: filterStates,
    showStates: showStates,
    toast: toast,
    renderBottomNav: renderNav, /* alias for backwards compat */
    init: init,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
