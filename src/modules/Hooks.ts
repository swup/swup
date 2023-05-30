import { DelegateEvent } from 'delegate-it';

import Swup from '../Swup.js';
import { runAsPromise } from '../utils.js';

export type PageContext = {
	url: string;
	payload: string;
	title: string;
	blocks: HTMLElement[];
};

export type HookContext<TEvent = undefined> = {
	swup: Swup;
	hook: HookName;
	from?: PageContext;
	to?: PageContext;
	originalEvent?: TEvent;
	triggerElement?: Element;
};

export type HookDefinitions = {
	animationInDone: HookContext;
	animationInStart: HookContext;
	animationOutDone: HookContext;
	animationOutStart: HookContext;
	animationSkipped: HookContext;
	clickLink: HookContext<DelegateEvent<MouseEvent>>;
	contentReplaced: HookContext<PopStateEvent | undefined>;
	disabled: HookContext;
	enabled: HookContext;
	openPageInNewTab: HookContext<DelegateEvent<MouseEvent>>;
	pageLoaded: HookContext;
	pageRetrievedFromCache: HookContext;
	pageView: HookContext<PopStateEvent | undefined>;
	popState: HookContext<PopStateEvent>;
	samePage: DelegateEvent<MouseEvent>;
	samePageWithHash: DelegateEvent<MouseEvent>;
	serverError: HookContext;
	transitionStart: HookContext<PopStateEvent | undefined>;
	transitionEnd: HookContext<PopStateEvent | undefined>;
	willReplaceContent: HookContext<PopStateEvent | undefined>;
};

export type HookName = keyof HookDefinitions;

export type HookData<T extends HookName> = HookDefinitions[T] | Event | undefined;

export type Handler<T extends HookName> = (context: HookDefinitions[T]) => Promise<void> | void;

export type Handlers = {
	[Key in HookName]: Handler<Key>[];
};

export type HookOptions = {
	once?: boolean;
	before?: boolean;
	replace?: boolean;
	priority?: number;
	raw?: boolean;
};

type HookRegistration<T extends HookName> = {
	id: string;
	hook: T;
	handler: Handler<T>;
} & HookOptions;
type HookLedger<T extends HookName> = Map<Handler<T>, HookRegistration<T>>;
type HookRegistry = Map<HookName, HookLedger<HookName>>;

export class Hooks {
	swup: Swup;
	registry: HookRegistry;

	constructor(swup: Swup) {
		this.swup = swup;
		this.registry = new Map();
	}

	// create<THook extends string>(hook: THook) {
	// 	this.registry.set(hook, this.registry.get(hook) || new Map());
	// }

	add<THook extends HookName>(hook: THook, handler: Handler<THook>, options: HookOptions = {}) {
		const ledger = this.registry.get(hook) || new Map();
		this.registry.set(hook, ledger);

		// TODO: check for undefined hooks at runtime
		// console.warn(`Unsupported event ${event}.`);

		const id = ledger.size.toString();
		const registration: HookRegistration<THook> = { id, hook, handler, ...options };
		ledger.set(handler, registration);
	}

	remove<THook extends HookName>(hook: THook, handler?: Handler<THook>) {
		const ledger = this.registry.get(hook);

		if (ledger && handler) {
			const registrations = Array.from(ledger.values());
			const registration = registrations.find((reg) => reg.handler === handler);
			if (registration) {
				ledger.delete(registration.handler);
			} else {
				console.warn(`Handler for hook '${hook}' not found.`);
			}
		} else if (ledger) {
			ledger.clear();
		} else {
			// console.warn(`Hook '${hook}' not found.`);
		}
	}

	clear() {
		this.registry.forEach((ledger) => ledger.clear());
	}

	async call<T extends HookName>(hook: T, data?: HookData<T>, handler?: Function) {
		const ledger = this.registry.get(hook) || new Map();
		const registrations = Array.from(ledger.values());
		const { before, after } = this.bisect(registrations);

		await this.execute(before, data);
		if (handler) {
			await runAsPromise(handler, [data], this.swup);
		}
		await this.execute(after, data);
	}

	async execute<T extends HookName>(registrations: HookRegistration<T>[], data: HookData<T>): Promise<any> {
		for (const { handler } of registrations) {
			try {
				await runAsPromise(handler, [data], this.swup);
			} catch (error) {
				console.error(error);
			}
		}
	}

	bisect<T extends HookName>(registrations: HookRegistration<T>[]) {
		const before = this.sort(registrations.filter(({ before }) => before));
		const after = this.sort(registrations.filter(({ before }) => !before));
		return { before, after };
	}

	sort<T extends HookName>(registrations: HookRegistration<T>[]) {
		return registrations.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
	}
}
