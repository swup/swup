/// <reference types="Cypress" />

context('Window', () => {
    beforeEach(() => {
        cy.visit('/page1/');
    });

    it('html tag should have a class swup-enabled', () => {
        cy.get('html').should('have.class', 'swup-enabled');
        cy.shouldHaveH1('Page 1');
    });

    it('should trigger a custom click event', () => {
        cy.triggerClickOnLink('/page2/');
        cy.get('#test').should('have.attr', 'data-clicked');
    });

    it('should transition to other pages', () => {
        cy.triggerClickOnLink('/page2/');
        cy.wait(1000);
        cy.shouldBeAtPage('/page2/');
        cy.shouldHaveH1('Page 2');

        cy.wait(1000);

        cy.triggerClickOnLink('/page3/');
        cy.wait(1000);
        cy.shouldBeAtPage('/page3/');
        cy.shouldHaveH1('Page 3');
    });

    it('should ignore clicks when meta key pressed', () => {
        cy.triggerClickOnLink('/page2/', { metaKey: true });
        cy.shouldBeAtPage('/page1/');
        cy.shouldHaveH1('Page 1');
    });

    it('should transition back to page 1 on popstate', () => {
        cy.triggerClickOnLink('/page2/');
        cy.wait(1000);

        cy.window().then(window => {
            window.history.back();
            cy.shouldBeAtPage('/page1/');
            cy.shouldHaveH1('Page 1');
        });
    });

    it('should transition forward to page 2 on popstate', () => {
        cy.triggerClickOnLink('/page2/');
        cy.wait(1000);

        cy.window().then(window => {
            window.history.back();
            window.history.forward();
            cy.shouldBeAtPage('/page2/');
            cy.shouldHaveH1('Page 2');
        });
    });

    it('should scroll to hash element and back to top', () => {
        cy.triggerClickOnLink('/page1/#hash');
        cy.wait(3000);
        cy.window().then(window => {
            // maybe some missing font? anyway, value is different in different envs
            expect(window.pageYOffset).to.be.within(1180,1220);
        });

        cy.triggerClickOnLink('/page1/');
        cy.wait(3000);
        cy.window().then(window => {
            expect(window.pageYOffset).equal(0);
        });
    });

    it('should process transition classes', () => {
        cy.triggerClickOnLink('/page2/');
        cy.wait(300);
        cy.shouldHaveTransitionLeaveClasses('page2');
        cy.wait(300);
        cy.shouldHaveTransitionEnterClasses('page2');
        cy.wait(300);
        cy.shouldNotHaveTransitionClasses('page2');
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
        cy.triggerClickOnLink('/page2/');
        cy.wait(1000);

        cy.triggerClickOnLink('/page1/#hash');
        cy.wait(3000);

        cy.shouldBeAtPage('/page1/#hash');
        cy.shouldHaveH1('Page 1');
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
            cy.shouldHaveH1('Page 2');
        });
    });
});
