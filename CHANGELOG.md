# Changelog

<!-- ## [Unreleased] -->

## [3.0.0] - 2023-01

- Support CSS animations and keyframes
- Allow ignoring visits via callback function
- Export native ESM modules
- Smaller bundle size for modern browsers: 4.5 kB
- Improved test coverage

### Breaking changes

See [Upgrade instructions for swup 3](https://swup.js.org/getting-started/upgrading)
for details.

- Swup will now wait for the longest transitioned property
- Swup will no longer add `to-*` classes for the next URL
- UMD and CDN bundle names have changed
- Import paths for helpers have changed

## [2.0.19] - 2022-08-23

- Gracefully handle missing document title
- Disable caching of initial page to avoid caching modified DOM
- Force-reload if next page has no swup containers
- Remove all reliance on global window.swup instance

## [2.0.18] - 2022-08-09

- Fix buggy behavior when navigating rapidly between pages

## [2.0.17] - 2022-08-01

- Gracefully handle missing transitions on container
- Warn about missing container
- Scope transition selector to body
- Normalize cache paths

## [2.0.16] - 2022-06-30

- Improve handling of scroll anchors with special characters (@knokmki612)

## [2.0.15] - 2022-06-14

- Update dependencies (@fregante)
- Improve test coverage (@daun)

## [2.0.14] - 2020-12-27

- Update readme

## [2.0.13] - 2020-12-06

- Update readme

## [2.0.12] - 2020-11-29

- Fix bug where animateHistoryBrowsing option was ignored for OUT animations

[Unreleased]: https://github.com/swup/swup/compare/3.0.0...HEAD

[3.0.0]: https://github.com/swup/swup/releases/tag/3.0.0
[2.0.19]: https://github.com/swup/swup/releases/tag/2.0.19
[2.0.18]: https://github.com/swup/swup/releases/tag/2.0.18
[2.0.17]: https://github.com/swup/swup/releases/tag/2.0.17
[2.0.16]: https://github.com/swup/swup/releases/tag/2.0.16
[2.0.15]: https://github.com/swup/swup/releases/tag/2.0.15
[2.0.14]: https://github.com/swup/swup/releases/tag/2.0.14
[2.0.13]: https://github.com/swup/swup/releases/tag/2.0.13
[2.0.12]: https://github.com/swup/swup/releases/tag/2.0.12
