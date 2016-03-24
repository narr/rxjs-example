const del = require('del');
const path = require('path');
const appPath = path.join(__dirname, 'js');
const distPath = path.join(__dirname, 'public');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

del.sync(distPath);

module.exports = {
  context: appPath,
  entry: {
    // to set orders in HTML, add numbers to entry names
    '0_jquery': ['jquery'],
    '1_rxjs': ['rxjs'],
    '2_main': ['./index.js']
  },
  output: {
    path: distPath,
    filename: 'js/[name].bundle.js?[hash]'
  },
  module: {
    preLoaders: [{
      test: /\.js$/,
      exclude: [/node_modules/, path.join(__dirname, './lib')],
      loaders: ['eslint']
    }],
    loaders: [{
      test: /\.js?$/,
      exclude: [/node_modules/],
      loaders: ['babel']
    }]
  },
  eslint: {
    emitErrors: true,
    failOnHint: true
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      // webpackjsonp is declared in the last name in names array
      // so make this order inverse to the entry order
      names: [
        '1_rxjs',
        '0_jquery'
      ],
      filename: 'js/[name].bundle.js?[hash]'
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      minify: {
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        collapseWhitespace: true,
      },
      template: path.join(appPath, '../index.html'),
      inject: 'body',
      chunksSortMode: 'none' // for js's orders in HTML
    }),
    new webpack.optimize.DedupePlugin(), // https://github.com/webpack/docs/wiki/optimization#deduplication
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        drop_console: true
      }
    }),
    new CopyWebpackPlugin([
      { from: '../css', to: 'css' }, // from: relative path to context path
      { from: '../res', to: 'res' }
    ], {
      ignore: [
        '.DS_Store'
      ]
    })
  ],
  resolve: {
    root: appPath
  },
  bail: true
};
