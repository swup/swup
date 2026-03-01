import { defineConfig } from 'tsdown';
import { rename, readdir } from 'node:fs/promises';
import { join } from 'node:path';

async function renameDtsFiles() {
	const files = await readdir('dist');
	for (const file of files) {
		// Rename hashed .d.ts files to stable names (e.g., Swup-abc123.d.ts -> Swup.d.ts)
		const match = file.match(/^Swup-[^.]+\.(d\.ts|d\.mts|d\.cts)(\.map)?$/);
		if (match) {
			const newName = file.replace(/^Swup-[^.]+\./, 'Swup.');
			await rename(join('dist', file), join('dist', newName));
		}
	}
}

export default defineConfig([
	// ESM build
	{
		entry: { Swup: 'src/index.ts' },
		format: ['esm'],
		dts: true,
		clean: true,
		minify: true,
		deps: { onlyAllowBundle: false },
		hooks: {
			'build:done': renameDtsFiles
		}
	},
	// CJS build
	{
		entry: { Swup: 'src/index.ts' },
		format: ['cjs'],
		dts: false,
		minify: true,
		deps: { onlyAllowBundle: false }
	},
	// IIFE build: browser bundle with all deps bundled
	{
		entry: { Swup: 'src/Swup.ts' },
		format: ['iife'],
		globalName: 'Swup',
		platform: 'browser',
		minify: true,
		deps: { alwaysBundle: [/.*/], onlyAllowBundle: false }
	}
]);
