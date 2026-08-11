/**
 * محرك الملاءمة — الطبقة التي تشترك فيها الميزات الثلاث.
 *
 * صفحة المنتج تختار المقاس منه، وبطاقة المنتج تعرض وسم الملاءمة منه،
 * وصفحة التصنيف تصفّي به. ولذلك القياس يُحفظ مرة واحدة ويُقرأ في كل مكان:
 * زائر عرّف قامته في صفحة منتج، وجد التصنيف والبطاقات تعرف مقاسه.
 *
 * قرار مقصود: نحفظ ثلاث قيم (قامة · بنية · استعمال) لا الناتج وحده،
 * لان الناتج يتغير لو صحّحنا الجدول لاحقا، والمدخلات لا تتغير.
 */

const KEY = 'bisht:fit';

/** ما نستنتجه من نص خيار سلة: «طول 162 · كتف 54» ⇒ {len:162, sh:54} */
const NUM = /(\d{2,3})/g;

/**
 * ‼ مصيدة كلّفتنا مطابقة فاشلة بصمت: متاجر سلة تكتب المقاسات بالارقام
 *   الهندية «طول ١٦٥ · كتف ٥٠»، و‎\d‎ في جافاسكربت لا يطابق ٠-٩ العربية
 *   ولا ۰-۹ الفارسية. فكل مطابقة تمر على هذه الدالة اولا.
 */
export function toAscii(str) {
  return String(str == null ? '' : str)
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

export function saveFit(input) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...input, at: Date.now() }));
  } catch (e) {
    /* التخزين قد يكون مقفلا في التصفح الخاص: الميزة تعمل بلا حفظ */
  }
}

export function loadFit() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const f = JSON.parse(raw);
    return f && f.height ? f : null;
  } catch (e) {
    return null;
  }
}

export function clearFit() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {
    /* لا شيء */
  }
}

/**
 * هل نص هذا الخيار يطابق المقاس المستنتج؟
 * نقرأ الارقام من النص لا نطابق الصيغة، لان التاجر قد يكتب
 * «طول 162 - كتف 54» او «162/54» او يضيف كلمة سم.
 */
export function optionMatchesFit(text, fit) {
  if (!text || !fit || !fit.length) return false;
  const nums = toAscii(text).match(NUM);
  if (!nums) return false;
  const set = nums.map(Number);
  const lenHit = set.includes(fit.length);
  const shHit = fit.shoulder ? set.includes(fit.shoulder) : true;
  return lenHit && shHit;
}

/**
 * اقرب خيار متاح حين لا يوجد تطابق تام.
 * نرجّح الاقرب في الطول لان الطول هو ما يُرى، والكتف له سماحية.
 */
export function nearestOption(texts, fit) {
  if (!fit || !fit.length) return -1;
  let best = -1;
  let gap = Infinity;
  texts.forEach((t, i) => {
    const nums = (toAscii(t).match(NUM) || []).map(Number).filter((n) => n > 100 && n < 220);
    if (!nums.length) return;
    const d = Math.min(...nums.map((n) => Math.abs(n - fit.length)));
    const longer = Math.max(...nums) > fit.length;
    // عند تعادل الفرق نرجّح الاطول: البشت الاقصر عيب لانه لا يصل الكعب،
    // والاطول قليلا يُلبس ولا يُلاحظ.
    if (d < gap || (d === gap && longer)) {
      gap = d;
      best = i;
    }
  });
  // فرق اكبر من ٨ سم ليس مقاسا قريبا بل مقاس اخر
  return gap <= 8 ? best : -1;
}

/** وسم قصير يُطبع على البطاقة والشرفة */
export function fitBadgeText(fit) {
  if (!fit || !fit.length) return '';
  return `${fit.length} · ${fit.shoulder}`;
}
