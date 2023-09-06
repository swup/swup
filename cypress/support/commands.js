// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('wrapSwupInstance', () => {
	cy.window().then((window) => {
		cy.wrap(window._swup).as('swup');
	});
});

Cypress.Commands.add('triggerClickOnLink', (buttonHref, options = {}) => {
	cy.get(`a[href="${CSS.escape(buttonHref)}"]`)
		.first()
		.click(options);
});

Cypress.Commands.add('shouldBeAtPage', (href, h1 = null) => {
	cy.location().should((loc) => {
		expect(loc.pathname + loc.hash).to.eq(href);
	});
	if (h1) {
		cy.shouldHaveH1(h1);
	}
});

Cypress.Commands.add('shouldHaveCacheEntries', (urls) => {
	cy.window().should((window) => {
		const { cache } = window._swup;
		const pages = Array.from(cache.pages.keys());
		expect(pages).to.have.members(urls);
	});
});

Cypress.Commands.add('shouldHaveCacheEntry', (url) => {
	cy.window().should((window) => {
		expect(url).to.be.a('string');
		const { cache } = window._swup;
		const exists = cache.has(url);
		const page = cache.get(url);
		expect(exists).to.be.true;
		expect(page).not.to.be.undefined;
	});
});

Cypress.Commands.add('shouldNotHaveCacheEntry', (url) => {
	cy.window().should((window) => {
		expect(url).to.be.a('string');
		const { cache } = window._swup;
		const exists = cache.has(url);
		const page = cache.get(url);
		expect(exists).to.be.false;
		expect(page).to.be.undefined;
	});
});

Cypress.Commands.add('shouldHaveReloadedAfterAction', (action) => {
	cy.window().then((window) => (window.beforeReload = true));
	cy.window().should('have.prop', 'beforeReload', true);
	cy.window().then((window) => action(window));
	cy.window().should('not.have.prop', 'beforeReload');
});

Cypress.Commands.add('shouldHaveH1', (str) => {
	cy.get('h1').should('contain', str);
});

Cypress.Commands.add('shouldHaveAnimationLeaveClasses', (selector = 'html') => {
	cy.get(selector).should('have.class', 'is-changing');
	cy.get(selector).should('have.class', 'is-leaving');
});

Cypress.Commands.add('shouldHaveAnimationEnterClasses', (selector = 'html') => {
	cy.get(selector).should('have.class', 'is-changing');
	cy.get(selector).should('have.class', 'is-rendering');
	cy.get(selector).should('not.have.class', 'is-leaving');
});

Cypress.Commands.add('shouldNotHaveAnimationClasses', (selector = 'html') => {
	cy.get(selector).should('not.have.class', 'is-changing');
	cy.get(selector).should('not.have.class', 'is-rendering');
	cy.get(selector).should('not.have.class', 'is-leaving');
});

Cypress.Commands.add('shouldHaveElementInViewport', (element) => {
	cy.get(element).should(($el) => {
		const bottom = Cypress.$(cy.state('window')).height();
		const rect = $el[0].getBoundingClientRect();
		const buffer = 1; // allow for sub-pixel placement of elements

		expect(rect.top).to.be.at.least(0 - buffer, 'element top above viewport');
		expect(rect.top).not.to.be.greaterThan(bottom + buffer);
		expect(rect.bottom).not.to.be.greaterThan(bottom + buffer);
	});
});

Cypress.Commands.add('shouldAnimateWithDuration', function (durationInMs, url = null) {
	cy.wrapSwupInstance();

	const durationTolerance = 0.25; // 25% plus/minus

	let startOut = null;
	let durationOut = null;
	let startIn = null;
	let durationIn = null;

	cy.window().then((window) => {
		this.swup.hooks.on('animation:out:start', () => (startOut = performance.now()));
		this.swup.hooks.on('animation:out:end', () => (durationOut = performance.now() - startOut));
		this.swup.hooks.on('animation:in:start', () => (startIn = performance.now()));
		this.swup.hooks.on('animation:in:end', () => (durationIn = performance.now() - startIn));
		this.swup.hooks.on('animation:skip', () => (durationIn = 0));
		this.swup.hooks.on('animation:skip', () => (durationOut = 0));
		url = url || window.location.href;
		this.swup.navigate(url);
	});

	cy.window().should(() => {
		expect(durationIn).to.be.a('number');
		expect(durationOut).to.be.a('number');
	});

	cy.window().should(() => {
		const durationRange = [
			durationInMs * (1 - durationTolerance),
			durationInMs * (1 + durationTolerance)
		];
		expect(durationIn, 'in duration not correct').to.be.within(...durationRange);
		expect(durationOut, 'out duration not correct').to.be.within(...durationRange);
	});
});

Cypress.Commands.add('pushHistoryState', (url, data = {}) => {
	cy.window().then((window) => {
		const state = {
			url,
			random: Math.random(),
			source: 'swup',
			...data
		};
		window.history.pushState(state, '', url);
	});
});

Cypress.Commands.add('delayRequest', (url, delay) => {
	cy.intercept({ pathname: url, times: 1 }, (req) => {
		const { pathname: fixture } = new URL(req.url);
		req.reply({ fixture, delay });
	});
});
