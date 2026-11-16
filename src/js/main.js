/* Interacciones: navegación, pestañas del menú y video del hero. */
(function () {
  'use strict';
  var hasIO = 'IntersectionObserver' in window;

  /* ---- Navegación: transparente sobre el hero, pergamino después ---- */
  var nav = document.querySelector('[data-nav]');
  var hero = document.querySelector('[data-hero]');
  if (nav && hero && hasIO) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('nav--solid', !entries[0].isIntersecting);
    }, { rootMargin: '-72px 0px 0px 0px' }).observe(hero);
  } else if (nav) {
    nav.classList.add('nav--solid');
  }

  /* ---- Navegación de categorías: ScrollSpy + clic + autocentrado ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.menu-category-tab'));
  if (tabs.length) {
    var bar = document.querySelector('.menu-category-nav');
    var menu = document.querySelector('.menu');
    var courses = Array.prototype.slice.call(document.querySelectorAll('.course'));
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    var byId = {};
    var lockUntil = 0;

    var setActive = function (id) {
      var a = byId[id];
      if (!a || a.classList.contains('is-active')) { return; }
      tabs.forEach(function (t) {
        var on = t === a;
        t.classList.toggle('is-active', on);
        if (on) { t.setAttribute('aria-current', 'true'); } else { t.removeAttribute('aria-current'); }
      });
      var sec = document.getElementById(id);
      var i = courses.indexOf(sec);
      courses.forEach(function (c) { c.classList.toggle('is-current', c === sec); });
      if (menu && i > -1) { menu.dataset.tone = i % 2 ? 'alt' : 'base'; }
      // centrar la pestaña activa solo dentro de la barra (sin mover la página)
      if (bar.scrollWidth > bar.clientWidth) {
        bar.scrollTo({ left: a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2, behavior: calm.matches ? 'auto' : 'smooth' });
      }
    };

    tabs.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      byId[id] = a;
      // clic: estado activo inmediato; se ignora el ScrollSpy mientras dura el desplazamiento
      a.addEventListener('click', function () { lockUntil = Date.now() + 1200; setActive(id); });
    });
    window.addEventListener('scrollend', function () { lockUntil = 0; });

    if (hasIO) {
      var spy = new IntersectionObserver(function (entries) {
        if (Date.now() < lockUntil) { return; }
        entries.forEach(function (e) { if (e.isIntersecting) { setActive(e.target.id); } });
      }, { rootMargin: '-45% 0px -50% 0px' });
      courses.forEach(function (c) { spy.observe(c); });
    }
  }

  /* ---- Video del hero ---- */
  var video = hero && hero.querySelector('.hero__video');
  if (!video) { return; }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var conn = navigator.connection || {};
  var lowData = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || '');

  video.addEventListener('canplay', function () { video.classList.add('is-ready'); });
  if (video.readyState >= 3) { video.classList.add('is-ready'); }

  function stopVideo() { video.pause(); }
  function playVideo() {
    var p = video.play();
    if (p && p.catch) { p.catch(function () { /* autoplay bloqueado: queda el póster */ }); }
  }

  // Sin movimiento / datos reducidos: solo póster
  if (reduce.matches || lowData) {
    video.removeAttribute('autoplay');
    video.preload = 'none';
    stopVideo();
    video.load();
    return;
  }

  if (hasIO) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? playVideo() : stopVideo(); });
    }, { threshold: 0.05 }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stopVideo() : playVideo();
  });
})();
