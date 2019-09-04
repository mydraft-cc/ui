const webpack = require('webpack'),
 webpackMerge = require('webpack-merge'),
         path = require('path'),
      helpers = require('./helpers'),
   testConfig = require('./webpack.test.js');

module.exports = webpackMerge(helpers.removeLoaders(testConfig, ['ts']), {
    module: {        
        /**
         * An array of Rules which are matched to requests when modules are created.
         *
         * See: https://webpack.js.org/configuration/module/#module-rules
         */
        rules: [{
			test: /\.ts[x]?$/,
			use: [{
                loader: 'istanbul-instrumenter-loader?esModules=true'
			}, {
				loader: 'ts-loader'
			}],
			exclude: [/node_modules/, /\.(e2e|spec)\.ts$/]
		}, {
			test: /\.ts[x]?$/,
			use: [{
				loader: 'ts-loader'
			}],
			exclude: [/node_modules/], include: [/\.(e2e|spec)\.ts$/]
		}, {
			test: /\.ts[x]?$/,
			use: [{
				loader: 'ts-loader' 
			}],
			include: [/node_modules/]
		}]
	}
});