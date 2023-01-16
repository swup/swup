/// <reference types="Cypress" />

// this.swup holds the swup instance

const durationTolerance = 0.25; // 25% plus/minus

const createPlugin = (plugin = {}) => {
    return {
        name: 'TestPlugin',
        isSwupPlugin: true,
        mount: () => {},
        unmount: () => {},
        _checkRequirements: () => true,
        ...plugin
    };
};

beforeEach(() => {
    cy.visit('/page1/');
    cy.window().then((window) => {
        cy.wrap(window._swup).as('swup');
    });
});

describe('Instance', function() {

    it('should have a version property', function() {
        expect(this.swup.version).to.not.be.empty;
    });

    it('should mount and unmount plugins', function() {
        const plugin = createPlugin();
        cy.spy(plugin, 'mount');
        cy.spy(plugin, 'unmount');

        this.swup.use(plugin);
        expect(plugin.mount).to.be.called;

        this.swup.unuse(plugin);
        expect(plugin.unmount).to.be.called;
    });

    it('should find a plugin instance by reference', function() {
        const plugin = createPlugin();
        this.swup.use(plugin);
        const instance = this.swup.findPlugin(plugin);
        expect(instance).to.be.an('object');
    });

    it('should find a plugin instance by name', function() {
        const plugin = createPlugin({ name: 'ExamplePlugin' });
        this.swup.use(plugin);
        const instance = this.swup.findPlugin('ExamplePlugin');
        expect(instance).to.be.an('object');
    });

    it('should check plugin requirements', function() {
        const plugin = createPlugin();
        cy.spy(plugin, '_checkRequirements');
        this.swup.use(plugin);
        expect(plugin._checkRequirements).to.be.called;
    });

    it('should reject plugins with unmet requirements', function() {
        const allowedPlugin = createPlugin({ _checkRequirements: () => true });
        const unallowedPlugin = createPlugin({ _checkRequirements: () => false });
        this.swup.use(allowedPlugin);
        this.swup.use(unallowedPlugin);

        const allowedInstance = this.swup.findPlugin(allowedPlugin);
        expect(allowedInstance).to.be.an('object');

        const unallowedInstance = this.swup.findPlugin(unallowedPlugin);
        expect(unallowedInstance).to.be.undefined;
    });
});

describe('Cache', function() {

    it('should cache pages', function() {
        this.swup.loadPage({ url: '/page2/' });
        cy.shouldBeAtPage('/page2/');
        cy.window().should(() => {
            expect(this.swup.cache.getCurrentPage()).not.to.be.undefined;
        });
    });

    it('should cache pages from absolute URLs', function() {
        this.swup.loadPage({ url: 'http://localhost:8274/page2/' });
        cy.shouldBeAtPage('/page2/');
        cy.window().should(() => {
            expect(this.swup.cache.getCurrentPage()).not.to.be.undefined;
        });
    });

});

describe('Markup', function() {

    it('should add swup class to html element', function() {
        cy.get('html').should('have.class', 'swup-enabled');
        cy.shouldHaveH1('Page 1');
    });

    it('should add data-swup attr to containers', function() {
        cy.get('[data-cy=container]').should('have.attr', 'data-swup', '0');
    });

    it('should process transition classes', function() {
        cy.triggerClickOnLink('/page2/');
        cy.wait(300);
        cy.shouldHaveTransitionLeaveClasses('page2');
        cy.wait(300);
        cy.shouldHaveTransitionEnterClasses('page2');
        cy.wait(300);
        cy.shouldNotHaveTransitionClasses('page2');
    });

    it('should remove swup class from html tag', function() {
        this.swup.destroy();
        cy.get('html').should('not.have.class', 'swup-enabled');
    });

});

