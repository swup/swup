import { describe, expect, it, vi, afterEach } from 'vitest';
import Swup from '../../src/Swup.js';
import type { PageData } from '../../src/modules/fetchPage.js';
import { JSDOM } from 'jsdom';

const getHtml = (body: string): string => {
	return /*html*/ `
		<!DOCTYPE html>
		<body>
			${body}
		</body>
	`;
};

const mockPage = (body: string): PageData => {
	return {
		url: '',
		html: getHtml(body)
	};
};

const stubGlobalDocument = (body: string): void => {
	const dom = new JSDOM(getHtml(body));
	vi.stubGlobal('document', dom.window.document);
};

describe('replaceContent', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should replace containers', () => {
		stubGlobalDocument(/*html*/ `
			<div id="container-1" data-from="current"></div>
			<div id="container-2" data-from="current"></div>
			<div id="container-3" data-from="current"></div>
		`);

		const page = mockPage(/*html*/ `
			<div id="container-1" data-from="incoming"></div>
			<div id="container-2" data-from="incoming"></div>`);
		const swup = new Swup();

		const result = swup.replaceContent(page, { containers: ['#container-1', '#container-2'] });

		expect(result).toBe(true);
		expect(document.querySelector('#container-1')?.getAttribute('data-from')).toBe('incoming');
		expect(document.querySelector('#container-2')?.getAttribute('data-from')).toBe('incoming');
		expect(document.querySelector('#container-3')?.getAttribute('data-from')).toBe('current');
	});

	it('should handle missing containers in current DOM', () => {
		stubGlobalDocument(/*html*/ `
			<div id="container-1" data-from="current"></div>
		`);
		const warn = vi.spyOn(console, 'warn');
		const page = mockPage(/*html*/ `
			<div id="container-1" data-from="incoming"></div>
			<div id="container-2" data-from="incoming"></div>
			`);

		const swup = new Swup();
		const result = swup.replaceContent(page, { containers: ['#container-1', '#missing'] });

		expect(result).toBe(false);
		expect(warn).not.toBeCalledWith(
			'[swup] Container missing in current document: #container-1'
		);
		expect(warn).toBeCalledWith('[swup] Container missing in current document: #missing');
	});

	it('should handle missing containers in incoming DOM', () => {
		stubGlobalDocument(/*html*/ `
			<div id="container-1" data-from="current"></div>
			<div id="container-2" data-from="current"></div>
			<div id="container-3" data-from="current"></div>
		`);
		const warn = vi.spyOn(console, 'warn');
		const page = mockPage(/*html*/ `
			<div id="container-1" data-from="incoming"></div>`);

		const swup = new Swup();
		const result = swup.replaceContent(page, { containers: ['#container-1', '#missing'] });

		expect(result).toBe(false);
		expect(warn).not.toBeCalledWith(
			'[swup] Container missing in incoming document: #container-1'
		);
		expect(warn).toBeCalledWith('[swup] Container missing in incoming document: #missing');
	});
});
