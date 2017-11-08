# swup
Animated page transitions with css - simple, quick and fun.

**Note:** In case you like to do your animations in JS, you may also checkout [swupjs](https://www.npmjs.com/package/swupjs).

## Introduction
### What it does
* Swup takes care of browser history... without breaking it - animation is disabled for popstate events, browsers native window scrollTop amount is remembered and your page won't be jumping around on that iOS/OSX swipe for previous/next page.
* Swup works with your code. Need to attach your JS on the loaded content? Need to trigger some analytics events? ...or simply want to close a sidebar on page transition. No problem. Swup emits whole bunch of events that you can use in your code.
* Swup takes care of timing. Is your "out" animation done before page is loaded? It'll wait for the page to load to continue... Is your page loaded before animation is done? It'll wait for all your css transitions to finish... All you need is to define that buttery smooth transition, and swup does the rest.

### What it doesn't
* Swup never loads same page twice (when cache option is enabled). Actually, once you've visited several pages of site, you can even disable your internet connection and continue browsing.
* Swup doesn't wait for next page to be loaded to start the animation - it all happens at the same time. While user is trying to process what is happening on screen, your request is being served. With preload option enabled it can even start loading your page before you click the link... and don't worry, swup won't start another request to the same page in case you click the link while it's being preloaded. 
* Swup works with any server side rendered content and it doesn't require any setup on server. While it would be possible to limit the data sent from server to minimum and serve only blocks required by swup, it would require setup on server... and let's face it, those few extra lines of html is usually not what's slowing your load time. 


## Installation
```shell
npm install swup
```

## How it works
Apart from simply loading the contents of the new page and replacing it in html, swup is built around the css animation - you defined the transition and timing in css and swup handles the rest. Swup detects end of transition of animated elements and proceeds to replacing the content and animating your content back. For the animations based on css to be possible, swup uses several classes that are assign to html tag through the process of page transition.

* **is-animating** - this class is assigned to the html once link is clicked and is removed shortly after the content of the page is replaced
* **is-leaving** - assigned once link is clicked and removed when content is replaced
* **is-rendering** - assigned once content is replaced and removed when all css animations are done
* **is-changing** - assigned once link is clicked and remove whe all css animations are done

`is-animating` is the main class you should worry about, as it enables the animations. `is-leaving` and `is-rendering` can be used for defining different animations for animating the elements in/out. `is-changing` may be used for displaying some kind of loading while the transition is being done.

### Example
While developing the site, simply define the elements that are being animated and need to be replaced. Lets assume we want to fade in/out the main content of the page.
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

First thing we need to do is enable swup.
```javascript
import Swup from 'swup'
const swup = new Swup()
```

Add the `swup` id to the main element in html so it is replaced with the main element of the loaded page. Also add class that handles animations of the element - `a-fade`.
```html
    <main id="swup" class="a-fade">
        ...
    </main>
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
If you'd like to display the loading element while the transition is done, css would be...
```css
.loading {
    display: none;
}
html.is-changing .loading{
    display: block;
}
```
And that's it! Swup loads the page, handles classes for the css animation, waits for the animation to finish/page to load, replaces content and fades your content back. Swup also changes title of your page to the loaded one, and exchanges classes of body element (more in options section).

In some cases there is a need to animate elements that are common for all pages, but may for example display or hide for some pages, change color or whatever.. Let's assume we want navigation to change background color for different pages, based on body class. In that case you would usually like to start the animation on the click of the link, instead of when the next page is loaded. For this purpose there is special class added to your html tag on transition start and removed once the process of page transition is done. 
This special class takes form of `to-{whatever is the route of new page}`, where only exception is homepage, which does not have any route and so `to-homepage` is used.

Animation to dynamic pages with unknown routes (blog posts, etc.) can be animated to using data attribute `data-swup-class` set on link element. Swup takes the content of the attribute of clicked link and adds class name on html tag in a format `to-{content of the attribute}`, and also removes it after the whole process of routing is done. So for blog posts, you would want to add  `data-swup-class="blog-post"`, which would be added to html tag as `to-blog-post`.

Let's assume we want our header to be blue on homepage (/), but yellow in about (/about) page.
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
**Note:** For popState events the process is disabled and the content of page is replaced right away, to avoid tedious back button clicking and ensure proper functionality on mobile devices. 

## Options
Swup has a several options passed into a constructor as an object.
```javascript
let options = {}
const swup = new Swup(options)
```

### Link Selector
Link selector defines link elements that will trigger the transition. Default form is shown below.
```javascript
LINK_SELECTOR: 'a[href^="/"]:not([data-no-swup]), a[href^="#"]:not([data-no-swup]), a[xlink\\:href]'
```
In case you want to exclude links for some routes, lightbox or any other functionality, simply extend the selector. By default, you can simply add **data-no-swup** attribute if you want to exclude just a few.

**Note:** it is recommended to disable transition between language versions of your site, for multiple reasons (replacing of header/footer, analytics...).

### Elements
Elements option defines the array of elements to be replaced. Elements option usually contains the main element with content of the page. However, elements can include any element that is common for all transitioned pages. Example of such additional element is the "change language" link, which appears the same across site, but leads to a different link on each page. Option defaults to the single element of id `#swup`.
```javascript
options = {
    elements: ['#swup']
}
```

### Animation Selector
As swup is built on animations, it is required to define the elements that are being animated. Usually you would like to give the elements some common class or class prefix. By default option is set to `[class^='a-']`, which selects all elements with class attribute beginning with prefix `a-`.
```javascript
animationSelector: '[class^="a-"]'
```

### Cache
Swup has a built in cache, meaning that it stores previously loaded contents of the pages in memory in a form of object. This drastically improves speed for static sites, but should be disabled for dynamic sites. Cache option defaults to `true`.
```javascript
cache: true
```

### Page Class Prefix
Css styles are very often based on the class of the page defined in body element. Swup replaces the body classes for each loaded page. However, the site may use the body class attribute for functionality such as opening of some sort of menu by adding class to the body element. In that case, you may want to define a prefix for your page style classes such as `page-`, so only those are replaced. By default option is set to `''` and all classes of body element are replaced during the transition. In case of no classes are used on body element, simply set option to `false`.
```javascript
pageClassPrefix: 'page-'
```

### Scroll
Swup has a built in scroll control, where page smoothly scrolls to the top on desktop, and jumps directly to the top on mobile. Scroll to the anchor elements in url are also handled. This feature can be turned off and you can use your own scroll based on the emitted events discussed in events section. By default the option is set to `true`. Scrolling has several other options, such as `scrollDuration` - duration of the scroll, which is set to 0 by default (expects the page to be fully invisible while transitioning). Another options are `animateScrollToAnchor` and `animateScrollOnMobile`, where the name speaks for itself. Last is `doScrollingRightAway`, which determines whether scroll starts immediately after click on link, or after the content is replaced. 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
```javascript
scroll: true
```

### Support
Due to the use of promises, transitionEnd and pushState features of javascript, swup has a basic support check built in to avoid breaking of the site in case of older browser that do not support used features. However, as there may always be some exceptions for browsers, or different polyfills may be used on page (that may or may not work), this support check can be disabled and you can use your own support check before creating the instance. Support option is enabled by default.
```javascript
support: true
```

### Preload
Preload is an additional feature that can be used in combination with cache. When enabled, swup starts loading the page on hover of the link and does not wait for the user to click on the link. In case the page is not loaded at the time of clicking on the link, swup simply waits for the request to finish and does not create new request. Also, swup only creates one request at the time, so don't worry, your server won't be overwhelmed by few people just passing their cursor through some grid of links. 
If cache is disabled, swup still preloads pages of hovered links, but the contents of cache are removed after each page transition. 
In case you want to preload some page automatically without any trigger by user, `data-swup-preload` on the link will do the trick.
```javascript
preload: true
```

### Disable IE
While swup itself should run without problem in IE Edge (or other IE with help of some polyfills), I have ran into multiple problems on IE (including Edge), related to updating browser history, replacing large parts of page with javascript or performance of animation on large elements. That's why swup allows to simply disable the whole thing in all IE browsers with `disableIE` option. Swup is enabled in IE by default.
```javasrripts
disableIE: false
```

### Debug Mode
Debug mode is very useful for integrating swup into your site. When enabled, swup displays emitted events (see events section) in console, as well as contents of the cache when changed. Option defaults to false.
```javasrripts
debugMode: false
```

### Example with default values
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
    disableIE: false,
    animateScrollToAnchor: false,
    animateScrollOnMobile: false,
    doScrollingRightAway: false,
    scrollDuration: 0,
}
```

## Events
As it usually is when loading page with JS, there may be many constrains such as analytics or enabling the scripts for replaced content. For this purpose, swup emits whole bunch of events triggered on document while working, which can be used as follows:
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
    swup.options.elements.forEach((element) => {
        loadComponents(document.querySelector(element))
    })
});
```

