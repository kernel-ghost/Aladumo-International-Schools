/* ============================================================
   main.js — Interactions for Aladumo International Schools
   Vanilla JS, no dependencies. Each behaviour is an isolated
   module (IIFE) so you can remove or reuse it independently.
   ============================================================ */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 1. Mobile drawer ---------- */
  (function drawer() {
    const toggle  = $('#navToggle');
    const close   = $('#drawerClose');
    const overlay = $('#drawerOverlay');
    if (!toggle) return;

    const open  = () => { document.body.classList.add('drawer-open'); toggle.setAttribute('aria-expanded', 'true'); };
    const shut  = () => { document.body.classList.remove('drawer-open'); toggle.setAttribute('aria-expanded', 'false'); };

    toggle.addEventListener('click', open);
    close && close.addEventListener('click', shut);
    overlay && overlay.addEventListener('click', shut);
    $$('#drawer a').forEach(a => a.addEventListener('click', shut));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
  })();

  /* ---------- 2. Animated stat counters ---------- */
  (function counters() {
    const nums = $$('.stat-box .num');
    if (!nums.length) return;

    const run = (el) => {
      const target = +el.dataset.target || 0;
      const duration = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);           // easeOutCubic
        el.textContent = Math.round(target * eased) + (p === 1 && target > 0 ? '+' : '');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => {
          if (en.isIntersecting) { run(en.target); obs.unobserve(en.target); }
        });
      }, { threshold: 0.4 });
      nums.forEach(n => io.observe(n));
    } else {
      nums.forEach(run);
    }
  })();

  /* ---------- 3. Scroll reveal ---------- */
  (function reveal() {
    const items = $$('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(i => i.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(i => io.observe(i));
  })();

  /* ---------- 4. Flip cards: tap / keyboard support ---------- */
  (function flip() {
    $$('.flip-card').forEach(card => {
      const t = () => card.classList.toggle('is-flipped');
      card.addEventListener('click', t);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); }
      });
    });
  })();

  /* ---------- 5. Gallery lightbox (self-contained) ---------- */
  (function lightbox() {
    const grid = $('#gallery');
    const box  = $('#lightbox');
    if (!grid || !box) return;

    const img   = $('#lbImg');
    const links = $$('a', grid);
    let index = 0;

    const show = (i) => {
      index = (i + links.length) % links.length;
      img.src = links[index].getAttribute('href');
      img.alt = (links[index].querySelector('img') || {}).alt || '';
    };
    const open  = (i) => { show(i); box.classList.add('open'); box.setAttribute('aria-hidden', 'false'); };
    const close = ()  => { box.classList.remove('open'); box.setAttribute('aria-hidden', 'true'); };

    links.forEach((a, i) => a.addEventListener('click', e => { e.preventDefault(); open(i); }));
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', () => show(index - 1));
    $('#lbNext').addEventListener('click', () => show(index + 1));
    box.addEventListener('click', e => { if (e.target === box) close(); });
    document.addEventListener('keydown', e => {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft')  show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  })();

  /* ---------- 6. Back to top ---------- */
  (function backToTop() {
    const btn = $('#toTop');
    if (!btn) return;
    const onScroll = () => btn.classList.toggle('show', window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    onScroll();
  })();

  /* ---------- 7. Subscribe form (demo handler) ---------- */
  (function subscribe() {
    const form = $('#subscribeForm');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = $('#subEmail');
      if (!email.value || !email.checkValidity()) { email.focus(); return; }
      const btn = form.querySelector('button');
      btn.textContent = 'Subscribed ✓';
      btn.disabled = true;
      form.reset();
      setTimeout(() => { btn.textContent = 'Subscribe'; btn.disabled = false; }, 2500);
    });
  })();

  /* ---------- 8. Email forms (FormSubmit.co) ---------- */
  function emailForm(formId, sentText, idleText) {
    const form = $(formId);
    if (!form) return;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const invalid = form.querySelector(':invalid');
      if (invalid) { invalid.focus(); return; }
      const btn = form.querySelector('button');
      const ajaxUrl = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
      btn.disabled = true;
      btn.textContent = 'Sending...';
      try {
        const res = await fetch(ajaxUrl, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error('Request failed');
        btn.textContent = sentText;
        form.reset();
      } catch (err) {
        btn.textContent = 'Something went wrong — try again';
        btn.disabled = false;
        return;
      }
      setTimeout(() => { btn.textContent = idleText; btn.disabled = false; }, 3000);
    });
  }
  emailForm('#contactForm', 'Message Sent', 'Send Message');
  emailForm('#admissionForm', 'Application Submitted', 'Submit Application');
  emailForm('#eventsForm', 'Enquiry Sent', 'Send Enquiry');

})();
