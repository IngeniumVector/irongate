/**
 * IGT Animation Controller
 * Handles scroll-triggered animations via Intersection Observer.
 * All animations are progressive enhancements.
 */

(function () {
  'use strict';

  // Bail out if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Make stagger items visible immediately
    document.querySelectorAll('.anim-stagger-item').forEach(function (el) {
      el.style.opacity = '1';
    });
    return;
  }

  /**
   * Create an observer that adds 'anim-visible' class once,
   * then disconnects the element.
   */
  function createScrollObserver(selector, options) {
    var defaults = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };
    var config = Object.assign({}, defaults, options || {});

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-visible');
          obs.unobserve(entry.target);
        }
      });
    }, config);

    document.querySelectorAll(selector).forEach(function (el) {
      observer.observe(el);
    });

    return observer;
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // ANIM-001: Section header underlines
    createScrollObserver('.anim-underline', { threshold: 0.3 });

    // ANIM-005: Staggered industry icons
    createScrollObserver('.anim-stagger-item', { threshold: 0.1 });

    // ANIM-006: Number counters
    animateCounters();
  }
})();

/**
 * ANIM-006: Number counter animation
 * Counts up from 0 to target value when scrolled into view.
 */
function animateCounters() {
  var counters = document.querySelectorAll('.anim-counter');
  if (!counters.length) return;

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = el.getAttribute('data-target');
        var suffix = el.getAttribute('data-suffix') || '';
        var prefix = el.getAttribute('data-prefix') || '';
        var num = parseInt(target, 10);

        if (isNaN(num)) {
          el.textContent = prefix + target + suffix;
          obs.unobserve(el);
          return;
        }

        var duration = 1500;
        var start = performance.now();

        function step(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.round(num * eased);
          el.textContent = prefix + current + suffix;
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        }

        requestAnimationFrame(step);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (el) {
    observer.observe(el);
  });
}
