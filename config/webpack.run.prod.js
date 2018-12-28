const webpack = require('webpack'),
 webpackMerge = require('webpack-merge'),
         path = require('path'),
      helpers = require('./helpers'),
    runConfig = require('./webpack.run.base.js');

const plugins = {
    // https://github.com/mishoo/UglifyJS2/tree/harmony
    UglifyJsPlugin: require('uglifyjs-webpack-plugin'),
    // https://github.com/webpack-contrib/mini-css-extract-plugin
    MiniCssExtractPlugin: require('mini-css-extract-plugin'),
    // https://github.com/NMFR/optimize-css-assets-webpack-plugin
    OptimizeCSSAssetsPlugin: require("optimize-css-assets-webpack-plugin"),
    // https://github.com/jrparish/tslint-webpack-plugin
    TsLintPlugin: require('tslint-webpack-plugin'),
    // https://github.com/jantimon/favicons-webpack-plugin
    FaviconsWebpackPlugin: require('favicons-webpack-plugin')
};

helpers.removeLoaders(runConfig, ['scss']);

module.exports = webpackMerge(runConfig, {
    mode: 'production',

    output: {
        /**
         * The output directory as absolute path (required).
         *
         * See: https://webpack.js.org/configuration/output/#output-path
         */
        path: helpers.root('build/'),

        publicPath: '/',

        /**
         * Specifies the name of each output file on disk.
         *
         * See: https://webpack.js.org/configuration/output/#output-filename
         */
        filename: '[name].js',

        /**
         * The filename of non-entry chunks as relative path inside the output.path directory.
         *
         * See: https://webpack.js.org/configuration/output/#output-chunkfilename
         */
        chunkFilename: '[id].[hash].chunk.js'
    },

    /**
     * Options affecting the normal modules.
     *
     * See: https://webpack.js.org/configuration/module/
     */
    module: {
        /**
         * An array of Rules which are matched to requests when modules are created.
         *
         * See: https://webpack.js.org/configuration/module/#module-rules
         */
        rules: [
            {
                test: /\.scss$/,
                /**
                 * Extract the content from a bundle to a file.
                 * 
                 * See: https://github.com/webpack-contrib/extract-text-webpack-plugin
                 */
                use: [
                    plugins.MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader'
                }, {
                    loader: 'sass-loader', options: { includePaths: [helpers.root('src', 'style')] }
                }]
            }
        ]
    },

    plugins: [
        new plugins.TsLintPlugin({
            files: [
                './src/**/*.ts',
                './src/**/*.tsx',
            ],
            exclude: [
                './src/**/*.d.ts'
            ],
            /**
             * Path to a configuration file.
             */
            config: helpers.root('tslint.json'),

            /**
             * Wait for linting and fail the build when linting error occur.
             */
            waitForLinting: true
        }),

        new plugins.FaviconsWebpackPlugin('images/logo-square.png')
    ],

    optimization: {
        minimizer: [
            new plugins.UglifyJsPlugin({
                uglifyOptions: {
                    compress: false,
                    ecma: 6,
                    mangle: true,
                    output: {
                        comments: false
                    }
                },
                extractComments: true
            }),
            
            new plugins.OptimizeCSSAssetsPlugin({})
        ]
    },

    performance: {
        hints: false 
    }
});