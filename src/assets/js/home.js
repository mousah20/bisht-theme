/** الرئيسية: شريحتا الغلاف، والتمرير الذي يقود الدخول */
import { sweep } from './partials/curtain';

function slides() {
  const wrap = document.querySelector('[data-slides]');
  if (!wrap) return;
  const imgs = wrap.querySelectorAll('img');
  const dots = document.querySelectorAll('[data-slide-dot]');
  if (imgs.length < 2) return;

  let i = 0;
  let timer = null;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const go = (n) => {
    i = ((n % imgs.length) + imgs.length) % imgs.length;
    imgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
    dots.forEach((d, k) => d.setAttribute('aria-pressed', String(k === i)));
  };

  const restart = () => {
    if (timer) clearInterval(timer);
    // التبديل يحمل معنى: نفس البشت في مقامين. لكن نحترم تقليل الحركة.
    if (!reduce) timer = setInterval(() => go(i + 1), 8000);
  };

  dots.forEach((d) => d.addEventListener('click', () => { go(Number(d.dataset.slideDot)); restart(); }));
  go(0);
  restart();
}

function pullToEnter() {
  const land = document.querySelector('[data-land]');
  const enter = document.querySelector('[data-land-enter]');
  if (!land || !enter) return;

  const media = land.querySelector('[data-slides]');
  const body = land.querySelector('.bs-land__body');
  let p = 0;
  let raf = null;

  const paint = () => {
    if (media) media.style.transform = 'scale(' + (1 + p * 0.07) + ')';
    if (body) {
      body.style.transform = 'translate3d(0,' + (-p * 50) + 'px,0)';
      body.style.opacity = String(1 - p * 0.85);
    }
    raf = null;
  };

  const reset = () => {
    p = 0;
    if (media) media.style.transform = '';
    if (body) { body.style.transform = ''; body.style.opacity = ''; }
  };

  const bump = (dy) => {
    p = Math.max(0, Math.min(1, p + dy * 0.0011));
    if (!raf) raf = requestAnimationFrame(paint);
    if (p >= 1) { reset(); enter.click(); }
  };

  window.addEventListener('wheel', (e) => bump(e.deltaY), { passive: true });

  let ty = null;
  window.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (ty === null) return;
    const y = e.touches[0].clientY;
    bump((ty - y) * 2.2);
    ty = y;
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  slides();
  pullToEnter();
  document.querySelectorAll('[data-land-enter]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      sweep(() => { window.location.href = href; });
    });
  });
});
