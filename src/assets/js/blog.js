/** المدونة: شريط تقدم القراءة — لا شيء يقفز اثناء القراءة */
import { ready } from './ready';
ready(() => {
  const bar = document.querySelector('[data-read-progress]');
  const art = document.querySelector('[data-article]');
  if (!bar || !art) return;

  let raf = null;
  const paint = () => {
    const r = art.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const done = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    bar.style.transform = 'scaleX(' + done + ')';
    raf = null;
  };

  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
  paint();
});
