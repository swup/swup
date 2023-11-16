import type Swup from '../Swup.js';
import { queryAll } from '../utils.js';

export class Classes {
	protected swup: Swup;
	protected swupClasses = [
		'to-',
		'is-changing',
		'is-rendering',
		'is-popstate',
		'is-animating',
		'is-leaving'
	];

	constructor(swup: Swup) {
		this.swup = swup;
	}

	protected get selectors(): string[] {
		const { scope } = this.swup.visit.animation;
		if (scope === 'containers') return this.swup.visit.containers;
		if (scope === 'html') return ['html'];
		if (Array.isArray(scope)) return scope;
		return [];
	}

	protected get selector(): string {
		return this.selectors.join(',');
	}

	protected get targets(): HTMLElement[] {
		if (!this.selector.trim()) return [];
		return queryAll(this.selector);
	}

	add(...classes: string[]): void {
		this.targets.forEach((target) => target.classList.add(...classes));
	}

	remove(...classes: string[]): void {
		this.targets.forEach((target) => target.classList.remove(...classes));
	}

	clear(): void {
		this.targets.forEach((target) => {
			const remove = target.className.split(' ').filter((c) => this.isSwupClass(c));
			target.classList.remove(...remove);
		});
	}

	protected isSwupClass(className: string): boolean {
		return this.swupClasses.some((c) => className.startsWith(c));
	}
}
