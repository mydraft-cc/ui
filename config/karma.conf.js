var webpackConfig = require('./webpack.test');

module.exports = function (config) {
    var configuration = {
        /** 
         * Base path that will be used to resolve all patterns (e.g. files, exclude)
         */
        basePath: '',

        frameworks: ['jasmine'],

        /**
         * Load the test files
         */
        files: [
            '**/*.spec.ts'
        ],

        preprocessors: {
            '**/*spec.ts': ['webpack']
        },

        /**
         * Load the files with webpack and use test configuration for it.
         */
        webpack: webpackConfig,

        webpackMiddleware: {
            stats: 'errors-only'
        },
        
        webpackServer: {
            noInfo: true
        },

        /*
         * Leave Jasmine Spec Runner output visible in browser
         */
        client: {
            clearContext: false
        },

        /*
         * Use a mocha style console reporter and html reporter.
         */
        reporters: ['kjhtml', 'mocha'],


        /**
         * Run with chrome to enable debugging
         * 
         * available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
         */
        browsers: ['Chrome']
    };

    config.set(configuration);
};