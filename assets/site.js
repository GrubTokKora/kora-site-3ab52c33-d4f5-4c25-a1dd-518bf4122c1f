/* Curry and Grill: header state, mobile menu, reveals, open-now status, today's hours, contact form. */
(function () {
  'use strict';
  var doc = document.documentElement;

  /* ---------- sticky header shadow + mobile menu ---------- */
  var hdr = document.querySelector('[data-hdr]');
  var burger = document.querySelector('[data-burger]');
  var mnav = document.querySelector('[data-mnav]');
  function onScroll() { if (hdr) hdr.classList.toggle('is-stuck', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    if (!burger || !mnav) return;
    if (open) doc.style.setProperty('--mnav-top', Math.max(0, hdr.getBoundingClientRect().bottom) + 'px');
    doc.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(!doc.classList.contains('menu-open')); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });
  }

  /* ---------- reveal on scroll ---------- */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- open now (restaurant time: America/New_York) ---------- */
  var DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  var WEEKDAY = [[660, 870], [990, 1290]];   // 11:00-2:30, 4:30-9:30
  var WEEKEND = [[690, 900], [990, 1290]];   // 11:30-3:00, 4:30-9:30
  var SHIFTS = { sunday: WEEKEND, monday: [], tuesday: WEEKDAY, wednesday: WEEKDAY, thursday: WEEKDAY, friday: WEEKDAY, saturday: WEEKEND };
  function fmt(min) {
    var h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + (m ? ':' + String(m).padStart(2, '0') : '') + ' ' + ap;
  }
  function nowInOhio() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
      return { day: get('weekday').toLowerCase(), min: (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: DAYS[d.getDay()], min: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function status() {
    var n = nowInOhio(), today = SHIFTS[n.day] || [];
    for (var i = 0; i < today.length; i++) {
      if (n.min >= today[i][0] && n.min < today[i][1]) return { open: true, text: 'Open now · until ' + fmt(today[i][1]), day: n.day };
      if (n.min < today[i][0]) return { open: false, text: 'Closed now · opens ' + fmt(today[i][0]) + ' today', day: n.day };
    }
    var idx = DAYS.indexOf(n.day);
    for (var k = 1; k <= 7; k++) {
      var d = DAYS[(idx + k) % 7];
      if (SHIFTS[d].length) return { open: false, text: 'Closed now · opens ' + (k === 1 ? 'tomorrow' : d.charAt(0).toUpperCase() + d.slice(1)) + ' ' + fmt(SHIFTS[d][0][0]), day: n.day };
    }
    return { open: false, text: '', day: n.day };
  }
  var st = status();
  document.querySelectorAll('[data-open-status]').forEach(function (el) { el.classList.toggle('is-open', st.open); });
  if (st.text) document.querySelectorAll('[data-open-text]').forEach(function (el) { el.textContent = st.text; });
  document.querySelectorAll('tr[data-day="' + st.day + '"], tr[data-days~="' + st.day + '"]').forEach(function (tr) { tr.classList.add('is-today'); });

  /* ---------- contact form -> Kora forms API (<apiBaseUrl>/api/v1/public/forms/submit), reCAPTCHA v2 ---------- */
  var form = document.querySelector('form[data-kora-form]');
  if (!form) return;
  var cfg = window.KORA_SITE_CONFIG || {};
  var btn = form.querySelector('button[type="submit"]');
  var btnLabel = btn.textContent;
  var statusEl = form.querySelector('.form__status');
  var done = form.parentNode.querySelector('.form-done');
  var sending = false, recaptchaRequested = false;

  function setStatus(msg, tone) { statusEl.textContent = msg; if (tone) statusEl.setAttribute('data-tone', tone); else statusEl.removeAttribute('data-tone'); }
  function check(f) {
    var err = f.parentNode.querySelector('.field__err'), msg = '';
    var v = String(f.value || '').trim();
    if (f.required && !v) msg = 'Please fill this in.';
    else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Please enter a valid email address.';
    f.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg;
    return !msg;
  }
  function loadRecaptcha() {
    if (recaptchaRequested || !cfg.recaptchaSiteKey) return;
    recaptchaRequested = true;
    var s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js';
    s.async = true; s.defer = true;
    document.head.appendChild(s);
  }
  form.addEventListener('focusin', loadRecaptcha);
  if ('IntersectionObserver' in window) {
    var near = new IntersectionObserver(function (entries) {
      if (entries.some(function (en) { return en.isIntersecting; })) { loadRecaptcha(); near.disconnect(); }
    }, { rootMargin: '600px 0px' });
    near.observe(form);
  }
  form.querySelectorAll('input, textarea').forEach(function (f) {
    f.addEventListener('blur', function () { if (f.value || f.getAttribute('aria-invalid') === 'true') check(f); });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    loadRecaptcha();
    setStatus('');
    var firstBad = null;
    form.querySelectorAll('input, textarea').forEach(function (f) { if (!check(f) && !firstBad) firstBad = f; });
    if (firstBad) { firstBad.focus(); return; }
    if (!window.grecaptcha) { setStatus('The security check is still loading. Please try again in a moment.', 'info'); return; }
    var token = '';
    try { token = window.grecaptcha.getResponse(); } catch (err) {}
    if (!token) { setStatus('Please tick the security check before sending.', 'error'); return; }
    var val = function (n) { return String((form.elements[n] || {}).value || '').trim(); };
    var email = val('email');
    sending = true;
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.textContent = 'Sending…';
    fetch(form.getAttribute('data-endpoint') || (cfg.apiBaseUrl + '/api/v1/public/forms/submit'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_id: cfg.businessId,
        form_type: form.getAttribute('data-form-type') || 'contact',
        form_data: { name: val('name'), email: email, phone: val('phone'), message: val('message'), source: 'Website contact form' },
        submitter_email: email,
        captcha_token: token
      })
    })
      .then(function (res) {
        if (!res.ok) return res.text().then(function (t) { throw new Error('Form submit failed (' + res.status + '): ' + t); });
        return res.text();
      })
      .then(function () {
        form.reset();
        form.hidden = true;
        if (done) { done.hidden = false; done.focus(); }
      })
      .catch(function (err) {
        console.error('[contact form]', err);
        try { window.grecaptcha.reset(); } catch (e2) {}
        setStatus("Sorry, your message couldn't be sent. Please try again, or call (937) 280-4448.", 'error');
      })
      .then(function () {
        sending = false;
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        btn.textContent = btnLabel;
      });
  });
})();
