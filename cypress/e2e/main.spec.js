/// <reference types="Cypress" />

// this.swup holds the swup instance

const baseUrl = Cypress.config('baseUrl');

describe('Request', function () {
	beforeEach(() => {
		cy.visit('/page-1.html');
		cy.wrapSwupInstance();
	});

	it('should send the correct referer', function () {
		const referer = `${baseUrl}/page-1.html`;
		cy.intercept('GET', '/page-2.html').as('request');
		cy.triggerClickOnLink('/page-2.html');
		cy.wait('@request').its('request.headers.referer').should('eq', referer);
	});

	it('should send the correct request headers', function () {
		const expected = this.swup.options.requestHeaders;
		cy.intercept('GET', '/page-3.html').as('request');
		cy.triggerClickOnLink('/page-3.html');
		cy.wait('@request')
			.its('request.headers')
			.then((headers) => {
				Object.entries(expected).forEach(([header, value]) => {
					cy.wrap(headers).its(header.toLowerCase()).should('eq', value);
				});
			});
	});

	it('should force-load on server error', function () {
		cy.intercept('/error-500.html', { statusCode: 500, times: 1 });
		cy.shouldHaveReloadedAfterAction(() => {
			this.swup.visit('/error-500.html');
		});
		cy.shouldBeAtPage('/error-500.html');
	});

	it('should force-load on network error', function () {
		cy.intercept('/error-network.html', { times: 1 }, { forceNetworkError: true });
		cy.shouldHaveReloadedAfterAction(() => {
			this.swup.visit('/error-network.html');
		});
		cy.shouldBeAtPage('/error-network.html');
	});
});

describe('Fetch', function () {
	beforeEach(() => {
		cy.visit('/page-1.html');
		cy.wrapSwupInstance();
	});

	it('should allow calling original loadPage handler', function () {
		this.swup.hooks.replace('loadPage', (context, args, originalHandler) => {
			return originalHandler(context, args);
		});
		this.swup.visit('/page-2.html');

		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');
	});

	it('should allow returning a page object to loadPage', function () {
		let requested = false;
		cy.intercept('/page-2.html', (req) => {
			requested = true;
		});

		this.swup.hooks.replace('loadPage', () => {
			return {
				url: '/page-3.html',
				html: '<html><body><div id="swup"><h1>Page 3</h1></div></body></html>'
			};
		});
		this.swup.visit('/page-2.html');

		cy.shouldBeAtPage('/page-3.html');
		cy.shouldHaveH1('Page 3');
		cy.window().should(() => {
			expect(requested).to.be.false;
		});
	});

	it('should allow returning a fetch Promise to loadPage', function () {
		this.swup.hooks.replace('loadPage', () => {
			return this.swup.fetchPage('page-3.html');
		});
		this.swup.visit('/page-2.html');

		cy.shouldBeAtPage('/page-3.html');
		cy.shouldHaveH1('Page 3');
	});
});

