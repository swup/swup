import { DelegateEvent } from 'delegate-it';

import Swup from '../Swup.js';
import { isPromise, runAsPromise } from '../utils.js';

export type EventDefinitions = {
	animationInDone: undefined;
	animationInStart: undefined;
	animationOutDone: undefined;
	animationOutStart: undefined;
	animationSkipped: undefined;
	clickLink: DelegateEvent<MouseEvent>;
	contentReplaced: PopStateEvent | undefined;
	disabled: undefined;
	enabled: undefined;
	openPageInNewTab: DelegateEvent<MouseEvent>;
	pageLoaded: undefined;
	pageRetrievedFromCache: undefined;
	pageView: PopStateEvent | undefined;
	popState: PopStateEvent;
	samePage: DelegateEvent<MouseEvent>;
	samePageWithHash: DelegateEvent<MouseEvent>;
	serverError: undefined;
	transitionStart: PopStateEvent | undefined;
	transitionEnd: PopStateEvent | undefined;
	willReplaceContent: PopStateEvent | undefined;
};

export type EventArgument<TEvent extends EventName> = EventDefinitions[TEvent];

export type EventName = keyof EventDefinitions;

export type Handler<TEvent extends EventName> = (
	data: EventArgument<TEvent>
) => Promise<void> | void;

export type Handlers = {
	[Key in EventName]: Handler<Key>[];
};

export type EventOptions = {
	once?: boolean;
	before?: boolean;
	priority?: number;
	replace?: boolean;
};

export type EventRegistration<TEvent extends EventName> = {
	id: number;
	event: TEvent;
	handler: Handler<TEvent>;
} & EventOptions;

type EventLedger<TEvent extends EventName> = Map<Handler<TEvent>, EventRegistration<TEvent>>;

type EventRegistry = Map<EventName, EventLedger<EventName>>;

export class Events {
	swup: Swup;
	registry: EventRegistry = new Map();

	// Can we deduplicate this somehow? Or make it error when not in sync with EventDefinitions?
	// https://stackoverflow.com/questions/53387838/how-to-ensure-an-arrays-values-the-keys-of-a-typescript-interface/53395649
	defaultEvents: EventName[] = [
		'animationInDone',
		'animationInStart',
		'animationOutDone',
		'animationOutStart',
		'animationSkipped',
		'clickLink',
		'contentReplaced',
		'disabled',
		'enabled',
		'openPageInNewTab',
		'pageLoaded',
		'pageRetrievedFromCache',
		'pageView',
		'popState',
		'samePage',
		'samePageWithHash',
		'serverError',
		'transitionStart',
		'transitionEnd',
		'willReplaceContent'
	];

	constructor(swup: Swup) {
		this.swup = swup;
		this.init();
	}

	init() {
		this.defaultEvents.forEach((event) => this.create(event));
	}

	create(event: EventName) {
		if (!this.registry.has(event)) {
			this.registry.set(event, new Map());
		}
	}

	has(event: EventName): boolean {
		return this.registry.has(event);
	}

	get<TEvent extends EventName>(event: TEvent): EventLedger<TEvent> | undefined {
		const ledger = this.registry.get(event) as EventLedger<TEvent> | undefined;
		if (ledger) {
			return ledger;
		} else {
			console.error(`Unknown event ${event}.`);
		}
	}

	add<TEvent extends EventName>(
		event: TEvent,
		handler: Handler<TEvent>,
		options: EventOptions = {}
	) {
		const ledger = this.get(event);
		if (!ledger) {
			return;
		}

		const id = ledger.size + 1;
		const registration: EventRegistration<TEvent> = { ...options, id, event, handler };
		ledger.set(handler, registration);
	}

	before<TEvent extends EventName>(
		event: TEvent,
		handler: Handler<TEvent>,
		options: EventOptions = {}
	) {
		return this.add(event, handler, { ...options, before: true });
	}

	replace<TEvent extends EventName>(
		event: TEvent,
		handler: Handler<TEvent>,
		options: EventOptions = {}
	) {
		return this.add(event, handler, { ...options, replace: true });
	}

	once<TEvent extends EventName>(
		event: TEvent,
		handler: Handler<TEvent>,
		options: EventOptions = {}
	) {
		return this.add(event, handler, { ...options, once: true });
	}

