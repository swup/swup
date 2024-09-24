/* eslint-env node */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default [
	includeIgnoreFile(gitignorePath),
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		ignores: [
			'/',
			'/*.*',
			'!src/',
			'**/*.test.ts'
		]
	},
	{
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { vars: 'all', args: 'none' }],
			'@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
			'@typescript-eslint/unbound-method': 'off',
			'@typescript-eslint/no-floating-promises': 'off',
			'@typescript-eslint/no-redundant-type-constituents': 'off'
		},
	}
];
