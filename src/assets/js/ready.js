/**
 * نقطة الاقلاع الوحيدة للثيم.
 *
 * ‼ الدرس الذي كلّفنا وقتا: مكوّنات سلة (‎salla-products-list‎،
 *   ‎salla-product-options‎، ‎salla-filters‎…) لا تتحلّل الا بعد ‎salla.onReady‎.
 *   ثيم يقلع على ‎DOMContentLoaded‎ وحده يبني وينجح ويعرض وسوما فارغة تماما،
 *   بلا خطأ في الطرفية ولا في وحدة التحكم — والبيانات نفسها تعمل لو ناديتها
 *   يدويا، وهذا ما يضلّل: تظن العطل في البيانات وهو في الاقلاع.
 *
 * ‎ready(fn)‎ ينادي ‎salla.onReady‎ ان وُجد، ويسقط الى ‎DOMContentLoaded‎ في
 * بيئة بلا سلة (اختبار محلي او صفحة خطأ).
 */
export function ready(fn) {
  if (typeof window !== 'undefined' && window.salla && typeof salla.onReady === 'function') {
    salla.onReady(fn);
    return;
  }
  if (document.readyState !== 'loading') {
    fn();
    return;
  }
  document.addEventListener('DOMContentLoaded', fn);
}