	remove<TEvent extends EventName>(event: TEvent, handler?: Handler<TEvent>) {
		const ledger = this.get(event);

		if (ledger && handler) {
			const deleted = ledger.delete(handler);
			if (!deleted) {
				console.warn(`Handler for event '${event}' not found.`);
			}
		} else if (ledger) {
			ledger.clear();
		}
	}

	clear() {
		this.registry.forEach((ledger) => ledger.clear());
	}

	async run<TEvent extends EventName>(
		event: TEvent,
		data?: EventArgument<TEvent>,
		handler?: Function
	) {
		const { before, after, replace } = this.getHandlers(event);
		const results = [
			...(await this.execute(before, data)),
			...(handler && !replace ? [await runAsPromise(handler, [data], this.swup)] : []),
			...(await this.execute(after, data))
		];
		this.triggerDomEvent(event);
		return results;
	}

	runSync<TEvent extends EventName>(
		event: TEvent,
		data?: EventArgument<TEvent>,
		handler?: Function
	) {
		const { before, after, replace } = this.getHandlers(event);
		const results = [
			...this.executeSync(before, data),
			...(handler && !replace ? [handler(data)] : []),
			...this.executeSync(after, data)
		];
		this.triggerDomEvent(event);
		return results;
	}

	async execute<TEvent extends EventName>(
		registrations: EventRegistration<TEvent>[],
		data: EventArgument<TEvent>
	): Promise<any> {
		const results = [];
		for (const { event, handler, once } of registrations) {
			try {
				results.push(await runAsPromise(handler, [data], this.swup));
			} catch (error) {
				console.error(error);
			}
			if (once) {
				this.remove(event, handler);
			}
		}
		return results;
	}

	executeSync<TEvent extends EventName>(
		registrations: EventRegistration<TEvent>[],
		data: EventArgument<TEvent>
	): any[] {
		const results = [];
		for (const { event, handler, once } of registrations) {
			try {
				const result = handler(data);
				if (isPromise(result)) {
					console.warn(
						`Promise returned from handler for synchronous event '${event}'.` +
							`Swup will not wait for it to resolve.`
					);
				}
				results.push(result);
			} catch (error) {
				console.error(error);
			}
			if (once) {
				this.remove(event, handler);
			}
		}
		return results;
	}

	// Trigger event on document with prefix `swup:`
	triggerDomEvent<TEvent extends EventName>(event: TEvent) {
		document.dispatchEvent(new CustomEvent(`swup:${event}`, { detail: event }));
	}

	getHandlers(event: EventName) {
		const ledger = this.get(event);
		if (!ledger) {
			return { found: false, before: [], after: [] };
		}

		const registrations = Array.from(ledger.values());
		const before = this.sort(registrations.filter(({ before, replace }) => before || replace));
		const after = this.sort(registrations.filter(({ before, replace }) => !before && !replace));
		const replace = registrations.some(({ replace }) => replace);

		return { found: true, before, after, replace };
	}

	sort<TEvent extends EventName>(registrations: EventRegistration<TEvent>[]) {
		// sort by priority first, by id second
		return registrations.sort((a, b) => {
			const priority = (b.priority ?? 0) - (a.priority ?? 0);
			const id = a.id - b.id;
			return priority || id || 0;
		});
	}
}

/**
 * Return a proxy object that allows writing to `swup._handlers`.
 * When setting a property on this proxy, it will instead create a new event with the given name.
 * Mostly here for backwards compatibility with older plugins.
 */
export class HandlersProxy {
	swup: Swup;

	constructor(swup: Swup) {
		this.swup = swup;
		return new Proxy<HandlersProxy>(this, { set: this.set, get: this.get });
	}

	set(target: any, event: EventName, value: any): boolean {
		console.warn(
			'Writing to `swup._handlers` is no longer supported. ' +
				'Use `swup.events.create()` instead.'
		);
		if (!this.swup.events.has(event)) {
			this.swup.events.create(event);
		}
		return true;
	}

	get(target: any, event: EventName, value: any): [] {
		console.warn(
			'Reading from `swup._handlers` is no longer supported. ' +
				'Use `swup.events.get()` instead.'
		);
		return [];
	}
}
