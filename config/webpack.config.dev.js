'use strict'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const path = require('path')

const devConfig = merge(baseConfig, {
  mode: 'development',
  stats: 'none',
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, '../dist'),
    },
    client: {
      logging: 'none',
    },
    hot: true,
    compress: true,
    port: 9000,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
    }),
  ],
})
module.exports = devConfig
