import { test, expect } from '@playwright/test';

import { expectToBeAt, expectToHaveText } from '../support/commands.js';
import { navigateWithSwup, waitForSwup } from '../support/swup.js';

test.describe('persisting', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/persist-1.html');
		await waitForSwup(page);
	});

	test('persists elements across page loads', async ({ page }) => {
		const identifier = String(Math.random());
		const persistedEl = page.getByTestId('persisted');
		const unpersistedEl = page.getByTestId('unpersisted');

		const state = await persistedEl.evaluate((el, id) => el.dataset.id = id, identifier);

		await navigateWithSwup(page, '/persist-2.html');

		await expectToBeAt(page, '/persist-2.html', 'Persist 2');
		await expectToHaveText(persistedEl, 'Persist 1');
		await expectToHaveText(unpersistedEl, 'Persist 2');

		const persistedState = await persistedEl.evaluate((el) => el.dataset.id);
		expect(persistedState).not.toBeFalsy();
		expect(persistedState).toBe(state);
		expect(persistedState).toBe(identifier);
	});
});
