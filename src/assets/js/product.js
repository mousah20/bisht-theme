/**
 * صفحة المنتج — الميزة الاولى: ثلاثة اسئلة تختار المقاس بدل ان يخمّنه الزائر.
 *
 * ‼ الدرس: خيارات المقاس لا يبنيها الثيم بل ‎<salla-product-options>‎، فترندر
 *   متأخرة وقد تكون داخل shadow DOM. كودنا الاول كان يستهدف ‎.bs-sizes button‎
 *   وهي لا توجد على هذه الصفحة اصلا، فكانت الميزة صامتة لا معطلة.
 *   الحل: انتظار العنصر بـMutationObserver، والبحث عبر جذور الظل.
 */
import { mountSizeGuide } from './size-guide';
import { loadFit, optionMatchesFit, nearestOption } from './fit';
import { ready } from './ready';

/** يجمع العناصر من الصفحة وجذور الظل معا */
function deepQuery(selector, root = document, out = []) {
  root.querySelectorAll('*').forEach((el) => {
    if (el.matches && el.matches(selector)) out.push(el);
    if (el.shadowRoot) deepQuery(selector, el.shadowRoot, out);
  });
  return out;
}

/**
 * بيانات الخيارات كما ارسلها الخادم. المطابقة عليها اوثق من قراءة النص
 * المرئي، لان النص المرئي يضم السعر الاضافي و«نفدت الكمية» فيلتقط ارقاما
 * ليست مقاسا. نرجع قائمة {id, text} لنقر العنصر المطابق بمعرّفه.
 */
function serverOptions() {
  const tag = document.querySelector('script[data-bs-options]');
  if (!tag) return [];
  let raw;
  try {
    raw = JSON.parse(tag.textContent || '[]');
  } catch (e) {
    return [];
  }
  const out = [];
  (raw || []).forEach((o) => {
    (o.details || []).forEach((d) => {
      if (d && d.name && !d.is_out) out.push({ id: d.id, text: String(d.name) });
    });
  });
  return out;
}

/** ازرار او مدخلات الخيار مع نصها المرئي */
function optionNodes() {
  const nodes = deepQuery('label, button, .s-product-options-option-label, [data-option-value]');
  return nodes
    .map((el) => ({ el, text: (el.textContent || '').trim().replace(/\s+/g, ' ') }))
    .filter((o) => o.text && /\d{2,3}/.test(o.text) && o.text.length < 60);
}

function announce(msg, kind = 'ok') {
  const box = document.querySelector('[data-fit-applied]');
  if (!box) return;
  box.hidden = false;
  box.dataset.kind = kind;
  box.textContent = msg;
}

/** يطبّق المقاس على خيارات سلة، ويصرّح بما فعله بدل ان يفعله بصمت */
/** ينقر زر المقاس الذي يحمل هذا المعرّف. ازرارنا لا ازرار مكوّن خارجي. */
function clickById(id) {
  const btn =
    document.querySelector(`.bs-sizes__btn[data-id="${id}"]:not([disabled])`) ||
    deepQuery(`[value="${id}"], [data-id="${id}"]`)[0];
  if (btn) {
    btn.click();
    return true;
  }
  return false;
}

/** يمسك اختيار المقاس: يبرز الزر ويكتب القيمة في الحقل الذي ترسله السلة */
function bindSizeButtons() {
  document.querySelectorAll('.bs-sizes').forEach((group) => {
    group.addEventListener('click', (e) => {
      const b = e.target.closest('.bs-sizes__btn');
      if (!b || b.disabled) return;
      group.querySelectorAll('.bs-sizes__btn').forEach((x) =>
        x.setAttribute('aria-pressed', String(x === b))
      );
      const input = document.querySelector(`[data-option-input="${b.dataset.option}"]`);
      if (input) {
        input.value = b.dataset.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
}

function applyFit(fit) {
  if (!fit || !fit.length) return false;

  // المسار الاوثق: بيانات الخادم
  const srv = serverOptions();
  if (srv.length) {
    const hit = srv.find((o) => optionMatchesFit(o.text, fit));
    if (hit && clickById(hit.id)) {
      announce(`اخترنا مقاسك: طول ${fit.length} · كتف ${fit.shoulder}`);
      return true;
    }
    const i = nearestOption(srv.map((o) => o.text), fit);
    if (i > -1 && clickById(srv[i].id)) {
      announce(`لا يوجد مقاسك تماما — اخترنا الاقرب: ${srv[i].text}`, 'near');
      return true;
    }
    announce('مقاسك غير متاح في هذا البشت — الخياطة بالقياس تناسبك.', 'none');
    return false;
  }

  // المسار الاحتياطي: قراءة النص المرئي
  const opts = optionNodes();
  if (!opts.length) return false;

  const exact = opts.find((o) => optionMatchesFit(o.text, fit));
  if (exact) {
    exact.el.click();
    announce(`اخترنا مقاسك: طول ${fit.length} · كتف ${fit.shoulder}`);
    return true;
  }

  const i = nearestOption(opts.map((o) => o.text), fit);
  if (i > -1) {
    opts[i].el.click();
    announce(`لا يوجد مقاسك تماما — اخترنا الاقرب: ${opts[i].text}`, 'near');
    return true;
  }

  // لا نخمّن: نصرّح بان القياس خارج المتاح ونحوّل الى الخياطة بالقياس
  announce('مقاسك غير متاح في هذا البشت — الخياطة بالقياس تناسبك.', 'none');
  return false;
}

/** ‎salla-product-options‎ ترندر متأخرة، فننتظرها مرة واحدة */
function whenOptionsReady(cb) {
  if (optionNodes().length) {
    cb();
    return;
  }
  const host = document.querySelector('salla-product-options') || document.body;
  const ob = new MutationObserver(() => {
    if (optionNodes().length) {
      ob.disconnect();
      cb();
    }
  });
  ob.observe(host, { childList: true, subtree: true });
  // حد اعلى: لا نترك مراقبا معلقا لو لم يكن للمنتج خيارات
  setTimeout(() => ob.disconnect(), 12000);
}

ready(() => {
  bindSizeButtons();
  document.querySelectorAll('[data-size-guide]').forEach(mountSizeGuide);

  // نتيجة الحاسبة تُطبّق فورا
  document.addEventListener('bisht:fit', (e) => applyFit(e.detail));

  // زائر يعرف مقاسه من زيارة سابقة: نطبّقه قبل ان يسأل
  const saved = loadFit();
  if (saved && saved.length) {
    whenOptionsReady(() => applyFit(saved));
  }
});
