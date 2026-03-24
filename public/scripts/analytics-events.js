/**
 * Iron Gate Technologies - GA4 Custom Event Tracking
 * File: /scripts/analytics-events.js
 * Version: 1.0
 * Created: 2026-02-09 by AGENT-07
 *
 * Tracks: CTA clicks, phone clicks, email clicks, booking page views,
 * SuiteDash form load, scroll depth, and outbound link clicks.
 *
 * Requires: GA4 (gtag) loaded before this script.
 */

(function () {
  'use strict';

  // Guard: exit if gtag is not available
  if (typeof gtag !== 'function') {
    return;
  }

  var pagePath = window.location.pathname;

  // -------------------------------------------------------
  // 1. CTA Click Tracking (links to /booking)
  // -------------------------------------------------------
  function getCTALocation(element) {
    var el = element;
    while (el && el !== document.body) {
      var tag = el.tagName ? el.tagName.toLowerCase() : '';
      if (tag === 'header' || tag === 'nav') return 'header';
      if (tag === 'footer') return 'footer';

      var id = (el.id || '').toLowerCase();
      var cls = (el.className || '').toString().toLowerCase();

      if (id === 'hero' || cls.indexOf('hero') !== -1) return 'hero';
      if (tag === 'section') return 'mid-page';

      el = el.parentElement;
    }
    return 'unknown';
  }

  // -------------------------------------------------------
  // 2-3. Phone and Email Click Tracking
  // -------------------------------------------------------

  // -------------------------------------------------------
  // 7. Outbound Link Tracking
  // -------------------------------------------------------
  function isOutboundLink(href) {
    if (!href || href.indexOf('http') !== 0) return false;
    return href.indexOf('irongate.world') === -1;
  }

  // -------------------------------------------------------
  // Event delegation for all link clicks (CTA, phone, email, outbound)
  // -------------------------------------------------------
  document.addEventListener('click', function (e) {
    var target = e.target;

    // Walk up to find the anchor element
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
    }
    if (!target || !target.href) return;

    var href = target.href;
    var linkText = (target.textContent || '').trim().substring(0, 100);

    // CTA clicks (links to /booking)
    if (
      (href.indexOf('/booking') !== -1 && href.indexOf('irongate.world') !== -1) ||
      target.getAttribute('href') === '/booking' ||
      target.getAttribute('href') === '/booking/'
    ) {
      gtag('event', 'cta_click', {
        cta_text: linkText,
        cta_location: getCTALocation(target),
        page_path: pagePath
      });
      return;
    }

    // Phone clicks
    if (href.indexOf('tel:') === 0) {
      gtag('event', 'phone_click', {
        page_path: pagePath
      });
      return;
    }

    // Email clicks
    if (href.indexOf('mailto:') === 0) {
      gtag('event', 'email_click', {
        page_path: pagePath
      });
      return;
    }

    // Outbound link clicks
    if (isOutboundLink(href)) {
      gtag('event', 'outbound_click', {
        url: href,
        link_text: linkText,
        page_path: pagePath,
        transport_type: 'beacon'
      });
    }
  });

  // -------------------------------------------------------
  // 4. Booking Page View (conversion event, fires once on /booking/)
  // -------------------------------------------------------
  if (pagePath === '/booking' || pagePath === '/booking/') {
    gtag('event', 'booking_page_view', {
      referrer_page: document.referrer || '(direct)',
      page_path: pagePath
    });
  }

  // -------------------------------------------------------
  // 5. SuiteDash Form Load Detection (booking page only)
  // -------------------------------------------------------
  if (pagePath === '/booking' || pagePath === '/booking/') {
    var formContainer = document.getElementById('suitedash-form-container');
    if (formContainer) {
      var loadStart = performance.now();
      var formObserver = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var addedNodes = mutations[i].addedNodes;
          for (var j = 0; j < addedNodes.length; j++) {
            var node = addedNodes[j];
            if (node.tagName && node.tagName.toLowerCase() === 'iframe') {
              var loadTime = Math.round(performance.now() - loadStart);
              gtag('event', 'booking_form_loaded', {
                load_time_ms: loadTime,
                page_path: pagePath
              });
              formObserver.disconnect();
              return;
            }
          }
        }
      });
      formObserver.observe(formContainer, { childList: true, subtree: true });
    }
  }

  // -------------------------------------------------------
  // 6. Scroll Depth Tracking (25%, 50%, 75%, 100%)
  // -------------------------------------------------------
  var scrollMilestones = { 25: false, 50: false, 75: false, 100: false };

  function checkScrollDepth() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    var winHeight = window.innerHeight;
    var scrollable = docHeight - winHeight;

    if (scrollable <= 0) return;

    var percent = Math.round((scrollTop / scrollable) * 100);

    var thresholds = [25, 50, 75, 100];
    for (var i = 0; i < thresholds.length; i++) {
      var t = thresholds[i];
      if (percent >= t && !scrollMilestones[t]) {
        scrollMilestones[t] = true;
        gtag('event', 'scroll_depth', {
          depth: t,
          page_path: pagePath
        });
      }
    }
  }

  // Throttled scroll listener (fires at most every 250ms)
  var scrollTimer = null;
  window.addEventListener('scroll', function () {
    if (scrollTimer) return;
    scrollTimer = setTimeout(function () {
      scrollTimer = null;
      checkScrollDepth();
    }, 250);
  }, { passive: true });

  // Check once on load (for short pages already scrolled)
  checkScrollDepth();
})();
