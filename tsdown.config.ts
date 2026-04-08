import { defineConfig } from 'tsdown';
import { rename, readdir } from 'node:fs/promises';
import { join } from 'node:path';

export default defineConfig([
	// ESM & CJS: dependencies unbundled, for use in bundlers
	{
		entry: ['src/index.ts'],
		format: ['esm', 'cjs'],
		platform: 'browser',
		dts: true,
		clean: true,
		minify: true,
		deps: { onlyAllowBundle: false },
		hooks: {
			'build:done': cleanDtsFiles
		}
	},
	// ESM bundle: module build with all deps bundled, mainly for browser testing
	{
		entry: { 'index.bundle': 'src/index.ts' },
		format: ['esm'],
		platform: 'browser',
		minify: false,
		deps: { alwaysBundle: [/.*/], onlyAllowBundle: false }
	},
	// IIFE: nomodule build with all deps bundled and global Swup export
	{
		entry: { 'swup': 'src/Swup.ts' },
		format: ['iife'],
		globalName: 'Swup',
		platform: 'browser',
		minify: true,
		deps: { alwaysBundle: [/.*/], onlyAllowBundle: false }
	},
]);

// Rename hashed .d.ts files to stable names (e.g., index-abc123.d.ts -> index.d.ts)
async function cleanDtsFiles() {
	const files = await readdir('dist');
	for (const file of files) {
		if (file.match(/^\w+-[^.]+(\.d\.(m|c)?ts)(\.map)?$/)) {
			const clean = file.replace(/^(\w+)-[^.]+\./, '$1.');
			await rename(join('dist', file), join('dist', clean));
		}
	}
}
