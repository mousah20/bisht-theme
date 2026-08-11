/**
 * دليل قياس البشت — العمود الوظيفي للثيم.
 *
 * البشت لا يُقاس بـS و M بل بالطول والكتف. وأكبر سبب ارجاع في هذا القطاع
 * هو المقاس الخاطئ، فالمنطق هنا يحول ثلاثة اسئلة سهلة الى مقاس واحد.
 *
 * القاعدة الفعلية عند الخياطين: طول البشت = طول القامة ناقص ١٢ الى ١٦ سم
 * (يقف عن كعب القدم لا يمس الارض)، وعرض الكتف يزيد مع الوزن لان البشت
 * يُلبس فوق الثوب فيحتاج سماحية.
 */

// جدول المقاسات: طول القامة ⇒ طول البشت وعرض الكتف الاساسي
const CHART = [
  { key: '150', body: [148, 157], len: 138, sh: 48 },
  { key: '160', body: [158, 165], len: 146, sh: 50 },
  { key: '170', body: [166, 173], len: 154, sh: 52 },
  { key: '180', body: [174, 181], len: 162, sh: 54 },
  { key: '190', body: [182, 189], len: 170, sh: 56 },
  { key: '200', body: [190, 205], len: 178, sh: 58 },
];

// سماحية الكتف بحسب البنية — تُضاف على الاساس
const BUILD = { slim: -1, normal: 0, wide: 2, xwide: 4 };

// سماحية الطول بحسب الاستعمال: الرسمي اطول قليلا، واليومي اقصر لسهولة الحركة
const USE = { formal: 3, daily: 0, work: -2 };

import { saveFit, loadFit } from './fit';

export function resolveFit({ height, build = 'normal', use = 'daily' }) {
  const h = Number(height);
  if (!h || Number.isNaN(h)) return null;

  const row =
    CHART.find((r) => h >= r.body[0] && h <= r.body[1]) ||
    (h < CHART[0].body[0] ? CHART[0] : CHART[CHART.length - 1]);

  const length = row.len + (USE[use] ?? 0);
  const shoulder = row.sh + (BUILD[build] ?? 0);

  // خارج الجدول: نصرّح بذلك بدل ان نخمن، لان الخطأ هنا يعني ارجاعا
  const outside = h < CHART[0].body[0] || h > CHART[CHART.length - 1].body[1];

  return {
    row: row.key,
    length,
    shoulder,
    label: `طول ${length} · كتف ${shoulder}`,
    outside,
    note: outside
      ? 'قامتك خارج الجدول القياسي — نوصي بالخياطة بالقياس.'
      : 'المقاس يقف عن الكعب ولا يمس الارض.',
  };
}

export function chart() {
  return CHART;
}

/** يربط النموذج بالواجهة: ثلاث خطوات ⇒ نتيجة واحدة */
export function mountSizeGuide(root) {
  if (!root) return;

  const state = { height: null, build: 'normal', use: 'daily' };
  const out = root.querySelector('[data-fit-out]');
  const table = root.querySelector('[data-fit-table]');

  const paint = () => {
    const fit = resolveFit(state);
    if (!out) return;

    if (!fit) {
      out.hidden = true;
      return;
    }

    out.hidden = false;
    const s = out.querySelector('[data-fit-label]');
    const n = out.querySelector('[data-fit-note]');
    if (s) s.textContent = fit.label;
    if (n) n.textContent = fit.note;

    // نبرز الصف المطابق في الجدول الكامل بدل اخفائه
    if (table) {
      table.querySelectorAll('tr[data-row]').forEach((tr) => {
        tr.setAttribute('data-fit', String(tr.dataset.row === fit.row));
      });
    }

    // نحفظ المدخلات لا الناتج: التصنيف والبطاقات تقرأها بعد ذلك
    saveFit({ ...state, length: fit.length, shoulder: fit.shoulder, row: fit.row });

    root.dispatchEvent(new CustomEvent('bisht:fit', { detail: fit, bubbles: true }));
  };

  root.querySelectorAll('[data-fit-group]').forEach((group) => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-value]');
      if (!btn) return;
      group.querySelectorAll('button[data-value]').forEach((b) =>
        b.setAttribute('aria-pressed', String(b === btn))
      );
      state[group.dataset.fitGroup] = btn.dataset.value;
      paint();
    });
  });

  // زائر عاد: نعيد مدخلاته بدل ان نسأله مرة ثانية
  const saved = loadFit();
  if (saved) {
    state.height = saved.height;
    state.build = saved.build || 'normal';
    state.use = saved.use || 'daily';
    const hi = root.querySelector('[data-fit-height]');
    if (hi) hi.value = saved.height;
    root.querySelectorAll('[data-fit-group]').forEach((group) => {
      const want = state[group.dataset.fitGroup];
      group.querySelectorAll('button[data-value]').forEach((b) =>
        b.setAttribute('aria-pressed', String(b.dataset.value === want))
      );
    });
  }

  const input = root.querySelector('[data-fit-height]');
  if (input) {
    input.addEventListener('input', () => {
      state.height = input.value;
      paint();
    });
  }

  paint();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-size-guide]').forEach(mountSizeGuide);
});
