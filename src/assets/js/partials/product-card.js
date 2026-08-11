/**
 * بطاقة المنتج — الميزة الثانية: البطاقة تعرض بيانات الملاءمة، وتتغير بحسب الزائر.
 *
 * ‼ حمولة البطاقة عند سلة **لا تحمل ‎options‎** بل ‎has_options‎ فقط (تحققنا
 *   حيا من ‎salla.product.fetch‎). فمصدر المقاسات على البطاقة اثنان بالترتيب:
 *     ١ وسوم المنتج ‎tags‎ ان كتب فيها التاجر المقاسات ⇒ صفر نداء شبكة.
 *     ٢ تفاصيل المنتج تُجلب **عند ظهور البطاقة في الشاشة فقط** ومرة واحدة
 *       لكل منتج، فقائمة من عشرين بطاقة لا تُطلق عشرين نداء عند التحميل.
 * ثم نقارن بقياس الزائر المحفوظ:
 *   ــ طابق  ⇒ وسم «يناسب قامتك» ونطاق الطول والكتف.
 *   ــ لم يطابق وعندنا بياناته ⇒ وسم «مقاس اخر» بلا ادعاء.
 *   ــ لا بيانات خيارات ⇒ لا وسم اصلا. لا نكتب ما لا نعرفه.
 *
 * قرار مقصود: البطاقة لا تُخفى ابدا من هنا. الاخفاء قرار صفحة التصنيف
 * وحدها، وبطلب صريح من الزائر.
 */
import { loadFit, optionMatchesFit } from '../fit';
import { ready } from '../ready';

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

/** ذاكرة نداءات التفاصيل: منتج واحد لا يُجلب مرتين */
const detailsCache = new Map();

async function fetchSizeTexts(id) {
  if (detailsCache.has(id)) return detailsCache.get(id);
  const p = (async () => {
    try {
      if (!(window.salla && salla.product && salla.product.getDetails)) return [];
      const r = await salla.product.getDetails(id);
      const d = (r && (r.data || r)) || {};
      return sizeTexts(d);
    } catch (e) {
      return [];
    }
  })();
  detailsCache.set(id, p);
  return p;
}

/** يؤجّل الجلب الى ان تظهر البطاقة فعلا */
function whenVisible(el, cb) {
  if (!('IntersectionObserver' in window)) {
    cb();
    return;
  }
  const ob = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (en.isIntersecting) {
        ob.disconnect();
        cb();
      }
    });
  }, { rootMargin: '200px' });
  ob.observe(el);
}

function paint(card, texts) {
  if (!texts.length) return;
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
  host.appendChild(match ? badge('yes', 'يناسب قامتك') : badge('no', 'مقاس اخر'));
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

  // ١ الوسوم: بلا نداء شبكة
  const fromTags = (product.tags || [])
    .map((t) => (typeof t === 'string' ? t : t && t.name) || '')
    .filter((t) => /\d{2,3}\D+\d{2,3}/.test(t));
  if (fromTags.length) {
    paint(card, fromTags);
    return;
  }

  // ٢ التفاصيل: عند الظهور فقط، ولمنتج له خيارات اصلا
  if (!product.has_options || !product.id) return;
  whenVisible(card, async () => {
    const texts = await fetchSizeTexts(product.id);
    paint(card, texts);
  });
}

function scan() {
  document
    .querySelectorAll('custom-salla-product-card[product], salla-product-card[product]')
    .forEach(decorate);
}

ready(() => {
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
