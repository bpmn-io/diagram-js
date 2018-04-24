# Changelog

All notable changes to [diagram-js](https://github.com/bpmn-io/diagram-js) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 1.4.0

* `CHORE`: bump object-refs version

## 1.3.1

* `FIX`: correct side-effects config to not include `*.css` files

## 1.3.0

* `FEAT`: emit popup menu life-cycle events
* `FIX`: prevent default click action on dragend, if `trapClick: true` is specified

## 1.2.1

* `FIX`: escape ids in CSS selectors

## 1.2.0

* `DOCS`: migrate example to ES modules

## 1.1.0

* `CHORE`: update utility toolbelt

## 1.0.0

### Breaking Changes

* `CHORE`: convert code base to ES modules. You must now configure a module transpiler such as Babel or Webpack to handle ES module imports and exports. ([`e26b034`](https://github.com/bpmn-io/diagram-js/commit/e26b034bb6d60a8e0e3a9669d111124cb189a9b3))

## 0.31.0

### Breaking Changes

* `FEAT`: remove `EventBus.Event` in favor of `EventBus#createEvent` API ([`91899cf6`](https://github.com/bpmn-io/diagram-js/commit/91899cf6d2e9100c712aa191cf0d3829335cfeb3))

## 0.30.0

* `CHORE`: bump [tiny-svg](https://github.com/bpmn-io/tiny-svg) version

## ...

Check `git log` for earlier history.
