import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import Swup from '../../src/Swup.js';
import type { PageData } from '../../src/modules/fetchPage.js';
import { Visit, createVisit } from '../../src/modules/Visit.js';
import { JSDOM } from 'jsdom';

const getHtml = (body: string): string => {
	return /*html*/ `
		<!DOCTYPE html>
		<body>
			${body}
		</body>
	`;
};

const stubGlobalDocument = (body: string): void => {
	const dom = new JSDOM(getHtml(body));
	vi.stubGlobal('document', dom.window.document);
};

class SwupWithPublicVisitMethods extends Swup {
	public createVisit = createVisit;
}

const swup = new SwupWithPublicVisitMethods();
let visit: Visit;

describe('replaceContent', () => {
	beforeEach(() => {
		visit = swup.createVisit({ to: '' });
	});
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should replace containers', () => {
		stubGlobalDocument(/*html*/ `
			<div id="container-1" data-from="current"></div>
			<div id="container-2" data-from="current"></div>
			<div id="container-3" data-from="current"></div>
		`);

		const html = /*html*/ `
			<div id="container-1" data-from="incoming"></div>
			<div id="container-2" data-from="incoming"></div>`;
		visit.to.document = new DOMParser().parseFromString(html, 'text/html')
		visit.containers = ['#container-1', '#container-2'];

		const result = new Swup().replaceContent(visit);

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
		const html = /*html*/ `
			<div id="container-1" data-from="incoming"></div>
			<div id="container-2" data-from="incoming"></div>
			`;
		visit.to.document = new DOMParser().parseFromString(html, 'text/html')
		visit.containers = ['#container-1', '#missing'];

		const result = new Swup().replaceContent(visit);

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
		const html = /*html*/ `<div id="container-1" data-from="incoming"></div>`;
		visit.to.document = new DOMParser().parseFromString(html, 'text/html')
		visit.containers = ['#container-1', '#missing'];

		const result = new Swup().replaceContent(visit);

		expect(result).toBe(false);
		expect(warn).not.toBeCalledWith(
			'[swup] Container missing in incoming document: #container-1'
		);
		expect(warn).toBeCalledWith('[swup] Container missing in incoming document: #missing');
	});

	it('should not modify new document in visit object', () => {
		stubGlobalDocument(/*html*/ `<div id="container" data-from="current"></div>`);
		const html = /*html*/ `<div id="container" data-from="incoming"></div>`;
		visit.to.document = new DOMParser().parseFromString(html, 'text/html')
		visit.containers = ['#container'];

		const documentBefore = visit.to.document.documentElement.innerHTML;
		new Swup().replaceContent(visit);
		const documentAfter = visit.to.document.documentElement.innerHTML;

		expect(documentBefore).toEqual(documentAfter);
		expect(documentAfter).toContain(html);
	});
});
