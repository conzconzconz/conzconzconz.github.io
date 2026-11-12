/* Салон красоты «Лаванда» — скрипты сайта */
(function () {
  'use strict';

  /* ---------- Мобильное меню ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  function closeMenu() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Открыть меню'); }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Вкладки услуг ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); selectTab(tabs[(i + 1) % tabs.length], true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true); }
    });
  });

  /* ---------- Форма записи ---------- */
  var form = document.getElementById('form');
  var msg = form.querySelector('.form__msg');
  var btn = form.querySelector('.form__btn');
  var phone = form.elements.phone;
  var select = form.elements.service;

  form.elements.ts.value = String(Date.now());

  // Кнопки «Записаться на …» сразу выбирают услугу в форме
  document.querySelectorAll('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () {
      var val = a.getAttribute('data-service');
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].text.indexOf(val) === 0) { select.selectedIndex = i; break; }
      }
    });
  });

  // Маска телефона: +7 (999) 123-45-67
  function formatPhone(value) {
    // d — номер без кода страны (10 цифр)
    var d = value.replace(/\D/g, '');
    if (/^\s*\+7/.test(value)) d = d.slice(1);                                     // уже есть «+7»
    else if (d.length > 10 && (d.charAt(0) === '7' || d.charAt(0) === '8')) d = d.slice(1); // вставили 8900… или 7900…
    if (d.length > 10 && d.charAt(0) === '7') d = d.slice(1);                      // «+7» набрали ещё раз
    if (d.charAt(0) === '8') d = d.slice(1);                                       // по привычке начали с 8
    d = '7' + d.slice(0, 10);
    var out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ')';
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    return out;
  }
  phone.addEventListener('input', function () { phone.value = phone.value ? formatPhone(phone.value) : ''; });
  phone.addEventListener('focus', function () { if (!phone.value) phone.value = '+7 ('; });
  phone.addEventListener('blur', function () { if (phone.value.replace(/\D/g, '').length <= 1) phone.value = ''; });

  function setMsg(text, ok) {
    msg.textContent = text;
    msg.className = 'form__msg ' + (ok ? 'is-ok' : 'is-err');
  }

  function validate() {
    var ok = true;
    var nameField = form.elements.name.closest('.field');
    var phoneField = phone.closest('.field');
    var consent = form.querySelector('.consent');
    nameField.classList.toggle('is-error', form.elements.name.value.trim().length < 2);
    phoneField.classList.toggle('is-error', phone.value.replace(/\D/g, '').length !== 11);
    consent.classList.toggle('is-error', !form.elements.consent.checked);
    if (form.elements.name.value.trim().length < 2) { ok = false; setMsg('Пожалуйста, укажите имя.', false); }
    else if (phone.value.replace(/\D/g, '').length !== 11) { ok = false; setMsg('Проверьте номер телефона.', false); }
    else if (!form.elements.consent.checked) { ok = false; setMsg('Нужно согласие на обработку данных.', false); }
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    btn.disabled = true;
    btn.textContent = 'Отправляем…';
    setMsg('', true);

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (data) {
        if (data && data.ok) {
          form.reset();
          form.elements.ts.value = String(Date.now());
          setMsg('Спасибо! Заявка принята — мы перезвоним в течение 15 минут в рабочее время.', true);
          if (typeof window.ym === 'function' && window.YM_ID) window.ym(window.YM_ID, 'reachGoal', 'booking');
        } else {
          setMsg((data && data.message) || 'Не получилось отправить. Позвоните нам: +7 (342) 000-00-00', false);
        }
      })
      .catch(function () { setMsg('Нет связи с сервером. Позвоните нам: +7 (342) 000-00-00', false); })
      .then(function () { btn.disabled = false; btn.textContent = 'Записаться'; });
  });

  // Если браузер отправил форму без JavaScript — показываем результат после возврата
  var params = new URLSearchParams(location.search);
  if (params.get('sent') === '1') setMsg('Спасибо! Заявка принята — мы скоро перезвоним.', true);
  if (params.get('sent') === '0') setMsg('Не получилось отправить. Позвоните нам: +7 (342) 000-00-00', false);

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