### List of all events
* **swup:contentReplaced** - triggers when the content of page is replaced
* **swup:pageView** - similar as previous, except it is once trigger on load of the page
* **swup:hoverLink** - triggers when link for transition is hovered
* **swup:clickLink** - triggers when link for transition is clicked
* **swup:animationOutDone** - triggers when transition of all animated elements is done (after click of link and before content is replaced)
* **swup:pagePreloaded** - triggers when the preload of some page is done
* **swup:pageLoaded** - triggers when loading of some page is done (differs from previous only by the source of event - hover/click)
* **swup:scrollStart** - triggers when built in scroll is started
* **swup:scrollDone** - triggers when built in scroll is done
* **swup:animationInDone** - triggers when transition of all animated elements is done (after content is replaced)
* **swup:pageRetrievedFromCache** - triggers when page is retrieved from cache and no request is necessary
* **swup:swupEnabled** - triggers when swup instance is created or re-enabled after call of `destroy()`
* **swup:swupDisabled** - triggers on `destroy()`

## API
Instance of the swup can be imported and used across your sites javascript to enable some additional features. When debugMode (see options section) is enabled, instance is also available in `window` object as `window.swup` so you can play with it.
You can for example access some of the information used by swup such as the elements to be replaced:
```javascript
swup.options.elements.forEach((element) => {
    // do whatever for each replaced element
})
```
or use built in function for your own stuff
```javascript
// navigates to /someRoute with the animations and all...
swup.loadPage('/someRoute', false)
// or disable swup
swup.destroy()
```











