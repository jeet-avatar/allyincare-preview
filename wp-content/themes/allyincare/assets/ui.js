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

	// Reveal-on-scroll for elements below the fold. Opted-in `[data-reveal]` nodes
	// stay fully visible without JS; when JS + motion are available we add a
	// `js-reveal` gate on <html> (CSS pre-hides them) then animate on intersect.
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var targets = document.querySelectorAll('[data-reveal]');
	if (!reduce && 'IntersectionObserver' in window && targets.length) {
		document.documentElement.classList.add('js-reveal');
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					io.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
		targets.forEach(function (el) { io.observe(el); });
	}

	// ---- Care-plan builder (services page) ----
	var builder = document.querySelector('[data-plan-builder]');
	if (builder) {
		var contactUrl = builder.getAttribute('data-contact-url') || '/contact-us/';
		var services = Array.prototype.slice.call(builder.querySelectorAll('.js-service'));
		var tiers = Array.prototype.slice.call(builder.querySelectorAll('.js-tier'));
		var listEl = builder.querySelector('.js-plan-list');
		var emptyEl = builder.querySelector('.js-plan-empty');
		var countEls = document.querySelectorAll('.js-plan-count');
		var requestEls = document.querySelectorAll('.js-plan-request');
		var mobileBar = document.querySelector('.js-plan-bar');

		function selectedTitles() {
			return services.filter(function (c) { return c.checked; })
				.map(function (c) { return c.getAttribute('data-title'); });
		}

		function updateSummary() {
			var titles = selectedTitles();
			var n = titles.length;
			Array.prototype.forEach.call(countEls, function (el) { el.textContent = String(n); });

			if (listEl) {
				listEl.innerHTML = '';
				titles.forEach(function (t) {
					var li = document.createElement('li');
					li.className = 'flex items-start gap-2.5 text-[0.93rem] text-ink/90';
					li.innerHTML = '<span class="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-terracotta"></span>';
					var span = document.createElement('span');
					span.textContent = t;
					li.appendChild(span);
					listEl.appendChild(li);
				});
				listEl.hidden = n === 0;
			}
			if (emptyEl) { emptyEl.hidden = n > 0; }

			var href = n ? contactUrl + (contactUrl.indexOf('?') === -1 ? '?' : '&') + 'plan=' + encodeURIComponent(titles.join('|')) : contactUrl;
			Array.prototype.forEach.call(requestEls, function (a) {
				a.setAttribute('href', href);
				if (n > 0) { a.removeAttribute('aria-disabled'); } else { a.setAttribute('aria-disabled', 'true'); }
			});
			if (mobileBar) { mobileBar.hidden = n === 0; }
		}

		tiers.forEach(function (radio) {
			radio.addEventListener('change', function () {
				var level = parseInt(radio.value, 10) || 0;
				services.forEach(function (c) {
					c.checked = (parseInt(c.getAttribute('data-level'), 10) || 1) <= level;
				});
				updateSummary();
			});
		});
		services.forEach(function (c) { c.addEventListener('change', updateSummary); });

		var clearBtn = builder.querySelector('.js-plan-clear');
		if (clearBtn) {
			clearBtn.addEventListener('click', function () {
				services.forEach(function (c) { c.checked = false; });
				tiers.forEach(function (r) { r.checked = false; });
				updateSummary();
			});
		}
		updateSummary();
	}

	// ---- Contact form: pre-fill from ?plan= and submit via mailto ----
	var form = document.querySelector('.js-contact-form');
	if (form) {
		var messageEl = form.querySelector('#plan-message');
		var params = new URLSearchParams(window.location.search);
		var plan = params.get('plan');
		if (plan && messageEl && !messageEl.value.trim()) {
			var items = plan.split('|').filter(Boolean);
			if (items.length) {
				messageEl.value = "I'd like a care plan with:\n" +
					items.map(function (t) { return ' • ' + t; }).join('\n') +
					'\n\nA little about my loved one: ';
				// Bring the pre-filled form into view.
				form.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}

		var hint = form.querySelector('.js-contact-hint');
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var email = form.getAttribute('data-email') || '';
			var get = function (name) { var f = form.querySelector('[name="' + name + '"]'); return f ? f.value.trim() : ''; };
			var name = get('name');
			var phone = get('phone');
			var from = get('email');
			var msg = get('message');
			var body = msg + '\n\n—\nName: ' + name + (phone ? '\nPhone: ' + phone : '') + (from ? '\nEmail: ' + from : '');
			var mailto = 'mailto:' + email +
				'?subject=' + encodeURIComponent('Care plan request' + (name ? ' from ' + name : '')) +
				'&body=' + encodeURIComponent(body);
			window.location.href = mailto;
			if (hint) { hint.hidden = false; hint.textContent = 'Opening your email app…'; }
		});
	}
})();
