import Swup from '../Swup.js';

export class Classes {
	public swup: Swup;

	swupClasses = ['to-', 'is-changing', 'is-rendering', 'is-popstate'];

	constructor(swup: Swup) {
		this.swup = swup;
	}

	get selectors(): string[] {
		const { targets } = this.swup.context.transition;
		return targets || ['html'];
	}

	get targets(): Element[] {
		return Array.from(document.querySelectorAll(this.selectors.join(',')));
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
