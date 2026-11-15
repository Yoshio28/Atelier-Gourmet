/* Interacciones. Menú móvil y tap-to-call: pendientes (siguiente etapa). */
(function () {
  'use strict';

  /* ---- Hero: video de fondo ---- */
  var hero = document.querySelector('[data-hero]');
  var video = hero && hero.querySelector('.hero__video');
  if (!video) { return; }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var conn = navigator.connection || {};
  var lowData = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || '');

  function showMedia() { hero.classList.add('hero--media'); }

  // Póster: si existe, se usa el modo "con media" aunque el video no reproduzca
  var poster = video.getAttribute('poster');
  if (poster) {
    var img = new Image();
    img.onload = showMedia;
    img.src = poster;
  }

  video.addEventListener('canplay', function () {
    video.classList.add('is-ready');
    showMedia();
  });

  function stopVideo() { video.pause(); }
  function playVideo() {
    var p = video.play();
    if (p && p.catch) { p.catch(function () { /* autoplay bloqueado: queda el póster */ }); }
  }

  // Sin movimiento / datos reducidos: solo póster, sin reproducir ni descargar el video
  if (reduce.matches || lowData) {
    video.removeAttribute('autoplay');
    video.preload = 'none';
    stopVideo();
    return;
  }

  // Pausar fuera de pantalla para ahorrar batería y datos
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? playVideo() : stopVideo(); });
    }, { threshold: 0.05 }).observe(hero);
  }

  document.addEventListener('visibilitychange', function () {
    document.hidden ? stopVideo() : playVideo();
  });
})();
