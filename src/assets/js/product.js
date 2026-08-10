/** صفحة المنتج: المقاس، ونقل نتيجة دليل القياس اليه */
import { mountSizeGuide } from './size-guide';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-size-guide]').forEach(mountSizeGuide);

  // نتيجة الحاسبة تختار المقاس المطابق ان كان متاحا
  document.addEventListener('bisht:fit', (e) => {
    const label = e.detail && e.detail.label;
    if (!label) return;
    document.querySelectorAll('.bs-sizes button').forEach((b) => {
      const txt = b.textContent.trim().replace(/\s+/g, ' ');
      if (txt === label && !b.disabled) b.click();
    });
  });

  document.querySelectorAll('.bs-sizes').forEach((g) => {
    g.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b || b.disabled) return;
      g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    });
  });
});
