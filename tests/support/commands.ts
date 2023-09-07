import { expect, Locator, Page, Request } from '@playwright/test';

export function sleep(timeout = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(undefined), timeout))
}

export function clickOnLink(page: Page, url: string, options?: Parameters<Page['click']>[1]) {
	return page.click(`a[href="${url}"]`, options);
}

export async function expectToBeAt(page: Page, url: string, title?: string) {
	await expect(page).toHaveURL(url);
	if (title) {
		await expectTitle(page, title);
		await expectH1(page, title);
	}
}

export async function expectTitle(page: Page, title: string) {
	await expect(page).toHaveTitle(title);
}

export async function expectH1(page: Page, title: string) {
	await expect(page.locator('h1')).toContainText(title);
}

export async function expectH2(page: Page, title: string) {
	await expect(page.locator('h2')).toContainText(title);
}

export function expectToHaveText(locator: Locator, text: string) {
	return expect(locator).toContainText(text);
}

export function expectToHaveClass(locator: Locator, className: string, not = false) {
	const regexp = new RegExp(`\\b${className}\\b`);
	return not
		? expect(locator).not.toHaveClass(regexp)
		: expect(locator).toHaveClass(regexp);
}

export function expectNotToHaveClass(locator: Locator, className: string) {
	return expectToHaveClass(locator, className, true);
}

export function expectToHaveClasses(locator: Locator, classNames: string, not = false) {
	const classes = classNames.split(' ');
	return Promise.all(classes.map(className => expectToHaveClass(locator, className, not)));
}

export function expectNotToHaveClasses(locator: Locator, classNames: string) {
	return expectToHaveClasses(locator, classNames, true);
}

export async function expectPageReload(page: Page, action: (page: Page) => Promise<void> | void, not: boolean = false) {
	const origin = () => page.evaluate(() => Math.floor(window.performance.timeOrigin));
	const before = await origin();
	await action(page);
	await expect(async () => expect(await origin()).not.toBe(before)).toPass();
}

export function expectNoPageReload(page: Page, action: (page: Page) => Promise<void> | void) {
	return expectPageReload(page, action, true);
}

export async function expectRequestHeaders(request: Request, headers: Record<string, string>) {
	const expected = Object.fromEntries(
		Object.entries(headers).map(([header, value]) => [header.toLowerCase(), value])
	);
	expect(request.headers()).toMatchObject(expected);
}

export async function delayRequest(page: Page, url: string, timeout: number) {
	await page.route(url, async (route) => {
		await sleep(timeout);
		route.continue();
	})
}

export function scrollToPosition(page: Page,y: number) {
	return page.evaluate((y) => window.scrollTo(0, y), y);
}

export async function expectScrollPosition(page: Page, expected: number) {
	const pos = () => page.evaluate(() => window.scrollY);
	await expect(
		async () => expect(await pos()).toEqual(expected)
	).toPass();
}
