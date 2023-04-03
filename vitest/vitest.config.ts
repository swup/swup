/**
 * Vitest config file
 * @see https://vitest.dev/config/
 */

import path from "path";
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(__filename);

export default defineConfig({
	test: {
		environment: 'jsdom',
		setupFiles: [
			path.resolve(__dirname, './vitest.setup.ts'),
		]
	}
});
