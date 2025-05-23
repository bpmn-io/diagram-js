# Changelog

All notable changes to [diagram-js](https://github.com/bpmn-io/diagram-js) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

_**Note:** Yet to be released changes appear here._

## 15.3.0

* `FIX`: always select first search entry ([#967](https://github.com/bpmn-io/diagram-js/pull/967))
* `FEAT`: support searching through arrays ([#970](https://github.com/bpmn-io/diagram-js/pull/970))
* `FEAT`: prioritize `search` over `description` when matching entries ([#963](https://github.com/bpmn-io/diagram-js/pull/963))
* `FEAT`: sort `search` terms across all keys ([#963](https://github.com/bpmn-io/diagram-js/pull/963))

## 15.2.4

* `FIX`: canvas `autoFocus` must explicitly be enabled ([#956](https://github.com/bpmn-io/diagram-js/pull/956))
* `FIX`: properly integrate `zoomscroll` with canvas focus ([#956](https://github.com/bpmn-io/diagram-js/pull/956))
* `FIX`: properly integrate `movecanvas` with canvas focus ([#956](https://github.com/bpmn-io/diagram-js/pull/956))

## 15.2.3

* `FIX`: adjust search to prioritize start of word and exact matches ([#953](https://github.com/bpmn-io/diagram-js/pull/953))
* `FIX`: ignore whitespace when searching ([#954](https://github.com/bpmn-io/diagram-js/pull/954))

## 15.2.2

* `FIX`: correct `Keyboard#bind` and config types ([#948](https://github.com/bpmn-io/diagram-js/pull/948))

## 15.2.1

* `FIX`: limit overly permissive regex ([#949](https://github.com/bpmn-io/diagram-js/pull/949))

## 15.2.0

* `FIX`: clear selection when opening search pad ([#947](https://github.com/bpmn-io/diagram-js/pull/947))
* `FIX`: correct dangling selection after search pad interaction ([#947](https://github.com/bpmn-io/diagram-js/pull/947))
* `CHORE`: simplify search pad pre-selection behavior ([#947](https://github.com/bpmn-io/diagram-js/pull/947))

## 15.1.0

* `FEAT`: integrate `popup-menu` with `search` ([#932](https://github.com/bpmn-io/diagram-js/pull/932))
* `FEAT`: recognize modern `search` tokens in `search-pad` ([#932](https://github.com/bpmn-io/diagram-js/pull/932))
* `FEAT`: improve `search` types ([#932](https://github.com/bpmn-io/diagram-js/pull/932))
* `FIX`: correctly handle duplicate entries and whitespace in `search` ([#932](https://github.com/bpmn-io/diagram-js/pull/932))
* `FIX`: find `search` terms across all keys ([#932](https://github.com/bpmn-io/diagram-js/pull/932))
* `FIX`: `search` always returns tokens for matched items ([#932](https://github.com/bpmn-io/diagram-js/pull/932))

## 15.0.0

* `FEAT`: make canvas browser selectable ([#659](https://github.com/bpmn-io/diagram-js/pull/659))
* `FEAT`: make keyboard binding implicit ([#661](https://github.com/bpmn-io/diagram-js/issues/661))
* `FEAT`: make multi-selection outline an outline concern ([#944](https://github.com/bpmn-io/diagram-js/issues/944))

### Breaking Changes

* `Keyboard` binding target can no longer be chosen. Configure keyboard binding via the `keyboard.bind` configuration and rely on keybindings to work if the canvas has browser focus. ([#661](https://github.com/bpmn-io/diagram-js/issues/661))
* The `Canvas` is now a focusable component, that is recognized accordingly by the browser, with all benefits for UX and interaction. Components that pull focus from the `Canvas` during modeling must ensure to restore the focus (if intended), via `Canvas#restoreFocus`. ([#661](https://github.com/bpmn-io/diagram-js/issues/661))
* The `selection` feature does not provide visual outline by default anymore. Use the `outline` feature to re-enable it. ([#944](https://github.com/bpmn-io/diagram-js/issues/944))

## 14.11.3

* `CHORE`: simplify viewbox cloning ([#935](https://github.com/bpmn-io/diagram-js/pull/935))

## 14.11.2

* `FIX`: restore search result highlight ([#931](https://github.com/bpmn-io/diagram-js/pull/931))
* `FIX`: correct search result highlight not being removed ([#931](https://github.com/bpmn-io/diagram-js/pull/931))
* `FIX`: do not change zoom when search openes ([#931](https://github.com/bpmn-io/diagram-js/pull/931))

## 14.11.1

_Partially reverts v14.11.0._

* `FIX`: revert `search` integration into popup menu

## 14.11.0

* `FEAT`: add `search` utility
* `FEAT`: sort popup entry search results semantically ([#916](https://github.com/bpmn-io/diagram-js/pull/916))

## 14.10.0

* `FEAT`: align search styling with other popups ([#913](https://github.com/bpmn-io/diagram-js/pull/913))
* `CHORE`: use existing outline in search ([#913](https://github.com/bpmn-io/diagram-js/pull/913))
* `FIX`: only commit search viewport changes on `ENTER` ([#913](https://github.com/bpmn-io/diagram-js/pull/913))

## 14.9.0

* `CHORE`: export types compatible with `verbatimModuleSyntax` ([#927](https://github.com/bpmn-io/diagram-js/pull/927), [#864](https://github.com/bpmn-io/diagram-js/issues/864))
* `CHORE`: re-compute context pad position next frame ([#920](https://github.com/bpmn-io/diagram-js/pull/920))

## 14.8.0

* `FEAT`: add `scheduler` service ([#915](https://github.com/bpmn-io/diagram-js/pull/915))
* `CHORE`: update `contextPad` visibility only once per frame ([#915](https://github.com/bpmn-io/diagram-js/pull/915))
* `CHORE`: do not query DOM for `Canvas#hasMarker` check ([#919](https://github.com/bpmn-io/diagram-js/pull/919))
* `CHORE`: only update context pad if affected element's marker changed ([#912](https://github.com/bpmn-io/diagram-js/pull/912))

## 14.7.2

* `FIX`: remove incorrect attribute in popup menu item ([#918](https://github.com/bpmn-io/diagram-js/pull/918))

## 14.7.1

* `FIX`: ensure cloned marker IDs are unique ([#909](https://github.com/bpmn-io/diagram-js/pull/909))

## 14.7.0

* `FEAT`: support nested `defs` in the SVG ([#906](https://github.com/bpmn-io/diagram-js/pull/906))
* `FIX`: show connection markers on move preview ([#904](https://github.com/bpmn-io/diagram-js/issues/904))

## 14.6.0

* `FEAT`: popup menu header entries can be grouped ([#900](https://github.com/bpmn-io/diagram-js/pull/900))

## 14.5.4

* `FIX`: don't hide context pad on `djs-label-hidden` ([#898](https://github.com/bpmn-io/diagram-js/pull/898))

## 14.5.3

* `FIX`: hide context pad when targets hidden ([#897](https://github.com/bpmn-io/diagram-js/pull/897))

## 14.5.2

* `FIX`: remove leftover return statement from context pad ([#895](https://github.com/bpmn-io/diagram-js/pull/895))

## 14.5.1

* `FIX`: do not re-open context pad for elements that were removed ([#893](https://github.com/bpmn-io/diagram-js/pull/893))

## 14.5.0

* `FEAT`: context pad position absolute instead of relative to element ([#888](https://github.com/bpmn-io/diagram-js/pull/888))
* `CHORE`: deprecate `ContextPad#getPad` ([#888](https://github.com/bpmn-io/diagram-js/pull/888))

## 14.4.2

* `FIX`: do not call context pad handler twice on hover ([#890](https://github.com/bpmn-io/diagram-js/pull/890))

## 14.4.1

* `FIX`: prevent missing parent error in move preview ([#889](https://github.com/bpmn-io/diagram-js/pull/889))

## 14.4.0

* `FEAT`: do not scale context pad and popup menu by default ([#883](https://github.com/bpmn-io/diagram-js/pull/883))

## 14.3.3

* `FIX`: do not cancel dragging on tool deselection ([#881](https://github.com/bpmn-io/diagram-js/pull/881))

## 14.3.2

* `FIX`: ensure popup menu position is consistent with scale ([#878](https://github.com/bpmn-io/diagram-js/pull/878))

## 14.3.1

* `FIX`: ensure popup menu is rendered on top

## 14.3.0

* `FEAT`: make popup menu fully keyboard navigatable ([#871](https://github.com/bpmn-io/diagram-js/issues/871))
* `FIX`: do not trap `TAB` in popup menu ([#874](https://github.com/bpmn-io/diagram-js/pull/874))
* `FIX`: do not trap `Space` and `Enter` on button elements ([#874](https://github.com/bpmn-io/diagram-js/pull/874))
* `FIX`: do not trap click outside of popup menu ([#874](https://github.com/bpmn-io/diagram-js/pull/874))
* `FIX`: show empty placeholder in popup menu when no entries were returned ([#876](https://github.com/bpmn-io/diagram-js/pull/876))
* `FIX`: correct various types ([#875](https://github.com/bpmn-io/diagram-js/pull/875))

## 14.2.0

* `FEAT`: be able to type diagram services and events ([#862](https://github.com/bpmn-io/diagram-js/pull/862))
* `FIX`: correct various types ([#865](https://github.com/bpmn-io/diagram-js/pull/865), [#873](https://github.com/bpmn-io/diagram-js/pull/873))
* `DEPS`: update to `didi@10.2.2`
* `DEPS`: update to `@bpmn-io/diagram-js-ui@0.2.3`

## 14.1.1

* `FIX`: apply labels to inputs ([#872](https://github.com/bpmn-io/diagram-js/pull/872))

## 14.1.0

* `FEAT`: add ability to refresh popup menu ([#804](https://github.com/bpmn-io/diagram-js/issues/804))
* `DEPS`: update to `clsx@2.1.0`

## 14.0.0

* `FEAT`: add to selection through SHIFT ([#851](https://github.com/bpmn-io/diagram-js/pull/851))
* `FEAT`: allow to provide custom popup menu empty state ([#847](https://github.com/bpmn-io/diagram-js/pull/847))
* `FIX`: remove `CTRL + click` for adding selections ([#850](https://github.com/bpmn-io/diagram-js/pull/850))
* `FIX`: correct type definitions ([#843](https://github.com/bpmn-io/diagram-js/issues/843), [`175da39`](https://github.com/bpmn-io/diagram-js/commit/175da3929e51cc5fae9537d0b1d1d1265474f9df))
* `CHORE`: remove broken touch interaction ([#796](https://github.com/bpmn-io/diagram-js/issues/796))
* `DEPS`: drop `hammerjs` dependency ([#845](https://github.com/bpmn-io/diagram-js/pull/845))

### Breaking Changes

* (Broken) touch interaction module removed without immediate replacement ([#845](https://github.com/bpmn-io/diagram-js/pull/845))
* Some type signatures changed

## 13.4.0

* `DEPS`: update to `object-refs@0.4.0`

## 13.3.0

* `DEPS`: update to `path-intersection@3`

## 13.2.0

* `FEAT`: add `module` export

## 13.1.0

* `FEAT`: allow non-searchable entries in popup menu ([#835](https://github.com/bpmn-io/diagram-js/pull/835))

## 13.0.0

* `DEPS`: update to `didi@10.0.1`

## 12.8.1

* `FIX`: reposition popup menu if it opens above the viewport ([#829](https://github.com/bpmn-io/diagram-js/pull/829))

## 12.8.0

* `FEAT`: remove selection outline from connections ([#826](https://github.com/bpmn-io/diagram-js/pull/826))
* `FEAT`: position context pad according to last waypoint for connections ([#826](https://github.com/bpmn-io/diagram-js/pull/826))

## 12.7.3

* `FIX`: correct error when computing outline ([#822](https://github.com/bpmn-io/diagram-js/issues/822))

## 12.7.2

* `FIX`: revert `djs-dragging` CSS class changes ([#821](https://github.com/bpmn-io/diagram-js/pull/821))
* `FIX`: clear context pad hover timeout on close ([#823](https://github.com/bpmn-io/diagram-js/pull/823))

## 12.7.1

* `FIX`: revert selection outline removal for connections ([#820](https://github.com/bpmn-io/diagram-js/pull/820))

## 12.7.0

* `FEAT`: support `imageHtml` option for popup menu header entries ([#819](https://github.com/bpmn-io/diagram-js/pull/819))

## 12.6.0

* `FEAT`: support custom outline providers ([#817](https://github.com/bpmn-io/diagram-js/pull/817))
* `FEAT`: remove selection outline from connections ([#817](https://github.com/bpmn-io/diagram-js/pull/817))

## 12.5.0

* `FEAT`: make spacetool local per default ([#811](https://github.com/bpmn-io/diagram-js/pull/811))
* `FEAT`: add complex preview feature ([#807](https://github.com/bpmn-io/diagram-js/pull/807))
* `CHORE`: mark connection as dragging when moving bendpoint ([#807](https://github.com/bpmn-io/diagram-js/pull/807))

## 12.4.0

* `FEAT`: add zoom through `Cmd` + mousewheel on macOS ([#806](https://github.com/bpmn-io/diagram-js/pull/806))
* `FEAT`: add/remove space locally through `Shift` + space tool ([#808](https://github.com/bpmn-io/diagram-js/pull/808))

## 12.3.0

* `FEAT`: don't hide overlays on canvas move by default. The config option `canvas.deferUpdate` now defaults to `false` ([#798](https://github.com/bpmn-io/diagram-js/issues/798))

## 12.2.0

* `FEAT`: allow to provide html for popup menu entries icons ([#790](https://github.com/bpmn-io/diagram-js/pull/790))

## 12.1.1

* `FIX`: make `bio-dts` a dev dependency

## 12.1.0

* `FEAT`: centralize `isConnection`, `isLabel` and `isRoot` checks ([#783](https://github.com/bpmn-io/diagram-js/pull/783))
* `FIX`: do not attach labels ([#782](https://github.com/bpmn-io/diagram-js/pull/782))
* `FIX`: include entry id in `popupMenu.trigger` event ([#785](https://github.com/bpmn-io/diagram-js/pull/785))
* `CHORE`: fix JSDoc types ([#783](https://github.com/bpmn-io/diagram-js/pull/783))

## 12.0.2

* `CHORE`: fix various JSDoc comments ([#780](https://github.com/bpmn-io/diagram-js/pull/780), [#781](https://github.com/bpmn-io/diagram-js/pull/781))

## 12.0.1

* `FIX`: export types as `type` ([#779](https://github.com/bpmn-io/diagram-js/pull/779))

## 12.0.0

* `FEAT`: rework and complete type definitions (https://github.com/bpmn-io/diagram-js/pull/775)
* `FEAT`: rework `model`

### Breaking Changes

* Model elements must be created through factory functions exposed by the `model` package.
* Certain interface like `*Provider` types (`PopupMenuProvider`, `PaletteProvider`) are actual interfaces now

## 11.13.1

* `FIX`: fix type declaration for `ElementFactory` ([#776](https://github.com/bpmn-io/diagram-js/pull/776))

## 11.13.0

* `FEAT`: fire `popupMenu.trigger`, `palette.trigger` and `contextPad.trigger` events ([#772](https://github.com/bpmn-io/diagram-js/pull/772))

## 11.12.0

* `DOCS`: add additional parameters to `EventCallback` type ([#759](https://github.com/bpmn-io/diagram-js/pull/759))
* `CHORE`: adjust type declarations to allow augmentation ([#757](https://github.com/bpmn-io/diagram-js/pull/757))

## 11.11.0

* `FEAT`: add `translate` typings ([#756](https://github.com/bpmn-io/diagram-js/pull/756))
* `FEAT`: support select after replacement ([#755](https://github.com/bpmn-io/diagram-js/pull/756))

## 11.10.0

* `FEAT`: add TypeScript declarations for core components ([#732](https://github.com/bpmn-io/diagram-js/pull/732))
* `DEPS`: update to `didi@9.0.2`

## 11.9.1

* `FIX`: restore undo/redo shortcuts on some international keyboards ([#749](https://github.com/bpmn-io/diagram-js/pull/749))

## 11.9.0

* `FEAT`: allow popup menu entries to be initially hidden ([#748](https://github.com/bpmn-io/diagram-js/pull/748))
* `FIX`: filter popup menu entries eagerly to prevent flickering ([#748](https://github.com/bpmn-io/diagram-js/pull/748))
* `FIX`: prevent `Escape` from triggering closing twice ([#748](https://github.com/bpmn-io/diagram-js/pull/748))

## 11.8.0

* `FEAT`: make outline more prominent ([#747](https://github.com/bpmn-io/diagram-js/pull/747))
* `FEAT`: add ability to render connections with rounded corners ([#747](https://github.com/bpmn-io/diagram-js/pull/747))

## 11.7.0

* `FEAT`: allow additional search terms for popup menu entries ([#745](https://github.com/bpmn-io/diagram-js/pull/745))
* `FIX`: improve popup menu set off off from background ([#743](https://github.com/bpmn-io/diagram-js/pull/743))

## 11.6.0

* `FEAT`: allow to trigger palette entries by ID ([#741](https://github.com/bpmn-io/diagram-js/pull/741))
* `FIX`: make popup menu icons decorational ([`50eb3d7`](https://github.com/bpmn-io/diagram-js/commit/50eb3d7))
* `FIX`: align elements with coordinates around `0` ([#740](https://github.com/bpmn-io/diagram-js/pull/740))

## 11.5.0

* `FEAT`: allow `dragstart` from popup menu entries ([#731](https://github.com/bpmn-io/diagram-js/pull/731))

## 11.4.4

* `DEPS`: update to `@bpmn-io/diagram-js-ui@0.2.2`

## 11.4.3

* `FIX`: prevent canvas scrolling inside popup menu ([#729](https://github.com/bpmn-io/diagram-js/issues/729))

## 11.4.2

* `FIX`: render popup menu inside `djs-container` ([#728](https://github.com/bpmn-io/diagram-js/pull/728))
* `FIX`: correct popup menu overflow ([#727](https://github.com/bpmn-io/diagram-js/pull/727))
* `FIX`: drop popup menu backdrop border ([`e1327caf`](https://github.com/bpmn-io/diagram-js/commit/e1327caf0770038cba535d947742e0feecc39c98))

## 11.4.1

* `FIX`: gracefully handle context pad trigger errors

## 11.4.0

* `FEAT`: add `Overlays#isShown` utility ([#719](https://github.com/bpmn-io/diagram-js/pull/719))
* `FEAT`: add `ContextPad#isShown` utility ([#719](https://github.com/bpmn-io/diagram-js/pull/719))
* `FEAT`: allow to trigger context pad entries by ID ([#719](https://github.com/bpmn-io/diagram-js/pull/719))
* `FIX`: make context pad triggering fail-safe ([#719](https://github.com/bpmn-io/diagram-js/pull/719))

## 11.3.0

* `FEAT`: fire `popupMenu.opened` and `popupMenu.closed` events ([#718](https://github.com/bpmn-io/diagram-js/pull/718))
* `FIX`: do not search popup menu entries by id ([#720](https://github.com/bpmn-io/diagram-js/pull/720))

## 11.2.1

* `FIX`: correct popup menu icon to label spacing ([`da5dac5`](https://github.com/bpmn-io/diagram-js/commit/da5dac5))

## 11.2.0

* `FEAT`: consistently truncate popup menu elements ([#717](https://github.com/bpmn-io/diagram-js/pull/717))
* `FIX`: account for popup menu entry `title` meta-data ([#717](https://github.com/bpmn-io/diagram-js/pull/717))
* `FIX`: apply popup menu element margins only where needed ([#717](https://github.com/bpmn-io/diagram-js/pull/717))
* `CHORE`: improve popup menu theming ([#717](https://github.com/bpmn-io/diagram-js/pull/717))

## 11.1.1

* `FEAT`: keep popup menu class structure aligned with `diagram-js@10` ([`f78a1a57`](https://github.com/bpmn-io/diagram-js/commit/f78a1a57e6dd7ca31933f2467ee56ba6f7b2fab9))
* `FIX`: remove popup menu container on close ([`e1df3edd`](https://github.com/bpmn-io/diagram-js/commit/e1df3eddf58f96dfabef8dc2b6e576966e89c803))
* `FIX`: make actual popup menu keyboard selectable ([`9fda6b0f`](https://github.com/bpmn-io/diagram-js/commit/9fda6b0f9d32bfc8d13b7dc1062f43c37b65bf57))
* `FIX`: apply consistent popup-menu spacing ([`4d4ab8e1`](https://github.com/bpmn-io/diagram-js/commit/4d4ab8e1cfc91b805db3f90c7fd36bd2626fdfca))

## 11.1.0

* `FEAT`: keyboard handles events on bubble phase instead of capture phase ([#708](https://github.com/bpmn-io/diagram-js/pull/708))
* `FEAT`: keyboard ignores events that got their propagation stopped or their default prevented ([#708](https://github.com/bpmn-io/diagram-js/pull/708))
* `FIX`: popup menu remains open after clicking on it ([#702](https://github.com/bpmn-io/diagram-js/issues/702))
* `FIX`: correctly listen for <ESCAPE> to cancel dragging ([#709](https://github.com/bpmn-io/diagram-js/pull/709))
* `FIX`: ensure arrow keys navigation works consistently in popup menu ([#701](https://github.com/bpmn-io/diagram-js/issues/701))
* `FIX`: handle popup menu header selection properly ([#711](https://github.com/bpmn-io/diagram-js/pull/711))
* `CHORE`: add `djs-popup-` prefix to popup menu classes ([#703](https://github.com/bpmn-io/diagram-js/issues/703))

## 11.0.0

* `FEAT`: drop `KeyboardEvent#keyCode` in favor of `code` ([#681](https://github.com/bpmn-io/diagram-js/pull/681))
* `FEAT`: introduction of `.djs-parent` class to canvas and popup menu root ([#687](https://github.com/bpmn-io/diagram-js/pull/687))
* `FEAT`: new popupMenu UI featuring menu and group titles, search, entry descriptions and documentation urls ([#686](https://github.com/bpmn-io/diagram-js/issues/686), [#695](https://github.com/bpmn-io/diagram-js/issues/695), [#697](https://github.com/bpmn-io/diagram-js/pull/697), [#699](https://github.com/bpmn-io/diagram-js/pull/699))
* `FEAT`: provide UI utilities through `diagram-js/lib/ui` ([#692](https://github.com/bpmn-io/diagram-js/pull/692))
* `DOCS`: update popup menu provider example ([#678](https://github.com/bpmn-io/diagram-js/pull/678))
* `DOCS`: correct `ElementRegistry` method signatures ([#698](https://github.com/bpmn-io/diagram-js/pull/698))
* `DEPS`: bump utility dependencies

### Breaking Changes

* HTML structure and CSS classes of the popup menu changed in the context of [#687](https://github.com/bpmn-io/diagram-js/pull/687). Ensure alignment with the new structure in your custom implementation.
* There is no longer a single root (`.djs-container`). The global selector for both the canvas and popup menu roots is now `.djs-parent`.
* Keyboard-related features no longer use `KeyboardEvent#keyCode`.
  Use a polyfill (e.g. [keyboardevent-key-polyfill](https://www.npmjs.com/package/keyboardevent-key-polyfill)) if you need to support old browsers.

## 10.0.0

* `FIX`: consider moving and non-moving attachers when using space tool ([#480](https://github.com/bpmn-io/diagram-js/pull/480))
* `FIX`: move external labels with moving shapes/connections ([#480](https://github.com/bpmn-io/diagram-js/pull/480))
* `FIX`: allow label behavior for laid-out connections ([#480](https://github.com/bpmn-io/diagram-js/pull/480))

### Breaking Changes

* label behavior for laid-out connection is not disallowed anymore

## 9.1.0

* `DEPS`: bump utility dependencies

## 9.0.0

* `FEAT`: use ES2018 syntax ([#674](https://github.com/bpmn-io/bpmn-js/pull/674))
* `DEPS`: update to `didi@9`

### Breaking Changes

* Migrated to ES2018 syntax. [Read the blog post with details and a migration guide](https://bpmn.io/blog/posts/2022-migration-to-es2018.html).

## 8.9.0

* `FEAT`: expose result of editor action execution ([#660](https://github.com/bpmn-io/diagram-js/pull/660))
* `FEAT`: only copy if selected elements ([#660](https://github.com/bpmn-io/diagram-js/pull/660))
* `FIX`: restore logging of initialization errors
* `DEPS`: update to `didi@8.0.1`

## 8.8.0

* `FEAT`: provide keyboard event testing utilities ([#664](https://github.com/bpmn-io/diagram-js/pull/664))

## 7.9.0

* `FEAT`: provide keyboard event testing utilities ([#663](https://github.com/bpmn-io/diagram-js/pull/663))

## 8.7.1

* `FIX`: correct helper SVG styling ([#657](https://github.com/bpmn-io/diagram-js/pull/657))

## 8.7.0

* `FEAT`: use rules to determine which elements should be aligned and distributed ([#656](https://github.com/bpmn-io/diagram-js/pull/656))
* `FIX`: distribute elements regardless their relative size ([#656](https://github.com/bpmn-io/diagram-js/pull/656))

## 8.6.0

* `FEAT`: allow to use groups for popup menu entries ([#653](https://github.com/bpmn-io/diagram-js/pull/653))
* `FEAT`: set popup menu name via `data-popup` to allow custom styling
* `FIX`: fix potentially vulnerable code in popup menu, context pad, and palette
* `FIX`: display popup menu even if cursor position is not passed ([#654](https://github.com/bpmn-io/diagram-js/pull/654))

## 8.5.0

_Complete rework of outline + drag handles._

* `FEAT`: clearly distinguish select and hover states ([`b52f35ac`](https://github.com/bpmn-io/diagram-js/commit/b52f35ac9931241cda09c5c5a435ed7ab168d8f1))
* `FEAT`: improve outline and drag handle styles ([`20c8e7a8`](https://github.com/bpmn-io/diagram-js/commit/20c8e7a8929957b7d97c0673373bd7955b526249), [`2e73f74a`](https://github.com/bpmn-io/diagram-js/commit/2e73f74ab8e8a8074f6399f404173f436bb3e94f))
* `FEAT`: improve lasso tool colors ([`2e1c3572`](https://github.com/bpmn-io/diagram-js/commit/2e1c35727333398c69e780d98d8a72f3307530e9))
* `FEAT`: indicate drag via cursor ([`358c7b9f`](https://github.com/bpmn-io/diagram-js/commit/358c7b9f701e9a042045597cc8001d4e5c6c5472))
* `FEAT`: expose connection created via `connect` ([`ca1ad0c3`](https://github.com/bpmn-io/diagram-js/commit/ca1ad0c3229db2ce5e8dd6f6f6fb52e701216034))
* `FEAT`: select newly created connection ([`c9c363c7`](https://github.com/bpmn-io/diagram-js/commit/c9c363c7d5e977aca3352c18e22d136b2eb0407c))
* `FEAT`: snap bendpoints to connection ([`e49eacea`](https://github.com/bpmn-io/diagram-js/commit/e49eaceaf69a4d319c0921bb75be983bfcec7866))
* `FEAT`: remove broken highlight on connections ([`02e94f05`](https://github.com/bpmn-io/diagram-js/commit/02e94f05a19e8c50a9b1ed21c84e87055bc079be))
* `FIX`: remove incoming/outgoing connections on `connection.delete` ([#648](https://github.com/bpmn-io/diagram-js/pull/648))

## 8.4.0

* `FEAT`: add multi-element context pad ([#278](https://github.com/bpmn-io/diagram-js/issues/278))
* `FEAT`: allow adding connections to connections ([#641](https://github.com/bpmn-io/diagram-js/pull/641))
* `CHORE`: replace `inherits` with `inherits-browser`
* `CHORE`: update to `didi@8`

## 8.3.0

* `FEAT`: add hit box type to disable move interaction: `no-move`

## 8.2.2

* `FIX`: ensure compliance with strict style-src CSP ([#636](https://github.com/bpmn-io/diagram-js/pull/636))
* `FIX`: correct palette separator spacing ([#633](https://github.com/bpmn-io/diagram-js/pull/633))

## 8.2.1

* `FIX`: make context pad robust in `line-height != 1` environments ([#630](https://github.com/bpmn-io/diagram-js/pull/630))

## 8.2.0

- `FEAT`: add API to hide and show canvas layers ([#628](https://github.com/bpmn-io/diagram-js/pull/628))

## 8.1.2

- `FIX`: ensure ES5 is used everywhere ([#624](https://github.com/bpmn-io/diagram-js/pull/624))

## 8.1.1

- `FIX`: ensure overlays update on root change ([#614](https://github.com/bpmn-io/diagram-js/pull/614))
- `FIX`: do not implicitly create root if roots already exist ([#619](https://github.com/bpmn-io/diagram-js/pull/619))
- `FIX`: allow removing active root ([#619](https://github.com/bpmn-io/diagram-js/pull/619))

## 8.1.0

- `FEAT`: allow hooking into tree creation ([#605](https://github.com/bpmn-io/diagram-js/pull/605))
- `FIX`: only center around visible elements ([#605](https://github.com/bpmn-io/diagram-js/pull/605))

## 8.0.2

- `FIX`: use know color for snap line ([#609](https://github.com/bpmn-io/diagram-js/pull/609))

## 8.0.1

- `FIX`: `touchInteractionModule` fires `element.dblclick` events now with `button=1` ([52af94](https://github.com/bpmn-io/diagram-js/commit/52af94e3784556ffe870fea1e7861efe1b94fbee))
- `FIX`: add multi-root modeling behavior for overlays ([26cfc9](https://github.com/bpmn-io/diagram-js/commit/26cfc933a2e22c7a50c539785bb44600f93c764b))

## 8.0.0

_This version of the toolkit makes the tookit truely multi-root aware and drops all `Plane` related APIs (introduced previously in `v7.4.0`)._

- `FEAT`: make multi-root aware ([#600](https://github.com/bpmn-io/diagram-js/issues/600))
- `FEAT`: introduce `Canvas` APIs for adding, listing and removing root elements ([`b789c453`](https://github.com/bpmn-io/diagram-js/commit/b789c453afc7fb1ce23d2ace509805237563716d))
- `FEAT`: allow to remove `gfx` from `ElementRegistry` ([`06f47454`](https://github.com/bpmn-io/diagram-js/commit/06f47454d6649cf4cec0790e38cc369e73fae18a))
- `FIX`: don't rely on external styles to hide root elements ([`
  99c51fa5`](https://github.com/bpmn-io/diagram-js/commit/99c51fa5923ee14ddfca83d7839723f7617841e1))

### Breaking Changes

- All plane related APIs on `Canvas` got removed, use the newly introduced `(add|set)RootElement` APIs to accomplish the same thing.
- `Canvas#setRootElement` does not have single root semantics anymore. As such, it does not blow up if a non-existing root is being passed; rather, it adds that new root and shows it.
- `Canvas#setRootElement` has no `override` semantics anymore. To replace the current root, set a new root and remove the old one.
- `Canvas#getRootElement` supports two different modes for handling root elements.
  If no root element has been added before, an implicit root will be added. When root elements have been added before, it can return null if none is active.

## 7.8.1

- `FIX`: rename CSS utility class for clarity ([#593](https://github.com/bpmn-io/diagram-js/pull/593))

## 7.8.0

- `FEAT`: expose pallete state via css classes to djs-container ([#591](https://github.com/bpmn-io/diagram-js/issues/591))
- `FIX`: allow passing IDs for `canvas.scrollToElement()` ([#589](https://github.com/bpmn-io/diagram-js/issues/589))

## 7.7.0

- `FEAT`: incorporate reduced color palette ([#581](https://github.com/bpmn-io/diagram-js/issues/581))

## 7.6.3

- `FIX`: ensure plane layers are rendered with low priority ([#585](https://github.com/bpmn-io/diagram-js/pull/585))

## 7.6.2

- `FIX`: revert [#584](https://github.com/bpmn-io/diagram-js/pull/584) ([#586](https://github.com/bpmn-io/diagram-js/issues/586))

## 7.6.1

- `FIX`: ensure inner viewbox is calculated correctly in planes ([#580](https://github.com/bpmn-io/diagram-js/pull/580))
- `FIX`: ensure plane layers are rendered with low priority ([#584](https://github.com/bpmn-io/diagram-js/pull/584))

## 7.6.0

- `FEAT`: allow passing attributes to the renderer ([#578](https://github.com/bpmn-io/diagram-js/issues/578))
- `FIX`: ensure planes on different planes are always hidden ([#574](https://github.com/bpmn-io/diagram-js/issues/574))
- `FIX`: ensure context pad is always in front ([#576](https://github.com/bpmn-io/diagram-js/pull/576))

## 7.5.0

_This reverts fixes introduced in `v7.3.1`_.

- `FEAT`: specify which modified keys are handled ([#573](https://github.com/bpmn-io/diagram-js/pull/573))
- `FIX`: correct components being unable to handle keyboard events for themselves

## 7.4.1

- `FIX`: remove all planes on `diagram.clear` ([#569](https://github.com/bpmn-io/diagram-js/pull/569))

## 7.4.0

- `FEAT`: support multiple planes for rendering elements ([#560](https://github.com/bpmn-io/diagram-js/issues/560))

## 7.3.1

- `FIX`: only ignore non-modifier keys in `keyboard` ([#564](https://github.com/bpmn-io/diagram-js/pull/564))

## 7.3.0

- `FEAT`: add `Canvas#scrollToElement` ([#545](https://github.com/bpmn-io/diagram-js/pulls/545))
- `FEAT`: ensure auto-placed elements are visible
- `FIX`: fix preview for reversed connection ([#546](https://github.com/bpmn-io/diagram-js/pull/546))

## 7.2.3

- `FIX`: correct intersections not being reported in some cases
- `DEPS`: bump `path-intersection` dependency

## 7.2.2

- `FIX`: skip element alignment if less than two elements

## 7.2.1

- `FIX`: do not fail moving bendpoint over non diagram element

## 7.2.0

- `FEAT`: expose trigger in `commandStack.changed` event ([`9a41cbc9`](https://github.com/bpmn-io/diagram-js/commit/9a41cbc92e4e8d0484d0178f01f43b4477da2c19))
- `FIX`: correct attach allowed stroke colors ([`f9ffb44b`](https://github.com/bpmn-io/diagram-js/commit/f9ffb44b6891d5081ae3c305461e6872a8b63c63))
- `FIX`: correct drop fill colors ([`8a0ef203`](https://github.com/bpmn-io/diagram-js/commit/8a0ef203a4cf83054be3ace8eca6e1718160ac29))
- `FIX`: allow recursive `EventBus#once` invocations ([`2e7c4178`](https://github.com/bpmn-io/diagram-js/commit/2e7c4178fca25f4f03d1de086a65fb49548feec2))

## 7.1.0

- `TEST`: simplify markup created by built-in test helpers

## 7.0.0

- `FEAT`: support soft breaks in labels ([`e3927166`](https://github.com/bpmn-io/diagram-js/commit/e3927166d0125674a9e7e937c5a4cbf68d69c21a))
- `FEAT`: automatically activate tools with last mouse position when activated via keyboard or editor action ([#511](https://github.com/bpmn-io/diagram-js/pull/511))
- `FEAT`: immediately activate handtool on `SPACE` down ([#511](https://github.com/bpmn-io/diagram-js/pull/511))
- `FEAT`: allow components to react to auxiliary mouse events ([`1063f7c18`](https://github.com/bpmn-io/diagram-js/commit/1063f7c18474096d3d7c9e400ce82a1bf762a157))
- `FEAT`: move canvas on auxiliary button mouse down ([`138161d6`](https://github.com/bpmn-io/diagram-js/commit/138161d6908edb578317d0d988accee20fca0187))
- `CHORE`: make tool manager palette click detection fail-safe ([`5a1454e9`](https://github.com/bpmn-io/diagram-js/commit/5a1454e930484764122605b12268e5bafc1af675))

### Breaking Changes

- Auxiliary mouse button events will now be passed as `element.*` mouse events to components. You must filter your event listeners to prevent reactions to these events ([`1063f7c18`](https://github.com/bpmn-io/diagram-js/commit/1063f7c18474096d3d7c9e400ce82a1bf762a157)).

## 6.8.2

- `CHORE`: generalize hover fix ([#503](https://github.com/bpmn-io/diagram-js/pull/503))

## 6.8.1

- `FIX`: correct keyboard zoom in binding on international keyboard layouts ([#498](https://github.com/bpmn-io/diagram-js/pull/498))

## 6.8.0

- `FEAT`: support `Backspace` key for element removal
- `FEAT`: support `SHIFT` click for adding elements to selection
- `FEAT`: add `ElementRegistry#find` method

## 6.7.1

- `FIX`: touch handling for iOS devices ([#492](https://github.com/bpmn-io/diagram-js/pull/492))

## 6.7.0

- `FEAT`: align colors with Camunda Modeler ([#477](https://github.com/bpmn-io/diagram-js/pull/477))

## 6.6.1

- `FIX`: get connected distance based on weight in auto-place ([#464](https://github.com/bpmn-io/diagram-js/pull/464))

## 6.6.0

- `FEAT`: allow connecting with appended shape as source ([`d1b1fb8`](https://github.com/bpmn-io/diagram-js/commit/d1b1fb8056cc8914f90ba3c42b6b254830d0451c))
- `FEAT`: add auto-place feature ([#443](https://github.com/bpmn-io/diagram-js/pull/443))
- `FEAT`: allow to specify connection start and end for preview ([`7dfa896`](https://github.com/bpmn-io/diagram-js/pull/453/commits/7dfa896e73a0402aaf1129c2c3619f9ce285b250))
- `FEAT`: accept hints for bendpoint move preview ([`e2c9409`](https://github.com/bpmn-io/diagram-js/pull/453/commits/e2c94096fc4b13f81857f96740b185eca5107ca0))
- `FEAT`: accept layout hints on reconnect ([`2c30e10`](https://github.com/bpmn-io/diagram-js/pull/453/commits/2c30e1010691ae70e179b6d0e11f1a83e7a41a69))
- `FEAT`: enable top-down modeling ([#453](https://github.com/bpmn-io/diagram-js/pull/453))
- `FEAT`: use `keyCode` as fallback for keyboard key resolution ([#456](https://github.com/bpmn-io/diagram-js/pull/456), [#460](https://github.com/bpmn-io/diagram-js/pull/460))

## 6.5.0

- `FEAT`: on resize, keep attachments and connection docking intact if possible ([`e73bc8b`](e73bc8befdb05bd186b499d1e601b51f0f1c8963), [`ec80894`](ec80894dcaa55b12ca797006c70cca83544da06e))
- `FIX`: correctly handle waypoints if space tool affects only one of connected shapes ([`393ac63`](393ac6305f8a34d5ab971fd0328af30e3a1ddefd))
- `FIX`: select connect interaction target on connect ([#445](https://github.com/bpmn-io/diagram-js/issues/445))
- `CHORE`: provide context when getting minimum dimensions for space-tool ([#444](https://github.com/bpmn-io/diagram-js/pull/444))
- `CHORE`: bump dev dependencies ([`2eb50e5`](https://github.com/bpmn-io/diagram-js/commit/2eb50e5863e9fd3bec3f0cbed7861fb53845c289))

## 6.4.1

- `FIX`: do not interpret `0` as falsy value
- `CHORE`: bump `min-dom` version

## 6.4.0

- `FEAT`: do not execute additional modeling behaviors when making space
- `FIX`: copy `hidden` and `collapsed` properties ([#441](https://github.com/bpmn-io/diagram-js/pull/441))
- `FIX`: do not select hidden elements after create
- `FIX`: do not add preview for hidden elements
- `CHORE`: rewrite space tool

## 6.3.0

- `FEAT`: improve connection cropping
- `FEAT`: update incoming and outgoing connections on replace ([`ba5a5fb0`](https://github.com/bpmn-io/diagram-js/commit/ba5a5fb021a775147bcb1e02c93e105fe3cd47ce))
- `FIX`: prevent double layout on replace ([`c0db3b4da`](https://github.com/bpmn-io/diagram-js/commit/c0db3b4da89a08198225cfdd1d332fd487b1ac14))

## 6.2.2

- `FIX`: show line during make space again

## 6.2.1

_Republish of `v6.2.0`._

## 6.2.0

- `FIX`: correct a number of cropping issues
- `CHORE`: bump to [`path-intersection@2.1`](https://github.com/bpmn-io/path-intersection)

## 6.1.0

- `FEAT`: add horizontal / vertical resize handles ([#117](https://github.com/bpmn-io/diagram-js/issues/117))
- `FIX`: correctly mark elements as changed on `{shape|connection}.create` undo

## 6.0.2

- `FIX`: revert a change that would disallow re-attaching a connection to the same source / target ([`fd6f76f6`](https://github.com/bpmn-io/diagram-js/commit/fd6f76f66e8a37933b85e08c2f271688c54725f0))

## 6.0.1

_Republish of `v6.0.0`._

## 6.0.0

- `FEAT`: allow to remove _and_ update palette, context pad and popup menu entries from extensions ([#431](https://github.com/bpmn-io/diagram-js/pull/431))
- `FEAT`: allow multiple popup menu providers ([#431](https://github.com/bpmn-io/diagram-js/pull/431))
- `FEAT`: support element connections in reverse order ([#427](https://github.com/bpmn-io/diagram-js/pull/427))
- `FIX`: correctly unsubscribe popup menu close handler ([`46f78ea0e`](https://github.com/bpmn-io/diagram-js/commit/46f78ea0eb1e8c54d25174f984d318bf1b59cc20))
- `FIX`: allow event bus event to be passed as single argument to `EventBus#fire` ([`9633af767`](https://github.com/bpmn-io/diagram-js/commit/9633af767749c48c65c17cbd8acc50048abf4f43))
- `FIX`: pass hints when moving children on replace ([`cda3686c`](https://github.com/bpmn-io/diagram-js/commit/cda3686cacd0b52d8b881c69be5fe794301389aa))

### Breaking Changes

Connecting and re-connecting shapes got reworked via [#427](https://github.com/bpmn-io/diagram-js/pull/427):

- The rules `connection.reconnectStart` and `connection.reconnectEnd` got replaced with `connection.reconnect` rule
- The data passed to and propagated via `Connect` changed from `{ source, sourcePosition }` to `{ start, connectionStart }`
- `Modeling#reconnect` API is introduced for reconnecting both source and target
- `Layouter#layoutConnection` receives a waypoints hint that needs to be taken into account to preview reverse connections
- The commands `connection.reconnectStart` and `connection.reconnectEnd` got removed in favor of a `connection.reconnect` command

## 5.1.1

- `FIX`: re-select only existing elements when dragging is finished ([`401412d`](https://github.com/bpmn-io/diagram-js/commit/401412d8054bec277de54662663b0388f7a73365))
- `FIX`: correctly hide nested children of a collapsed shape ([`9cb6e9b`](https://github.com/bpmn-io/diagram-js/pull/421/commits/9cb6e9b65cdb0923864908fafb1251a6aec8f27f))

## 5.1.0

- `FEAT`: hide preview without hover ([`c52518d1`](https://github.com/bpmn-io/diagram-js/commit/c52518d1491ee541ef27f6c8aed4ded9ca48bf69))
- `FEAT`: be able to specify hints when copy pasting ([`09d13e9b`](https://github.com/bpmn-io/diagram-js/commit/09d13e9b9b467c601d21c0ab65ee683417807519))
- `FEAT`: allow attachment of shapes with labels on creation ([`a4ea3872`](https://github.com/bpmn-io/diagram-js/commit/a4ea387258e7d59c47ae6416468f36d1fd559d77))
- `FEAT`: allow detaching multiple shapes ([`e8b34195`](https://github.com/bpmn-io/diagram-js/commit/e8b34195bb50f1d126e49595ac9018685f9ffd6c))
- `FIX`: integrate rules for keyboard move selection ([`3a25679d`](https://github.com/bpmn-io/diagram-js/commit/3a25679d216aec1f8cd3b480d6b82c4796ff8839))
- `FIX`: return latest changed elements in <elements.changed> command ([`fd245921`](https://github.com/bpmn-io/diagram-js/commit/fd24592125b380599b1e399504d66b087808ce73))
- `FIX`: cancel create on <elements.changed> command ([`6ebd3a57`](https://github.com/bpmn-io/diagram-js/commit/6ebd3a571af1f1dccdb2a9d7d13fcd3941e4a702))

## 5.0.2

_Republish of `v5.0.1`._

## 5.0.1

- `FIX`: do no allow create if no hover available ([`679ef351`](https://github.com/bpmn-io/diagram-js/commit/679ef351ceb215de30230fea81983fc5f8b66ba0))
- `FIX`: relayout loops if necessary ([`3a63db0d`](https://github.com/bpmn-io/diagram-js/commit/3a63db0dded35167c55e0cf9d1f0a295c3d3216b))
- `FIX`: set create target on hover events ([`d31bd00b`](https://github.com/bpmn-io/diagram-js/commit/d31bd00b2a96bcae3de1f91c8733a038f37c2d88))
- `CHORE`: make it easier to override palette container ([`f765c81a`](https://github.com/bpmn-io/diagram-js/commit/f765c81a1d6d9e0983cb4b22a4de723b386df640))

## 5.0.0

- `FEAT`: add ability to create multiple elements ([`8d7d1d9c`](https://github.com/bpmn-io/diagram-js/pull/390/commits/8d7d1d9c69304ce8b99ed3de2f4d1ef1698c0958))
- `FEAT`: add `createElementsBehavior` hint to prevent behavior on creating elements ([`1ef5b3499`](https://github.com/bpmn-io/diagram-js/pull/390/commits/1ef5b3499858f1dc7a2fb5a7d9a5b2b8c474964b))
- `FEAT`: add ability to provide custom hit boxes ([#371](https://github.com/bpmn-io/diagram-js/pull/371))

### Breaking Changes

Copy and paste as well as create got completely reworked:

- `Create#start`: third argument is context, if you want to specify `source` do `{ source: source }`
- `CopyPaste`: `elements.copied`, `element.copy`, `elements.copy`, `element.paste`, `elements.paste` removed in favor of `copyPaste.canCopyElements`, `copyPaste.copyElement`, `copyPaste.elementsCopied`, `copyPaste.pasteElement`, `copyPaste.pasteElements`
- To prevent additional behavior on create after paste you should check for the `createElementsBehavior=false` hint
- `Modeling#pasteElements` removed in favor of `Modeling#createElements`
- `MouseTracking` removed in favor of `Mouse`

## 4.0.3

- `FIX`: compensate for missing `element.out` event ([#391](https://github.com/bpmn-io/diagram-js/pull/391))

## 4.0.2

- `FIX`: do not show connect feedback on bendpoint moving ([#382](https://github.com/bpmn-io/diagram-js/issues/382))
- `FIX`: correct graphics update regression ([#385](https://github.com/bpmn-io/diagram-js/pull/385)

## 4.0.1

- `FIX`: prevent unnecessary graphics updates ([`ff52b052`](https://github.com/bpmn-io/diagram-js/commit/ff52b05273068ba6c688eba4f3334eb4fd26a838))
- `FIX`: correct inverse space tool preview ([`94644d72`](https://github.com/bpmn-io/diagram-js/commit/94644d72085f3a4012c70f6e5ec08d7781e741ac))

## 4.0.0

- `FEAT`: add grid snapping ([#319](https://github.com/bpmn-io/diagram-js/pull/319))
- `FEAT`: add support for frame elements ([#321](https://github.com/bpmn-io/diagram-js/pull/321))
- `FEAT`: show connection markers in drag preview ([#328](https://github.com/bpmn-io/diagram-js/pull/328))
- `FEAT`: support connection previews ([#326](https://github.com/bpmn-io/diagram-js/pull/326))
- `FEAT`: do not move if no delta ([`c0c2b4f3`](https://github.com/bpmn-io/diagram-js/commit/c0c2b4f3851208eb5fee156a9d7afcbd25cc296e))
- `FEAT`: do not resize if bounds have not changed ([`e5cdb15a`](https://github.com/bpmn-io/diagram-js/commit/e5cdb15ad3a157bc8090f64f25c197a45adfd4be))
- `FEAT`: snap during resize ([#344](https://github.com/bpmn-io/diagram-js/pull/344))
- `FEAT`: activate hand tool on `SPACE` ([`e7217b95`](https://github.com/bpmn-io/diagram-js/commit/e7217b95c6ca2040dba09a9919eccc533862bc81))
- `FEAT`: allow parallel move on larger connection areas ([#350](https://github.com/bpmn-io/diagram-js/pull/350))
- `FEAT`: make hosts sticky for valid attachers ([#368](https://github.com/bpmn-io/diagram-js/pull/368))
- `FEAT`: improve dragger text styles ([#374](https://github.com/bpmn-io/diagram-js/pull/374))
- `FEAT`: allow custom snap implementations to snap an element top, right, bottom and left
- `CHORE`: add reusable escape util ([`0e520343`](https://github.com/bpmn-io/diagram-js/commit/0e520343a7ed100d9d9ab66884798742ff8732c0))
- `FIX`: prevent HTML injection in search component ([#362](https://github.com/bpmn-io/diagram-js/pull/362))

### Breaking Changes

- When displaying a connection preview, `Layouter` will receive connection without waypoints, source, target and with only `{ source, target }` hints. Make sure it handles such case ([#326](https://github.com/bpmn-io/diagram-js/pull/326)).

## 3.3.1

- `FIX`: prevent HTML injection in search component ([#362](https://github.com/bpmn-io/diagram-js/pull/362))

## 2.6.2

- `FIX`: prevent HTML injection in search component ([#362](https://github.com/bpmn-io/diagram-js/pull/362))

## 3.3.0

- `FEAT`: add basic grid snapping ([`f987bafe`](https://github.com/bpmn-io/diagram-js/commit/f987bafe215b75c9f47806bc8daaf16d2ba3a383))
- `FEAT`: layout connections on start/end reconnection ([`f7cc7a8f`](https://github.com/bpmn-io/diagram-js/commit/f7cc7a8f29c9842b3c2ba1f29d491767579d5267))
- `FIX`: use reference point when resizing ([`95bef2f6`](https://github.com/bpmn-io/diagram-js/commit/95bef2f6253a96ee20bb34384a071d0d28cfa29f))

## 3.2.0

- `FEAT`: trigger layout after connection reconnect ([#317](https://github.com/bpmn-io/diagram-js/pull/317))

## 3.1.3

- `FIX`: bump `tiny-svg` dependency to workaround MS Edge translate bug ([`657da2c3`](https://github.com/bpmn-io/diagram-js/commit/657da2c3f5540decf7bdf49029ecdbf1009c910c))

## 3.1.2

_Reverts changes in `v3.1.1`, as they were unnecessary._

## 3.1.1

- `FIX`: use correct reference argument for DOM related insert operations ([`47ca05ca`](https://github.com/bpmn-io/diagram-js/commit/47ca05ca075fb384748f8ff59a1295a7e2a99c28))

## 3.1.0

- `FIX`: don't swallow event listeners on `EventBus#only` ([#293](https://github.com/bpmn-io/diagram-js/issues/293))
- `CHORE`: rework `EventBus` internals, fixing various issues ([#308](https://github.com/bpmn-io/diagram-js/pull/308))

## 3.0.2

- `FIX`: make main export an ES module

## 3.0.1

- `FIX`: correct IE11 delete key binding ([`d529a676`](https://github.com/bpmn-io/diagram-js/commit/d529a6768470919abbd2567a8387955c9c8c5400))

## 3.0.0

- `FEAT`: make `ContextPad` accessible and scaling configurable ([#282](https://github.com/bpmn-io/diagram-js/pull/282))
- `FEAT`: make `PopupMenu` accessible and scaling configurable ([#284](https://github.com/bpmn-io/diagram-js/pull/284))
- `FEAT`: allow `Keyboard` listener overrides using priorities ([#226](https://github.com/bpmn-io/diagram-js/issues/226))
- `FEAT`: add ability to move selected elements with keyboard arrows ([`9e62bdd`](https://github.com/bpmn-io/diagram-js/commit/9e62bdd0823ee64ca6da2548cc10667b9a02dff0))
- `FEAT`: require `Ctrl/Cmd` modififer to move canvas via keyboard arrows ([`571efb9`](https://github.com/bpmn-io/diagram-js/commit/571efb914466ce00f357e308ba6238def1c7d8b6))
- `FEAT`: make `KeyboardMove` and `KeyboardMoveSelection` speed configurable
- `FEAT`: speed up moving elements / canvas using keyboard errors if `SHIFT` modifier is pressed
- `FEAT`: add `editorAction.init` event to register editor actions ([`a9089ad`](https://github.com/bpmn-io/diagram-js/commit/a9089ade487ff4185ece6fd8c68856b103345b3b))
- `FEAT`: only bind `Keyboard` shortcuts for existing editor actions ([`aa308fd`](https://github.com/bpmn-io/diagram-js/commit/aa308fd46f4b7958999bf44ca8bb3ab347723990))
- `FEAT`: rely on rules during `GlobalConnect` start ([`1efb277`](https://github.com/bpmn-io/diagram-js/commit/1efb277536fa7ec8be574746326c15cb1bfa507a))
- `FEAT`: expose `KeyboardEvent` to keyboard listeners instead of `(keyCode, event)` ([`94b5e26`](https://github.com/bpmn-io/diagram-js/commit/94b5e262d0db3ef3a8f250e3d39196cc6303a5cb))
- `FEAT`: automatically resize parent elements when children are expanded or replaced ([#287](https://github.com/bpmn-io/diagram-js/issues/287))
- `CHORE`: drop implicit feature dependencies in `EditorActions` ([`a9089ad`](https://github.com/bpmn-io/diagram-js/commit/a9089ade487ff4185ece6fd8c68856b103345b3b))

### Breaking Changes

- `GlobalConnect#registerProvider` got removed without replacement. Implement a `connection.start` rule to control whether it is allowed to start connection with `GlobalConnect` ([`1efb277`](https://github.com/bpmn-io/diagram-js/commit/1efb277536fa7ec8be574746326c15cb1bfa507a))
- The `Keyboard` now passes the `KeyboardEvent` to listeners as the only argument rather than `(keyCode, event)` ([`94b5e26`](https://github.com/bpmn-io/diagram-js/commit/94b5e262d0db3ef3a8f250e3d39196cc6303a5cb))
- Removed the `listeners` property from `Keyboard` lifecycle events ([`4d72e38`](https://github.com/bpmn-io/diagram-js/commit/4d72e386e2b734edc0fb2d77907b0e3ab6efead6))
- Moving the canvas via arrow keys now requires `Ctrl/Cmd` modifiers to be pressed; without the modifiers selected elements will be moved, if the `KeyboardMoveSelection` feature is provided ([`571efb9`](https://github.com/bpmn-io/diagram-js/commit/571efb914466ce00f357e308ba6238def1c7d8b6))
- `EditorActions` does not implicitly pull in feature dependencies anymore, ensure you include all desired features with your editor ([`a9089ad`](https://github.com/bpmn-io/diagram-js/commit/a9089ade487ff4185ece6fd8c68856b103345b3b))

## 2.6.1

- `FIX`: ignore vertical padding when layouting text with `middle` alignment

## 2.6.0

- `CHORE`: normalize drag coordinates to full pixel coordinates ([#271](https://github.com/bpmn-io/diagram-js/issues/271))

## 2.5.1

- `FIX`: circumvent IE 9 viewer bug ([`e1f3c65c`](https://github.com/bpmn-io/diagram-js/commit/e1f3c65cb413601427615d0e292ce291dcaea9de))

## 2.5.0

- `FEAT`: extend manhattan layout helper to support explicit `trbl` direction and layout U-turns, if needed ([`fd4c6028`](https://github.com/bpmn-io/diagram-js/commit/fd4c6028921f67bc73a840f0b19ad59c356a5dae))

## 2.4.1

- `FIX`: ensure all labels / attachers are moved before triggering connection layout
- `CHORE`: move attachers / labels along with move closure ([`16882649`](https://github.com/bpmn-io/diagram-js/commit/1688264959d272fb26d13214439d491c09a01f44))

## 2.4.0

- `FEAT`: add ability to remove multiple events via `EventBus#off`

## 2.3.0

- `FEAT`: hide palette toggle in expanded state (a none-feature, technically) ([#257](https://github.com/bpmn-io/diagram-js/issues/257))
- `FIX`: take top/bottom padding into account when rendering text ([#259](https://github.com/bpmn-io/diagram-js/issues/259))
- `FIX`: don't throw error on out-of-canvas lasso tool release

## 2.2.0

- `FEAT`: support `lineHeight` in text render util ([#256](https://github.com/bpmn-io/diagram-js/pull/256))

## 2.1.1

- `FIX`: correct code snippet to ES5

## 2.1.0

- `FEAT`: add support for multiple labels ([#202](https://github.com/bpmn-io/diagram-js/issues/202))
- `FEAT`: allow multiple classes to be passed to popup menu entries

## 2.0.0

- `FEAT`: refactor popup menu to allow multiple providers and simplify API ([`b1852e1d`](https://github.com/bpmn-io/diagram-js/pull/254/commits/b1852e1d71f67bd36ae1eb02748d2d0cbf124625))

### Breaking Changes

- The `PopupMenu` API got rewritten, cf. [`b1852e1d`](https://github.com/bpmn-io/diagram-js/pull/254/commits/b1852e1d71f67bd36ae1eb02748d2d0cbf124625)

## 1.5.0

_This release accidently introduced backwards incompatible changes. Unpublished; Use `v2.0.0` instead._

## 1.4.0

- `CHORE`: bump object-refs version

## 1.3.1

- `FIX`: correct side-effects config to not include `*.css` files

## 1.3.0

- `FEAT`: emit popup menu life-cycle events
- `FIX`: prevent default click action on dragend, if `trapClick: true` is specified

## 1.2.1

- `FIX`: escape ids in CSS selectors

## 1.2.0

- `DOCS`: migrate example to ES modules

## 1.1.0

- `CHORE`: update utility toolbelt

## 1.0.0

- `CHORE`: convert code base to ES modules ([`e26b034`](https://github.com/bpmn-io/diagram-js/commit/e26b034bb6d60a8e0e3a9669d111124cb189a9b3))

### Breaking Changes

- You must now configure a module transpiler such as Babel or Webpack to handle ES module imports and exports.

## 0.31.0

- `FEAT`: remove `EventBus.Event` in favor of `EventBus#createEvent` API ([`91899cf6`](https://github.com/bpmn-io/diagram-js/commit/91899cf6d2e9100c712aa191cf0d3829335cfeb3))

### Breaking Changes

- Use `EventBus#createEvent` to instantiate events

## 0.30.0

- `CHORE`: bump [tiny-svg](https://github.com/bpmn-io/tiny-svg) version

## ...

Check `git log` for earlier history.
