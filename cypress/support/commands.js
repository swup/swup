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

Cypress.Commands.add('shouldBeAtPage', (href) => {
	cy.location().should((loc) => {
		expect(loc.pathname + loc.hash).to.eq(href);
	});
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
		const { cache } = window._swup;
		const exists = cache.exists(url);
		const page = cache.getPage(url);
		expect(url).to.be.a('string');
		expect(exists).to.be.true;
		expect(page).not.to.be.undefined;
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

Cypress.Commands.add('shouldHaveTransitionLeaveClasses', () => {
	cy.get('html').should('have.class', 'is-changing');
	cy.get('html').should('have.class', 'is-leaving');
});

Cypress.Commands.add('shouldHaveTransitionEnterClasses', () => {
	cy.get('html').should('have.class', 'is-changing');
	cy.get('html').should('have.class', 'is-rendering');
	cy.get('html').should('not.have.class', 'is-leaving');
});

Cypress.Commands.add('shouldNotHaveTransitionClasses', () => {
	cy.get('html').should('not.have.class', 'is-changing');
	cy.get('html').should('not.have.class', 'is-rendering');
	cy.get('html').should('not.have.class', 'is-leaving');
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

Cypress.Commands.add('transitionWithExpectedDuration', function (durationInMs, url = null) {
	cy.wrapSwupInstance();

	const durationTolerance = 0.25; // 25% plus/minus

	let startOut = 0;
	let durationOut = 0;
	let startIn = 0;
	let durationIn = 0;

	cy.window().then((window) => {
		this.swup.hooks.on('animationOutStart', () => (startOut = performance.now()));
		this.swup.hooks.on('animationOutDone', () => (durationOut = performance.now() - startOut));
		this.swup.hooks.on('animationInStart', () => (startIn = performance.now()));
		this.swup.hooks.on('animationInDone', () => (durationIn = performance.now() - startIn));
		url = url || window.location.href;
		this.swup.loadPage(url);
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
