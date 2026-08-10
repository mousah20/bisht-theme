/**
 * ستارة البشت.
 * القاعدة التي تفرق بين وظيفة وزينة: تُسدل اثناء الانتقال الفعلي فتغطي زمنه،
 * ولا تُضاف فوق انتقال فوري. لذلك لا تُستعمل الا على روابط تغادر الصفحة.
 */
const FOLDS = 7;
const DOWN = 680;
const HOLD = 110;

let curtain = null;
let busy = false;

function build() {
  if (curtain) return curtain;
  curtain = document.createElement('div');
  curtain.className = 'bs-curtain';
  curtain.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < FOLDS; i += 1) {
    const f = document.createElement('div');
    f.className = 'bs-fold';
    f.style.animationDelay = String(i * 26) + 'ms';
    f.style.setProperty('--bs-d', String(DOWN - 60 + (i % 3) * 48) + 'ms');
    curtain.appendChild(f);
  }

  document.body.appendChild(curtain);
  return curtain;
}

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** يُسدل الستارة ثم ينفذ mid ثم يرفعها. mid هو الانتقال الحقيقي. */
export function sweep(mid) {
  if (reduce() || busy) {
    mid();
    return;
  }

  busy = true;
  const c = build();
  c.classList.remove('is-up');
  c.classList.add('is-down');

  const fall = DOWN + FOLDS * 26 + HOLD;
  setTimeout(mid, fall);
  setTimeout(() => {
    c.classList.remove('is-down');
    c.classList.add('is-up');
    setTimeout(() => { busy = false; }, 760);
  }, fall + 320);
}

export function mountCurtain() {
  document.querySelectorAll('[data-curtain]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || a.target === '_blank' || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      sweep(() => { window.location.href = href; });
    });
  });
}
