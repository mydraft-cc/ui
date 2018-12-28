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
     * The entry point for the bundle
     * Our Angular.js app
     *
     * See: https://webpack.js.org/configuration/entry-context/
     */
    entry: {
        'src': './src/index.tsx'
    },

    plugins: [
        /**
         * Simplifies creation of HTML files to serve your webpack bundles.
         * This is especially useful for webpack bundles that include a hash in the filename
         * which changes every compilation.
         *
         * See: https://github.com/ampedandwired/html-webpack-plugin
         */
        new plugins.HtmlWebpackPlugin({
            template: 'public/index.html', hash: true
        })
    ]
});