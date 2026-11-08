/* UR X VPS — shared behaviour. Light, passive, pauses when the tab is hidden. */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // opening splash: remember it was shown in this tab
  try { sessionStorage.setItem('urx_seen', '1'); } catch (e) {}
  const sp = $('.boot');
  if (sp) setTimeout(() => sp.remove(), 1600);

  // count-up numbers
  $$('[data-count]').forEach(el => {
    const to = parseFloat(el.dataset.count) || 0;
    if (reduce || to === 0) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 800;
    (function tick(t) {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });

  // flash banners fade out
  $$('.flash').forEach((f, i) => setTimeout(() => {
    f.classList.add('gone'); setTimeout(() => f.remove(), 600);
  }, 5000 + i * 500));

  // poll helper: runs now, then every `ms`, only while the tab is visible
  window.urxPoll = function (fn, ms) {
    let t = null;
    const run = async () => { try { await fn(); } catch (e) {} t = setTimeout(run, ms); };
    const start = () => { if (!t) run(); };
    const stop = () => { clearTimeout(t); t = null; };
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    start();
  };

  // live system gauges: meters (scaleX bar) and header pills
  const gauges = $$('[data-gauge]');
  if (gauges.length) {
    const lvl = v => v > 85 ? 'bad' : v > 65 ? 'warn' : '';
    urxPoll(async () => {
      const d = await (await fetch('/api/stats')).json();
      gauges.forEach(g => {
        const v = Math.min(100, d[g.dataset.gauge] || 0), f = $('.fill', g), t = $('.mv', g);
        if (f) f.style.transform = 'scaleX(' + (v / 100) + ')';
        if (t) t.textContent = Math.round(v) + '%';
        g.dataset.lvl = lvl(v);
      });
    }, 5000);
  }

  // drag & drop upload zone
  const drop = $('.drop');
  if (drop) {
    const inp = $('input[type=file]', drop), out = $('#picked');
    const show = () => { if (out) out.textContent = Array.from(inp.files).map(f => f.name).join(', '); };
    inp.addEventListener('change', show);
    ['dragenter', 'dragover'].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', ev => { inp.files = ev.dataTransfer.files; show(); });
  }

  // project search + filter (dashboard)
  const rows = $$('.prow'), q = $('#q'), segs = $$('.seg button');
  if (rows.length) {
    let f = 'all';
    const apply = () => {
      const t = q ? q.value.trim().toLowerCase() : '';
      let n = 0;
      rows.forEach(r => {
        const ok = (f === 'all' || r.dataset.st === f) && (!t || r.dataset.name.includes(t));
        r.hidden = !ok; if (ok) n++;
      });
      const nm = $('#noMatch'); if (nm) nm.hidden = n > 0;
    };
    segs.forEach(b => b.addEventListener('click', () => { segs.forEach(x => x.classList.toggle('on', x === b)); f = b.dataset.f; apply(); }));
    if (q) q.addEventListener('input', apply);
  }

  // keep the active project tab in view on small screens
  const on = $('.ptabs a.on');
  if (on) requestAnimationFrame(() => on.scrollIntoView({ inline: 'center', block: 'nearest' }));

  // tap ripple on buttons (touch + mouse), one tiny element, removed after the animation
  document.addEventListener('pointerdown', e => {
    if (reduce) return;
    const b = e.target.closest('.btn, .ib, .seg button');
    if (!b || b.disabled) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2;
    const el = document.createElement('span');
    el.className = 'rip';
    el.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
    b.style.overflow = 'hidden';
    b.appendChild(el);
    setTimeout(() => el.remove(), 600);
  }, { passive: true });

  // show a spinner on submit buttons so taps feel acknowledged (prevents double-submit)
  $$('form').forEach(f => f.addEventListener('submit', () => {
    const b = $('button[type=submit], button:not([type])', f);
    if (b && !b.classList.contains('busy') && !f.id) setTimeout(() => b.classList.add('busy'), 0);
  }));
  window.addEventListener('pageshow', () => $$('.btn.busy').forEach(b => b.classList.remove('busy')));
})();
