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

Cypress.Commands.add("triggerClickOnLink", (buttonHref, options = {}) => {
    cy.get(`a[href="${ CSS.escape(buttonHref) }"]`).first().click(options);
});

Cypress.Commands.add("shouldBeAtPage", (href) => {
    cy.location().should((loc) => {
        expect(loc.pathname + loc.hash).to.eq(href);
    });
});

Cypress.Commands.add("shouldHaveReloadedAfterAction", (action) => {
    cy.window().then(window => window.beforeReload = true);
    cy.window().should('have.prop', 'beforeReload', true);
    cy.window().then(window => action(window));
    cy.window().should('not.have.prop', 'beforeReload');
});

Cypress.Commands.add("shouldHaveH1", (str) => {
    cy.get('h1').should('contain', str);
});

Cypress.Commands.add("shouldHaveTransitionLeaveClasses", (page) => {
    cy.get('html').should('have.class', 'is-changing');
    cy.get('html').should('have.class', 'is-leaving');
    cy.get('html').should('have.class', `to-${page}`);
});

Cypress.Commands.add("shouldHaveTransitionEnterClasses", (page) => {
    cy.get('html').should('have.class', 'is-changing');
    cy.get('html').should('have.class', 'is-rendering');
    cy.get('html').should('not.have.class', 'is-leaving');
    cy.get('html').should('have.class', `to-${page}`);
});

Cypress.Commands.add("shouldNotHaveTransitionClasses", (page) => {
    cy.get('html').should('not.have.class', 'is-changing');
    cy.get('html').should('not.have.class', 'is-rendering');
    cy.get('html').should('not.have.class', 'is-leaving');
    cy.get('html').should('not.have.class', `to-${page}`);
});

Cypress.Commands.add('shouldHaveElementInViewport', (element) => {
    cy.get(element).should($el => {
        const bottom = Cypress.$(cy.state('window')).height();
        const rect = $el[0].getBoundingClientRect();
        const buffer = 1; // allow for sub-pixel placement of elements

        expect(rect.top).to.be.at.least(0 - buffer, 'element top above viewport');
        expect(rect.top).not.to.be.greaterThan(bottom + buffer);
        expect(rect.bottom).not.to.be.greaterThan(bottom + buffer);
    })
})
