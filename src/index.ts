import Swup, { Options } from './Swup.js';
import { CacheData } from './modules/Cache.js';
import { Context, PageContext } from './modules/Context.js';
import { Plugin } from './modules/plugins.js';
import { HookDefinitions, Handler } from './modules/Hooks.js';

export default Swup;

export * from './helpers.js';
export * from './utils.js';

export { Options, Plugin, CacheData, Context, PageContext, HookDefinitions, Handler };
