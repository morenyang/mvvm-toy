const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isEnvDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isEnvDevelopment ? 'development' : 'production',
  devServer: {
    hot: true
  },
  devtool: isEnvDevelopment ? 'cheap-module-source-map' : 'source-map',
  entry: './src/index.js',
  output: {
    path: path.resolve('./build'),
    pathinfo: isEnvDevelopment,
    filename: isEnvDevelopment
      ? 'static/js/bundle.js'
      : 'static/js/[name].[hash:8].js',
    chunkFilename: isEnvDevelopment
      ? 'static/js/[name].chunk.js'
      : 'static/js/[name].[hash:8].chunk.js'
  },
  module: {
    rules: [
      { test: /\.js$/, include: path.resolve('./src'), loader: 'babel-loader' }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      filename: path.resolve('./build/index.html'),
      template: path.resolve('./public/index.html')
    }),
    isEnvDevelopment && new webpack.HotModuleReplacementPlugin()
  ].filter(Boolean)
};
