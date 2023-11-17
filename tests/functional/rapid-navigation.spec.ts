import { test, expect } from '@playwright/test';

import { waitForSwup } from '../support/swup.js';
import { clickOnLink, sleep } from '../support/commands.js';
import { prefixed } from '../support/utils.js';

const url = prefixed('/rapid-navigation/');

test.describe('gracefully handle rapid navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(url('/page-1.html'));
		await waitForSwup(page);
	});

	test('ignore hook events from expired visits', async ({ page }) => {
		const expected = [
			'visit:start',
			'animation:out:start',
			'fetch:request',
			'page:load',
			'animation:out:await',
			'animation:out:end',
			'content:replace',
			'scroll:top',
			'content:scroll',
			'page:view',
			'animation:in:start',
			'animation:in:await',
			'animation:in:end',
			'visit:transition',
			'visit:end'
		];
		await clickOnLink(page, url('/page-2.html'));
		await sleep(300);
		await clickOnLink(page, url('/page-3.html'));

		await page.waitForSelector('html:not([aria-busy=true])');
		const received = await page.evaluate(() => window.data.received);
		expect(received).toEqual(expected);
	});
});
