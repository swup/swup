/// <reference types="Cypress" />

context('Window', () => {
    beforeEach(() => {
        cy.visit('/page1/');
    });

    it('html tag should have a class swup-enabled', () => {
        cy.get('html').should('have.class', 'swup-enabled');
        cy.get('h1').should('contain', 'Page 1');
    });

    it('page should transition to other pages', () => {
        cy.navigateWithSwup('/page2/');
        cy.wait(1000);
        cy.shouldBeAtPage('/page2/');
        cy.titleIs('Page 2');

        cy.wait(1000);

        cy.navigateWithSwup('/page3/');
        cy.wait(1000);
        cy.shouldBeAtPage('/page3/');
        cy.titleIs('Page 3');
    });

    it('should transition back to page 1 on popstate', () => {
        cy.navigateWithSwup('/page2/');
        cy.wait(1000);

        cy.window().then(window => {
            window.history.back();
            cy.shouldBeAtPage('/page1/');
            cy.titleIs('Page 1');
        });
    });

    it('should transition forward to page 2 on popstate', () => {
        cy.navigateWithSwup('/page2/');
        cy.wait(1000);

        cy.window().then(window => {
            window.history.back();
            window.history.forward();
            cy.shouldBeAtPage('/page2/');
            cy.titleIs('Page 2');
        });
    });

    it('should scroll to hash element and back to top', () => {
        cy.navigateWithSwup('/page1/#hash');
        cy.wait(3000);
        cy.window().then(window => {
            // maybe some missing font? anyway, value is different in different envs
            expect(window.pageYOffset).to.be.within(1180,1220);
        });

        cy.navigateWithSwup('/page1/');
        cy.wait(3000);
        cy.window().then(window => {
            expect(window.pageYOffset).equal(0);
        });
    });

    it('should process transition classes', () => {
        cy.navigateWithSwup('/page2/');
        cy.wait(300);
        cy.hasLeavingClasses('page2');
        cy.wait(300);
        cy.hasEnteringClasses('page2');
        cy.wait(300);
        cy.hasNoTransitionClasses('page2');
    });

    it('should return plugin instance', () => {
        cy.window().then(window => {
            expect(typeof window.swup.findPlugin('ScrollPlugin')).equal('object');
        });
    });

    it('should remove swup class form html tag', () => {
        cy.window().then(window => {
            window.swup.destroy();
            cy.get('html').should('not.have.class', 'swup-enabled');
        });
    });

    it('page should transition an scroll on link with hash', () => {
        // go to page2 first
        cy.navigateWithSwup('/page2/');
        cy.wait(1000);

        cy.navigateWithSwup('/page1/#hash');
        cy.wait(3000);

        cy.shouldBeAtPage('/page1/#hash');
        cy.titleIs('Page 1');
        cy.window().then(window => {
            // maybe some missing font? anyway, value is different in different envs
            expect(window.pageYOffset).to.be.within(1180,1220);
        });
    });

    it('page should transition using swup API', () => {
        cy.window().then(window => {
            window.swup.loadPage({
               url: '/page2'
            });

            cy.wait(1000);

            cy.shouldBeAtPage('/page2/');
            cy.titleIs('Page 2');
        });
    });
});
