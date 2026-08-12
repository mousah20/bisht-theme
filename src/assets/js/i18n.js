/**
 * نصوص واجهة بشت عبر salla.lang — بلغتي المتجر، على النمط القياسي
 * (addBulk داخل onLoaded ثم get بمتغيرات ‎:param‎).
 */
const KEYS = {
  'bisht.rail_summary': { ar: 'طول :length · كتف :shoulder', en: 'Length :length · Shoulder :shoulder' },
  'bisht.rail_unknown_kept': { ar: ':count بشت بلا مقاسات معلنة — ابقيناها ظاهرة.', en: ':count bishts have no declared sizes — we kept them visible.' },
  'bisht.fit_chosen': { ar: 'اخترنا مقاسك: طول :length · كتف :shoulder', en: 'We picked your size: length :length · shoulder :shoulder' },
  'bisht.fit_nearest': { ar: 'لا يوجد مقاسك تماما — اخترنا الاقرب: :text', en: 'Your exact size is unavailable — we picked the closest: :text' },
  'bisht.fit_unavailable': { ar: 'مقاسك غير متاح في هذا البشت — الخياطة بالقياس تناسبك.', en: 'Your size is unavailable for this bisht — made-to-measure suits you.' },
  'bisht.card_length': { ar: 'طول :range', en: 'Length :range' },
  'bisht.card_fits': { ar: 'يناسب قامتك', en: 'Fits your height' },
  'bisht.card_other_size': { ar: 'مقاس اخر', en: 'Different size' },
  'pages.products.out_of_stock': { ar: 'نفدت الكمية', en: 'Out of stock' },
};

let registered = false;

export function registerI18n() {
  if (registered || !window.salla) return;
  registered = true;
  salla.lang.onLoaded(() => salla.lang.addBulk(KEYS));
}

/** يقرأ من salla.lang، وقبل اكتمال تحميلها يقع على قاموس الثيم نفسه */
export function t(key, params) {
  let s = window.salla && salla.lang ? salla.lang.get(key, params) : null;
  if (!s || s === key) {
    const def = KEYS[key];
    s = def ? def.ar : key;
    if (params) Object.keys(params).forEach((k) => { s = String(s).split(`:${k}`).join(params[k]); });
  }
  return s;
}
