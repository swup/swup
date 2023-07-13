import { DelegateEvent } from 'delegate-it';

import Swup, { Options } from '../Swup.js';
import { isPromise, runAsPromise } from '../utils.js';
import { Context } from './Context.js';
import { FetchOptions, PageData } from './fetchPage.js';
import { AnimationDirection } from './awaitAnimations.js';

export interface HookDefinitions {
	'animation:out:start': undefined;
	'animation:out:end': undefined;
	'animation:in:start': undefined;
	'animation:in:end': undefined;
	'animation:skip': undefined;
	'animation:await': { direction: AnimationDirection };
	'cache:clear': undefined;
	'cache:set': { page: PageData };
	'content:replace': { page: PageData };
	'content:scroll': { options: ScrollIntoViewOptions };
	'enable': undefined;
	'disable': undefined;
	'fetch:request': { url: string; options: FetchOptions };
	'fetch:error': { url: string; status: number; response: Response };
	'history:popstate': { event: PopStateEvent };
	'link:click': { el: HTMLAnchorElement; event: DelegateEvent<MouseEvent> };
	'link:self': undefined;
	'link:anchor': { hash: string; options: ScrollIntoViewOptions };
	'link:newtab': { href: string };
	'page:request': { url: string; options: FetchOptions };
	'page:load': { page: PageData; cache?: boolean };
	'page:view': { url: string; title: string };
	'visit:start': undefined;
	'visit:end': undefined;
}

export type HookArguments<T extends HookName> = HookDefinitions[T];

export type HookName = keyof HookDefinitions;

export type Handler<T extends HookName> = (
	/** The global context object for the current visit */
	context: Context,
	/** The local arguments passed into the handler */
	args: HookArguments<T>,
	/** The default handler to be executed, available if replacing an internal hook handler */
	defaultHandler?: Handler<T>
) => Promise<any> | void;

export type Handlers = {
	[K in HookName]: Handler<K>[];
};

export type HookOptions = {
	/** Execute the hook once, then remove the handler */
	once?: boolean;
	/** Execute the hook before the internal default handler */
	before?: boolean;
	/** Set a priority for when to execute this hook. Lower numbers execute first. Default: `0` */
	priority?: number;
	/** Replace the internal default handler with this hook handler */
	replace?: boolean;
};

export type HookRegistration<T extends HookName> = {
	id: number;
	hook: T;
	handler: Handler<T>;
} & HookOptions;

type HookLedger<T extends HookName> = Map<Handler<T>, HookRegistration<T>>;

interface HookRegistry extends Map<HookName, HookLedger<HookName>> {
	get<K extends HookName>(key: K): HookLedger<K> | undefined;
	set<K extends HookName>(key: K, value: HookLedger<K>): this;
}

/**
 * Hook registry.
 *
 * Create, trigger and handle hooks.
 *
 */
export class Hooks {
	protected swup: Swup;
	protected registry: HookRegistry = new Map();

	// Can we deduplicate this somehow? Or make it error when not in sync with HookDefinitions?
	// https://stackoverflow.com/questions/53387838/how-to-ensure-an-arrays-values-the-keys-of-a-typescript-interface/53395649
	readonly hooks: HookName[] = [
		'animation:out:start',
		'animation:out:end',
		'animation:in:start',
		'animation:in:end',
		'animation:skip',
		'animation:await',
		'cache:clear',
		'cache:set',
		'content:replace',
		'content:scroll',
		'enable',
		'disable',
		'fetch:request',
		'fetch:error',
		'history:popstate',
		'link:click',
		'link:self',
		'link:anchor',
		'link:newtab',
		'page:request',
		'page:load',
		'page:view',
		'visit:start',
		'visit:end'
	];

	constructor(swup: Swup) {
		this.swup = swup;
		this.init();
	}

	/**
	 * Create ledgers for all core hooks.
	 */
	protected init() {
		this.hooks.forEach((hook) => this.create(hook));
	}

	/**
	 * Register a new hook.
	 */
	create(hook: HookName) {
		if (!this.registry.has(hook)) {
			this.registry.set(hook, new Map());
		}
	}

	/**
	 * Check if a hook is registered.
	 */
	has(hook: HookName): boolean {
		return this.registry.has(hook);
	}

	/**
	 * Get the ledger with all registrations for a hook.
	 */
	protected get<T extends HookName>(hook: T): HookLedger<T> | undefined {
		const ledger = this.registry.get(hook);
		if (ledger) {
			return ledger;
		}
		console.error(`Unknown hook '${hook}'`);
	}

