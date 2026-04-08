import { test as base, expect } from '@playwright/test';
import { injectImportMap } from './utils.js';
import { importMap } from '../config/playwright.config.js';

// Custom base test fixture that automatically injects import maps
export const test = base.extend({
	page: async ({ page }, use) => {
		await page.route('**/*.html', async (route) => {
			const response = await route.fetch();
			const headers = response.headers();
			const body = injectImportMap(await response.text(), importMap);
			await route.fulfill({ response, headers, body });
		});
		await use(page);
	}
});

// Re-export expect for convenience
export { expect };
