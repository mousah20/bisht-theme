// بشت يستعمل تايلوند لطبقة مكونات سلة فقط (utilities.json الالزامية)،
// والتصميم كله SCSS مكتوب بيدنا. لذلك content محدود بالقوالب.
const twilight = require('@salla.sa/twilight-tailwind-theme');
module.exports = {
  presets: [twilight],
  content: ['./src/views/**/*.twig', './src/assets/js/**/*.js'],
  corePlugins: { preflight: false },
};
