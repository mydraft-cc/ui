// ReSharper disable InconsistentNaming
// ReSharper disable PossiblyUnassignedProperty

        var webpack = require('webpack'),
               path = require('path'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  ExtractTextPlugin = require('extract-text-webpack-plugin'),
TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
            helpers = require('./helpers');

module.exports = {
    /**
     * Options affecting the resolving of modules.
     *
     * See: https://webpack.js.org/configuration/resolve/
     */
    resolve: {
        /**
         * An array of extensions that should be used to resolve modules.
         *
         * See: https://webpack.js.org/configuration/resolve/#resolve-extensions
         */
        extensions: ['.js', '.ts', '.tsx', '.css', '.scss'],
        modules: [
            helpers.root('src'),
            helpers.root('src', 'libs'),
            helpers.root('src', 'style'),
            helpers.root('node_modules')
        ],

        plugins: [
            new TsconfigPathsPlugin()
        ]
    },

    /*
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
                test: /\.ts$/,
                use: [{
                    loader: 'awesome-typescript-loader'
                }, {
                    loader: 'tslint-loader' 
                }],
                exclude: /node_modules/
            }, {
                test: /\.tsx$/,
                use: [{
                    loader: 'awesome-typescript-loader'
                }, {
                    loader: 'tslint-loader' 
                }],
                exclude: /node_modules/
            }, {
                test: /\.ts$/,
                use: [{
                    loader: 'awesome-typescript-loader' 
                }],
                include: /node_modules/
            }, {
                test: /\.(woff|woff2|ttf|eot)(\?.*$|$)/,
                use: [{
                    loader: 'file-loader?name=assets/[name].[hash].[ext]'
                }]
            }, {
                test: /\.(png|jpe?g|gif|svg|ico)(\?.*$|$)/,
                use: [{
                    loader: 'file-loader?name=assets/[name].[hash].[ext]'
                }]
            }, {
                test: /\.css$/,
                /*
                 * Extract the content from a bundle to a file
                 * 
                 * See: https://github.com/webpack-contrib/extract-text-webpack-plugin
                 */
                use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader?sourceMap' })
            }, {
                test: /\.scss$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'sass-loader?sourceMap',
                    options: {
                        includePaths: [helpers.root('src', 'style')]
                    }
                }]
            }
        ]
    },

    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                tslint: {
                    /**
                    * Run tslint in production build and fail if there is one warning.
                    * 
                    * See: https://github.com/wbuchwalter/tslint-loader
                    */
                    emitErrors: true,
                    /**
                    * Share the configuration file with the IDE
                    */
                    configuration: require('./../tslint.json')
                },
                htmlLoader: {
                    /**
                     * Define the root for images, so that we can use absolute url's
                     * 
                     * See: https://github.com/webpack/html-loader#Advanced_Options
                     */
                    root: helpers.root('src', 'images')
                },
                context: '/'
            }
        })
    ]
};