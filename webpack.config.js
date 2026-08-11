// بشت — بناء الاصول. المدخلات مقسّمة بحسب الصفحة لا ملفا واحدا ضخما،
// لان سلة تحمّل الحزمة المطابقة للصفحة وحدها.
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ThemeWatcher = require('@salla.sa/twilight/watcher.js');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const asset = (file) => path.resolve('src/assets', file || '');
const pub = (file) => path.resolve('public', file || '');

module.exports = {
  entry: {
    app: [asset('styles/app.scss'), asset('js/app.js')],
    home: asset('js/home.js'),
    product: asset('js/product.js'),
    'size-guide': asset('js/size-guide.js'),
    blog: asset('js/blog.js'),
    category: asset('js/category.js'),
    checkout: asset('js/cart.js'),
    'product-card': asset('js/partials/product-card.js'),
    'main-menu': asset('js/partials/main-menu.js'),
  },
  output: {
    path: pub(),
    clean: true,
    chunkFilename: '[name].[contenthash].js',
  },
  stats: { modules: false, assetsSort: 'size', assetsSpace: 50 },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/(node_modules)/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }]],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
      {
        test: /\.s?[ac]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { url: false } },
          'postcss-loader',
          { loader: 'sass-loader', options: { sassOptions: { quietDeps: true } } },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new CopyPlugin({
      patterns: [{ from: asset('images'), to: pub('images'), noErrorOnMissing: true }],
    }),
    new ThemeWatcher(),
  ],
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()],
  },
  performance: { hints: false },
};