describe('Events', function() {

    it('should prevent the default click event', function() {
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

    it('should trigger a custom click event', function() {
        const handlers = { click() {} };
        cy.spy(handlers, 'click');

        this.swup.on('clickLink', handlers.click);
        cy.triggerClickOnLink('/page2/');
        cy.window().should(() => {
            expect(handlers.click).to.be.called;
        });
    });

    it('should remove custom event handlers', function() {
        const handlers = { transition() {}, content() {} };
        cy.spy(handlers, 'transition');
        cy.spy(handlers, 'content');

        this.swup.on('transitionStart', handlers.transition);
        this.swup.on('contentReplaced', handlers.content);

        cy.triggerClickOnLink('/page2/');
        cy.window().should(() => {
            expect(handlers.transition).to.be.calledOnce;
            expect(handlers.content).to.be.calledOnce;
        });

        cy.window().then(() => {
            this.swup.off('transitionStart', handlers.transition);
        });
        cy.triggerClickOnLink('/page3/');
        cy.window().should(() => {
            expect(handlers.transition).to.be.calledOnce;
            expect(handlers.content).to.be.calledTwice;
        });
    });
});

describe('Transitions', function() {

    it('should detect transition timings', function() {
        let durationOut = 0;
        let durationIn = 0;
        const expectedDuration = 400;

        cy.window().then(() => {
            let startOut = 0;
            let startIn = 0;
            this.swup.on('animationOutStart', () => startOut = performance.now());
            this.swup.on('animationOutDone', () => durationOut = performance.now() - startOut);
            this.swup.on('animationInStart', () => startIn = performance.now());
            this.swup.on('animationInDone', () => durationIn = performance.now() - startIn);
        });

        cy.triggerClickOnLink('/page2/');
        cy.window().should(() => {
            const durationRange = [expectedDuration * (1 - durationTolerance), expectedDuration * (1 + durationTolerance)];
            expect(durationIn, 'in duration not correct').to.be.within(...durationRange);
            expect(durationOut, 'out duration not correct').to.be.within(...durationRange);
        });
    });

    it('should detect complex transition timings', function() {
        cy.document().then(document => {
            document.documentElement.classList.add('test--complex-transitions');
        });

        let durationOut = 0;
        let durationIn = 0;
        const expectedDuration = 600;

        cy.window().then(() => {
            let startOut = 0;
            let startIn = 0;
            this.swup.on('animationOutStart', () => startOut = performance.now());
            this.swup.on('animationOutDone', () => durationOut = performance.now() - startOut);
            this.swup.on('animationInStart', () => startIn = performance.now());
            this.swup.on('animationInDone', () => durationIn = performance.now() - startIn);
        });

        cy.triggerClickOnLink('/page2/');

        cy.window().should(() => {
            const durationRange = [expectedDuration * (1 - durationTolerance), expectedDuration * (1 + durationTolerance)];
            expect(durationIn, 'in duration not correct').to.be.within(...durationRange);
            expect(durationOut, 'out duration not correct').to.be.within(...durationRange);
        });
    });

    it('should detect keyframe timings', function() {
        cy.window().then(window => {
            window.document.documentElement.classList.add('test--keyframe-transitions');
        });

        let durationOut = 0;
        let durationIn = 0;
        const expectedDuration = 700;

        cy.window().then(() => {
            let startOut = 0;
            let startIn = 0;
            this.swup.on('animationOutStart', () => startOut = performance.now());
            this.swup.on('animationOutDone', () => durationOut = performance.now() - startOut);
            this.swup.on('animationInStart', () => startIn = performance.now());
            this.swup.on('animationInDone', () => durationIn = performance.now() - startIn);
        });

        cy.triggerClickOnLink('/page2/');

        cy.window().should(() => {
            const durationRange = [expectedDuration * (1 - durationTolerance), expectedDuration * (1 + durationTolerance)];
            expect(durationIn, 'in duration not correct').to.be.within(...durationRange);
            expect(durationOut, 'out duration not correct').to.be.within(...durationRange);
        });
    });
});

describe('Navigation', function() {

    it('should transition to other pages', function() {
        cy.triggerClickOnLink('/page2/');
        cy.shouldBeAtPage('/page2/');
        cy.shouldHaveH1('Page 2');

        cy.wait(500); // Wait for transition finish
        cy.triggerClickOnLink('/page3/');
        cy.shouldBeAtPage('/page3/');
        cy.shouldHaveH1('Page 3');
    });

    it('should transition if no containers defined', function() {
        this.swup.options.animationSelector = false;
        cy.triggerClickOnLink('/page2/');
        cy.shouldBeAtPage('/page2/');
        cy.shouldHaveH1('Page 2');
    });

    it('should transition if no CSS transition is defined', function() {
        cy.window().then(window => {
            window.document.documentElement.classList.add('test--no-transitions');
        });
        cy.triggerClickOnLink('/page2/');
        cy.shouldBeAtPage('/page2/');
        cy.shouldHaveH1('Page 2');
    });

    // it('should ignore visit when meta key pressed', function() {
    //     cy.triggerClickOnLink('/page2/', { metaKey: true });
    //     cy.wait(500);
    //     cy.shouldBeAtPage('/page1/');
    //     cy.shouldHaveH1('Page 1');
    // });
});

describe('Links', function() {

    it('should accept relative links', function() {
        cy.get('[data-cy=nav-link-rel]').click();
        cy.shouldBeAtPage('/page2/');
        cy.shouldHaveH1('Page 2');
    });

    it('should resolve document base URLs', function() {
        cy.visit('/page1/sub1/');
        cy.get('[data-cy=nav-link-sub]').click();
        cy.shouldBeAtPage('/page1/sub2/');
        cy.shouldHaveH1('Sub 2');
    });

    it('should skip links to different origins', function() {
        cy.shouldHaveReloadedAfterAction(() => {
            cy.get('[data-cy=nav-link-ext]').click();
        });
        cy.location().should((location) => {
            expect(location.origin).to.eq('https://example.net');
        });
    });
});

describe('Ignoring visits', function() {

    it('should ignore links with data-no-swup attr', function() {
        cy.shouldHaveReloadedAfterAction(() => {
            cy.get(`a[data-no-swup]`).first().click();
        });
        cy.shouldBeAtPage('/page4/');
    });

    it('should ignore links with data-no-swup parent', function() {
        cy.shouldHaveReloadedAfterAction(() => {
            cy.get(`li[data-no-swup] a`).first().click();
        });
        cy.shouldBeAtPage('/page4/');
    });

});

describe('Link selector', function() {

    it('should ignore SVG links by default', function() {
        cy.shouldHaveReloadedAfterAction(() => {
            cy.get('svg a').first().click();
        });
        cy.shouldBeAtPage('/page2/');
    });

    it('should follow SVG links when added to selector', function() {
        this.swup.options.linkSelector = 'a[href], svg a[*|href]';
        cy.get('svg a').first().click();
        cy.shouldBeAtPage('/page2/');
        cy.shouldHaveH1('Page 2');
    });

    it('should ignore map area links by default', function() {
        cy.shouldHaveReloadedAfterAction(() => {
            cy.get('map area').first().click({ force: true });
        });
        cy.shouldBeAtPage('/page2/');
    });

    it('should follow map area links when added to selector', function() {
        this.swup.options.linkSelector = 'a[href], map area[href]';
        cy.get('map area').first().click({ force: true });
        cy.shouldBeAtPage('/page2/');
        cy.shouldHaveH1('Page 2');
    });

});

describe('Resolve URLs', function() {

    it('should ignore links for equal resolved urls', function() {
        cy.window().then(() => {
            this.swup.options.resolveUrl = () =>'/page1/';
            cy.triggerClickOnLink('/page2/');
            cy.wait(500).then(() => {
                cy.shouldBeAtPage('/page1/');
            });
        });
    });

    it('should skip popstate handling for equal resolved urls', function() {
        cy.window().then(window => {
            this.swup.options.resolveUrl = () =>'/page1/';
            window.history.pushState(
                {
                    url: '/pushed-page-1/',
                    random: Math.random(),
                    source: 'swup'
                },
                document.title,
                '/pushed-page-1/'
            );

            window.history.pushState(
                {
                    url: '/pushed-page-2/',
                    random: Math.random(),
                    source: 'swup'
                },
                document.title,
                '/pushed-page-2/'
            );

            cy.wait(500).then(() => {
                window.history.back();
                cy.shouldBeAtPage('/pushed-page-1/');
                cy.shouldHaveH1('Page 1');
            })
        });
    });
});

describe('History', function() {

    it('should transition to previous page on popstate', function() {
        cy.triggerClickOnLink('/page2/');
        cy.shouldBeAtPage('/page2/');
        cy.shouldHaveH1('Page 2');

        cy.window().then(window => {
            window.history.back();
            cy.shouldBeAtPage('/page1/');
            cy.shouldHaveH1('Page 1');
        });
    });

    it('should transition to next page on popstate', function() {
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

    it('should save state into the history', function() {
        cy.triggerClickOnLink('/page2/');
        cy.shouldBeAtPage('/page2/');

        cy.window().then(window => {
            window.history.back();
            cy.window().should(() => {
                expect(window.history.state.url, 'page url not saved').to.equal('/page1/');
                expect(window.history.state.source, 'state source not saved').to.equal('swup');
            });
        });
    });

    it('should trigger a custom popState event', function() {
        const handlers = { popstate() {} };
        cy.spy(handlers, 'popstate');

        this.swup.on('popState', handlers.popstate);

        cy.triggerClickOnLink('/page2/');
        cy.shouldBeAtPage('/page2/');

        cy.window().then((window) => {
            window.history.back();
        });
        cy.window().should(() => {
            expect(handlers.popstate).to.be.called;
        });
    });

    it('should skip popstate handling for foreign state entries', function() {
        cy.window().then(window => {
            window.history.pushState({ source: 'not-swup' }, null, '/page-2/');
            window.history.pushState({ source: 'not-swup' }, null, '/page-3/');

            window.history.back();
            cy.shouldBeAtPage('/page-2/');
            cy.shouldHaveH1('Page 1');
        });
    });

});

describe('API', function() {

    it('should transition to pages using swup API', function() {
        this.swup.loadPage({ url: '/page2/' });
        cy.shouldBeAtPage('/page2/');
        cy.shouldHaveH1('Page 2');
    });

});

describe('Scroll Plugin', function() {

    it('should scroll to hash element and back to top', function() {
        cy.get('[data-cy=nav-to-anchor]').click();
        cy.shouldHaveElementInViewport('[data-cy=anchor]');

        cy.triggerClickOnLink('/page1/');
        cy.window().should((window) => {
            expect(window.scrollY).equal(0);
        });
    });

    it('should scroll to id-based anchor', function() {
        cy.get('[data-cy=link-to-anchor-by-id]').click();
        cy.shouldHaveElementInViewport('[data-cy=anchor-by-id]');
    });

    it('should scroll to name-based anchor', function() {
        cy.get('[data-cy=link-to-anchor-by-name]').click();
        cy.shouldHaveElementInViewport('[data-cy=anchor-by-name]');
    });

    it('should scroll to anchor with special characters', function() {
        cy.get('[data-cy=link-to-anchor-with-colon]').click();
        cy.shouldHaveElementInViewport('[data-cy=anchor-with-colon]');
        cy.get('[data-cy=link-to-anchor-with-unicode]').click();
        cy.shouldHaveElementInViewport('[data-cy=anchor-with-unicode]');
    });

    it('should transition page and scroll on link with hash', function() {
        // go to page2 first
        cy.triggerClickOnLink('/page2/');
        cy.shouldBeAtPage('/page2/');

        cy.wait(500); // Wait for transition finish
        cy.triggerClickOnLink('/page1/#anchor');
        cy.shouldBeAtPage('/page1/#anchor');
        cy.shouldHaveH1('Page 1');
        cy.shouldHaveElementInViewport('[data-cy=anchor]');
    });

});

describe('Body Class Plugin', function() {

    it('should update the body class', function() {
        this.swup.loadPage({ url: '/page2/' });
        cy.get('body').should('have.class', 'body2');
        cy.get('body').should('not.have.class', 'body1');
    });

});
