/**
 * بشت — الطبقة المشتركة لكل الصفحات.
 * لا نعيد بناء ما تقدمه سلة: السلة والدفع والحساب مكوناتها.
 * ما هنا: الكشف عند الدخول، الستارة، الدرج، والشرفة السفلى.
 */
import { mountCurtain } from './partials/curtain';
import { mountDrawer } from './partials/drawer';
import { mountReveal } from './partials/reveal';
import { mountDock } from './partials/dock';

document.addEventListener('DOMContentLoaded', () => {
  mountReveal();
  mountCurtain();
  mountDrawer();
  mountDock();
});
