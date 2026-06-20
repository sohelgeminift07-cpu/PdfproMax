// ============================================================
// PWA — Install banner + Service Worker registration
// ============================================================




/* ── PWA: install prompt + update toast ── */
(function () {
  var deferredPrompt = null;
  var installBtn = null;

  /* ── Install banner styles ── */
  var style = document.createElement('style');
  style.textContent = [
    '#pwa-install-banner{',
      'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(120px);',
      'background:#1e1e2e;border:1px solid rgba(99,102,241,0.35);border-radius:16px;',
      'padding:14px 20px;display:flex;align-items:center;gap:14px;',
      'box-shadow:0 8px 32px rgba(0,0,0,0.5);z-index:99999;',
      'transition:transform 0.4s cubic-bezier(0.22,1,0.36,1);',
      'max-width:calc(100vw - 32px);white-space:nowrap;',
    '}',
    '#pwa-install-banner.show{transform:translateX(-50%) translateY(0);}',
    '#pwa-install-banner .pwa-text{display:flex;flex-direction:column;gap:2px;}',
    '#pwa-install-banner .pwa-title{font-size:13px;font-weight:700;color:#e2e8f0;letter-spacing:.01em;}',
    '#pwa-install-banner .pwa-sub{font-size:11px;color:#94a3b8;}',
    '#pwa-install-banner .pwa-btn{',
      'background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;',
      'border:none;border-radius:8px;padding:8px 16px;',
      'font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;',
      'letter-spacing:.03em;',
    '}',
    '#pwa-install-banner .pwa-dismiss{',
      'background:none;border:none;color:#64748b;cursor:pointer;',
      'font-size:18px;line-height:1;padding:2px 4px;',
    '}',
    '#pwa-update-toast{',
      'position:fixed;top:16px;left:50%;transform:translateX(-50%) translateY(-80px);',
      'background:#1e1e2e;border:1px solid rgba(56,189,248,0.35);border-radius:12px;',
      'padding:10px 18px;display:flex;align-items:center;gap:12px;',
      'box-shadow:0 4px 20px rgba(0,0,0,0.4);z-index:99999;',
      'transition:transform 0.35s cubic-bezier(0.22,1,0.36,1);',
    '}',
    '#pwa-update-toast.show{transform:translateX(-50%) translateY(0);}',
    '#pwa-update-toast span{font-size:12px;color:#e2e8f0;}',
    '#pwa-update-toast button{',
      'background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);',
      'color:#38bdf8;border-radius:6px;padding:4px 10px;',
      'font-size:11px;font-weight:700;cursor:pointer;',
    '}',
  ].join('');
  document.head.appendChild(style);

  /* ── Build install banner ── */
  function createInstallBanner() {
    var banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML =
      '<div class="pwa-text">' +
        '<div class="pwa-title">&#128279; Install MaxOfPdf</div>' +
        '<div class="pwa-sub">Home screen-এ add করো — offline কাজ করবে</div>' +
      '</div>' +
      '<button class="pwa-btn" id="pwa-install-ok">Install</button>' +
      '<button class="pwa-dismiss" id="pwa-install-no" title="Dismiss">&times;</button>';
    document.body.appendChild(banner);

    setTimeout(function () { banner.classList.add('show'); }, 100);

    document.getElementById('pwa-install-ok').addEventListener('click', function () {
      banner.classList.remove('show');
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () { deferredPrompt = null; });
      }
    });
    document.getElementById('pwa-install-no').addEventListener('click', function () {
      banner.classList.remove('show');
      try { localStorage.setItem('pwa_dismissed', Date.now()); } catch(e) {}
    });
  }

  /* ── Build update toast ── */
  function showUpdateToast(worker) {
    var toast = document.createElement('div');
    toast.id = 'pwa-update-toast';
    toast.innerHTML =
      '<span>&#10024; নতুন ভার্সন আছে</span>' +
      '<button id="pwa-reload-btn">Update</button>';
    document.body.appendChild(toast);
    setTimeout(function () { toast.classList.add('show'); }, 100);
    document.getElementById('pwa-reload-btn').addEventListener('click', function () {
      if (worker) worker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    });
  }

  /* ── Capture beforeinstallprompt ── */
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    /* Don't show if dismissed within 7 days */
    try {
      var dismissed = parseInt(localStorage.getItem('pwa_dismissed') || '0', 10);
      if (dismissed && (Date.now() - dismissed) < 7 * 24 * 60 * 60 * 1000) return;
    } catch(err) {}
    /* Delay so app has rendered */
    setTimeout(createInstallBanner, 2500);
  });

  /* ── Register SW ── */
  var proto = location.protocol;
  var isSecure = proto === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if ('serviceWorker' in navigator && isSecure) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function (reg) {
          /* Listen for new SW waiting to activate */
          reg.addEventListener('updatefound', function () {
            var newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', function () {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateToast(newWorker);
              }
            });
          });
          /* Also check on page focus (catch updates that happened while tab was hidden) */
          document.addEventListener('visibilitychange', function () {
            if (!document.hidden) reg.update();
          });
        })
        .catch(function (err) {
          console.warn('[MaxOfPdf] SW registration failed:', err);
        });

      /* When SW activates (SKIP_WAITING), reload all open tabs */
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        window.location.reload();
      });
    });
  }
})();
