// ============================================================
// PWA — Service Worker registration only
// ============================================================

(function () {
  /* ── Register SW ── */
  var proto = location.protocol;
  var isSecure = proto === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if ('serviceWorker' in navigator && isSecure) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function (reg) {
          /* Check for updates when tab becomes visible */
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
