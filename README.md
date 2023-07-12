<br>

<p align="center">
  <img width="280" alt="swup" src="https://swup.js.org/assets/images/swup-logo.svg">
</p>

<div align="center">

[![npm version](https://img.shields.io/npm/v/swup.svg)](https://www.npmjs.com/package/swup)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/swup?label=size)](https://bundlephobia.com/package/swup)
[![License](https://img.shields.io/github/license/swup/swup.svg)](https://github.com/swup/swup/blob/master/LICENSE)
[![npm downloads](https://img.shields.io/npm/dt/swup.svg)](https://www.npmjs.com/package/swup)
[![Test status](https://img.shields.io/github/actions/workflow/status/swup/swup/e2e-tests.yml?branch=master&label=tests)](https://github.com/swup/swup/actions/workflows/e2e-tests.yml)

</div>

<br>

# Swup

Versatile and extensible **page transition library** for server-rendered websites.

[Features](#features) •
[Demos](#demos) •
[Plugins](#plugins) •
[Themes](#themes) •
[Documentation](https://swup.js.org/getting-started) •
[Discussions](https://github.com/swup/swup/discussions)

## Overview

Swup adds **page transitions** to server-rendered websites. It manages the complete page load lifecycle
and smoothly animates between the current and next page. In addition, it offers many other
quality-of-life improvements like **caching**, **smart preloading**, native **browser history** and
enhanced **accessibility**.

Make your site feel like a snappy single-page app — without any of the complexity.

## Features

- ✏️ Works out of the box with [minimal markup](https://swup.js.org/getting-started/example/)
- ✨ Auto-detects [CSS transitions](https://swup.js.org/getting-started/how-it-works/) & animations for perfect timing
- 🔗 Updates URLs and preserves native [browser history](https://swup.js.org/options/#animatehistorybrowsing)
- 🏓 Manages the scroll position between pages and anchor links
- 🚀 Uses a [cache](https://swup.js.org/api/cache/) to speed up subsequent page loads
- 📡 Offers [hooks](https://swup.js.org/hooks/) to customize and extend the page load lifecycle
- 🔌 Has a powerful [plugin system](https://swup.js.org/plugins/) and many official and third-party plugins
- 🎨 Provides ready-to-go [themes](https://swup.js.org/themes/) to get started quickly

## Demos

Explore our [interactive demos](https://swup.js.org/getting-started/demos/) to see swup in action.

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

Check out the list of [official plugins](https://swup.js.org/plugins/) and [third-party integrations](https://swup.js.org/third-party-integrations/).

## Themes

Get started quickly with one of three official themes: [fade](https://swup.js.org/themes/fade-theme/),
[slide](https://swup.js.org/themes/slide-theme/), and [overlay](https://swup.js.org/themes/overlay-theme/).

## Examples

<img src="https://user-images.githubusercontent.com/9338324/49190360-50125480-f372-11e8-89e9-d2fb091a2240.gif" width="100%">

Take a look at the [interactive demos](https://swup.js.org/getting-started/demos/) and
[sites using swup](https://github.com/swup/swup/discussions/333) for more examples.

## Having trouble?

If you're having trouble implementing swup, check out the [Common Issues](https://swup.js.org/other/common-issues) section of the docs, look at [closed issues](https://github.com/swup/swup/issues?q=is%3Aissue+is%3Aclosed) or create a [new discussion](https://github.com/swup/swup/discussions/new).

## Want to Contribute?

<a href="https://github.com/swup/swup/discussions/424">We're looking for maintainers!</a>   👀

Become a sponsor on [Open Collective](https://opencollective.com/swup) or support development through
[GitHub sponsors](https://github.com/sponsors/gmrchk).
