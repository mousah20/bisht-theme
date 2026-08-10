/** درج القائمة على الجوال: لا اعتماد على hover، ويُغلق بالمفتاح */
export function mountDrawer() {
  const drawer = document.querySelector('[data-drawer]');
  const open = document.querySelector('[data-drawer-open]');
  const close = document.querySelector('[data-drawer-close]');
  if (!drawer || !open) return;

  const set = (on) => {
    drawer.classList.toggle('is-open', on);
    drawer.setAttribute('aria-hidden', String(!on));
    open.setAttribute('aria-expanded', String(on));
    document.documentElement.style.overflow = on ? 'hidden' : '';
    if (on) {
      const first = drawer.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    }
  };

  open.addEventListener('click', () => set(true));
  if (close) close.addEventListener('click', () => set(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) set(false);
  });

  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  set(false);
}
