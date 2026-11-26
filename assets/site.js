/* かなめ自動車整備（見本）の動き。外部のライブラリは使わない */
(function () {
  'use strict';
  var d = document;

  // 本日の受付：今日の日付
  var sd = d.getElementById('slip-date');
  if (sd) { var t = new Date(); sd.textContent = (t.getMonth() + 1) + '/' + String(t.getDate()).padStart(2, '0'); }

  // スマホのメニュー
  var bg = d.querySelector('.burger'), dr = d.getElementById('drawer');
  if (bg && dr) {
    var setOpen = function (o) { bg.setAttribute('aria-expanded', o); dr.hidden = !o; bg.setAttribute('aria-label', o ? 'メニューを閉じる' : 'メニューを開く'); };
    bg.addEventListener('click', function () { setOpen(bg.getAttribute('aria-expanded') !== 'true'); });
    dr.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  // 三つの札（タブ）
  var tabs = [].slice.call(d.querySelectorAll('.tags [role=tab]'));
  function pick(tab, focus) {
    tabs.forEach(function (x) {
      var on = x === tab;
      x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
      d.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { pick(tab); });
    tab.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (k) { e.preventDefault(); pick(tabs[(i + k + tabs.length) % tabs.length], true); }
    });
  });

  // 車検の目安（見本の数字）
  var F = { // 重量税[13年未満,13年以上]・自賠責24か月・印紙・当店料金
    kei: { w: [6600, 8200], j: 17540, i: 1800, s: 15400 },
    s:   { w: [16400, 22800], j: 17650, i: 1800, s: 19800 },
    m:   { w: [24600, 34200], j: 17650, i: 1800, s: 22000 },
    l:   { w: [32800, 45600], j: 17650, i: 1800, s: 25300 }
  };
  var out = { t: d.getElementById('c-total'), h: d.getElementById('c-hotei'), s: d.getElementById('c-shop'), bh: d.getElementById('c-bar-h'), bs: d.getElementById('c-bar-s') };
  var cur = 0, raf = 0;
  var yen = function (n) { return Math.round(n).toLocaleString('ja-JP'); };
  function calc() {
    if (!out.t) return;
    var size = (d.querySelector('input[name=size]:checked') || {}).value || 'kei';
    var age = (d.querySelector('input[name=age]:checked') || {}).value === 'o' ? 1 : 0;
    var f = F[size], h = f.w[age] + f.j + f.i, total = h + f.s;
    out.h.textContent = yen(h); out.s.textContent = yen(f.s);
    out.bh.style.width = (h / total * 100) + '%'; out.bs.style.width = (f.s / total * 100) + '%';
    var from = cur, start = 0, dur = 650;
    cancelAnimationFrame(raf);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { cur = total; out.t.textContent = yen(total); return; }
    raf = requestAnimationFrame(function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur), e = 1 - Math.pow(1 - p, 3);
      cur = from + (total - from) * e; out.t.textContent = yen(cur);
      if (p < 1) raf = requestAnimationFrame(step);
    });
  }
  d.querySelectorAll('.calc input').forEach(function (r) { r.addEventListener('change', calc); });
  calc();

  // 読み進めると現れる
  var rv = d.querySelectorAll('.sec-h, .report, .tags, .calc, .idx li, .menu-ph, .log li, .hito-ph, .hito-t, .qa, .yk-ways, .access, .strip li');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    rv.forEach(function (el, i) {
      el.classList.add('rv');
      var sib = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = (el.matches('li') ? Math.min(sib * 0.06, 0.3) : 0) + 's';
      io.observe(el);
    });
  }

  // スマホ：最初の画面を過ぎたら下に「電話・予約」
  var dock = d.querySelector('.dock'), hero = d.querySelector('.hero'), yk = d.getElementById('yoyaku');
  if (dock && hero && 'IntersectionObserver' in window) {
    var heroIn = true, ykIn = false;
    var upd = function () { dock.classList.toggle('on', !heroIn && !ykIn); };
    new IntersectionObserver(function (es) { heroIn = es[0].isIntersecting; upd(); }, { threshold: 0.15 }).observe(hero);
    if (yk) new IntersectionObserver(function (es) { ykIn = es[0].isIntersecting; upd(); }, { threshold: 0.1 }).observe(yk);
  }
})();
