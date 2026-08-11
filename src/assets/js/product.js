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

/** يجمع العناصر من الصفحة وجذور الظل معا */
function deepQuery(selector, root = document, out = []) {
  root.querySelectorAll('*').forEach((el) => {
    if (el.matches && el.matches(selector)) out.push(el);
    if (el.shadowRoot) deepQuery(selector, el.shadowRoot, out);
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
function applyFit(fit) {
  if (!fit || !fit.length) return false;
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

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-size-guide]').forEach(mountSizeGuide);

  // نتيجة الحاسبة تُطبّق فورا
  document.addEventListener('bisht:fit', (e) => applyFit(e.detail));

  // زائر يعرف مقاسه من زيارة سابقة: نطبّقه قبل ان يسأل
  const saved = loadFit();
  if (saved && saved.length) {
    whenOptionsReady(() => applyFit(saved));
  }
});