describe('Cache', function () {
	beforeEach(() => {
		cy.visit('/page-1.html');
		cy.wrapSwupInstance();
	});

	it('should cache pages', function () {
		this.swup.visit('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveCacheEntry('/page-2.html');
	});

	it('should cache pages from absolute URLs', function () {
		this.swup.visit(`${baseUrl}/page-2.html`);
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveCacheEntry('/page-2.html');
	});
});

describe('Markup', function () {
	beforeEach(() => {
		cy.visit('/page-1.html');
		cy.wrapSwupInstance();
	});

	it('should add swup class to html element', function () {
		cy.get('html').should('have.class', 'swup-enabled');
		cy.shouldHaveH1('Page 1');
	});

	it('should add animation classes to html', function () {
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldHaveAnimationLeaveClasses('html');
		cy.shouldNotHaveAnimationClasses('#swup'); // making sure
		cy.shouldHaveAnimationEnterClasses('html');
		cy.shouldNotHaveAnimationClasses('html');
	});

	it('should add animation classes to containers', function () {
		this.swup.options.animationScope = 'containers';
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldHaveAnimationLeaveClasses('#swup');
		cy.shouldNotHaveAnimationClasses('html'); // making sure
		cy.shouldHaveAnimationEnterClasses('#swup');
		cy.shouldNotHaveAnimationClasses('#swup');
	});

	it('should remove swup class from html tag', function () {
		this.swup.destroy();
		cy.get('html').should('not.have.class', 'swup-enabled');
	});
});

describe('Events', function () {
	beforeEach(() => {
		cy.visit('/page-1.html');
		cy.wrapSwupInstance();
	});

	it('should trigger custom dom events', function () {
		let triggered = false;
		let data = [];
		cy.document().then((document) => {
			document.addEventListener('swup:clickLink', (event) => {
				triggered = true;
				data = event.detail;
			});
		});
		cy.triggerClickOnLink('/page-2.html');
		cy.window().should(() => {
			expect(triggered, 'event was not triggered').to.be.true;
			expect(data).to.have.property('hook', 'clickLink');
		});
	});

	it('should prevent the default click event', function () {
		let triggered = false;
		let prevented = false;
		cy.document().then((document) => {
			document.documentElement.addEventListener('click', (event) => {
				triggered = true;
				prevented = event.defaultPrevented;
			});
		});
		cy.triggerClickOnLink('/page-2.html');
		cy.window().should(() => {
			expect(triggered, 'event was not triggered').to.be.true;
			expect(prevented, 'preventDefault() was not called').to.be.true;
		});
	});

	it('should trigger a custom click event', function () {
		const handlers = { click() {} };
		cy.spy(handlers, 'click');

		this.swup.hooks.on('clickLink', handlers.click);
		cy.triggerClickOnLink('/page-2.html');
		cy.window().should(() => {
			expect(handlers.click).to.be.called;
		});
	});

	it('should remove custom event handlers', function () {
		const handlers = { transition() {}, content() {} };
		cy.spy(handlers, 'transition');
		cy.spy(handlers, 'content');

		this.swup.hooks.on('transitionStart', handlers.transition);
		this.swup.hooks.on('replaceContent', handlers.content);

		cy.triggerClickOnLink('/page-2.html');
		cy.window().should(() => {
			expect(handlers.transition).to.be.calledOnce;
			expect(handlers.content).to.be.calledOnce;
		});

		cy.window().then(() => {
			this.swup.hooks.off('transitionStart', handlers.transition);
		});
		cy.triggerClickOnLink('/page-3.html');
		cy.window().should(() => {
			expect(handlers.transition).to.be.calledOnce;
			expect(handlers.content).to.be.calledTwice;
		});
	});
});

describe('Animation timing', function () {
	it('should detect animation timing', function () {
		cy.visit('/animation-duration.html');
		cy.shouldAnimateWithDuration(400);
	});

	it('should detect complex animation timing', function () {
		cy.visit('/animation-complex.html');
		cy.shouldAnimateWithDuration(600);
	});

	it('should warn about missing animation timing', function () {
		cy.visit('/animation-none.html', {
			onBeforeLoad: (win) => cy.stub(win.console, 'warn').as('consoleWarn')
		});
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');
		cy.get('@consoleWarn').should(
			'be.calledOnceWith',
			'[swup] No CSS animation duration defined on elements matching `[class*="transition-"]`'
		);
	});

	it('should not warn about partial animation timing', function () {
		cy.visit('/animation-partial.html', {
			onBeforeLoad: (win) => cy.stub(win.console, 'warn').as('consoleWarn')
		});
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');
		cy.get('@consoleWarn').should('have.callCount', 0);
	});

	it('should detect keyframe timing', function () {
		cy.visit('/animation-keyframes.html');
		cy.shouldAnimateWithDuration(700);
	});
});

describe('Navigation', function () {
	beforeEach(() => {
		cy.visit('/page-1.html');
		cy.wrapSwupInstance();
	});

	it('should navigate to other pages', function () {
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');

		cy.wait(200); // Wait for animation finish
		cy.triggerClickOnLink('/page-3.html');
		cy.shouldBeAtPage('/page-3.html');
		cy.shouldHaveH1('Page 3');
	});

	it('should navigate if no animation selectors defined', function () {
		this.swup.options.animationSelector = false;
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');
	});

	it('should navigate if no CSS animation is defined', function () {
		cy.visit('/animation-none.html');
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');
	});

	// it('should ignore visit when meta key pressed', function() {
	//     cy.triggerClickOnLink('/page-2.html', { metaKey: true });
	//     cy.wait(200);
	//     cy.shouldBeAtPage('/page-1.html');
	//     cy.shouldHaveH1('Page 1');
	// });
});

describe('Link resolution', function () {
	beforeEach(() => {
		cy.visit('/link-resolution.html');
	});

	it('should skip links to different origins', function () {
		cy.shouldHaveReloadedAfterAction(() => {
			cy.get('[data-cy=nav-link-ext]').click();
		});
		cy.location().should((location) => {
			expect(location.origin).to.eq('https://example.net');
		});
	});

	it('should follow relative links', function () {
		cy.get('[data-cy=nav-link-rel]').click();
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');
	});

	it('should resolve document base URLs', function () {
		cy.visit('/nested/nested-1.html');
		cy.get('[data-cy=nav-link-sub]').click();
		cy.shouldBeAtPage('/nested/nested-2.html');
		cy.shouldHaveH1('Nested Page 2');
	});
});

describe('Redirects', function () {
	beforeEach(() => {
		cy.intercept('GET', '/redirect-2.html', (req) => {
			req.redirect('/redirect-3.html', 302);
		});
		cy.visit('/redirect-1.html');
	});

	it('should follow redirects', function () {
		cy.triggerClickOnLink('/redirect-2.html');
		cy.shouldBeAtPage('/redirect-3.html');
		cy.shouldHaveH1('Redirect 3');
	});

	it('should not cache redirects', function () {
		cy.triggerClickOnLink('/redirect-2.html');
		cy.shouldBeAtPage('/redirect-3.html');
		cy.shouldHaveH1('Redirect 3');
		cy.shouldHaveCacheEntries([]);
	});
});

describe('Ignoring visits', function () {
	beforeEach(() => {
		cy.visit('/ignore-visits.html');
		cy.wrapSwupInstance();
	});

	it('should ignore links with data-no-swup attr', function () {
		cy.shouldHaveReloadedAfterAction(() => {
			cy.get('[data-cy="ignore-element"]').first().click();
		});
		cy.shouldBeAtPage('/page-2.html');
	});

	it('should ignore links with data-no-swup parent', function () {
		cy.shouldHaveReloadedAfterAction(() => {
			cy.get('[data-cy="ignore-parent"]').first().click();
		});
		cy.shouldBeAtPage('/page-2.html');
	});

	it('should ignore links via custom ignored path', function () {
		this.swup.options.ignoreVisit = (url) => url.endsWith('#hash');
		cy.shouldHaveReloadedAfterAction(() => {
			cy.get('[data-cy="ignore-path-end"]').first().click();
		});
		cy.shouldBeAtPage('/page-2.html#hash');
	});

	it('should ignore visits in swup.visit', function () {
		this.swup.options.ignoreVisit = (url) => true;
		cy.shouldHaveReloadedAfterAction(() => {
			this.swup.visit('/page-2.html');
		});
		cy.shouldBeAtPage('/page-2.html');
	});
});

describe('Link selector', function () {
	beforeEach(() => {
		cy.visit('/link-selector.html');
		cy.wrapSwupInstance();
	});

	it('should ignore SVG links by default', function () {
		cy.shouldHaveReloadedAfterAction(() => {
			cy.get('svg a').first().click();
		});
		cy.shouldBeAtPage('/page-2.html');
	});

	it('should follow SVG links when added to selector', function () {
		this.swup.options.linkSelector = 'a[href], svg a[*|href]';
		cy.get('svg a').first().click();
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');
	});

	it('should ignore map area links by default', function () {
		cy.shouldHaveReloadedAfterAction(() => {
			cy.get('map area').first().click({ force: true });
		});
		cy.shouldBeAtPage('/page-2.html');
	});

	it('should follow map area links when added to selector', function () {
		this.swup.options.linkSelector = 'a[href], map area[href]';
		cy.get('map area').first().click({ force: true });
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');
	});
});

describe('Resolve URLs', function () {
	beforeEach(() => {
		cy.visit('/page-1.html');
		cy.wrapSwupInstance();
	});

	it('should ignore links for equal resolved urls', function () {
		this.swup.options.resolveUrl = () => '/page-1.html';
		cy.triggerClickOnLink('/page-2.html');
		cy.wait(200);
		cy.shouldBeAtPage('/page-1.html');
	});

	it('should skip popstate handling for equal resolved urls', function () {
		this.swup.options.resolveUrl = () => '/page-1.html';
		cy.pushHistoryState('/pushed-page-1/');
		cy.pushHistoryState('/pushed-page-2/');
		cy.wait(500).then(() => {
			window.history.back();
			cy.shouldBeAtPage('/pushed-page-1/');
			cy.shouldHaveH1('Page 1');
		});
	});
});

describe('History', function () {
	beforeEach(() => {
		cy.visit('/page-1.html');
		cy.wrapSwupInstance();
	});

	it('should create a new history state on visit', function () {
		cy.visit('/history.html');

		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');

		cy.get('[data-cy=create-link]').first().click();
		cy.shouldBeAtPage('/page-3.html');
		cy.window().then((window) => {
			window.history.back();
			cy.window().should(() => {
				expect(window.history.state.url).to.equal('/page-2.html');
			});
		});
	});

	it('should replace the current history state via data attribute', function () {
		cy.visit('/history.html');

		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');

		cy.get('[data-cy=update-link]').first().click();
		cy.shouldBeAtPage('/page-3.html');
		cy.window().then((window) => {
			window.history.back();
			cy.window().should(() => {
				expect(window.history.state.url).to.equal('/history.html');
			});
		});
	});

	it('should replace the current history state via API', function () {
		cy.window().then(() => {
			this.swup.visit('/page-2.html');
		});
		cy.shouldBeAtPage('/page-2.html');
		cy.window().then(() => {
			this.swup.visit('/page-3.html', { history: 'replace' });
		});
		cy.shouldBeAtPage('/page-3.html');
		cy.window().then((window) => {
			window.history.back();
			cy.window().should(() => {
				expect(window.history.state.url).to.equal('/page-1.html');
			});
		});
	});

	it('should navigate to previous page on popstate', function () {
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');

		cy.window().then((window) => {
			window.history.back();
			cy.shouldBeAtPage('/page-1.html');
			cy.shouldHaveH1('Page 1');
		});
	});

	it('should navigate to next page on popstate', function () {
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');

		cy.window().then((window) => {
			window.history.back();
			window.history.forward();
			cy.shouldBeAtPage('/page-2.html');
			cy.shouldHaveH1('Page 2');
		});
	});

	it('should save state into the history', function () {
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');

		cy.window().then((window) => {
			window.history.back();
			cy.window().should(() => {
				expect(window.history.state.url, 'page url not saved').to.equal('/page-1.html');
				expect(window.history.state.source, 'state source not saved').to.equal('swup');
			});
		});
	});

	it('should trigger a custom popState event', function () {
		const handlers = { popstate() {} };
		cy.spy(handlers, 'popstate');

		this.swup.hooks.on('popState', handlers.popstate);

		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');

		cy.window().then((window) => {
			window.history.back();
		});
		cy.window().should(() => {
			expect(handlers.popstate).to.be.called;
		});
	});

	it('should skip popstate handling for foreign state entries', function () {
		cy.pushHistoryState('/page-2.html', { source: 'not-swup' });
		cy.pushHistoryState('/page-3.html', { source: 'not-swup' });
		cy.window().then((window) => {
			window.history.back();
			cy.shouldBeAtPage('/page-2.html');
			cy.shouldHaveH1('Page 1');
		});
	});
});

describe('API', function () {
	beforeEach(() => {
		cy.visit('/page-1.html');
		cy.wrapSwupInstance();
	});

	it('should navigate to pages using swup API', function () {
		this.swup.visit('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');
	});
});

describe('Context', function () {
	beforeEach(() => {
		cy.visit('/page-1.html');
		cy.wrapSwupInstance();
	});

	it('has the current and next url', function () {
		let from = '';
		let to = '';
		this.swup.hooks.before('transitionStart', (ctx) => {
			from = ctx.from.url;
			to = ctx.to.url;
		});
		cy.triggerClickOnLink('/page-2.html');
		cy.window().should(() => {
			expect(from).to.eq('/page-1.html');
			expect(to).to.eq('/page-2.html');
		});
	});

	it('has the correct current url on history visits', function () {
		let from = '';
		let to = '';
		this.swup.hooks.before('transitionStart', (ctx) => {
			from = ctx.from.url;
			to = ctx.to.url;
		});
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');
		cy.window().then((window) => {
			window.history.back();
			cy.shouldBeAtPage('/page-1.html');
			cy.shouldHaveH1('Page 1');
			cy.window().should(() => {
				expect(from).to.eq('/page-2.html');
				expect(to).to.eq('/page-1.html');
			});
		});
	});

	it('passes along the click trigger and event', function () {
		let el = null;
		let event = null;
		this.swup.hooks.before('transitionStart', (context) => {
			el = context.trigger.el;
			event = context.trigger.event;
		});
		cy.triggerClickOnLink('/page-2.html');
		cy.window().should((win) => {
			expect(el).to.be.instanceof(win.HTMLAnchorElement);
			expect(event).to.be.instanceof(win.MouseEvent);
		});
	});

	it('passes along the popstate status and event', function () {
		let event = null;
		let historyVisit = null;
		this.swup.hooks.before('transitionStart', (context) => {
			event = context.trigger.event;
			historyVisit = context.history.popstate;
		});
		cy.window().then(() => {
			this.swup.visit('/page-2.html');
		});
		cy.shouldBeAtPage('/page-2.html');
		cy.window().then((window) => {
			window.history.back();
		});
		cy.shouldBeAtPage('/page-1.html');
		cy.window().should((win) => {
			expect(event).to.be.instanceof(win.PopStateEvent);
			expect(historyVisit).to.be.true;
		});
	});

	it('passes along the custom animation', function () {
		let name = null;
		let expectedName = null;
		this.swup.hooks.before('transitionStart', (context) => {
			name = context.animation.name;
		});
		cy.get('a[data-swup-animation]').should(($el) => {
			expect($el.length).to.be.at.least(1);
			expectedName = $el.first().attr('data-swup-animation');
			expect(expectedName).to.eq('custom');
		});
		cy.get('a[data-swup-animation]').click();
		cy.window().should(() => {
			expect(name).to.eq(expectedName);
		});
	});

	it('should allow disabling animations', function () {
		this.swup.hooks.before('transitionStart', (context) => {
			context.animation.animate = false;
		});
		cy.shouldAnimateWithDuration(0, '/page-2.html');
	});
});

describe('Containers', function () {
	beforeEach(() => {
		cy.visit('/containers-1.html');
		cy.wrapSwupInstance();
	});

	it('should be customizable from context', function () {
		this.swup.hooks.before('transitionStart', (context) => {
			context.containers = ['#aside'];
		});
		this.swup.visit('/containers-2.html', { animate: false });
		cy.get('h1').should('contain', 'Containers 1');
		cy.get('h2').should('contain', 'Heading 2');
	});

	it('should be customizable from hook context', function () {
		this.swup.hooks.before('replaceContent', (context) => {
			context.containers = ['#main'];
		});
		this.swup.visit('/containers-2.html', { animate: false });
		cy.get('h1').should('contain', 'Containers 2');
		cy.get('h2').should('contain', 'Heading 1');
	});

	it('should force-load on container mismatch', function () {
		cy.shouldHaveReloadedAfterAction(() => {
			this.swup.visit('/containers-missing.html');
		});
		cy.shouldBeAtPage('/containers-missing.html');
	});
});

describe('Scrolling', function () {
	beforeEach(() => {
		cy.visit('/scrolling-1.html');
	});

	it('should scroll to hash element and back to top', function () {
		cy.get('[data-cy=link-to-anchor]').click();
		cy.shouldHaveElementInViewport('[data-cy=anchor]');

		cy.triggerClickOnLink('/page-1.html');
		cy.window().should((window) => {
			expect(window.scrollY).equal(0);
		});
	});

	it('should scroll to anchor with path', function () {
		cy.get('[data-cy=link-to-self-anchor]').click();
		cy.shouldHaveElementInViewport('[data-cy=anchor]');
	});

	it('should scroll to top', function () {
		cy.get('[data-cy=link-to-self-anchor]').click();
		cy.shouldHaveElementInViewport('[data-cy=anchor]');
		cy.get('[data-cy=link-to-top]').click();
		cy.window().should((window) => {
			expect(window.scrollY).equal(0);
		});
	});

	it('should scroll to id-based anchor', function () {
		cy.get('[data-cy=link-to-anchor-by-id]').click();
		cy.shouldHaveElementInViewport('[data-cy=anchor-by-id]');
	});

	it('should scroll to name-based anchor', function () {
		cy.get('[data-cy=link-to-anchor-by-name]').click();
		cy.shouldHaveElementInViewport('[data-cy=anchor-by-name]');
	});

	it('should prefer undecoded id attributes', function () {
		cy.get('[data-cy=link-to-anchor-encoded]').click();
		cy.shouldHaveElementInViewport('[data-cy=anchor-encoded]');
	});

	it('should accept unencoded anchor links', function () {
		cy.get('[data-cy=link-to-anchor-unencoded]').click();
		cy.shouldHaveElementInViewport('[data-cy=anchor-unencoded]');
	});

	it('should scroll to anchor with special characters', function () {
		cy.get('[data-cy=link-to-anchor-with-colon]').click();
		cy.shouldHaveElementInViewport('[data-cy=anchor-with-colon]');
		cy.get('[data-cy=link-to-anchor-with-unicode]').click();
		cy.shouldHaveElementInViewport('[data-cy=anchor-with-unicode]');
	});

	it('should scroll to requested hash after navigation', function () {
		cy.get('[data-cy=link-to-page-anchor]').click();
		cy.shouldBeAtPage('/scrolling-2.html#anchor');
		cy.shouldHaveH1('Scrolling 2');
		cy.shouldHaveElementInViewport('[data-cy=anchor]');
	});
});
