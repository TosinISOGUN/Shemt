/**
 * Shemt Analytics Tracker
 * Lightweight, privacy-focused analytics script.
 */
(function() {
  const script = document.currentScript;
  const projectId = script.getAttribute('data-project-id');
  const apiKey = script.getAttribute('data-api-key');
  const endpoint = script.getAttribute('data-endpoint') || 'https://your-supabase-url.supabase.co/functions/v1/ingest';

  if (!projectId || !apiKey) {
    console.warn('Shemt Analytics: Missing project-id or api-key');
    return;
  }

  const shemt = {
    track: async (name, props = {}) => {
      try {
        const payload = {
          name,
          project_id: projectId,
          api_key: apiKey,
          properties: {
            ...props,
            url: window.location.href,
            referrer: document.referrer,
            language: navigator.language,
            screen: `${window.screen.width}x${window.screen.height}`
          }
        };

        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
          body: JSON.stringify(payload),
          keepalive: true
        });
      } catch (e) {
        // Silently fail
      }
    }
  };

  // Expose to window
  window.shemt = shemt;

  // Auto-track pageview on load
  if (document.readyState === 'complete') {
    shemt.track('page_view');
  } else {
    window.addEventListener('load', () => shemt.track('page_view'));
  }
})();
