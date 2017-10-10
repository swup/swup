# swup
Swup lets you easily create site equipped with animated transitions between pages, without all that hassle of dealing with popstates, requests... All you have to care about is css transitions. Whether the site is ready or you are just starting, swup implementation is very easy and straight forward.

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

`is-animating` is the main class you should worry about, as it enables the animations. `is-leaving` and `is-rendering` can be used for defining different animations for animating the elements in/out. `is-changing` may be used for for displaying some kind of loading while the transition is being done.

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

Add the `swup` id to the main element in html so it is replaced with the main element of the loaded page. Also add the class that handles the animations of the element - `a-fade`.
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
And that's it! Swup loads the page, handles the classes for the css animation, waits for the animation to finish/page to load, replaces the content and fades your content back, as well as changes the title of your page to the loaded one, and exchanges the classes of the body element (more in options section).

In some cases there is a need to animate elements that are common for all pages, but may for example display or hide for some pages, change color or whatever... In that case you would usually like to start the animation on the click of the link, instead of when the next page is loaded. For this purpose there is special class added to your html tag on transition start and removed once the process of page transition is done. 
This special class takes form of `to-{whatever is the route of new page}`, where only exception is homepage, which does not have any route and so `to-homepage` is added.

Animation to dynamic pages with unknown routes (blog posts, etc.) can be animated to using data attribute `data-swup-class` set on link element. Swup takes the content of the attribute of clicked link and adds class name on html tag in a format `to-{content of the attribute}`, and also removes it after the whole process of routing is done. So for blog posts, you would want to add  `data-swup-class="blog-post"`, which would be added to html tag as `to-blog-post`.

Lets assume we want our header to be blue on homepage (/), but yellow in about (/about) page.
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
For the color to start changing right after the click on the link, simply change add...
```css
html.to-homepage header {
    background: blue;
}
html.to-about header {
    background: yellow;
}
``` 
**Note:** For popState events the process is disabled and the content of page is replaced right away, to avoid tedious back button clicking and ensure proper functionality on mobile devices. 

## options
Swup has a several options passed into a constructor as an object.
```javascript
let options = {}
const swup = new Swup(options)
```

### Link Selector
Link selector defines link elements will trigger the transition. Default form is shown below.
```javascript
LINK_SELECTOR: 'a[href^="/"]:not([data-no-swup]), a[href^="#"]:not([data-no-swup]), a[xlink\\:href]'
```
In case you want to exclude links for some routes, lightbox or any other functionality, simply extend the selector. By default, you can simply add **data-no-swup** attribute if you want to exclude just a few.
**Note:** it is recommended to disable transition between the language versions of your site, for multiple reasons (replacing of header/footer elements, analytics...).

### Elements
Elements option defines the array of elements to be replaced. Elements option usually contains the main elements with a content of the page. However, elements can include any element that is common for all transitioned pages. Example of such additional element is the "change language" link, which appears the same across site, but leads to a different link on each page. Options defaults to the single element of id `#swup`.
```javascript
options = {
    elements: ['#swup']
}
```

### Animation Selector
As swup is built on animations, it is required to define the elements that are being animated. Usually you would like to give the elements some common class or class prefix. By default option is set to `[class^='a-']`, which selects all elements with class attribute beginning with prexif `a-`.
```javascript
animationSelector: '[class^="a-"]'
```

### Cache
Swup has a built in cache, meaning that it stores previously loaded contents of the pages in memory in a form of object. This drastically improves speed for static sites, but should be disabled for dynamic sites. Cache option defaults to `true`.
```javascript
cache: true
```

### Page Class Prefix
CSS styles are very often based on the class of the page defined in body element. Swup replaces the body classes for each loaded page. However, the site may use the body class attribute for functionality such as opening of some sort of menu by adding class to the body element. In that case, you may want to define a prefix for your page style classes such as `page-`, so only those are replaced. By default option is set to `''` and all classes of body element are replaced during the transition. In case of no classes are used on body element, simply set the options to `false`.
```javascript
pageClassPrefix: 'page-'
```

### Scroll
Swup has a built in scroll control, where page smoothly scrolls to the top on desktop, and jumps directly to the top on mobile (as menu is usually fixed for mobile sites). The scrolls to the anchor elements in url are also handled. This feature can be turned of and you can use your own scroll based on the emitted events discussed in events section. By default the options is set to `true`. Scrolling has several other options, such as `scrollDuration` - duration of the scroll, which is set to 0 by default (expects the page to be fully invisible while transitioning). Another options are `animateScrollToAnchor` and `animateScrollOnMobile`, where the name speaks for itself. Last is `doScrollingRightAway`, which determines whether scroll starts immediately, or after the content is replaced. 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
```javascript
scroll: true
```

### Support
Due to the use of promises, transitionEnd and pushState features of javascript, swup has a basic support check built in to avoid breaking of the site in case of older browser that do not support used features. However, as there may always be some exceptions for browsers, or different polyfills (that may or may not work) can be used, this support check can be disabled and you can use your own support check before creating the instance. Support option is enabled by default.
```javascript
support: true
```

### Preload
Preload is an additional feature that can be used in combination with cache. When enabled, swup starts loading the page on hover of the link and does not wait for the user to click on the link. In case the page is not loaded at the time of clicking on the link, swup simply waits for the request to finish and does not create new request. If cache is disabled, swup still preloads pages of hovered links, but the contents of cache are removed after each page transition. 
```javascript
preload: true
```

### Debug Mode
Debug mode is very useful for integrating swup into your site. When enabled, swup displays emitted events (see events section) in console, as well as contents of the cache when changed. Options defaults to false.
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
    support: true
    animateScrollToAnchor: false,
    animateScrollOnMobile: false,
    doScrollingRightAway: false,
    scrollDuration: 0,
}
```

## Events
As it usually is when loading the page with ajax, there may be many constrains such as analytics or enabling the scripts for replaced content. For this purpose, swup emits whole bunch of events triggered on document while working, which can be used as follows:
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
    swup.elements.forEach((element) => {
        loadComponents(document.querySelector(element))
    })
});
```

### List of all events
* **swup:contentReplaced** - triggers when the content of page is replaced
* **swup:pageView** - similar as previous, except it is once trigger on load of the page
* **swup:hoverLink** - triggers when link for transition is hovered
* **swup:clickLink** - triggers when link for transition is hovered
* **swup:animationOutDone** - triggers when animating (out) of all animated elements is done
* **swup:pagePreloaded** - triggers when the preload of some page is done
* **swup:pageLoaded** - triggers when the loading of some page is done (differs from previous only by the source of event - hover/click)
* **swup:scrollStart** - triggers when built in scroll is started
* **swup:scrollDone** - triggers when built in scroll is done
* **swup:animationInDone** - triggers when animating (in) of all animated elements is done
* **swup:pageRetrievedFromCache** - triggers when page is retrieved from cache and no loading is necessary

## API
Instance of the swup can be imported and used across your sites javascript to enable some additional features. When debugMode (see options section) is enabled, instance is also available in `window` object as `window.swup` so you can play with it.
You can for example access some of the information used by swup such as the elements to be replaced:
```javascript
swup.elements.forEach((element) => {
    // do whatever for each replaced element
})
```
or possibly use built in function for your own functions
```javascript
// navigates to /someRoute with the animations and all
swup.loadPage('/someRoute', false)
```











