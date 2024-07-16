import { beforeEach, describe, expect, it } from 'vitest';

import Swup from '../../src/index.js';
import { calculateTimeout, getStyleProperties, toMs } from '../../src/modules/awaitAnimations.js';

describe('awaitAnimations', () => {
	it('returns a Promise', () => {
		const swup = new Swup();
		expect(swup.awaitAnimations({ selector: 'main' })).toBeInstanceOf(Promise);
		expect(swup.awaitAnimations({ selector: false })).toBeInstanceOf(Promise);
		expect(swup.awaitAnimations({ selector: false, elements: [] })).toBeInstanceOf(Promise);
	});
});

describe('getStyleProperties', () => {
	let element: HTMLElement;

	beforeEach(() => {
		element = document.createElement('div');
	});

	it('returns an array', () => {
		const style = window.getComputedStyle(element);
		expect(getStyleProperties(style, 'transitionDelay')).toBeInstanceOf(Array);
	});

	it('gets correct element style', () => {
		element.style.transitionDuration = '1s';
		const style = window.getComputedStyle(element);
		expect(getStyleProperties(style, 'transitionDuration')).toEqual(['1s']);
		expect(getStyleProperties(style, 'animationDuration')).toEqual(['']);
	});

	it('splits style declaration by comma', () => {
		element.style.transitionDelay = '1s, 2s';
		const style = window.getComputedStyle(element);
		expect(getStyleProperties(style, 'transitionDelay')).toEqual(['1s', '2s']);
	});
});

describe('calculateTimeout', () => {
	it('returns a number', () => {
		expect(typeof calculateTimeout(['1000ms'], ['0ms'])).toBe('number');
	});

	it('converts to milliseconds', () => {
		expect(calculateTimeout(['1s'], ['0s'])).toEqual(1000);
	});

	it('adds delay to duration', () => {
		expect(calculateTimeout(['1s'], ['3s'])).toEqual(4000);
	});

	it('uses highest value', () => {
		expect(calculateTimeout(['1s', '2s'], ['1s', '2s'])).toEqual(4000);
		expect(calculateTimeout(['1s', '2s'], ['4s', '1s'])).toEqual(5000);
		expect(calculateTimeout(['3s', '2s'], ['2s', '4s'])).toEqual(6000);
	});
});

describe('toMs', () => {
	it('returns a number', () => {
		expect(typeof toMs('1000s')).toBe('number');
	});

	it('converts to milliseconds', () => {
		expect(toMs('1s')).toBe(1000);
		expect(toMs('2s')).toBe(2000);
		expect(toMs('10s')).toBe(10000);
	});

	it('ignores units', () => {
		expect(toMs('1ms')).toBe(1000);
		expect(toMs('2sec')).toBe(2000);
		expect(toMs(10 as any as string)).toBe(10000);
	});
});
