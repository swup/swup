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
