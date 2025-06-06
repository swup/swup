/* eslint-env node */

// Tweak these and run "npm run lint:compat" to see the compatibliity against these browsers
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

module.exports = {
	root: true,
	/* First exclude everything, then re-include /dist */
	ignorePatterns: ['/*', '!/dist'],
	env: {
		browser: true,
		es2024: true
	},
	extends: [
		'plugin:compat/recommended',
		'plugin:ecmascript-compat/recommended'
	],
	plugins: ['compat'],
	rules: {
		'compat/compat': 'error',
		'ecmascript-compat/compat': ['error', { 'overrideBrowserslist': browsers }]
	},
	parserOptions: {
		project: true,
		sourceType: 'module'
	},
	settings: {
		browsers
	}
};
