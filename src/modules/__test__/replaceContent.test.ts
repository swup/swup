import { describe, expect, it, vi, beforeEach } from 'vitest';
import Swup from '../../Swup.js';
import type { PageData } from '../fetchPage.js';

import { JSDOM } from 'jsdom';

const getHtml = (body: string): string => {
	return /*html*/ `
		<!DOCTYPE html>
		<body>
			${body}
		</body>
	`;
};

const getPage = (body: string): PageData => {
	return {
		url: '',
		html: getHtml(body)
	};
};

const stubDocument = (body: string = ''): void => {
	if (!body) {
		body = /* html */ `
			<div id="container-1" data-from="current"></div>
			<div id="container-2" data-from="current"></div>
			<div id="container-3" data-from="current"></div>
		`;
	}

	const dom = new JSDOM(getHtml(body));
	vi.stubGlobal('document', dom.window.document);
};

describe('replaceContent', () => {
	beforeEach(() => stubDocument());

	it.only('should replace containers', () => {
		const page = getPage(/*html*/ `
			<div id="container-1" data-from="incoming"></div>
			<div id="container-2" data-from="incoming"></div>`);
		const swup = new Swup();

		const result = swup.replaceContent(page, { containers: ['#container-1', '#container-2'] });

		expect(result).toBe(true);
		expect(document.querySelector('#container-1')?.getAttribute('data-from')).toBe('incoming');
		expect(document.querySelector('#container-2')?.getAttribute('data-from')).toBe('incoming');
		expect(document.querySelector('#container-3')?.getAttribute('data-from')).toBe('current');
	});

	it('should return false if containers are missing in current DOM', () => {
		stubDocument(/*html*/ `
			<div id="container-2"></div>
		`);
		const page = getPage(/*html*/ `
			<div id="container-1" data-from="incoming"></div>
			`);

		const swup = new Swup();
		const result = swup.replaceContent(page, { containers: ['#container-1', '#container-2'] });

		expect(result).toBe(false);
	});

	it('should return false if containers are missing in incoming DOM', () => {
		const page = getPage(/*html*/ `
			<div id="container-1" data-from="incoming"></div>`);

		const swup = new Swup();
		const result = swup.replaceContent(page, { containers: ['#container-1', '#container-2'] });

		expect(result).toBe(false);
	});
});
