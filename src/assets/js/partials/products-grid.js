/**
 * شبكة المنتجات — يبنيها الثيم.
 *
 * ‼ لماذا لا نستعمل ‎salla-products-list‎:
 *   جرّبناه حيا فلم يرندر شيئا ولم يُطلق نداء واحدا ولم يرمِ خطأ. وضعنا مقبضا
 *   على ‎salla.product.api.fetch‎ فما وصلته اي نداء، فالمكوّن لا يتحلّل في هذه
 *   البيئة اصلا (وينطبق ذلك على ‎salla-product-options‎ و‎salla-filters‎ كذلك).
 *   والبيانات سليمة تماما: ‎salla.product.fetch‎ يرجع المنتجات فورا.
 *   فبنينا الشبكة على البيانات لا على المكوّن — وما نبنيه نقدر ان نتحقق منه.
 *
 * الاستعمال في Twig:
 *   <bisht-products source="latest" limit="4"></bisht-products>
 *   <bisht-products source="categories" source-value="[12,13]"></bisht-products>
 */
import { ready } from '../ready';

const SKELETON = 4;

class BishtProducts extends HTMLElement {
  connectedCallback() {
    if (this.dataset.bsDone === '1') return;
    this.dataset.bsDone = '1';
    this.classList.add('bs-pgrid');
    this.paintSkeleton();
    ready(() => this.load());
  }

  paintSkeleton() {
    const n = Math.min(Number(this.getAttribute('limit')) || SKELETON, 8);
    this.innerHTML = Array.from({ length: n }, () => '<div class="bs-pgrid__ghost"></div>').join('');
  }

  /** ‎source-value‎ يقبل «[1,2]» او «12» او نصا (البحث) */
  parseValue() {
    const raw = this.getAttribute('source-value');
    if (raw == null || raw === '') return undefined;
    const t = raw.trim();
    if (t.startsWith('[')) {
      try {
        return JSON.parse(t);
      } catch (e) {
        return undefined;
      }
    }
    return /^\d+$/.test(t) ? [Number(t)] : t;
  }

  async load() {
    const source = this.getAttribute('source') || 'latest';
    const limit = Number(this.getAttribute('limit')) || 12;
    const source_value = this.parseValue();

    let items = [];
    try {
      const r = await salla.product.fetch(
        source_value === undefined ? { source, limit } : { source, source_value, limit }
      );
      items = (r && (r.data || r)) || [];
    } catch (e) {
      // فشل الجلب يُقال لا يُخفى: شبكة فارغة صامتة تبدو متجرا بلا منتجات
      this.innerHTML = `<p class="bs-pgrid__msg">${
        (window.salla && salla.lang && salla.lang.get('common.element.error')) ||
        'تعذر تحميل المنتجات. حدّث الصفحة.'
      }</p>`;
      return;
    }

    if (!items.length) {
      this.innerHTML = '<p class="bs-pgrid__msg">لا منتجات في هذا القسم بعد.</p>';
      return;
    }

    this.innerHTML = '';
    items.forEach((p) => {
      const card = document.createElement('custom-salla-product-card');
      card.setAttribute('product', JSON.stringify(p));
      this.appendChild(card);
    });
  }
}

if (!customElements.get('bisht-products')) {
  customElements.define('bisht-products', BishtProducts);
}
