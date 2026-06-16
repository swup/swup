import { defineConfig } from 'tsdown';

export default defineConfig([
	/* ESM: main build */
	{
		entry: ['src/index.ts'],
		format: ['esm'],
		platform: 'browser',
		dts: true,
		clean: true,
		minify: true,
		deps: { onlyBundle: false },
	},
	/* ESM bundle: for e2e testing */
	{
		entry: { 'index.bundle': 'src/index.ts' },
		format: ['esm'],
		platform: 'browser',
		minify: true,
		deps: { alwaysBundle: [/.*/], onlyBundle: false }
	},
]);
