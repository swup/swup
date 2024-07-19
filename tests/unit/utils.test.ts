import { describe, expect, it, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

import { getContextualAttr, isPromise, query, queryAll } from '../../src/utils.js';

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
		expect(query('.test')?.textContent).toBe('Test');
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

describe('queryAll', () => {
	it('should call querySelectorAll on document', () => {
		const doc = stubGlobalDocument(``);
		const spy = vi.spyOn(doc, 'querySelectorAll');
		queryAll('.selector');
		expect(spy).toHaveBeenCalledWith('.selector');
	});

	it('returns an array', () => {
		const els = queryAll('.lorem-ipsum');
		expect(Array.isArray(els)).toBe(true);
	});

	it('should return queried elements', () => {
		stubGlobalDocument(`<div class="test">Test 1</div><div class="test">Test 2</div>`);
		expect(queryAll('.test').map(el => el.textContent)).toStrictEqual(['Test 1', 'Test 2']);
	});

	it('should accept a custom root element', () => {
		const doc = stubGlobalDocument(/*html*/ `
			<div class="sibling">Sibling</div>
			<div class="nested">
				<div class="child">Child</div>
				<div class="child">Child</div>
			</div>
		`);

		const root = doc.querySelector('.nested')!;
		expect(queryAll('.sibling')).toStrictEqual([...doc.querySelectorAll('.sibling')]);
		expect(queryAll('.sibling', root)).toStrictEqual([]);
		expect(queryAll('.child', root)).toStrictEqual([...doc.querySelectorAll('.child')]);
	});
});

describe('isPromise', () => {
	it('accepts promises', () => {
		expect(isPromise(Promise.resolve())).toBe(true);
		expect(isPromise(new Promise(() => {}))).toBe(true);
	});

	it('accepts Promise-like objects', () => {
		expect(isPromise({ then: () => {} })).toBe(true);
		expect(isPromise({ then: () => {}, catch: () => {} })).toBe(true);
	});

	it('rejects non-promises', () => {
		expect(isPromise(0)).toBe(false);
		expect(isPromise('a')).toBe(false);
		expect(isPromise([1, 2, 3])).toBe(false);
		expect(isPromise({ b: 'c' })).toBe(false);
	});
});

describe('getContextualAttr', () => {
	it('gets attribute value from element', () => {
		const doc = stubGlobalDocument(/*html*/ `<div attr="value"></div>`);
		const el = doc.querySelector('div')!;
		expect(getContextualAttr(el, 'attr')).toBe('value');
	});

	it('returns true for attrs without value', () => {
		const doc = stubGlobalDocument(/*html*/ `<div disabled></div>`);
		const el = doc.querySelector('div')!;
		expect(getContextualAttr(el, 'disabled')).toBe(true);
	});

	it('gets attribute value from parent', () => {
		const doc = stubGlobalDocument(/*html*/ `<section attr="value"><div></div></section>`);
		const el = doc.querySelector('div')!;
		expect(getContextualAttr(el, 'attr')).toBe('value');
	});

	it('prefers attribute value from element', () => {
		const doc = stubGlobalDocument(/*html*/ `<section attr="parent"><div attr="self"></div></section>`);
		const el = doc.querySelector('div')!;
		expect(getContextualAttr(el, 'attr')).toBe('self');
	});

	it('returns null for missing attribute', () => {
		const doc = stubGlobalDocument(/*html*/ `<div></div>`);
		const el = doc.querySelector('div')!;
		expect(getContextualAttr(el, 'attr')).toBe(undefined);
	});

	it('returns null for missing element', () => {
		const doc = stubGlobalDocument(/*html*/ `<div></div>`);
		const el = doc.querySelector('h1')!;
		expect(getContextualAttr(el, 'attr')).toBe(undefined);
	});
});