	/**
	 * Remove all handlers of all hooks.
	 */
	clear() {
		this.registry.forEach((ledger) => ledger.clear());
	}

	/**
	 * Register a new hook handler.
	 * @param hook Name of the hook to listen for
	 * @param handler The handler function to execute
	 * @param options Object to specify how and when the handler is executed
	 *                Available options:
	 *                - `once`: Only execute the handler once
	 *                - `before`: Execute the handler before the default handler
	 *                - `priority`: Specify the order in which the handlers are executed
	 *                - `replace`: Replace the default handler with this handler
	 * @returns The handler function
	 */
	on<T extends HookName>(hook: T, handler: Handler<T>): Handler<T>;
	on<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions): Handler<T>;
	on<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions = {}): Handler<T> {
		const ledger = this.get(hook);
		if (!ledger) {
			console.warn(`Hook '${hook}' not found.`);
			return handler;
		}

		const id = ledger.size + 1;
		const registration: HookRegistration<T> = { ...options, id, hook, handler };
		ledger.set(handler, registration);
		return handler;
	}

	/**
	 * Register a new hook handler to run before the default handler.
	 * Shortcut for `hooks.on(hook, handler, { before: true })`.
	 * @param hook Name of the hook to listen for
	 * @param handler The handler function to execute
	 * @param options Any other event options (see `hooks.on()` for details)
	 * @returns The handler function
	 * @see on
	 */
	before<T extends HookName>(hook: T, handler: Handler<T>): Handler<T>;
	before<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions): Handler<T>;
	before<T extends HookName>(
		hook: T,
		handler: Handler<T>,
		options: HookOptions = {}
	): Handler<T> {
		return this.on(hook, handler, { ...options, before: true });
	}

	/**
	 * Register a new hook handler to replace the default handler.
	 * Shortcut for `hooks.on(hook, handler, { replace: true })`.
	 * @param hook Name of the hook to listen for
	 * @param handler The handler function to execute instead of the default handler
	 * @param options Any other event options (see `hooks.on()` for details)
	 * @returns The handler function
	 * @see on
	 */
	replace<T extends HookName>(hook: T, handler: Handler<T>): Handler<T>;
	replace<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions): Handler<T>;
	replace<T extends HookName>(
		hook: T,
		handler: Handler<T>,
		options: HookOptions = {}
	): Handler<T> {
		return this.on(hook, handler, { ...options, replace: true });
	}

	/**
	 * Register a new hook handler to run once.
	 * Shortcut for `hooks.on(hook, handler, { once: true })`.
	 * @param hook Name of the hook to listen for
	 * @param handler The handler function to execute
	 * @param options Any other event options (see `hooks.on()` for details)
	 * @see on
	 */
	once<T extends HookName>(hook: T, handler: Handler<T>): Handler<T>;
	once<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions): Handler<T>;
	once<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions = {}): Handler<T> {
		return this.on(hook, handler, { ...options, once: true });
	}

	/**
	 * Unregister a hook handler.
	 * @param hook Name of the hook the handler is registered for
	 * @param handler The handler function that was registered.
	 *                If omitted, all handlers for the hook will be removed.
	 */
	off<T extends HookName>(hook: T): void;
	off<T extends HookName>(hook: T, handler: Handler<T>): void;
	off<T extends HookName>(hook: T, handler?: Handler<T>): void {
		const ledger = this.get(hook);

		if (ledger && handler) {
			const deleted = ledger.delete(handler);
			if (!deleted) {
				console.warn(`Handler for hook '${hook}' not found.`);
			}
		} else if (ledger) {
			ledger.clear();
		}
	}

	/**
	 * Trigger a hook asynchronously, executing its default handler and all registered handlers.
	 * Will execute all handlers in order and `await` any `Promise`s they return.
	 * @param hook Name of the hook to trigger
	 * @param args Arguments to pass to the handler
	 * @param defaultHandler A default implementation of this hook to execute
	 * @returns The resolved return value of the executed default handler
	 */
	async trigger<T extends HookName>(
		hook: T,
		args?: HookArguments<T>,
		defaultHandler?: Handler<T>
	): Promise<any> {
		const { before, handler, after, replaced } = this.getHandlers(hook, defaultHandler);
		await this.execute(before, args);
		const [result] = await this.execute(handler, args, replaced ? defaultHandler : undefined);
		await this.execute(after, args);
		this.dispatchDomEvent(hook, args);
		return result;
	}

	/**
	 * Trigger a hook synchronously, executing its default handler and all registered handlers.
	 * Will execute all handlers in order, but will **not** `await` any `Promise`s they return.
	 * @param hook Name of the hook to trigger
	 * @param args Arguments to pass to the handler
	 * @param defaultHandler A default implementation of this hook to execute
	 * @returns The (possibly unresolved) return value of the executed default handler
	 */
	triggerSync<T extends HookName>(
		hook: T,
		args?: HookArguments<T>,
		defaultHandler?: Handler<T>
	): any {
		const { before, after, handler, replaced } = this.getHandlers(hook, defaultHandler);
		this.executeSync(before, args);
		const [result] = this.executeSync(handler, args, replaced ? defaultHandler : undefined);
		this.executeSync(after, args);
		this.dispatchDomEvent(hook, args);
		return result;
	}

	/**
	 * Execute the handlers for a hook, in order, as `Promise`s that will be `await`ed.
	 * @param registrations The registrations (handler + options) to execute
	 * @param args Arguments to pass to the handler
	 */
	async execute<T extends HookName>(
		registrations: HookRegistration<T>[],
		args?: HookArguments<T>,
		defaultHandler?: Handler<T>
	): Promise<any> {
		const results = [];
		for (const { hook, handler, once } of registrations) {
			const result = await runAsPromise(handler, [this.swup.context, args, defaultHandler]);
			results.push(result);
			if (once) {
				this.off(hook, handler);
			}
		}
		return results;
	}

	/**
	 * Execute the handlers for a hook, in order, without `await`ing any returned `Promise`s.
	 * @param registrations The registrations (handler + options) to execute
	 * @param args Arguments to pass to the handler
	 */
	executeSync<T extends HookName>(
		registrations: HookRegistration<T>[],
		args?: HookArguments<T>,
		defaultHandler?: Handler<T>
	): any[] {
		const results = [];
		for (const { hook, handler, once } of registrations) {
			const result = handler(this.swup.context, args as HookArguments<T>, defaultHandler);
			results.push(result);
			if (isPromise(result)) {
				console.warn(
					`Promise returned from handler for synchronous hook '${hook}'.` +
						`Swup will not wait for it to resolve.`
				);
			}
			if (once) {
				this.off(hook, handler);
			}
		}
		return results;
	}

	/**
	 * Get all registered handlers for a hook, sorted by priority and registration order.
	 * @param hook Name of the hook
	 * @param defaultHandler The optional default handler of this hook
	 * @returns An object with the handlers sorted into `before` and `after` arrays,
	 *          as well as a flag indicating if the original handler was replaced
	 */
	getHandlers<T extends HookName>(hook: T, defaultHandler?: Handler<T>) {
		const ledger = this.get(hook);
		if (!ledger) {
			return { found: false, before: [], handler: [], after: [], replaced: false };
		}

		const sort = this.sortRegistrations;
		const registrations = Array.from(ledger.values());

		const before = registrations.filter(({ before, replace }) => before && !replace).sort(sort);
		const replace = registrations.filter(({ replace }) => replace).sort(sort);
		const after = registrations.filter(({ before, replace }) => !before && !replace).sort(sort);
		const replaced = replace.length > 0;

		let handler: HookRegistration<T>[] = [];
		if (replaced) {
			handler = [{ id: 0, hook, handler: replace[0].handler }];
		} else if (defaultHandler) {
			handler = [{ id: 0, hook, handler: defaultHandler }];
		}

		return { found: true, before, handler, after, replaced };
	}

	/**
	 * Sort two hook registrations by priority and registration order.
	 * @param a The registration object to compare
	 * @param b The other registration object to compare with
	 * @returns The sort direction
	 */
	sortRegistrations<T extends HookName>(a: HookRegistration<T>, b: HookRegistration<T>): number {
		const priority = (a.priority ?? 0) - (b.priority ?? 0);
		const id = a.id - b.id;
		return priority || id || 0;
	}

	/**
	 * Trigger a custom event on the `document`. Prefixed with `swup:`
	 * @param hook Name of the hook to trigger.
	 */
	dispatchDomEvent<T extends HookName>(hook: T, args?: HookArguments<T>): void {
		const detail = { hook, args, context: this.swup.context };
		document.dispatchEvent(new CustomEvent(`swup:${hook}`, { detail }));
	}
}
