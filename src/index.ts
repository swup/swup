import type { Path } from 'path-to-regexp';

import Swup, { type Options } from './Swup.js';
import type { CacheData } from './modules/Cache.js';
import type {
	Context,
	FromContext,
	ToContext,
	AnimationContext,
	ScrollContext,
	HistoryContext
} from './modules/Context.js';
import type {
	HookDefinitions,
	HookName,
	HookOptions,
	HookUnregister,
	Handler
} from './modules/Hooks.js';
import type { Plugin } from './modules/plugins.js';

export default Swup;

export * from './helpers.js';
export * from './utils.js';

export type {
	Options,
	Plugin,
	CacheData,
	Context,
	FromContext,
	ToContext,
	AnimationContext,
	ScrollContext,
	HistoryContext,
	HookDefinitions,
	HookName,
	HookOptions,
	HookUnregister,
	Handler,
	Path
};
