const TerserPlugin = require('terser-webpack-plugin');
// const baseConfig = require('@swup/webpack-config');

const moduleConfig = {
	mode: 'production',
	entry: {
		swup: './src/index.js',
	},
	output: {
		path: __dirname + '/dist/',
		filename: '[name].mjs',
		library: {
			type: 'module'
		}
	},
	experiments: {
		outputModule: true
	}
};

const bundleConfig = {
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				test: /\.min\.js$/
			})
		]
	},
	entry: {
		swup: './entry.js',
		'swup.min': './entry.js'
	},
	output: {
		path: __dirname + '/dist/',
		filename: '[name].js',
		library: {
			type: 'umd',
			name: 'Swup'
		}
	}
};

module.exports = [moduleConfig, bundleConfig];
