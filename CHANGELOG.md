# Changelog

All notable changes to [diagram-js](https://github.com/bpmn-io/diagram-js) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 3.0.0

* `FEAT`: add configurable minimum and maximum scale for `ContextPad` ([#719](https://github.com/bpmn-io/bpmn-js/issues/719))
* `FEAT`: add ability to configure `PopupMenu` scaling ([#861](https://github.com/bpmn-io/bpmn-js/issues/861))
* `FEAT`: add ability to override default `Keyboard` listeners with priority feature ([#226](https://github.com/bpmn-io/diagram-js/issues/226))
* `FEAT`: move selected elements with keyboard arrows. Use `MoveSelection` feature for new behavior ([#376](https://github.com/bpmn-io/bpmn-js/issues/376), [9e62bdd](https://github.com/bpmn-io/diagram-js/commit/9e62bdd0823ee64ca6da2548cc10667b9a02dff0))
* `FIX`: automatically resize parent elements when their children are expanded or replaced ([#786](https://github.com/bpmn-io/bpmn-js/issues/786), [#287](https://github.com/bpmn-io/diagram-js/issues/287))
* `FIX`: drop implicit feature dependencies in `EditorActions` ([a9089ad](https://github.com/bpmn-io/diagram-js/commit/a9089ade487ff4185ece6fd8c68856b103345b3b))
* `FEAT`: add a clear way to hook into editor actions (both for inspection and registration) via the `editorAction.init` event. This allows interested services to work with editor actions, independent from the actual module registration order ([a9089ad](https://github.com/bpmn-io/diagram-js/commit/a9089ade487ff4185ece6fd8c68856b103345b3b))
* `FEAT`: ensure that `Keyboard` shortcuts are only bound if the required editor action exists. This makes it possible to use the keyboard independent from editor action or action implementing services ([aa308fd](https://github.com/bpmn-io/diagram-js/commit/aa308fd46f4b7958999bf44ca8bb3ab347723990))
* `FEAT`: expose `MoveSelection` feature. This is important in environments where editor actions are triggered programmatically rather than via keyboard events ([b4cb648](https://github.com/bpmn-io/diagram-js/commit/b4cb648a72fa90ca23d5a9971d3e20aedf45aa53))

### Breaking Changes

* `FEAT`: remove `GlobalConnect#registerProvider`. Create a rule for `connection.start` to control whether it is allowed to start connection with `GlobalConnect` ([1efb277](https://github.com/bpmn-io/diagram-js/commit/1efb277536fa7ec8be574746326c15cb1bfa507a))
* `FEAT`: use `EventBus` to pass events to `Keyboard` listeners. Instead of `(keyCode, event)` the listeners will receive now an object with `{KeyboardEvent} keyEvent` as the only property ([94b5e26](https://github.com/bpmn-io/diagram-js/commit/94b5e262d0db3ef3a8f250e3d39196cc6303a5cb)).
* `FEAT`: remove listeners property from `Keyboard` lifecycle events. Make sure to not use it anymore ([4d72e38](https://github.com/bpmn-io/diagram-js/commit/4d72e386e2b734edc0fb2d77907b0e3ab6efead6))
* `FEAT`: use `KeyboardMove` to move canvas with arrows + `Ctrl/Cmd`. Use `config.keyboardMove.moveSpeed` and `config.keyboardMove.moveSpeedAccelerated` to configure speed without and with `Shift` pressed respectively ([571efb9](https://github.com/bpmn-io/diagram-js/commit/571efb914466ce00f357e308ba6238def1c7d8b6))

## 2.6.1

* `FIX`: ignore vertical padding when layouting text with `middle` alignment

## 2.6.0

* `CHORE`: normalize drag coordinates to full pixel coordinates ([#271](https://github.com/bpmn-io/diagram-js/issues/271))

## 2.5.1

* `FIX`: circumvent IE 9 viewer bug ([`e1f3c65c`](https://github.com/bpmn-io/diagram-js/commit/e1f3c65cb413601427615d0e292ce291dcaea9de))

## 2.5.0

* `FEAT`: extend manhattan layout helper to support explicit `trbl` direction and layout U-turns, if needed ([`fd4c6028`](https://github.com/bpmn-io/diagram-js/commit/fd4c6028921f67bc73a840f0b19ad59c356a5dae))

## 2.4.1

* `FIX`: ensure all labels / attachers are moved before triggering connection layout
* `CHORE`: move attachers / labels along with move closure ([`16882649`](https://github.com/bpmn-io/diagram-js/commit/1688264959d272fb26d13214439d491c09a01f44))

## 2.4.0

* `FEAT`: add ability to remove multiple events via `EventBus#off`

## 2.3.0

* `FEAT`: hide palette toggle in expanded state (a none-feature, technically) ([#257](https://github.com/bpmn-io/diagram-js/issues/257))
* `FIX`: take top/bottom padding into account when rendering text ([#259](https://github.com/bpmn-io/diagram-js/issues/259))
* `FIX`: don't throw error on out-of-canvas lasso tool release

## 2.2.0

* `FEAT`: support `lineHeight` in text render util ([#256](https://github.com/bpmn-io/diagram-js/pull/256))

## 2.1.1

* `FIX`: correct code snippet to ES5

## 2.1.0

* `FEAT`: add support for multiple labels ([#202](https://github.com/bpmn-io/diagram-js/issues/202))
* `FEAT`: allow multiple classes to be passed to popup menu entries

## 2.0.0

### Breaking Changes

* `FEAT`: refactor popup menu to allow multiple providers and simplify API ([`b1852e1d`](https://github.com/bpmn-io/diagram-js/pull/254/commits/b1852e1d71f67bd36ae1eb02748d2d0cbf124625))

## 1.5.0

_This release accidently introduced backwards incompatible changes. Unpublished; Use `v2.0.0` instead._

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
