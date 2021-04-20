const webpack = require('webpack'),
         path = require('path'),
           fs = require('fs');

const appRoot = path.resolve(__dirname, '..');

function root() {
    var newArgs = Array.prototype.slice.call(arguments, 0);

    return path.join.apply(path, [appRoot].concat(newArgs));
};

const PUBLIC_PATH = 'https://mydraft.cc/';

const plugins = {
    // https://github.com/webpack-contrib/mini-css-extract-plugin
    MiniCssExtractPlugin: require('mini-css-extract-plugin'),
    // https://github.com/dividab/tsconfig-paths-webpack-plugin
    TsconfigPathsPlugin: require('tsconfig-paths-webpack-plugin'),
    // https://github.com/aackerman/circular-dependency-plugin
    CircularDependencyPlugin: require('circular-dependency-plugin'),
    // https://github.com/jantimon/html-webpack-plugin
    HtmlWebpackPlugin: require('html-webpack-plugin'),
    // https://webpack.js.org/plugins/terser-webpack-plugin/
    TerserPlugin: require('terser-webpack-plugin'),
    // https://github.com/NMFR/optimize-css-assets-webpack-plugin
    OptimizeCSSAssetsPlugin: require("optimize-css-assets-webpack-plugin"),
    // https://github.com/jrparish/tslint-webpack-plugin
    TsLintPlugin: require('tslint-webpack-plugin'),
    // https://www.npmjs.com/package/sass-lint-webpack
    SassLintPlugin: require('sass-lint-webpack'),
    // https://www.npmjs.com/package/webpack-bundle-analyzer
    BundleAnalyzerPlugin: require('webpack-bundle-analyzer').BundleAnalyzerPlugin,
    // https://github.com/jantimon/favicons-webpack-plugin
    FaviconsWebpackPlugin: require('favicons-webpack-plugin'),
    // https://github.com/goldhand/sw-precache-webpack-plugin
    SWPrecacheWebpackPlugin: require('sw-precache-webpack-plugin'),
};

