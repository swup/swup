/* eslint-env node */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended-type-checked',
		'plugin:prettier/recommended', // needs to be last
	],
	plugins: ['@typescript-eslint'],
	/* First exclude everything, then re-include /src, then exclude tests */
	ignorePatterns: ['/*', '!/src', '*.test.ts'],
	rules: {
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': ['error', { vars: 'all', args: 'none' }],
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
