/** السلة والدفع: منطقها من سلة، ونحن نضبط الحيز والتنبيهات */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-fit-reminder]').forEach((el) => { el.hidden = false; });
});
