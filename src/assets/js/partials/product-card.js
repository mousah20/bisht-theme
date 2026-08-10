/** بطاقة المنتج: المقاسات المتاحة سطر واحد لا قائمة */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-card-sizes]').forEach((el) => {
    const sizes = (el.dataset.cardSizes || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (!sizes.length) return;
    el.textContent = sizes.length > 3
      ? sizes.slice(0, 3).join(' · ') + ' +' + (sizes.length - 3)
      : sizes.join(' · ');
  });
});
