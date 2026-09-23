/* ── Modal / Overlay helpers ── */
const Modal = {
  show(id) { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); },
  hide(id) { const el = document.getElementById(id); if (el) el.classList.add('hidden'); }
};

/* ── GPS simulation ── */
const GPS = {
  simulate(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<span class="gps-icon">📡</span><div class="gps-coords"><strong>Acquiring signal…</strong><br><span class="gps-accuracy" style="color:var(--amber-600)">Searching…</span></div>`;
    setTimeout(() => {
      el.innerHTML = `<span class="gps-icon">📍</span><div class="gps-coords"><strong>Lat: 11.9834 &nbsp; Lon: 8.5175</strong><br><span class="gps-accuracy good">Accuracy: ±8 m &nbsp; ✓ Good signal</span></div>`;
    }, 1400);
  }
};

/* ── Sync simulation ── */
const Sync = {
  simulate(bannerEl, onComplete) {
    if (!bannerEl) return;
    bannerEl.classList.remove('hidden');
    bannerEl.className = 'offline-banner syncing';
    bannerEl.innerHTML = '<div class="ob-dot"></div> Syncing…';
    setTimeout(() => {
      bannerEl.className = 'offline-banner synced';
      bannerEl.innerHTML = '<div class="ob-dot"></div> Synced ✓';
      setTimeout(() => { bannerEl.classList.add('hidden'); if (onComplete) onComplete(); }, 1500);
    }, 2000);
  }
};

/* ── Device Type Switcher (Phone / Tablet) ── */
function setDeviceType(type) {
  const shell    = document.getElementById('device-shell');
  const btnPhone = document.getElementById('btn-phone');
  const btnTab   = document.getElementById('btn-tablet');
  const gesBar   = document.getElementById('android-gesture-bar');
  if (!shell) return;

  // Freeze all screen transitions momentarily to prevent content flash
  const allScreens = shell.querySelectorAll('.screen');
  allScreens.forEach(s => { s.style.transition = 'none'; });

  if (type === 'tablet') {
    shell.classList.add('tablet');
    shell.classList.remove('android');
    btnTab?.classList.add('active');
    btnPhone?.classList.remove('active');
    if (gesBar) gesBar.style.display = 'none';
    document.body.style.alignItems  = 'flex-start';
    document.body.style.overflowY   = 'auto';
    document.body.style.padding     = '20px 0 40px';
  } else {
    shell.classList.remove('tablet');
    shell.classList.remove('android');
    btnPhone?.classList.add('active');
    btnTab?.classList.remove('active');
    if (gesBar) gesBar.style.display = 'none';
    document.body.style.alignItems  = 'center';
    document.body.style.overflowY   = 'hidden';
    document.body.style.padding     = '0';
  }

  // Re-enable transitions after layout has settled
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      allScreens.forEach(s => { s.style.transition = ''; });
    });
  });
}

/* ── Nutrition classifier ── */
function classifyNutrition(muac, whz, edema) {
  if (edema || muac < 115 || (whz !== null && whz < -3)) {
    return { status: 'SAM', label: '⚠ Severe Acute Malnutrition', css: 'sam' };
  } else if (muac < 125 || (whz !== null && whz < -2)) {
    return { status: 'MAM', label: '⚠ Moderate Acute Malnutrition', css: 'mam' };
  }
  return { status: 'NORMAL', label: '✓ Normal nutritional status', css: 'norm' };
}
