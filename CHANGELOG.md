# سجل التغييرات — ثيم بشت

## 1.0.0

### العربية

الاصدار الاول من ثيم **بشت**، مبني من الصفر لمتاجر البشوت والملابس الرجالية الفاخرة.

**محرك المقاس** — العمود الوظيفي للثيم. البشت لا يُقاس بـS و M بل بالطول وعرض الكتف، واكبر سبب ارجاع في هذا القطاع هو المقاس الخاطئ. ثلاثة اسئلة (القامة · البنية · الاستعمال) تحوّل الى مقاس واحد يعمل في ثلاثة مواضع:

- **صفحة المنتج**: يختار مقاس المنتج تلقائيا ويصرّح بما فعله — «اخترنا مقاسك» او «اخترنا الاقرب» او «مقاسك غير متاح، الخياطة بالقياس تناسبك». ولا يخمّن حين يخرج القياس عن الجدول.
- **بطاقة المنتج**: تعرض نطاق الطول المتاح لكل الزوار، ووسم «يناسب قامتك» لمن عرّف قامته. البطاقة تتغير بحسب الزائر لا تكون ثابتة للجميع.
- **صفحة التصنيف**: شريط تصفية بالقامة مع «اعرض ما يناسبني فقط». والمنتجات التي لا تعلن مقاساتها تبقى ظاهرة مع تنبيه بعددها — لا نخفي ما لا نعرفه.

القياس يُحفظ مرة واحدة في المتصفح، فمن عرّف قامته في صفحة منتج وجد التصنيف والبطاقات تعرف مقاسه.

**صفحة غلاف قبل المتجر** — غلاف كامل الشاشة بعنوان متحرك وصورتين، يليه الدخول الى الاقسام. يمكن اطفاؤها للدخول المباشر.

**انتقال الستارة** — البشت يعمل كستارة تنزل وترتفع بين الاقسام، بسبع ثنيات على المكتب وخمس على الجوال، ويحترم `prefers-reduced-motion`.

**تصميم الجوال طبقة قائمة بذاتها** — شرفة شراء سفلى ثابتة مع `env(safe-area-inset-bottom)`، ودرج قائمة بتدرج ظهور، واهداف لمس لا تقل عن 44 بكسل، والغاء كل اثر تحويم على الشاشات اللمسية.

**تحكم التاجر** — خط العناوين يُختار من اربعة خطوط عربية، ولوحتا الالوان والخطوط في سلة تعملان، وثلاثة عشر اعدادا للغلاف والستارة والشرفة والمناسبات والهدايا.

**صفحات كاملة**: الرئيسية · الاقسام · المنتج · التصنيف · البحث · دليل القياس · الورشة · المناسبات · المدونة والمقال · السلة · الحساب · الولاء · الشكر · الخطأ.

### English

First release of **Bisht**, built from scratch for bisht and premium menswear stores.

**Fit engine** — the theme's functional core. A bisht is sized by length and shoulder width, not S/M/L, and the biggest source of returns in this category is the wrong size. Three questions (height, build, use) resolve to one size that works in three places:

- **Product page**: selects the matching option automatically and states what it did — exact, nearest, or not available (then routes to bespoke tailoring). It never guesses outside the chart.
- **Product card**: shows the available length range to every visitor, plus a "fits your height" badge for those who entered theirs. The card changes per visitor.
- **Category page**: a height filter with "show only my fit". Products that do not declare sizes stay visible with a count — we never hide what we cannot judge.

The fit is stored once in the browser, so a visitor who set it on one product finds the category and the cards already know their size.

**Landing page before the store**, **bisht curtain transition**, **mobile as a first-class layer** (fixed buy dock with safe-area padding, 44px touch targets, no hover effects on touch), and **merchant control** over the display face, colours, and thirteen settings.
