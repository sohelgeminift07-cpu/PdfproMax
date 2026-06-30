// ============================================================
// PWA — Service Worker registration with resilience & error handling
// ============================================================

(function () {
  /* ── Register SW with better error handling ── */
  var proto = location.protocol;
  var isSecure = proto === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  
  if ('serviceWorker' in navigator && isSecure) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function (reg) {
          console.log('[MaxOfPdf] ✓ Service Worker registered successfully');
          
          /* Check for updates when tab becomes visible */
          document.addEventListener('visibilitychange', function () {
            if (!document.hidden) {
              reg.update().catch(function(e) {
                console.warn('[MaxOfPdf] SW update check failed:', e);
              });
            }
          });
          
          /* Listen for controller change (new SW activated) */
          reg.addEventListener('updatefound', function() {
            var newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', function() {
                if (newWorker.state === 'activated') {
                  console.log('[MaxOfPdf] New SW version activated');
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch(function (err) {
          console.warn('[MaxOfPdf] ⚠ SW registration failed (app will still work):', {
            name: err.name,
            message: err.message,
            code: err.code
          });
          /* App continues without offline support — not critical */
        });

      /* When SW activates (SKIP_WAITING), reload all open tabs */
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        console.log('[MaxOfPdf] SW controller changed, reloading...');
        window.location.reload();
      });
    });
  } else {
    if (!isSecure) {
      console.log('[MaxOfPdf] SW registration skipped: not HTTPS or localhost');
    }
  }
})();
