const path = require('path');
const appPath = path.join(__dirname, 'js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: appPath,
  entry: {
    '0_jquery': ['jquery'],
    '1_rxjs': ['rxjs'],
    '2_main': ['./index.js']
  },
  output: {
    path: path.join(__dirname, 'public'),
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
      // the queries are also merged by .babelrc
      loaders: ['babel']
    }]
  },
  eslint: {
    emitErrors: true,
    failOnHint: true
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: [
        '1_rxjs',
        '0_jquery'
      ],
      filename: 'js/[name].bundle.js?[hash]'
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(appPath, '../index.html'),
      inject: 'body',
      chunksSortMode: 'none'
    })
  ],
  resolve: {
    root: appPath
  },
  devtool: 'source-map',
  debug: true
};
