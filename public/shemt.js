/**
 * shemt.js - Lightweight Analytics Tracker
 * 
 * Version: 1.0.0
 * Usage: <script src="https://shemt.vercel.app/shemt.js" data-project-id="YOUR_PROJECT_ID"></script>
 */

(function (window, document) {
  'use strict';

  // --- Configuration ---
  const script = document.currentScript;
  const projectId = script ? script.getAttribute('data-project-id') : null;
  const endpoint = 'https://ovjowvksxlyyxvqyzhwy.supabase.co/functions/v1/ingest'; // Replace with real production URL

  if (!projectId) {
    console.warn('[shemt] Project ID missing. Tracking disabled.');
    return;
  }

  // --- Identity Management ---
  const SESSION_KEY = 'shemt_sid';
  const USER_KEY = 'shemt_uid';

  function getOrCreateId(key, type) {
    let id = (type === 'session' ? sessionStorage : localStorage).getItem(key);
    if (!id) {
      id = 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
      (type === 'session' ? sessionStorage : localStorage).setItem(key, id);
    }
    return id;
  }

  const sessionId = getOrCreateId(SESSION_KEY, 'session');
  const userId = getOrCreateId(USER_KEY, 'local');

  // --- Core Tracking ---
  const shemt = {
    version: '1.0.0',
    projectId: projectId,

    track: function (name, properties = {}) {
      const payload = {
        name: name,
        project_id: projectId,
        user_id: userId,
        session_id: sessionId,
        properties: Object.assign({
          url: window.location.href,
          referrer: document.referrer,
          screen: window.screen.width + 'x' + window.screen.height,
          language: navigator.language,
          title: document.title
        }, properties),
        timestamp: new Date().toISOString()
      };

      try {
        // Use sendBeacon if available for better reliability on page unload
        if (navigator.sendBeacon) {
          navigator.sendBeacon(endpoint, JSON.stringify(payload));
        } else {
          fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
          });
        }
      } catch (e) {
        // Silent fail in production
      }
    }
  };

  // Expose to window
  window.shemt = shemt;

  // Track initial page view
  if (document.readyState === 'complete') {
    shemt.track('page_view');
  } else {
    window.addEventListener('load', function () {
      shemt.track('page_view');
    });
  }

})(window, document);
