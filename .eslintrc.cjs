/* eslint-env node */
module.exports = {
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: true,
		tsconfigRootDir: __dirname
	},
	plugins: ['@typescript-eslint'],
	root: true,
	ignorePatterns: ['/*', '!/src', '*.test.ts'],
	rules: {
		'no-unused-vars': ['error', { vars: 'all', args: 'none' }],
		'@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
	}
};
