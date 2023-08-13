/* eslint-env node */
module.exports = {
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended-type-checked'],
	plugins: ['@typescript-eslint'],
	/* First exclude everything, then re-include /src, then exclude tests */
	ignorePatterns: ['/*', '!/src', '*.test.ts'],
	rules: {
		'no-unused-vars': ['error', { vars: 'all', args: 'none' }],
		'@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
		'@typescript-eslint/unbound-method': 'off',
		'@typescript-eslint/no-floating-promises': 'off',
		'@typescript-eslint/no-redundant-type-constituents': 'off'
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: true,
		tsconfigRootDir: __dirname
	},
	root: true
};
