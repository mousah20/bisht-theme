/**
 * الشرفة السفلى على الجوال: زر الشراء لا يُبحث عنه.
 * تظهر بعد ان يمرر الزائر عن زر الشراء الاصلي فلا تزاحمه.
 */
export function mountDock() {
  const dock = document.querySelector('[data-dock]');
  const anchor = document.querySelector('[data-dock-anchor]');
  if (!dock) return;

  document.body.classList.add('bs-has-dock');

  if (!anchor || !('IntersectionObserver' in window)) {
    dock.classList.add('is-on');
    return;
  }

  const io = new IntersectionObserver(
    (entries) => dock.classList.toggle('is-on', !entries[0].isIntersecting),
    { rootMargin: '-70px 0px 0px 0px' }
  );
  io.observe(anchor);
}
