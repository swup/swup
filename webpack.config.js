const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const baseConfig = {
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					presets: ['es2015', 'stage-0']
				}
			}
		]
	},
	optimization: {
		minimizer: [
			// we specify a custom UglifyJsPlugin here to get source maps in production
			new UglifyJsPlugin({
				uglifyOptions: {
					compress: false,
					ecma: 6,
					mangle: true
				},
				include: /\.min\.js$/
			})
		]
	}
};

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
