// بشت — لا نستعمل تايلوند للتصميم، لكن مكونات سلة تحتاج طبقتها الاساسية.
// و«logical-properties» تبقى كما كُتبت لان المتجر عربي: تحويلها لفيزيائية يقلب كل زخرفة.
module.exports = {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    'postcss-preset-env': {
      features: {
        'nesting-rules': true,
        'logical-properties-and-values': false,
      },
    },
  },
};
