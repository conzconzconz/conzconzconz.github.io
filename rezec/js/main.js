/* ЧПУ-мастерская «Резец» — скрипты сайта */
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

  /* ---------- Материалы ---------- */
  // Тексты материалов меняются здесь
  var MATERIALS = [
    { name: 'Алюминий', text: 'Лёгкий и хорошо обрабатывается. Подходит для корпусов, кронштейнов, крышек, переходников и прототипов.', tags: ['корпуса', 'кронштейны', 'прототипы'] },
    { name: 'Сталь', text: 'Прочные детали, которые работают под нагрузкой: валы, оси, втулки, фланцы, крепёж и оснастка.', tags: ['валы', 'втулки', 'оснастка'] },
    { name: 'Нержавейка', text: 'Не боится влаги, улицы и пищевых сред. Для деталей пищевого и уличного оборудования, крепежа и фитингов.', tags: ['пищевое оборудование', 'улица', 'фитинги'] },
    { name: 'Латунь и бронза', text: 'Хорошо точатся, не ржавеют и красиво выглядят. Втулки скольжения, фитинги, электрические и декоративные детали.', tags: ['втулки скольжения', 'фитинги', 'декор'] },
    { name: 'Инженерные пластики', text: 'Капролон, фторопласт, полиацеталь: лёгкие детали с малым трением — шестерни, направляющие, ролики, изоляторы.', tags: ['шестерни', 'направляющие', 'изоляторы'] }
  ];
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var matCard = document.getElementById('mat-card');
  var matName = document.getElementById('mat-name');
  var matText = document.getElementById('mat-text');
  var matTags = document.getElementById('mat-tags');
  var matBtn = document.getElementById('mat-btn');
  function showMaterial(i) {
    var m = MATERIALS[i];
    chips.forEach(function (c, j) { c.classList.toggle('is-active', i === j); c.setAttribute('aria-selected', i === j ? 'true' : 'false'); });
    matName.textContent = m.name;
    matText.textContent = m.text;
    matTags.innerHTML = '';
    m.tags.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; matTags.appendChild(li); });
    matBtn.setAttribute('data-material', m.name);
    matCard.classList.remove('is-flash'); void matCard.offsetWidth; matCard.classList.add('is-flash');
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { showMaterial(+c.getAttribute('data-mat')); }); });

  /* ---------- Форма заявки ---------- */
  var form = document.getElementById('form');
  var msg = form.querySelector('.form__msg');
  var btn = form.querySelector('.form__btn');
  var phone = form.elements.phone;
  var service = form.elements.service;
  var material = form.elements.material;
  var picked = form.querySelector('.form__picked');
  var fileInput = form.elements.file;
  var fileBox = form.querySelector('.file');
  var fileName = form.querySelector('.file__name');
  var MAX_FILE = 10 * 1024 * 1024;

  form.elements.ts.value = String(Date.now());

  function selectOption(select, val) {
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].text === val) { select.selectedIndex = i; return true; }
    }
    return false;
  }
  function showPicked(text) {
    picked.textContent = 'Вы выбрали: ' + text;
    picked.hidden = false;
    picked.classList.remove('is-flash'); void picked.offsetWidth; picked.classList.add('is-flash');
  }
  // Кнопки «Отправить чертёж» в карточках услуг сразу заполняют форму
  document.querySelectorAll('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () {
      var val = a.getAttribute('data-service');
      if (selectOption(service, val)) showPicked(val);
    });
  });
  matBtn.addEventListener('click', function () {
    var val = matBtn.getAttribute('data-material');
    if (selectOption(material, val)) showPicked('материал — ' + val.toLowerCase());
  });
  service.addEventListener('change', function () { picked.hidden = true; });

  // Файл: показываем имя и проверяем размер
  function resetFile() {
    fileBox.classList.remove('is-set');
    fileName.textContent = 'Выбрать файл (до 10 МБ)';
  }
  fileInput.addEventListener('change', function () {
    var f = fileInput.files && fileInput.files[0];
    if (!f) { resetFile(); return; }
    if (f.size > MAX_FILE) {
      fileInput.value = '';
      resetFile();
      setMsg('Файл больше 10 МБ. Сожмите его в ZIP или пришлите в Telegram.', false);
      return;
    }
    fileBox.classList.add('is-set');
    fileName.textContent = f.name + ' · ' + (f.size / 1024 / 1024).toFixed(1) + ' МБ';
    setMsg('', true);
  });

  // Маска телефона: +7 (999) 123-45-67
  function formatPhone(value) {
    var d = value.replace(/\D/g, '');
    if (/^\s*\+7/.test(value)) d = d.slice(1);
    else if (d.length > 10 && (d.charAt(0) === '7' || d.charAt(0) === '8')) d = d.slice(1);
    if (d.length > 10 && d.charAt(0) === '7') d = d.slice(1);
    if (d.charAt(0) === '8') d = d.slice(1);
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
    var nameOk = form.elements.name.value.trim().length >= 2;
    var phoneOk = phone.value.replace(/\D/g, '').length === 11;
    var consentOk = form.elements.consent.checked;
    form.elements.name.closest('.field').classList.toggle('is-error', !nameOk);
    phone.closest('.field').classList.toggle('is-error', !phoneOk);
    form.querySelector('.consent').classList.toggle('is-error', !consentOk);
    if (!nameOk) { setMsg('Пожалуйста, укажите имя.', false); return false; }
    if (!phoneOk) { setMsg('Проверьте номер телефона.', false); return false; }
    if (!consentOk) { setMsg('Нужно согласие на обработку данных.', false); return false; }
    return true;
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
          resetFile();
          picked.hidden = true;
          form.elements.ts.value = String(Date.now());
          setMsg('Спасибо! Заявка и файл отправлены — посчитаем и свяжемся с вами в рабочее время.', true);
          if (typeof window.ym === 'function' && window.YM_ID) window.ym(window.YM_ID, 'reachGoal', 'order');
        } else {
          setMsg((data && data.message) || 'Не получилось отправить. Позвоните нам: +7 (342) 000-00-00', false);
        }
      })
      .catch(function () { setMsg('Нет связи с сервером. Позвоните нам: +7 (342) 000-00-00', false); })
      .then(function () { btn.disabled = false; btn.textContent = 'Отправить на расчёт'; });
  });

  // Если браузер отправил форму без JavaScript — показываем результат после возврата
  var params = new URLSearchParams(location.search);
  if (params.get('sent') === '1') setMsg('Спасибо! Заявка принята — скоро свяжемся.', true);
  if (params.get('sent') === '0') setMsg('Не получилось отправить. Позвоните нам: +7 (342) 000-00-00', false);

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
