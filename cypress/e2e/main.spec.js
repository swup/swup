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
		cy.wait('@request').its('request.headers').then((headers) => {
			Object.entries(expected).forEach(([header, value]) => {
				cy.wrap(headers).its(header.toLowerCase()).should('eq', value);
			});
		});
	});
});

describe('Cache', function () {
	beforeEach(() => {
		cy.visit('/page-1.html');
		cy.wrapSwupInstance();
	});

	it('should cache pages', function () {
		this.swup.loadPage({ url: '/page-2.html' });
		cy.shouldBeAtPage('/page-2.html');
		cy.window().should(() => {
			expect(this.swup.cache.getCurrentPage()).not.to.be.undefined;
		});
	});

	it('should cache pages from absolute URLs', function () {
		this.swup.loadPage({ url: `${baseUrl}/page-2.html` });
		cy.shouldBeAtPage('/page-2.html');
		cy.window().should(() => {
			expect(this.swup.cache.getCurrentPage()).not.to.be.undefined;
		});
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

	it('should process transition classes', function () {
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldHaveTransitionLeaveClasses();
		cy.shouldHaveTransitionEnterClasses();
		cy.shouldNotHaveTransitionClasses();
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

		this.swup.on('clickLink', handlers.click);
		cy.triggerClickOnLink('/page-2.html');
		cy.window().should(() => {
			expect(handlers.click).to.be.called;
		});
	});

	it('should remove custom event handlers', function () {
		const handlers = { transition() {}, content() {} };
		cy.spy(handlers, 'transition');
		cy.spy(handlers, 'content');

		this.swup.on('transitionStart', handlers.transition);
		this.swup.on('contentReplaced', handlers.content);

		cy.triggerClickOnLink('/page-2.html');
		cy.window().should(() => {
			expect(handlers.transition).to.be.calledOnce;
			expect(handlers.content).to.be.calledOnce;
		});

		cy.window().then(() => {
			this.swup.off('transitionStart', handlers.transition);
		});
		cy.triggerClickOnLink('/page-3.html');
		cy.window().should(() => {
			expect(handlers.transition).to.be.calledOnce;
			expect(handlers.content).to.be.calledTwice;
		});
	});
});

describe('Transition timing', function () {
	it('should detect transition timing', function () {
		cy.visit('/transition-duration.html');
		cy.transitionWithExpectedDuration(400);
	});

	it('should detect complex transition timing', function () {
		cy.visit('/transition-complex.html');
		cy.transitionWithExpectedDuration(600);
	});

	it('should warn about missing transition timing', function () {
		cy.visit('/transition-none.html', {
			onBeforeLoad: (win) =>  cy.stub(win.console, 'warn').as('consoleWarn')
		});
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');
		cy.get('@consoleWarn').should('be.calledOnceWith', '[swup] No CSS animation duration defined on elements matching `[class*=\"transition-\"]`');
	});

	it('should not warn about partial transition timing', function () {
		cy.visit('/transition-partial.html', {
			onBeforeLoad: (win) =>  cy.stub(win.console, 'warn').as('consoleWarn')
		});
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');
		cy.get('@consoleWarn').should('have.callCount', 0);
	});

	it('should detect keyframe timing', function () {
		cy.visit('/transition-keyframes.html');
		cy.transitionWithExpectedDuration(700);
	});
});

describe('Navigation', function () {
	beforeEach(() => {
		cy.visit('/page-1.html');
		cy.wrapSwupInstance();
	});

	it('should transition to other pages', function () {
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');

		cy.wait(200); // Wait for transition finish
		cy.triggerClickOnLink('/page-3.html');
		cy.shouldBeAtPage('/page-3.html');
		cy.shouldHaveH1('Page 3');
	});

	it('should transition if no containers defined', function () {
		this.swup.options.animationSelector = false;
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');
	});

	it('should transition if no CSS transition is defined', function () {
		cy.visit('/transition-none.html');
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

	it('should ignore visits via loadPage', function () {
		this.swup.options.ignoreVisit = (url) => true;
		cy.shouldHaveReloadedAfterAction(() => {
			this.swup.loadPage({ url: '/page-2.html' });
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

describe('Redirects', function () {
	beforeEach(() => {
		cy.visit('/page-1.html');
	});

	it('should follow redirects', function () {
		cy.intercept('GET', '/page-2.html', (req) => {
			req.redirect('/page-3.html', 302);
		});
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-3.html');
		cy.shouldHaveH1('Page 3');
	});
});

describe('History', function () {
	beforeEach(() => {
		cy.visit('/page-1.html');
		cy.wrapSwupInstance();
	});

	it('should transition to previous page on popstate', function () {
		cy.triggerClickOnLink('/page-2.html');
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');

		cy.window().then((window) => {
			window.history.back();
			cy.shouldBeAtPage('/page-1.html');
			cy.shouldHaveH1('Page 1');
		});
	});

	it('should transition to next page on popstate', function () {
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

		this.swup.on('popState', handlers.popstate);

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

	it('should transition to pages using swup API', function () {
		this.swup.loadPage({ url: '/page-2.html' });
		cy.shouldBeAtPage('/page-2.html');
		cy.shouldHaveH1('Page 2');
	});
});

describe('Scroll Plugin', function () {
	beforeEach(() => {
		cy.visit('/plugins/scroll-plugin-1.html');
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

	it('should transition page and scroll on link with hash', function () {
		cy.get('[data-cy=link-to-page-anchor]').click();
		cy.shouldBeAtPage('/plugins/scroll-plugin-2.html#anchor');
		cy.shouldHaveH1('Scroll Plugin 2');
		cy.shouldHaveElementInViewport('[data-cy=anchor]');
	});
});

describe('Body Class Plugin', function () {
	beforeEach(() => {
		cy.visit('/plugins/body-class-plugin-1.html');
		cy.wrapSwupInstance();
	});

	it('should update the body class', function () {
		cy.get('body').should('have.class', 'body-1');
		this.swup.loadPage({ url: '/plugins/body-class-plugin-2.html' });
		cy.get('body').should('have.class', 'body-2');
		cy.get('body').should('not.have.class', 'body-1');
	});
});
