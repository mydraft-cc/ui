const webpack = require('webpack'),
 webpackMerge = require('webpack-merge'),
         path = require('path'),
      helpers = require('./helpers'),
    runConfig = require('./webpack.run.base.js');

module.exports = webpackMerge(runConfig, {
    mode: 'development',

    output: {
        filename: '[name].js',
        
        // Set the public path, because we are running the website from another port (5000)
        publicPath: 'http://localhost:3000/'
    },

    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        historyApiFallback: true
    }
});