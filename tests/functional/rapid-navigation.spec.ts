import { test, expect } from '@playwright/test';

import { waitForSwup } from '../support/swup.js';
import { clickOnLink, sleep } from '../support/commands.js';
import { prefixed } from '../support/utils.js';

const url = prefixed('/rapid-navigation/');

test.describe('gracefully rapid navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(url('/page-1.html'));
		await waitForSwup(page);
	});

	test('should ignore hooks from foreign visits', async ({ page }) => {
		const expected = [
			'animation:out:start',
			'fetch:request',
			'cache:set',
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
		const called = await page.evaluate(() => window.data.calledHooks);
		console.log(called.join(', '));
		expect(called).toEqual(expected);
	});
});
