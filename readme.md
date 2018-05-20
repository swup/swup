# swup
**Animated page transitions with css.**

![Transition examples](https://user-images.githubusercontent.com/9338324/39842661-9ec5d41a-53e7-11e8-87de-963b4da4a952.gif)

**Note:** In case you like to do your animations in JavaScript, you may also check out [swupjs](https://github.com/gmrchk/swupjs).

## Table of contents
[Introduction](#introduction)
* [What it does](#what-it-does) 
* [What it doesn't do](#what-it-doesnt-do) 

[Installation](#installation)

[How it works](#how-it-works)
* [Example](#example)
* [Example of different transitions for different pages](#example-of-different-transitions-for-different-pages)

[Options](#options)
* [Link Selector](#link-selector)
* [Element](#elements)
* [Animation Selector](#animation-selector)
* [Cache](#cache)
* [Page Class Prefix](#page-class-prefix)
* [Scroll](#scroll)
* [Support](#support)
* [Disable IE](#disable-ie)
* [Debug Mode](#debug-mode)
* [Default values](#default-values)

[Events](#events)

[API](#api)

## Introduction
Swup enables animated transitions between pages powered by CSS. All you need to do is define how your page looks in the transition state, and swup takes care of the rest. Here's a little [preview](https://gmrchk.github.io/swup/).

### What it does
* Swup takes care of browser history... without breaking it - animation is disabled for popState events, browsers scroll control is preserved and your page won't be jumping around on that iOS/OSX swipe a previous/next page.
* Swup works with your code. Need to attach your JavaScript on the loaded content? Need to trigger some analytics events? Simply want to close a sidebar on page change? No problem. Swup emits a bunch of events that you can use in your code.
* Swup takes care of timing. It automatically detects when your css transitions are finished, and of course, when the next page is loaded. All you need to do is define that buttery smooth transition, and leave the rest to swup.

### What it doesn't do
* Swup never loads the same page twice (when cache option is enabled). Actually, once you've visited several pages of site, you can even disable your internet connection and continue browsing.
* Swup doesn't wait for next page to be loaded to start the animation - it all happens at the same time. While a user is trying to process what is happening on screen, your request is being served. With preload option enabled it can even start loading your page before you click the link. But don't worry, swup won't start another request to the same page in case you click the link while it's being preloaded. At the same time, it won't spam your server with requests in case user hovers over a list of links of some sort - maximum number of requests being created/processed by swup at once is two. 
* Swup works with any server-side rendered content and it doesn't require any setup on the server. However, it is possible to implement a transfer of only required data on the server based on `X-Requested-With` request header. In that case, swup can be easily modified based on your solution.

**Note:** Swup is currently stable and production-ready. However, it is a "one-man show" and any contributions or suggestions are welcome.

## Installation
```shell
npm install swup
```

or include the file from the dist folder

```html
<script src="./dist/swup.js"></script>
```


## How it works
Apart from simply loading the contents of the new page and replacing it in HTML, swup is built around css animation - you defined the transition and timing in CSS and swup handles the rest. Swup detects the end of transition of animated elements and proceeds to replacing the content and animating your page back. For the animations based on CSS to be possible, swup uses several classes that are assigned to the html tag through the process of page transition.

* `is-animating` - This class is assigned to the html tag once link is clicked and is removed shortly after the content of the page is replaced. (used for defining styles for an unloaded page)
* `is-changing` - Assigned once a link is clicked and removed when the whole process of transition of pages is done. (used for showing some loading)
* `is-leaving` - Assigned once a link is clicked and removed right before the content is replaced. (just in case.. maybe different animations for in/out transition?)
* `is-rendering` - Assigned right before the content is replaced and removed when the whole process of transition of pages is done. (same as above)

### Example
While developing the site, simply define the elements that are being animated and need to be replaced. Let's assume we want to fade in/out the main content of the page.
```html
<html>
    <head>
        <title>Homepage</title>
    </head>
    <body>
        <main>
            <h1>This is homepage</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <a href="/someOtherPage">Go to other page</a>
        </main>
        <div class="loading">We are loading...</div>
    </body>
</html>
```

The first thing we need to do is enable swup.
```javascript
import Swup from 'swup'
const swup = new Swup()
```

or simply 

```javascript
var swup = new Swup()
```
in case you've included swup from a dist folder. 

Add the `swup` id to the main element in HTML so it is replaced with the main element of the loaded page. Also, add the class that handles animations of our faded element - `a-fade`.
```html
    <div class="a-fade">
        <main id="swup">
            ...
        </main>
    </div>
    <div class="loading">We are loading...</div>
```

Add your css for the element transition.
```css
.a-fade {
    transition: .4s;
    opacity: 1;
}
html.is-animating .a-fade{
    opacity: 0;
}
```

In case you'd like to display the loading element while the transition is done, css would be...
```css
.loading {
    display: none;
}
html.is-changing .loading{
    display: block;
}
```
And that's it, we're all set, or at least for our fade in/fade out example. 

Swup loads the page, handles classes for the css animation, waits for the animation to finish/page to load, replaces content and fades your content back. Swup also changes the title of your page to the loaded one, and exchanges classes of body element (more in [options](#options) section).

### Example of different transitions for different pages
In case you would like to animate the state of an element that stays on the page, but only changes it's style based on the page you're visiting, we've got you covered as well. Let's assume we want our navigation to change the background color for different pages, based on body class. In that case, you would probably like to start the change of background on the click of the link, but we can't really know what is the next body class going to be before the content of next page is loaded. For this purpose, there is special class added to your html tag on transition start and removed once the process of page transition is done. 
This special class takes form of `to-{route of next page in URL friendly form}`, where the only exception is the homepage, which does not have any route and so `to-homepage` is used.

In case we want to use same feature with dynamic pages with unknown routes (blog posts, etc.) data attribute `data-swup-class` set on link element will do the trick. Swup takes the content of the attribute of clicked link and adds class name on html tag in a format `to-{content of the attribute}`, and also removes it after the whole process of transition is done (so for blog posts, you would want to add something like  `data-swup-class="blog-post"` on the link, which would result in `to-blog-post` class on html tag). 

More practical example - let's assume we want our header to be blue on the homepage (/), but yellow in the about (/about) page.
```css
header {
    transition: .4s;
}
body.page-homepage header {
    background: blue;
}
body.page-about header {
    background: yellow;
}
``` 

For the color to start changing right after the click on the link, simply add...
```css
html.to-homepage header {
    background: blue;
}
html.to-about header {
    background: yellow;
}
``` 
**Note:** For popState events (back/forward) the process is disabled and the content of the page is replaced right away, to avoid tedious back button clicking and ensure proper functionality on touch devices (back/forward on horizontal drag). 

## Options
Swup has a several options passed into a constructor as an object.
```javascript
let options = {}
const swup = new Swup(options)
```

### Link Selector
Link selector defines link elements that will trigger the transition. By default, the selector takes any link with `href` attribute starting with `/`, `#` or with `xlink` attribute for SVG elements. The raw selector form is shown below.
```javascript
LINK_SELECTOR: 'a[href^="/"]:not([data-no-swup]), a[href^="#"]:not([data-no-swup]), a[xlink\\:href]'
```
In case you want to exclude links for some routes, lightbox or any other functionality, simply extend the selector. By default, you can simply add `data-no-swup` attribute to the link, if you want to exclude just a few.

**Tip:** In most cases, it is good to disable transition between language versions of your site for multiple reasons - replacing of header/footer, analytics, etc.

### Elements
Elements option defines the array of selectors of elements to be replaced. 
Elements option usually contains the main element with the content of the page. 
However, elements can include any element that is common for all transitioned pages.
This creates a possibility of animating elements on the page while still replacing it's parts. 
Another good example is the "change language" link, which usually appears the same across the site, but leads to a different URL on each page. 
Option defaults to the single element of id `#swup`.
```javascript
options = {
    elements: ['#swup']
}
```

### Animation Selector
As swup is built on animations, it is required to define the elements that are being animated. Usually, you would like to give the elements some common class or class prefix. By default option is set to `[class^='a-']`, which selects all elements with class attribute beginning with prefix `a-`.
```javascript
animationSelector: '[class^="a-"]'
```

### Cache
Swup has a built-in cache, meaning that it stores previously loaded contents of the pages in memory in a form of an object. This drastically improves speed for static sites but should be disabled for dynamic sites. Cache option defaults to `true`.
```javascript
cache: true
```

### Preload
When enabled, swup starts loading the page on hover of the link and does not wait for the user to click. In case the page is not loaded at the time of clicking on the link, swup simply waits for the request to finish and does not create a new request. Also, swup only creates one preload request at the time, so your server won't be overwhelmed by people just passing their cursor through some grid of links. 
If cache is disabled, swup still preloads pages of hovered links, but the content of cache is removed after each page transition. 
In case you want to preload some page automatically without any trigger by the user, `data-swup-preload` on the link will do the trick.
```javascript
preload: true
```

### Page Class Prefix
Some CSS styles are very often based on the class of the page defined in the body element. Swup replaces the body classes for each loaded page. However, the site may use the body class attribute for functionality such as opening of some sort of menu by adding class to the body element. In that case, you may want to define a prefix for your page style classes such as `page-`, so only those are replaced. By default option is set to `''` and all classes of body element are replaced during the transition.
```javascript
pageClassPrefix: ''
```

### Scroll
Swup has a built-in scroll control. Scroll to the anchor element in URL is also handled. This feature can be turned off and you can use your own scroll based on the emitted events discussed in [events](#events) section. By default, the option is set to `true`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
```javascript
scroll: true
```

There are additional settings for scroll:

`doScrollingRightAway` defines if swup is supposed to wait for the replace of the page to scroll to the top. 
`animateScroll` sets whether the scroll animation is enabled. 
Animation of scroll is also adjustable with options `scrollFriction` and `scrollAcceleration`.

All default values for additional options of scroll are displayed below:

```javascript
doScrollingRightAway: false,
animateScroll: true,
scrollFriction: .3,
scrollAcceleration: .04,
```

### Support
Due to the use of promises, transitionEnd and pushState features of JavaScript, swup has a basic support check built in to avoid breaking of the site in case of an older browser that doesn't support used features. 
However, as there may always be some exceptions for browsers or polyfills can be used on the page (that may or may not work), this support check can be disabled and you can use your own support check before creating the instance. Support option is enabled by default.
```javascript
support: true
```

### Disable IE
While swup itself should run without problem in IE Edge (or other IE with help of some polyfills), I have encountered multiple problems on IE (including Edge) in some particular situations, related to updating browser history, rendering large parts of page replaced with javascript or performance of animation on large elements. That's why swup allows to simply disable the whole thing in all IE browsers with `disableIE` option. This option is intended as a last resort to save your computer from physical damage caused by an angry developer. Swup is enabled in IE by default.
```javasrripts
disableIE: false
```

### Debug Mode
Debug mode is useful for integrating swup into your site. When enabled, swup displays emitted events (see [events](#events) section) in the console, as well as contents of the cache when changed. Swup instance is also accessible globally as `window.swup` in debug mode. Option defaults to false.
```javasrripts
debugMode: false
```

### Default values
```javascript
let options = {
    LINK_SELECTOR: 'a[href^="/"]:not([data-no-swup]), a[href^="#"]:not([data-no-swup]), a[xlink\\:href]',
    elements: [
        '#swup'
    ],
    animationSelector: '[class^="a-"]',
    cache: true,
    pageClassPrefix: '',
    scroll: true,
    debugMode: false,
    preload: true,
    support: true,
    disableIE: false
}
```

## Events
As we are replacing the native functionality of the browser, there may be some constraints related to that. For this purpose, swup emits bunch of events triggered on the document while working. We can use those events to enable our JavaScript, trigger some analytics, etc.
```javascripts
// trigger page view for GTM
document.addEventListener('swup:pageView', event => {
    dataLayer.push({
        'event': 'VirtualPageview',
        'virtualPageURL': window.location.pathname,
        'virtualPageTitle' : document.title
    });
});

// load scripts for replaced elements
document.addEventListener('swup:contentReplaced', event => {
    swup.options.elements.forEach((selector) => {
        // load scripts for all elements with 'selector'
    })
});
```

### List of all events
* **swup:contentReplaced** - triggers when the content of page is replaced
* **swup:pageView** - similar as previous, except it is once trigger on load of the page
* **swup:hoverLink** - triggers when link is hovered
* **swup:clickLink** - triggers when link is clicked
* **swup:animationOutDone** - triggers when transition of all animated elements is done (after click of link and before content is replaced)
* **swup:pagePreloaded** - triggers when the preload of some page is done
* **swup:pageLoaded** - triggers when loading of some page is done (differs from previous only by the source of event - hover/click)
* **swup:scrollStart** - triggers when built in scroll is started
* **swup:scrollDone** - triggers when built in scroll is done
* **swup:animationInDone** - triggers when transition of all animated elements is done (after content is replaced)
* **swup:pageRetrievedFromCache** - triggers when page is retrieved from cache and no request is necessary
* **swup:enabled** - triggers when swup instance is created or re-enabled after call of `destroy()`
* **swup:disabled** - triggers on `destroy()`

## API
The instance of the swup can be imported and used across your sites JavaScript to enable some additional features. When debug mode (see [options](#options) section) is enabled, instance is also available in `window` object as `window.swup`.
We can access some of the information used by swup such as used options:
```javascript
swup.options.elements.forEach((selector) => {
    // do whatever for each replaced element
})
swup.options.cache; // true/false
```
or change options
```javascript
// enable cache
swup.options.cache = true;
```
or use built in functions
```javascript
// navigates to /someRoute with the animations and all...
swup.loadPage('/someRoute', false)
// disable swup
swup.destroy()
```
Sky is the limit here.











