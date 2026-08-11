/** السلة والدفع: منطقها من سلة، ونحن نضبط الحيز والتنبيهات */
import { ready } from './ready';
ready(() => {
  document.querySelectorAll('[data-fit-reminder]').forEach((el) => { el.hidden = false; });
});
