/** كشف العناصر عند دخولها الشاشة — IntersectionObserver لا حدث تمرير */
export function mountReveal() {
  const els = document.querySelectorAll('.bs-rise:not(.is-in)');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach((e) => e.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
  );

  els.forEach((el, i) => {
    el.style.transitionDelay = String(Math.min(i % 4, 3) * 90) + 'ms';
    io.observe(el);
  });
}
