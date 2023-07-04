import { updateHistoryRecord, getCurrentUrl, classify } from '../helpers.js';
import Swup from '../Swup.js';
import { PageData } from './fetchPage.js';

export const renderPage = async function (this: Swup, requestedUrl: string, page: PageData) {
	const { url } = page;

	this.classes.remove('is-leaving');

	// do nothing if another page was requested in the meantime
	if (!this.isSameResolvedUrl(getCurrentUrl(), requestedUrl)) {
		return;
	}

	// update state if the url was redirected
	if (!this.isSameResolvedUrl(getCurrentUrl(), url)) {
		updateHistoryRecord(url);
		this.currentPageUrl = getCurrentUrl();
		this.context.to!.url = this.currentPageUrl;
	}

	// only add for page loads with transitions
	if (this.context.transition.animate) {
		this.classes.add('is-rendering');
	}
	// console.log(this.context.from);
	if (this.context.scroll.reset) {
		console.log(this.context.to!);
	}

	// replace content: allow handlers and plugins to overwrite paga data and containers
	await this.hooks.trigger(
		'replaceContent',
		{ page, containers: this.context.containers },
		(context, { page, containers }) => {
			this.replaceContent(page, { containers });
			if (this.context.transition.animate) {
				// Make sure to add these classes to new containers as well
				this.classes.add('is-animating', 'is-changing', 'is-rendering');
				if (this.context.transition.name) {
					this.classes.add(`to-${classify(this.context.transition.name)}`);
				}
			}
		}
	);

	await this.hooks.trigger(
		'scrollToContent',
		{ options: { behavior: 'auto' } },
		(context, { options }) => {
			if (this.context.scroll.target) {
				const target = this.getAnchorElement(this.context.scroll.target);
				if (target) {
					target.scrollIntoView(options);
					return;
				}
			}
			if (this.context.scroll.reset) {
				window.scrollTo(0, 0);
			}
		}
	);

	await this.hooks.trigger('pageView', { url: this.currentPageUrl, title: document.title });

	// empty cache if it's disabled (in case preload plugin filled it)
	if (!this.options.cache) {
		this.cache.clear();
	}

	// Perform in transition
	await this.enterPage();

	// If we ever decide that we want to reset the context after each visit
	// if (this.context.to && this.isSameResolvedUrl(this.context.to.url, requestedUrl)) {
	// 	this.createContext({ to: undefined });
	// }
};
