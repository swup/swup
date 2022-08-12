import TerserPlugin from 'terser-webpack-plugin';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// import baseConfig from '@swup/webpack-config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				resolve: { fullySpecified: false }
			}
		]
	},
	experiments: {
		outputModule: true
	}
};

const bundleConfig = {
	mode: 'production',
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
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				resolve: { fullySpecified: false },
				use: { loader: 'babel-loader' }
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
	}
};

export default [moduleConfig, bundleConfig];
