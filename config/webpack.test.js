      var webpack = require('webpack'),
     webpackMerge = require('webpack-merge'),
ExtractTextPlugin = require('extract-text-webpack-plugin'),
     commonConfig = require('./webpack.config.js'),
          helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, { 
    /**
     * Source map for Karma from the help of karma-sourcemap-loader & karma-webpack
     *
     * Do not change, leave as is or it wont work.
     * See: https://webpack.js.org/configuration/devtool/
     */
    devtool: 'inline-source-map',

    plugins: [
        new ExtractTextPlugin('[name].css')
    ]
});