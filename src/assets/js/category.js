/**
 * صفحة التصنيف — الميزة الثالثة: تصفية بالقامة لا بالخصائص العامة.
 *
 * الزائر يكتب قامته مرة، فيعرف التصنيف ما يناسبه. وحين يطلب «ما يناسبني فقط»
 * نخفي غير المطابق.
 *
 * ‼ قاعدة صارمة: لا نخفي بطاقة لا نملك بيانات مقاسها. الاخفاء يعني «هذا لا
 *   يناسبك» وهو ادعاء، فلا يُقال الا عن بطاقة قرأنا خياراتها فعلا. البطاقات
 *   مجهولة البيانات تبقى ظاهرة مع تنبيه بعددها.
 */
import { resolveFit } from './size-guide';
import { saveFit, loadFit, clearFit } from './fit';
import { ready } from './ready';
import { t, registerI18n } from './i18n';

function paintSummary(root, fit) {
  const out = root.querySelector('[data-rail-out]');
  if (!out) return;
  if (!fit) {
    out.hidden = true;
    return;
  }
  out.hidden = false;
  out.querySelector('[data-rail-label]').textContent = t('bisht.rail_summary', { length: fit.length, shoulder: fit.shoulder });
}

/**
 * ‼ العطل الذي امسكه الاختبار الحي: كنا نبحث عن ‎[data-bs-fit="1"]‎ وهي سمة
 *   تصميم قديم كان يزيّن بطاقات سلة. البطاقة التي يبنيها الثيم الان تضع
 *   ‎data-bs-ready‎، فكانت التصفية تجد صفر بطاقات ولا تخفي شيئا بلا اي خطأ.
 */
function cardNodes() {
  const own = document.querySelectorAll('custom-salla-product-card[data-bs-ready="1"]');
  return own.length ? [...own] : [...document.querySelectorAll('[data-bs-fit="1"]')];
}

function applyFilter(onlyMine) {
  const cards = cardNodes();
  let unknown = 0;
  cards.forEach((c) => {
    const wrap = c.closest('.s-products-list-inner > *, .swiper-slide') || c;
    const m = c.dataset.bsMatch;
    if (!m) {
      unknown += 1;
      wrap.hidden = false;
      return;
    }
    wrap.hidden = onlyMine && m === 'no';
  });
  const note = document.querySelector('[data-rail-unknown]');
  if (note) {
    note.hidden = !(onlyMine && unknown);
    if (unknown) note.textContent = t('bisht.rail_unknown_kept', { count: unknown });
  }
}

function mountRail(root) {
  const state = { height: null, build: 'normal', use: 'daily' };
  const saved = loadFit();
  if (saved) Object.assign(state, saved);

  const input = root.querySelector('[data-rail-height]');
  const toggle = root.querySelector('[data-rail-only]');

  const recompute = () => {
    const fit = resolveFit(state);
    if (fit) {
      saveFit({ ...state, length: fit.length, shoulder: fit.shoulder, row: fit.row });
      // البطاقات تعيد وسم نفسها على هذا الحدث
      document.dispatchEvent(new CustomEvent('bisht:fit', { detail: fit, bubbles: true }));
    }
    paintSummary(root, fit);
    if (toggle) applyFilter(toggle.checked);
  };

  if (input) {
    if (state.height) input.value = state.height;
    input.addEventListener('input', () => {
      state.height = input.value;
      recompute();
    });
  }

  root.querySelectorAll('[data-rail-group]').forEach((g) => {
    const want = state[g.dataset.railGroup];
    g.querySelectorAll('button[data-value]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.value === want))
    );
    g.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-value]');
      if (!b) return;
      g.querySelectorAll('button[data-value]').forEach((x) =>
        x.setAttribute('aria-pressed', String(x === b))
      );
      state[g.dataset.railGroup] = b.dataset.value;
      recompute();
    });
  });

  if (toggle) toggle.addEventListener('change', () => applyFilter(toggle.checked));

  const reset = root.querySelector('[data-rail-reset]');
  if (reset) {
    reset.addEventListener('click', () => {
      clearFit();
      state.height = null;
      if (input) input.value = '';
      if (toggle) toggle.checked = false;
      document.querySelectorAll('.bs-fitb').forEach((b) => b.remove());
      cardNodes().forEach((c) => {
        delete c.dataset.bsMatch;
        const wrap = c.closest('.s-products-list-inner > *, .swiper-slide') || c;
        wrap.hidden = false;
      });
      paintSummary(root, null);
    });
  }

  if (state.height) recompute();
}

ready(() => {
  registerI18n();
  document.querySelectorAll('[data-fit-rail]').forEach(mountRail);
});
