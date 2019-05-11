const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const baseConfig = require('@swup/webpack-config');

const swupConfig = Object.assign({}, baseConfig, {
	entry: {
		swup: './entry.js',
		'swup.min': './entry.js'
	},
	output: {
		path: __dirname + '/dist/',
		library: 'Swup',
		libraryTarget: 'umd',
		filename: '[name].js'
	}
});

module.exports = swupConfig;
