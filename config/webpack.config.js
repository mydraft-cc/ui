const webpack = require('webpack'),
         path = require('path'),
      helpers = require('./helpers');

const plugins = {
    // https://github.com/webpack-contrib/mini-css-extract-plugin
    MiniCssExtractPlugin: require('mini-css-extract-plugin'),
    // https://github.com/dividab/tsconfig-paths-webpack-plugin
    TsconfigPathsPlugin: require('tsconfig-paths-webpack-plugin'),
    // https://github.com/iamakulov/moment-locales-webpack-plugin
    MomentLocalesPlugin: require('moment-locales-webpack-plugin'),
    // https://github.com/aackerman/circular-dependency-plugin
    CircularDependencyPlugin: require('circular-dependency-plugin'),
};

module.exports = env => {
    env = env || {};

    return {
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
                helpers.root('src', 'style'),
                helpers.root('src', 'style', 'theme'),
                helpers.root('node_modules')
            ],

            plugins: [
                new plugins.TsconfigPathsPlugin()
            ]
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
            rules: [{
                test: /\.ts[x]?$/,
                use: [{
                    loader: 'ts-loader'
                }],
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
                test: /\.html$/,
                use: [{
                    loader: 'raw-loader' 
                }]
            }, {
                test: /\.css$/,
                use: [
                    plugins.MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader'
                }]
            }, {
                test: /\.scss$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'sass-loader?sourceMap', 
                    options: {
                        sassOptions: {
                            includePaths: [helpers.root('src', 'style')]
                        }
                    }
                }]
            }]
        },

        plugins: [
            /**
             * Puts each bundle into a file and appends the hash of the file to the path.
             * 
             * See: https://github.com/webpack-contrib/mini-css-extract-plugin
             */
            new plugins.MiniCssExtractPlugin({
                filename: '[name].[hash].css',
            }),

            /*
            * Remove all locales, except en, en-us and en.
            *
            * See: https://www.npmjs.com/package/moment-locales-webpack-plugin
            */
            new plugins.MomentLocalesPlugin({
                localesToKeep: ['de'],
            }),
            
            /**
             * Detect circular dependencies in app.
             * 
             * See: https://github.com/aackerman/circular-dependency-plugin
             */
            new plugins.CircularDependencyPlugin({
                exclude: /([\\\/]node_modules[\\\/])|(diagram-group.ts$)|(diagram-item-set.ts$)/,
                // Add errors to webpack instead of warnings
                failOnError: true
            }),

            new webpack.LoaderOptionsPlugin({
                options: {
                    htmlLoader: {
                        /**
                         * Define the root for images, so that we can use absolute urls.
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
}