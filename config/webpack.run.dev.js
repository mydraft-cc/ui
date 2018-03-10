var webpackMerge = require('webpack-merge'),
    runConfig = require('./webpack.run.base.js'),
        helpers = require('./helpers');

module.exports = webpackMerge(runConfig, {
    /**
     * Developer tool to enhance debugging
     *
     * See: https://webpack.js.org/configuration/devtool/#devtool
     * See: https://webpack.js.org/guides/build-performance/
     */
    devtool: 'cheap-module-source-map',

    output: {
        filename: '[name].js',
        // Set the public path, because we are running the website from another port (5000)
        publicPath: 'http://localhost:3000/'
    },

    devServer: {
        historyApiFallback: true, stats: 'minimal',
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }
});