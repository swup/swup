import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettiereslintRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig(
	eslint.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	prettiereslintRecommended,
	{
		/* First exclude everything, then re-include /src, then exclude tests */
		ignores: ['/*', '!/src', '**/*.test.ts'],
	},
	{
		files: ['**/*.ts', '!*.test.ts'],
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { vars: 'all', args: 'none' }],
			'@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
			'@typescript-eslint/unbound-method': 'off',
			'@typescript-eslint/no-floating-promises': 'off',
			'@typescript-eslint/no-redundant-type-constituents': 'off'
		},
		languageOptions: {
			// parser: '@typescript-eslint/parser',
			parserOptions: {
				projectService: true,
				allowDefaultProject: ['tests/**/*.ts'],
				tsconfigRootDir: import.meta.dirname
			},
		},
	},
);
