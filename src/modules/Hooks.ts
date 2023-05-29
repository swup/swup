import { DelegateEvent } from 'delegate-it';

import Swup from '../Swup.js';

export type PageContext = {
	url: string;
	response: string;
	title: string;
	blocks: HTMLElement[];
};

export type HookContext<TEvent = undefined> = {
	swup: Swup;
	hook: HookName;
	from?: PageContext;
	to?: PageContext;
	originalEvent?: TEvent;
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

type HookName = keyof HookDefinitions;

export type Handler<T extends HookName> = (swup: Swup, context: HookDefinitions[T]) => Promise<void> | void;

export type Handlers = {
	[Key in HookName]: Handler<Key>[];
};

type HookRegistration<T extends HookName> = {
	id: string;
	hook: T;
	handler: Handler<T>;
	before?: boolean;
	after?: boolean;
	priority?: number;
};

type HookLedger<T extends HookName> = Map<Handler<T>, HookRegistration<T>>;
type HookRegistry = Map<HookName, HookLedger<HookName>>;

export class Hooks {
	registry: HookRegistry;
	swup: Swup;

	constructor(swup: Swup) {
		this.swup = swup;
		this.registry = new Map();
	}

	add<THook extends HookName>(hook: THook, handler: Handler<THook>) {
		const ledger = this.registry.get(hook) || new Map();
		this.registry.set(hook, ledger);

		const id = ledger.size.toString();
		const registration: HookRegistration<THook> = { id, hook, handler };
		ledger.set(handler, registration);
	}

	call<T extends HookName>(hook: T, data: HookDefinitions[T], handler?: Function) {
		const ledger = this.registry.get(hook);
		if (ledger) {
			ledger.forEach((entry) => {
				entry.handler(this.swup, data);
			});
		}
	}

	// async wait<T extends HookName>(hook: T, data: HookDefinitions[T], handler: Function) {
	// 	const collection = this.registry.get(hook);
	// 	if (collection) {
	// 		for (const registration of collection.values()) {
	// 			await registration.handler(this.swup, data);
	// 		}
	// 	}
	// }
}
