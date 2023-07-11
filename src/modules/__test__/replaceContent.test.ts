import { describe, expect, it, vi, beforeEach } from 'vitest';
import Swup from '../../Swup.js';
import type { PageData } from '../fetchPage.js';

import { JSDOM } from 'jsdom';

const getPage = (body: string): PageData => {
	return {
		url: '',
		html: /*html*/ `
				<!DOCTYPE html>
				<body>
					${body}
				</body>
			`
	};
};

describe('replaceContent', () => {
	beforeEach(() => {
		const dom = new JSDOM(/*html*/ `
			<!DOCTYPE html>
			<body>
				<div id="container-1"></div>
				<div id="container-2"></div>
			</body>
		`);
		vi.stubGlobal('document', dom.window.document);
	});

	it('should replace containers', () => {
		const page = getPage(/*html*/ `
			<div id="container-1" data-source="incoming"></div>
			<div id="container-2" data-source="incoming"></div>`);
		const swup = new Swup();

		const result = swup.replaceContent(page, { containers: ['#container-1'] });

		expect(result).toBe(true);
		expect(document.querySelector('#container-1')?.getAttribute('data-source')).toBe(
			'incoming'
		);
	});

	it('should return false if containers mismatch', () => {
		const page = getPage(/*html*/ `
			<div id="container-1" data-source="incoming"></div>`);

		const swup = new Swup();
		const result = swup.replaceContent(page, { containers: ['#container-1', '#container-2'] });

		expect(result).toBe(false);
	});
});
