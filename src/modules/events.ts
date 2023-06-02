import Swup from '../Swup.js';
import { HookData, HookName, Handler, HookOptions, HookRegistration } from './Hooks.js';

export type EventHandlerProxy = {
	[key in HookName]: HookRegistration<key>[];
};

/**
 * Alias function to add a new hook handler.
 */
export function on<THook extends HookName>(
	this: Swup,
	hook: THook,
	handler: Handler<THook>,
	options: HookOptions = {}
) {
	return this.hooks.add(hook, handler, { ...options, raw: true });
}

/**
 * Alias function to remove hook handlers.
 */
export function off<THook extends HookName>(this: Swup, hook?: THook, handler?: Handler<THook>) {
	if (hook) {
		return this.hooks.remove(hook, handler);
	} else {
		return this.hooks.clear();
	}
}

/**
 * Alias function to call all hook handlers.
 */
export function triggerEvent<TEvent extends HookName>(
	this: Swup,
	eventName: TEvent,
	data?: HookData<TEvent>
	// originalEvent?: HookContext<TEvent>['originalEvent'],
) {
	return this.hooks.call(eventName, data);
}

/**
 * Create a proxy object that allows writing to `swup._handlers`.
 * When setting a property on this proxy, it will instead create a new hook with the given name.
 * Mostly here for backwards compatibility with older plugins.
 */
export function createEventHandlerProxy(swup: Swup): EventHandlerProxy {
	return new Proxy({}, {
		set: (target: any, hook: HookName, value: any): boolean => {
			console.warn('Writing to `swup._handlers` is no longer supported. Please use `swup.hooks.create()` instead.');
			if (!swup.hooks.has(hook)) {
				swup.hooks.create(hook);
			}
			return false;
		}
	});
};
