/**
 * بطاقة المنتج — الميزة الثانية: البطاقة تعرض بيانات الملاءمة وتتغير بحسب الزائر.
 *
 * ‼ درسان كلّفانا وقتا:
 *   ١ ‎salla-products-list‎ تجلب المنتجات فعلا (رصدنا 200 على
 *     ‎/store/v1/products?source=latest‎) ثم ترندر صفرا اذا لم يسجّل الثيم
 *     ‎custom-salla-product-card‎. البطاقة مسؤولية الثيم لا سلة، وغيابها يظهر
 *     كقائمة فارغة بلا خطأ واحد في وحدة التحكم.
 *   ٢ حمولة البطاقة لا تحمل ‎options‎ بل ‎has_options‎ فقط. فمصدر المقاسات:
 *     وسوم المنتج ان كتبها التاجر، والا حمولة القائمة نفسها ان حملت خيارات.
 *     ‼ لا نداء شبكة من البطاقة ابدا: ‎getDetails‎ لكل بطاقة يبطئ التصنيفات
 *       والبحث (شرط مراجعة سلة)، وهو مسموح في صفحة المنتج والـquick view فقط.
 *
 * ثم نقارن بقياس الزائر المحفوظ:
 *   ــ طابق ⇒ «يناسب قامتك». لم يطابق وعندنا بياناته ⇒ «مقاس اخر» بلا ادعاء.
 *   ــ لا بيانات ⇒ لا وسم اصلا. لا نكتب ما لا نعرفه.
 *
 * قرار مقصود: البطاقة لا تُخفى من هنا ابدا. الاخفاء قرار صفحة التصنيف وحدها
 * وبطلب صريح من الزائر. ونحتفظ باصناف سلة ‎s-product-card-*‎ لان
 * ‎salla-add-product-button‎ تعتمدها.
 */
import { loadFit, optionMatchesFit, toAscii } from '../fit';
import { ready } from '../ready';
import { t, registerI18n } from '../i18n';

const NUM = /(\d{2,3})/g;

/** كل نصوص خيارات المنتج التي فيها ارقام قياس */
function sizeTexts(product) {
  const out = [];
  const push = (v) => {
    if (typeof v === 'string' && NUM.test(toAscii(v))) out.push(v);
  };
  (product.options || []).forEach((o) => {
    push(o.name);
    (o.values || o.details || []).forEach((v) => push(v.name || v.value || v.label));
  });
  return out.filter(Boolean);
}

/** نطاق الطول المتاح — بيان يراه الجميع لا صاحب القياس وحده */
function lengthRange(texts) {
  const nums = texts
    .flatMap((t) => (toAscii(t).match(NUM) || []).map(Number))
    .filter((n) => n >= 120 && n <= 200);
  if (!nums.length) return '';
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  return lo === hi ? `${lo}` : `${lo} — ${hi}`;
}

const money = (v) => (window.salla && salla.money ? salla.money(v) : v);

class BishtProductCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.bsReady === '1') return;
    try {
      this.product = this.product || JSON.parse(this.getAttribute('product') || 'null');
    } catch (e) {
      this.product = null;
    }
    if (!this.product) return;
    this.dataset.bsReady = '1';
    this.render();
    this.markFit();
  }

  render() {
    const p = this.product;
    const img = p.image && (p.image.url || p.image) ? p.image.url || p.image : '';
    const out = p.is_out_of_stock || p.quantity === 0;

    const price = p.is_on_sale
      ? `<span class="s-product-card-sale-price">${money(p.sale_price)}</span>
         <s class="s-product-card-full-price">${money(p.regular_price)}</s>`
      : `<span class="s-product-card-price">${money(p.price)}</span>`;

    this.innerHTML = `
      <div class="s-product-card-entry bs-pcard${out ? ' is-out' : ''}">
        <a class="s-product-card-image bs-pcard__media" href="${p.url}" aria-label="${p.name}">
          ${img ? `<img src="${img}" alt="${p.name}" loading="lazy">` : ''}
          ${out ? `<div class="s-product-card-out-of-stock">${t('pages.products.out_of_stock')}</div>` : ''}
        </a>
        <div class="s-product-card-content bs-pcard__body">
          <h3 class="s-product-card-content-title"><a href="${p.url}">${p.name}</a></h3>
          <div class="bs-pcard__price">${price}</div>
          <div class="s-product-card-content-footer bs-pcard__foot">
            <salla-add-product-button
              product-id="${p.id}"
              product-status="${p.status || ''}"
              product-type="${p.type || ''}"
              ${p.has_options ? 'is-details' : ''}>
            </salla-add-product-button>
          </div>
        </div>
      </div>`;
  }

  badge(kind, text) {
    const el = document.createElement('div');
    el.className = `bs-fitb bs-fitb--${kind}`;
    el.textContent = text;
    return el;
  }

  paint(texts) {
    if (!texts.length) return;
    const host = this.querySelector('.s-product-card-content') || this;
    this.querySelectorAll('.bs-fitb').forEach((b) => b.remove());

    const range = lengthRange(texts);
    if (range) host.appendChild(this.badge('range', t('bisht.card_length', { range })));

    const fit = loadFit();
    if (!fit || !fit.length) return;

    const match = texts.some((x) => optionMatchesFit(x, fit));
    this.dataset.bsMatch = match ? 'yes' : 'no';
    host.appendChild(match ? this.badge('yes', t('bisht.card_fits')) : this.badge('no', t('bisht.card_other_size')));
  }

  markFit() {
    const p = this.product;

    // ١ الوسوم: بلا نداء شبكة
    const fromTags = (p.tags || [])
      .map((t) => (typeof t === 'string' ? t : t && t.name) || '')
      .filter((t) => /\d{2,3}\D+\d{2,3}/.test(toAscii(t)));
    if (fromTags.length) {
      this.paint(fromTags);
      return;
    }

    // ٢ حمولة القائمة نفسها ان حملت خيارات — ولا نداء شبكة من البطاقة
    const fromPayload = sizeTexts(p);
    if (fromPayload.length) this.paint(fromPayload);
  }
}

if (!customElements.get('custom-salla-product-card')) {
  customElements.define('custom-salla-product-card', BishtProductCard);
}

ready(() => {
  registerI18n();
  // نتيجة الحاسبة تُعيد وسم البطاقات المعروضة حالا
  document.addEventListener('bisht:fit', () => {
    document.querySelectorAll('custom-salla-product-card[data-bs-ready="1"]').forEach((c) => {
      if (c.markFit) c.markFit();
    });
  });
});
