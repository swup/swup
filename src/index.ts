import Swup, { type Options } from './Swup.js';
import type { CacheData } from './modules/Cache.js';
import type {
	Context,
	FromContext,
	ToContext,
	TransitionContext,
	ScrollContext,
	HistoryContext
} from './modules/Context.js';
import type { Plugin } from './modules/plugins.js';
import type { HookDefinitions, Handler } from './modules/Hooks.js';
import type { Path } from 'path-to-regexp';

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
	TransitionContext,
	ScrollContext,
	HistoryContext,
	HookDefinitions,
	Handler,
	Path
};
