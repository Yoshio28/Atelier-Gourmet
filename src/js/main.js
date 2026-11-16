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

  /* ---- Pestaña activa del menú ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.menu__tabs a'));
  if (tabs.length && hasIO) {
    var byId = {};
    var bar = document.querySelector('.menu__tabs');
    var menu = document.querySelector('.menu');
    var courses = Array.prototype.slice.call(document.querySelectorAll('.course'));
    var tabObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        tabs.forEach(function (a) { a.classList.remove('is-active'); });
        // tono alterno por sección + marca de sección actual
        var i = courses.indexOf(e.target);
        courses.forEach(function (c) { c.classList.toggle('is-current', c === e.target); });
        if (menu && i > -1) { menu.dataset.tone = i % 2 ? 'alt' : 'base'; }
        var a = byId[e.target.id];
        if (a) {
          a.classList.add('is-active');
          // desplaza solo la barra de pestañas (no la página)
          bar.scrollTo({ left: a.offsetLeft - bar.clientWidth / 2 + a.offsetWidth / 2 });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    tabs.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      byId[id] = a;
      if (sec) { tabObserver.observe(sec); }
    });
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
