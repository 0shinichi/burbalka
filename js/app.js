// Бурбалка — конструктор напитка, корзина, карта «7 пузырьков». Без библиотек.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = n => n.toFixed(2).replace('.', ',') + ' BYN';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return n + ' ' + (m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c); };
  const PLUS = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

  // ---------- Данные
  const HITS = [
    { id: 'taro', name: 'Таро-молоко', desc: 'фиолетовый батат, молоко, тапиока · 500 мл', price: 9.9, img: 'cup-taro', bg: 'var(--plum-soft)', kind: 'milk' },
    { id: 'strawberry', name: 'Клубничное облачко', desc: 'молочный чай, клубника, попинг-боба · 500 мл', price: 10.5, img: 'cup-strawberry', bg: 'var(--pink-soft)', kind: 'milk', isNew: true },
    { id: 'mango', name: 'Манго-маракуйя', desc: 'зелёный чай, манго, кокосовое желе · 500 мл', price: 10.9, img: 'cup-mango', bg: 'var(--peach-soft)', kind: 'fruit' },
    { id: 'matcha', name: 'Матча-латте', desc: 'японская матча, молоко, тапиока · 500 мл', price: 11.5, img: 'cup-matcha', bg: 'var(--mint-soft)', kind: 'milk' },
    { id: 'lingonberry', name: 'Брусника-лайм', desc: 'улун, брусника, лайм, попинг-боба · 500 мл', price: 9.5, img: 'cup-lingonberry', bg: 'var(--pink-soft)', kind: 'fruit', isNew: true },
    { id: 'classic', name: 'Классика', desc: 'чёрный чай, молоко, тапиока · 500 мл', price: 8.9, img: 'cup-classic', bg: 'var(--peach-soft)', kind: 'milk' },
    { id: 'peach', name: 'Персиковый улун', desc: 'улун, персик, желе · 500 мл', price: 9.9, img: 'cup-peach', bg: 'var(--peach-soft)', kind: 'fruit' },
    { id: 'coconut', name: 'Кокосовое облако', desc: 'кокосовое молоко, сырная пенка · 500 мл', price: 10.9, img: 'cup-coconut', bg: 'var(--mint-soft)', kind: 'milk' },
  ];
  const byId = Object.fromEntries(HITS.map(h => [h.id, h]));
  const B = {
    base: [{ id: 'milk', name: 'Молочный чай', price: 7.9, of: 'на молочном чае' }, { id: 'fruit', name: 'Фруктовый чай', price: 7.5, of: 'на фруктовом чае' }, { id: 'matcha', name: 'Матча', price: 8.9, of: 'на матче' }, { id: 'coconut', name: 'Кокосовое молоко', price: 8.5, of: 'на кокосовом молоке' }],
    flavor: [{ id: 'taro', name: 'Таро', price: 1.5, color: '#D8C2EC' }, { id: 'strawberry', name: 'Клубника', price: 1, color: '#FFC2D6' }, { id: 'mango', name: 'Манго', price: 1, color: '#FFD08A' }, { id: 'lingonberry', name: 'Брусника', price: 1, color: '#F2A0B8' }, { id: 'peach', name: 'Персик', price: 1, color: '#FFC6A8' }, { id: 'caramel', name: 'Карамель', price: 1, color: '#E9C9A8' }],
    top: [{ id: 'tapioca', name: 'Тапиока', price: 1 }, { id: 'popping', name: 'Попинг-боба', price: 1 }, { id: 'jelly', name: 'Кокосовое желе', price: 0.8 }, { id: 'cheese', name: 'Сырная пенка', price: 1.5 }, { id: 'pudding', name: 'Пудинг', price: 1.2 }],
    sweet: ['0%', '25%', '50%', '100%'],
    ice: ['Без льда', 'Мало', 'Нормально'],
    size: [{ id: '500', name: '500 мл', price: 0 }, { id: '700', name: '700 мл', price: 2 }],
  };
  const pick = (k, id) => B[k].find(x => x.id === id);

  // ---------- Хранилище
  const mem = {};
  const store = {
    get(k, d) { try { const v = localStorage.getItem('burbalka.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return k in mem ? mem[k] : d; } },
    set(k, v) { mem[k] = v; try { localStorage.setItem('burbalka.' + k, JSON.stringify(v)); } catch (e) { /* приватный режим */ } },
  };

  // ---------- Часы работы: каждый день 10–22
  const OPEN = 10, CLOSE = 22;
  const isOpen = (d = new Date()) => d.getHours() >= OPEN && d.getHours() < CLOSE;
  const pad = n => String(n).padStart(2, '0');
  function slots() {
    const now = new Date(), out = [];
    let t = new Date(now), prefix = '';
    if (!isOpen(now) || now.getHours() * 60 + now.getMinutes() > CLOSE * 60 - 30) {
      if (now.getHours() >= OPEN) { t.setDate(t.getDate() + 1); prefix = 'завтра '; }
      t.setHours(OPEN, 15, 0, 0);
    } else { out.push({ v: 'asap', l: 'Как можно скорее' }); t = new Date(now.getTime() + 15 * 60000); t.setMinutes(Math.ceil(t.getMinutes() / 15) * 15, 0, 0); }
    for (let i = 0; out.length < 4 && i < 10; i++) { if (t.getHours() < CLOSE) out.push({ v: t.toISOString(), l: prefix + t.getHours() + ':' + pad(t.getMinutes()) }); t = new Date(t.getTime() + 15 * 60000); }
    return out;
  }
  const slotLabel = v => !v || v === 'asap' ? 'через 5 минут' : (d => d.getHours() + ':' + pad(d.getMinutes()))(new Date(v));

  // ---------- Ризо-стакан в SVG (тот же рисунок, что в макете)
  let uid = 0;
  function cupSVG(r, cls = 'cup') {
    const id = 'riso' + (++uid);
    const f = `filter="url(#${id})"`;
    const base = r.base || 'milk', fl = pick('flavor', r.flavor) || B.flavor[1], tops = r.tops || [];
    const fill = r.size === '700' ? .82 : .72;
    const y0 = 210 - 140 * fill, x0 = 40 + 14 * (1 - fill), w0 = 120 - 28 * (1 - fill);
    const liquid = base === 'matcha' ? '#B9E3C6' : base === 'coconut' ? '#F3EEE6' : fl.color;
    const syrup = (base === 'matcha' || base === 'coconut') ? `<g ${f}><path d="M58 182h84l-4 28H62z" fill="${fl.color}"/></g>` : '';
    const foam = tops.includes('cheese') ? `<g ${f}><path d="M${x0} ${y0}h${w0}l-4 30H${x0 + 4}z" fill="#FFFFFF"/></g>` : base === 'milk' ? `<g ${f}><path d="M${x0} ${y0}h${w0}l-3 22H${x0 + 3}z" fill="#FFF6F2"/></g>` : '';
    const P = [[80, 196], [100, 200], [120, 197], [140, 194], [90, 182], [128, 181], [110, 186], [70, 188], [150, 182]];
    const pearls = tops.includes('tapioca') ? `<g ${f} style="mix-blend-mode:multiply" fill="#8E6A8E">${P.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5"/>`).join('')}</g>` : '';
    const pops = tops.includes('popping') ? `<g ${f} fill="#FF6F9F">${[[72, 166], [148, 164], [106, 160], [128, 170]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"/>`).join('')}</g>` : '';
    const jelly = tops.includes('jelly') ? `<g ${f} fill="#FFFFFF" opacity=".8">${[[72, 140, 18], [112, 132, -12], [138, 150, 30]].map(([x, y, a]) => `<rect x="${x}" y="${y}" width="16" height="16" rx="3" transform="rotate(${a} ${x + 8} ${y + 8})"/>`).join('')}</g>` : '';
    const pudding = tops.includes('pudding') ? `<g ${f}><path d="M66 172h68l-3 18H69z" fill="#FFD7A8"/></g>` : '';
    const ice = r.ice === 'Без льда' ? '' : `<g ${f} fill="#FFFFFF" opacity=".55">${(r.ice === 'Мало' ? [[64, 112]] : [[64, 112], [118, 104], [92, 128]]).map(([x, y]) => `<rect x="${x}" y="${y}" width="22" height="22" rx="5"/>`).join('')}</g>`;
    return `<svg class="${cls}" viewBox="-20 0 240 240" role="img" aria-label="Стакан с напитком">
      <defs><filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="1" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.7 1.12" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter></defs>
      <g ${f}><path d="M40 70h120l-14 140H54z" fill="#9ED9C3" opacity=".45"/></g>
      <g ${f}><path class="liquid" d="M${x0} ${y0}h${w0}l-${14 * fill} ${140 * fill}H54z" fill="${liquid}"/></g>
      ${syrup}${foam}${ice}${jelly}${pudding}${pearls}${pops}
      <g ${f}><rect x="112" y="10" width="14" height="120" rx="7" fill="#FFD7A8" transform="rotate(12 119 70)"/></g>
      <g ${f}><path d="M34 62q66-30 132 0v10H34z" fill="#9ED9C3"/></g></svg>`;
  }

  // ---------- Корзина
  let cart = store.get('cart', []);
  const count = () => cart.reduce((s, l) => s + l.qty, 0);
  const total = () => cart.reduce((s, l) => s + l.price * l.qty, 0);
  function save() { cart = cart.filter(l => l.qty > 0); store.set('cart', cart); renderCount(); renderCart(); }
  function add(line) {
    const ex = cart.find(l => l.key === line.key); if (ex) ex.qty += line.qty || 1; else cart.push({ ...line, qty: line.qty || 1 });
    save(); toast(`Бурба прыгает в стакан: ${line.name}`);
    $$('.js-count').forEach(c => { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
  }
  function renderCount() { const n = count(); $$('.js-count').forEach(c => { c.textContent = n || ''; c.toggleAttribute('data-zero', !n); }); }

  let tt;
  function toast(text) {
    let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = `<img src="img/pose-jump.webp" alt=""><span>${esc(text)}</span>${$('#cart') ? '' : '<a href="cart.html">Корзина</a>'}`;
    requestAnimationFrame(() => t.classList.add('is-visible')); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('is-visible'), 2800);
  }

  // ---------- Шапка, мобильное меню, статус
  function initHeader() {
    const open = isOpen();
    $$('.js-open').forEach(b => { b.textContent = open ? `Открыто до ${CLOSE}:00` : `Бурба спит до ${OPEN}:00`; });
    $$('.js-open-full').forEach(b => { b.textContent = open ? `Открыто до ${CLOSE}:00 · 2 точки в Гродно` : `Бурба спит до ${OPEN}:00 — предзаказ уже работает`; });
    const hero = $('#hero-burba'); if (hero && !open) { hero.src = 'img/pose-sleep.webp'; hero.alt = 'Бурба спит в стакане'; }
    const nav = $('#mnav');
    $$('.js-burger').forEach(b => b.addEventListener('click', () => { nav.classList.add('is-open'); nav.setAttribute('aria-hidden', 'false'); }));
    $$('.js-close, #mnav a').forEach(b => b.addEventListener('click', () => { nav.classList.remove('is-open'); nav.setAttribute('aria-hidden', 'true'); }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav) { nav.classList.remove('is-open'); nav.setAttribute('aria-hidden', 'true'); } });
  }
  function initHero() {
    const b = $('#hero-burba'); if (!b) return;
    b.addEventListener('click', () => { b.classList.remove('is-squish'); void b.offsetWidth; b.classList.add('is-squish'); });
    const box = $('.bubbles'); if (box && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const cols = ['#FF8FB5', '#9ED9C3', '#FFD7A8', '#8E6A8E'];
      box.innerHTML = Array.from({ length: 14 }, (_, i) => `<i style="left:${Math.random() * 100}%;--s:${8 + Math.random() * 22}px;--c:${cols[i % 4]};--d:${7 + Math.random() * 7}s;--dl:-${Math.random() * 10}s"></i>`).join('');
    }
  }

  // ---------- Конструктор
  function initBuilder() {
    const root = $('#builder'); if (!root) return;
    const st = { base: 'milk', flavor: 'strawberry', tops: ['tapioca', 'popping'], sweet: '50%', ice: 'Нормально', size: '500' };
    const chips = (key, list, multi) => list.map(o => { const id = typeof o === 'string' ? o : o.id, name = typeof o === 'string' ? o : o.name, add = o.price && key !== 'base' ? ` <small class="muted">+${o.price.toFixed(2).replace('.', ',')}</small>` : ''; return `<button type="button" class="chip" role="${multi ? 'checkbox' : 'radio'}" data-k="${key}" data-v="${id}">${name}${add}</button>`; }).join('');
    $('#b-base').innerHTML = chips('base', B.base); $('#b-flavor').innerHTML = chips('flavor', B.flavor); $('#b-top').innerHTML = chips('tops', B.top, true);
    $('#b-sweet').innerHTML = chips('sweet', B.sweet); $('#b-ice').innerHTML = chips('ice', B.ice); $('#b-size').innerHTML = chips('size', B.size);
    const price = () => pick('base', st.base).price + pick('flavor', st.flavor).price + st.tops.reduce((s, t) => s + pick('top', t).price, 0) + pick('size', st.size).price;
    const title = () => `${pick('flavor', st.flavor).name} ${pick('base', st.base).of}`;
    const opts = () => [st.tops.length ? st.tops.map(t => pick('top', t).name.toLowerCase()).join(' + ') : 'без топпингов', 'сладость ' + st.sweet, st.ice.toLowerCase(), st.size + ' мл'].join(' · ');
    function render(shake) {
      $$('[data-k]', root).forEach(b => { const k = b.dataset.k, v = b.dataset.v; const on = k === 'tops' ? st.tops.includes(v) : st[k] === v; b.setAttribute('aria-checked', on); b.disabled = k === 'tops' && !on && st.tops.length >= 3; });
      $('#b-cup').innerHTML = cupSVG(st);
      if (shake) { const c = $('#b-cup svg'); c.classList.add('is-shake'); }
      $('#b-title').textContent = title(); $('#b-opts').textContent = opts();
      $('#b-add').textContent = `В корзину · ${money(price())}`;
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-k]'); if (!b) return;
      const k = b.dataset.k, v = b.dataset.v;
      if (k === 'tops') st.tops = st.tops.includes(v) ? st.tops.filter(x => x !== v) : st.tops.length < 3 ? [...st.tops, v] : st.tops;
      else st[k] = v;
      render(true);
    });
    $('#b-add').addEventListener('click', () => add({ key: 'custom:' + JSON.stringify(st), name: title(), opts: opts(), price: price(), recipe: { ...st, tops: [...st.tops] } }));
    render();
  }

  // ---------- Хиты
  function initHits() {
    const box = $('#hits-list'); if (!box) return;
    box.innerHTML = HITS.map(h => `<article class="card reveal" data-kind="${h.kind}" data-new="${!!h.isNew}">
      <div class="card__art" style="--bg:${h.bg}"><img src="img/${h.img}.webp" alt="${esc(h.name)}" width="200" height="200" loading="lazy"></div>
      ${h.isNew ? '<span class="tag">новинка</span>' : ''}
      <div class="card__body"><h3 class="h3">${esc(h.name)}</h3><p class="small muted">${esc(h.desc)}</p>
      <div class="card__foot"><span class="price">${money(h.price)}</span><button class="plus" type="button" data-hit="${h.id}" aria-label="Добавить: ${esc(h.name)}">${PLUS}</button></div></div></article>`).join('');
    $$('#hit-filters .chip').forEach(c => c.addEventListener('click', () => {
      $$('#hit-filters .chip').forEach(x => x.setAttribute('aria-pressed', x === c)); const f = c.dataset.f;
      $$('#hits-list .card').forEach(card => { card.hidden = !(f === 'all' || card.dataset.kind === f || (f === 'new' && card.dataset.new === 'true')); });
    }));
  }
  document.addEventListener('click', e => {
    const h = e.target.closest('[data-hit]'); if (h) { const d = byId[h.dataset.hit]; add({ key: 'hit:' + d.id, name: d.name, opts: d.desc, price: d.price, img: d.img, bg: d.bg }); return; }
    const s = e.target.closest('[data-step]'); if (s) { const l = cart[+s.dataset.i]; if (l) { l.qty = Math.max(0, l.qty + +s.dataset.step); save(); } return; }
    const r = e.target.closest('.js-radio [role="radio"]'); if (r) { $$('[role="radio"]', r.parentElement).forEach(x => x.setAttribute('aria-checked', x === r)); if (r.dataset.slot) store.set('time', r.dataset.slot); if (r.dataset.place) store.set('place', r.dataset.place); }
  });
  document.addEventListener('input', e => { const fl = e.target.closest && e.target.closest('.field.is-invalid'); if (fl) fl.classList.remove('is-invalid'); });

  // ---------- Карта «7 пузырьков»
  function stampsHTML(n, fresh = 0) { return Array.from({ length: 7 }, (_, i) => `<span class="${i < n ? 'on' : ''} ${i < n && i >= n - fresh ? 'new' : ''}" style="--d:${(i - (n - fresh)) * .15}s"></span>`).join(''); }
  function initStamps() { const s = $('#stamps'); if (s) { const n = store.get('stamps', 4); s.innerHTML = stampsHTML(n); const c = $('#stamps-count'); if (c) c.textContent = `${n} из 7`; } }

  // ---------- Страница корзины
  function renderCart() {
    const box = $('#cart'); if (!box) return;
    const n = count();
    $('#cart-empty').hidden = !!n; box.hidden = !n;
    if (!n) return;
    $('#lines').innerHTML = cart.map((l, i) => `<div class="line"><div class="line__thumb" style="--bg:${l.bg || 'var(--pink-soft)'}">${l.recipe ? cupSVG(l.recipe, 'mini') : `<img src="img/${l.img}.webp" alt="">`}</div>
      <div class="line__info"><b>${esc(l.name)}</b><span class="small muted">${esc(l.opts)}</span><span class="small"><b>${money(l.price * l.qty)}</b></span></div>
      <div class="stepper"><button type="button" data-step="-1" data-i="${i}" aria-label="Убрать один">−</button><span>${l.qty}</span><button type="button" data-step="1" data-i="${i}" aria-label="Ещё один">+</button></div></div>`).join('');
    const sum = money(total()); $$('.js-total').forEach(e => e.textContent = sum);
    const st = store.get('stamps', 4); $('#k-stamps').textContent = `+${n} → ${Math.min(7, st + n)} из 7`;
    $('#pay').textContent = `Оплатить ${sum}`;
  }
  function initCart() {
    const form = $('#cart'); if (!form) return;
    const sl = slots(); const saved = store.get('time', null); const cur = sl.some(s => s.v === saved) ? saved : sl[0].v; store.set('time', cur);
    $('#slots').innerHTML = sl.map(s => `<button type="button" class="chip" role="radio" data-slot="${s.v}" aria-checked="${s.v === cur}">${s.l}</button>`).join('');
    const place = store.get('place', 'center'); $$('[data-place]').forEach(b => b.setAttribute('aria-checked', b.dataset.place === place));
    const f = form.elements; const g = store.get('guest', {}); if (g.name) f['name'].value = g.name; if (g.phone) f['phone'].value = g.phone;
    f['phone'].addEventListener('input', () => { const d = f['phone'].value.replace(/\D/g, '').replace(/^375/, '').slice(0, 9); let s = '+375'; if (d.length) s += ' ' + d.slice(0, 2); if (d.length > 2) s += ' ' + d.slice(2, 5); if (d.length > 5) s += '-' + d.slice(5, 7); if (d.length > 7) s += '-' + d.slice(7, 9); f['phone'].value = s; });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = f['name'].value.trim(), ok = f['phone'].value.replace(/\D/g, '').length === 12;
      f['name'].closest('.field').classList.toggle('is-invalid', !name); f['phone'].closest('.field').classList.toggle('is-invalid', !ok);
      if (!name || !ok) { (name ? f['phone'] : f['name']).focus(); return; }
      store.set('guest', { name, phone: f['phone'].value });
      const cups = count(); let stamps = store.get('stamps', 4) + cups; let gift = false; if (stamps >= 7) { gift = true; stamps -= 7; }
      store.set('order', { no: String(100 + Math.floor(Math.random() * 900)), name, time: store.get('time', 'asap'), place: store.get('place', 'center'), total: total(), cups, gift, stamps, prev: store.get('stamps', 4) });
      store.set('stamps', stamps); cart = []; save(); location.href = 'done.html';
    });
    renderCart();
  }

  // ---------- Заказ готовится
  function initDone() {
    if (!$('#done')) return;
    const o = store.get('order', null);
    if (!o) { $('#d-title').textContent = 'Тут пока пусто'; $('#d-text').textContent = 'Собери напиток — и Бурба запрыгнет в стакан.'; $('#progress').hidden = true; $('#d-stamps').hidden = true; $('#d-img').src = 'img/pose-sad.webp'; return; }
    const place = o.place === 'trinity' ? 'в «Тринити», 2 этаж' : 'на Советской, 18';
    $('#d-text').textContent = `Заказ № ${o.no} будет готов ${o.time === 'asap' ? 'через 5 минут' : 'к ' + slotLabel(o.time)} ${place}. Стакан подпишем: «${o.name}».`;
    $('#d-stamps-list').innerHTML = stampsHTML(o.gift ? 7 : o.stamps, o.gift ? 7 - o.prev : o.cups);
    $('#d-stamps-count').textContent = o.gift ? 'седьмой — в подарок! Карта начнётся заново' : `${o.stamps} из 7 — ещё ${7 - o.stamps}, и Бурба угостит`;
    const items = $$('#progress li'); let i = 1; const tick = () => items.forEach((li, j) => { li.classList.toggle('is-done', j < i); li.classList.toggle('is-now', j === i); });
    tick(); setTimeout(() => { i = 2; tick(); $('#d-title').textContent = 'Готово — забирай!'; $('#d-img').src = 'img/pose-wow.webp'; }, 9000);
  }

  // ---------- Появление
  function initReveal() {
    const els = $$('.reveal'); if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeader(); initHero(); initBuilder(); initHits(); initStamps(); initCart(); initDone(); renderCount(); initReveal();
  });
})();
