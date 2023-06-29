<br>

<p align="center">
  <img width="280" alt="swup" src="https://swup.js.org/assets/images/swup-logo.svg">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/swup"><img src="https://img.shields.io/npm/v/swup.svg" alt="npm version"></a>
  <a href="https://bundlephobia.com/package/swup"><img src="https://img.shields.io/bundlephobia/minzip/swup?label=size" alt="Bundle size"></a>
  <a href="https://github.com/gmrchk/swup/blob/master/LICENSE"><img src="https://img.shields.io/github/license/gmrchk/swup.svg" alt="License"></a>
  <a href="https://www.npmjs.com/package/swup"><img src="https://img.shields.io/npm/dt/swup.svg" alt="npm downloads"></a>
  <a href="https://github.com/swup/swup/actions/workflows/e2e-tests.yml"><img src="https://img.shields.io/github/actions/workflow/status/swup/swup/e2e-tests.yml?branch=master&label=tests" alt="Test status"></a>
</p>

<br>

# Swup

Versatile and extensible page transition library for server-side rendered websites

[Features](#features) •
[Documentation](https://swup.js.org/getting-started) •
[Plugins](https://swup.js.org/plugins) •
[Themes](https://swup.js.org/themes) •
[Discussions](https://github.com/swup/swup/discussions)

## Overview

Swup adds page transitions to server-side rendered websites. It manages the complete lifecycle of a
page visit by intercepting link clicks,  loading the new page in the background and smoothly
transitioning between the old and new content.

Its goal is to make it effortless to add page transitions to a site, while providing lots of other
quality-of-life improvements.

## Features

- ✏️ Works out of the box with [minimal markup](https://swup.js.org/getting-started/example/)
- ✨ Auto-detects [CSS transitions](https://swup.js.org/getting-started/how-it-works/) for perfect timing
- 🔗 Updates URLs and preserves native [browser history](https://swup.js.org/options/#animatehistorybrowsing)
- 🏓 Manages scroll position between pages and anchor jump links
- 🚀 Uses a [cache](https://swup.js.org/api/cache/) to speed up subsequent page loads
- 📡 Offers [hooks](https://swup.js.org/hooks/) to customize and extend the page load lifecycle
- 🔌 Has a powerful [plugin system](https://swup.js.org/plugins/) and many official and third-party plugins
- 🎨 Provides ready-to-go [themes](https://swup.js.org/themes/) to get started quickly

## Plugins

Swup is small by design. Extended features can be added via [plugins](https://swup.js.org/plugins/):

- Display a [progress bar](https://swup.js.org/plugins/progress-plugin/) while loading
- Enable [smooth scrolling](https://swup.js.org/plugins/scroll-plugin/) between visits
- Update [meta tags and stylesheets](https://swup.js.org/plugins/head-plugin/) after page loads
- Add support for [preloading pages](https://swup.js.org/plugins/preload-plugin/) in the background
- Improve [accessibility](https://swup.js.org/plugins/a11y-plugin/) for screen readers
- Perform your [animations in JS](https://swup.js.org/plugins/js-plugin/) instead of CSS transitions
- Animate [form submissions](https://swup.js.org/plugins/forms-plugin/)
- Get help in [debug mode](https://swup.js.org/plugins/debug-plugin/)

Check out the list of [all official plugins](https://swup.js.org/plugins/) as well as
[third-party integrations](https://swup.js.org/third-party-integrations/).

## Examples

<img src="https://user-images.githubusercontent.com/9338324/49190360-50125480-f372-11e8-89e9-d2fb091a2240.gif" width="100%">

Take a look at [Sites using swup](https://github.com/swup/swup/discussions/333) for more examples.

## Having trouble?

If you're having trouble implementing swup, check out the [Common Issues](https://swup.js.org/other/common-issues) section of the docs, look at [closed issues](https://github.com/gmrchk/swup/issues?q=is%3Aissue+is%3Aclosed) or create a [new discussion](https://github.com/swup/swup/discussions/new).

## Want to Contribute?

<a href="https://github.com/swup/swup/discussions/424">We're looking for maintainers!</a>   👀

Become a sponsor on [Open Collective](https://opencollective.com/swup) or support development through
[GitHub sponsors](https://github.com/sponsors/gmrchk).
