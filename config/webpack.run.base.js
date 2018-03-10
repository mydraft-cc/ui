      var webpack = require('webpack'),
     webpackMerge = require('webpack-merge'),
HtmlWebpackPlugin = require('html-webpack-plugin'),
ExtractTextPlugin = require('extract-text-webpack-plugin'),
     commonConfig = require('./webpack.config.js'),
          helpers = require('./helpers');

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
        /*
         * Puts each bundle into a file and appends the hash of the file to the path.
         * 
         * See: https://github.com/webpack/extract-text-webpack-plugin
         */
        new ExtractTextPlugin('[name].css'),

        /**
         * Shares common code between the pages.
         *
         * See: https://webpack.js.org/plugins/commons-chunk-plugin/
         */
        new webpack.optimize.CommonsChunkPlugin({
            name: ['src']
        }),

        /**
         * Simplifies creation of HTML files to serve your webpack bundles.
         * This is especially useful for webpack bundles that include a hash in the filename
         * which changes every compilation.
         *
         * See: https://github.com/ampedandwired/html-webpack-plugin
         */
        new HtmlWebpackPlugin({
            template: 'public/index.html', hash: true
        })
    ]
});