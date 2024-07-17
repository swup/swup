import { describe, expect, it, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

import { query } from '../../src/utils.js';

const createDocument = (body: string): Document => {
	const dom = new JSDOM(/*html*/ `<!DOCTYPE html><body>${body}</body>`);
	return dom.window.document;
};

const stubGlobalDocument = (body: string): Document => {
	vi.stubGlobal('document', createDocument(body));
	return document;
};

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('query', () => {
	it('should call querySelector on document', () => {
		const doc = stubGlobalDocument(``);
		const spy = vi.spyOn(doc, 'querySelector');
		query('.selector');
		expect(spy).toHaveBeenCalledWith('.selector');
	});

	it('should return queried element', () => {
		stubGlobalDocument(`<div class="test">Test</div>`);
		const el = query('.test');
		expect(el?.textContent).toBe('Test');
	});

	it('should accept a custom root element', () => {
		const doc = stubGlobalDocument(/*html*/ `
			<div class="sibling">Sibling</div>
			<div class="nested">
				<div class="child">Child</div>
			</div>
		`);

		const root = doc.querySelector('.nested')!;
		expect(query('.sibling')).toBe(doc.querySelector('.sibling'));
		expect(query('.sibling', root)).toBe(null);
		expect(query('.child', root)).toBe(doc.querySelector('.child'));
	});
});