module.exports = function (env) {
    const isDevServer = path.basename(require.main.filename) === 'webpack-dev-server.js';
    const isProduction = env && env.production;
    const isTests = env && env.target === 'tests';
    const isTestCoverage = env && env.coverage;
    const isAnalyzing = isProduction && env.analyze;

    const config = {
        mode: isProduction ? 'production' : 'development',

        /**
         * Source map for Karma from the help of karma-sourcemap-loader & karma-webpack.
         *
         * See: https://webpack.js.org/configuration/devtool/
         */
        devtool: isProduction ? false : 'inline-source-map',

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
            extensions: ['.ts', '.tsx', '.js', '.mjs', '.css', '.scss'],
            modules: [
                root('src'),
                root('src', 'style'),
                root('node_modules')
            ],

            plugins: [
                new plugins.TsconfigPathsPlugin({
                    configFile: 'tsconfig.json'
                })
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
                test: /\.html$/,
                use: [{
                    loader: 'raw-loader' 
                }]
            }, {
                test: /\.d\.ts?$/,
                use: [{
                    loader: 'ignore-loader'
                }],
                include: [/node_modules/]
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
                use: [{
                    loader: plugins.MiniCssExtractPlugin.loader,
                    options: {
                        hmr: isDevServer
                    }
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'postcss-loader'
                }]
            }, {
                test: /\.scss$/,
                use: [{
                    loader: plugins.MiniCssExtractPlugin.loader,
                    options: {
                        hmr: isDevServer
                    }
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'postcss-loader'
                }, {
                    loader: 'sass-loader'
                }]
            }]
        },

        plugins: [
            /**
             * Puts each bundle into a file without the hash.
             * 
             * See: https://github.com/webpack-contrib/mini-css-extract-plugin
             */
            new plugins.MiniCssExtractPlugin('[name].css'),

            new webpack.LoaderOptionsPlugin({
                options: {
                    htmlLoader: {
                        /**
                         * Define the root for images, so that we can use absolute urls.
                         * 
                         * See: https://github.com/webpack/html-loader#Advanced_Options
                         */
                        root: root('src', 'images')
                    },
                    context: '/'
                }
            }),

            new plugins.FaviconsWebpackPlugin({
                // Favicon source logo
                logo: 'src/images/logo-square.png',
                // Favicon app title
                title: 'MyDraft',
                favicons: {
                    appName: 'mydraft.cc',
                    appDescription: 'Open Source Wireframe Editor',
                    developerName: 'Sebastian Stehle',
                    developerUrl: 'https://sstehle.com',
                    start_url: '/'
                }
            }),

            new plugins.SassLintPlugin({
                files: 'src/**/*.scss'
            }),

            /**
             * Detect circular dependencies in app.
             * 
             * See: https://github.com/aackerman/circular-dependency-plugin
             */
            new plugins.CircularDependencyPlugin({
                exclude: /([\\\/]node_modules[\\\/])/,
                // Add errors to webpack instead of warnings
                failOnError: true
            }),
        ],

        devServer: {
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            historyApiFallback: true
        }
    };

    if (!isTests) {
        /**
         * The entry point for the bundle. Our React app.
         *
         * See: https://webpack.js.org/configuration/entry-context/
         */
        config.entry = {
            'src': './src/index.tsx'
        };

        if (isProduction) {
            config.output = {
                /**
                 * The output directory as absolute path (required).
                 *
                 * See: https://webpack.js.org/configuration/output/#output-path
                 */
                path: root('/build/'),

                publicPath: './',

                /**
                 * Specifies the name of each output file on disk.
                 *
                 * See: https://webpack.js.org/configuration/output/#output-filename
                 */
                filename: '[name].[hash].js',

                /**
                 * The filename of non-entry chunks as relative path inside the output.path directory.
                 *
                 * See: https://webpack.js.org/configuration/output/#output-chunkfilename
                 */
                chunkFilename: '[id].[hash].chunk.js'
            };
        } else {
            config.output = {
                filename: '[name].[hash].js',

                /**
                 * Set the public path, because we are running the website from another port (5000).
                 */
                publicPath: 'https://localhost:3002/',

                /*
                 * Fix a bug with webpack dev server.
                 *
                 * See: https://github.com/webpack-contrib/worker-loader/issues/174
                 */
                globalObject: 'this'
            };
        }

        config.plugins.push(
            new plugins.HtmlWebpackPlugin({
                hash: true,
                chunks: ['src'],
                chunksSortMode: 'manual',
                template: 'src/index.html'
            }),
            new plugins.HtmlWebpackPlugin({
                hash: true,
                chunks: ['src'],
                chunksSortMode: 'manual',
                template: 'src/index.html',
                filename: '404.html'
            })
        );

        config.plugins.push(
            new plugins.TsLintPlugin({
                files: [
                    './src/**/*.ts',
                    './src/**/*.tsx'
                ],
                /**
                 * Path to a configuration file.
                 */
                config: root('tslint.json'),
                /**
                 * Wait for linting and fail the build when linting error occur.
                 */
                waitForLinting: isProduction
            })
        );
    }

    if (isProduction) {
        config.optimization = {
            minimizer: [
                new plugins.TerserPlugin({
                    terserOptions: {
                        compress: true,
                        ecma: 5,
                        mangle: true,
                        output: {
                            comments: false
                        },
                        safari10: true
                    },
                    extractComments: true
                }),

                new plugins.OptimizeCSSAssetsPlugin({})
            ]
        };

        config.performance = {
            hints: false
        };
    }

    if (isTestCoverage) {
        // Do not instrument tests.
        config.module.rules.push({
            test: /\.ts[x]?$/,
            use: [{
                loader: 'ts-loader'
            }],
            include: [/\.(e2e|spec)\.ts$/],
        });

        // Use instrument loader for all normal files.
        config.module.rules.push({
            test: /\.ts[x]?$/,
            use: [{
                loader: 'istanbul-instrumenter-loader?esModules=true'
            }, {
                loader: 'ts-loader'
            }],
            exclude: [/\.(e2e|spec)\.ts$/]
        });
    } else {
        config.module.rules.push({
            test: /\.ts[x]?$/,
            use: [{
                loader: 'ts-loader'
            }]
        })
    }

    if (isProduction) {
        config.plugins.push(new plugins.SWPrecacheWebpackPlugin({
            navigateFallback: `${PUBLIC_PATH}index.html`,
            // To fix a bug with windows.
            stripPrefix: root('build/').replace(/\\/g, '/'),
        }));
    }

    if (isAnalyzing) {
        config.plugins.push(new plugins.BundleAnalyzerPlugin());
    }

    return config;
};