const webpack = require('webpack'),
 webpackMerge = require('webpack-merge'),
         path = require('path'),
      helpers = require('./helpers'),
 commonConfig = require('./webpack.config.js');

const plugins = {
    // https://github.com/jantimon/html-webpack-plugin
    HtmlWebpackPlugin: require('html-webpack-plugin')
};

module.exports = webpackMerge(commonConfig, {
    /**
     * The entry point for the bundle. Our react app.
     *
     * See: https://webpack.js.org/configuration/entry-context/
     */
    entry: {
        'src': './src/index.tsx'
    },

    plugins: [
        /**
         * Simplifies creation of HTML files to serve your webpack bundles.
         */
        new plugins.HtmlWebpackPlugin({
            template: 'public/index.html', hash: true
        })
    ]
});