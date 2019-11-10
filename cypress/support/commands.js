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
Cypress.Commands.add("navigateWithSwup", (buttonHref) => {
    cy.get(`a[href="${ buttonHref }"]`).click();
});

Cypress.Commands.add("shouldBeAtPage", (href) => {
    cy.location().should((loc) => {
        expect(loc.pathname + loc.hash).to.eq(href);
    });
});

Cypress.Commands.add("titleIs", (str) => {
    cy.get('h1').should('contain',  str);
});

Cypress.Commands.add("hasLeavingClasses", (page) => {
    cy.get('html').should('have.class', 'is-changing');
    cy.get('html').should('have.class', 'is-leaving');
    cy.get('html').should('have.class', `to-${page}`);
});

Cypress.Commands.add("hasEnteringClasses", (page) => {
    cy.get('html').should('have.class', 'is-changing');
    cy.get('html').should('have.class', 'is-rendering');
    cy.get('html').should('not.have.class', 'is-leaving');
    cy.get('html').should('have.class', `to-${page}`);
});

Cypress.Commands.add("hasNoTransitionClasses", (page) => {
    cy.get('html').should('not.have.class', 'is-changing');
    cy.get('html').should('not.have.class', 'is-rendering');
    cy.get('html').should('not.have.class', 'is-leaving');
    cy.get('html').should('not.have.class', `to-${page}`);
});
