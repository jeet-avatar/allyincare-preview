/* Ally In-Care — small progressive-enhancement UI: mobile menu + scroll reveal. */
(function () {
	'use strict';

	// Mobile menu toggle.
	var toggle = document.querySelector('.js-menu-toggle');
	var nav = document.querySelector('.js-mobile-nav');
	if (toggle && nav) {
		toggle.addEventListener('click', function () {
			var open = nav.classList.toggle('hidden') === false;
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
		});
		// Close on link tap.
		nav.addEventListener('click', function (e) {
			if (e.target.closest('a')) {
				nav.classList.add('hidden');
				toggle.setAttribute('aria-expanded', 'false');
				toggle.setAttribute('aria-label', 'Open menu');
			}
		});
	}

	// Reveal-on-scroll for elements below the fold. Elements already animated by
	// the CSS `.reveal` keyframes (hero) are left alone; this adds a class only to
	// opted-in `[data-reveal]` nodes so content stays visible without JS.
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var targets = document.querySelectorAll('[data-reveal]');
	if (!reduce && 'IntersectionObserver' in window && targets.length) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('reveal', 'reveal-1');
					io.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
		targets.forEach(function (el) { io.observe(el); });
	}
})();
