/// <reference types="Cypress" />

// window._swup holds the swup instance

const durationTolerance = 0.1; // 10% plus/minus

context('Window', () => {
    beforeEach(() => {
        cy.visit('/page1/');
    });

    it('should add swup class to html element', () => {
        cy.get('html').should('have.class', 'swup-enabled');
        cy.shouldHaveH1('Page 1');
    });

    it('should add data-swup attr to containers', () => {
        cy.get('[data-cy=container]').should('have.attr', 'data-swup', '0');
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
        cy.window().should(() => {
            expect(triggered, 'event was not triggered').to.be.true;
            expect(prevented, 'preventDefault() was not called').to.be.true;
        });
    });

    it('should detect transition timings', () => {
        let durationOut = 0;
        let durationIn = 0;
        const expectedDuration = 400;

        cy.window().then((window) => {
            let startOut = 0;
            let startIn = 0;
            window._swup.on('animationOutStart', e => startOut = performance.now());
            window._swup.on('animationOutDone', e => durationOut = performance.now() - startOut);
            window._swup.on('animationInStart', e => startIn = performance.now());
            window._swup.on('animationInDone', e => durationIn = performance.now() - startIn);
        });

        cy.triggerClickOnLink('/page2/');
        cy.window().should(() => {
            const durationRange = [expectedDuration * (1 - durationTolerance), expectedDuration * (1 + durationTolerance)];
            expect(durationIn, 'in duration not correct').to.be.within(...durationRange);
            expect(durationOut, 'out duration not correct').to.be.within(...durationRange);
        });
    });

    it('should detect complex transition timings', () => {
        cy.window().then(window => {
            window.document.documentElement.classList.add('test--complex-transitions');
        });

        let durationOut = 0;
        let durationIn = 0;
        const expectedDuration = 600;

        cy.window().then((window) => {
            let startOut = 0;
            let startIn = 0;
            window._swup.on('animationOutStart', e => startOut = performance.now());
            window._swup.on('animationOutDone', e => durationOut = performance.now() - startOut);
            window._swup.on('animationInStart', e => startIn = performance.now());
            window._swup.on('animationInDone', e => durationIn = performance.now() - startIn);
        });

        cy.triggerClickOnLink('/page2/');

        cy.window().should(() => {
            const durationRange = [expectedDuration * (1 - durationTolerance), expectedDuration * (1 + durationTolerance)];
            expect(durationIn, 'in duration not correct').to.be.within(...durationRange);
            expect(durationOut, 'out duration not correct').to.be.within(...durationRange);
        });
    });

    it('should detect keyframe timings', () => {
        cy.window().then(window => {
            window.document.documentElement.classList.add('test--keyframe-transitions');
        });

        let durationOut = 0;
        let durationIn = 0;
        const expectedDuration = 700;

        cy.window().then((window) => {
            let startOut = 0;
            let startIn = 0;
            window._swup.on('animationOutStart', e => startOut = performance.now());
            window._swup.on('animationOutDone', e => durationOut = performance.now() - startOut);
            window._swup.on('animationInStart', e => startIn = performance.now());
            window._swup.on('animationInDone', e => durationIn = performance.now() - startIn);
        });

        cy.triggerClickOnLink('/page2/');

        cy.window().should(() => {
            const durationRange = [expectedDuration * (1 - durationTolerance), expectedDuration * (1 + durationTolerance)];
            expect(durationIn, 'in duration not correct').to.be.within(...durationRange);
            expect(durationOut, 'out duration not correct').to.be.within(...durationRange);
        });
    });

    it('should trigger a custom click event', () => {
        let triggered = false;
        cy.window().then(window => {
            window._swup.on('clickLink', () => triggered = true);
        });
        cy.triggerClickOnLink('/page2/');
        cy.window().should(() => {
            expect(triggered, 'event was not triggered').to.be.true;
        });
    });

    it('should transition to other pages', () => {
        cy.triggerClickOnLink('/page2/');
        cy.shouldBeAtPage('/page2/');
        cy.shouldHaveH1('Page 2');

        cy.wait(500); // Wait for transition finish
        cy.triggerClickOnLink('/page3/');
        cy.shouldBeAtPage('/page3/');
        cy.shouldHaveH1('Page 3');
    });

    it('should transition if no CSS transition is defined', () => {
        cy.window().then(window => {
            window.document.documentElement.classList.add('test--no-transitions');
        });
        cy.triggerClickOnLink('/page2/');
        cy.shouldBeAtPage('/page2/');
        cy.shouldHaveH1('Page 2');
    });

    it('should ignore links with data-no-swup attr', () => {
        cy.shouldNativelyLoadPageAfterAction('/page4/', () => {
            cy.get(`a[data-no-swup]`).first().click();
        });
    });

    it('should ignore links with data-no-swup parent', () => {
        cy.shouldNativelyLoadPageAfterAction('/page4/', () => {
            cy.get(`li[data-no-swup] a`).first().click();
        });
    });

    // it('should ignore clicks when meta key pressed', () => {
    //     cy.triggerClickOnLink('/page2/', { metaKey: true });
    //     cy.wait(500);
    //     cy.shouldBeAtPage('/page1/');
    //     cy.shouldHaveH1('Page 1');
    // });

    it('should transition to previous page on popstate', () => {
        cy.triggerClickOnLink('/page2/');
        cy.shouldBeAtPage('/page2/');
        cy.shouldHaveH1('Page 2');

        cy.window().then(window => {
            window.history.back();
            cy.shouldBeAtPage('/page1/');
            cy.shouldHaveH1('Page 1');
        });
    });

    it('should transition to next page on popstate', () => {
        cy.triggerClickOnLink('/page2/');
        cy.shouldBeAtPage('/page2/');
        cy.shouldHaveH1('Page 2');

        cy.window().then(window => {
            window.history.back();
            window.history.forward();
            cy.shouldBeAtPage('/page2/');
            cy.shouldHaveH1('Page 2');
        });
    });

    it('should scroll to hash element and back to top', () => {
        cy.get('[data-cy=nav-to-anchor]').click();
        cy.shouldHaveElementInViewport('[data-cy=anchor]');

        cy.triggerClickOnLink('/page1/');
        cy.window().should(window => {
            expect(window.scrollY).equal(0);
        });
    });

    it('should scroll to id-based anchor', () => {
        cy.get('[data-cy=link-to-anchor-by-id]').click();
        cy.shouldHaveElementInViewport('[data-cy=anchor-by-id]');
    });

    it('should scroll to name-based anchor', () => {
        cy.get('[data-cy=link-to-anchor-by-name]').click();
        cy.shouldHaveElementInViewport('[data-cy=anchor-by-name]');
    });

    it('should scroll to anchor with special characters', () => {
        cy.get('[data-cy=link-to-anchor-with-colon]').click();
        cy.shouldHaveElementInViewport('[data-cy=anchor-with-colon]');
        cy.get('[data-cy=link-to-anchor-with-unicode]').click();
        cy.shouldHaveElementInViewport('[data-cy=anchor-with-unicode]');
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
            expect(typeof window._swup.findPlugin('ScrollPlugin')).equal('object');
        });
    });

    it('should remove swup class from html tag', () => {
        cy.window().then(window => {
            window._swup.destroy();
            cy.get('html').should('not.have.class', 'swup-enabled');
        });
    });

    it('should transition page and scroll on link with hash', () => {
        // go to page2 first
        cy.triggerClickOnLink('/page2/');
        cy.shouldBeAtPage('/page2/');

        cy.wait(500); // Wait for transition finish
        cy.triggerClickOnLink('/page1/#anchor');
        cy.shouldBeAtPage('/page1/#anchor');
        cy.shouldHaveH1('Page 1');
        cy.shouldHaveElementInViewport('[data-cy=anchor]');
    });

    it('should transition to pages using swup API', () => {
        cy.window().then(window => {
            window._swup.loadPage({ url: '/page2/' });
            cy.shouldBeAtPage('/page2/');
            cy.shouldHaveH1('Page 2');
        });
    });

    it('should update the body class', () => {
        cy.window().then(window => {
            window._swup.loadPage({ url: '/page2/' });
            cy.get('body').should('have.class', 'body2');
            cy.get('body').should('not.have.class', 'body1');
        });
    });

    it('should cache pages', () => {
        cy.window().then(window => {
            window._swup.loadPage({ url: '/page2/' });
            cy.shouldBeAtPage('/page2/');
            cy.window().should(() => {
                expect(window._swup.cache.getCurrentPage()).not.to.be.undefined;
            });
        });
    });

    it('should cache pages from absolute URLs', () => {
        cy.window().then(window => {
            window._swup.loadPage({ url: 'http://localhost:8274/page2/' });
            cy.shouldBeAtPage('/page2/');
            cy.window().should(() => {
                expect(window._swup.cache.getCurrentPage()).not.to.be.undefined;
            });
        });
    });
});
