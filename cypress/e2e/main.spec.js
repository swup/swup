/// <reference types="Cypress" />

context('Window', () => {
    beforeEach(() => {
        cy.visit('/page1/');
    });

    it('should add swup class to html element', () => {
        cy.get('html').should('have.class', 'swup-enabled');
        cy.shouldHaveH1('Page 1');
    });

    it('should prevent the default click event', () => {
        let triggered = false;
        let prevented = false;
        cy.document().then(document => {
            document.documentElement.addEventListener('click', (event) => {
                triggered = true
                prevented = event.defaultPrevented
            });
        });
        cy.triggerClickOnLink('/page2/');
        cy.wait(100);
        cy.window().then(() => {
            expect(triggered, 'event was not triggered').to.be.true;
            expect(prevented, 'preventDefault() was not called').to.be.true;
        });
    });

    it('should trigger a custom click event', () => {
        let triggered = false;
        cy.window().then(window => {
            window.swup.on('clickLink', () => triggered = true);
        });
        cy.triggerClickOnLink('/page2/');
        cy.wait(100);
        cy.window().then(() => {
            expect(triggered, 'event was not triggered').to.be.true;
        });
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

    it('should ignore links with data-no-swup attr', () => {
        cy.shouldNativelyLoadPageAfterAction('/page4/', () => {
            cy.get(`a[data-no-swup]`).first().click();
        });
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

    it('should remove swup class from html tag', () => {
        cy.window().then(window => {
            window.swup.destroy();
            cy.get('html').should('not.have.class', 'swup-enabled');
        });
    });

    it('should transition page and scroll on link with hash', () => {
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

    it('should transition to pages using swup API', () => {
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
