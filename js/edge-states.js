/* ============================================================
   EHACare Platform — Global Helpers v3 (Production)
   All functions exposed on window — accessible from inline onclick
   ============================================================ */

/* ── Modal overlay (show / hide) ── */
window.Modal = {
  show: function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  },
  hide: function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }
};

/* ── GPS capture simulation ── */
window.GPS = {
  simulate: function(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '<span class="gps-icon">📡</span>' +
      '<div class="gps-coords"><strong>Acquiring signal…</strong><br>' +
      '<span class="gps-accuracy" style="color:var(--amber-600)">Searching…</span></div>';
    setTimeout(function() {
      el.innerHTML = '<span class="gps-icon">📍</span>' +
        '<div class="gps-coords"><strong>Lat: 11.9834 &nbsp; Lon: 8.5175</strong><br>' +
        '<span class="gps-accuracy good">Accuracy: ±8 m &nbsp; ✓ Good signal</span></div>';
    }, 1400);
  }
};

/* ── Sync status simulation ── */
window.Sync = {
  simulate: function(bannerEl, onComplete) {
    if (!bannerEl) return;
    bannerEl.classList.remove('hidden');
    bannerEl.className = 'offline-banner syncing';
    bannerEl.innerHTML = '<div class="ob-dot"></div> Syncing…';
    setTimeout(function() {
      bannerEl.className = 'offline-banner synced';
      bannerEl.innerHTML = '<div class="ob-dot"></div> Synced ✓';
      setTimeout(function() {
        bannerEl.classList.add('hidden');
        if (onComplete) onComplete();
      }, 1500);
    }, 2000);
  }
};

/* ── Device type switcher (Phone / Tablet) ── */
window.setDeviceType = function(type) {
  var shell    = document.getElementById('device-shell');
  var btnPhone = document.getElementById('btn-phone');
  var btnTab   = document.getElementById('btn-tablet');
  if (!shell) return;

  /* Freeze screen transitions during resize to prevent flash */
  var screens = shell.querySelectorAll('.screen');
  screens.forEach(function(s) { s.style.transition = 'none'; });

  if (type === 'tablet') {
    shell.classList.add('tablet');
    if (btnTab)   btnTab.classList.add('active');
    if (btnPhone) btnPhone.classList.remove('active');
    document.body.style.overflowY = 'auto';
  } else {
    shell.classList.remove('tablet');
    if (btnPhone) btnPhone.classList.add('active');
    if (btnTab)   btnTab.classList.remove('active');
    document.body.style.overflowY = '';
  }

  /* Re-enable transitions after layout settles */
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      screens.forEach(function(s) { s.style.transition = ''; });
    });
  });
};

/* ── Nutrition classification (MSF) ── */
window.classifyNutrition = function(muac, whz, edema) {
  if (edema || muac < 115 || (whz !== null && whz < -3)) {
    return { status: 'SAM', label: '⚠ Severe Acute Malnutrition', css: 'sam' };
  }
  if (muac < 125 || (whz !== null && whz < -2)) {
    return { status: 'MAM', label: '⚠ Moderate Acute Malnutrition', css: 'mam' };
  }
  return { status: 'NORMAL', label: '✓ Normal nutritional status', css: 'norm' };
};

/* ── Danger sign engine (MAMAI) ── */
window.checkDangerSigns = function(systolic, diastolic, protein, hb) {
  var alerts = [];
  if (systolic >= 160 || diastolic >= 110) {
    alerts.push({ type: 'SEVERE_HT', severity: 'EMERGENCY', msg: 'Severe hypertension (BP ≥160/110). Immediate referral required.' });
  } else if ((systolic >= 140 || diastolic >= 90) && protein >= 2) {
    alerts.push({ type: 'PREECLAMPSIA', severity: 'URGENT', msg: 'Pre-eclampsia (BP ≥140/90 + proteinuria ≥2+). Same-day referral required.' });
  }
  if (hb !== null && hb < 7.0) {
    alerts.push({ type: 'SEVERE_ANAEMIA', severity: 'URGENT', msg: 'Severe anaemia (Hb <7 g/dL). Urgent referral required.' });
  }
  return alerts;
};
