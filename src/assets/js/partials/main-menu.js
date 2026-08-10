/** القائمة: مستويات بلا مكتبة، وبحالة معلنة للقارئ الالي */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-menu-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      if (!panel) return;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });
});
