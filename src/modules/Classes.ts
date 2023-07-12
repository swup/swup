import Swup from '../Swup.js';
import { queryAll } from '../utils.js';

export class Classes {
	public swup: Swup;

	swupClasses = ['to-', 'is-changing', 'is-rendering', 'is-popstate', 'is-animating'];

	constructor(swup: Swup) {
		this.swup = swup;
	}

	get containerSelectors(): string[] {
		const { scope } = this.swup.context.animation;
		return scope === 'containers' ? this.swup.context.containers : ['html'];
	}

	get selector(): string {
		return this.containerSelectors.join(',');
	}

	get targets(): HTMLElement[] {
		if (!this.selector.trim()) return [];
		return queryAll(this.selector) as HTMLElement[];
	}

	public add(...classes: string[]): void {
		this.targets.forEach((target) => target.classList.add(...classes));
	}

	public remove(...classes: string[]): void {
		this.targets.forEach((target) => target.classList.remove(...classes));
	}

	public clear(): void {
		this.targets.forEach((target) => {
			const remove = target.className.split(' ').filter((c) => this.isSwupClass(c));
			target.classList.remove(...remove);
		});
	}

	private isSwupClass(className: string): boolean {
		return this.swupClasses.some((c) => className.startsWith(c));
	}
}
