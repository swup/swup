import { defineConfig } from 'tsdown';
import { rename, readdir } from 'node:fs/promises';
import { join } from 'node:path';

export default defineConfig([
	// ESM & CJS
	{
		entry: ['src/index.ts'],
		format: ['esm', 'cjs'],
		dts: true,
		clean: true,
		minify: true,
		deps: { onlyAllowBundle: false },
		hooks: {
			'build:done': cleanDtsFiles
		}
	},
	// IIFE: browser bundle with all deps bundled
	{
		entry: { Swup: 'src/Swup.ts' },
		format: ['iife'],
		globalName: 'Swup',
		platform: 'browser',
		minify: true,
		deps: { alwaysBundle: [/.*/], onlyAllowBundle: false }
	}
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
