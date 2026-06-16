import { defineConfig } from 'tsdown';
import { rename, readdir } from 'node:fs/promises';
import { join } from 'node:path';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'],
	platform: 'browser',
	dts: true,
	clean: true,
	minify: true,
	deps: { onlyBundle: false },
	hooks: {
		'build:done': cleanDtsFiles
	}
});

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
