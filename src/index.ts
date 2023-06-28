import Swup, { type Options } from './Swup.js';
import type { CacheData } from './modules/Cache.js';
import type { Context, PageContext } from './modules/Context.js';
import type { Plugin } from './modules/plugins.js';
import type { HookDefinitions, Handler } from './modules/Hooks.js';

export default Swup;

export * from './helpers.js';
export * from './utils.js';

export type { Options, Plugin, CacheData, Context, PageContext, HookDefinitions, Handler };
