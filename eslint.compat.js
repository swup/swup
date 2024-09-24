/* eslint-env node */

import compat from 'eslint-plugin-compat';

// doesn't yet work with eslint v9 config format
// import escompat from 'eslint-plugin-ecmascript-compat';

// Tweak these and run "npm run lint:compat" to see the compatibility against these browsers
const browsers = [
	'defaults',
	'Chrome >= 80',
	'Safari >= 13.1',
	'iOS >= 13.4',
	'Firefox >= 74',
	'Edge >= 80',
	'>=1%',
	'not op_mini all',
	'not dead',
];

// Required to fix an issue when combining existing browserslist config with the one from this file
// where any negations ("not op_mini all") are removed
process.env.BROWSERSLIST = browsers.join(',');

export default [
	compat.configs['flat/recommended'],
	{
		ignores: [
			'/',
			'/*.*',
			'!dist/'
		]
	},
	{
		rules: {
			'compat/compat': 'error',
			// 'ecmascript-compat/compat': ['error', { 'overrideBrowserslist': browsers }]
		},
		settings: {
			browsers
		}
	}
];
