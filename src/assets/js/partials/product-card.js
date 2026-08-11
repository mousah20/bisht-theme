/**
 * بطاقة المنتج — الميزة الثانية: البطاقة تعرض بيانات الملاءمة، وتتغير بحسب الزائر.
 *
 * سلة ترندر البطاقات بمكوّنها، وتمرّر المنتج كاملا في السمة ‎product‎.
 * فمنه نقرأ خيارات المقاس ونقارنها بقياس الزائر المحفوظ:
 *   ــ طابق  ⇒ وسم «يناسب قامتك» ونطاق الطول والكتف.
 *   ــ لم يطابق وعندنا بياناته ⇒ وسم «مقاس اخر» بلا ادعاء.
 *   ــ لا بيانات خيارات ⇒ لا وسم اصلا. لا نكتب ما لا نعرفه.
 *
 * قرار مقصود: البطاقة لا تُخفى ابدا من هنا. الاخفاء قرار صفحة التصنيف
 * وحدها، وبطلب صريح من الزائر.
 */
import { loadFit, optionMatchesFit } from '../fit';

const NUM = /(\d{2,3})/g;

/** كل نصوص خيارات المنتج التي فيها ارقام قياس */
function sizeTexts(product) {
  const out = [];
  const push = (v) => {
    if (typeof v === 'string' && NUM.test(v)) out.push(v);
  };
  (product.options || []).forEach((o) => {
    push(o.name);
    (o.values || o.details || []).forEach((v) => push(v.name || v.value || v.label));
  });
  // بعض الحمولات تضع المقاسات في ‎variants‎ لا ‎options‎
  (product.variants || []).forEach((v) => push(v.name || v.sku));
  return out.filter(Boolean);
}

/** نطاق الطول المتاح في هذا البشت — يُعرض للجميع لا لصاحب القياس وحده */
function lengthRange(texts) {
  const nums = texts
    .flatMap((t) => (String(t).match(NUM) || []).map(Number))
    .filter((n) => n >= 120 && n <= 200);
  if (!nums.length) return '';
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  return lo === hi ? `${lo}` : `${lo} — ${hi}`;
}

function badge(kind, text) {
  const el = document.createElement('div');
  el.className = `bs-fitb bs-fitb--${kind}`;
  el.textContent = text;
  return el;
}

function decorate(card) {
  if (card.dataset.bsFit === '1') return;
  let product;
  try {
    product = JSON.parse(card.getAttribute('product') || 'null');
  } catch (e) {
    product = null;
  }
  if (!product) return;
  card.dataset.bsFit = '1';

  const texts = sizeTexts(product);
  if (!texts.length) return; // لا بيانات ⇒ لا وسم

  const host =
    card.querySelector('.s-product-card-content') ||
    (card.shadowRoot && card.shadowRoot.querySelector('.s-product-card-content')) ||
    card;

  const range = lengthRange(texts);
  if (range) host.appendChild(badge('range', `طول ${range}`));

  const fit = loadFit();
  if (!fit || !fit.length) return;

  const match = texts.some((t) => optionMatchesFit(t, fit));
  card.dataset.bsMatch = match ? 'yes' : 'no';
  host.appendChild(
    match ? badge('yes', 'يناسب قامتك') : badge('no', 'مقاس اخر')
  );
}

function scan() {
  document
    .querySelectorAll('custom-salla-product-card[product], salla-product-card[product]')
    .forEach(decorate);
}

document.addEventListener('DOMContentLoaded', () => {
  scan();
  // البطاقات ترندر بعد نداء الشبكة، والقوائم تُحمّل عند التمرير
  const ob = new MutationObserver(scan);
  ob.observe(document.body, { childList: true, subtree: true });

  // نتيجة الحاسبة تُعيد وسم البطاقات المعروضة حالا
  document.addEventListener('bisht:fit', () => {
    document.querySelectorAll('[data-bs-fit="1"]').forEach((c) => {
      c.querySelectorAll('.bs-fitb').forEach((b) => b.remove());
      delete c.dataset.bsFit;
    });
    scan();
  });
});
