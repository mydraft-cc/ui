const webpack = require('webpack'),
 webpackMerge = require('webpack-merge'),
         path = require('path'),
      helpers = require('./helpers'),
    runConfig = require('./webpack.run.base.js');

const plugins = {
    // https://github.com/jrparish/tslint-webpack-plugin
    TsLintPlugin: require('tslint-webpack-plugin')
};

module.exports = env => webpackMerge(runConfig(env), {
    mode: 'development',
    
    devtool: 'source-map',

    output: {
        filename: '[name].js',
        
        /**
         * Set the public path, because we are running the website from another port (5000).
         */
        publicPath: 'http://localhost:3000/'
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
            config: helpers.root('tslint.json')
        }),
    ],

    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        historyApiFallback: true
    }
});