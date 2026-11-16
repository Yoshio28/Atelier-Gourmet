/* Carrito lateral → pedido por WhatsApp con platillos y cantidades. */
(function () {
  'use strict';

  var PHONE = '526622445593';
  var KEY = 'ag-cart-v1';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var drawer = $('#cart');
  if (!drawer) { return; }
  var overlay = $('.cart-overlay');
  var list = $('[data-cart-list]', drawer);
  var empty = $('[data-cart-empty]', drawer);
  var form = $('[data-cart-form]', drawer);
  var foot = $('[data-cart-foot]', drawer);
  var totalEl = $('[data-cart-total]', drawer);
  var send = $('[data-cart-send]', drawer);
  var live = $('[data-cart-live]');
  var lastFocus = null;

  var money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
  var fmt = function (n) { return money.format(n).replace('MX', ''); };

  /* ---- Estado (persistente por visitante) ---- */
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* sin almacenamiento */ } }
  function find(id) { for (var i = 0; i < cart.length; i++) { if (cart[i].id === id) { return cart[i]; } } return null; }
  function total() { return cart.reduce(function (s, it) { return s + it.price * it.qty; }, 0); }
  function count() { return cart.reduce(function (s, it) { return s + it.qty; }, 0); }

  /* ---- Mensaje de WhatsApp ---- */
  function message() {
    var f = form.elements;
    var lines = ['Hola Atelier Gourmet 👋', 'Me gustaría hacer el siguiente pedido:', ''];
    cart.forEach(function (it) {
      var unit = it.unit ? ' (' + it.unit + ')' : '';
      lines.push('• ' + it.qty + ' × ' + it.name + unit + ' — ' + fmt(it.price) + ' c/u = ' + fmt(it.price * it.qty));
    });
    lines.push('', '*Total estimado:* ' + fmt(total()) + ' MXN', '');
    var nombre = f.nombre.value.trim();
    var fecha = f.fecha.value;
    var hora = f.hora.value;
    var com = f.comentarios.value.trim();
    if (nombre) { lines.push('👤 Nombre: ' + nombre); }
    if (fecha || hora) {
      var fechaTxt = fecha ? new Date(fecha + 'T12:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
      lines.push('📅 Recolección: ' + [fechaTxt, hora ? hora + ' h' : ''].filter(Boolean).join(', '));
    }
    if (com) { lines.push('📝 Comentarios: ' + com); }
    if (nombre || fecha || hora || com) { lines.push(''); }
    lines.push('Quedo en espera de su confirmación. ¡Gracias!');
    return lines.join('\n');
  }

  function updateLink() {
    send.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(message());
  }

  /* ---- Render ---- */
  function render() {
    var n = count();
    $$('[data-cart-count]').forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
    empty.hidden = cart.length > 0;
    form.hidden = foot.hidden = cart.length === 0;
    list.innerHTML = '';
    cart.forEach(function (it) {
      var li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML =
        '<div class="cart-item__info"><span class="cart-item__name"></span>' +
        '<span class="cart-item__meta"></span></div>' +
        '<div class="qty" role="group">' +
        '<button type="button" class="qty__btn" data-dec aria-label="Quitar uno">−</button>' +
        '<input class="qty__input" type="number" inputmode="numeric" min="' + it.min + '" value="' + it.qty + '">' +
        '<button type="button" class="qty__btn" data-inc aria-label="Agregar uno">+</button></div>' +
        '<span class="cart-item__sum"></span>' +
        '<button type="button" class="cart-item__remove" data-remove>Quitar</button>';
      li.dataset.id = it.id;
      $('.cart-item__name', li).textContent = it.name;
      $('.cart-item__meta', li).textContent = [it.unit, fmt(it.price) + ' c/u', it.min > 1 ? 'mín. ' + it.min : ''].filter(Boolean).join(' · ');
      $('.cart-item__sum', li).textContent = fmt(it.price * it.qty);
      $('.qty', li).setAttribute('aria-label', 'Cantidad de ' + it.name);
      $('[data-dec]', li).disabled = it.qty <= it.min;
      list.appendChild(li);
    });
    totalEl.textContent = fmt(total());
    updateLink();
    save();
  }

  function setQty(id, q) {
    var it = find(id);
    if (!it) { return; }
    q = Math.max(it.min, Math.min(999, Math.round(q) || it.min));
    it.qty = q;
    render();
  }

  /* ---- Confirmación visible al agregar ---- */
  var toast = $('[data-toast]');
  var toastTimer;
  function showAdded(btn, name) {
    if (!btn.dataset.label) { btn.dataset.label = btn.textContent; }
    clearTimeout(btn._t);
    btn.classList.add('is-added');
    btn.innerHTML = '<span class="add-link__check" aria-hidden="true">✓</span> Agregado';
    btn._t = setTimeout(function () { btn.textContent = btn.dataset.label; btn.classList.remove('is-added'); }, 1600);
    var dish = btn.closest('.dish');
    if (dish) { dish.classList.remove('is-added'); void dish.offsetWidth; dish.classList.add('is-added'); }
    if (toast) {
      $('[data-toast-name]', toast).textContent = name;
      toast.classList.add('is-visible');
      toast.setAttribute('aria-hidden', 'false');
      $('.toast__btn', toast).tabIndex = 0;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(hideToast, 3200);
    }
  }
  function hideToast() {
    if (!toast) { return; }
    toast.classList.remove('is-visible');
    toast.setAttribute('aria-hidden', 'true');
    $('.toast__btn', toast).tabIndex = -1;
  }

  /* ---- Abrir / cerrar ---- */
  function open() {
    hideToast();
    lastFocus = document.activeElement;
    overlay.hidden = drawer.hidden = false;
    requestAnimationFrame(function () { document.documentElement.classList.add('cart-open'); });
    $$('[data-cart-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    $('.cart__close', drawer).focus();
  }
  function close() {
    document.documentElement.classList.remove('cart-open');
    $$('[data-cart-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    setTimeout(function () { overlay.hidden = drawer.hidden = true; }, 280);
    if (lastFocus) { lastFocus.focus(); }
  }

  /* ---- Eventos ---- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-add],[data-cart-open],[data-cart-close],[data-inc],[data-dec],[data-remove],[data-cart-clear]');
    if (!t) { return; }
    if (t.hasAttribute('data-add')) {
      var d = t.dataset, min = parseInt(d.min, 10) || 1, it = find(d.id);
      if (it) { it.qty += 1; } else { cart.push({ id: d.id, name: d.name, unit: d.unit, price: +d.price, min: min, qty: min }); }
      render();
      live.textContent = d.name + ' agregado al pedido.';
      showAdded(t, d.name);
      $$('.cart-count').forEach(function (c) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
      return;
    }
    if (t.hasAttribute('data-cart-open')) { open(); return; }
    if (t.hasAttribute('data-cart-close')) { close(); return; }
    if (t.hasAttribute('data-cart-clear')) { cart = []; render(); return; }
    var id = t.closest('.cart-item').dataset.id, cur = find(id);
    if (t.hasAttribute('data-inc')) { setQty(id, cur.qty + 1); }
    else if (t.hasAttribute('data-dec')) { setQty(id, cur.qty - 1); }
    else if (t.hasAttribute('data-remove')) { cart = cart.filter(function (x) { return x.id !== id; }); render(); }
  });

  list.addEventListener('change', function (e) {
    if (e.target.classList.contains('qty__input')) {
      setQty(e.target.closest('.cart-item').dataset.id, parseInt(e.target.value, 10));
    }
  });

  form.addEventListener('input', updateLink);
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  document.addEventListener('keydown', function (e) {
    if (drawer.hidden) { return; }
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') { // mantener el foco dentro del panel
      var f = $$('button:not([disabled]),a[href],input,textarea', drawer).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) { return; }
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Fecha mínima: hoy
  var d = new Date();
  form.elements.fecha.min = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  render();
})();
