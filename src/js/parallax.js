/* Parallax por capas con transform + requestAnimationFrame.
   Uso: data-parallax="velocidad" (positivo = se retrasa respecto al scroll, parece más lejano).
        data-parallax-mode="scroll" → desplazamiento = scrollY * velocidad (para elementos al inicio de la página)
        (por defecto, relativo al centro del viewport)
        data-parallax-fade → además atenúa la opacidad al alejarse del inicio. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var small = window.matchMedia('(max-width: 640px)');
  var items = [];
  var ticking = false;
  var active = false;
  var vh = window.innerHeight;

  function measure() {
    vh = window.innerHeight;
    var y = window.pageYOffset;
    var factor = small.matches ? 0.6 : 1; // movimiento más suave en móvil
    items.forEach(function (it) {
      var prev = it.el.style.transform;
      it.el.style.transform = 'none';
      var r = it.el.getBoundingClientRect();
      it.el.style.transform = prev;
      it.center = r.top + y + r.height / 2;
      it.bottom = r.top + y + r.height;
      it.k = it.speed * factor;
    });
  }

  function frame() {
    ticking = false;
    var y = window.pageYOffset;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (y > it.bottom + vh) { continue; } // ya quedó atrás
      var d = it.mode === 'scroll' ? y * it.k : (y + vh / 2 - it.center) * it.k;
      it.el.style.transform = 'translate3d(0,' + d.toFixed(1) + 'px,0)';
      if (it.fade) {
        it.el.style.opacity = Math.max(0, 1 - y / (vh * 0.75)).toFixed(3);
      }
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }

  function onResize() { measure(); onScroll(); }

  function reset() {
    items.forEach(function (it) { it.el.style.transform = ''; it.el.style.opacity = ''; });
  }

  function start() {
    if (active) { return; }
    active = true;
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);
    frame();
  }

  function stop() {
    if (!active) { return; }
    active = false;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('load', onResize);
    reset();
  }

  function sync() { if (reduce.matches) { stop(); } else { start(); } }

  document.querySelectorAll('[data-parallax]').forEach(function (el) {
    items.push({
      el: el,
      speed: parseFloat(el.dataset.parallax) || 0,
      mode: el.dataset.parallaxMode || 'center',
      fade: el.hasAttribute('data-parallax-fade'),
      center: 0, bottom: 0, k: 0
    });
  });

  if (!items.length) { return; }
  if (reduce.addEventListener) { reduce.addEventListener('change', sync); }
  if (small.addEventListener) { small.addEventListener('change', onResize); }
  sync();
})();
