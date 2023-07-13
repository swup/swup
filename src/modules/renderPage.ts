import { updateHistoryRecord, getCurrentUrl, classify } from '../helpers.js';
import Swup from '../Swup.js';
import { PageData } from './fetchPage.js';

export const renderPage = async function (this: Swup, requestedUrl: string, page: PageData) {
	const { url, html } = page;

	this.classes.remove('is-leaving');

	// do nothing if another page was requested in the meantime
	if (!this.isSameResolvedUrl(getCurrentUrl(), requestedUrl)) {
		return;
	}

	// update state if the url was redirected
	if (!this.isSameResolvedUrl(getCurrentUrl(), url)) {
		updateHistoryRecord(url);
		this.currentPageUrl = getCurrentUrl();
		this.context.to.url = this.currentPageUrl;
	}

	// only add for animated page loads
	if (this.context.animation.animate) {
		this.classes.add('is-rendering');
	}

	// save html into context for easier retrieval
	this.context.to.html = html;

	// replace content: allow handlers and plugins to overwrite paga data and containers
	await this.hooks.trigger('content:replace', { page }, (context, { page }) => {
		const success = this.replaceContent(page, { containers: context.containers });
		if (!success) {
			throw new Error('[swup] Container mismatch, aborting');
		}
		if (this.context.animation.animate) {
			// Make sure to add these classes to new containers as well
			this.classes.add('is-animating', 'is-changing', 'is-rendering');
			if (this.context.animation.name) {
				this.classes.add(`to-${classify(this.context.animation.name)}`);
			}
		}
	});

	await this.hooks.trigger(
		'content:scroll',
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

	await this.hooks.trigger('page:view', { url: this.currentPageUrl, title: document.title });

	// empty cache if it's disabled (in case preload plugin filled it)
	if (!this.options.cache) {
		this.cache.clear();
	}
};
