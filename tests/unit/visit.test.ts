import { beforeEach, describe, expect, it } from 'vitest';
import Swup from '../../src/Swup.js';
import { Visit, createVisit } from '../../src/modules/Visit.js';

class SwupWithPublicVisitMethods extends Swup {
	public createVisit = createVisit;
}

const swup = new SwupWithPublicVisitMethods();
let visit: Visit;

describe('Visit', () => {
	beforeEach(() => {
		visit = swup.createVisit({ to: '' });
	});

	it('is an object', () => {
		expect(visit).to.be.an('object');
	});

	it('has an id', () => {
		expect(visit.id).to.be.a('number');
	});

	it('generates unique ids', () => {
		let id = visit.id;
		visit = swup.createVisit({ to: '' });
		expect(visit.id).to.not.equal(id);
	});

	it('has a from object with the current URL', () => {
		expect(visit.from).to.be.an('object');
		expect(visit.from.url).to.be.a('string');
		visit = swup.createVisit({ to: '', from: '/from' });
		expect(visit.from).toMatchObject({ url: '/from' });
	});

	it('has a to object with the next URL', () => {
		expect(visit.to).to.be.an('object');
		expect(visit.to.url).to.be.a('string');
		visit = swup.createVisit({ to: '/to' });
		expect(visit.to).toMatchObject({ url: '/to' });
	});

	it('has an animation object', () => {
		expect(visit.animation).to.be.an('object');
		expect(visit.animation).toMatchObject({
			animate: true,
			name: undefined,
			scope: swup.options.animationScope,
			selector: swup.options.animationSelector
		 });
	});

	it('has a container array', () => {
		expect(visit.containers).to.be.an('array');
		expect(visit.containers).toEqual(swup.options.containers);
	});

	it('has a trigger object', () => {
		expect(visit.trigger).to.be.an('object');
		expect(visit.trigger).toMatchObject({
			el: undefined,
			event: undefined
		 });
	});

	it('has a cache object', () => {
		expect(visit.cache).to.be.an('object');
		expect(visit.cache).toEqual({
			read: swup.options.cache,
			write: swup.options.cache
		});
	});

	it('has a history object', () => {
		expect(visit.history).to.be.an('object');
		expect(visit.history).toEqual({
			action: 'push',
			popstate: false,
			direction: undefined
		});
	});

	it('has a scroll object', () => {
		expect(visit.scroll).to.be.an('object');
		expect(visit.scroll).toEqual({
			reset: true,
			target: undefined
		});
	});
});
